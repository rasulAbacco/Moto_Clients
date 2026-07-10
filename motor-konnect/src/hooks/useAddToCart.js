// src/hooks/useAddToCart.js
//
// Single shared implementation of "add to cart, but only from one garage
// at a time." Previously this Alert-based conflict check was copy-pasted
// separately into services/[id].jsx and sub-service/[id].jsx. Now every
// place that can add a service to cart (Home card, garage-page card,
// detail page) calls the same function, so behavior can't drift between
// them.

import { Alert } from "react-native";
import { useCart } from "./useCart";

export function useAddToCart() {
  const { cartItems, addToCart, removeFromCart, clearCart } = useCart();

  /**
   * @param {object} item - shape expected by CartProvider.addToCart:
   *   { id, title, price, carType, image, source: "service", slug,
   *     garageId, garageName, garage }
   *   `garage` (the full object, not just garageId/garageName) is
   *   required by CartScreen.proceedToNextStep()'s checkout gate.
   * @param {object} [options]
   * @param {() => void} [options.onAdded] - called after a successful add
   *   (including after a confirmed "clear and replace")
   */
  const addServiceToCart = (item, { onAdded } = {}) => {
    const doAdd = () => {
      addToCart(item);
      onAdded?.();
    };

    const existingLaborItem = cartItems.find(
      (i) => i.source === "service" || i.source === "package",
    );

    if (
      existingLaborItem &&
      String(existingLaborItem.garageId) !== String(item.garageId)
    ) {
      Alert.alert(
        "Replace Cart Items?",
        `Your cart contains services from "${existingLaborItem.garageName}". You can only select services from one garage at a time.\n\nClear your cart and add this service from "${item.garageName}"?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Continue",
            onPress: () => {
              clearCart();
              doAdd();
            },
          },
        ],
      );
      return;
    }

    doAdd();
  };

  const isInCart = (serviceId) =>
    cartItems.some((i) => String(i.id) === String(serviceId));

  return { addServiceToCart, isInCart, removeFromCart, cartItems };
}
