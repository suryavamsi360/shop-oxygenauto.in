import { XIcon } from "lucide-react";
import { useState } from "react";

import { useAddressStore, type Address } from "../../store/addressStore";

interface AddressModalProps {
  setShowAddressModal: React.Dispatch<React.SetStateAction<boolean>>;
}

const AddressModal = ({ setShowAddressModal }: AddressModalProps) => {
  const addAddress = useAddressStore((state) => state.addAddress);

  const [address, setAddress] = useState<Address>({
    id: Date.now(),
    name: "",
    mobile: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    pincode: "",
    landmark: "",
    isDefault: false,
  });

  const handleAddressChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setAddress((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    addAddress(address);

    setShowAddressModal(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="fixed inset-0 z-50 flex h-screen items-center justify-center bg-white/60 backdrop-blur"
    >
      <div className="mx-6 flex w-full max-w-sm flex-col gap-5 text-slate-700">
        <h2 className="text-3xl">
          Add New <span className="font-semibold">Address</span>
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

          <input
            name="state"
            value={address.state}
            onChange={handleAddressChange}
            className="w-full rounded border border-slate-200 p-2 px-4 outline-none"
            type="text"
            placeholder="State"
            required
          />
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
          SAVE ADDRESS
        </button>
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
