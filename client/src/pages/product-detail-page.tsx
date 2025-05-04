import { MainLayout } from "@/layouts/MainLayout";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation, Link } from "wouter";
import { Product, Category } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, ShoppingCart, Plus, Minus, Truck, Package, ArrowLeft, Shield, TagIcon } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ProductCard } from "@/components/product-card";

// Component to fetch and display category name
function CategoryName({ categoryId }: { categoryId: number }) {
  const { data: category, isLoading } = useQuery<Category>({
    queryKey: [`/api/categories/${categoryId}`],
  });
  
  if (isLoading) return <span>Chargement...</span>;
  
  if (!category) return <span>Non catégorisé</span>;
  
  return (
    <Link href={`/categories/${categoryId}`}>
      <span className="text-primary hover:underline cursor-pointer">
        <TagIcon className="inline-block h-3 w-3 mr-1" />
        {category.name}
      </span>
    </Link>
  );
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const isClient = user?.role === 'client';
  
  // Fetch product details
  const {
    data: product,
    isLoading: productLoading,
    isError,
  } = useQuery<Product>({
    queryKey: [`/api/products/${id}`],
  });

  // Check if the product is in favorites
  const {
    data: favorites,
    isLoading: favoritesLoading,
  } = useQuery({
    queryKey: ["/api/client/favorites"],
    queryFn: async () => {
      if (!isClient) return [];
      const res = await fetch("/api/client/favorites");
      if (res.status === 401) return []; // Not logged in
      if (!res.ok) throw new Error("Failed to fetch favorites");
      const data = await res.json();
      return data.map((fav: any) => fav.productId);
    },
    enabled: !!isClient,
  });

  // Fetch related products
  const {
    data: relatedProducts,
    isLoading: relatedLoading,
  } = useQuery<Product[]>({
    queryKey: ["/api/products/related", id],
    queryFn: async () => {
      if (!product?.categoryId) return [];
      const res = await fetch(`/api/categories/${product.categoryId}/products`);
      if (!res.ok) throw new Error("Failed to fetch related products");
      const data = await res.json();
      // Filter out the current product and only keep a few
      return data.filter((p: Product) => p.id !== Number(id)).slice(0, 4);
    },
    enabled: !!product?.categoryId,
  });

  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: async () => {
      // This would be replaced with an actual cart API
      await new Promise(resolve => setTimeout(resolve, 500));
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: "Produit ajouté au panier",
        description: `${quantity} ${quantity > 1 ? 'articles ajoutés' : 'article ajouté'} au panier.`,
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

  // Toggle favorite mutation
  const toggleFavoriteMutation = useMutation({
    mutationFn: async (productId: number) => {
      const isFavorite = favorites?.includes(productId);
      
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
        title: data.added ? "Ajouté aux favoris" : "Retiré des favoris",
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

    if (!product) return;
    
    addToCartMutation.mutate();
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

    if (!product) return;
    
    toggleFavoriteMutation.mutate(product.id);
  };

  const isFavorite = !!favorites?.includes(Number(id));

  const handleIncreaseQuantity = () => {
    if (product && quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const handleDecreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  if (isError) {
    return (
      <MainLayout>
        <div className="container mx-auto py-12 px-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-neutral-800 mb-4">
              Produit non trouvé
            </h2>
            <p className="text-neutral-600 mb-6">
              Nous n'avons pas pu trouver le produit que vous recherchez.
            </p>
            <Button onClick={() => navigate("/products")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour aux produits
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-8 px-4">
        {/* Back button */}
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => window.history.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>

        {productLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Skeleton className="h-[400px] rounded-lg" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-10 w-1/3" />
              <div className="space-y-2 mt-6">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            </div>
          </div>
        ) : product ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Product Image */}
            <div className="bg-white rounded-lg overflow-hidden shadow-sm">
              <img
                src={product.imageUrl || "https://via.placeholder.com/600x400?text=Produit"}
                alt={product.name}
                className="w-full h-[400px] object-cover"
              />
            </div>

            {/* Product Details */}
            <div>
              <h1 className="text-3xl font-bold text-neutral-800 mb-2">{product.name}</h1>
              
              <div className="text-sm text-neutral-500 mb-4">
                {/* Dynamically fetch category name */}
                Catégorie: {product.categoryId ? (
                  <CategoryName categoryId={product.categoryId} />
                ) : "Non catégorisé"}
              </div>
              
              <p className="text-neutral-600 mb-6">
                {product.description || "Aucune description disponible pour ce produit."}
              </p>
              
              <div className="flex items-center mb-6">
                <span className="text-2xl font-bold text-neutral-800">
                  {product.price.toFixed(2)} €
                </span>
                <span className={`ml-3 px-2 py-1 text-xs rounded-full ${
                  product.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {product.stock > 0 ? `En stock (${product.stock})` : 'Rupture de stock'}
                </span>
              </div>
              
              {/* Quantity Selector */}
              {product.stock > 0 && (
                <div className="flex items-center mb-6">
                  <span className="mr-3 text-neutral-700">Quantité:</span>
                  <div className="flex items-center border border-neutral-300 rounded-md">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-none"
                      onClick={handleDecreaseQuantity}
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="px-4 py-1 border-x border-neutral-300">
                      {quantity}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-none"
                      onClick={handleIncreaseQuantity}
                      disabled={quantity >= product.stock}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  className="w-full"
                  disabled={product.stock <= 0 || addToCartMutation.isPending}
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  {product.stock <= 0 
                    ? "Rupture de stock" 
                    : addToCartMutation.isPending 
                      ? "Ajout en cours..." 
                      : "Ajouter au panier"}
                </Button>
                
                <Button
                  variant="outline"
                  className={`w-full ${isFavorite ? 'text-secondary border-secondary' : ''}`}
                  onClick={handleToggleFavorite}
                  disabled={toggleFavoriteMutation.isPending}
                >
                  <Heart className={`mr-2 h-4 w-4 ${isFavorite ? 'fill-secondary' : ''}`} />
                  {toggleFavoriteMutation.isPending
                    ? "Traitement en cours..."
                    : isFavorite
                    ? "Retirer des favoris"
                    : "Ajouter aux favoris"}
                </Button>
              </div>
              
              {/* Delivery Info */}
              <div className="border-t border-neutral-200 mt-6 pt-6">
                <div className="flex items-start space-x-3 mb-3">
                  <Truck className="h-5 w-5 text-neutral-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Livraison</h4>
                    <p className="text-sm text-neutral-600">
                      Livraison standard sous 3-5 jours ouvrés.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 mb-3">
                  <Package className="h-5 w-5 text-neutral-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Retours</h4>
                    <p className="text-sm text-neutral-600">
                      Retours acceptés sous 30 jours après réception.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Shield className="h-5 w-5 text-neutral-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Garantie</h4>
                    <p className="text-sm text-neutral-600">
                      Garantie légale de conformité de 2 ans.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* Product Tabs */}
        <div className="mt-12">
          <Tabs defaultValue="details">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Détails du produit</TabsTrigger>
              <TabsTrigger value="specs">Spécifications</TabsTrigger>
              <TabsTrigger value="reviews">Avis clients</TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="bg-white p-6 rounded-lg shadow-sm mt-4">
              <h3 className="font-semibold text-lg mb-3">Description du produit</h3>
              {productLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              ) : (
                <p className="text-neutral-600">
                  {product?.description || "Aucune description détaillée disponible pour ce produit."}
                </p>
              )}
            </TabsContent>
            <TabsContent value="specs" className="bg-white p-6 rounded-lg shadow-sm mt-4">
              <h3 className="font-semibold text-lg mb-3">Spécifications techniques</h3>
              {productLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border-b border-neutral-200 pb-2">
                    <span className="font-medium">Référence:</span> {product?.id}
                  </div>
                  <div className="border-b border-neutral-200 pb-2">
                    <span className="font-medium">Stock:</span> {product?.stock} unités
                  </div>
                  <div className="border-b border-neutral-200 pb-2">
                    <span className="font-medium">Poids:</span> Non spécifié
                  </div>
                  <div className="border-b border-neutral-200 pb-2">
                    <span className="font-medium">Dimensions:</span> Non spécifiées
                  </div>
                  <div className="border-b border-neutral-200 pb-2">
                    <span className="font-medium">Matériaux:</span> Non spécifiés
                  </div>
                  <div className="border-b border-neutral-200 pb-2">
                    <span className="font-medium">Origine:</span> Non spécifiée
                  </div>
                </div>
              )}
            </TabsContent>
            <TabsContent value="reviews" className="bg-white p-6 rounded-lg shadow-sm mt-4">
              <h3 className="font-semibold text-lg mb-3">Avis clients</h3>
              <p className="text-neutral-600">
                Aucun avis client disponible pour le moment.
              </p>
            </TabsContent>
          </Tabs>
        </div>

        {/* Related Products */}
        <div className="mt-12">
          <h2 className="text-2xl font-semibold mb-6">Produits similaires</h2>
          {relatedLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-64 w-full rounded-lg" />
              ))}
            </div>
          ) : relatedProducts && relatedProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {relatedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isFavorite={favorites?.includes(product.id)}
                />
              ))}
            </div>
          ) : (
            <p className="text-neutral-600">
              Aucun produit similaire trouvé.
            </p>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
