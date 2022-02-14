import { Client, ClientOptions, MessageEmbed, MessageOptions, TextChannel } from "discord.js";
import { COVENANTS, DH_QUESTIONS, LEGENDARIES, STAT_WEIGHTS, TAG, WHO_IS } from "./lib/regexps";
import { consoleLog, isDhQuestion, isMatching, isTestPassed, randomNum } from "./lib/utils";
import {
    ATTACHMENTS,
    BOT_TAG_ANSWERS,
    DISCORD_TAG,
    ERRORS,
    FILTHY_LANG,
    FILTHY_LANG_ANSWERS,
    REPLY_ANSWERS,
    REPLY_OR_ANSWERS,
    RESPONSES,
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

                if (isDhQuestion(DH_QUESTIONS, msg)) {
                    if (isTestPassed(STAT_WEIGHTS, msg)) {
                        this.replyToChannel(RESPONSES.STAT_WEIGHTS, msgChannel);
                    } else if (isTestPassed(LEGENDARIES, msg)) {
                        this.replyToChannel(RESPONSES.LEGENDARIES, msgChannel);
                    } else if (isTestPassed(COVENANTS, msg)) {
                        let embed = new MessageEmbed()
                            .setTitle('Какой ковенант лучше?')
                            .addFields(RESPONSES.COVENANTS)
                            .setImage(ATTACHMENTS.COVENANTS);

                        this.replyToChannel(null, msgChannel, { embeds: [embed] });
                    }
                } else if (isMentioned || isMatching(msg, this._usernameRegExp)) {
                    if (msg.split('').pop() === '?') {
                        const orQuestion = msgChunks.filter(word => isMatching(word, /или/i))[0];
                        const isWhoIsQuestion = isTestPassed(WHO_IS, msg);

                        if (orQuestion && !isWhoIsQuestion) {
                            const rollDice = randomNum(1, 100);
                            const questions = msg.split('?')[0].split(/или/i);
                            const rollQuestions = randomNum(0, 2);
                            if (rollDice <= 75) {
                                const answer = questions[rollQuestions]
                                    .split(' ')
                                    .filter(chunk => !chunk.match(TAG)).join(' ');
                                this.replyToChannel(answer, msgChannel);
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
                        const filthyRegex = new RegExp(FILTHY_LANG.join('|'), 'i');
                        if (isTestPassed(filthyRegex, msg)) {
                            FILTHY_LANG.map(filth => {
                                let noMentionRegex = new RegExp(`${this._username} ${filth}`, 'i');
                                let mentionRegex = new RegExp(`${DISCORD_TAG} ${filth}`, 'i');
                                if ((isMentioned && isTestPassed(mentionRegex, msg)) ||
                                    (!isMentioned && isTestPassed(noMentionRegex, msg))
                                ) {
                                    let rollPhrase = randomNum(0, FILTHY_LANG_ANSWERS.length);
                                    this.replyToChannel(FILTHY_LANG_ANSWERS[rollPhrase], msgChannel);
                                }
                            });
                        } else if (isMentioned) {
                            const rollAnswer = randomNum(0, BOT_TAG_ANSWERS.length);
                            this.replyToChannel(BOT_TAG_ANSWERS[rollAnswer], msgChannel);
                        } else {
                            this.replyToChannel(RESPONSES.NO_QUESTION, msgChannel);
                        }
                    }
                }
            }
        });
    };

    private replyToChannel = async (message: string, channel: TextChannel, options?: MessageOptions) => {
        const permissions = channel.guild.me.permissionsIn(channel);
        if (!permissions.has('SEND_MESSAGES')) {
            consoleLog(ERRORS.NO_PERMISSION);
            return;
        }

        const channelId = channel.id;
        const responseChannel = this._client.channels.cache.get(channelId);
        try {
            await (<TextChannel>responseChannel).send(options ? options : message);
        } catch (error) {
            console.error(error);
        }
        consoleLog('ANSWERED: ' + message);
    };
};