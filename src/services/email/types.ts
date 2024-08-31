export interface SendConfig {
  address: {
    from: string;
    to: string;
  };
  subject: string;
  body: string;
}

export interface EmailProvider {
  send: (config: SendConfig) => Promise<void>;
}
