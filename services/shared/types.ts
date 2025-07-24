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
