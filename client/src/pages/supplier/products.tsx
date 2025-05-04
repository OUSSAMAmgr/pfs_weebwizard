import { DashboardLayout } from "@/layouts/DashboardLayout";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Product, Category, insertProductSchema } from "@shared/schema";
import { useState, useEffect } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, Edit, MoreVertical, Package, PlusCircle, Search, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
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
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useAuth } from "@/hooks/use-auth";

// Extended product schema for the form
const productFormSchema = insertProductSchema.extend({
  id: z.number().optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

export default function SupplierProducts() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [sortBy, setSortBy] = useState<string>("newest");

  // État pour contrôler le dialogue d'ajout
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  // Form for adding/editing products
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      stock: 0,
      imageUrl: "",
      categoryId: 1, // Default to first category to avoid undefined value
    },
  });

  // Reset form when dialog opens/closes
  const resetForm = (product?: Product) => {
    if (product) {
      form.reset({
        id: product.id,
        name: product.name,
        description: product.description || "",
        price: product.price,
        stock: product.stock,
        imageUrl: product.imageUrl || "",
        categoryId: product.categoryId || 1, // Use default if none specified
      });
    } else {
      form.reset({
        name: "",
        description: "",
        price: 0,
        stock: 0,
        imageUrl: "",
        categoryId: 1, // Default to first category
      });
    }
  };

  // Fetch supplier's products
  const {
    data: products,
    isLoading: productsLoading,
    refetch: refetchProducts,
  } = useQuery<Product[]>({
    queryKey: ["/api/supplier/products", { search: searchQuery, category: selectedCategory, sort: sortBy }],
    queryFn: async ({ queryKey }) => {
      // Sécuriser le type de params
      const [_, params] = queryKey as [string, Record<string, unknown>];
      const queryParams = new URLSearchParams();

      if (typeof params.search === 'string') {
        queryParams.append("q", params.search);
      }

      if (typeof params.category === 'string') {
        queryParams.append("categoryId", params.category);
      }

      if (typeof params.sort === 'string') {
        queryParams.append("sort", params.sort);
      }

      const url = `/api/supplier/products${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch products");
      return res.json();
    },
  });

  // Fetch categories for the dropdown
  const {
    data: categories,
    isLoading: categoriesLoading,
  } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  // Récupération des informations du fournisseur
  const { 
    data: supplierData,
    isLoading: supplierLoading,
    error: supplierError 
  } = useQuery({
    queryKey: ["/api/supplier/profile"],
    queryFn: async () => {
      const res = await fetch("/api/supplier/profile");
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Impossible de récupérer le profil fournisseur");
      }
      return res.json();
    },
    enabled: !!user && user.role === 'supplier',
  });

  // Afficher un avertissement dans la console si nous n'avons pas pu charger les données du fournisseur
  useEffect(() => {
    if (supplierError) {
      console.error("Erreur lors du chargement du profil fournisseur:", supplierError);
      toast({
        title: "Erreur",
        description: "Impossible de charger votre profil fournisseur. Certaines fonctionnalités pourraient ne pas fonctionner correctement.",
        variant: "destructive",
      });
    }
  }, [supplierError, toast]);

  const addProductMutation = useMutation({
    mutationFn: async (data: ProductFormValues) => {
      // Log every step to debug the issue
      console.log("======== ADD PRODUCT START ========");
      console.log("Submitting product data:", data);
      
      try {
        // Essayer avec fetch directement pour voir si ça résout le problème
        const response = await fetch("/api/supplier/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: data.name,
            description: data.description,
            price: data.price,
            stock: data.stock,
            imageUrl: data.imageUrl,
            categoryId: data.categoryId,
          }),
          credentials: "include",
        });
        
        console.log("Response status:", response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error("API error response:", errorText);
          throw new Error(`Erreur: ${response.status} ${errorText || response.statusText}`);
        }
        
        const result = await response.json();
        console.log("API success response:", result);
        console.log("======== ADD PRODUCT END ========");
        return result;
      } catch (error) {
        console.error("======== ADD PRODUCT ERROR ========");
        console.error(error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log("Mutation success, product added:", data);
      queryClient.invalidateQueries({ queryKey: ["/api/supplier/products"] });
      refetchProducts();
      toast({
        title: "Produit ajouté",
        description: "Le produit a été ajouté avec succès.",
        variant: "default",
      });
    },
    onError: (error: Error) => {
      console.error("Mutation error:", error);
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Edit product mutation
  const editProductMutation = useMutation({
    mutationFn: async (data: ProductFormValues) => {
      if (!data.id) throw new Error("Product ID is required");
      
      await apiRequest("PUT", `/api/supplier/products/${data.id}`, {
        name: data.name,
        description: data.description,
        price: data.price,
        stock: data.stock,
        imageUrl: data.imageUrl,
        categoryId: data.categoryId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/supplier/products"] });
      refetchProducts();
      setIsEditDialogOpen(false);
      toast({
        title: "Produit mis à jour",
        description: "Le produit a été mis à jour avec succès.",
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

  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: async (productId: number) => {
      await apiRequest("DELETE", `/api/supplier/products/${productId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/supplier/products"] });
      refetchProducts();
      setIsDeleteDialogOpen(false);
      toast({
        title: "Produit supprimé",
        description: "Le produit a été supprimé avec succès.",
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    refetchProducts();
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    resetForm(product);
    setIsEditDialogOpen(true);
  };

  const handleDeleteProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteDialogOpen(true);
  };

  const onSubmitAdd = async (data: ProductFormValues) => {
    console.log("Soumission directe du formulaire");
    try {
      console.log("Envoi de la requête POST au serveur");
      
      // Fermer la boîte de dialogue immédiatement
      setIsAddDialogOpen(false);
      
      // Approche plus directe pour le débogage
      const response = await fetch("/api/supplier/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          description: data.description,
          price: data.price,
          stock: data.stock,
          imageUrl: data.imageUrl,
          categoryId: data.categoryId,
        }),
        credentials: "include",
      });
      
      console.log("Réponse de l'API:", response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Erreur lors de la création du produit:", errorText);
        throw new Error(`Erreur: ${response.status} ${errorText || response.statusText}`);
      }
      
      const result = await response.json();
      console.log("Produit créé avec succès:", result);
      
      // Mise à jour manuelle de l'interface
      queryClient.invalidateQueries({ queryKey: ["/api/supplier/products"] });
      refetchProducts();
      
      toast({
        title: "Produit ajouté",
        description: "Le produit a été ajouté avec succès.",
        variant: "default",
      });
    } catch (error) {
      console.error("Erreur lors de la création du produit:", error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Erreur lors de la création du produit",
        variant: "destructive",
      });
    }
  };

  const onSubmitEdit = (data: ProductFormValues) => {
    editProductMutation.mutate(data);
  };

  const confirmDelete = () => {
    if (selectedProduct) {
      deleteProductMutation.mutate(selectedProduct.id);
    }
  };

  const formatDate = (dateString: string | Date) => {
    try {
      const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
      return format(date, "dd/MM/yyyy", { locale: fr });
    } catch (error) {
      return String(dateString);
    }
  };

  const getCategoryName = (categoryId?: number | null) => {
    if (!categoryId || !categories) return "Non catégorisé";
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : "Non catégorisé";
  };

  // Gérer les modifications du dialogue d'ajout de produit
  const handleAddDialogChange = (open: boolean) => {
    setIsAddDialogOpen(open);
    if(open) resetForm();
  };
  
  // Actualiser le statut du dialogue dans onSuccess
  useEffect(() => {
    if(addProductMutation.isSuccess) {
      setIsAddDialogOpen(false);
    }
  }, [addProductMutation.isSuccess]);
  
  return (
    <DashboardLayout role="supplier">
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
          
          <Button onClick={() => window.location.href = "/supplier/products/add"}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Ajouter un produit
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 flex gap-2">
          <Select
            value={selectedCategory}
            onValueChange={(value) => {
              setSelectedCategory(value);
              // Auto-search when category changes
              setTimeout(() => refetchProducts(), 100);
            }}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Toutes catégories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Toutes catégories</SelectItem>
              {categories?.map((category) => (
                <SelectItem key={category.id} value={category.id.toString()}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select
            value={sortBy}
            onValueChange={(value) => {
              setSortBy(value);
              // Auto-search when sort changes
              setTimeout(() => refetchProducts(), 100);
            }}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Trier par" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Plus récent</SelectItem>
              <SelectItem value="oldest">Plus ancien</SelectItem>
              <SelectItem value="price_asc">Prix croissant</SelectItem>
              <SelectItem value="price_desc">Prix décroissant</SelectItem>
              <SelectItem value="stock_low">Stock bas</SelectItem>
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
                <TableHead>Produit</TableHead>
                <TableHead>Prix</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {productsLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
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
                    <TableCell><Skeleton className="h-8 w-8 rounded-full" /></TableCell>
                  </TableRow>
                ))
              ) : !products || products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <Package className="mx-auto h-12 w-12 text-neutral-300 mb-2" />
                    <p className="text-neutral-500">Vous n'avez pas encore ajouté de produits</p>
                    <Dialog onOpenChange={(open) => { if(open) resetForm(); }}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="mt-4">
                          <PlusCircle className="mr-2 h-4 w-4" />
                          Ajouter un produit
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Ajouter un produit</DialogTitle>
                          <DialogDescription>
                            Remplissez le formulaire ci-dessous pour ajouter un nouveau produit.
                          </DialogDescription>
                        </DialogHeader>

                        <Form {...form}>
                          <form onSubmit={(e) => {
                            e.preventDefault();
                            console.log("Form submitted");
                            form.handleSubmit(onSubmitAdd)(e);
                          }} className="space-y-6">
                            <FormField
                              control={form.control}
                              name="name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Nom du produit</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Nom du produit" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="categoryId"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Catégorie</FormLabel>
                                  <Select 
                                    onValueChange={(value) => field.onChange(parseInt(value))} 
                                    defaultValue={field.value?.toString()}
                                    value={field.value?.toString()}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Sélectionner une catégorie" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {categoriesLoading ? (
                                        <SelectItem value="1" disabled>
                                          Chargement...
                                        </SelectItem>
                                      ) : (
                                        categories?.map((category) => (
                                          <SelectItem key={category.id} value={category.id.toString()}>
                                            {category.name}
                                          </SelectItem>
                                        ))
                                      )}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="description"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Description</FormLabel>
                                  <FormControl>
                                    <Textarea
                                      placeholder="Description détaillée du produit..."
                                      className="resize-none"
                                      {...field}
                                      value={field.value || ''} 
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="imageUrl"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>URL de l'image</FormLabel>
                                  <FormControl>
                                    <Input placeholder="URL de l'image du produit" {...field} value={field.value || ''} />
                                  </FormControl>
                                  <FormDescription>
                                    Entrez l'URL d'une image pour votre produit.
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <div className="grid grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name="price"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Prix (€)</FormLabel>
                                    <FormControl>
                                      <Input 
                                        type="number" 
                                        step="0.01" 
                                        min="0"
                                        placeholder="0.00" 
                                        {...field}
                                        onChange={e => field.onChange(parseFloat(e.target.value))}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={form.control}
                                name="stock"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Stock</FormLabel>
                                    <FormControl>
                                      <Input 
                                        type="number" 
                                        min="0" 
                                        step="1"
                                        placeholder="0" 
                                        {...field}
                                        onChange={e => field.onChange(parseInt(e.target.value))}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            
                            <DialogFooter>
                              <Button type="submit" disabled={addProductMutation.isPending}>
                                {addProductMutation.isPending ? "Création..." : "Créer le produit"}
                              </Button>
                            </DialogFooter>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-10 w-10 rounded bg-neutral-100 flex-shrink-0 overflow-hidden">
                          {product.imageUrl && (
                            <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-xs text-neutral-500 truncate max-w-[200px]">
                            {product.description || "Aucune description"}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{product.price.toFixed(2)} €</TableCell>
                    <TableCell>
                      <Badge className={
                        product.stock === 0 ? "bg-red-100 text-red-800" :
                        product.stock < 10 ? "bg-amber-100 text-amber-800" :
                        "bg-green-100 text-green-800"
                      }>
                        {product.stock}
                      </Badge>
                      {product.stock < 10 && (
                        <AlertTriangle className="inline-block ml-2 h-4 w-4 text-amber-500" />
                      )}
                    </TableCell>
                    <TableCell>{getCategoryName(product.categoryId)}</TableCell>
                    <TableCell>{formatDate(product.createdAt || new Date())}</TableCell>
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
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleEditProduct(product)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteProduct(product)}
                            className="text-red-600 focus:text-red-600"
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



      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Modifier le produit</DialogTitle>
            <DialogDescription>
              Modifiez les informations du produit ci-dessous.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={(e) => {
              e.preventDefault();
              console.log("Edit form submitted");
              form.handleSubmit(onSubmitEdit)(e);
            }} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom du produit</FormLabel>
                    <FormControl>
                      <Input placeholder="Nom du produit" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Catégorie</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(parseInt(value))} 
                      defaultValue={field.value?.toString()}
                      value={field.value?.toString()}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une catégorie" />
                      </SelectTrigger>
                      <SelectContent>
                        {categoriesLoading ? (
                          <SelectItem value="1" disabled>
                            Chargement...
                          </SelectItem>
                        ) : (
                          categories?.map((category) => (
                            <SelectItem key={category.id} value={category.id.toString()}>
                              {category.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Description détaillée du produit..."
                        className="resize-none"
                        {...field}
                        value={field.value || ''} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL de l'image</FormLabel>
                    <FormControl>
                      <Input placeholder="URL de l'image du produit" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormDescription>
                      Entrez l'URL d'une image pour votre produit.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prix (€)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01" 
                          min="0"
                          placeholder="0.00" 
                          {...field}
                          onChange={e => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="stock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0" 
                          step="1"
                          placeholder="0" 
                          {...field}
                          onChange={e => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <DialogFooter>
                <Button type="submit" disabled={editProductMutation.isPending}>
                  {editProductMutation.isPending ? "Modification..." : "Enregistrer les modifications"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer ce produit ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action ne peut pas être annulée. Ce produit sera définitivement supprimé
              de la base de données.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={deleteProductMutation.isPending}
            >
              {deleteProductMutation.isPending ? "Suppression..." : "Supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}