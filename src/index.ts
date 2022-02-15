import { config } from "dotenv";
import { ClientOptions, Intents } from 'discord.js';
import DiscordService from "./discord.service";

config();

const { DISCORD_BOT_TOKEN } = process.env;

const discordServiceOptions: ClientOptions = {
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MEMBERS,
    ],
};
const discordService = new DiscordService(DISCORD_BOT_TOKEN, discordServiceOptions);

discordService.start();