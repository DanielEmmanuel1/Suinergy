import { create } from 'zustand'

interface AppState {
    // UI State
    sidebarCollapsed: boolean
    viewMode: 'table' | 'grid'
    
    // Strategy State
    selectedStrategy: string | null
    
    // Modal State
    depositModalOpen: boolean
    withdrawModalOpen: boolean
    simulationModalOpen: boolean
    
    // Actions
    toggleSidebar: () => void
    setViewMode: (mode: 'table' | 'grid') => void
    setSelectedStrategy: (strategyId: string | null) => void
    setDepositModalOpen: (open: boolean) => void
    setWithdrawModalOpen: (open: boolean) => void
    setSimulationModalOpen: (open: boolean) => void
}

export const useAppStore = create<AppState>((set) => ({
    sidebarCollapsed: false,
    viewMode: 'table',
    selectedStrategy: null,
    depositModalOpen: false,
    withdrawModalOpen: false,
    simulationModalOpen: false,
    
    toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
    setViewMode: (mode) => set({ viewMode: mode }),
    setSelectedStrategy: (strategyId) => set({ selectedStrategy: strategyId }),
    setDepositModalOpen: (open) => set({ depositModalOpen: open }),
    setWithdrawModalOpen: (open) => set({ withdrawModalOpen: open }),
    setSimulationModalOpen: (open) => set({ simulationModalOpen: open }),
}))

