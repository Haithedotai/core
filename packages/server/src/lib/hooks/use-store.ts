import { create } from 'zustand'

type Store = {
  selectedOrganizationId: number
  setSelectedOrganizationId: (organizationId: number) => void
}

export const useStore = create<Store>()((set) => ({
  selectedOrganizationId: 0,
  setSelectedOrganizationId: (organizationId: number) => set({ selectedOrganizationId: organizationId }),
}))