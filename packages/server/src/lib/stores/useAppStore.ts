import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { 
  User, 
  Organization, 
  OrganizationMember,
  MarketplaceItem, 
  Purchase, 
  Validation, 
  Project, 
  Review,
  MarketplaceFilters,
  ProjectFilters,
  DashboardStats
} from '../types';
import mockData from '../data/mockData.json';

interface AppState {
  // Auth state
  currentUser: User | null;
  currentOrganization: Organization | null;
  isAuthenticated: boolean;

  // Data
  users: User[];
  organizations: Organization[];
  organizationMembers: OrganizationMember[];
  marketplaceItems: MarketplaceItem[];
  purchases: Purchase[];
  validations: Validation[];
  projects: Project[];
  reviews: Review[];

  // UI state
  loading: {
    auth: boolean;
    marketplace: boolean;
    projects: boolean;
    purchases: boolean;
    validations: boolean;
  };
  errors: {
    auth: string | null;
    marketplace: string | null;
    projects: string | null;
    purchases: string | null;
    validations: string | null;
  };
}

interface AppActions {
  // Auth actions
  setCurrentUser: (user: User | null) => void;
  setCurrentOrganization: (org: Organization | null) => void;
  setAuthenticated: (authenticated: boolean) => void;
  logout: () => void;

  // Data fetching
  fetchUsers: () => Promise<User[]>;
  fetchOrganizations: () => Promise<Organization[]>;
  fetchMarketplaceItems: (filters?: MarketplaceFilters) => Promise<{ data: MarketplaceItem[] }>;
  fetchUserProjects: (userId: string, filters?: ProjectFilters) => Promise<Project[]>;
  fetchOrganizationProjects: (orgId: string, filters?: ProjectFilters) => Promise<Project[]>;
  fetchValidations: (userId: string) => Promise<Validation[]>;
  fetchPurchases: (userId: string) => Promise<Purchase[]>;
  fetchReviews: (itemId: string) => Promise<Review[]>;

  // CRUD operations
  createUser: (userData: Partial<User>) => Promise<User>;
  updateUser: (id: string, updates: Partial<User>) => Promise<User>;

  createMarketplaceItem: (itemData: Partial<MarketplaceItem>) => Promise<MarketplaceItem>;
  updateMarketplaceItem: (id: string, updates: Partial<MarketplaceItem>) => Promise<MarketplaceItem>;
  deleteMarketplaceItem: (id: string) => Promise<void>;

  createProject: (projectData: Partial<Project>) => Promise<Project>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<Project>;
  deleteProject: (id: string) => Promise<void>;

  // Business actions
  purchaseItem: (itemId: string, organizationId: string) => Promise<Purchase>;
  requestValidation: (itemId: string, validationType: string) => Promise<Validation>;
  submitValidation: (validationId: string, report: string, score: number) => Promise<Validation>;

  createOrganization: (orgData: Partial<Organization>) => Promise<Organization>;
  updateOrganization: (id: string, updates: Partial<Organization>) => Promise<Organization>;

  // Utility actions
  setError: (type: keyof AppState['errors'], error: string | null) => void;
  setLoading: (type: keyof AppState['loading'], loading: boolean) => void;
  getDashboardStats: (userId: string) => DashboardStats;

  // Search and filter utilities
  searchMarketplace: (query: string, filters?: MarketplaceFilters) => MarketplaceItem[];
  getItemsByProvider: (providerId: string) => MarketplaceItem[];
  getItemsByType: (type: string) => MarketplaceItem[];
  getUserOrganizations: (userId: string) => Organization[];
  getOrganizationMembers: (orgId: string) => { user: User; member: OrganizationMember }[];

  // Onboarding
  completeOnboarding: (walletAddress: string, userData: Partial<User>, orgData?: Partial<Organization>) => Promise<User>;
}

type AppStore = AppState & AppActions;

// Mock API delay
const mockDelay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Generate mock ID
const generateId = () => Math.random().toString(36).substr(2, 9);

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // Initial state
      currentUser: null,
      currentOrganization: null,
      isAuthenticated: false,

      users: mockData.users as User[],
      organizations: mockData.organizations as Organization[],
      organizationMembers: mockData.organization_members as OrganizationMember[],
      marketplaceItems: mockData.marketplace_items as MarketplaceItem[],
      purchases: mockData.purchases as Purchase[],
      validations: mockData.validations as Validation[],
      projects: mockData.projects as Project[],
      reviews: mockData.reviews as Review[],

      loading: {
        auth: false,
        marketplace: false,
        projects: false,
        purchases: false,
        validations: false,
      },
      errors: {
        auth: null,
        marketplace: null,
        projects: null,
        purchases: null,
        validations: null,
      },

      // Auth actions
      setCurrentUser: (user) => set({ currentUser: user }),
      setCurrentOrganization: (org) => set({ currentOrganization: org }),
      setAuthenticated: (authenticated) => set({ isAuthenticated: authenticated }),
      logout: () => set({ 
        currentUser: null, 
        currentOrganization: null, 
        isAuthenticated: false 
      }),

      // Data fetching
      fetchUsers: async () => {
        await mockDelay();
        const { users } = get();
        return users;
      },

      fetchOrganizations: async () => {
        await mockDelay();
        const { organizations } = get();
        return organizations;
      },

      fetchMarketplaceItems: async (filters) => {
        await mockDelay();
        let { marketplaceItems } = get();

        // Apply filters
        if (filters) {
          if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            marketplaceItems = marketplaceItems.filter(item =>
              item.name.toLowerCase().includes(searchTerm) ||
              item.description.toLowerCase().includes(searchTerm) ||
              item.tags.some(tag => tag.toLowerCase().includes(searchTerm))
            );
          }

          if (filters.type && filters.type.length > 0) {
            marketplaceItems = marketplaceItems.filter(item => 
              filters.type!.includes(item.type)
            );
          }

          if (filters.categories && filters.categories.length > 0) {
            marketplaceItems = marketplaceItems.filter(item =>
              filters.categories!.some(cat => item.categories.includes(cat))
            );
          }

          if (filters.validation_status && filters.validation_status.length > 0) {
            marketplaceItems = marketplaceItems.filter(item =>
              filters.validation_status!.includes(item.validation_status)
            );
          }

          if (filters.price_min !== undefined) {
            marketplaceItems = marketplaceItems.filter(item => item.price >= filters.price_min!);
          }

          if (filters.price_max !== undefined) {
            marketplaceItems = marketplaceItems.filter(item => item.price <= filters.price_max!);
          }

          // Sorting
          if (filters.sort_by) {
            marketplaceItems.sort((a, b) => {
              let aValue, bValue;
              
              switch (filters.sort_by) {
                case 'name':
                  aValue = a.name.toLowerCase();
                  bValue = b.name.toLowerCase();
                  break;
                case 'price':
                  aValue = a.price;
                  bValue = b.price;
                  break;
                case 'rating':
                  aValue = a.rating;
                  bValue = b.rating;
                  break;
                case 'downloads':
                  aValue = a.downloads;
                  bValue = b.downloads;
                  break;
                case 'created_at':
                  aValue = new Date(a.created_at).getTime();
                  bValue = new Date(b.created_at).getTime();
                  break;
                default:
                  return 0;
              }

              if (typeof aValue === 'string' && typeof bValue === 'string') {
                return filters.sort_order === 'desc' 
                  ? bValue.localeCompare(aValue)
                  : aValue.localeCompare(bValue);
              } else {
                return filters.sort_order === 'desc' 
                  ? (bValue as number) - (aValue as number)
                  : (aValue as number) - (bValue as number);
              }
            });
          }
        }

        return { data: marketplaceItems };
      },

      fetchUserProjects: async (userId, filters) => {
        await mockDelay();
        let { projects } = get();
        
        projects = projects.filter(project => project.user_id === userId);

        if (filters) {
          if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            projects = projects.filter(project =>
              project.name.toLowerCase().includes(searchTerm) ||
              (project.description && project.description.toLowerCase().includes(searchTerm))
            );
          }

          if (filters.project_type && filters.project_type.length > 0) {
            projects = projects.filter(project => 
              filters.project_type!.includes(project.project_type)
            );
          }

          if (filters.status && filters.status.length > 0) {
            projects = projects.filter(project => 
              filters.status!.includes(project.status)
            );
          }

          if (filters.privacy && filters.privacy.length > 0) {
            projects = projects.filter(project => 
              filters.privacy!.includes(project.privacy)
            );
          }
        }

        return projects;
      },

      fetchOrganizationProjects: async (orgId, filters) => {
        await mockDelay();
        let { projects } = get();
        
        projects = projects.filter(project => project.organization_id === orgId);

        if (filters) {
          if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            projects = projects.filter(project =>
              project.name.toLowerCase().includes(searchTerm) ||
              (project.description && project.description.toLowerCase().includes(searchTerm))
            );
          }
        }

        return projects;
      },

      fetchValidations: async (userId) => {
        await mockDelay();
        const { validations } = get();
        return validations.filter(validation => validation.validator_id === userId);
      },

      fetchPurchases: async (userId) => {
        await mockDelay();
        const { purchases } = get();
        return purchases.filter(purchase => purchase.buyer_id === userId);
      },

      fetchReviews: async (itemId) => {
        await mockDelay();
        const { reviews } = get();
        return reviews.filter(review => review.item_id === itemId);
      },

      // CRUD operations
      createUser: async (userData) => {
        await mockDelay();
        const newUser: User = {
          id: generateId(),
          wallet_address: userData.wallet_address || '',
          name: userData.name || null,
          email: userData.email || null,
          avatar_url: userData.avatar_url || null,
          bio: userData.bio || null,
          reputation_score: 0,
          verification_status: 'unverified',
          onboarded: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          profile: {}
        };

        set(state => ({
          users: [...state.users, newUser]
        }));

        return newUser;
      },

      updateUser: async (id, updates) => {
        await mockDelay();
        const updatedUser = {
          ...updates,
          updated_at: new Date().toISOString(),
        };

        set(state => ({
          users: state.users.map(user =>
            user.id === id ? { ...user, ...updatedUser } : user
          )
        }));

        const { users } = get();
        return users.find(user => user.id === id)!;
      },

      createMarketplaceItem: async (itemData) => {
        await mockDelay();
        const newItem: MarketplaceItem = {
          id: generateId(),
          name: itemData.name || '',
          description: itemData.description || '',
          slug: itemData.slug || itemData.name?.toLowerCase().replace(/\s+/g, '-') || '',
          type: itemData.type || 'tool',
          provider_id: itemData.provider_id || '',
          organization_id: itemData.organization_id || '',
          price: itemData.price || 0,
          currency: itemData.currency || 'USD',
          status: itemData.status || 'draft',
          validation_status: itemData.validation_status || 'unvalidated',
          validator_id: null,
          validation_date: null,
          downloads: 0,
          rating: 0,
          reviews_count: 0,
          tags: itemData.tags || [],
          categories: itemData.categories || [],
          metadata: itemData.metadata || {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        set(state => ({
          marketplaceItems: [...state.marketplaceItems, newItem]
        }));

        return newItem;
      },

      updateMarketplaceItem: async (id, updates) => {
        await mockDelay();
        const updatedItem = {
          ...updates,
          updated_at: new Date().toISOString(),
        };

        set(state => ({
          marketplaceItems: state.marketplaceItems.map(item =>
            item.id === id ? { ...item, ...updatedItem } : item
          )
        }));

        const { marketplaceItems } = get();
        return marketplaceItems.find(item => item.id === id)!;
      },

      deleteMarketplaceItem: async (id) => {
        await mockDelay();
        set(state => ({
          marketplaceItems: state.marketplaceItems.filter(item => item.id !== id)
        }));
      },

      createProject: async (projectData) => {
        await mockDelay();
        const newProject: Project = {
          id: generateId(),
          name: projectData.name || '',
          description: projectData.description || null,
          user_id: projectData.user_id || '',
          organization_id: projectData.organization_id || '',
          project_type: projectData.project_type || 'workflow',
          status: projectData.status || 'development',
          privacy: projectData.privacy || 'private',
          components: projectData.components || [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        set(state => ({
          projects: [...state.projects, newProject]
        }));

        return newProject;
      },

      updateProject: async (id, updates) => {
        await mockDelay();
        const updatedProject = {
          ...updates,
          updated_at: new Date().toISOString(),
        };

        set(state => ({
          projects: state.projects.map(project =>
            project.id === id ? { ...project, ...updatedProject } : project
          )
        }));

        const { projects } = get();
        return projects.find(project => project.id === id)!;
      },

      deleteProject: async (id) => {
        await mockDelay();
        set(state => ({
          projects: state.projects.filter(project => project.id !== id)
        }));
      },

      // Business actions
      purchaseItem: async (itemId, organizationId) => {
        await mockDelay();
        const { marketplaceItems, currentUser } = get();
        const item = marketplaceItems.find(i => i.id === itemId);
        
        if (!item || !currentUser) {
          throw new Error('Item or user not found');
        }

        const purchase: Purchase = {
          id: generateId(),
          buyer_id: currentUser.id,
          buyer_organization_id: organizationId,
          item_id: itemId,
          amount: item.price,
          currency: item.currency,
          status: 'completed',
          transaction_hash: `0x${Math.random().toString(16).substr(2, 64)}`,
          purchased_at: new Date().toISOString(),
        };

        // Update item downloads
        set(state => ({
          purchases: [...state.purchases, purchase],
          marketplaceItems: state.marketplaceItems.map(item =>
            item.id === itemId 
              ? { ...item, downloads: item.downloads + 1 }
              : item
          )
        }));

        return purchase;
      },

      requestValidation: async (itemId, validationType) => {
        await mockDelay();
        const { currentUser } = get();
        
        if (!currentUser) {
          throw new Error('User not found');
        }

        const validation: Validation = {
          id: generateId(),
          item_id: itemId,
          validator_id: currentUser.id,
          status: 'pending',
          validation_type: validationType as any,
          criteria: [],
          score: 0,
          report: '',
          completed_at: null,
          created_at: new Date().toISOString(),
        };

        set(state => ({
          validations: [...state.validations, validation]
        }));

        return validation;
      },

      submitValidation: async (validationId, report, score) => {
        await mockDelay();
        
        set(state => ({
          validations: state.validations.map(validation =>
            validation.id === validationId
              ? {
                  ...validation,
                  status: score >= 3 ? 'certified' : 'rejected',
                  report,
                  score,
                  completed_at: new Date().toISOString(),
                }
              : validation
          )
        }));

        const { validations } = get();
        return validations.find(v => v.id === validationId)!;
      },

      createOrganization: async (orgData) => {
        await mockDelay();
        const { currentUser } = get();
        
        if (!currentUser) {
          throw new Error('User not authenticated');
        }

        const newOrg: Organization = {
          id: generateId(),
          name: orgData.name || '',
          description: orgData.description || null,
          owner_id: currentUser.id,
          avatar_url: orgData.avatar_url || null,
          website: orgData.website || null,
          verification_status: 'unverified',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const newMember: OrganizationMember = {
          id: generateId(),
          organization_id: newOrg.id,
          user_id: currentUser.id,
          role: 'owner',
          joined_at: new Date().toISOString(),
        };

        set(state => ({
          organizations: [...state.organizations, newOrg],
          organizationMembers: [...state.organizationMembers, newMember]
        }));

        return newOrg;
      },

      updateOrganization: async (id, updates) => {
        await mockDelay();
        const updatedOrg = {
          ...updates,
          updated_at: new Date().toISOString(),
        };

        set(state => ({
          organizations: state.organizations.map(org =>
            org.id === id ? { ...org, ...updatedOrg } : org
          )
        }));

        const { organizations } = get();
        return organizations.find(org => org.id === id)!;
      },

      // Utility actions
      setError: (type, error) => set(state => ({ 
        errors: { ...state.errors, [type]: error } 
      })),

      setLoading: (type, loading) => set(state => ({ 
        loading: { ...state.loading, [type]: loading } 
      })),

      getDashboardStats: (userId) => {
        const { marketplaceItems, projects, purchases, validations } = get();
        
        const userItems = marketplaceItems.filter(item => item.provider_id === userId);
        const userProjects = projects.filter(project => project.user_id === userId);
        const userPurchases = purchases.filter(purchase => purchase.buyer_id === userId);
        const userValidations = validations.filter(validation => validation.validator_id === userId);
        const userSales = purchases.filter(purchase => 
          marketplaceItems.find(item => 
            item.id === purchase.item_id && item.provider_id === userId
          )
        );

        return {
          total_items: userItems.length,
          total_projects: userProjects.length,
          total_purchases: userPurchases.length,
          total_sales: userSales.length,
          total_revenue: userSales.reduce((total, sale) => total + sale.amount, 0),
          monthly_downloads: userItems.reduce((total, item) => total + item.downloads, 0),
          total_validations: userValidations.length,
        };
      },

      // Search and filter utilities
      searchMarketplace: (query, filters) => {
        const { marketplaceItems } = get();
        const searchTerm = query.toLowerCase();
        
        let filteredItems = marketplaceItems.filter(item =>
          item.name.toLowerCase().includes(searchTerm) ||
          item.description.toLowerCase().includes(searchTerm) ||
          item.tags.some(tag => tag.toLowerCase().includes(searchTerm))
        );

        if (filters) {
          if (filters.type && filters.type.length > 0) {
            filteredItems = filteredItems.filter(item => 
              filters.type!.includes(item.type)
            );
          }
        }

        return filteredItems;
      },

      getItemsByProvider: (providerId) => {
        const { marketplaceItems } = get();
        return marketplaceItems.filter(item => item.provider_id === providerId);
      },

      getItemsByType: (type) => {
        const { marketplaceItems } = get();
        return marketplaceItems.filter(item => item.type === type);
      },

      getUserOrganizations: (userId) => {
        const { organizations, organizationMembers } = get();
        const userMemberships = organizationMembers.filter(member => member.user_id === userId);
        return organizations.filter(org => 
          userMemberships.some(membership => membership.organization_id === org.id)
        );
      },

      getOrganizationMembers: (orgId) => {
        const { users, organizationMembers } = get();
        const members = organizationMembers.filter(member => member.organization_id === orgId);
        return members.map(member => ({
          user: users.find(user => user.id === member.user_id)!,
          member
        })).filter(item => item.user);
      },

      // Onboarding
      completeOnboarding: async (walletAddress, userData, orgData) => {
        await mockDelay();
        
        // Create user if it doesn't exist
        let user = get().users.find(u => u.wallet_address === walletAddress);
        if (!user) {
          user = await get().createUser({ wallet_address: walletAddress, ...userData });
        }

        // Update user with profile data and mark as onboarded
        const updatedUserData = {
          ...userData,
          onboarded: true,
          updated_at: new Date().toISOString()
        };

        user = await get().updateUser(user.id, updatedUserData);
        
        // Set current user so organization creation works
        get().setCurrentUser(user);

        // Create organization if provided
        if (orgData) {
          const organization = await get().createOrganization(orgData);
          get().setCurrentOrganization(organization);
        }

        return user;
      },
    }),
    {
      name: 'haithe-app-store',
      partialize: (state) => ({
        currentUser: state.currentUser,
        currentOrganization: state.currentOrganization,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
); 