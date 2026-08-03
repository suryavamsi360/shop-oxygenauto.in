import { create } from "zustand";

import {
  createAddress as createAddressRequest,
  deleteAddress as deleteAddressRequest,
  fetchAddresses,
  updateAddress as updateAddressRequest,
  type Address,
  type AddressInput,
} from "../services/addressService";

export type { Address, AddressInput } from "../services/addressService";

interface AddressState {
  addresses: Address[];
  selectedAddressId: string | null;
  isLoading: boolean;
  error: string | null;
  loadAddresses: () => Promise<void>;
  addAddress: (address: AddressInput) => Promise<Address>;
  updateAddress: (address: Address) => Promise<void>;
  removeAddress: (id: string) => Promise<void>;
  selectAddress: (id: string) => void;
  clearSelectedAddress: () => void;
  reset: () => void;
}

const selectPreferredAddressId = (
  addresses: Address[],
  currentId: string | null,
) => {
  if (currentId && addresses.some((address) => address.id === currentId)) {
    return currentId;
  }
  return addresses.find((address) => address.isDefault)?.id || null;
};

export const useAddressStore = create<AddressState>((set, get) => ({
  addresses: [],
  selectedAddressId: null,
  isLoading: false,
  error: null,

  loadAddresses: async () => {
    set({ isLoading: true, error: null });
    try {
      const addresses = await fetchAddresses();
      set((state) => ({
        addresses,
        selectedAddressId: selectPreferredAddressId(
          addresses,
          state.selectedAddressId,
        ),
        isLoading: false,
      }));
    } catch (error) {
      set({
        isLoading: false,
        error:
          error instanceof Error ? error.message : "Unable to load addresses.",
      });
    }
  },

  addAddress: async (input) => {
    const address = await createAddressRequest(input);
    set((state) => ({
      addresses: address.isDefault
        ? [
            ...state.addresses.map((item) => ({
              ...item,
              isDefault: false,
            })),
            address,
          ]
        : [...state.addresses, address],
      selectedAddressId: address.id,
      error: null,
    }));
    return address;
  },

  updateAddress: async (input) => {
    const address = await updateAddressRequest(input);
    set((state) => ({
      addresses: state.addresses.map((item) =>
        item.id === address.id
          ? address
          : address.isDefault
            ? { ...item, isDefault: false }
            : item,
      ),
      error: null,
    }));
  },

  removeAddress: async (id) => {
    await deleteAddressRequest(id);
    const addresses = get().addresses.filter((address) => address.id !== id);
    set({
      addresses,
      selectedAddressId: selectPreferredAddressId(addresses, null),
      error: null,
    });
  },

  selectAddress: (id) => set({ selectedAddressId: id }),
  clearSelectedAddress: () => set({ selectedAddressId: null }),
  reset: () =>
    set({
      addresses: [],
      selectedAddressId: null,
      isLoading: false,
      error: null,
    }),
}));
