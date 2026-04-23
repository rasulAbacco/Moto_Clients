// CartProvider.jsx
import { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    loadCart();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem("CART", JSON.stringify(cartItems));
  }, [cartItems]);

  // ✅ SAFE LOAD
  const loadCart = async () => {
    try {
      const data = await AsyncStorage.getItem("CART");
      if (data) setCartItems(JSON.parse(data));
    } catch (e) {
      console.log("Cart load error", e);
    }
  };

  // 🔥 FIXED CORE LOGIC
  const addToCart = (item) => {
    setCartItems((prev) => {
      const exists = prev.find((i) => String(i.id) === String(item.id));

      // ✅ SERVICE LOGIC (NO QUANTITY INCREMENT)
      if (item.source === "service") {
        if (exists) return prev; // already added
        return [
          ...prev,
          {
            ...item,
            quantity: 1,
            source: "service",
          },
        ];
      }

      // ✅ PRODUCT LOGIC (WITH QUANTITY)
      if (exists) {
        return prev.map((i) =>
          String(i.id) === String(item.id)
            ? { ...i, quantity: i.quantity + 1 }
            : i,
        );
      }

      return [
        ...prev,
        {
          ...item,
          quantity: 1,
          source: item.source || "store",
        },
      ];
    });
  };

  // 🔧 REMOVE (works for both types)
  const removeFromCart = (id) => {
    setCartItems((prev) =>
      prev
        .map((item) =>
          String(item.id) === String(id)
            ? { ...item, quantity: item.quantity - 1 }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const clearCart = () => setCartItems([]);

  // ✅ TOTAL (works for both)
  const getTotal = () =>
    cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // ✅ COUNT (products + services)
  const getCount = () =>
    cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        clearCart,
        getTotal,
        getCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
