import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CartItem {
  id: string; // This will now always be the Supabase UUID for logged-in users
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
  image?: string;
}

interface CartContextType {
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
  loading: boolean;
  // RENAMED for consistency
  addToCart: (item: Omit<CartItem, 'id' | 'product_id'> & { product_id: string }) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  syncCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true); // Start true to handle initial sync
  const { user } = useAuth();
  const { toast } = useToast();

  // Load cart from localStorage on initial mount (for guests)
  useEffect(() => {
    if (!user) {
      try {
        const savedCart = localStorage.getItem('waman-cart');
        if (savedCart) {
          setItems(JSON.parse(savedCart));
        }
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
      setLoading(false); // Stop loading for guests
    }
  }, [user]); // Rerun if user logs out

  // Save cart to localStorage whenever items change (for guests)
  useEffect(() => {
    if (!user) {
      localStorage.setItem('waman-cart', JSON.stringify(items));
    }
  }, [items, user]);

  // Sync with Supabase when user logs in
  useEffect(() => {
    if (user) {
      syncCart();
    }
  }, [user]);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // syncCart is primarily for initial login to merge local and server carts
  const syncCart = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Get local cart before fetching from server
      const localCart = JSON.parse(localStorage.getItem('waman-cart') || '[]');

      // Clear local storage cart for logged-in user to prevent stale data
      localStorage.removeItem('waman-cart');

      const { data: serverItems, error } = await supabase
        .from('cart_items')
        .select(`*, products (name, price, images)`)
        .eq('user_id', user.id);

      if (error) throw error;

      const transformedServerCart: CartItem[] = serverItems.map((item: any) => ({
        id: item.id,
        product_id: item.product_id,
        name: item.products?.name || 'Product',
        price: item.products?.price || 0,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        image: item.products?.images?.[0] || '',
      }));

      // Basic merge: server cart is the authority, add any non-conflicting local items
      const mergedItems = [...transformedServerCart];
      const itemsToUpload = [];

      for (const localItem of localCart) {
        const existsOnServer = mergedItems.some(serverItem =>
            serverItem.product_id === localItem.product_id &&
            serverItem.size === localItem.size &&
            serverItem.color === localItem.color
        );

        if (!existsOnServer) {
            itemsToUpload.push({
                user_id: user.id,
                product_id: localItem.product_id,
                quantity: localItem.quantity,
                size: localItem.size,
                color: localItem.color,
            });
        }
      }

      if (itemsToUpload.length > 0) {
        await supabase.from('cart_items').insert(itemsToUpload);
        // Re-fetch to get the final correct state with proper IDs
        await syncCart();
        return; // Exit early as syncCart will run again
      }

      setItems(mergedItems);
    } catch (error) {
      console.error('Error syncing cart:', error);
    } finally {
      setLoading(false);
    }
  };

  // --- REFACTORED AND RENAMED FUNCTION ---
  const addToCart = async (newItem: Omit<CartItem, 'id'>) => {
    const existingItem = items.find(
      item => item.product_id === newItem.product_id &&
              item.size === newItem.size &&
              item.color === newItem.color
    );

    if (existingItem) {
      await updateQuantity(existingItem.id, existingItem.quantity + newItem.quantity);
      return; // Exit after updating
    }

    // Handle new item addition
    if (user) {
      // --- FIX for ID Handling: Insert to DB first ---
      try {
        const { data: newDbItem, error } = await supabase
          .from('cart_items')
          .insert({
            user_id: user.id,
            product_id: newItem.product_id,
            quantity: newItem.quantity,
            size: newItem.size,
            color: newItem.color,
          })
          .select()
          .single();

        if (error) throw error;

        // Add the full item from the DB (with real ID) to the local state
        setItems(prev => [...prev, { ...newItem, id: newDbItem.id }]);

      } catch (error) {
        console.error('Error adding item to Supabase cart:', error);
        toast({ title: "Error", description: "Could not add item to cart.", variant: "destructive" });
        return; // Prevent toast on failure
      }
    } else {
      // Guest user: use temporary ID and save to localStorage
      const itemWithId = { ...newItem, id: Date.now().toString() };
      setItems(prev => [...prev, itemWithId]);
    }

    toast({
      title: "Added to Cart",
      description: `${newItem.name} has been added to your cart.`,
    });
  };

  const removeItem = async (itemId: string) => {
    // Optimistically update UI
    const previousItems = items;
    setItems(prev => prev.filter(item => item.id !== itemId));

    if (user) {
      try {
        const { error } = await supabase.from('cart_items').delete().eq('id', itemId);
        if (error) {
          setItems(previousItems); // Revert on failure
          throw error;
        }
      } catch (error) {
        console.error('Error removing item from cart:', error);
      }
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeItem(itemId);
      return;
    }

    const previousItems = items;
    setItems(prev => prev.map(item => item.id === itemId ? { ...item, quantity } : item));

    if (user) {
      try {
        const { error } = await supabase.from('cart_items').update({ quantity }).eq('id', itemId);
        if (error) {
          setItems(previousItems); // Revert on failure
          throw error;
        }
      } catch (error) {
        console.error('Error updating cart item:', error);
      }
    }
  };

  const clearCart = async () => {
    const previousItems = items;
    setItems([]);
    if (user) {
      try {
        const { error } = await supabase.from('cart_items').delete().eq('user_id', user.id);
        if (error) {
          setItems(previousItems); // Revert
          throw error;
        }
      } catch (error) {
        console.error('Error clearing cart:', error);
      }
    }
  };

  const value = {
    items,
    totalItems,
    totalAmount,
    loading,
    addToCart, // CHANGED
    removeItem,
    updateQuantity,
    clearCart,
    syncCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};