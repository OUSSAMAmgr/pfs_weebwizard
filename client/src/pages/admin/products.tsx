import { DashboardLayout } from "@/layouts/DashboardLayout";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Product, Category } from "@shared/schema";
import { useState } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Pencil, MoreVertical, Search, Check, X, AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
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
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function AdminProducts() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  
  // Fetch products
  const {
    data: products,
    isLoading: productsLoading,
    refetch: refetchProducts,
  } = useQuery<Product[]>({
    queryKey: ["/api/products", { search: searchQuery, category: selectedCategory }],
    queryFn: async ({ queryKey }) => {
      const [_, params] = queryKey;
      const queryParams = new URLSearchParams();
      
      if (params.search) {
        queryParams.append("q", params.search as string);
      }
      
      if (params.category) {
        queryParams.append("categoryId", params.category as string);
      }
      
      const url = `/api/products${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch products");
      return res.json();
    },
  });

  // Fetch categories
  const {
    data: categories,
    isLoading: categoriesLoading,
  } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: async (productId: number) => {
      await apiRequest("DELETE", `/api/admin/products/${productId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      refetchProducts();
      
      toast({
        title: "Produit supprimé",
        description: "Le produit a été supprimé avec succès.",
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

  // Approve product mutation
  const approveProductMutation = useMutation({
    mutationFn: async (productId: number) => {
      await apiRequest("PUT", `/api/admin/products/${productId}/approve`, {
        approved: true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      refetchProducts();
      
      toast({
        title: "Produit approuvé",
        description: "Le produit a été approuvé avec succès et est maintenant visible aux clients.",
        variant: "default",
      });
      
      setApprovalDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Reject product mutation
  const rejectProductMutation = useMutation({
    mutationFn: async (productId: number) => {
      await apiRequest("PUT", `/api/admin/products/${productId}/reject`, {
        approved: false,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      refetchProducts();
      
      toast({
        title: "Produit rejeté",
        description: "Le produit a été rejeté et n'est pas visible aux clients.",
        variant: "default",
      });
      
      setApprovalDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    refetchProducts();
  };

  const handleDeleteProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedProduct) {
      deleteProductMutation.mutate(selectedProduct.id);
    }
  };

  const handleApproveProduct = (product: Product) => {
    setSelectedProduct(product);
    setApprovalDialogOpen(true);
  };

  const confirmApprove = () => {
    if (selectedProduct) {
      approveProductMutation.mutate(selectedProduct.id);
    }
  };

  const confirmReject = () => {
    if (selectedProduct) {
      rejectProductMutation.mutate(selectedProduct.id);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy", { locale: fr });
    } catch (error) {
      return dateString;
    }
  };

  const getCategoryName = (categoryId?: number) => {
    if (!categoryId || !categories) return "Non catégorisé";
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : "Non catégorisé";
  };

  return (
    <DashboardLayout role="admin">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6">
        <h2 className="text-2xl font-bold mb-4 lg:mb-0">Gestion des produits</h2>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Rechercher un produit..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button type="submit">Rechercher</Button>
          </form>
          
          <Select
            value={selectedCategory}
            onValueChange={(value) => {
              setSelectedCategory(value);
              // Auto-search when category changes
              setTimeout(() => refetchProducts(), 100);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Toutes catégories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Toutes catégories</SelectItem>
              {categories?.map((category) => (
                <SelectItem key={category.id} value={category.id.toString()}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Produit</TableHead>
                <TableHead>Prix</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Fournisseur</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Date de création</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {productsLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-10 w-10 rounded" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                    </TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8 rounded-full" /></TableCell>
                  </TableRow>
                ))
              ) : !products || products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    Aucun produit trouvé
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-10 w-10 rounded bg-gray-200 flex-shrink-0 overflow-hidden">
                          {product.imageUrl && (
                            <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
                          )}
                        </div>
                        <span className="font-medium truncate max-w-[180px]">{product.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{product.price.toFixed(2)} €</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        product.stock > 10 ? 'bg-green-100 text-green-800' : 
                        product.stock > 0 ? 'bg-amber-100 text-amber-800' : 
                        'bg-red-100 text-red-800'
                      }`}>
                        {product.stock}
                      </span>
                    </TableCell>
                    <TableCell>Fournisseur {product.supplierId}</TableCell>
                    <TableCell>{getCategoryName(product.categoryId)}</TableCell>
                    <TableCell>{formatDate(product.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleApproveProduct(product)}>
                            <Check className="mr-2 h-4 w-4" />
                            Approuver/Rejeter
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteProduct(product)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Delete Product Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer ce produit ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action supprimera définitivement le produit "{selectedProduct?.name}". Cette action ne peut pas être annulée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              {deleteProductMutation.isPending ? (
                <>
                  <Skeleton className="h-4 w-4 mr-2 rounded-full animate-spin" />
                  Suppression...
                </>
              ) : (
                <>Supprimer</>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Approve/Reject Product Dialog */}
      <Dialog open={approvalDialogOpen} onOpenChange={setApprovalDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approuver ou rejeter le produit</DialogTitle>
            <DialogDescription>
              Produit: {selectedProduct?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <p className="text-sm text-gray-500 mb-4">
              En approuvant ce produit, il sera visible pour les clients sur la plateforme. En le rejetant, il restera invisible pour les clients et le fournisseur devra apporter des modifications.
            </p>
            
            <div className="bg-amber-50 border border-amber-200 rounded-md p-3 flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
              <p className="text-sm text-amber-700">
                Assurez-vous de vérifier les informations du produit avant de prendre une décision.
              </p>
            </div>
          </div>

          <DialogFooter className="flex justify-between sm:justify-between">
            <Button
              variant="outline"
              className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={confirmReject}
              disabled={rejectProductMutation.isPending}
            >
              <X className="h-4 w-4 mr-2" />
              {rejectProductMutation.isPending ? "Rejet en cours..." : "Rejeter"}
            </Button>
            <Button
              onClick={confirmApprove}
              disabled={approveProductMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              <Check className="h-4 w-4 mr-2" />
              {approveProductMutation.isPending ? "Approbation en cours..." : "Approuver"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
