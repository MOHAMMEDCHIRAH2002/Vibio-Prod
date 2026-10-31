'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { customersApi, productsApi } from '@/lib/api';
import { formatPrice } from '@/lib/utils';

type OrderLine = {
  key: string;
  itemId?: string;
  variantId: string;
  quantity: number;
  fallbackLabel?: string;
  fallbackPrice?: number;
  originalQuantity?: number;
};

type OrderEditorInitial = {
  userId: string;
  customerLabel: string;
  items: Array<{
    id?: string;
    variantId?: string | null;
    quantity: number;
    name: string;
    variantName?: string | null;
    price: number;
  }>;
  shippingAddress?: {
    fullName?: string;
    phone?: string;
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  notes?: string | null;
  discount?: number;
  loyaltyDiscount?: number;
};

type AddressForm = {
  fullName: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

const emptyAddress: AddressForm = {
  fullName: '',
  phone: '',
  line1: '',
  line2: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'Morocco',
};

export default function OrderEditor({
  initial,
  saving,
  onSubmit,
}: {
  initial?: OrderEditorInitial;
  saving: boolean;
  onSubmit: (data: {
    userId: string;
    items: Array<{ variantId?: string; itemId?: string; quantity: number }>;
    shippingAddress: AddressForm;
    notes?: string;
  }) => void;
}) {
  const [customerSearch, setCustomerSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [userId, setUserId] = useState(initial?.userId || '');
  const [selectedCustomerLabel, setSelectedCustomerLabel] = useState(initial?.customerLabel || '');
  const [notes, setNotes] = useState(initial?.notes || '');
  const [address, setAddress] = useState<AddressForm>({
    fullName: initial?.shippingAddress?.fullName || '',
    phone: initial?.shippingAddress?.phone || '',
    line1: initial?.shippingAddress?.line1 || '',
    line2: initial?.shippingAddress?.line2 || '',
    city: initial?.shippingAddress?.city || '',
    state: initial?.shippingAddress?.state || '',
    postalCode: initial?.shippingAddress?.postalCode || '',
    country: initial?.shippingAddress?.country || emptyAddress.country,
  });
  const [lines, setLines] = useState<OrderLine[]>(
    initial?.items.map((item, index) => ({
      key: `${item.variantId || 'unlinked'}-${index}`,
      itemId: item.id,
      variantId: item.variantId || '',
      quantity: item.quantity,
      originalQuantity: item.variantId ? item.quantity : undefined,
      fallbackLabel: `${item.name}${item.variantName ? ` — ${item.variantName}` : ''}`,
      fallbackPrice: Number(item.price),
    })) || [{ key: 'new-0', variantId: '', quantity: 1 }],
  );

  const { data: customerData, isLoading: customersLoading, isError: customersError } = useQuery({
    queryKey: ['admin-order-customers', customerSearch],
    queryFn: () => customersApi.adminList({ search: customerSearch || undefined, page: 1, limit: 100 }),
  });
  const { data: productData, isLoading: productsLoading, isError: productsError } = useQuery({
    queryKey: ['admin-order-products', productSearch],
    queryFn: () => productsApi.list({ search: productSearch || undefined, page: 1, limit: 100, admin: true }),
  });

  const customers = customerData?.users || [];
  const products = (productData as any)?.products || [];
  const variants = useMemo(
    () =>
      products.flatMap((product: any) =>
        (product.variants || []).map((variant: any) => ({
          ...variant,
          productName: product.name,
          productActive: product.isActive,
        })),
      ),
    [products],
  );
  const currentSubtotal = lines.reduce((sum, line) => {
    const variant = variants.find((item: any) => item.id === line.variantId);
    const price =
      line.originalQuantity === line.quantity
        ? line.fallbackPrice
        : variant?.price ?? line.fallbackPrice;
    return sum + Number(price || 0) * line.quantity;
  }, 0);
  const shipping = currentSubtotal > 500 ? 0 : 50;
  const total = Math.max(
    0,
    currentSubtotal - Number(initial?.discount || 0) - Number(initial?.loyaltyDiscount || 0),
  ) + shipping;

  const updateLine = (key: string, updates: Partial<OrderLine>) => {
    setLines((current) => current.map((line) => (line.key === key ? { ...line, ...updates } : line)));
  };

  return (
    <form
      className="admin-panel space-y-6 p-5 sm:p-6"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit({
          userId,
          items: lines.map(({ itemId, variantId, quantity }) => ({
            itemId,
            ...(variantId ? { variantId } : {}),
            quantity,
          })),
          shippingAddress: address,
          notes: notes.trim() || undefined,
        });
      }}
    >
      <div>
        <p className="admin-eyebrow">Customer</p>
        <h2 className="mt-3 font-heading text-[1.7rem] leading-none tracking-[-0.05em] text-[#171C14]">
          Order details
        </h2>
        <label className="mb-2 mt-5 block text-sm font-medium text-[#3E433E]">Find customer</label>
        <input
          value={customerSearch}
          onChange={(event) => setCustomerSearch(event.target.value)}
          placeholder="Search by name or email"
          className="admin-input mb-3"
        />
        <select
          required
          value={userId}
          onChange={(event) => {
            const selected = customers.find((customer: any) => customer.id === event.target.value);
            setUserId(event.target.value);
            if (selected) {
              setSelectedCustomerLabel(`${selected.name || 'Customer'} — ${selected.email}`);
              setAddress((current) => ({
                ...current,
                fullName: selected.name || current.fullName,
                phone: selected.phone || current.phone,
              }));
            }
          }}
          className="admin-select"
        >
          <option value="">{customersLoading ? 'Loading customers…' : 'Select a customer'}</option>
          {initial?.userId && !customers.some((customer: any) => customer.id === initial.userId) && (
            <option value={initial.userId}>{selectedCustomerLabel}</option>
          )}
          {userId && !customers.some((customer: any) => customer.id === userId) && userId !== initial?.userId && (
            <option value={userId}>{selectedCustomerLabel}</option>
          )}
          {customers.map((customer: any) => (
            <option key={customer.id} value={customer.id}>
              {customer.name || customer.email} — {customer.email}
            </option>
          ))}
        </select>
        {customersError && <p className="mt-2 text-sm text-red-700">Could not load customers.</p>}
      </div>

      <div>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="admin-eyebrow">Products</p>
            <h3 className="mt-2 text-lg font-semibold text-[#171C14]">Items and quantities</h3>
          </div>
          <button
            type="button"
            onClick={() =>
              setLines((current) => [
                ...current,
                { key: `new-${Date.now()}-${Math.random()}`, variantId: '', quantity: 1 },
              ])
            }
            className="admin-btn-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#315824]"
          >
            Add item
          </button>
        </div>
        <input
          value={productSearch}
          onChange={(event) => setProductSearch(event.target.value)}
          placeholder="Search products"
          className="admin-input mt-4"
        />
        {productsError && <p className="mt-2 text-sm text-red-700">Could not load products.</p>}
        {productsLoading && <p className="mt-2 text-sm text-[#7A776F]">Loading products…</p>}
        <div className="mt-4 space-y-3">
          {lines.map((line) => {
            const currentVariant = variants.find((variant: any) => variant.id === line.variantId);
            return (
              <div key={line.key} className="grid gap-3 rounded-xl border border-[#EFE8DE] bg-white/55 p-3 sm:grid-cols-[minmax(0,1fr)_7rem_auto]">
                <select
                  required
                  value={line.variantId}
                  onChange={(event) => {
                    const variant = variants.find((item: any) => item.id === event.target.value);
                    updateLine(line.key, {
                      variantId: event.target.value,
                      originalQuantity: undefined,
                      fallbackLabel: variant ? `${variant.productName} — ${variant.name}: ${variant.value}` : '',
                      fallbackPrice: variant ? Number(variant.price) : 0,
                    });
                  }}
                  className="admin-select min-w-0"
                >
                  <option value="">Select a product variant</option>
                  {line.variantId && !currentVariant && (
                    <option value={line.variantId}>{line.fallbackLabel || 'Existing order item'}</option>
                  )}
                  {variants.map((variant: any) => (
                    <option key={variant.id} value={variant.id} disabled={!variant.productActive && line.variantId !== variant.id}>
                      {variant.productName} — {variant.name}: {variant.value} · {formatPrice(variant.price)} · stock {variant.stock}
                    </option>
                  ))}
                </select>
                <input
                  aria-label="Quantity"
                  type="number"
                  min={1}
                  required
                  value={line.quantity}
                  onChange={(event) =>
                    updateLine(line.key, {
                      quantity: Math.max(1, Number.parseInt(event.target.value, 10) || 1),
                    })
                  }
                  className="admin-input"
                />
                <button
                  type="button"
                  disabled={lines.length === 1}
                  onClick={() => setLines((current) => current.filter((item) => item.key !== line.key))}
                  className="admin-btn-secondary disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#315824]"
                >
                  Remove
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <p className="admin-eyebrow">Delivery</p>
        <h3 className="mt-2 text-lg font-semibold text-[#171C14]">Shipping address</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {([
            ['fullName', 'Full name'],
            ['phone', 'Phone'],
            ['line1', 'Address line 1'],
            ['line2', 'Address line 2'],
            ['city', 'City'],
            ['state', 'State / region'],
            ['postalCode', 'Postal code'],
            ['country', 'Country'],
          ] as const).map(([field, label]) => (
            <label key={field} className="block text-sm font-medium text-[#3E433E]">
              {label}
              <input
                required={['fullName', 'phone', 'line1', 'city', 'country'].includes(field)}
                value={address[field]}
                onChange={(event) => setAddress((current) => ({ ...current, [field]: event.target.value }))}
                className="admin-input mt-2"
              />
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-[#3E433E]">
          Order notes
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={3}
            className="admin-input mt-2 resize-y"
          />
        </label>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#EEE6DB] pt-5">
        {initial && (
          <p className="w-full text-xs text-[#8A631D]">
            Updating items changes the order total and inventory. This does not collect or refund a payment.
          </p>
        )}
        <div className="text-sm text-[#6B6A63]">
          <p>Subtotal: {formatPrice(currentSubtotal)}</p>
          <p>Shipping: {shipping === 0 ? 'Free' : formatPrice(shipping)}</p>
          <p className="mt-1 font-semibold text-[#171C14]">Estimated total: {formatPrice(total)}</p>
        </div>
        <button
          type="submit"
          disabled={saving || customersError || productsError}
          className="admin-btn-primary disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#315824]"
        >
          {saving ? 'Saving…' : initial ? 'Save order details' : 'Create order'}
        </button>
      </div>
    </form>
  );
}
