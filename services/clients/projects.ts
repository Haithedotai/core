import { BaseClient } from "../shared/baseClient";
import type { Project, ProjectMember } from "../shared/types";
import { HaitheAuthClient } from "./auth";
import type { Conversation, Message } from "../shared/types";

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

  updateProject(
    id: number,
    updates: {
      name?: string;
      search_enabled?: boolean;
      memory_enabled?: boolean;
    }
  ): Promise<Project> {
    const queryParams = new URLSearchParams();

    if (updates.name !== undefined) {
      queryParams.append("name", updates.name);
    }
    if (updates.search_enabled !== undefined) {
      queryParams.append("search_enabled", updates.search_enabled.toString());
    }
    if (updates.memory_enabled !== undefined) {
      queryParams.append("memory_enabled", updates.memory_enabled.toString());
    }

    return this.fetch(
      `/v1/projects/${id}?${queryParams.toString()}`,
      this.authClient.getAuthToken(),
      { method: "PATCH" }
    );
  }

  deleteProject(id: number): Promise<Project> {
    return this.fetch(`/v1/projects/${id}`, this.authClient.getAuthToken(), {
      method: "DELETE",
    });
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

  getTelegramInfo(projectId: number): Promise<{
    configured: boolean;
    running: boolean;
    org_uid: string;
    project_uid: string;
    me: null | {
      id: number;
      is_bot: boolean;
      first_name: string;
      username?: string;
      can_join_groups?: boolean;
      can_read_all_group_messages?: boolean;
      supports_inline_queries?: boolean;
      link?: string | null;
    };
  }> {
    return this.fetch(
      `/v1/projects/${projectId}/telegram`,
      this.authClient.getAuthToken()
    );
  }

  setTelegramToken(projectId: number, token: string | null): Promise<{}> {
    const body = { teloxide_token: token };
    return this.fetch(
      `/v1/projects/${projectId}/telegram`,
      this.authClient.getAuthToken(),
      { method: "PUT", body: JSON.stringify(body) }
    );
  }

  getProjects(orgId: number): Promise<Project[]> {
    return this.fetch(
      `/v1/orgs/${orgId}/projects`,
      this.authClient.getAuthToken()
    );
  }

  getProjectProducts(projectId: number): Promise<number[]> {
    return this.fetch<{ product_ids: number[] }>(
      `/v1/projects/${projectId}/products`,
      this.authClient.getAuthToken()
    ).then((response) => response.product_ids);
  }

  pricePerCall(projectId: number): Promise<{
    total_price_per_call: number;
  }> {
    return this.fetch(
      `/v1/projects/${projectId}/price-per-call`,
      this.authClient.getAuthToken()
    );
  }

  // Chat/Conversation related methods
  getConversations(
    orgUid: string,
    projectUid: string
  ): Promise<Conversation[]> {
    return this.fetch(
      `/v1beta/chat/conversations`,
      this.authClient.getAuthToken(),
      {
        headers: {
          "Haithe-Organization": `org-${orgUid}`,
          "Haithe-Project": `proj-${projectUid}`,
        },
      }
    );
  }

  createConversation(
    orgUid: string,
    projectUid: string
  ): Promise<Conversation> {
    return this.fetch(
      `/v1beta/chat/conversations`,
      this.authClient.getAuthToken(),
      {
        method: "POST",
        headers: {
          "Haithe-Organization": `org-${orgUid}`,
          "Haithe-Project": `proj-${projectUid}`,
        },
      }
    );
  }

  getConversation(
    id: number,
    orgUid: string,
    projectUid: string
  ): Promise<Conversation> {
    return this.fetch(
      `/v1beta/chat/conversations/${id}`,
      this.authClient.getAuthToken(),
      {
        headers: {
          "Haithe-Organization": `org-${orgUid}`,
          "Haithe-Project": `proj-${projectUid}`,
        },
      }
    );
  }

  updateConversation(
    id: number,
    title: string,
    orgUid: string,
    projectUid: string
  ): Promise<Conversation> {
    return this.fetch(
      `/v1beta/chat/conversations/${id}`,
      this.authClient.getAuthToken(),
      {
        method: "PATCH",
        headers: {
          "Haithe-Organization": `org-${orgUid}`,
          "Haithe-Project": `proj-${projectUid}`,
        },
        body: JSON.stringify({ title }),
      }
    );
  }

  deleteConversation(
    id: number,
    orgUid: string,
    projectUid: string
  ): Promise<{ rows_affected: number }> {
    return this.fetch(
      `/v1beta/chat/conversations/${id}`,
      this.authClient.getAuthToken(),
      {
        method: "DELETE",
        headers: {
          "Haithe-Organization": `org-${orgUid}`,
          "Haithe-Project": `proj-${projectUid}`,
        },
      }
    );
  }

  getConversationMessages(
    conversationId: number,
    orgUid: string,
    projectUid: string
  ): Promise<Message[]> {
    return this.fetch(
      `/v1beta/chat/conversations/${conversationId}/messages`,
      this.authClient.getAuthToken(),
      {
        headers: {
          "Haithe-Organization": `org-${orgUid}`,
          "Haithe-Project": `proj-${projectUid}`,
        },
      }
    );
  }

  createMessage(
    conversationId: number,
    message: string,
    sender: string,
    orgUid: string,
    projectUid: string
  ): Promise<Message> {
    return this.fetch(
      `/v1beta/chat/conversations/${conversationId}/messages`,
      this.authClient.getAuthToken(),
      {
        method: "POST",
        headers: {
          "Haithe-Organization": `org-${orgUid}`,
          "Haithe-Project": `proj-${projectUid}`,
        },
        body: JSON.stringify({ message, sender }),
      }
    );
  }

  getCompletions(
    orgUid: string,
    projectUid: string,
    body: {
      model: string;
      messages: Array<{ role: string; content: string }>;
      n?: number;
      temperature?: number;
    }
  ): Promise<{
    id: string;
    object: string;
    created: number;
    model: string;
    choices: Array<{
      index: number;
      message: {
        role: string;
        content: string;
      };
      finish_reason: string;
    }>;
    usage: {
      total_cost: number;
      expense_till_now: number;
      prompt_tokens: number;
    };
  }> {
    return this.fetch(
      `/v1beta/openai/chat/completions`,
      this.authClient.getAuthToken(),
      {
        method: "POST",
        headers: {
          "Haithe-Organization": `org-${orgUid}`,
          "Haithe-Project": `proj-${projectUid}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );
  }
}
