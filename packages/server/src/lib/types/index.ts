export type VerificationStatus = 'unverified' | 'pending' | 'verified';
export type ItemType = 'knowledge_base' | 'tool' | 'mcp' | 'prompt_set';
export type ItemStatus = 'draft' | 'active' | 'inactive' | 'archived';
export type ValidationStatus = 'unvalidated' | 'pending' | 'certified' | 'rejected';
export type AgentStatus = 'active' | 'development' | 'paused' | 'archived';
export type AgentType = 'workflow' | 'model' | 'experiment';
export type AgentPrivacy = 'public' | 'private' | 'organization';
export type PurchaseStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type ValidationStatusType = 'pending' | 'in_progress' | 'certified' | 'rejected';
export type ValidationType = 'basic_review' | 'full_audit' | 'protocol_audit' | 'security_audit';
export type MemberRole = 'owner' | 'admin' | 'member';
export type ModelProvider = 'openai' | 'anthropic' | 'google' | 'cohere' | 'moonshot' | 'meta' | 'mistral' | 'groq';
export type WorkflowStatus = 'draft' | 'active' | 'paused' | 'archived';

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

// New types for Models
export interface Model {
  id: string;
  name: string;
  description: string;
  provider: ModelProvider;
  model_id: string; // The actual model identifier (e.g., 'gpt-4', 'claude-3-sonnet')
  version?: string;
  context_length: number;
  input_cost_per_token: number;
  output_cost_per_token: number;
  capabilities: string[]; // e.g., ['text', 'vision', 'code', 'function_calling']
  max_output_tokens?: number;
  organization_id: string;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
}

// Rename Project to Agent
export interface AgentComponent {
  id: string;
  name: string;
  type: ItemType | 'custom';
  marketplace_item_id?: string; // if purchased from marketplace
  configuration: Record<string, any>;
}

export interface Agent {
  id: string;
  name: string;
  description: string | null;
  user_id: string;
  organization_id: string;
  agent_type: AgentType;
  status: AgentStatus;
  privacy: AgentPrivacy;
  components: AgentComponent[];
  model_id?: string; // Associated model
  members: string[]; // User IDs of members
  created_at: string;
  updated_at: string;
}

// New types for Workflows
export interface WorkflowNode {
  id: string;
  agent_id: string;
  position: { x: number; y: number };
  configuration: Record<string, any>;
}

export interface WorkflowEdge {
  id: string;
  source_node_id: string;
  target_node_id: string;
  condition?: string; // Optional condition for the edge
}

export interface Workflow {
  id: string;
  name: string;
  description: string | null;
  organization_id: string;
  user_id: string;
  status: WorkflowStatus;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  metadata: Record<string, any>;
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
  project_type?: AgentType[];
  status?: AgentStatus[];
  privacy?: AgentPrivacy[];
  sort_by?: 'name' | 'created_at' | 'updated_at';
  sort_order?: 'asc' | 'desc';
}

export interface AgentFilters {
  search?: string;
  agent_type?: AgentType[];
  status?: AgentStatus[];
  privacy?: AgentPrivacy[];
  sort_by?: 'name' | 'created_at' | 'updated_at';
  sort_order?: 'asc' | 'desc';
}

export interface WorkflowFilters {
  search?: string;
  status?: WorkflowStatus[];
  sort_by?: 'name' | 'created_at' | 'updated_at';
  sort_order?: 'asc' | 'desc';
}

export interface ModelFilters {
  search?: string;
  provider?: ModelProvider[];
  capabilities?: string[];
  sort_by?: 'name' | 'provider' | 'created_at';
  sort_order?: 'asc' | 'desc';
}

// Update Dashboard Stats for new structure
export interface DashboardStats {
  // Organization stats
  total_models?: number;
  total_agents?: number;
  total_workflows?: number;
  active_agents?: number;
  active_workflows?: number;
  total_agent_runs?: number;
  total_workflow_executions?: number;
  // Legacy stats for backward compatibility
  total_items?: number;
  total_projects?: number;
  total_purchases?: number;
  total_sales?: number;
  total_revenue?: number;
  monthly_downloads?: number;
  total_validations?: number;
} 