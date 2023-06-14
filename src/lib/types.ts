import { User } from 'discord.js';

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

export interface WhoQuestionJobType {
  channelId: string;
  chosen: User;
}

export interface RandomMessageJobType {
  channelId: string;
  isMentioned?: boolean;
  message?: string;
  botUsername?: string;
}

export type MessageQueueType =
  | DhCommandJobType
  | OrQuestionJobType
  | RandomMessageJobType
  | WhoQuestionJobType;
