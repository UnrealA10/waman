import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Grid, List, SlidersHorizontal } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import ProductCard from "@/components/products/ProductCard";
import ProductFilters from "@/components/products/ProductFilters";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
  category?: string;
  sizes?: string[];
  colors?: string[];
  tags?: string[];
  brand?: string;
  material?: string;
  occasion?: string;
  stock_quantity: number;
  is_active: boolean;
  description?: string;
  created_at: string;
}

interface FilterState {
  search: string;
  category: string[];
  priceRange: [number, number];
  sizes: string[];
  colors: string[];
  tags: string[];
  brand: string[];
  material: string[];
  occasion: string[];
  sortBy: string;
  inStock: boolean;
}

const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();

  const [gridRef, gridInView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const initialFilters: FilterState = useMemo(
    () => ({
      search: searchParams.get("search") || "",
      category: searchParams.getAll("category") || [],
      priceRange: [
        Number(searchParams.get("minPrice")) || 0,
        Number(searchParams.get("maxPrice")) || 50000,
      ],
      sizes: searchParams.getAll("sizes") || [],
      colors: searchParams.getAll("colors") || [],
      tags: searchParams.getAll("tags") || [],
      brand: searchParams.getAll("brand") || [],
      material: searchParams.getAll("material") || [],
      occasion: searchParams.getAll("occasion") || [],
      sortBy: searchParams.get("sortBy") || "newest",
      inStock: searchParams.get("inStock") === "true",
    }),
    [searchParams]
  );

  const [filters, setFilters] = useState<FilterState>(initialFilters);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("is_active", true)
          .order("created_at", { ascending: false });

        if (error) throw error;

        const transformedProducts = (data || []).map((product) => ({
          id: product.id,
          name: product.name,
          price: product.price,
          images: Array.isArray(product.images)
            ? product.images.filter((img): img is string => !!img)
            : [],
          sizes: Array.isArray(product.sizes)
            ? product.sizes.filter((size): size is string => !!size)
            : [],
          colors: Array.isArray(product.colors)
            ? product.colors.filter((color): color is string => !!color)
            : [],
          tags: Array.isArray(product.tags)
            ? product.tags.filter((tag): tag is string => !!tag)
            : [],
          stock_quantity: product.stock_quantity || 0,
          is_active: product.is_active || false,
          category: product.category || undefined,
          description: product.description || undefined,
          created_at: product.created_at,
          brand: product.brand || undefined,
          material: product.material || undefined,
          occasion: product.occasion || undefined,
        }));

        setProducts(transformedProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
        toast({
          title: "Error",
          description: "Failed to load products. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [toast]);

  const filterOptions = useMemo(() => {
    // --- MODIFICATION START ---
    // Using the specific list you provided for the category filter.
    const categories = [
        "Dresses (Men)",
        "Top (Men)",
        "Bottom (Men)",
        "Kurtis for Women",
        "Western (Women)",
        "Indian Dresses (Women)"
    ];
    // --- MODIFICATION END ---

    const sizes = [...new Set(products.flatMap((p) => p.sizes || []))];
    const colors = [...new Set(products.flatMap((p) => p.colors || []))];
    const tags = [...new Set(products.flatMap((p) => p.tags || []))];
    const prices = products.map((p) => p.price);
    const priceRange: [number, number] =
      prices.length > 0
        ? [Math.floor(Math.min(...prices)), Math.ceil(Math.max(...prices))]
        : [0, 50000];

    const brands = [...new Set(products.map((p) => p.brand!).filter(Boolean))];
    const materials = [...new Set(products.map((p) => p.material!).filter(Boolean))];
    const occasions = [...new Set(products.map((p) => p.occasion!).filter(Boolean))];

    return { categories, sizes, colors, tags, priceRange, brands, materials, occasions };
  }, [products]);

  const filteredProducts = useMemo(() => {
    let filtered = products.filter((product) => {
      if (
        filters.search &&
        !product.name.toLowerCase().includes(filters.search.toLowerCase()) &&
        !product.description
          ?.toLowerCase()
          .includes(filters.search.toLowerCase())
      )
        return false;
      if (
        filters.category.length > 0 &&
        (!product.category || !filters.category.includes(product.category))
      )
        return false;
      if (
        product.price < filters.priceRange[0] ||
        product.price > filters.priceRange[1]
      )
        return false;
      if (
        filters.sizes.length > 0 &&
        !filters.sizes.some((size) => product.sizes?.includes(size))
      )
        return false;
      if (
        filters.colors.length > 0 &&
        !filters.colors.some((color) => product.colors?.includes(color))
      )
        return false;
      if (
        filters.tags.length > 0 &&
        !filters.tags.some((tag) => product.tags?.includes(tag))
      )
        return false;
      if (filters.inStock && product.stock_quantity <= 0) return false;

      if (
        filters.brand.length > 0 &&
        (!product.brand || !filters.brand.includes(product.brand))
      )
        return false;

      if (
        filters.material.length > 0 &&
        (!product.material || !filters.material.includes(product.material))
      )
        return false;

      if (
        filters.occasion.length > 0 &&
        (!product.occasion || !filters.occasion.includes(product.occasion))
      )
        return false;

      return true;
    });

    return [...filtered].sort((a, b) => {
      switch (filters.sortBy) {
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        case "oldest":
          return (
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
        default:
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
      }
    });
  }, [products, filters]);

  const handleFiltersChange = (newFilters: Partial<FilterState>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);

    const params = new URLSearchParams();

    if (updatedFilters.search) params.set("search", updatedFilters.search);
    if (updatedFilters.sortBy !== "newest") params.set("sortBy", updatedFilters.sortBy);
    if (updatedFilters.inStock) params.set("inStock", "true");

    updatedFilters.category.forEach(val => params.append("category", val));
    updatedFilters.sizes.forEach(val => params.append("sizes", val));
    updatedFilters.colors.forEach(val => params.append("colors", val));
    updatedFilters.tags.forEach(val => params.append("tags", val));
    updatedFilters.brand.forEach(val => params.append("brand", val));
    updatedFilters.material.forEach(val => params.append("material", val));
    updatedFilters.occasion.forEach(val => params.append("occasion", val));

    // Check against initial price range which can be derived from all products
    const initialPriceRange = filterOptions.priceRange;
    if (updatedFilters.priceRange[0] !== initialPriceRange[0]) {
      params.set("minPrice", String(updatedFilters.priceRange[0]));
    }
    if (updatedFilters.priceRange[1] !== initialPriceRange[1]) {
      params.set("maxPrice", String(updatedFilters.priceRange[1]));
    }

    setSearchParams(params, { replace: true });
  };

  const clearFilters = () => {
    const clearedFilters: FilterState = {
      search: "",
      category: [],
      priceRange: filterOptions.priceRange,
      sizes: [],
      colors: [],
      tags: [],
      brand: [],
      material: [],
      occasion: [],
      sortBy: "newest",
      inStock: false,
    };
    setFilters(clearedFilters);
    setSearchParams({}, { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream to-blush/10">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-deep-brown mb-2">
              Shop Collection
            </h1>
            <p className="text-muted-foreground">
              Discover our curated selection of luxury fashion
            </p>
          </div>

          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <div className="hidden md:flex items-center border border-border rounded-lg p-1">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="h-8"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="h-8"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
            <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="md:hidden">
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80">
                <SheetHeader>
                  <SheetTitle>Product Filters</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <ProductFilters
                    filters={filters}
                    onFiltersChange={handleFiltersChange}
                    onClearFilters={clearFilters}
                    availableCategories={filterOptions.categories}
                    availableSizes={filterOptions.sizes}
                    availableColors={filterOptions.colors}
                    availableTags={filterOptions.tags}
                    availableMaterials={filterOptions.materials}
                    availableOccasions={filterOptions.occasions}
                    priceRange={filterOptions.priceRange}
                    totalProducts={filteredProducts.length}
                  />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <div className="flex gap-8">
          <aside className="hidden md:block w-80 flex-shrink-0 sticky top-24 self-start h-[calc(100vh-6rem)] overflow-y-auto">
            <ProductFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onClearFilters={clearFilters}
              availableCategories={filterOptions.categories}
              availableSizes={filterOptions.sizes}
              availableColors={filterOptions.colors}
              availableTags={filterOptions.tags}
              availableMaterials={filterOptions.materials}
              availableOccasions={filterOptions.occasions}
              priceRange={filterOptions.priceRange}
              totalProducts={filteredProducts.length}
            />
          </aside>

          <main className="flex-1">
            {loading ? (
              <div
                className={`grid gap-6 ${
                  viewMode === "grid"
                    ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                    : "grid-cols-1"
                }`}
              >
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="space-y-4">
                    <Skeleton className="aspect-[3/4] w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-muted-foreground mb-2">
                  No products found
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Try adjusting your filters or search terms
                </p>
                <Button onClick={clearFilters} variant="outline">
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div
                ref={gridRef}
                className={`grid gap-6 ${
                  viewMode === "grid"
                    ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                    : "grid-cols-1"
                }`}
              >
                <AnimatePresence>
                  {filteredProducts.map((product, index) => (
                    <motion.div
                      key={product.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={
                        gridInView
                          ? { opacity: 1, y: 0 }
                          : { opacity: 0, y: 20 }
                      }
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.5, delay: index * 0.05 }}
                    >
                      <ProductCard product={product} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;