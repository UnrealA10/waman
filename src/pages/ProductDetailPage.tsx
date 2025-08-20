import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Icons } from "@/components/ui/icons"; // ensure this file exports image, plus, minus icons
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/contexts/CartContext";

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
  description?: string;
  created_at: string;
}

// Helper to ensure data from Supabase is a clean string array
const ensureStringArray = (arr: unknown): string[] =>
  Array.isArray(arr)
    ? arr.filter((item): item is string => typeof item === "string")
    : [];

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("id", id)
          .single();

        if (error || !data) throw error || new Error("Product not found");

        const transformedProduct: Product = {
          id: data.id,
          name: data.name,
          price: data.price,
          images: ensureStringArray(data.images),
          sizes: ensureStringArray(data.sizes),
          colors: ensureStringArray(data.colors),
          tags: ensureStringArray(data.tags),
          stock_quantity: data.stock_quantity || 0,
          is_active: data.is_active || false,
          category: data.category || "",
          description: data.description || "",
          created_at: data.created_at,
        };

        setProduct(transformedProduct);
      } catch (error) {
        console.error("Error fetching product:", error);
        toast({
          title: "Error",
          description: "Failed to load product. Please try again.",
          variant: "destructive",
        });
        navigate("/products");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProduct();
  }, [id, navigate, toast]);

  // UX Improvement: Auto-select if only one option exists
  useEffect(() => {
    if (product) {
      if (product.sizes?.length === 1 && !selectedSize) {
        setSelectedSize(product.sizes[0]);
      }
      if (product.colors?.length === 1 && !selectedColor) {
        setSelectedColor(product.colors[0]);
      }
    }
  }, [product, selectedSize, selectedColor]);

  const handleAddToCart = () => {
    if (!product) return;

    // Validation checks
    if (product.sizes?.length && !selectedSize) {
      toast({ title: "Please select a size", variant: "destructive" });
      return;
    }
    if (product.colors?.length && !selectedColor) {
      toast({ title: "Please select a color", variant: "destructive" });
      return;
    }
    if (quantity > product.stock_quantity) {
      toast({
        title: "Not enough stock",
        description: `Only ${product.stock_quantity} items are available.`,
        variant: "destructive",
      });
      return;
    }

    // Call the context function with the correct payload
    addToCart({
      product_id: product.id,
      name: product.name,
      price: product.price,
      quantity: quantity,
      size: selectedSize || undefined,
      color: selectedColor || undefined,
      image: product.images[0] || "",
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <Skeleton className="aspect-square w-full rounded-lg" />
            <div className="grid grid-cols-4 gap-2">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-lg" />
              ))}
            </div>
          </div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
            <div className="pt-8 space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-3xl font-heading font-bold text-deep-brown mb-4">
          Product Not Found
        </h1>
        <Button onClick={() => navigate("/products")}>Back to Products</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream to-blush/10">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid md:grid-cols-2 gap-8 md:gap-12"
        >
          {/* Product Image Gallery */}
          <div>
            <div className="aspect-square w-full rounded-lg bg-white overflow-hidden mb-4">
              {product.images.length > 0 ? (
                <img
                  src={product.images[currentImageIndex]}
                  alt={product.name}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted">
                  <Icons.image className="h-16 w-16 text-muted-foreground" />
                </div>
              )}
            </div>

            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 ${
                      currentImageIndex === idx
                        ? "border-deep-brown"
                        : "border-transparent"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info Section */}
          <div>
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-deep-brown mb-2">
              {product.name}
            </h1>

            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl font-bold text-deep-brown">
                ₹{product.price.toFixed(2)}
              </span>
              <span
                className={`text-sm font-medium ${
                  product.stock_quantity > 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {product.stock_quantity > 0
                  ? `In Stock (${product.stock_quantity})`
                  : "Out of Stock"}
              </span>
            </div>

            {product.category && (
              <span className="inline-block px-3 py-1 text-sm bg-muted rounded-full mb-4">
                {product.category}
              </span>
            )}

            {product.description && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2">Description</h2>
                <p className="text-muted-foreground whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            )}

            {product.sizes?.length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2">Size</h2>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <Button
                      key={size}
                      variant={selectedSize === size ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {product.colors?.length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2">Color</h2>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => (
                    <Button
                      key={color}
                      variant={selectedColor === color ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedColor(color)}
                      className="capitalize"
                    >
                      {color}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Quantity</h2>
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Icons.minus className="h-4 w-4" />
                </Button>
                <span className="w-10 text-center font-semibold text-lg">
                  {quantity}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setQuantity(Math.min(product.stock_quantity, quantity + 1))
                  }
                  disabled={quantity >= product.stock_quantity}
                >
                  <Icons.plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-4">
              <Button
                size="lg"
                onClick={handleAddToCart}
                disabled={
                  product.stock_quantity <= 0 ||
                  quantity > product.stock_quantity
                }
                className="w-full"
              >
                {product.stock_quantity > 0 ? "Add to Cart" : "Out of Stock"}
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate("/products")}
                className="w-full"
              >
                Continue Shopping
              </Button>
            </div>

            {product.tags?.length > 0 && (
              <div className="mt-8 pt-6 border-t">
                <h2 className="text-lg font-semibold mb-2">Tags</h2>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-block px-3 py-1 text-sm bg-muted rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
