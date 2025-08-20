// src/components/admin/ProductManager.tsx
import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
// --- MODIFICATION START ---
// 1. Import components for the Select dropdown
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// --- MODIFICATION END ---
import { toast } from "sonner";
import { PlusCircle, Edit, Trash2 } from "lucide-react";

// --- MODIFICATION START ---
// 2. Update the Product interface with new fields
interface Product {
  id?: string;
  name: string;
  description: string;
  price: number;
  stock_quantity: number;
  category: string;
  images: string[];
  brand?: string;
  material?: string;
  occasion?: string;
  created_at?: string;
}
// --- MODIFICATION END ---

interface ProductManagerProps {
  products: Product[];
  onProductsChange: () => void;
}

const ProductManager: React.FC<ProductManagerProps> = ({
  products,
  onProductsChange,
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- MODIFICATION START ---
  // 3. Update the default product state and define category list
  const defaultProduct: Product = {
    name: "",
    description: "",
    price: 0,
    stock_quantity: 0,
    category: "",
    images: [],
    brand: "",
    material: "",
    occasion: "",
  };

  const productCategories = [
    "dresses (Men)",
    "top (Men)",
    "bottom (Men)",
    "Kurtis for Women",
    "Western (Women)",
    "Indian Dresses (Women)",
  ];
  // --- MODIFICATION END ---

  const handleAddNew = () => {
    setCurrentProduct(defaultProduct);
    setImageFiles([]);
    setIsDialogOpen(true);
  };

  const handleEdit = (product: Product) => {
    setCurrentProduct(product);
    setImageFiles([]);
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
    setIsDeleteDialogOpen(true);
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (currentProduct) {
      setCurrentProduct({
        ...currentProduct,
        [name]:
          name === "price" || name === "stock_quantity"
            ? parseFloat(value) || 0
            : value,
      });
    }
  };

  // --- MODIFICATION START ---
  // 4. Add a specific handler for Select components
  const handleSelectChange = (name: string, value: string) => {
    if (currentProduct) {
      setCurrentProduct({
        ...currentProduct,
        [name]: value,
      });
    }
  };
  // --- MODIFICATION END ---

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImageFiles(Array.from(e.target.files));
    }
  };

  const uploadImages = async (): Promise<string[]> => {
    const imageUrls: string[] = [];
    for (const file of imageFiles) {
      const fileName = `${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from("product-images")
        .upload(fileName, file);

      if (error) {
        throw new Error(`Image upload failed: ${error.message}`);
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("product-images").getPublicUrl(data.path);
      imageUrls.push(publicUrl);
    }
    return imageUrls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProduct) return;
    setIsSubmitting(true);

    try {
      const newImageUrls = await uploadImages();
      const updatedImages = [...(currentProduct.images || []), ...newImageUrls];

      // Ensure all fields are included, even if empty
      const productData = {
        name: currentProduct.name,
        description: currentProduct.description,
        price: currentProduct.price,
        stock_quantity: currentProduct.stock_quantity,
        category: currentProduct.category,
        images: updatedImages,
        brand: currentProduct.brand,
        material: currentProduct.material,
        occasion: currentProduct.occasion,
      };

      let error;
      if (currentProduct.id) {
        const { error: updateError } = await supabase
          .from("products")
          .update(productData)
          .eq("id", currentProduct.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from("products")
          .insert(productData);
        error = insertError;
      }

      if (error) throw error;

      toast.success(
        `Product ${currentProduct.id ? "updated" : "added"} successfully!`
      );
      onProductsChange();
      setIsDialogOpen(false);
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete || !productToDelete.id) return;

    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", productToDelete.id);
      if (error) throw error;

      toast.success("Product deleted successfully!");
      onProductsChange();
      setIsDeleteDialogOpen(false);
    } catch (error: any) {
      toast.error(`Error deleting product: ${error.message}`);
    }
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={handleAddNew}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Product
        </Button>
      </div>

      <div className="space-y-4">
        {products.map((product) => (
          <div
            key={product.id}
            className="flex items-center justify-between p-4 border rounded-lg"
          >
            <div className="flex items-center gap-4">
              <img
                src={product.images?.[0] || "https://via.placeholder.com/64"}
                alt={product.name}
                className="w-16 h-16 object-cover rounded-md bg-muted"
              />
              <div>
                <p className="font-semibold">{product.name}</p>
                {/* --- MODIFICATION START --- */}
                {/* 5. Display category in the list view */}
                <p className="text-sm text-muted-foreground">
                  {product.category} • ₹{product.price.toFixed(2)} • Stock:{" "}
                  {product.stock_quantity}
                </p>
                {/* --- MODIFICATION END --- */}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleEdit(product)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="destructive"
                size="icon"
                onClick={() => handleDeleteClick(product)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Product Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {currentProduct?.id ? "Edit Product" : "Add New Product"}
            </DialogTitle>
          </DialogHeader>
          {currentProduct && (
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                {/* --- MODIFICATION START --- */}
                {/* 6. Updated form with new fields and Select component */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={currentProduct.name}
                    onChange={handleFormChange}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={currentProduct.description}
                    onChange={handleFormChange}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="price" className="text-right">
                    Price
                  </Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    value={currentProduct.price}
                    onChange={handleFormChange}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="stock_quantity" className="text-right">
                    Stock
                  </Label>
                  <Input
                    id="stock_quantity"
                    name="stock_quantity"
                    type="number"
                    value={currentProduct.stock_quantity}
                    onChange={handleFormChange}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="category" className="text-right">
                    Category
                  </Label>
                  <Select
                    name="category"
                    value={currentProduct.category}
                    onValueChange={(value) =>
                      handleSelectChange("category", value)
                    }
                    required
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {productCategories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="brand" className="text-right">
                    Brand
                  </Label>
                  <Input
                    id="brand"
                    name="brand"
                    value={currentProduct.brand || ""}
                    onChange={handleFormChange}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="material" className="text-right">
                    Material
                  </Label>
                  <Input
                    id="material"
                    name="material"
                    value={currentProduct.material || ""}
                    onChange={handleFormChange}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="occasion" className="text-right">
                    Occasion
                  </Label>
                  <Input
                    id="occasion"
                    name="occasion"
                    value={currentProduct.occasion || ""}
                    onChange={handleFormChange}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="images" className="text-right">
                    Images
                  </Label>
                  <Input
                    id="images"
                    type="file"
                    multiple
                    onChange={handleImageChange}
                    className="col-span-3"
                  />
                </div>
                {/* --- MODIFICATION END --- */}
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="secondary">
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Product"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              product "{productToDelete?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProductManager;
