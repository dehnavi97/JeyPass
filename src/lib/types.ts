export interface Workspace {
  id: string;
  name: string;
  isDefault?: boolean;
  color?: string; // e.g., 'blue', 'purple', 'emerald', 'amber', 'rose', 'indigo'
  createdAt?: number;
}

export interface NewCredential {
  title: string;
  username?: string;
  password?: string;
  category?: string;
  totpSecret?: string;
  workspaceId?: string;
}

export interface Credential extends NewCredential {
  id: string;
}
