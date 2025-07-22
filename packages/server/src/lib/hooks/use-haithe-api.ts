import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useHaitheClient } from "../context/services-provider";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";

// Define valid role types based on API
export type OrganizationRole = 'admin' | 'member';
export type ProjectRole = 'admin' | 'developer' | 'viewer';

export function useHaitheApi() {
    const client = useHaitheClient();
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    // Simple utility functions with safe fallbacks
    const getAuthToken = () => client?.getAuthToken() || null;
    const isWeb3Ready = () => client?.isWeb3Ready() || false;
    const isLoggedIn = () => client?.auth.isLoggedIn() || false;

    return {
        // Utility functions
        isLoggedIn,
        getAuthToken,
        isWeb3Ready,

        // Auth mutations
        login: useMutation({
            mutationKey: ['login'],
            mutationFn: () => {
                if (!client) throw new Error("Wallet not connected");
                return client.auth.login();
            },
            onSuccess: () => {
                toast.success('Logged in successfully');
                navigate({ to: '/dashboard' });
                queryClient.invalidateQueries({ queryKey: ['profile'] });
            },
            onError: (error) => {
                toast.error(error?.toString() || 'Login failed');
            }
        }),

        logout: useMutation({
            mutationKey: ['logout'],
            mutationFn: () => {
                if (!client) throw new Error("Wallet not connected");
                return client.auth.logout();
            },
            onSuccess: () => {
                toast.success('Logged out successfully');
                queryClient.clear(); // Clear all cache on logout
            },
            onError: (error) => {
                toast.error(error?.toString() || 'Logout failed');
            }
        }),

        // Profile query - returns raw API data
        profile: () => useQuery({
            queryKey: ['profile'],
            queryFn: () => {
                if (!client) throw new Error("Wallet not connected");
                return client.profile();
            },
            enabled: isLoggedIn() && !!client,
            staleTime: 5 * 60 * 1000, // 5 minutes
        }),

        // API Key management
        generateApiKey: useMutation({
            mutationKey: ['generateApiKey'],
            mutationFn: () => {
                if (!client) throw new Error("Wallet not connected");
                return client.generateApiKey();
            },
            onSuccess: () => {
                toast.success('API key generated successfully');
            },
            onError: (error) => {
                toast.error(error?.toString() || 'Failed to generate API key');
            }
        }),

        disableApiKey: useMutation({
            mutationKey: ['disableApiKey'],
            mutationFn: () => {
                if (!client) throw new Error("Wallet not connected");
                return client.disableApiKey();
            },
            onSuccess: () => {
                toast.success('API key disabled successfully');
            },
            onError: (error) => {
                toast.error(error?.toString() || 'Failed to disable API key');
            }
        }),

        // Organization mutations
        createOrganization: useMutation({
            mutationKey: ['createOrganization'],
            mutationFn: (name: string) => {
                if (!client) throw new Error("Wallet not connected");
                return client.createOrganization(name);
            },
            onSuccess: (_, name) => {
                toast.success(`Organization "${name}" created successfully`);
                queryClient.invalidateQueries({ queryKey: ['organizations'] });
            },
            onError: (error) => {
                toast.error(error?.toString() || 'Failed to create organization');
            }
        }),

        getOrganization: (id: number) => useQuery({
            queryKey: ['organization', id],
            queryFn: () => {
                if (!client) throw new Error("Wallet not connected");
                return client.getOrganization(id);
            },
            enabled: !!id && !!client,
        }),

        updateOrganization: useMutation({
            mutationKey: ['updateOrganization'],
            mutationFn: ({ id, name }: { id: number; name: string }) => {
                if (!client) throw new Error("Wallet not connected");
                return client.updateOrganization(id, name);
            },
            onSuccess: (_, { id }) => {
                toast.success('Organization updated successfully');
                queryClient.invalidateQueries({ queryKey: ['organization', id] });
                queryClient.invalidateQueries({ queryKey: ['organizations'] });
            },
            onError: (error) => {
                toast.error(error?.toString() || 'Failed to update organization');
            }
        }),

        deleteOrganization: useMutation({
            mutationKey: ['deleteOrganization'],
            mutationFn: (id: number) => {
                if (!client) throw new Error("Wallet not connected");
                return client.deleteOrganization(id);
            },
            onSuccess: (_, id) => {
                toast.success('Organization deleted successfully');
                queryClient.invalidateQueries({ queryKey: ['organizations'] });
                queryClient.removeQueries({ queryKey: ['organization', id] });
            },
            onError: (error) => {
                toast.error(error?.toString() || 'Failed to delete organization');
            }
        }),

        // Organization member mutations and queries
        getOrganizationMembers: (orgId: number) => useQuery({
            queryKey: ['organizationMembers', orgId],
            queryFn: () => {
                if (!client) throw new Error("Wallet not connected");
                return client.getOrganizationMembers(orgId);
            },
            enabled: !!orgId && !!client,
        }),

        addOrganizationMember: useMutation({
            mutationKey: ['addOrganizationMember'],
            mutationFn: ({ orgId, address, role }: {
                orgId: number;
                address: string;
                role: OrganizationRole
            }) => {
                if (!client) throw new Error("Wallet not connected");
                return client.addOrganizationMember(orgId, address, role);
            },
            onSuccess: (_, { orgId }) => {
                toast.success('Organization member added successfully');
                queryClient.invalidateQueries({ queryKey: ['organizationMembers', orgId] });
            },
            onError: (error) => {
                toast.error(error?.toString() || 'Failed to add organization member');
            }
        }),

        updateOrganizationMemberRole: useMutation({
            mutationKey: ['updateOrganizationMemberRole'],
            mutationFn: ({ orgId, address, role }: {
                orgId: number;
                address: string;
                role: OrganizationRole
            }) => {
                if (!client) throw new Error("Wallet not connected");
                return client.updateOrganizationMemberRole(orgId, address, role);
            },
            onSuccess: (_, { orgId }) => {
                toast.success('Organization member role updated successfully');
                queryClient.invalidateQueries({ queryKey: ['organizationMembers', orgId] });
            },
            onError: (error) => {
                toast.error(error?.toString() || 'Failed to update organization member role');
            }
        }),

        removeOrganizationMember: useMutation({
            mutationKey: ['removeOrganizationMember'],
            mutationFn: ({ orgId, address }: { orgId: number; address: string }) => {
                if (!client) throw new Error("Wallet not connected");
                return client.removeOrganizationMember(orgId, address);
            },
            onSuccess: (_, { orgId }) => {
                toast.success('Organization member removed successfully');
                queryClient.invalidateQueries({ queryKey: ['organizationMembers', orgId] });
            },
            onError: (error) => {
                toast.error(error?.toString() || 'Failed to remove organization member');
            }
        }),

        // Project mutations and queries
        createProject: useMutation({
            mutationKey: ['createProject'],
            mutationFn: ({ orgId, name }: { orgId: number; name: string }) => {
                if (!client) throw new Error("Wallet not connected");
                return client.createProject(orgId, name);
            },
            onSuccess: (_, { name, orgId }) => {
                toast.success(`Project "${name}" created successfully`);
                queryClient.invalidateQueries({ queryKey: ['projects', orgId] });
            },
            onError: (error) => {
                toast.error(error?.toString() || 'Failed to create project');
            }
        }),

        getProject: (id: number) => useQuery({
            queryKey: ['project', id],
            queryFn: () => {
                if (!client) throw new Error("Wallet not connected");
                return client.getProject(id);
            },
            enabled: !!id && !!client,
        }),

        updateProject: useMutation({
            mutationKey: ['updateProject'],
            mutationFn: ({ id, name }: { id: number; name: string }) => {
                if (!client) throw new Error("Wallet not connected");
                return client.updateProject(id, name);
            },
            onSuccess: (_, { id }) => {
                toast.success('Project updated successfully');
                queryClient.invalidateQueries({ queryKey: ['project', id] });
            },
            onError: (error) => {
                toast.error(error?.toString() || 'Failed to update project');
            }
        }),

        deleteProject: useMutation({
            mutationKey: ['deleteProject'],
            mutationFn: (id: number) => {
                if (!client) throw new Error("Wallet not connected");
                return client.deleteProject(id);
            },
            onSuccess: (_, id) => {
                toast.success('Project deleted successfully');
                queryClient.removeQueries({ queryKey: ['project', id] });
                queryClient.invalidateQueries({ queryKey: ['projects'] });
            },
            onError: (error) => {
                toast.error(error?.toString() || 'Failed to delete project');
            }
        }),

        // Project member mutations and queries
        getProjectMembers: (projectId: number) => useQuery({
            queryKey: ['projectMembers', projectId],
            queryFn: () => {
                if (!client) throw new Error("Wallet not connected");
                return client.getProjectMembers(projectId);
            },
            enabled: !!projectId && !!client,
        }),

        addProjectMember: useMutation({
            mutationKey: ['addProjectMember'],
            mutationFn: ({ projectId, address, role }: {
                projectId: number;
                address: string;
                role: ProjectRole
            }) => {
                if (!client) throw new Error("Wallet not connected");
                return client.addProjectMember(projectId, address, role);
            },
            onSuccess: (_, { projectId }) => {
                toast.success('Project member added successfully');
                queryClient.invalidateQueries({ queryKey: ['projectMembers', projectId] });
            },
            onError: (error) => {
                toast.error(error?.toString() || 'Failed to add project member');
            }
        }),

        updateProjectMemberRole: useMutation({
            mutationKey: ['updateProjectMemberRole'],
            mutationFn: ({ projectId, address, role }: {
                projectId: number;
                address: string;
                role: ProjectRole
            }) => {
                if (!client) throw new Error("Wallet not connected");
                return client.updateProjectMemberRole(projectId, address, role);
            },
            onSuccess: (_, { projectId }) => {
                toast.success('Project member role updated successfully');
                queryClient.invalidateQueries({ queryKey: ['projectMembers', projectId] });
            },
            onError: (error) => {
                toast.error(error?.toString() || 'Failed to update project member role');
            }
        }),

        removeProjectMember: useMutation({
            mutationKey: ['removeProjectMember'],
            mutationFn: ({ projectId, address }: { projectId: number; address: string }) => {
                if (!client) throw new Error("Wallet not connected");
                return client.removeProjectMember(projectId, address);
            },
            onSuccess: (_, { projectId }) => {
                toast.success('Project member removed successfully');
                queryClient.invalidateQueries({ queryKey: ['projectMembers', projectId] });
            },
            onError: (error) => {
                toast.error(error?.toString() || 'Failed to remove project member');
            }
        }),
    };
} 