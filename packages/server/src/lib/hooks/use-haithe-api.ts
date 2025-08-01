import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { useHaitheContext } from "@/src/lib/context/services-provider";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";

// Define valid role types based on API
export type OrganizationRole = 'admin' | 'member';
export type ProjectRole = 'admin' | 'developer' | 'viewer';

export function useHaitheApi() {
    const { client, isInitialized } = useHaitheContext();
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    // Simple utility functions with safe fallbacks
    const getAuthToken = () => client?.getAuthToken() || null;
    const isWeb3Ready = () => client?.isWeb3Ready() || false;
    const isLoggedIn = () => client?.auth.isLoggedIn() || false;
    const isClientInitialized = () => isInitialized;

    return {
        // Utility functions
        isLoggedIn,
        getAuthToken,
        isWeb3Ready,
        isClientInitialized,

        // Direct client access (for testing)
        client,

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
                localStorage.clear();
                window.location.reload();
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

        apiKeyLastIssued: () => useQuery({
            queryKey: ['apiKeyLastIssued'],
            queryFn: () => {
                if (!client) throw new Error("Wallet not connected");
                return client.apiKeyLastIssued();
            },
            enabled: isLoggedIn() && !!client,
            staleTime: 5 * 60 * 1000, // 5 minutes
        }),

        // Faucet methods
        getFaucetInfo: () => useQuery({
            queryKey: ['faucetInfo'],
            queryFn: () => {
                if (!client) throw new Error("Wallet not connected");
                return client.getFaucetInfo();
            },
            enabled: isLoggedIn() && !!client,
            staleTime: 1 * 1000, // 1 second
        }),

        requestFaucetTokens: useMutation({
            mutationKey: ['requestFaucetTokens'],
            mutationFn: (productId?: number) => {
                if (!client) throw new Error("Wallet not connected");
                return client.requestFaucetTokens(productId);
            },
            onSuccess: () => {
                toast.success('Faucet tokens requested successfully');
                queryClient.invalidateQueries({ queryKey: ['faucetInfo'] });
            },
            onError: (error) => {
                console.error(error?.toString?.() || error);
                toast.error('Could not request faucet tokens. Please try again.');
            }
        }),

        // USDT methods
        usdtBalance: () => useQuery({
            queryKey: ['usdtBalance'],
            queryFn: () => {
                if (!client) throw new Error("Wallet not connected");
                return client.usdtBalance();
            },
            enabled: isLoggedIn() && !!client,
            staleTime: 1 * 1000, // 1 second
        }),

        transferUSDT: useMutation({
            mutationKey: ['transferUSDT'],
            mutationFn: ({ recipient, amount }: { recipient: string; amount: bigint }) => {
                if (!client) throw new Error("Wallet not connected");
                return client.transferUSDT(recipient as `0x${string}`, amount);
            },
            onSuccess: () => {
                toast.success('USDT transferred successfully');
                queryClient.invalidateQueries({ queryKey: ['usdtBalance'] });
            },
            onError: (error) => {
                console.error(error?.toString?.() || error);
                toast.error('Could not transfer USDT. Please try again.');
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
                queryClient.removeQueries({ queryKey: ['organization', id] });
                queryClient.invalidateQueries({ queryKey: ['organizations'] });
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

        // Organization product management
        getAvailableModels: () => useQuery({
            queryKey: ['availableModels'],
            queryFn: () => {
                if (!client) throw new Error("Wallet not connected");
                return client.getAvailableModels();
            },
            enabled: isLoggedIn() && !!client,
        }),

        enableProduct: useMutation({
            mutationKey: ['enableProduct'],
            mutationFn: ({ product_address, org_address }: { product_address: string; org_address: string }) => {
                if (!client) throw new Error("Wallet not connected");
                const productAddress = product_address.toLowerCase();
                const orgAddress = org_address.toLowerCase();
                return client.enableProduct(productAddress as `0x${string}`, orgAddress as `0x${string}`);
            },
            onSuccess: () => {
                toast.success('Product enabled successfully');
            },
            onError: (error) => {
                console.error(error?.toString?.() || error);
                toast.error('Could not enable product. Please try again.');
            }
        }),

        disableProduct: useMutation({
            mutationKey: ['disableProduct'],
            mutationFn: ({ product_address, org_address }: { product_address: string; org_address: string }) => {
                if (!client) throw new Error("Wallet not connected");
                return client.disableProduct(product_address as `0x${string}`, org_address as `0x${string}`);
            },
            onSuccess: () => {
                toast.success('Product disabled successfully');
            },
            onError: (error) => {
                console.error(error?.toString?.() || error);
                toast.error('Could not disable product. Please try again.');
            }
        }),

        getEnabledProducts: (org_address: string) => useQuery({
            queryKey: ['enabledProducts', org_address],
            queryFn: () => {
                if (!client) throw new Error("Wallet not connected");
                return client.getEnabledProducts(org_address as `0x${string}`);
            },
            enabled: isLoggedIn() && !!client && !!org_address,
        }),

        // Organization balance and expenditure
        organizationBalance: (orgId: number) => useQuery({
            queryKey: ['organizationBalance', orgId],
            queryFn: () => {
                if (!client) throw new Error("Wallet not connected");
                return client.organizationBalance(orgId);
            },
            enabled: !!orgId && !!client,
            staleTime: 30 * 1000, // 30 seconds
        }),

        getOrganizationExpenditure: (orgId: number) => useQuery({
            queryKey: ['organizationExpenditure', orgId],
            queryFn: () => {
                if (!client) throw new Error("Wallet not connected");
                return client.getOrganizationExpenditure(orgId);
            },
            enabled: !!orgId && !!client,
            staleTime: 30 * 1000, // 30 seconds
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

        getProjects: (orgId: number) => useQuery({
            queryKey: ['projects', orgId],
            queryFn: () => {
                if (!client) throw new Error("Wallet not connected");
                return client.getProjects(orgId);
            },
            enabled: !!orgId && !!client,
        }),

        // Project price per call
        pricePerCall: (projectId: number) => useQuery({
            queryKey: ['projectPricePerCall', projectId],
            queryFn: () => {
                if (!client) throw new Error("Wallet not connected");
                return client.pricePerCall(projectId);
            },
            enabled: !!projectId && !!client,
            staleTime: 30 * 1000, // 30 seconds
        }),

        becomeCreator: useMutation({
            mutationKey: ['becomeCreator'],
            mutationFn: ({ uri }: { uri: string }) => {
                if (!client) throw new Error("Wallet not connected");
                return client.becomeCreator(uri);
            },
            onSuccess: () => {
                toast.success('Registered as creator successfully');
            },
            onError: (error) => {
                console.error(error?.toString?.() || error);
                toast.error('Could not register as creator. Please try again.');
            }
        }),

        uploadToMarketplaceAndGetReward: useMutation({
            mutationKey: ['uploadToMarketplaceAndGetReward'],
            mutationFn: ({ name, file, category, pricePerCall, upload_fn }: { name: string; file: File; category: "knowledge:text" | "knowledge:html" | "knowledge:pdf" | "knowledge:csv" | "knowledge:html" | "knowledge:url" | "promptset" | "mcp" | "tool:rs" | "tool:js" | "tool:py" | "tool:rpc"; pricePerCall: bigint; upload_fn: (data: File) => Promise<string> }) => {
                if (!client) throw new Error("Wallet not connected");
                return client.uploadToMarketplaceAndGetReward(name, file, category, pricePerCall, upload_fn);
            },
        }),

        isCreator: () => useQuery({
            queryKey: ['isCreator'],
            queryFn: () => {
                if (!client) throw new Error("Wallet not connected");
                return client.isCreator();
            },
            enabled: isLoggedIn() && !!client,
        }),

        getCreatorByAddress: (id: string) => useQuery({
            queryKey: ['creator', id],
            queryFn: async () => {
                if (!client) throw new Error("Wallet not connected");
                const idToLower = id.toLowerCase();
                const res = await client.getCreatorByAddress(idToLower);
                const ipfsData = await fetch(res.uri);
                const data = await ipfsData.json();
                return {
                    ...res,
                    ...data,
                };
            },
            enabled: !!client && !!id,
        }),

        getCreatorProducts: (id: string) => useQuery({
            queryKey: ['creatorProducts', id],
            queryFn: () => {
                if (!client) throw new Error("Wallet not connected");
                const idToLower = id.toLowerCase();
                return client.getCreatorProducts(idToLower);
            },
            enabled: !!client && !!id,
        }),

        getAllProducts: () => useQuery({
            queryKey: ['allProducts'],
            queryFn: () => {
                if (!client) throw new Error("Wallet not connected");
                return client.getAllProducts();
            },
            enabled: !!client,
        }),

        getProductById: (id: number) => useQuery({
            queryKey: ['product', id],
            queryFn: () => {
                if (!client) throw new Error("Wallet not connected");
                return client.getProductById(id);
            },
            enabled: !!client && !!id,
        }),

        // Project product management
        enableProjectProduct: useMutation({
            mutationKey: ['enableProjectProduct'],
            mutationFn: ({ projectId, productId }: { projectId: number; productId: number }) => {
                if (!client) throw new Error("Wallet not connected");
                return client.enableProjectProduct(projectId, productId);
            },
            onSuccess: (_, { projectId }) => {
                toast.success('Product enabled for project successfully');
                queryClient.invalidateQueries({ queryKey: ['projectProducts', projectId] });
            },
            onError: (error) => {
                console.error(error?.toString?.() || error);
                toast.error('Could not enable product for project. Please try again.');
            }
        }),

        disableProjectProduct: useMutation({
            mutationKey: ['disableProjectProduct'],
            mutationFn: ({ projectId, productId }: { projectId: number; productId: number }) => {
                if (!client) throw new Error("Wallet not connected");
                return client.disableProjectProduct(projectId, productId);
            },
            onSuccess: (_, { projectId }) => {
                toast.success('Product disabled for project successfully');
                queryClient.invalidateQueries({ queryKey: ['projectProducts', projectId] });
            },
            onError: (error) => {
                console.error(error?.toString?.() || error);
                toast.error('Could not disable product for project. Please try again.');
            }
        }),

        getProjectProducts: (projectId: number) => useQuery({
            queryKey: ['projectProducts', projectId],
            queryFn: () => {
                if (!client) throw new Error("Wallet not connected");
                return client.getProjectProducts(projectId);
            },
            enabled: !!client && !!projectId,
        }),

        getEnabledModels: (orgId: number) => useQuery({
            queryKey: ['enabledModels', orgId],
            queryFn: () => {
                if (!client) throw new Error("Wallet not connected");
                console.log('getEnabledModels', orgId);
                return client.getEnabledModels(orgId);
            },
            enabled: !!client && !!orgId,
        }),

        enableModel: useMutation({
            mutationKey: ['enableModel'],
            mutationFn: ({ orgId, modelId }: { orgId: number; modelId: number }) => {
                if (!client) throw new Error("Wallet not connected");
                return client.enableModel(orgId, modelId);
            },
            onSuccess: () => {
                toast.success('Model enabled successfully');
            },
            onError: (error) => {
                console.error(error?.toString?.() || error);
                toast.error('Could not enable model. Please try again.');
            }
        }),

        disableModel: useMutation({
            mutationKey: ['disableModel'],
            mutationFn: ({ orgId, modelId }: { orgId: number; modelId: number }) => {
                if (!client) throw new Error("Wallet not connected");
                return client.disableModel(orgId, modelId);
            },
            onSuccess: () => {
                toast.success('Model disabled successfully');
            },
            onError: (error) => {
                console.error(error?.toString?.() || error);
                toast.error('Could not disable model. Please try again.');
            }
        }),

        // Chat/Conversation methods
        getConversations: (orgUid: string, projectUid: string) => useQuery({
            queryKey: ['conversations', orgUid, projectUid],
            queryFn: () => {
                if (!client) throw new Error("Wallet not connected");
                return client.getConversations(orgUid, projectUid);
            },
            enabled: isLoggedIn() && !!client && !!orgUid && !!projectUid,
        }),

        createConversation: useMutation({
            mutationKey: ['createConversation'],
            mutationFn: ({ orgUid, projectUid }: { orgUid: string; projectUid: string }) => {
                if (!client) throw new Error("Wallet not connected");
                return client.createConversation(orgUid, projectUid);
            },
            onSuccess: (_, { orgUid, projectUid }) => {
                queryClient.invalidateQueries({ queryKey: ['conversations', orgUid, projectUid] });
            },
            onError: (error) => {
                console.error(error?.toString?.() || error);
                toast.error('Could not create conversation. Please try again.');
            }
        }),

        getConversation: (id: number, orgUid: string, projectUid: string) => useQuery({
            queryKey: ['conversation', id, orgUid, projectUid],
            queryFn: () => {
                if (!client) throw new Error("Wallet not connected");
                return client.getConversation(id, orgUid, projectUid);
            },
            enabled: !!id && !!client && !!orgUid && !!projectUid,
        }),

        updateConversation: useMutation({
            mutationKey: ['updateConversation'],
            mutationFn: ({ id, title, orgUid, projectUid }: { id: number; title: string; orgUid: string; projectUid: string }) => {
                if (!client) throw new Error("Wallet not connected");
                return client.updateConversation(id, title, orgUid, projectUid);
            },
            onSuccess: (_, { id, orgUid, projectUid }) => {
                toast.success('Conversation updated successfully');
                queryClient.invalidateQueries({ queryKey: ['conversation', id, orgUid, projectUid] });
                queryClient.invalidateQueries({ queryKey: ['conversations', orgUid, projectUid] });
            },
            onError: (error) => {
                console.error(error?.toString?.() || error);
                toast.error('Could not update conversation. Please try again.');
            }
        }),

        deleteConversation: useMutation({
            mutationKey: ['deleteConversation'],
            mutationFn: ({ id, orgUid, projectUid }: { id: number; orgUid: string; projectUid: string }) => {
                if (!client) throw new Error("Wallet not connected");
                return client.deleteConversation(id, orgUid, projectUid);
            },
            onSuccess: (_, { id, orgUid, projectUid }) => {
                toast.success('Conversation deleted successfully');
                queryClient.removeQueries({ queryKey: ['conversation', id, orgUid, projectUid] });
                queryClient.invalidateQueries({ queryKey: ['conversations', orgUid, projectUid] });
            },
            onError: (error) => {
                console.error(error?.toString?.() || error);
                toast.error('Could not delete conversation. Please try again.');
            }
        }),

        getConversationMessages: (conversationId: number, orgUid: string, projectUid: string) => useQuery({
            queryKey: ['conversationMessages', conversationId, orgUid, projectUid],
            queryFn: () => {
                if (!client) throw new Error("Wallet not connected");
                return client.getConversationMessages(conversationId, orgUid, projectUid);
            },
            enabled: !!conversationId && !!client && !!orgUid && !!projectUid,
        }),

        createMessage: useMutation({
            mutationKey: ['createMessage'],
            mutationFn: ({ conversationId, message, sender, orgUid, projectUid }: {
                conversationId: number;
                message: string;
                sender: string;
                orgUid: string;
                projectUid: string;
            }) => {
                if (!client) throw new Error("Wallet not connected");
                return client.createMessage(conversationId, message, sender, orgUid, projectUid);
            },
            onSuccess: (_, { conversationId, orgUid, projectUid }) => {
                queryClient.invalidateQueries({ queryKey: ['conversationMessages', conversationId, orgUid, projectUid] });
            },
            onError: (error) => {
                console.error(error?.toString?.() || error);
                toast.error('Could not send message. Please try again.');
            }
        }),

        getCompletions: useMutation({
            mutationKey: ['getCompletions'],
            mutationFn: ({ orgUid, projectUid, body }: {
                orgUid: string;
                projectUid: string;
                body: {
                    model: string;
                    messages: Array<{ role: string; content: string }>;
                    n?: number;
                    temperature?: number;
                };
            }) => {
                if (!client) throw new Error("Wallet not connected");
                return client.getCompletions(orgUid, projectUid, body);
            },
            onError: (error) => {
                console.error(error?.toString?.() || error);
                toast.error('Could not get AI completion. Please try again.');
            }
        }),
    };
} 