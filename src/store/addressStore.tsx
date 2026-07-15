import { create } from "zustand";

export interface Address {
  id: number;
  name: string;
  mobile: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  isDefault: boolean;
}

interface AddressState {
  addresses: Address[];
  selectedAddressId: number | null;

  addAddress: (address: Address) => void;
  updateAddress: (address: Address) => void;
  removeAddress: (id: number) => void;
  selectAddress: (id: number) => void;
}

const STORAGE_KEY = "oxygenauto-addresses";

const getStoredAddressState = (): Pick<
  AddressState,
  "addresses" | "selectedAddressId"
> => {
  if (typeof window === "undefined")
    return { addresses: [], selectedAddressId: null };

  try {
    const storedValue = window.localStorage.getItem(STORAGE_KEY);
    if (!storedValue) return { addresses: [], selectedAddressId: null };

    return JSON.parse(storedValue) as Pick<
      AddressState,
      "addresses" | "selectedAddressId"
    >;
  } catch {
    return { addresses: [], selectedAddressId: null };
  }
};

const persistAddressState = (
  state: Pick<AddressState, "addresses" | "selectedAddressId">,
) => {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
};

export const useAddressStore = create<AddressState>((set) => ({
  addresses: getStoredAddressState().addresses,
  selectedAddressId: getStoredAddressState().selectedAddressId,

  addAddress: (address) =>
    set((state) => {
      const nextState = {
        addresses: [...state.addresses, address],
        selectedAddressId: state.selectedAddressId,
      };
      persistAddressState(nextState);
      return nextState;
    }),

  updateAddress: (address) =>
    set((state) => {
      const nextState = {
        addresses: state.addresses.map((a) =>
          a.id === address.id ? address : a,
        ),
        selectedAddressId: state.selectedAddressId,
      };
      persistAddressState(nextState);
      return nextState;
    }),

  removeAddress: (id) =>
    set((state) => {
      const nextState = {
        addresses: state.addresses.filter((a) => a.id !== id),
        selectedAddressId:
          state.selectedAddressId === id ? null : state.selectedAddressId,
      };
      persistAddressState(nextState);
      return nextState;
    }),

  selectAddress: (id) =>
    set((state) => {
      const nextState = {
        addresses: state.addresses,
        selectedAddressId: id,
      };
      persistAddressState(nextState);
      return nextState;
    }),
}));
