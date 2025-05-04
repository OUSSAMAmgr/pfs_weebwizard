import { FormEvent, useState } from "react";
import { useLocation } from "wouter";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { queryClient } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";
import { Category } from "@shared/schema";
import { DashboardLayout } from "@/layouts/DashboardLayout";

export default function AddProductPage() {
  const [_, navigate] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // État pour les champs du formulaire
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(0);
  const [stock, setStock] = useState(0);
  const [imageUrl, setImageUrl] = useState("");
  const [categoryId, setCategoryId] = useState<number>(1);

  // Fetch categories
  const { data: categories, isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      console.log("Soumission du formulaire avec les données:", {
        name, description, price, stock, imageUrl, categoryId
      });
      
      const response = await fetch("/api/supplier/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          price,
          stock,
          imageUrl,
          categoryId,
        }),
        credentials: "include",
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur: ${response.status} ${errorText || response.statusText}`);
      }
      
      const result = await response.json();
      console.log("Produit ajouté avec succès:", result);
      
      // Rafraîchir la liste des produits
      queryClient.invalidateQueries({ queryKey: ["/api/supplier/products"] });
      
      toast({
        title: "Produit ajouté",
        description: "Le produit a été ajouté avec succès.",
        variant: "default",
      });
      
      // Rediriger vers la liste des produits
      navigate("/supplier/products");
    } catch (error) {
      console.error("Erreur lors de l'ajout du produit:", error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Erreur lors de l'ajout du produit",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            Ajouter un nouveau produit
          </h1>
          <p className="text-muted-foreground mt-2">
            Créez un nouveau produit pour le rendre disponible à la vente
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => navigate("/supplier/products")}
          className="flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m12 19-7-7 7-7"/>
            <path d="M19 12H5"/>
          </svg>
          Retour aux produits
        </Button>
      </div>
      
      <Card className="shadow-lg border-t-4 border-t-primary">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-white pb-8">
          <CardTitle className="text-2xl">Informations du produit</CardTitle>
          <CardDescription>
            Remplissez tous les champs obligatoires (*) pour créer votre nouveau produit.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6 pt-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">Nom du produit*</Label>
                <Input 
                  id="name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="Nom du produit" 
                  required
                  className="border-gray-300 focus:border-primary focus:ring-primary"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category" className="text-sm font-medium">Catégorie*</Label>
                <Select
                  value={categoryId?.toString()} 
                  onValueChange={value => setCategoryId(parseInt(value))}
                >
                  <SelectTrigger className="border-gray-300 focus:border-primary focus:ring-primary">
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
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description détaillée du produit..."
                className="min-h-[120px] border-gray-300 focus:border-primary focus:ring-primary"
              />
              <p className="text-xs text-muted-foreground">
                Une bonne description aidera vos clients à mieux comprendre votre produit.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="imageUrl" className="text-sm font-medium">URL de l'image</Label>
              <Input
                id="imageUrl"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="border-gray-300 focus:border-primary focus:ring-primary"
              />
              <p className="text-xs text-muted-foreground">
                Ajoutez l'URL d'une image pour illustrer votre produit (formats recommandés: JPG, PNG).
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
              <h3 className="font-medium text-sm mb-4">Informations de tarification et stock</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="price" className="text-sm font-medium">Prix (€)*</Label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">€</span>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={price}
                      onChange={(e) => setPrice(parseFloat(e.target.value))}
                      required
                      className="pl-8 border-gray-300 focus:border-primary focus:ring-primary"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="stock" className="text-sm font-medium">Stock disponible*</Label>
                  <Input
                    id="stock"
                    type="number"
                    min="0"
                    step="1"
                    value={stock}
                    onChange={(e) => setStock(parseInt(e.target.value))}
                    required
                    className="border-gray-300 focus:border-primary focus:ring-primary"
                  />
                </div>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between pt-6 pb-8 px-6 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate("/supplier/products")}
              className="gap-2"
            >
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting} 
              className="gap-2 min-w-[180px] bg-gradient-to-r from-primary to-blue-600 hover:from-blue-600 hover:to-primary"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Création en cours...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 5v14"/>
                    <path d="M5 12h14"/>
                  </svg>
                  Créer le produit
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}