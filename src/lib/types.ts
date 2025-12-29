export interface NewCredential {
  title: string;
  username?: string;
  password?: string;
  category?: string;
  totpSecret?: string;
}

export interface Credential extends NewCredential {
  id: string;
}
