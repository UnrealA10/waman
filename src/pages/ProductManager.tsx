// src/components/admin/ProductManager.tsx
import React, { useEffect, useMemo, useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { PlusCircle, Edit, Trash2, UploadCloud, X } from "lucide-react";
import { Switch } from "@/components/ui/switch";

type StringArray = string[] | null | undefined;

interface Product {
  id?: string;
  name: string;
  description: string;
  price: number;
  stock_quantity: number;
  category: string;
  images: string[];
  is_active?: boolean;
  sizes?: string[];
  colors?: string[];
  tags?: string[];
  created_at?: string;
}

interface ProductManagerProps {
  products: Product[];
  onProductsChange: () => void;
}

const BUCKET = "products";
const toStrArr = (v: StringArray) =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
const CATS = [
  "Top (Men)",
  "Bottom (Men)",
  "Suits (Women)",
  "Dresses (Women)",
  "Collections",
  "New",
];

export default function ProductManager({
  products,
  onProductsChange,
}: ProductManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [current, setCurrent] = useState<Product | null>(null);
  const [toDelete, setToDelete] = useState<Product | null>(null);
  const [picked, setPicked] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uid, setUid] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUid(data.user?.id ?? null));
  }, []);

  const empty: Product = useMemo(
    () => ({
      name: "",
      description: "",
      price: 0,
      stock_quantity: 0,
      category: "",
      images: [],
      is_active: true,
      sizes: [],
      colors: [],
      tags: [],
    }),
    []
  );

  const openAdd = () => {
    setCurrent(empty);
    setPicked([]);
    setIsDialogOpen(true);
  };
  const openEdit = (p: Product) => {
    setCurrent({
      ...p,
      images: toStrArr(p.images),
      sizes: toStrArr(p.sizes),
      colors: toStrArr(p.colors),
      tags: toStrArr(p.tags),
      is_active: p.is_active ?? true,
    });
    setPicked([]);
    setIsDialogOpen(true);
  };
  const openDelete = (p: Product) => {
    setToDelete(p);
    setIsDeleteOpen(true);
  };

  const onField = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (!current) return;
    const { name, value } = e.target;
    if (name === "price")
      setCurrent({ ...current, price: parseFloat(value) || 0 });
    else if (name === "stock_quantity")
      setCurrent({ ...current, stock_quantity: Number(value) || 0 });
    else setCurrent({ ...current, [name]: value });
  };
  const onSelect = (k: keyof Product, v: string) =>
    current && setCurrent({ ...current, [k]: v });
  const onActive = (checked: boolean) =>
    current && setCurrent({ ...current, is_active: checked });

  // files
  const addFiles = (arr: File[]) => {
    const ok = [
      "image/png",
      "image/jpeg",
      "image/webp",
      "image/jpg",
      "image/gif",
    ];
    const keep = arr.filter((f) => ok.includes(f.type));
    const key = new Set(picked.map((f) => `${f.name}-${f.size}`));
    setPicked((prev) => [
      ...prev,
      ...keep.filter((f) => !key.has(`${f.name}-${f.size}`)),
    ]);
  };
  const onPick = (e: React.ChangeEvent<HTMLInputElement>) =>
    e.target.files && addFiles(Array.from(e.target.files));
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    addFiles(Array.from(e.dataTransfer.files || []));
  };
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };
  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };
  const removePicked = (f: File) =>
    setPicked((prev) =>
      prev.filter((x) => !(x.name === f.name && x.size === f.size))
    );

  const uploadPicked = async (): Promise<string[]> => {
    if (!picked.length) return [];
    const folder = uid ?? "public";
    const out: string[] = [];
    for (const file of picked) {
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
      const path = `${folder}/${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}.${ext}`;
      const { data, error } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, {
          upsert: false,
          cacheControl: "3600",
          contentType: file.type,
        });
      if (error) throw new Error(error.message);
      const { data: pub } = supabase.storage
        .from(BUCKET)
        .getPublicUrl(data.path);
      out.push(pub.publicUrl);
    }
    return out;
  };

  const validate = (p: Product) => {
    if (!p.name.trim()) throw new Error("Name required");
    if (!p.category) throw new Error("Category required");
    if (!Number.isFinite(p.price) || p.price < 0)
      throw new Error("Invalid price");
    if (!Number.isInteger(p.stock_quantity) || p.stock_quantity < 0)
      throw new Error("Invalid stock");
  };

  const resetDialog = () => {
    setIsDialogOpen(false);
    setCurrent(null);
    setPicked([]);
    setDragOver(false);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!current) return;
    try {
      setSaving(true);
      validate(current);
      const uploaded = await uploadPicked();
      const images = [...toStrArr(current.images), ...uploaded];

      const payload: Product = {
        name: current.name.trim(),
        description: current.description?.trim() || "",
        price: Number(current.price),
        stock_quantity: Number(current.stock_quantity),
        category: current.category,
        images,
        is_active: current.is_active ?? true,
        sizes: toStrArr(current.sizes),
        colors: toStrArr(current.colors),
        tags: toStrArr(current.tags),
      };

      if (current.id) {
        const { error } = await supabase
          .from("products")
          .update(payload)
          .eq("id", current.id);
        if (error) throw error;
        toast.success("Product updated");
      } else {
        const { error } = await supabase.from("products").insert(payload);
        if (error) throw error;
        toast.success("Product added");
      }
      onProductsChange();
      resetDialog();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!toDelete?.id) return;
    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", toDelete.id);
      if (error) throw error;
      toast.success("Product deleted");
      onProductsChange();
      setIsDeleteOpen(false);
      setToDelete(null);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Delete failed");
    }
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={openAdd}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Product
        </Button>
      </div>

      <div className="space-y-4">
        {products.map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between p-4 border rounded-lg"
          >
            <div className="flex items-center gap-4">
              <img
                src={p.images?.[0] || "https://via.placeholder.com/64"}
                alt={p.name}
                className="w-16 h-16 object-cover rounded-md bg-muted"
              />
              <div>
                <p className="font-semibold">{p.name}</p>
                <p className="text-sm text-muted-foreground">
                  {p.category} • ₹{Number(p.price).toFixed(2)} • Stock:{" "}
                  {p.stock_quantity}
                </p>
                <p className="text-xs mt-1">
                  Status:{" "}
                  <span
                    className={p.is_active ? "text-green-600" : "text-red-600"}
                  >
                    {p.is_active ? "Active" : "Inactive"}
                  </span>
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={() => openEdit(p)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="destructive"
                size="icon"
                onClick={() => openDelete(p)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog
        open={isDialogOpen}
        onOpenChange={(o) => (o ? setIsDialogOpen(true) : resetDialog())}
      >
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>
              {current?.id ? "Edit Product" : "Add New Product"}
            </DialogTitle>
          </DialogHeader>

          {current && (
            <form onSubmit={onSubmit}>
              <div className="grid gap-4 py-4">
                {/* Name */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={current.name}
                    onChange={onField}
                    className="col-span-3"
                    required
                  />
                </div>

                {/* Description */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={current.description}
                    onChange={onField}
                    className="col-span-3"
                  />
                </div>

                {/* Price */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="price" className="text-right">
                    Price
                  </Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    value={current.price}
                    onChange={onField}
                    className="col-span-3"
                    required
                  />
                </div>

                {/* Stock */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="stock_quantity" className="text-right">
                    Stock
                  </Label>
                  <Input
                    id="stock_quantity"
                    name="stock_quantity"
                    type="number"
                    value={current.stock_quantity}
                    onChange={onField}
                    className="col-span-3"
                    required
                  />
                </div>

                {/* Category */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="category" className="text-right">
                    Category
                  </Label>
                  <Select
                    value={current.category}
                    onValueChange={(v) => onSelect("category", v)}
                    required
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATS.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Active */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Active</Label>
                  <div className="col-span-3 flex items-center gap-3">
                    <Switch
                      checked={current.is_active ?? true}
                      onCheckedChange={onActive}
                    />
                    <span className="text-sm text-muted-foreground">
                      {current.is_active
                        ? "Visible in store"
                        : "Hidden from store"}
                    </span>
                  </div>
                </div>

                {/* Images: Drag & Drop + chooser */}
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label className="text-right">Images</Label>
                  <div className="col-span-3 space-y-2">
                    <div
                      className={`rounded-md border border-dashed p-5 text-center transition ${
                        dragOver ? "bg-muted/50 border-primary" : "bg-muted/20"
                      }`}
                      onDragOver={onDragOver}
                      onDragLeave={onDragLeave}
                      onDrop={onDrop}
                    >
                      <UploadCloud className="mx-auto mb-2 h-6 w-6" />
                      <p className="text-xs">Drag & drop images here</p>
                      <p className="text-xs text-muted-foreground">or</p>
                      <div className="mt-2 flex items-center justify-center gap-2">
                        <Input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={onPick}
                        />
                      </div>
                      <p className="mt-2 text-[11px] text-muted-foreground">
                        PNG/JPG/WEBP/GIF • up to ~5–10MB each
                      </p>
                    </div>

                    {/* New picks */}
                    {picked.length > 0 && (
                      <div className="grid grid-cols-4 gap-2">
                        {picked.map((f, i) => {
                          const url = URL.createObjectURL(f);
                          return (
                            <div
                              key={`${f.name}-${i}`}
                              className="relative rounded-md overflow-hidden border"
                            >
                              <img
                                src={url}
                                className="h-24 w-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={() => removePicked(f)}
                                className="absolute right-1 top-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white"
                                title="Remove"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Existing URLs */}
                    {toStrArr(current.images).length > 0 && (
                      <div className="grid grid-cols-4 gap-2">
                        {toStrArr(current.images).map((img, i) => (
                          <div
                            key={i}
                            className="aspect-square rounded-md overflow-hidden border"
                          >
                            <img
                              src={img}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="secondary">
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving..." : "Save Product"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              product "{toDelete?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
