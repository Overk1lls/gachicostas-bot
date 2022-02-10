import { Client, ClientOptions, TextChannel } from "discord.js";
import { REPLY_ANSWERS, REPLY_OR_ANSWERS, WHO_IS_ANSWERS } from "./lib/config";
import { consoleLog } from "./lib/utils";

export default class DiscordService {
    private _client: Client;

    constructor(token: string, options: ClientOptions) {
        this._client = new Client(options);
        this.start(token);
        this.messageHandler();
    }

    private start = async (token: string) => {
        await this._client
            .login(token)
            .then(() => consoleLog(this._client.user.username + ' is ready'));
    };

    private messageHandler = () => {
        this._client.on('messageCreate', async message => {
            if (message.author.bot) return;

            const msgChannel = message.channel;
            if (msgChannel.type === 'GUILD_TEXT' && msgChannel instanceof TextChannel) {
                const botName = this._client.user.username;
                const msg = message.content;

                // упоминание бота с тагом или без
                if (message.mentions.users.has(this._client.user.id) || msg.match(/Гачикостас/i)) {
                    // вопрос боту
                    if (msg.split('').pop() === '?') {
                        const msgChunk = msg.split(' ');
                        const orQuestion = msgChunk.filter(word => word.match(/или/i))[0];
                        const whoIsQuestion = msg.includes('кто на сервере') || msg.includes('КТО НА СЕРВЕРЕ');

                        // если в вопросе присутствует "или"
                        // иначе другой ответ
                        if (orQuestion && !whoIsQuestion) {
                            const rollDice = Math.floor(Math.random() + 1 * 100);
                            const chunks = msg.split('?')[0].split(/или/i);
                            const rollChunk = Math.floor(Math.random() * 2);
                            // 75% на выбор одного из вариантов вопроса или
                            // 25% на рандомную фразу из списка
                            if (rollDice <= 75) {
                                this.replyToChannel(chunks[rollChunk], msgChannel);
                            } else {
                                const rollPhrase = Math.floor(Math.random() * REPLY_OR_ANSWERS.length);
                                if (rollPhrase < 4) {
                                    this.replyToChannel(
                                        REPLY_OR_ANSWERS[rollPhrase] + chunks[rollChunk],
                                        msgChannel
                                    );
                                } else {
                                    this.replyToChannel(REPLY_OR_ANSWERS[rollPhrase], msgChannel);
                                }
                            }
                        } else {
                            const answerId = Math.floor(Math.random() * REPLY_ANSWERS.length);
                            this.replyToChannel(REPLY_ANSWERS[answerId], msgChannel);
                        }
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