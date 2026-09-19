'use client';

import { useState } from 'react';
import { redirect } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, Edit, MapPin, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { accountApi } from '@/lib/api';

const emptyForm = {
  firstName: '',
  lastName: '',
  phone: '',
  address1: '',
  address2: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'MA',
  isDefault: false,
};

const countries = [
  { code: 'MA', name: 'Morocco' },
  { code: 'FR', name: 'France' },
  { code: 'ES', name: 'Spain' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'SA', name: 'Saudi Arabia' },
  { code: 'US', name: 'United States' },
];

export default function AddressesPage() {
  const { data: session, status } = useSession();
  if (status === 'unauthenticated') redirect('/login');

  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const { data: addresses, isLoading } = useQuery({
    queryKey: ['addresses'],
    queryFn: accountApi.getAddresses,
    enabled: !!session,
  });

  const items = (addresses as any) || [];

  const createMutation = useMutation({
    mutationFn: () => accountApi.createAddress(form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      setShowForm(false);
      setForm(emptyForm);
      toast.success('Address added');
    },
    onError: () => toast.error('Failed to add address'),
  });

  const updateMutation = useMutation({
    mutationFn: () => accountApi.updateAddress(editId!, form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      setEditId(null);
      setShowForm(false);
      setForm(emptyForm);
      toast.success('Address updated');
    },
    onError: () => toast.error('Failed to update address'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => accountApi.deleteAddress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      toast.success('Address removed');
    },
  });

  const setDefaultMutation = useMutation({
    mutationFn: (id: string) => accountApi.setDefaultAddress(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['addresses'] }),
  });

  const startEdit = (address: any) => {
    setEditId(address.id);
    setForm({
      firstName: address.firstName || '',
      lastName: address.lastName || '',
      phone: address.phone || '',
      address1: address.address1 || '',
      address2: address.address2 || '',
      city: address.city || '',
      state: address.state || '',
      postalCode: address.postalCode || '',
      country: address.country || 'MA',
      isDefault: address.isDefault || false,
    });
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (editId) updateMutation.mutate();
    else createMutation.mutate();
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="surface-shell p-6 sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#ECE6D9] pb-5">
        <div>
          <p className="section-eyebrow">Addresses</p>
          <h2 className="font-heading text-[clamp(2.2rem,4vw,3.4rem)] leading-[0.98] tracking-[-0.05em] text-[#1E2519]">
            Delivery details, curated and ready.
          </h2>
        </div>

        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditId(null);
            setForm(emptyForm);
          }}
          className="btn-gold"
        >
          <Plus className="h-4 w-4" />
          Add address
        </button>
      </div>

      {showForm && (
        <div className="mt-6 surface-panel p-6">
          <h3 className="font-heading text-[1.8rem] leading-none tracking-[-0.05em] text-[#1E2519]">
            {editId ? 'Edit address' : 'New address'}
          </h3>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {[
              { key: 'firstName', label: 'First name *', placeholder: 'Amira' },
              { key: 'lastName', label: 'Last name *', placeholder: 'Khalil' },
              { key: 'phone', label: 'Phone', placeholder: '+212 6 00 00 00 00' },
              { key: 'address1', label: 'Address line 1 *', placeholder: '12 Rue Mohammed V' },
              { key: 'address2', label: 'Address line 2', placeholder: 'Apt 3B' },
              { key: 'city', label: 'City *', placeholder: 'Casablanca' },
              { key: 'state', label: 'State / Province', placeholder: 'Grand Casablanca' },
              { key: 'postalCode', label: 'Postal code', placeholder: '20000' },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#78805F]">
                  {label}
                </label>
                <input
                  value={(form as any)[key]}
                  onChange={(event) => setForm({ ...form, [key]: event.target.value })}
                  placeholder={placeholder}
                  className="field-luxury"
                />
              </div>
            ))}

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#78805F]">
                Country *
              </label>
              <select
                value={form.country}
                onChange={(event) => setForm({ ...form, country: event.target.value })}
                className="field-luxury bg-white"
              >
                {countries.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <label className="mt-4 flex items-center gap-3 text-sm text-[#5B6455]">
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={(event) => setForm({ ...form, isDefault: event.target.checked })}
              className="h-4 w-4 rounded border-[#D8D3C8] text-[#273E1C] focus:ring-[#389C49]"
            />
            Set as default address
          </label>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={handleSubmit}
              disabled={!form.firstName || !form.address1 || !form.city || isPending}
              className="btn-gold disabled:opacity-50"
            >
              {isPending ? 'Saving...' : editId ? 'Update address' : 'Save address'}
            </button>
            <button
              onClick={() => {
                setShowForm(false);
                setEditId(null);
              }}
              className="btn-outline-gold"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="mt-6">
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 2 }).map((_, index) => (
              <div key={index} className="h-48 rounded-[28px] skeleton" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="surface-panel py-24 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#EFF5E7] text-[#273E1C]">
              <MapPin className="h-7 w-7" />
            </div>
            <h3 className="mt-6 font-heading text-[2.2rem] leading-none tracking-[-0.05em] text-[#1E2519]">
              No saved addresses yet.
            </h3>
            <p className="mt-4 text-sm text-[#5B6455]">
              Add one now to make the checkout experience more seamless.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {items.map((address: any) => (
              <div key={address.id} className="card-luxury p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#1E2519]">
                      {address.firstName} {address.lastName}
                    </p>
                    <p className="mt-3 text-sm leading-7 text-[#5B6455]">
                      {address.address1}
                      {address.address2 ? `, ${address.address2}` : ''}
                      <br />
                      {address.city}
                      {address.postalCode ? ` ${address.postalCode}` : ''}, {address.country}
                      {address.phone ? (
                        <>
                          <br />
                          {address.phone}
                        </>
                      ) : null}
                    </p>
                  </div>

                  {address.isDefault && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#EFF5E7] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#273E1C]">
                      <Check className="h-3 w-3" />
                      Default
                    </span>
                  )}
                </div>

                <div className="mt-5 flex flex-wrap gap-3 border-t border-[#ECE6D9] pt-4 text-sm">
                  <button
                    onClick={() => startEdit(address)}
                    className="inline-flex items-center gap-2 text-[#273E1C] transition-colors hover:text-[#1E2519]"
                  >
                    <Edit className="h-3.5 w-3.5" />
                    Edit
                  </button>

                  {!address.isDefault && (
                    <>
                      <button
                        onClick={() => setDefaultMutation.mutate(address.id)}
                        className="text-[#5B6455] transition-colors hover:text-[#273E1C]"
                      >
                        Set default
                      </button>

                      <button
                        onClick={() => {
                          if (confirm('Remove address?')) deleteMutation.mutate(address.id);
                        }}
                        className="inline-flex items-center gap-2 text-[#C9571A] transition-colors hover:text-[#A6461A]"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Remove
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
