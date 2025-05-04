import { MainLayout } from "@/layouts/MainLayout";
import { ProductCard } from "@/components/product-card";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Product } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useState } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";

export default function FavoritesPage() {
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Fetch favorites
  const {
    data: favorites,
    isLoading: favoritesLoading,
    refetch: refetchFavorites,
  } = useQuery({
    queryKey: ["/api/client/favorites"],
  });

  // Fetch products based on favorite IDs
  const {
    data: products,
    isLoading: productsLoading,
  } = useQuery<Product[]>({
    queryKey: ["/api/products/favorites"],
    queryFn: async () => {
      if (!favorites || favorites.length === 0) return [];
      
      // In a real app, you would have an API endpoint to get products by IDs
      // For now, let's simulate by fetching all products and filtering
      const res = await fetch("/api/products");
      if (!res.ok) throw new Error("Failed to fetch products");
      
      const allProducts = await res.json();
      const favoriteProductIds = favorites.map((fav: any) => fav.productId);
      
      return allProducts.filter((product: Product) => 
        favoriteProductIds.includes(product.id)
      );
    },
    enabled: !!favorites && favorites.length > 0,
  });

  // Clear all favorites mutation
  const clearAllFavoritesMutation = useMutation({
    mutationFn: async () => {
      // In a real app, you would have an API endpoint to clear all favorites
      // For now, let's delete them one by one
      if (!favorites) return;
      
      for (const fav of favorites) {
        await apiRequest("DELETE", `/api/client/favorites/${fav.productId}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/client/favorites"] });
      refetchFavorites();
      
      toast({
        title: "Favoris supprimés",
        description: "Tous vos favoris ont été supprimés.",
        variant: "default",
      });
      
      setIsDeleteDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleClearAllFavorites = () => {
    clearAllFavoritesMutation.mutate();
  };

  const isLoading = favoritesLoading || productsLoading;
  const favoriteProductIds = favorites?.map((fav: any) => fav.productId) || [];
  const hasProducts = !!products && products.length > 0;

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Mes favoris</h2>
          
          {hasProducts && (
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="outline" 
                  className="text-red-500 border-red-500 hover:bg-red-50"
                  disabled={clearAllFavoritesMutation.isPending}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Tout supprimer
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Supprimer tous les favoris ?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Cette action ne peut pas être annulée. Tous vos produits favoris seront supprimés de votre liste.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleClearAllFavorites}
                    className="bg-red-500 hover:bg-red-600"
                  >
                    Supprimer
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-64 w-full rounded-lg" />
            ))}
          </div>
        ) : hasProducts ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isFavorite={favoriteProductIds.includes(product.id)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <h3 className="text-xl font-medium mb-4">Vous n'avez pas encore de favoris</h3>
            <p className="text-neutral-600 mb-6">
              Ajoutez des produits à vos favoris pour les retrouver facilement plus tard.
            </p>
            <Link href="/products">
              <Button>
                Découvrir nos produits
              </Button>
            </Link>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
