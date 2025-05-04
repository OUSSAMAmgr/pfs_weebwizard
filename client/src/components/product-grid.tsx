import { ProductCard } from "@/components/product-card";
import { Product } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

interface ProductGridProps {
  products?: Product[];
  loading?: boolean;
  favorites?: number[];
  categoryId?: number;
  query?: string;
}

export function ProductGrid({
  products: propProducts,
  loading: propLoading,
  favorites = [],
  categoryId,
  query,
}: ProductGridProps) {
  // If products are passed as props, use them directly
  const usingPropsProducts = !!propProducts;

  // Otherwise, fetch products based on categoryId or query
  const {
    data: fetchedProducts,
    isLoading: isFetchLoading,
  } = useQuery({
    queryKey: query
      ? ["/api/products/search", { q: query }]
      : categoryId
      ? ["/api/categories", categoryId, "products"]
      : ["/api/products"],
    queryFn: async ({ queryKey }) => {
      if (queryKey[0] === "/api/products/search") {
        const res = await fetch(`/api/products/search?q=${encodeURIComponent(query!)}`);
        if (!res.ok) throw new Error("Failed to fetch products");
        return res.json();
      } else if (queryKey[0] === "/api/categories") {
        const res = await fetch(`/api/categories/${categoryId}/products`);
        if (!res.ok) throw new Error("Failed to fetch products");
        return res.json();
      } else {
        const res = await fetch("/api/products");
        if (!res.ok) throw new Error("Failed to fetch products");
        return res.json();
      }
    },
    enabled: !usingPropsProducts,
  });

  const products = usingPropsProducts ? propProducts : fetchedProducts;
  const loading = usingPropsProducts ? propLoading : isFetchLoading;

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-48 w-full rounded-md" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-6 w-full" />
            <div className="flex justify-between">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-20" />
            </div>
            <Skeleton className="h-10 w-full mt-2" />
          </div>
        ))}
      </div>
    );
  }

  if (!products?.length) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-neutral-700">Aucun produit trouvé</h3>
        <p className="text-neutral-500 mt-2">
          {query
            ? `Aucun résultat pour "${query}"`
            : categoryId
            ? "Aucun produit dans cette catégorie"
            : "Aucun produit disponible pour le moment"}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          isFavorite={favorites?.includes(product.id)}
        />
      ))}
    </div>
  );
}
