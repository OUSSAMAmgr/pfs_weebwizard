import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { CartItemType } from "@/components/cart-item";
import { Product } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface CartContextType {
  cartItems: CartItemType[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getSubtotal: () => number;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'b2b_platform_cart';

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItemType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        if (Array.isArray(parsedCart)) {
          setCartItems(parsedCart);
        }
      } catch (error) {
        console.error("Failed to parse cart from localStorage:", error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  // Check if product is already in cart
  const findCartItemIndex = (productId: number) => {
    return cartItems.findIndex(item => item.productId === productId);
  };

  // Add item to cart
  const addToCart = (product: Product, quantity = 1) => {
    setIsLoading(true);
    
    const itemIndex = findCartItemIndex(product.id);
    
    try {
      if (itemIndex >= 0) {
        // Product already in cart, update quantity
        const newItems = [...cartItems];
        const currentQuantity = newItems[itemIndex].quantity;
        const newQuantity = currentQuantity + quantity;
        
        // Make sure quantity doesn't exceed stock
        if (newQuantity > product.stock) {
          toast({
            title: "Stock limité",
            description: `Vous ne pouvez pas ajouter plus de ${product.stock} unités de ce produit.`,
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
        
        newItems[itemIndex].quantity = newQuantity;
        setCartItems(newItems);
      } else {
        // New product, add to cart
        const newItem: CartItemType = {
          id: Date.now(), // Temporary ID for the cart item
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: quantity,
          imageUrl: product.imageUrl || undefined,
          stock: product.stock,
        };
        setCartItems([...cartItems, newItem]);
      }
      
      toast({
        title: "Produit ajouté",
        description: "Le produit a été ajouté à votre panier.",
        variant: "default",
      });
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de l'ajout au panier.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Remove item from cart
  const removeFromCart = (id: number) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  // Update item quantity
  const updateQuantity = (id: number, quantity: number) => {
    const updatedItems = cartItems.map(item => {
      if (item.id === id) {
        // Make sure quantity doesn't exceed stock
        const newQuantity = Math.min(quantity, item.stock);
        return { ...item, quantity: newQuantity };
      }
      return item;
    });
    setCartItems(updatedItems);
  };

  // Clear cart
  const clearCart = () => {
    setCartItems([]);
  };

  // Get total number of items in cart
  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  // Get cart subtotal
  const getSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getTotalItems,
      getSubtotal,
      isLoading,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}