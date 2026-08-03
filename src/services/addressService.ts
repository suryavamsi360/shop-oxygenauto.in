import { authenticatedFetch } from "./authenticatedApi";

export interface Address {
  id: string;
  name: string;
  mobile: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  pincode: string;
  landmark: string;
  isDefault: boolean;
}

export type AddressInput = Omit<Address, "id">;

const normalizeAddress = (address: Partial<Address>): Address => ({
  id: String(address.id || ""),
  name: String(address.name || ""),
  mobile: String(address.mobile || ""),
  address1: String(address.address1 || ""),
  address2: String(address.address2 || ""),
  city: String(address.city || ""),
  state: String(address.state || ""),
  pincode: String(address.pincode || ""),
  landmark: String(address.landmark || ""),
  isDefault: address.isDefault === true,
});

export const fetchAddresses = async (): Promise<Address[]> => {
  const response = await authenticatedFetch("/account/addresses");
  const payload = (await response.json()) as { addresses?: Address[] };
  return Array.isArray(payload.addresses)
    ? payload.addresses.map(normalizeAddress)
    : [];
};

export const createAddress = async (input: AddressInput): Promise<Address> => {
  const response = await authenticatedFetch("/account/addresses", {
    method: "POST",
    body: JSON.stringify(input),
  });
  const payload = (await response.json()) as { address: Address };
  return normalizeAddress(payload.address);
};

export const updateAddress = async (address: Address): Promise<Address> => {
  const response = await authenticatedFetch(
    `/account/addresses/${encodeURIComponent(address.id)}`,
    { method: "PATCH", body: JSON.stringify(address) },
  );
  const payload = (await response.json()) as { address: Address };
  return normalizeAddress(payload.address);
};

export const deleteAddress = async (addressId: string): Promise<void> => {
  await authenticatedFetch(
    `/account/addresses/${encodeURIComponent(addressId)}`,
    { method: "DELETE" },
  );
};