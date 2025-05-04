import { useState, useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Category, Supplier } from "@shared/schema";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

interface FilterSidebarProps {
  onFilter: (filters: FilterOptions) => void;
  initialFilters?: Partial<FilterOptions>;
}

export interface FilterOptions {
  categoryIds: number[];
  supplierIds: number[];
  minPrice: number;
  maxPrice: number;
  inStock: boolean;
}

export function FilterSidebar({ onFilter, initialFilters }: FilterSidebarProps) {
  // Default filter state
  const [filters, setFilters] = useState<FilterOptions>({
    categoryIds: initialFilters?.categoryIds || [],
    supplierIds: initialFilters?.supplierIds || [],
    minPrice: initialFilters?.minPrice || 0,
    maxPrice: initialFilters?.maxPrice || 1000,
    inStock: initialFilters?.inStock || false,
  });

  // Price range slider value
  const [priceRange, setPriceRange] = useState<[number, number]>([
    filters.minPrice, 
    filters.maxPrice
  ]);

  // Fetch categories
  const {
    data: categories,
    isLoading: categoriesLoading,
  } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  // Fetch suppliers
  const {
    data: suppliers,
    isLoading: suppliersLoading,
  } = useQuery<Supplier[]>({
    queryKey: ["/api/suppliers"],
    queryFn: async () => {
      // This is a placeholder until the actual API is implemented
      return [];
    },
  });

  // Apply filters when the price range changes
  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      minPrice: priceRange[0],
      maxPrice: priceRange[1]
    }));
  }, [priceRange]);

  // Handle category checkbox changes
  const handleCategoryChange = (categoryId: number, checked: boolean) => {
    setFilters(prev => {
      if (checked) {
        return {
          ...prev,
          categoryIds: [...prev.categoryIds, categoryId],
        };
      } else {
        return {
          ...prev,
          categoryIds: prev.categoryIds.filter(id => id !== categoryId),
        };
      }
    });
  };

  // Handle supplier checkbox changes
  const handleSupplierChange = (supplierId: number, checked: boolean) => {
    setFilters(prev => {
      if (checked) {
        return {
          ...prev,
          supplierIds: [...prev.supplierIds, supplierId],
        };
      } else {
        return {
          ...prev,
          supplierIds: prev.supplierIds.filter(id => id !== supplierId),
        };
      }
    });
  };

  // Handle in stock checkbox change
  const handleInStockChange = (checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      inStock: checked,
    }));
  };

  // Apply filters
  const applyFilters = () => {
    onFilter(filters);
  };

  // Reset filters
  const resetFilters = () => {
    const resetValues = {
      categoryIds: [],
      supplierIds: [],
      minPrice: 0,
      maxPrice: 1000,
      inStock: false,
    };
    setFilters(resetValues);
    setPriceRange([0, 1000]);
    onFilter(resetValues);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 sticky top-4">
      <h3 className="font-semibold text-lg mb-4">Filtres</h3>
      
      {/* Categories */}
      <div className="mb-6">
        <h4 className="font-medium mb-2">Catégories</h4>
        {categoriesLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center">
                <Skeleton className="h-4 w-4 mr-2" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {categories?.map((category) => (
              <div key={category.id} className="flex items-center">
                <Checkbox 
                  id={`cat-${category.id}`}
                  checked={filters.categoryIds.includes(category.id)}
                  onCheckedChange={(checked) => 
                    handleCategoryChange(category.id, checked as boolean)
                  }
                />
                <Label
                  htmlFor={`cat-${category.id}`}
                  className="ml-2 text-sm font-normal cursor-pointer"
                >
                  {category.name}
                </Label>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Price Range */}
      <div className="mb-6">
        <h4 className="font-medium mb-2">Prix</h4>
        <div className="space-y-3">
          <Slider
            value={priceRange}
            min={0}
            max={1000}
            step={5}
            onValueChange={(value) => setPriceRange(value as [number, number])}
            className="my-4"
          />
          <div className="flex justify-between">
            <div className="border border-neutral-300 rounded px-2 py-1 w-20 text-center text-sm">
              {priceRange[0]} €
            </div>
            <div className="border border-neutral-300 rounded px-2 py-1 w-20 text-center text-sm">
              {priceRange[1]} €
            </div>
          </div>
        </div>
      </div>
      
      {/* Suppliers */}
      <div className="mb-6">
        <h4 className="font-medium mb-2">Fournisseurs</h4>
        {suppliersLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center">
                <Skeleton className="h-4 w-4 mr-2" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))}
          </div>
        ) : suppliers && suppliers.length > 0 ? (
          <div className="space-y-2">
            {suppliers.map((supplier) => (
              <div key={supplier.id} className="flex items-center">
                <Checkbox 
                  id={`sup-${supplier.id}`}
                  checked={filters.supplierIds.includes(supplier.id)}
                  onCheckedChange={(checked) => 
                    handleSupplierChange(supplier.id, checked as boolean)
                  }
                />
                <Label
                  htmlFor={`sup-${supplier.id}`}
                  className="ml-2 text-sm font-normal cursor-pointer"
                >
                  {supplier.companyName}
                </Label>
              </div>
            ))}
          </div>
        ) : (
          // Fallback sample suppliers
          <div className="space-y-2">
            <div className="flex items-center">
              <Checkbox id="sup-matbtp" />
              <Label
                htmlFor="sup-matbtp"
                className="ml-2 text-sm font-normal cursor-pointer"
              >
                MatBTP
              </Label>
            </div>
            <div className="flex items-center">
              <Checkbox id="sup-bricopro" />
              <Label
                htmlFor="sup-bricopro"
                className="ml-2 text-sm font-normal cursor-pointer"
              >
                BricoPro
              </Label>
            </div>
            <div className="flex items-center">
              <Checkbox id="sup-peinturedeco" />
              <Label
                htmlFor="sup-peinturedeco"
                className="ml-2 text-sm font-normal cursor-pointer"
              >
                PeintureDeco
              </Label>
            </div>
            <div className="flex items-center">
              <Checkbox id="sup-elecplomb" />
              <Label
                htmlFor="sup-elecplomb"
                className="ml-2 text-sm font-normal cursor-pointer"
              >
                ElecPlomb
              </Label>
            </div>
          </div>
        )}
      </div>
      
      {/* Availability */}
      <div className="mb-6">
        <h4 className="font-medium mb-2">Disponibilité</h4>
        <div className="space-y-2">
          <div className="flex items-center">
            <Checkbox 
              id="avail-stock" 
              checked={filters.inStock}
              onCheckedChange={(checked) => handleInStockChange(checked as boolean)}
            />
            <Label
              htmlFor="avail-stock"
              className="ml-2 text-sm font-normal cursor-pointer"
            >
              En stock
            </Label>
          </div>
        </div>
      </div>
      
      <div className="mt-6 pt-4 border-t border-neutral-200 flex justify-between">
        <Button variant="ghost" onClick={resetFilters}>
          Réinitialiser
        </Button>
        <Button onClick={applyFilters}>
          Appliquer
        </Button>
      </div>
    </div>
  );
}
