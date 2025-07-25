import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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