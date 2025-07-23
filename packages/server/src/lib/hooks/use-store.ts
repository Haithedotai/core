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
    }),
    {
      name: 'haithe-store', // unique name for localStorage
      partialize: (state) => ({
        selectedOrganizationId: state.selectedOrganizationId,
        onboardingData: state.onboardingData,
      }),
    }
  )
)