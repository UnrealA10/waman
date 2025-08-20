import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ShoppingBag, ArrowRight, Heart, Tag } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import CartItem from '@/components/cart/CartItem';

const CartPage = () => {
  const { items, totalAmount, totalItems, updateQuantity, removeItem } = useCart();

  const shippingCost = totalAmount > 10000 ? 0 : 199;
  const finalTotal = totalAmount + shippingCost;

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8"
          >
            <ShoppingBag className="w-24 h-24 mx-auto text-muted-foreground mb-4" />
            <h1 className="text-3xl font-heading font-bold text-deep-brown mb-4">
              Your Cart is Empty
            </h1>
            <p className="text-muted-foreground mb-8">
              Discover our beautiful collection and add items to your cart.
            </p>
            <Button asChild className="bg-deep-brown hover:bg-deep-brown/90">
              <Link to="/products">
                Start Shopping <ArrowRight className="ml-2 h-4 w-4" />
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
          <ShoppingBag className="h-8 w-8 text-deep-brown" />
          <h1 className="text-3xl font-heading font-bold text-deep-brown">
            Shopping Cart
          </h1>
          <span className="text-muted-foreground">({totalItems} items)</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="popLayout">
              <div className="space-y-4">
                {items.map((item) => (
                  <CartItem
                    key={item.id}
                    item={item}
                    onUpdateQuantity={updateQuantity}
                    onRemove={removeItem}
                  />
                ))}
              </div>
            </AnimatePresence>

            {/* Continue Shopping */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-6"
            >
              <Button variant="outline" asChild>
                <Link to="/products" className="gap-2">
                  <ArrowRight className="h-4 w-4 rotate-180" />
                  Continue Shopping
                </Link>
              </Button>
            </motion.div>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal ({totalItems} items)</span>
                  <span>₹{totalAmount.toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className={shippingCost === 0 ? "text-green-600" : ""}>
                    {shippingCost === 0 ? "FREE" : `₹${shippingCost}`}
                  </span>
                </div>

                {totalAmount < 10000 && shippingCost > 0 && (
                  <p className="text-sm text-muted-foreground">
                    Add ₹{(10000 - totalAmount).toFixed(2)} more for free shipping
                  </p>
                )}

                <Separator />

                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>₹{finalTotal.toFixed(2)}</span>
                </div>

                <div className="space-y-3 pt-4">
                  <Button
                    className="w-full bg-deep-brown hover:bg-deep-brown/90"
                    asChild
                  >
                    <Link to="/checkout">
                      Proceed to Checkout
                    </Link>
                  </Button>

                  <Button variant="outline" className="w-full" asChild>
                    <Link to="/wishlist" className="gap-2">
                      <Heart className="h-4 w-4" />
                      View Wishlist
                    </Link>
                  </Button>
                </div>

                <div className="text-center pt-4">
                  <p className="text-xs text-muted-foreground">
                    🔒 Secure checkout with 256-bit SSL encryption
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CartPage;