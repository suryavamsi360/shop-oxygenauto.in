import { XIcon } from "lucide-react";
import { useState } from "react";

import {
  useAddressStore,
  type Address,
  type AddressInput,
} from "../../store/addressStore";

interface AddressModalProps {
  setShowAddressModal: React.Dispatch<React.SetStateAction<boolean>>;
  addressToEdit?: Address | null;
}

const STATES = [
  "Delhi",
  "Uttar Pradesh",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Orissa",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
  "Others",
] as const;

const AddressModal = ({
  setShowAddressModal,
  addressToEdit = null,
}: AddressModalProps) => {
  const addAddress = useAddressStore((state) => state.addAddress);
  const updateAddress = useAddressStore((state) => state.updateAddress);
  const [formError, setFormError] = useState("");

  const [address, setAddress] = useState<AddressInput>({
    name: addressToEdit?.name || "",
    mobile: addressToEdit?.mobile || "",
    address1: addressToEdit?.address1 || "",
    address2: addressToEdit?.address2 || "",
    city: addressToEdit?.city || "",
    state: addressToEdit?.state || "",
    pincode: addressToEdit?.pincode || "",
    landmark: addressToEdit?.landmark || "",
    isDefault: addressToEdit?.isDefault || false,
  });

  const handleAddressChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;

    if (name === "mobile" || name === "pincode") {
      const digitsOnly = value.replace(/\D/g, "");
      setAddress((prev) => ({
        ...prev,
        [name]: digitsOnly,
      }));
      return;
    }

    setAddress((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const sanitizedAddress: AddressInput = {
      ...address,
      name: address.name.trim(),
      mobile: address.mobile.trim(),
      address1: address.address1.trim(),
      address2: address.address2?.trim() || "",
      city: address.city.trim(),
      state: address.state.trim(),
      pincode: address.pincode.trim(),
      landmark: address.landmark?.trim() || "",
    };

    if (!/^\d{10}$/.test(sanitizedAddress.mobile)) {
      setFormError("Please enter a valid 10-digit mobile number.");
      return;
    }

    if (!/^\d{6}$/.test(sanitizedAddress.pincode)) {
      setFormError("Please enter a valid 6-digit pincode.");
      return;
    }

    setFormError("");

    try {
      if (addressToEdit) {
        await updateAddress({ ...sanitizedAddress, id: addressToEdit.id });
      } else {
        await addAddress(sanitizedAddress);
      }
      setShowAddressModal(false);
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Unable to save address.",
      );
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="fixed inset-0 z-50 flex h-screen items-center justify-center bg-white/60 backdrop-blur"
    >
      <div className="mx-6 flex w-full max-w-sm flex-col gap-5 text-slate-700">
        <h2 className="text-3xl">
          {addressToEdit ? "Edit" : "Add New"}{" "}
          <span className="font-semibold">Address</span>
        </h2>

        <input
          name="name"
          value={address.name}
          onChange={handleAddressChange}
          className="w-full rounded border border-slate-200 p-2 px-4 outline-none"
          type="text"
          placeholder="Enter your name"
          required
        />

        <input
          name="mobile"
          value={address.mobile}
          onChange={handleAddressChange}
          className="w-full rounded border border-slate-200 p-2 px-4 outline-none"
          type="text"
          placeholder="Mobile number"
          required
        />

        <input
          name="address1"
          value={address.address1}
          onChange={handleAddressChange}
          className="w-full rounded border border-slate-200 p-2 px-4 outline-none"
          type="text"
          placeholder="Address line 1"
          required
        />

        <div className="flex gap-4">
          <input
            name="city"
            value={address.city}
            onChange={handleAddressChange}
            className="w-full rounded border border-slate-200 p-2 px-4 outline-none"
            type="text"
            placeholder="City"
            required
          />

          <select
            name="state"
            value={address.state}
            onChange={handleAddressChange}
            className="w-full rounded border border-slate-200 p-2 px-4 outline-none"
            required
          >
            <option value="" disabled>
              Select state
            </option>
            {STATES.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-4">
          <input
            name="pincode"
            value={address.pincode}
            onChange={handleAddressChange}
            className="w-full rounded border border-slate-200 p-2 px-4 outline-none"
            type="text"
            placeholder="Pincode"
            required
          />

          <input
            name="address2"
            value={address.address2 ?? ""}
            onChange={handleAddressChange}
            className="w-full rounded border border-slate-200 p-2 px-4 outline-none"
            type="text"
            placeholder="Address line 2"
          />
        </div>

        <input
          name="landmark"
          value={address.landmark ?? ""}
          onChange={handleAddressChange}
          className="w-full rounded border border-slate-200 p-2 px-4 outline-none"
          type="text"
          placeholder="Landmark"
        />

        <button className="rounded-md bg-slate-800 py-2.5 text-sm font-medium text-white transition-all hover:bg-slate-900 active:scale-95">
          {addressToEdit ? "UPDATE ADDRESS" : "SAVE ADDRESS"}
        </button>

        {formError && <p className="text-sm text-red-600">{formError}</p>}
      </div>

      <XIcon
        size={30}
        className="absolute top-5 right-5 cursor-pointer text-slate-500 hover:text-slate-700"
        onClick={() => setShowAddressModal(false)}
      />
    </form>
  );
};

export default AddressModal;
