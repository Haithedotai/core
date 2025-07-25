// Database Types for Haithe Core
// Generated from SQLite schema

export interface Account {
  wallet_address: string;
  created_at: string; // ISO timestamp
  api_key_last_issued_at?: string; // ISO timestamp, optional
}

export interface Session {
  wallet_address: string;
  token: string;
  ip: string;
  user_agent: string;
  created_at: string; // ISO timestamp
}

export interface Organization {
  id: number;
  organization_uid: string;
  address: string;
  orchestrator_idx: number;
  name: string;
  owner: string; // wallet_address
  created_at: string; // ISO timestamp
}

export type OrgRole = "admin" | "member";

export interface OrgMember {
  org_id: number;
  wallet_address: string;
  role: OrgRole;
  created_at: string; // ISO timestamp
}

export interface Project {
  id: number;
  project_uid: string;
  org_id: number;
  name: string;
  created_at: string; // ISO timestamp
}

export type ProjectRole = "admin" | "developer" | "viewer";

export interface ProjectMember {
  project_id: number;
  wallet_address: string;
  role: ProjectRole;
}

export interface OrgModelEnrollment {
  id: string; // UUID
  org_id: number;
  model_id: number;
  enabled_at: string; // ISO timestamp
}

export interface Creator {
  wallet_address: string;
  uri: string;
  pvt_key_seed: string;
  pub_key: string;
  created_at: string; // ISO timestamp
}

export interface Product {
  id: string;
  project_id: number;
  name: string;
  config: Record<string, any>; // JSON object
  created_at: string; // ISO timestamp
}

export interface ApiKey {
  id: string;
  project_id: number;
  created_by: string;
  name: string;
  hashed_key: string;
  scopes: string[]; // JSON array
  expires_at?: string; // ISO timestamp, optional
  revoked_at?: string; // ISO timestamp, optional
  created_at: string; // ISO timestamp
}

// Request/Response types
export interface CreateAccountRequest {
  wallet_address: string;
}

export interface CreateSessionRequest {
  wallet_address: string;
  token: string;
  ip: string;
  user_agent: string;
}

export interface CreateOrganizationRequest {
  organization_uid: string;
  address: string;
  orchestrator_idx: number;
  name: string;
  owner: string; // wallet_address
}

export interface UpdateOrganizationRequest {
  organization_uid?: string;
  address?: string;
  orchestrator_idx?: number;
  name?: string;
  owner?: string; // wallet_address
}

export interface CreateProjectRequest {
  project_uid: string;
  org_id: number;
  name: string;
}

export interface UpdateProjectRequest {
  project_uid?: string;
  name?: string;
}

export interface CreateProductRequest {
  project_id: number;
  name: string;
  config?: Record<string, any>;
}

export interface CreateApiKeyRequest {
  name: string;
  scopes?: string[];
  expires_at?: string;
}

export interface AddOrgMemberRequest {
  wallet_address: string;
  role: OrgRole;
}

export interface UpdateOrgMemberRequest {
  role: OrgRole;
}

export interface AddProjectMemberRequest {
  wallet_address: string;
  role: ProjectRole;
}

export interface UpdateProjectMemberRequest {
  role: ProjectRole;
}

export interface CreateCreatorRequest {
  wallet_address: string;
  uri: string;
  pvt_key_seed: string;
  pub_key: string;
}

export interface CreateOrgModelEnrollmentRequest {
  org_id: number;
  model_id: number;
}

// Response types with relations
export interface OrganizationWithMembers extends Organization {
  members: (OrgMember & { account: Account })[];
}

export interface ProjectWithMembers extends Project {
  members: (ProjectMember & { account: Account })[];
  organization: Organization;
}

export interface ProductWithProject extends Product {
  project: Project;
}

export interface ApiKeyWithProject extends ApiKey {
  project: Project;
  creator: Account;
}

export interface CreatorWithAccount extends Creator {
  account: Account;
}

export interface OrgModelEnrollmentWithOrg extends OrgModelEnrollment {
  organization: Organization;
}

// API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Pagination
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Query filters
export interface OrganizationFilters {
  organization_uid?: string;
  name?: string;
  owner?: string;
  created_after?: string;
  created_before?: string;
}

export interface ProjectFilters {
  org_id?: number;
  project_uid?: string;
  name?: string;
  created_after?: string;
  created_before?: string;
}

export interface ApiKeyFilters {
  project_id?: number;
  created_by?: string;
  active_only?: boolean;
  expires_after?: string;
  expires_before?: string;
}

// Database connection and configuration
export interface DatabaseConfig {
  database_url: string;
  max_connections?: number;
  connection_timeout?: number;
}

// Error types
export interface DatabaseError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

// Utility types
export type CreateInput<T> = Omit<T, "created_at" | "id">;
export type UpdateInput<T> = Partial<Omit<T, "id" | "created_at">>;
export type DatabaseRecord = {
  id: string | number;
  created_at: string;
};

// Auth types
export interface AuthContext {
  wallet_address: string;
  session_token: string;
  ip: string;
  user_agent: string;
}

export interface AuthenticatedUser {
  wallet_address: string;
  organizations: Organization[];
  projects: Project[];
  session: Session;
}
