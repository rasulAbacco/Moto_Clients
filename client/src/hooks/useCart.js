import { useContext } from "react";
import { CartContext } from "../providers/CartProvider";

export const useCart = () => useContext(CartContext);