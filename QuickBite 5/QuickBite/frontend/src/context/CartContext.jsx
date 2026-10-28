
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  getToken,
  getCart,
  addToCart as addToCartAPI,
  updateCartItem as updateCartItemAPI,
  removeCartItem as removeCartItemAPI,
  clearCart as clearCartAPI,
} from "../api";

const CartContext = createContext(null);

function getSavedCart() {
  try {
    const savedCart = localStorage.getItem("quickbite-cart");
    return savedCart ? JSON.parse(savedCart) : [];
  } catch {
    return [];
  }
}

function mapCartItems(data) {
  return (data.items || [])
    .filter((item) => item.food)
    .map((item) => {
      const food = item.food;

      return {
        ...food,
        id: food._id || food.id,
        _id: food._id || food.id,
        name: food.name,
        price: Number(food.price),
        image: food.image || "",
        quantity: item.quantity,
      };
    });
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState(getSavedCart);
  const [loading, setLoading] = useState(false);
  const [cartError, setCartError] = useState("");
  const token = getToken();

  async function refreshCart() {
    if (!getToken()) return;

    setLoading(true);
    setCartError("");

    try {
      const data = await getCart();
      setCart(mapCartItems(data));
    } catch (error) {
      setCartError(error.message || "Unable to load cart.");
      throw error;
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (token) {
      refreshCart().catch(() => {});
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      localStorage.setItem("quickbite-cart", JSON.stringify(cart));
    }
  }, [cart, token]);

  async function addToCart(food) {
    const foodId = food._id || food.id;

    if (!foodId) {
      setCartError("This food does not have a valid food ID.");
      return;
    }

    setCartError("");

    if (getToken()) {
      try {
        await addToCartAPI({ foodId, quantity: 1 });
        await refreshCart();
      } catch (error) {
        setCartError(error.message || "Unable to add food to cart.");
      }
      return;
    }

    setCart((previous) => {
      const existing = previous.find(
        (item) => String(item.id) === String(foodId)
      );

      if (existing) {
        return previous.map((item) =>
          String(item.id) === String(foodId)
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [
        ...previous,
        {
          ...food,
          id: foodId,
          _id: foodId,
          price: Number(food.price),
          quantity: 1,
        },
      ];
    });
  }

  async function updateQuantity(id, quantity) {
    if (quantity <= 0) {
      return removeFromCart(id);
    }

    setCartError("");

    if (getToken()) {
      try {
        await updateCartItemAPI(id, quantity);
        await refreshCart();
      } catch (error) {
        setCartError(error.message || "Unable to update quantity.");
      }
      return;
    }

    setCart((previous) =>
      previous.map((item) =>
        String(item.id) === String(id)
          ? { ...item, quantity }
          : item
      )
    );
  }

  async function removeFromCart(id) {
    setCartError("");

    if (getToken()) {
      try {
        await removeCartItemAPI(id);
        await refreshCart();
      } catch (error) {
        setCartError(error.message || "Unable to remove food.");
      }
      return;
    }

    setCart((previous) =>
      previous.filter((item) => String(item.id) !== String(id))
    );
  }

  async function clearCart() {
    setCartError("");

    if (getToken()) {
      try {
        await clearCartAPI();
        setCart([]);
      } catch (error) {
        setCartError(error.message || "Unable to clear cart.");
        throw error;
      }
      return;
    }

    setCart([]);
  }

  const cartCount = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const cartTotal = cart.reduce(
    (total, item) => total + Number(item.price) * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        refreshCart,
        cartCount,
        cartTotal,
        loading,
        cartError,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
}
