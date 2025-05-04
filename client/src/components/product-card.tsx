import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { Product } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { Link } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface ProductCardProps {
  product: Product;
  isFavorite?: boolean;
}

export function ProductCard({ product, isFavorite = false }: ProductCardProps) {
  const { user } = useAuth();
  const { addToCart, isLoading: isCartLoading } = useCart();
  const { toast } = useToast();
  const isClient = user?.role === 'client';

  const toggleFavoriteMutation = useMutation({
    mutationFn: async (productId: number) => {
      if (isFavorite) {
        await apiRequest("DELETE", `/api/client/favorites/${productId}`);
        return { added: false };
      } else {
        await apiRequest("POST", "/api/client/favorites", { productId });
        return { added: true };
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/client/favorites"] });
      toast({
        title: data.added ? "Produit ajouté aux favoris" : "Produit retiré des favoris",
        description: data.added 
          ? "Le produit a été ajouté à vos favoris." 
          : "Le produit a été retiré de vos favoris.",
        variant: "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAddToCart = () => {
    if (!isClient) {
      toast({
        title: "Connexion requise",
        description: "Vous devez être connecté en tant que client pour ajouter au panier.",
        variant: "default",
      });
      return;
    }
    addToCart(product);
  };

  const handleToggleFavorite = () => {
    if (!isClient) {
      toast({
        title: "Connexion requise",
        description: "Vous devez être connecté en tant que client pour ajouter aux favoris.",
        variant: "default",
      });
      return;
    }
    toggleFavoriteMutation.mutate(product.id);
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition duration-200">
      <div className="relative">
        <Link href={`/products/${product.id}`}>
          <img
            src={product.imageUrl || "https://via.placeholder.com/400x300?text=Produit"}
            alt={product.name}
            className="w-full h-48 object-cover cursor-pointer"
          />
        </Link>
        {isClient && (
          <Button
            variant="outline"
            size="icon"
            className="absolute top-2 right-2 bg-white rounded-full shadow"
            onClick={handleToggleFavorite}
          >
            <Heart
              className={`h-4 w-4 ${isFavorite ? 'fill-secondary text-secondary' : 'text-neutral-600'}`}
            />
          </Button>
        )}
      </div>
      <CardContent className="p-4">
        <div className="text-xs text-neutral-500 mb-1">
          {/* Category name would come from the API with the proper join */}
          Catégorie
        </div>
        <Link href={`/products/${product.id}`}>
          <h4 className="text-lg font-medium mb-2 cursor-pointer hover:text-primary transition">{product.name}</h4>
        </Link>
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold">{product.price.toFixed(2)} €</span>
          <span className="text-sm text-neutral-600">Stock: {product.stock}</span>
        </div>
        <Button
          className="mt-4 w-full"
          onClick={handleAddToCart}
          disabled={!isClient || product.stock <= 0 || isCartLoading}
        >
          {product.stock <= 0 ? "Rupture de stock" : "Ajouter au panier"}
        </Button>
      </CardContent>
    </Card>
  );
}
