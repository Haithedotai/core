// Database Types for Haithe Core
// Generated from SQLite schema

export interface Account {
  wallet_address: string;
  created_at: string; // ISO timestamp
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
  name: string;
  created_at: string; // ISO timestamp
}

export interface OrgOwner {
  org_id: number;
  wallet_address: string;
  created_at: string; // ISO timestamp
}

export interface OrgAdmin {
  org_id: number;
  wallet_address: string;
}

export interface Project {
  id: string;
  org_id: string;
  name: string;
  created_at: string; // ISO timestamp
}

export type ProjectRole = "admin" | "developer" | "viewer";

export interface ProjectMember {
  project_id: string;
  wallet_address: string;
  role: ProjectRole;
}

export interface Product {
  id: string;
  project_id: string;
  name: string;
  config: Record<string, any>; // JSON object
  created_at: string; // ISO timestamp
}

export interface ApiKey {
  id: string;
  project_id: string;
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
  name: string;
}

export interface UpdateOrganizationRequest {
  name?: string;
  metadata?: Record<string, any>;
}

export interface CreateProjectRequest {
  name: string;
}

export interface UpdateProjectRequest {
  name?: string;
  metadata?: Record<string, any>;
}

export interface CreateProductRequest {
  project_id: string;
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
  role: "owner" | "admin";
}

export interface UpdateOrgMemberRequest {
  role: "owner" | "admin";
}

export interface AddProjectMemberRequest {
  wallet_address: string;
  role: ProjectRole;
}

export interface UpdateProjectMemberRequest {
  role: ProjectRole;
}

// Response types with relations
export interface OrganizationWithOwners extends Organization {
  owners: Account[];
  admins: Account[];
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
  name?: string;
  created_after?: string;
  created_before?: string;
}

export interface ProjectFilters {
  org_id?: string;
  name?: string;
  created_after?: string;
  created_before?: string;
}

export interface ApiKeyFilters {
  project_id?: string;
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
