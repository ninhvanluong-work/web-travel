import { createSelectorFunctions } from 'auto-zustand-selectors-hook';
import { create } from 'zustand';

interface SessionPricing {
  adultPrice: number;
  childPrice: number;
  adultNote: string | null;
  childNote: string | null;
  adultMaxSlots: number;
  childMaxSlots: number;
  isAdultAvailable: boolean;
  isChildAvailable: boolean;
  isLoadingSession: boolean;
  sessionError: string | null;
}

interface BookingState {
  step: 1 | 2 | 3 | 4;
  date: Date | null;
  guests: { adults: number; children: number };
  departureTime: string | null;
  pickupLocation: string | null;
  packageType: 'basic' | 'premium' | null;
  agreedToTerms: boolean;
  sessionPricing: SessionPricing;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  contactMessenger: string;
  contactMessengerHandle: string;
}

interface BookingActions {
  setStep: (step: 1 | 2 | 3 | 4) => void;
  setDate: (date: Date | null) => void;
  setGuests: (guests: { adults: number; children: number }) => void;
  setDepartureTime: (v: string | null) => void;
  setPickupLocation: (v: string | null) => void;
  setPackageType: (v: 'basic' | 'premium' | null) => void;
  setAgreedToTerms: (v: boolean) => void;
  setSessionPricing: (pricing: Partial<SessionPricing>) => void;
  setContactName: (v: string) => void;
  setContactPhone: (v: string) => void;
  setContactEmail: (v: string) => void;
  setContactMessenger: (v: string) => void;
  setContactMessengerHandle: (v: string) => void;
  reset: () => void;
}

const initialSessionPricing: SessionPricing = {
  adultPrice: 0,
  childPrice: 0,
  adultNote: null,
  childNote: null,
  adultMaxSlots: 0,
  childMaxSlots: 0,
  isAdultAvailable: false,
  isChildAvailable: false,
  isLoadingSession: false,
  sessionError: null,
};

const initialState: BookingState = {
  step: 1,
  date: null,
  guests: { adults: 0, children: 0 },
  departureTime: null,
  pickupLocation: null,
  packageType: null,
  agreedToTerms: false,
  sessionPricing: initialSessionPricing,
  contactName: '',
  contactPhone: '',
  contactEmail: '',
  contactMessenger: '',
  contactMessengerHandle: '',
};

const useBaseBookingStore = create<BookingState & BookingActions>()((set) => ({
  ...initialState,
  setStep: (step) => set({ step }),
  setDate: (date) => set({ date }),
  setGuests: (guests) => set({ guests }),
  setDepartureTime: (departureTime) => set({ departureTime }),
  setPickupLocation: (pickupLocation) => set({ pickupLocation }),
  setPackageType: (packageType) => set({ packageType }),
  setAgreedToTerms: (agreedToTerms) => set({ agreedToTerms }),
  setSessionPricing: (pricing) => set((state) => ({ sessionPricing: { ...state.sessionPricing, ...pricing } })),
  setContactName: (contactName) => set({ contactName }),
  setContactPhone: (contactPhone) => set({ contactPhone }),
  setContactEmail: (contactEmail) => set({ contactEmail }),
  setContactMessenger: (contactMessenger) => set({ contactMessenger }),
  setContactMessengerHandle: (contactMessengerHandle) => set({ contactMessengerHandle }),
  reset: () => set(initialState),
}));

export const useBookingStore = createSelectorFunctions(useBaseBookingStore);
