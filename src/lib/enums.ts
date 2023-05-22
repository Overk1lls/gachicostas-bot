export enum Response {
  NoQuestion = 'Я отвечаю только на вопросы',
}

export enum MessageQueueProcessName {
  Command = 'command',
  OrQuestion = 'question:or',
  WhoQuestion = 'question:who',
  RandomQuestion = 'question:random',
  TagMessage = 'message:tag',
}
