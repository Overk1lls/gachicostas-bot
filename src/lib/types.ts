import { Message } from 'discord.js';

export type Nullable<T> = T | null;
export type Primitive = number | string | boolean | symbol | bigint;

export interface DhCommandJobType {
  channelId: string;
  command: string;
}

export interface OrQuestionJobType {
  channelId: string;
  question: string;
  botRegexString: string;
}

export interface ICommand {
  command: string;
  channel: Message['channel'];
}

export interface IQuestion {
  channel: Message['channel'];
  question?: string;
  botRegex?: RegExp;
  message?: Message;
}

export interface IMessage {
  channel: Message['channel'];
  message?: string;
  botUsername?: string;
  isMentioned?: boolean;
}

export type MessageQueueType = ICommand | IQuestion | IMessage;
