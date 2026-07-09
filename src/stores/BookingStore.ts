import { createSelectorFunctions } from 'auto-zustand-selectors-hook';
import { create } from 'zustand';

interface BookingState {
  step: 1 | 2 | 3 | 4;
  date: Date | null;
  guests: { adults: number; children: number };
  departureTime: string | null;
  pickupLocation: string | null;
  packageType: 'basic' | 'premium' | null;
  agreedToTerms: boolean;
}

interface BookingActions {
  setStep: (step: 1 | 2 | 3 | 4) => void;
  setDate: (date: Date | null) => void;
  setGuests: (guests: { adults: number; children: number }) => void;
  setDepartureTime: (v: string | null) => void;
  setPickupLocation: (v: string | null) => void;
  setPackageType: (v: 'basic' | 'premium' | null) => void;
  setAgreedToTerms: (v: boolean) => void;
  reset: () => void;
}

const initialState: BookingState = {
  step: 1,
  date: null,
  guests: { adults: 0, children: 0 },
  departureTime: null,
  pickupLocation: null,
  packageType: null,
  agreedToTerms: false,
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
  reset: () => set(initialState),
}));

export const useBookingStore = createSelectorFunctions(useBaseBookingStore);
