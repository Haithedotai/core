import { BaseClient } from "../shared/baseClient";
import type { Project, ProjectMember } from "../shared/types";
import { HaitheAuthClient } from "./auth";

export class HaitheProjectsClient extends BaseClient {
  private authClient: HaitheAuthClient;

  constructor(authClient: HaitheAuthClient, options?: { debug?: boolean }) {
    super(authClient["baseUrl"], options?.debug);
    this.authClient = authClient;
  }

  createProject(orgId: number, name: string): Promise<Project> {
    return this.fetch(
      `/v1/projects?org_id=${orgId}&name=${encodeURIComponent(name)}`,
      this.authClient.getAuthToken(),
      { method: "POST" }
    );
  }

  getProject(id: number): Promise<Project> {
    return this.fetch(`/v1/projects/${id}`, this.authClient.getAuthToken());
  }

  updateProject(id: number, name: string): Promise<Project> {
    return this.fetch(
      `/v1/projects/${id}?name=${encodeURIComponent(name)}`,
      this.authClient.getAuthToken(),
      { method: "PATCH" }
    );
  }

  deleteProject(id: number): Promise<Project> {
    return this.fetch(
      `/v1/projects/${id}`,
      this.authClient.getAuthToken(),
      { method: "DELETE" }
    );
  }

  getProjectMembers(projectId: number): Promise<ProjectMember[]> {
    return this.fetch(
      `/v1/projects/${projectId}/members`,
      this.authClient.getAuthToken()
    );
  }

  addProjectMember(
    projectId: number,
    walletAddress: string,
    role: "admin" | "developer" | "viewer"
  ): Promise<ProjectMember> {
    return this.fetch(
      `/v1/projects/${projectId}/members?wallet_address=${encodeURIComponent(
        walletAddress
      )}&role=${role}`,
      this.authClient.getAuthToken(),
      { method: "POST" }
    );
  }

  updateProjectMemberRole(
    projectId: number,
    walletAddress: string,
    role: "admin" | "developer" | "viewer"
  ): Promise<ProjectMember> {
    return this.fetch(
      `/v1/projects/${projectId}/members?wallet_address=${encodeURIComponent(
        walletAddress
      )}&role=${role}`,
      this.authClient.getAuthToken(),
      { method: "PATCH" }
    );
  }

  removeProjectMember(
    projectId: number,
    walletAddress: string
  ): Promise<ProjectMember> {
    return this.fetch(
      `/v1/projects/${projectId}/members?wallet_address=${encodeURIComponent(
        walletAddress
      )}`,
      this.authClient.getAuthToken(),
      { method: "DELETE" }
    );
  }
}