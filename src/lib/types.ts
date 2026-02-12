export interface Message {
  author: User;
  created_at: number;
  recipient: User;
}

export interface Note {
  created_at: number;
  seen: number;
}

export interface User {
  id: string;
}

export interface Invoice {
  aid: string;
  id?: string;
  memoPrompt?: boolean;
  memo?: string;
  rate: number;
  type?: string;
}
