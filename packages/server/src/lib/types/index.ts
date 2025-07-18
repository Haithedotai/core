export type VerificationStatus = 'unverified' | 'pending' | 'verified';
export type ItemType = 'knowledge_base' | 'tool' | 'mcp' | 'prompt_set';
export type ItemStatus = 'draft' | 'active' | 'inactive' | 'archived';
export type ValidationStatus = 'unvalidated' | 'pending' | 'certified' | 'rejected';
export type ProjectStatus = 'active' | 'development' | 'paused' | 'archived';
export type ProjectType = 'workflow' | 'model' | 'experiment';
export type ProjectPrivacy = 'public' | 'private' | 'organization';
export type PurchaseStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type ValidationStatusType = 'pending' | 'in_progress' | 'certified' | 'rejected';
export type ValidationType = 'basic_review' | 'full_audit' | 'protocol_audit' | 'security_audit';
export type MemberRole = 'owner' | 'admin' | 'member';

export interface User {
  id: string;
  wallet_address: string;
  name: string | null;
  email: string | null;
  avatar_url: string | null;
  bio: string | null;
  reputation_score: number;
  verification_status: VerificationStatus;
  onboarded: boolean;
  created_at: string;
  updated_at: string;
  profile: {
    company?: string;
    location?: string;
    website?: string;
    social_links?: {
      twitter?: string;
      github?: string;
      linkedin?: string;
    };
  };
}

export interface Organization {
  id: string;
  name: string;
  description: string | null;
  owner_id: string;
  avatar_url: string | null;
  website: string | null;
  verification_status: VerificationStatus;
  created_at: string;
  updated_at: string;
}

export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: MemberRole;
  joined_at: string;
}

export interface MarketplaceItem {
  id: string;
  name: string;
  description: string;
  slug: string;
  type: ItemType;
  provider_id: string; // user who created it
  organization_id: string;
  price: number;
  currency: string;
  status: ItemStatus;
  validation_status: ValidationStatus;
  validator_id: string | null;
  validation_date: string | null;
  downloads: number;
  rating: number;
  reviews_count: number;
  tags: string[];
  categories: string[];
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Purchase {
  id: string;
  buyer_id: string;
  buyer_organization_id: string;
  item_id: string;
  amount: number;
  currency: string;
  status: PurchaseStatus;
  transaction_hash: string | null;
  purchased_at: string;
}

export interface Validation {
  id: string;
  item_id: string;
  validator_id: string;
  status: ValidationStatusType;
  validation_type: ValidationType;
  criteria: string[];
  score: number;
  report: string;
  completed_at: string | null;
  created_at: string;
}

export interface ProjectComponent {
  id: string;
  name: string;
  type: ItemType | 'custom';
  marketplace_item_id?: string; // if purchased from marketplace
  configuration: Record<string, any>;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  user_id: string;
  organization_id: string;
  project_type: ProjectType;
  status: ProjectStatus;
  privacy: ProjectPrivacy;
  components: ProjectComponent[];
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  item_id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

// API Response Types
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

// Filter Types
export interface MarketplaceFilters {
  search?: string;
  type?: ItemType[];
  categories?: string[];
  validation_status?: ValidationStatus[];
  price_min?: number;
  price_max?: number;
  sort_by?: 'name' | 'price' | 'rating' | 'downloads' | 'created_at';
  sort_order?: 'asc' | 'desc';
}

export interface ProjectFilters {
  search?: string;
  project_type?: ProjectType[];
  status?: ProjectStatus[];
  privacy?: ProjectPrivacy[];
  sort_by?: 'name' | 'created_at' | 'updated_at';
  sort_order?: 'asc' | 'desc';
}

export interface DashboardStats {
  // General stats for any user
  total_items?: number;
  total_projects?: number;
  total_purchases?: number;
  total_sales?: number;
  total_revenue?: number;
  monthly_downloads?: number;
  total_validations?: number;
} 