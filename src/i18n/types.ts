import type zh from './zh';

export type Locale = 'zh' | 'ja' | 'en';
export type MessageKey = keyof typeof zh;
export type Messages = Record<MessageKey, string>;
export type TFn = (key: MessageKey, vars?: Record<string, string | number>) => string;
