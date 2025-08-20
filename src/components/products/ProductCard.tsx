import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, ShoppingBag, Eye } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
  category?: string;
  sizes?: string[];
  colors?: string[];
  tags?: string[];
  stock_quantity: number;
  is_active: boolean;
}

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [imageIndex, setImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const { addItem } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { toast } = useToast();
  
  const isWishlisted = isInWishlist(product.id);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    await addItem({
      product_id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.images[0] || '',
    });
  };

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isWishlisted) {
      await removeFromWishlist(product.id);
    } else {
      await addToWishlist({
        product_id: product.id,
        name: product.name,
        price: product.price,
        image: product.images[0] || '',
        category: product.category,
        stock_quantity: product.stock_quantity,
      });
    }
  };

  const displayPrice = product.price.toFixed(2);
  const isOnSale = product.tags?.includes('sale');
  const isNew = product.tags?.includes('new');

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
      className="group relative bg-background rounded-lg shadow-sm border border-border overflow-hidden hover:shadow-luxury transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/products/${product.id}`} className="block">
        {/* Image Container */}
        <div className="relative aspect-[3/4] overflow-hidden bg-muted">
          {product.images.length > 0 ? (
            <motion.img
              src={product.images[imageIndex]}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder.svg';
              }}
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <span className="text-muted-foreground">No Image</span>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {isNew && (
              <Badge className="bg-gold text-deep-brown font-medium">
                New
              </Badge>
            )}
            {isOnSale && (
              <Badge className="bg-destructive text-destructive-foreground font-medium">
                Sale
              </Badge>
            )}
            {product.stock_quantity <= 5 && product.stock_quantity > 0 && (
              <Badge variant="outline" className="bg-background/80">
                Low Stock
              </Badge>
            )}
            {product.stock_quantity === 0 && (
              <Badge variant="destructive">
                Out of Stock
              </Badge>
            )}
          </div>

          {/* Hover Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 20 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-3 left-3 right-3 flex gap-2"
          >
            <Button
              size="sm"
              className="flex-1 bg-deep-brown/90 hover:bg-deep-brown text-cream"
              onClick={handleAddToCart}
              disabled={product.stock_quantity === 0}
            >
              <ShoppingBag className="h-4 w-4 mr-2" />
              Add to Cart
            </Button>
            <Button
              size="sm"
              variant="secondary"
              className="bg-background/90 hover:bg-background"
            >
              <Eye className="h-4 w-4" />
            </Button>
          </motion.div>

          {/* Wishlist Button */}
          <Button
            size="icon"
            variant="ghost"
            className={`absolute top-3 right-3 h-8 w-8 rounded-full ${
              isWishlisted 
                ? 'bg-destructive/20 text-destructive hover:bg-destructive/30' 
                : 'bg-background/80 hover:bg-background'
            }`}
            onClick={handleWishlist}
          >
            <Heart 
              className={`h-4 w-4 ${isWishlisted ? 'fill-current' : ''}`} 
            />
          </Button>

          {/* Image Dots */}
          {product.images.length > 1 && (
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
              {product.images.map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === imageIndex ? 'bg-gold' : 'bg-white/50'
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setImageIndex(index);
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4">
          <h3 className="font-medium text-foreground group-hover:text-burnt-orange transition-colors line-clamp-2">
            {product.name}
          </h3>
          
          {product.category && (
            <p className="text-sm text-muted-foreground mt-1 capitalize">
              {product.category}
            </p>
          )}

          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold text-foreground">
                ₹{displayPrice}
              </span>
              {isOnSale && (
                <span className="text-sm text-muted-foreground line-through">
                  ₹{(product.price * 1.2).toFixed(2)}
                </span>
              )}
            </div>

            {product.colors && product.colors.length > 0 && (
              <div className="flex gap-1">
                {product.colors.slice(0, 3).map((color, index) => (
                  <div
                    key={index}
                    className="w-4 h-4 rounded-full border border-border"
                    style={{ backgroundColor: color.toLowerCase() }}
                    title={color}
                  />
                ))}
                {product.colors.length > 3 && (
                  <span className="text-xs text-muted-foreground">
                    +{product.colors.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>

          {product.sizes && product.sizes.length > 0 && (
            <div className="flex gap-1 mt-2">
              {product.sizes.slice(0, 4).map((size, index) => (
                <span
                  key={index}
                  className="text-xs px-2 py-1 bg-muted text-muted-foreground rounded"
                >
                  {size}
                </span>
              ))}
              {product.sizes.length > 4 && (
                <span className="text-xs text-muted-foreground px-2 py-1">
                  +{product.sizes.length - 4}
                </span>
              )}
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;