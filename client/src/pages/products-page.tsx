import { MainLayout } from "@/layouts/MainLayout";
import { ProductGrid } from "@/components/product-grid";
import { FilterSidebar, FilterOptions } from "@/components/filter-sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Product, Category } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useRoute } from "wouter";

export default function ProductsPage() {
  // Check if we're coming from a category page
  const [, params] = useRoute<{ id: string }>('/categories/:id');
  const categoryId = params?.id ? parseInt(params.id) : undefined;
  
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [sortBy, setSortBy] = useState("relevance");
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<FilterOptions>({
    categoryIds: categoryId ? [categoryId] : [],
    supplierIds: [],
    minPrice: 0,
    maxPrice: 1000,
    inStock: false,
  });
  
  // Fetch category info if we're filtering by category
  const {
    data: category
  } = useQuery<Category>({
    queryKey: ['/api/categories', categoryId],
    enabled: !!categoryId,
    queryFn: async () => {
      const res = await fetch(`/api/categories/${categoryId}`);
      if (!res.ok) return null;
      return res.json();
    }
  });

  // Fetch all products with filters
  const {
    data: products,
    isLoading: productsLoading,
    refetch,
  } = useQuery<Product[]>({
    queryKey: [
      "/api/products/filter",
      {
        page: currentPage,
        categoryIds: filters.categoryIds.join(","),
        supplierIds: filters.supplierIds.join(","),
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        inStock: filters.inStock,
        sortBy,
      },
    ],
    queryFn: async ({ queryKey }) => {
      // If we're searching, don't use filters
      if (isSearching && searchQuery) {
        const res = await fetch(`/api/products/search?q=${encodeURIComponent(searchQuery)}`);
        if (!res.ok) throw new Error("Failed to fetch products");
        return res.json();
      }

      // Build filter query string
      const [_, params] = queryKey;
      const queryParams = new URLSearchParams();
      
      Object.entries(params as Record<string, any>).forEach(([key, value]) => {
        if (value !== undefined && value !== "") {
          queryParams.append(key, value.toString());
        }
      });
      
      const res = await fetch(`/api/products/filter?${queryParams.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch products");
      return res.json();
    },
  });

  // Fetch favorites if user is logged in (to highlight favorite products)
  const {
    data: favorites,
  } = useQuery({
    queryKey: ["/api/client/favorites"],
    queryFn: async () => {
      const res = await fetch("/api/client/favorites");
      if (res.status === 401) return []; // Not logged in
      if (!res.ok) throw new Error("Failed to fetch favorites");
      const data = await res.json();
      return data.map((fav: any) => fav.productId);
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(!!searchQuery);
    refetch();
  };

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
    setIsSearching(false);
    setCurrentPage(1);
    refetch();
  };

  const clearSearch = () => {
    setSearchQuery("");
    setIsSearching(false);
    refetch();
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    refetch();
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">
          {isSearching && searchQuery 
            ? `Résultats pour "${searchQuery}"` 
            : category 
              ? `Produits dans "${category.name}"`
              : "Tous les produits"}
        </h2>
        {category && (
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <p className="text-neutral-600">
              {category.description || `Explorez notre sélection de produits dans la catégorie ${category.name}.`}
            </p>
          </div>
        )}
        
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Mobile filter button (visible on small screens) */}
          <div className="lg:hidden mb-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="w-full">
                  <SlidersHorizontal className="mr-2 h-4 w-4" />
                  Filtres
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[400px] overflow-y-auto">
                <div className="py-6">
                  <FilterSidebar onFilter={handleFilterChange} initialFilters={filters} />
                </div>
              </SheetContent>
            </Sheet>
          </div>
          
          {/* Filters Sidebar (desktop) */}
          <div className="hidden lg:block lg:w-64 order-2 lg:order-1">
            <FilterSidebar onFilter={handleFilterChange} initialFilters={filters} />
          </div>
          
          {/* Products */}
          <div className="lg:w-3/4 order-1 lg:order-2">
            {/* Search and Sort */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-grow">
                  <form onSubmit={handleSearch} className="relative">
                    <Input 
                      type="text" 
                      placeholder="Rechercher un produit..." 
                      className="w-full pl-10" 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        className="absolute right-10 top-1/2 transform -translate-y-1/2"
                        onClick={clearSearch}
                      >
                        <X className="h-4 w-4 text-neutral-500" />
                      </Button>
                    )}
                    <Button 
                      type="submit" 
                      variant="ghost" 
                      size="icon" 
                      className="absolute left-2 top-1/2 transform -translate-y-1/2"
                    >
                      <Search className="h-4 w-4 text-neutral-500" />
                    </Button>
                  </form>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-neutral-600 whitespace-nowrap">Trier par:</span>
                  <Select value={sortBy} onValueChange={handleSortChange}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Pertinence" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="relevance">Pertinence</SelectItem>
                      <SelectItem value="price_asc">Prix croissant</SelectItem>
                      <SelectItem value="price_desc">Prix décroissant</SelectItem>
                      <SelectItem value="newest">Nouveautés</SelectItem>
                      <SelectItem value="popularity">Popularité</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            {/* Active Filters */}
            {(filters.categoryIds.length > 0 || 
              filters.supplierIds.length > 0 || 
              filters.inStock || 
              filters.minPrice > 0 || 
              filters.maxPrice < 1000) && (
              <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-sm font-medium text-neutral-600">Filtres actifs:</span>
                  
                  {/* Category filters */}
                  {category && (
                    <div className="bg-primary-light/10 text-primary text-xs px-2 py-1 rounded-full flex items-center">
                      Catégorie: {category.name}
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-4 w-4 ml-1 p-0" 
                        onClick={() => handleFilterChange({...filters, categoryIds: []})}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                  
                  {/* Stock filter */}
                  {filters.inStock && (
                    <div className="bg-primary-light/10 text-primary text-xs px-2 py-1 rounded-full flex items-center">
                      En stock
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-4 w-4 ml-1 p-0" 
                        onClick={() => handleFilterChange({...filters, inStock: false})}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                  
                  {/* Price filter */}
                  {(filters.minPrice > 0 || filters.maxPrice < 1000) && (
                    <div className="bg-primary-light/10 text-primary text-xs px-2 py-1 rounded-full flex items-center">
                      Prix: {filters.minPrice}€ - {filters.maxPrice}€
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-4 w-4 ml-1 p-0" 
                        onClick={() => handleFilterChange({...filters, minPrice: 0, maxPrice: 1000})}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )}

                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs ml-auto"
                    onClick={() => handleFilterChange({
                      categoryIds: [],
                      supplierIds: [],
                      minPrice: 0,
                      maxPrice: 1000,
                      inStock: false,
                    })}
                  >
                    Tout effacer
                  </Button>
                </div>
              </div>
            )}
            
            {/* Products Grid */}
            <ProductGrid 
              products={products} 
              loading={productsLoading}
              favorites={favorites}
              query={isSearching ? searchQuery : undefined} 
            />
            
            {/* Pagination - only show if we have products and not searching */}
            {products && products.length > 0 && !isSearching && (
              <div className="mt-8 flex justify-center">
                <nav className="flex items-center space-x-1">
                  <Button
                    variant="outline"
                    size="icon"
                    disabled={currentPage === 1}
                    onClick={() => {
                      setCurrentPage(prev => Math.max(1, prev - 1));
                      refetch();
                    }}
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </Button>
                  
                  <Button 
                    variant={currentPage === 1 ? "default" : "outline"}
                    onClick={() => {
                      setCurrentPage(1);
                      refetch();
                    }}
                  >
                    1
                  </Button>
                  
                  {/* Add more pagination buttons as needed */}
                  {currentPage > 3 && <span className="px-2">...</span>}
                  
                  {currentPage > 2 && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setCurrentPage(currentPage - 1);
                        refetch();
                      }}
                    >
                      {currentPage - 1}
                    </Button>
                  )}
                  
                  {currentPage > 1 && currentPage < 10 && (
                    <Button
                      variant="default"
                    >
                      {currentPage}
                    </Button>
                  )}
                  
                  {currentPage < 9 && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setCurrentPage(currentPage + 1);
                        refetch();
                      }}
                    >
                      {currentPage + 1}
                    </Button>
                  )}
                  
                  {currentPage < 8 && <span className="px-2">...</span>}
                  
                  <Button
                    variant={currentPage === 10 ? "default" : "outline"}
                    onClick={() => {
                      setCurrentPage(10);
                      refetch();
                    }}
                  >
                    10
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="icon"
                    disabled={currentPage === 10}
                    onClick={() => {
                      setCurrentPage(prev => Math.min(10, prev + 1));
                      refetch();
                    }}
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Button>
                </nav>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
