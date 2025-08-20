import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const productSchema = z.object({
  name: z.string().min(2, 'Product name is required'),
  price: z.number().min(0, 'Price must be positive'),
  description: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  sizes: z.string().optional(),
  colors: z.string().optional(),
  tags: z.string().optional(),
  stock_quantity: z.number().min(0, 'Stock quantity must be positive'),
  images: z.string().optional(),
});

type ProductForm = z.infer<typeof productSchema>;

interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
  category?: string;
  sizes?: string[];
  colors?: string[];
  tags?: string[];
  stock_quantity: number;
  images?: string[];
  is_active: boolean;
  created_at: string;
}

interface ProductManagerProps {
  products: Product[];
  onProductsChange: () => void;
}

const ProductManager: React.FC<ProductManagerProps> = ({ products, onProductsChange }) => {
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
  });

  const handleAddProduct = async (data: ProductForm) => {
    try {
      const productData = {
        name: data.name,
        price: data.price,
        description: data.description,
        category: data.category,
        sizes: data.sizes ? JSON.parse(`[${data.sizes.split(',').map(s => `"${s.trim()}"`).join(',')}]`) : [],
        colors: data.colors ? JSON.parse(`[${data.colors.split(',').map(c => `"${c.trim()}"`).join(',')}]`) : [],
        tags: data.tags ? JSON.parse(`[${data.tags.split(',').map(t => `"${t.trim()}"`).join(',')}]`) : [],
        stock_quantity: data.stock_quantity,
        images: data.images ? JSON.parse(`[${data.images.split(',').map(img => `"${img.trim()}"`).join(',')}]`) : [],
        is_active: true,
      };

      const { error } = await supabase
        .from('products')
        .insert([productData]);

      if (error) throw error;

      toast({
        title: "Product Added",
        description: "Product has been added successfully.",
      });

      reset();
      setIsAddingProduct(false);
      onProductsChange();
    } catch (error) {
      console.error('Error adding product:', error);
      toast({
        title: "Error",
        description: "Failed to add product.",
        variant: "destructive",
      });
    }
  };

  const handleEditProduct = async (data: ProductForm) => {
    if (!editingProduct) return;

    try {
      const productData = {
        name: data.name,
        price: data.price,
        description: data.description,
        category: data.category,
        sizes: data.sizes ? JSON.parse(`[${data.sizes.split(',').map(s => `"${s.trim()}"`).join(',')}]`) : [],
        colors: data.colors ? JSON.parse(`[${data.colors.split(',').map(c => `"${c.trim()}"`).join(',')}]`) : [],
        tags: data.tags ? JSON.parse(`[${data.tags.split(',').map(t => `"${t.trim()}"`).join(',')}]`) : [],
        stock_quantity: data.stock_quantity,
        images: data.images ? JSON.parse(`[${data.images.split(',').map(img => `"${img.trim()}"`).join(',')}]`) : [],
      };

      const { error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', editingProduct.id);

      if (error) throw error;

      toast({
        title: "Product Updated",
        description: "Product has been updated successfully.",
      });

      reset();
      setEditingProduct(null);
      onProductsChange();
    } catch (error) {
      console.error('Error updating product:', error);
      toast({
        title: "Error",
        description: "Failed to update product.",
        variant: "destructive",
      });
    }
  };

  const toggleProductStatus = async (product: Product) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_active: !product.is_active })
        .eq('id', product.id);

      if (error) throw error;

      toast({
        title: product.is_active ? "Product Deactivated" : "Product Activated",
        description: `Product has been ${product.is_active ? 'deactivated' : 'activated'}.`,
      });

      onProductsChange();
    } catch (error) {
      console.error('Error toggling product status:', error);
      toast({
        title: "Error",
        description: "Failed to update product status.",
        variant: "destructive",
      });
    }
  };

  const deleteProduct = async (productId: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      toast({
        title: "Product Deleted",
        description: "Product has been deleted successfully.",
      });

      onProductsChange();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Error",
        description: "Failed to delete product.",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setValue('name', product.name);
    setValue('price', product.price);
    setValue('description', product.description || '');
    setValue('category', product.category || '');
    setValue('sizes', product.sizes?.join(', ') || '');
    setValue('colors', product.colors?.join(', ') || '');
    setValue('tags', product.tags?.join(', ') || '');
    setValue('stock_quantity', product.stock_quantity);
    setValue('images', product.images?.join(', ') || '');
  };

  const ProductForm = ({ onSubmit, title }: { onSubmit: (data: ProductForm) => void; title: string }) => (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Product Name *</Label>
          <Input
            id="name"
            {...register('name')}
            className={errors.name ? 'border-destructive' : ''}
          />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="price">Price *</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            {...register('price', { valueAsNumber: true })}
            className={errors.price ? 'border-destructive' : ''}
          />
          {errors.price && (
            <p className="text-sm text-destructive">{errors.price.message}</p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" {...register('description')} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="category">Category *</Label>
          <Input
            id="category"
            {...register('category')}
            className={errors.category ? 'border-destructive' : ''}
          />
          {errors.category && (
            <p className="text-sm text-destructive">{errors.category.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="stock_quantity">Stock Quantity *</Label>
          <Input
            id="stock_quantity"
            type="number"
            {...register('stock_quantity', { valueAsNumber: true })}
            className={errors.stock_quantity ? 'border-destructive' : ''}
          />
          {errors.stock_quantity && (
            <p className="text-sm text-destructive">{errors.stock_quantity.message}</p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="sizes">Sizes (comma-separated)</Label>
        <Input id="sizes" {...register('sizes')} placeholder="XS, S, M, L, XL" />
      </div>

      <div>
        <Label htmlFor="colors">Colors (comma-separated)</Label>
        <Input id="colors" {...register('colors')} placeholder="Red, Blue, Green" />
      </div>

      <div>
        <Label htmlFor="tags">Tags (comma-separated)</Label>
        <Input id="tags" {...register('tags')} placeholder="new, featured, sale" />
      </div>

      <div>
        <Label htmlFor="images">Image URLs (comma-separated)</Label>
        <Textarea id="images" {...register('images')} placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg" />
      </div>

      <Button type="submit" className="w-full bg-deep-brown hover:bg-deep-brown/90">
        {title}
      </Button>
    </form>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Product Management</h3>
        <Dialog open={isAddingProduct} onOpenChange={setIsAddingProduct}>
          <DialogTrigger asChild>
            <Button className="bg-deep-brown hover:bg-deep-brown/90">
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
            </DialogHeader>
            <ProductForm onSubmit={handleAddProduct} title="Add Product" />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {products.map((product) => (
            <motion.div
              key={product.id}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <Card className={`${!product.is_active ? 'opacity-60' : ''}`}>
                <CardContent className="p-4">
                  <div className="aspect-square bg-muted rounded-lg mb-3 overflow-hidden">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        No Image
                      </div>
                    )}
                  </div>
                  
                  <h4 className="font-medium line-clamp-2 mb-2">{product.name}</h4>
                  <p className="text-sm text-muted-foreground mb-2">₹{product.price.toFixed(2)}</p>
                  
                  <div className="flex gap-2 mb-3">
                    <Badge variant="outline">{product.category}</Badge>
                    <Badge variant="outline">Stock: {product.stock_quantity}</Badge>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleProductStatus(product)}
                    >
                      {product.is_active ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                    
                    <Dialog open={editingProduct?.id === product.id} onOpenChange={(open) => !open && setEditingProduct(null)}>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditDialog(product)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Edit Product</DialogTitle>
                        </DialogHeader>
                        <ProductForm onSubmit={handleEditProduct} title="Update Product" />
                      </DialogContent>
                    </Dialog>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteProduct(product.id)}
                      className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ProductManager;