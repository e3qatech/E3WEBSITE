import { create } from 'zustand'

export type ThemeMode = 'dark' | 'light'

interface B2BThemeState {
  theme: ThemeMode
  setTheme: (theme: ThemeMode) => void
  toggleTheme: () => void
}

export const useB2BTheme = create<B2BThemeState>((set) => ({
  theme: 'dark',
  setTheme: (theme) => set({ theme }),
  toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
}))


interface B2BFilterState {
  serviceFilter: string | null
  categoryFilter: string | null
  clientFilter: string | null
  venueFilter: string | null
  yearFilter: number | null
  setServiceFilter: (val: string | null) => void
  setCategoryFilter: (val: string | null) => void
  setClientFilter: (val: string | null) => void
  setVenueFilter: (val: string | null) => void
  setYearFilter: (val: number | null) => void
  resetFilters: () => void
}

export const useB2BFilters = create<B2BFilterState>((set) => ({
  serviceFilter: null,
  categoryFilter: null,
  clientFilter: null,
  venueFilter: null,
  yearFilter: null,
  setServiceFilter: (val) => set({ serviceFilter: val }),
  setCategoryFilter: (val) => set({ categoryFilter: val }),
  setClientFilter: (val) => set({ clientFilter: val }),
  setVenueFilter: (val) => set({ venueFilter: val }),
  setYearFilter: (val) => set({ yearFilter: val }),
  resetFilters: () => set({
    serviceFilter: null,
    categoryFilter: null,
    clientFilter: null,
    venueFilter: null,
    yearFilter: null
  }),
}))


interface B2BRFPState {
  inquiryType: string
  currentStep: number
  formData: any
  setInquiryType: (type: string) => void
  setCurrentStep: (step: number) => void
  updateFormData: (data: any) => void
  resetForm: () => void
}

export const useB2BRFP = create<B2BRFPState>((set) => ({
  inquiryType: 'General Business Inquiry',
  currentStep: 1,
  formData: {},
  setInquiryType: (type) => set({ inquiryType: type }),
  setCurrentStep: (step) => set({ currentStep: step }),
  updateFormData: (data) => set((state) => ({ formData: { ...state.formData, ...data } })),
  resetForm: () => set({ inquiryType: 'General Business Inquiry', currentStep: 1, formData: {} }),
}))
