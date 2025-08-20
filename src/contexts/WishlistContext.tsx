import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface WishlistItem {
  id: string;
  product_id: string;
  name: string;
  price: number;
  image?: string;
  category?: string;
  stock_quantity: number;
}

interface WishlistContextType {
  items: WishlistItem[];
  loading: boolean;
  addToWishlist: (product: Omit<WishlistItem, 'id'>) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  syncWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Load wishlist from localStorage on mount
  useEffect(() => {
    const savedWishlist = localStorage.getItem('waman-wishlist');
    if (savedWishlist) {
      try {
        setItems(JSON.parse(savedWishlist));
      } catch (error) {
        console.error('Error loading wishlist from localStorage:', error);
      }
    }
  }, []);

  // Save wishlist to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem('waman-wishlist', JSON.stringify(items));
  }, [items]);

  // Sync with Supabase when user logs in
  useEffect(() => {
    if (user) {
      syncWishlist();
    }
  }, [user]);

  const syncWishlist = async () => {
    if (!user) return;
    
    setLoading(true);
    
    try {
      // Get user profile with wishlist
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('wishlist')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      if (profile?.wishlist && Array.isArray(profile.wishlist)) {
        // Fetch product details for wishlist items
        const productIds = profile.wishlist as string[];
        if (productIds.length > 0) {
          const { data: products, error: productsError } = await supabase
            .from('products')
            .select('id, name, price, images, category, stock_quantity')
            .in('id', productIds)
            .eq('is_active', true);

          if (productsError) throw productsError;

          const wishlistItems: WishlistItem[] = products?.map(product => ({
            id: Date.now().toString() + Math.random(),
            product_id: product.id,
            name: product.name,
            price: product.price,
            image: product.images?.[0] || '',
            category: product.category,
            stock_quantity: product.stock_quantity || 0,
          })) || [];

          setItems(wishlistItems);
        }
      }

      // Merge local wishlist with server wishlist
      const localProductIds = items.map(item => item.product_id);
      const newLocalItems = localProductIds.filter(id => !(profile?.wishlist as string[])?.includes(id));
      
      if (newLocalItems.length > 0) {
        const updatedWishlist = [...((profile?.wishlist as string[]) || []), ...newLocalItems];
        await supabase
          .from('profiles')
          .update({ wishlist: updatedWishlist })
          .eq('user_id', user.id);
      }
    } catch (error) {
      console.error('Error syncing wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToWishlist = async (product: Omit<WishlistItem, 'id'>) => {
    const newItem = {
      ...product,
      id: Date.now().toString() + Math.random(),
    };
    
    setItems(prev => [...prev, newItem]);
    
    // Add to Supabase if user is logged in
    if (user) {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('wishlist')
          .eq('user_id', user.id)
          .single();

        const currentWishlist = (profile?.wishlist as string[]) || [];
        const updatedWishlist = [...currentWishlist, product.product_id];

        await supabase
          .from('profiles')
          .update({ wishlist: updatedWishlist })
          .eq('user_id', user.id);
      } catch (error) {
        console.error('Error adding to wishlist:', error);
      }
    }
    
    toast({
      title: "Added to Wishlist",
      description: `${product.name} has been added to your wishlist.`,
    });
  };

  const removeFromWishlist = async (productId: string) => {
    setItems(prev => prev.filter(item => item.product_id !== productId));
    
    // Remove from Supabase if user is logged in
    if (user) {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('wishlist')
          .eq('user_id', user.id)
          .single();

        const currentWishlist = (profile?.wishlist as string[]) || [];
        const updatedWishlist = currentWishlist.filter((id: string) => id !== productId);

        await supabase
          .from('profiles')
          .update({ wishlist: updatedWishlist })
          .eq('user_id', user.id);
      } catch (error) {
        console.error('Error removing from wishlist:', error);
      }
    }
  };

  const isInWishlist = (productId: string) => {
    return items.some(item => item.product_id === productId);
  };

  const value = {
    items,
    loading,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    syncWishlist,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};