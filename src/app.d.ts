/// <reference types="@sveltejs/kit" />

declare const grecaptcha: {
  ready(callback: () => void): void;
  execute(siteKey: string, options: { action: string }): Promise<string>;
};

declare class NDEFReader {
  constructor();
  scan(): Promise<void>;
  write(data: any): Promise<void>;
  addEventListener(type: string, listener: (event: any) => void): void;
  removeEventListener(type: string, listener: (event: any) => void): void;
}

interface Window {
  nostr?: {
    getPublicKey(): Promise<string>;
    signEvent(event: any): Promise<any>;
    nip04?: {
      encrypt(pubkey: string, plaintext: string): Promise<string>;
      decrypt(pubkey: string, ciphertext: string): Promise<string>;
    };
  };
  maplibregl?: any;
  AndroidNotch?: {
    getInsetTop(success: (px: number) => void, error: (err: any) => void): void;
    getInsetBottom(success: (px: number) => void, error: (err: any) => void): void;
    getInsetRight(success: (px: number) => void, error: (err: any) => void): void;
    getInsetLeft(success: (px: number) => void, error: (err: any) => void): void;
  };
}
