// src/providers/PartsCartProvider.jsx
//
// Spare parts cart (separate from the garage-services cart). Saved on the phone,
// grouped by shop because every shop has its own delivery / COD options and
// becomes its own order at checkout.
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "PARTS_CART_V1";
const MAX_QTY = 50;

export const PartsCartContext = createContext(null);

const vendorOf = (part) => ({
  id: String(part.vendor?.id ?? "unknown"),
  name: part.vendor?.name || "Shop",
  city: part.vendor?.city || null,
  codEnabled: part.vendor?.codEnabled !== false,
  deliveryEnabled: part.vendor?.deliveryEnabled !== false,
  deliveryCharge: Number(part.vendor?.deliveryCharge) || 0,
  acceptsUpi: Boolean(part.vendor?.acceptsUpi),
});

export function PartsCartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => raw && setItems(JSON.parse(raw)))
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  useEffect(() => {
    if (ready) AsyncStorage.setItem(KEY, JSON.stringify(items)).catch(() => {});
  }, [items, ready]);

  const add = useCallback((part, qty = 1) => {
    if (!part?.inventoryId) return false;
    setItems((prev) => {
      const existing = prev.find((i) => i.inventoryId === part.inventoryId);
      if (existing) {
        return prev.map((i) =>
          i.inventoryId === part.inventoryId
            ? { ...i, quantity: Math.min(MAX_QTY, i.quantity + qty) }
            : i,
        );
      }
      return [
        ...prev,
        {
          inventoryId: part.inventoryId,
          productId: part.id,
          name: part.name,
          brand: part.brand || null,
          partNumber: part.partNumber || null,
          image: part.images?.[0] || null,
          price: Number(part.price) || 0, // incl. GST
          mrp: Number(part.mrp) || null,
          quantity: Math.min(MAX_QTY, qty),
          vendor: vendorOf(part),
        },
      ];
    });
    return true;
  }, []);

  const setQty = useCallback((inventoryId, quantity) => {
    setItems((prev) =>
      quantity <= 0
        ? prev.filter((i) => i.inventoryId !== inventoryId)
        : prev.map((i) =>
            i.inventoryId === inventoryId
              ? { ...i, quantity: Math.min(MAX_QTY, quantity) }
              : i,
          ),
    );
  }, []);

  const remove = useCallback(
    (inventoryId) =>
      setItems((prev) => prev.filter((i) => i.inventoryId !== inventoryId)),
    [],
  );

  const clearVendor = useCallback(
    (vendorId) =>
      setItems((prev) => prev.filter((i) => i.vendor.id !== String(vendorId))),
    [],
  );

  /** Apply live price / stock from the store (POST /cart/validate) */
  const applyValidation = useCallback((rows) => {
    const byId = new Map(rows.map((r) => [r.inventoryId, r]));
    setItems((prev) =>
      prev.map((i) => {
        const r = byId.get(i.inventoryId);
        if (!r) return i;
        return {
          ...i,
          price: r.priceWithGst ?? i.price,
          available: r.available,
          maxQty: r.maxQty,
          vendor: {
            ...i.vendor,
            codEnabled: r.codEnabled ?? i.vendor.codEnabled,
            deliveryEnabled: r.deliveryEnabled ?? i.vendor.deliveryEnabled,
            deliveryCharge: r.deliveryCharge ?? i.vendor.deliveryCharge,
            acceptsUpi: r.upiEnabled ?? i.vendor.acceptsUpi,
          },
        };
      }),
    );
  }, []);

  const groups = useMemo(() => {
    const map = new Map();
    for (const item of items) {
      if (!map.has(item.vendor.id))
        map.set(item.vendor.id, { vendor: item.vendor, items: [] });
      const g = map.get(item.vendor.id);
      g.vendor = item.vendor; // latest options
      g.items.push(item);
    }
    return [...map.values()].map((g) => ({
      ...g,
      subtotal: g.items.reduce((s, i) => s + i.price * i.quantity, 0),
      count: g.items.reduce((s, i) => s + i.quantity, 0),
    }));
  }, [items]);

  const count = useMemo(
    () => items.reduce((s, i) => s + i.quantity, 0),
    [items],
  );
  const quantityOf = useCallback(
    (inventoryId) =>
      items.find((i) => i.inventoryId === inventoryId)?.quantity ?? 0,
    [items],
  );

  const value = useMemo(
    () => ({
      items,
      groups,
      count,
      ready,
      add,
      setQty,
      remove,
      clearVendor,
      applyValidation,
      quantityOf,
    }),
    [
      items,
      groups,
      count,
      ready,
      add,
      setQty,
      remove,
      clearVendor,
      applyValidation,
      quantityOf,
    ],
  );

  return (
    <PartsCartContext.Provider value={value}>
      {children}
    </PartsCartContext.Provider>
  );
}

export const usePartsCart = () => {
  const ctx = useContext(PartsCartContext);
  if (!ctx)
    throw new Error("usePartsCart must be used inside <PartsCartProvider>");
  return ctx;
};
