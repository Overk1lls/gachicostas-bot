import {
    Client,
    ClientOptions,
    MessageEmbed,
    MessageOptions,
    TextChannel,
    ThreadChannel
} from "discord.js";
import {
    COVENANTS,
    DH_QUESTIONS,
    LEGENDARIES,
    OR_QUESTION,
    STAT_WEIGHTS,
    DISCORD_TAG_REGEXP,
    WHO_IS
} from './lib/regexps';
import {
    consoleLog,
    isOneRegexInText,
    isMatching,
    isRegexInText,
    randomNum
} from './lib/utils';
import {
    ATTACHMENTS,
    BOT_TAG_ANSWERS,
    COVENANTS_ANSWER_TITLE,
    DISCORD_TAG_STR,
    ERRORS,
    FILTHY_LANG,
    FILTHY_LANG_ANSWERS,
    REPLY_ANSWERS,
    REPLY_OR_ANSWERS,
    RESPONSES,
    WHO_IS_ANSWERS
} from './lib/config';

export default class DiscordService {
    private _token: string;
    private _client: Client;
    private _username: string;
    private _usernameRegExp: RegExp;

    constructor(token: string, options: ClientOptions) {
        this._token = token;
        this._client = new Client(options);
    }

    start = async () => {
        await this._client
            .login(this._token)
            .then(() => {
                this._username = this._client.user.username;
                consoleLog(this._username + ' is ready');
            });
        this._usernameRegExp = new RegExp(this._username, 'i');
        this.messageHandler();
    };

    private messageHandler = () => {
        this._client.on('messageCreate', async message => {
            if (message.author.bot) return;

            const msgChannel = message.channel;

            if (msgChannel instanceof TextChannel || msgChannel instanceof ThreadChannel) {
                const msg = message.content;
                const msgChunks = msg.split(' ');
                const isMentioned = message.mentions.users.has(this._client.user.id);

                // если вопрос про дх
                if (isOneRegexInText(DH_QUESTIONS, msg)) {
                    // если вопрос про веса статов
                    if (isRegexInText(STAT_WEIGHTS, msg)) {
                        this.replyToChannel(RESPONSES.STAT_WEIGHTS, msgChannel);
                    }
                    // если вопрос про легендарки
                    else if (isRegexInText(LEGENDARIES, msg)) {
                        this.replyToChannel(RESPONSES.LEGENDARIES, msgChannel);
                    }
                    // если вопрос про ковенанты
                    else if (isRegexInText(COVENANTS, msg)) {
                        const embed = new MessageEmbed()
                            .setTitle(COVENANTS_ANSWER_TITLE)
                            .addFields(RESPONSES.COVENANTS)
                            .setImage(ATTACHMENTS.COVENANTS);

                        this.replyToChannel(null, msgChannel, { embeds: [embed] });
                    }
                }
                // если тагнули бота (таг или просто имя)
                else if (isMentioned || isMatching(msg, this._usernameRegExp)) {
                    // если упомянули с вопросом
                    if (msg.split('').pop() === '?') {
                        const orQuestion = msgChunks.filter(word => isMatching(word, OR_QUESTION))[0];
                        const isWhoIsQuestion = isRegexInText(WHO_IS, msg);

                        // если "или" вопрос, рандомим 75% и 25%
                        if (orQuestion && !isWhoIsQuestion) {
                            const rollDice = randomNum(0, 100);
                            const questions = msg.split('?')[0].split(OR_QUESTION);
                            const rollQuestions = randomNum(0, 2);
                            // если 75%, то отправляем одно из двух вопросов
                            if (rollDice < 75) {
                                const answer = questions[rollQuestions]
                                    .split(' ')
                                    .filter(question => !question.match(DISCORD_TAG_REGEXP)).join(' ');
                                this.replyToChannel(answer, msgChannel);
                            }
                            // если 25%, то отвечаем одним из заранее заготовленных ответов
                            else {
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
                        }
                        // если был задан "кто на сервере" вопрос
                        else if (isWhoIsQuestion) {
                            const rollAnswer = randomNum(0, WHO_IS_ANSWERS.length);
                            const rollUsers = randomNum(0, message.guild.memberCount);
                            const guildUsers = await message.guild.members.fetch({ force: true });
                            const guildUser = guildUsers.at(rollUsers).user;
                            this.replyToChannel(
                                rollAnswer < 3 ?
                                    `${WHO_IS_ANSWERS[rollAnswer]} ${guildUser.username}#${guildUser.discriminator}` :
                                    WHO_IS_ANSWERS[rollAnswer],
                                msgChannel
                            );
                        }
                        // если просто вопрос
                        else {
                            const rollAnswer = randomNum(0, REPLY_ANSWERS.length);
                            this.replyToChannel(REPLY_ANSWERS[rollAnswer], msgChannel);
                        }
                    }
                    // если таг без знака вопроса
                    else {
                        // если оскорбили бота
                        const filthyRegex = new RegExp(FILTHY_LANG.join('|'), 'i');
                        if (isRegexInText(filthyRegex, msg)) {
                            FILTHY_LANG.map(filth => {
                                const noMentionRegex = new RegExp(`${this._username} ${filth}`, 'i');
                                const mentionRegex = new RegExp(`${DISCORD_TAG_STR} ${filth}`, 'i');
                                if ((isMentioned && isRegexInText(mentionRegex, msg)) ||
                                    (!isMentioned && isRegexInText(noMentionRegex, msg))
                                ) {
                                    const rollPhrase = randomNum(0, FILTHY_LANG_ANSWERS.length);
                                    this.replyToChannel(FILTHY_LANG_ANSWERS[rollPhrase], msgChannel);
                                }
                            });
                        }
                        // если просто тагнули
                        else if (isMentioned) {
                            const rollAnswer = randomNum(0, BOT_TAG_ANSWERS.length);
                            this.replyToChannel(BOT_TAG_ANSWERS[rollAnswer], msgChannel);
                        }
                        // если таг, но ничего из выше перечисленного
                        else {
                            this.replyToChannel(RESPONSES.NO_QUESTION, msgChannel);
                        }
                    }
                }
            }
        });
    };

    private replyToChannel = async (message: string, channel: TextChannel | ThreadChannel, options?: MessageOptions) => {
        const permissions = channel.guild.me.permissionsIn(channel);
        if (!permissions.has('SEND_MESSAGES')) {
            consoleLog(ERRORS.NO_PERMISSION);
            return;
        }

        const channelId = channel.id;
        const responseChannel = this._client.channels.cache.get(channelId);
        try {
            await (<TextChannel | ThreadChannel>responseChannel).send(options ? options : message);
        } catch (error) {
            console.error(error);
        }
        consoleLog('ANSWERED: ' + message);
    };
};