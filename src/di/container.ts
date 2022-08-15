import { ClientOptions, Intents } from 'discord.js';
import { config } from '../lib/config';
import { DiscordService } from '../services/discord.service';

export interface Dependencies {
  discordService: DiscordService;
}

export class DIContainer {
  static createDependencies(): Dependencies {
    const { discordBotToken } = config;

    const discordServiceOptions: ClientOptions = {
      intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MEMBERS],
    };
    const discordService = new DiscordService(discordBotToken, discordServiceOptions);
    discordService.init();

    return { discordService };
  }
}
