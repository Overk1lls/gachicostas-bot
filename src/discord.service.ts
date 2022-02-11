import { Client, ClientOptions, TextChannel } from "discord.js";
import { WHO_IS } from "./lib/regexps";
import { consoleLog, isMatching, isTestPassed, randomNum } from "./lib/utils";
import {
    FILTHY_LANG,
    FILTHY_LANG_ANSWERS,
    REPLY_ANSWERS,
    REPLY_OR_ANSWERS,
    WHO_IS_ANSWERS
} from "./lib/config";

export default class DiscordService {
    private _client: Client;
    private _username: string;
    private _usernameRegExp: RegExp;

    constructor(token: string, options: ClientOptions) {
        this._client = new Client(options);
        this.start(token);
        this.messageHandler();
    }

    private start = async (token: string) => {
        await this._client
            .login(token)
            .then(() => {
                this._username = this._client.user.username;
                consoleLog(this._username + ' is ready');
            });
        this._usernameRegExp = new RegExp(this._username, 'i');
    };

    private messageHandler = () => {
        this._client.on('messageCreate', async message => {
            if (message.author.bot) return;

            const msgChannel = message.channel;

            if (msgChannel.type === 'GUILD_TEXT' && msgChannel instanceof TextChannel) {
                const msg = message.content;
                const msgChunks = msg.split(' ');
                const isMentioned = message.mentions.users.has(this._client.user.id);

                if (isMentioned || isMatching(msg, this._usernameRegExp)) {
                    if (msg.split('').pop() === '?') {
                        const orQuestion = msgChunks.filter(word => isMatching(word, /или/i));
                        const isWhoIsQuestion = isTestPassed(WHO_IS, msg);

                        if (orQuestion && !isWhoIsQuestion) {
                            const rollDice = randomNum(1, 100);
                            const questions = msg.split('?')[0].split(/или/i);
                            const rollQuestions = randomNum(0, 2);
                            if (rollDice <= 75) {
                                this.replyToChannel(questions[rollQuestions], msgChannel);
                            } else {
                                const rollPhrase = randomNum(0, REPLY_OR_ANSWERS.length);
                                if (rollPhrase < 4) {
                                    this.replyToChannel(
                                        REPLY_OR_ANSWERS[rollPhrase] + questions[rollQuestions],
                                        msgChannel
                                    );
                                } else {
                                    this.replyToChannel(REPLY_OR_ANSWERS[rollPhrase], msgChannel);
                                }
                            }
                        } else if (isWhoIsQuestion) {
                            const rollAnswer = randomNum(0, WHO_IS_ANSWERS.length);
                            const rollUsers = randomNum(0, message.guild.memberCount);
                            const users = await message.guild.members.fetch({ force: true });
                            const user = users.at(rollUsers).user;
                            if (rollAnswer < WHO_IS_ANSWERS.length - 3) {
                                this.replyToChannel(
                                    WHO_IS_ANSWERS[rollAnswer] + ` ${user.username}#${user.discriminator}`,
                                    msgChannel
                                );
                            } else {
                                this.replyToChannel(WHO_IS_ANSWERS[rollAnswer], msgChannel);
                            }
                        } else {
                            const rollAnswer = randomNum(0, REPLY_ANSWERS.length);
                            this.replyToChannel(REPLY_ANSWERS[rollAnswer], msgChannel);
                        }
                    } else {
                        FILTHY_LANG.map(filth => {
                            let noMentionRegex = new RegExp(`${this._username} ${filth}`, 'i');
                            let mentionRegex = new RegExp(`(<@!\\d{8,}>) ${filth}`, 'i');
                            if ((isMentioned && isTestPassed(mentionRegex, msg)) ||
                                (!isMentioned && isTestPassed(noMentionRegex, msg))
                            ) {
                                let rollPhrase = randomNum(0, FILTHY_LANG_ANSWERS.length);
                                return this.replyToChannel(FILTHY_LANG_ANSWERS[rollPhrase], msgChannel);
                            }
                        });
                    }
                }
            }
        });
    };

    private replyToChannel = (message: string, channel: TextChannel) => {
        const channelId = channel.id;
        const responseChannel = this._client.channels.cache.get(channelId);

        (<TextChannel>responseChannel).send(message);
        consoleLog('ANSWERED: ' + message);
    };
};