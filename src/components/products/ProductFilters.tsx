import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Filter } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface FilterState {
  search: string;
  category: string[];
  priceRange: [number, number];
  sizes: string[];
  colors: string[];
  tags: string[];
  sortBy: string;
  inStock: boolean;
}

interface ProductFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onClearFilters: () => void;
  availableCategories: string[];
  availableSizes: string[];
  availableColors: string[];
  availableTags: string[];
  priceRange: [number, number];
  totalProducts: number;
}

const ProductFilters: React.FC<ProductFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  availableCategories,
  availableSizes,
  availableColors,
  availableTags,
  priceRange,
  totalProducts,
}) => {
  const updateFilters = (key: keyof FilterState, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const toggleArrayFilter = (key: 'category' | 'sizes' | 'colors' | 'tags', value: string) => {
    const currentArray = filters[key];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    updateFilters(key, newArray);
  };

  const hasActiveFilters = 
    filters.category.length > 0 ||
    filters.sizes.length > 0 ||
    filters.colors.length > 0 ||
    filters.tags.length > 0 ||
    filters.priceRange[0] > priceRange[0] ||
    filters.priceRange[1] < priceRange[1] ||
    filters.inStock ||
    filters.search.trim() !== '';

  return (
    <Card className="h-fit">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-heading">
            <Filter className="inline h-5 w-5 mr-2" />
            Filters
          </CardTitle>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          {totalProducts} products found
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Search */}
        <div className="space-y-2">
          <Label htmlFor="search">Search Products</Label>
          <Input
            id="search"
            placeholder="Search by name..."
            value={filters.search}
            onChange={(e) => updateFilters('search', e.target.value)}
          />
        </div>

        {/* Sort */}
        <div className="space-y-2">
          <Label>Sort By</Label>
          <Select value={filters.sortBy} onValueChange={(value) => updateFilters('sortBy', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name-asc">Name (A-Z)</SelectItem>
              <SelectItem value="name-desc">Name (Z-A)</SelectItem>
              <SelectItem value="price-asc">Price (Low to High)</SelectItem>
              <SelectItem value="price-desc">Price (High to Low)</SelectItem>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Price Range */}
        <div className="space-y-3">
          <Label>Price Range</Label>
          <div className="px-3">
            <Slider
              value={filters.priceRange}
              onValueChange={(value) => updateFilters('priceRange', value as [number, number])}
              min={priceRange[0]}
              max={priceRange[1]}
              step={100}
              className="w-full"
            />
          </div>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>₹{filters.priceRange[0]}</span>
            <span>₹{filters.priceRange[1]}</span>
          </div>
        </div>

        {/* Stock Filter */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="inStock"
            checked={filters.inStock}
            onCheckedChange={(checked) => updateFilters('inStock', checked)}
          />
          <Label htmlFor="inStock" className="text-sm">
            In Stock Only
          </Label>
        </div>

        {/* Categories */}
        {availableCategories.length > 0 && (
          <Collapsible defaultOpen>
            <CollapsibleTrigger className="flex items-center justify-between w-full">
              <Label className="text-sm font-medium">Categories</Label>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2 mt-3">
              {availableCategories.map((category) => (
                <div key={category} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${category}`}
                    checked={filters.category.includes(category)}
                    onCheckedChange={() => toggleArrayFilter('category', category)}
                  />
                  <Label htmlFor={`category-${category}`} className="text-sm capitalize">
                    {category}
                  </Label>
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>
        )}


        {/* Tags */}
        {availableTags.length > 0 && (
          <Collapsible>
            <CollapsibleTrigger className="flex items-center justify-between w-full">
              <Label className="text-sm font-medium">Tags</Label>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3">
              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant={filters.tags.includes(tag) ? "default" : "outline"}
                    className="cursor-pointer text-xs capitalize hover:bg-primary/10"
                    onClick={() => toggleArrayFilter('tags', tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Active Filters</Label>
            <div className="flex flex-wrap gap-2">
              {filters.category.map((category) => (
                <Badge key={category} variant="secondary" className="text-xs">
                  {category}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 ml-1 hover:bg-transparent"
                    onClick={() => toggleArrayFilter('category', category)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
              {filters.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 ml-1 hover:bg-transparent"
                    onClick={() => toggleArrayFilter('tags', tag)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductFilters;