import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, ShoppingBag, ArrowRight, Trash2 } from 'lucide-react';
import { useWishlist } from '@/contexts/WishlistContext';
import { useCart } from '@/contexts/CartContext';

const WishlistPage = () => {
  const { items, removeFromWishlist } = useWishlist();
  const { addItem } = useCart();

  const handleAddToCart = async (item: any) => {
    await addItem({
      product_id: item.product_id,
      name: item.name,
      price: item.price,
      quantity: 1,
      image: item.image,
    });
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8"
          >
            <Heart className="w-24 h-24 mx-auto text-muted-foreground mb-4" />
            <h1 className="text-3xl font-heading font-bold text-deep-brown mb-4">
              Your Wishlist is Empty
            </h1>
            <p className="text-muted-foreground mb-8">
              Save items you love for later by clicking the heart icon.
            </p>
            <Button asChild className="bg-deep-brown hover:bg-deep-brown/90">
              <Link to="/products">
                Discover Products <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        <div className="flex items-center gap-3 mb-8">
          <Heart className="h-8 w-8 text-deep-brown fill-current" />
          <h1 className="text-3xl font-heading font-bold text-deep-brown">
            My Wishlist
          </h1>
          <span className="text-muted-foreground">({items.length} items)</span>
        </div>

        <AnimatePresence mode="popLayout">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="group hover:shadow-luxury transition-all duration-300">
                  <CardContent className="p-0">
                    {/* Product Image */}
                    <div className="relative aspect-[3/4] overflow-hidden rounded-t-lg bg-muted">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <span className="text-muted-foreground">No Image</span>
                        </div>
                      )}

                      {/* Remove Button */}
                      <Button
                        size="icon"
                        variant="ghost"
                        className="absolute top-3 right-3 h-8 w-8 bg-background/80 hover:bg-background text-destructive"
                        onClick={() => removeFromWishlist(item.product_id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>

                      {/* Stock Status */}
                      {item.stock_quantity === 0 && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="text-white font-medium">Out of Stock</span>
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="p-4">
                      <Link 
                        to={`/products/${item.product_id}`}
                        className="block hover:text-burnt-orange transition-colors"
                      >
                        <h3 className="font-medium line-clamp-2 mb-2">
                          {item.name}
                        </h3>
                      </Link>
                      
                      {item.category && (
                        <p className="text-sm text-muted-foreground mb-2 capitalize">
                          {item.category}
                        </p>
                      )}

                      <p className="text-lg font-semibold text-foreground mb-4">
                        ₹{item.price.toFixed(2)}
                      </p>

                      <div className="space-y-2">
                        <Button
                          className="w-full bg-deep-brown hover:bg-deep-brown/90"
                          onClick={() => handleAddToCart(item)}
                          disabled={item.stock_quantity === 0}
                        >
                          <ShoppingBag className="h-4 w-4 mr-2" />
                          {item.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                        </Button>
                        
                        <Button
                          variant="outline"
                          className="w-full"
                          asChild
                        >
                          <Link to={`/products/${item.product_id}`}>
                            View Details
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>

        {/* Continue Shopping */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 text-center"
        >
          <Button variant="outline" asChild>
            <Link to="/products" className="gap-2">
              <ArrowRight className="h-4 w-4 rotate-180" />
              Continue Shopping
            </Link>
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default WishlistPage;