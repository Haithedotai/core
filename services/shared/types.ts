export type MinimalPersistentStorage = {
  setItem: (key: string, value: any) => void;
  getItem: (key: string) => any;
  removeItem: (key: string) => void;
};

export interface Organization {
  id: number;
  organization_uid: string;
  name: string;
  owner: string;
  created_at: string;
  address: `0x${string}`;
  orchestrator_idx: number;
}

export interface OrganizationMember {
  org_id: number;
  wallet_address: string;
  role: string;
  created_at: string;
}

export interface Project {
  id: number;
  project_uid: string;
  org_id: number;
  name: string;
  created_at: string;
  search_enabled: boolean;
  memory_enabled: boolean;
}

export interface ProjectMember {
  project_id: number;
  wallet_address: string;
  role: string;
}

export interface UserProfile {
  address: string;
  registered: Date;
}

export interface Creator {
  wallet_address: string;
  uri: string;
  pub_key: string;
  created_at: string;
}

export interface Creator {
  wallet_address: string;
  uri: string;
  pub_key: string;
  created_at: string;
}

export interface CreatorDetails {
  wallet_address: string;
  uri: string;
  created_at: string;
}

export interface Product {
  id: number;
  address: string;
  creator: string;
  name: string;
  price_per_call: number;
  category: string;
  created_at: string;
}

export interface Conversation {
  id: number;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: number;
  message: string;
  sender: string;
  created_at: string;
}
