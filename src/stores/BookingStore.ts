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
  adultUnitId: string | null;
  childUnitId: string | null;
  sessionId: string | null;
}

export interface CustomPickupLocation {
  placeId: string | 'manual';
  name: string;
  formattedAddress: string;
  lat: number | null;
  lng: number | null;
  distanceMeter: number;
  surcharge: number;
}

interface BookingState {
  step: 1 | 2 | 3 | 4;
  date: Date | null;
  guests: { adults: number; children: number };
  departureTime: string | null;
  pickupLocation: string | null;
  packageType: string | null;
  agreedToTerms: boolean;
  sessionPricing: SessionPricing;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  contactMessenger: string;
  contactMessengerHandle: string;
  pickupType: 'predefined' | 'custom';
  customPickup: CustomPickupLocation | null;
  bookingId: string | null;
}

interface BookingActions {
  setStep: (step: 1 | 2 | 3 | 4) => void;
  setDate: (date: Date | null) => void;
  setGuests: (guests: { adults: number; children: number }) => void;
  setDepartureTime: (v: string | null) => void;
  setPickupLocation: (v: string | null) => void;
  setPackageType: (v: string | null) => void;
  setAgreedToTerms: (v: boolean) => void;
  setSessionPricing: (pricing: Partial<SessionPricing>) => void;
  setContactName: (v: string) => void;
  setContactPhone: (v: string) => void;
  setContactEmail: (v: string) => void;
  setContactMessenger: (v: string) => void;
  setContactMessengerHandle: (v: string) => void;
  setPickupType: (v: 'predefined' | 'custom') => void;
  setCustomPickup: (v: CustomPickupLocation | null) => void;
  setBookingId: (id: string | null) => void;
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
  adultUnitId: null,
  childUnitId: null,
  sessionId: null,
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
  pickupType: 'predefined',
  customPickup: null,
  bookingId: null,
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
  setPickupType: (pickupType) => set({ pickupType }),
  setCustomPickup: (customPickup) => set({ customPickup }),
  setBookingId: (bookingId) => set({ bookingId }),
  reset: () => set(initialState),
}));

export const useBookingStore = createSelectorFunctions(useBaseBookingStore);
