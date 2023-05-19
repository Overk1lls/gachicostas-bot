import { Message, TextBasedChannel } from 'discord.js';

export type Nullable<T> = T | null;
export type Primitive = number | string | boolean | symbol | bigint;

export interface AsyncInitializable {
  init(): Promise<void>;
}

export interface Disposable {
  dispose(): Promise<void>;
}

export type NonNewsChannel = Exclude<TextBasedChannel, 'NewsChannel' | 'VoiceChannel'>;

export const isMessageChannel = (channel: any): channel is NonNewsChannel => {
  return (
    typeof channel !== 'string' &&
    'type' in channel &&
    channel.type !== 'GUILD_NEWS' &&
    channel.type !== 'GUILD_VOICE' &&
    channel.type !== 'GUILD_NEWS_THREAD'
  );
};

export interface ICommand {
  command: string;
  channel: NonNewsChannel;
}

export interface IQuestion {
  channel: NonNewsChannel;
  question?: string;
  botRegex?: RegExp;
  message?: Message;
}

export interface IMessage {
  channel: NonNewsChannel;
  message?: string;
  botUsername?: string;
  isMentioned?: boolean;
}

export type MessageQueueType = ICommand | IQuestion | IMessage;
