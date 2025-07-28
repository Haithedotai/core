import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface MarketplaceFilters {
  category?: string[];
  priceRange?: {
    min: number;
    max: number;
  };
  sortBy?: 'recent' | 'price_low' | 'price_high';
}

type Store = {
  selectedOrganizationId: number
  setSelectedOrganizationId: (organizationId: number) => void
  
  // Onboarding temporary storage
  onboardingData: {
    orgName: string
    isCompleted: boolean
  }
  setOnboardingOrgName: (name: string) => void
  completeOnboarding: () => void
  clearOnboardingData: () => void

  // Local profile data (persisted)
  profile: {
    displayName: string
    about: string
    profilePicture: string | null
  }
  setProfileDisplayName: (name: string) => void
  setProfileAbout: (about: string) => void
  setProfilePicture: (picture: string | null) => void
  updateProfile: (updates: Partial<Store['profile']>) => void
  clearProfile: () => void
}

export const useStore = create<Store>()(
  persist(
    (set) => ({
      selectedOrganizationId: 0,
      setSelectedOrganizationId: (organizationId: number) => 
        set({ selectedOrganizationId: organizationId }),

      // Onboarding state
      onboardingData: {
        orgName: '',
        isCompleted: false,
      },
      setOnboardingOrgName: (name: string) => 
        set((state) => ({
          onboardingData: { ...state.onboardingData, orgName: name }
        })),
      completeOnboarding: () => 
        set((state) => ({
          onboardingData: { ...state.onboardingData, isCompleted: true }
        })),
      clearOnboardingData: () => 
        set({
          onboardingData: { orgName: '', isCompleted: false }
        }),

      // Profile state
      profile: {
        displayName: '',
        about: '',
        profilePicture: null,
      },
      setProfileDisplayName: (name: string) =>
        set((state) => ({
          profile: { ...state.profile, displayName: name }
        })),
      setProfileAbout: (about: string) =>
        set((state) => ({
          profile: { ...state.profile, about: about }
        })),
      setProfilePicture: (picture: string | null) =>
        set((state) => ({
          profile: { ...state.profile, profilePicture: picture }
        })),
      updateProfile: (updates: Partial<Store['profile']>) =>
        set((state) => ({
          profile: { ...state.profile, ...updates }
        })),
      clearProfile: () =>
        set({
          profile: { displayName: '', about: '', profilePicture: null }
        }),
    }),
    {
      name: 'haithe-store', // unique name for localStorage
      partialize: (state) => ({
        selectedOrganizationId: state.selectedOrganizationId,
        onboardingData: state.onboardingData,
        profile: state.profile,
      }),
    }
  )
)

// Marketplace Store
interface MarketplaceStore {
  // State
  filters: MarketplaceFilters
  searchQuery: string
  viewMode: 'grid' | 'list'
  favorites: string[]
  
  // Actions
  setFilters: (filters: MarketplaceFilters) => void
  setSearchQuery: (query: string) => void
  setViewMode: (mode: 'grid' | 'list') => void
  toggleFavorite: (itemId: string) => void
  clearFilters: () => void
  updateFilters: (updates: Partial<MarketplaceFilters>) => void
}

export const useMarketplaceStore = create<MarketplaceStore>()(
  persist(
    (set, get) => ({
      // Initial state
      filters: {},
      searchQuery: '',
      viewMode: 'grid',
      favorites: [],

      // Actions
      setFilters: (filters: MarketplaceFilters) =>
        set({ filters }),

      setSearchQuery: (query: string) =>
        set({ searchQuery: query }),

      setViewMode: (mode: 'grid' | 'list') =>
        set({ viewMode: mode }),

      toggleFavorite: (itemId: string) =>
        set((state) => {
          const newFavorites = state.favorites.includes(itemId)
            ? state.favorites.filter(id => id !== itemId)
            : [...state.favorites, itemId]
          return { favorites: newFavorites }
        }),

      clearFilters: () =>
        set({ 
          filters: {},
          searchQuery: ''
        }),

      updateFilters: (updates: Partial<MarketplaceFilters>) =>
        set((state) => ({
          filters: { ...state.filters, ...updates }
        })),
    }),
    {
      name: 'haithe-marketplace-store',
      partialize: (state) => ({
        filters: state.filters,
        searchQuery: state.searchQuery,
        viewMode: state.viewMode,
        favorites: state.favorites,
      }),
    }
  )
)