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
            onSuccess: async () => {
                toast.success('Logged in successfully');
                
                // Invalidate queries to refresh data
                queryClient.invalidateQueries({ queryKey: ['profile'] });
                queryClient.invalidateQueries({ queryKey: ['organizations'] });
                
                // Wait a bit for queries to update, then check organizations
                setTimeout(async () => {
                    try {
                        // Check if user has any organizations
                        const organizations = await client?.getUserOrganizations();
                        
                        if (!organizations || organizations.length === 0) {
                            // New user - redirect to onboarding
                            navigate({ to: '/onboarding' });
                        } else {
                            // Existing user - redirect to dashboard  
                            navigate({ to: '/dashboard' });
                        }
                    } catch (error) {
                        console.error('Failed to check user organizations:', error);
                        // On error, default to onboarding to be safe
                        navigate({ to: '/onboarding' });
                    }
                }, 100);
            },
            onError: (error) => {
                console.error(error?.toString?.() || error);
                toast.error('Login failed. Please try again.');
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
                navigate({ to: '/' });
                queryClient.clear(); // Clear all cache on logout
            },
            onError: (error) => {
                console.error(error?.toString?.() || error);
                toast.error('Logout failed. Please try again.');
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
                console.error(error?.toString?.() || error);
                toast.error('Could not generate API key. Please try again.');
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
                console.error(error?.toString?.() || error);
                toast.error('Could not disable API key. Please try again.');
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
                console.error(error?.toString?.() || error);
                toast.error('Could not create organization. Please try again.');
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

        getUserOrganizations: () => useQuery({
            queryKey: ['organizations'],
            queryFn: () => {
                if (!client) throw new Error("Wallet not connected");
                return client.getUserOrganizations();
            },
            enabled: isLoggedIn() && !!client,
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
                console.error(error?.toString?.() || error);
                toast.error('Could not update organization. Please try again.');
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
                console.error(error?.toString?.() || error);
                toast.error('Could not delete organization. Please try again.');
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
                console.error(error?.toString?.() || error);
                toast.error('Could not add organization member. Please try again.');
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
                console.error(error?.toString?.() || error);
                toast.error('Could not update organization member role. Please try again.');
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
                console.error(error?.toString?.() || error);
                toast.error('Could not remove organization member. Please try again.');
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
                console.error(error?.toString?.() || error);
                toast.error('Could not create project. Please try again.');
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
                console.error(error?.toString?.() || error);
                toast.error('Could not update project. Please try again.');
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
                console.error(error?.toString?.() || error);
                toast.error('Could not delete project. Please try again.');
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
                console.error(error?.toString?.() || error);
                toast.error('Could not add project member. Please try again.');
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
                console.error(error?.toString?.() || error);
                toast.error('Could not update project member role. Please try again.');
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
                console.error(error?.toString?.() || error);
                toast.error('Could not remove project member. Please try again.');
            }
        }),
    };
} 