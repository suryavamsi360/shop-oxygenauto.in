import type { User } from "@supabase/supabase-js";
import {
  ChevronDown,
  LogOut,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
  UserRound,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import AddressModal from "./AddressModal";
import { useAddressStore, type Address } from "../../store/addressStore";

interface ProfileMenuProps {
  user: User;
  onSignOut: () => Promise<void>;
}

const ProfileMenu = ({ user, onSignOut }: ProfileMenuProps) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const addresses = useAddressStore((state) => state.addresses);
  const isLoading = useAddressStore((state) => state.isLoading);
  const error = useAddressStore((state) => state.error);
  const loadAddresses = useAddressStore((state) => state.loadAddresses);
  const [isOpen, setIsOpen] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addressToEdit, setAddressToEdit] = useState<Address | null>(null);
  const metadataPhone = String(user.user_metadata?.phone || "").trim();
  const phone = user.phone || (metadataPhone ? `+91${metadataPhone}` : "");

  useEffect(() => {
    if (isOpen) void loadAddresses();
  }, [isOpen, loadAddresses]);

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, []);

  const openAddressModal = (address: Address | null) => {
    setAddressToEdit(address);
    setShowAddressModal(true);
    setIsOpen(false);
  };

  return (
    <>
      <div ref={menuRef} className="relative">
        <button
          type="button"
          onClick={() => setIsOpen((open) => !open)}
          aria-expanded={isOpen}
          aria-haspopup="menu"
          className="flex min-h-11 items-center gap-2 rounded-md border border-[#B8D8C2] bg-[#E5F3EA] px-3 text-[#0D542B] transition hover:bg-[#D8EDDF]"
        >
          <UserRound size={18} className="shrink-0" />
          <span className="hidden max-w-32 truncate text-sm font-semibold lg:inline">
            {user.email || phone || "Account"}
          </span>
          <ChevronDown
            size={16}
            className={`transition ${isOpen ? "rotate-180" : ""}`}
          />
        </button>

        {isOpen && (
          <div
            role="menu"
            className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-[min(22rem,calc(100vw-2rem))] rounded-md border border-[#C9D0C8] bg-white p-4 text-left shadow-xl"
          >
            <div className="border-b border-[#E1E5DF] pb-3">
              <p className="font-display text-lg font-bold uppercase text-[#202522]">
                Manage profile
              </p>
              <div className="mt-3 space-y-2 text-sm text-[#566058]">
                <p className="flex items-center gap-2 break-all">
                  <Mail size={16} className="shrink-0 text-[#0D542B]" />
                  {user.email || "No email saved"}
                </p>
                <p className="flex items-center gap-2">
                  <Phone size={16} className="shrink-0 text-[#0D542B]" />
                  {phone || "No phone saved"}
                </p>
              </div>
            </div>

            <div className="py-3">
              <div className="mb-2 flex items-center justify-between">
                <p className="flex items-center gap-2 text-sm font-semibold text-[#202522]">
                  <MapPin size={16} className="text-[#0D542B]" />
                  Saved addresses
                </p>
                <button
                  type="button"
                  onClick={() => openAddressModal(null)}
                  title="Add address"
                  aria-label="Add address"
                  className="flex size-8 items-center justify-center rounded text-[#0D542B] hover:bg-[#E5F3EA]"
                >
                  <Plus size={18} />
                </button>
              </div>

              {isLoading ? (
                <p className="py-2 text-sm text-[#68706A]">
                  Loading addresses...
                </p>
              ) : addresses.length > 0 ? (
                <div className="max-h-48 space-y-2 overflow-y-auto">
                  {addresses.map((address) => (
                    <div
                      key={address.id}
                      className="flex items-start gap-2 rounded border border-[#E1E5DF] bg-[#F8F9F6] p-3"
                    >
                      <p className="min-w-0 flex-1 text-xs leading-5 text-[#566058]">
                        <span className="block font-semibold text-[#202522]">
                          {address.name}
                        </span>
                        {address.address1}, {address.city}, {address.state} -{" "}
                        {address.pincode}
                      </p>
                      <button
                        type="button"
                        onClick={() => openAddressModal(address)}
                        title="Edit address"
                        aria-label={`Edit address for ${address.name}`}
                        className="flex size-8 shrink-0 items-center justify-center rounded text-[#0D542B] hover:bg-[#E5F3EA]"
                      >
                        <Pencil size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-2 text-sm text-[#68706A]">
                  No saved addresses yet.
                </p>
              )}

              {error && <p className="mt-2 text-xs text-[#B42318]">{error}</p>}
            </div>

            <button
              type="button"
              onClick={() => void onSignOut()}
              className="flex min-h-10 w-full items-center justify-center gap-2 rounded-md border border-[#F1B7B2] text-sm font-semibold text-[#B42318] transition hover:bg-[#FDECEA]"
            >
              <LogOut size={17} />
              Log out
            </button>
          </div>
        )}
      </div>

      {showAddressModal && (
        <AddressModal
          setShowAddressModal={setShowAddressModal}
          addressToEdit={addressToEdit}
        />
      )}
    </>
  );
};

export default ProfileMenu;
