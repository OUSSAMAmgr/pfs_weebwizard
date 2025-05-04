import { DashboardLayout } from "@/layouts/DashboardLayout";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Save, Building, User, Phone, MapPin } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Supplier } from "@shared/schema";

export default function SupplierSettings() {
  const { user } = useAuth();
  const { toast } = useToast();

  // État local pour le formulaire
  const [formData, setFormData] = useState({
    companyName: "",
    contactName: "",
    address: "",
    phone: "",
    description: ""
  });

  // Récupérer le profil du fournisseur
  const {
    data: supplierProfile,
    isLoading: profileLoading,
    error: profileError
  } = useQuery<Supplier>({
    queryKey: ["/api/supplier/profile"],
    queryFn: async () => {
      const res = await fetch("/api/supplier/profile");
      if (!res.ok) throw new Error("Échec lors de la récupération du profil fournisseur");
      return res.json();
    }
  });

  // Initialiser le formulaire avec les données du profil
  useEffect(() => {
    if (supplierProfile) {
      setFormData({
        companyName: supplierProfile.companyName || "",
        contactName: supplierProfile.contactName || "",
        address: supplierProfile.address || "",
        phone: supplierProfile.phone || "",
        description: supplierProfile.description || ""
      });
    }
  }, [supplierProfile]);

  // Mutation pour mettre à jour le profil
  const updateProfileMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await fetch("/api/supplier/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Échec de la mise à jour du profil");
      }
      
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été enregistrées avec succès.",
        variant: "default"
      });
      
      // Invalider la requête pour recharger les données
      queryClient.invalidateQueries({ queryKey: ["/api/supplier/profile"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la mise à jour du profil.",
        variant: "destructive"
      });
    }
  });

  // Gestion des changements de formulaire
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Soumettre le formulaire
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData);
  };

  return (
    <DashboardLayout role="supplier">
      <h2 className="text-2xl font-bold mb-6">Paramètres</h2>
      
      {profileError && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>
            Impossible de charger vos informations. Veuillez réessayer ultérieurement.
          </AlertDescription>
        </Alert>
      )}
      
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Profil entreprise</CardTitle>
            <CardDescription>
              Ces informations seront visibles par les clients et administrateurs.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName" className="flex items-center">
                    <Building className="mr-2 h-4 w-4 text-muted-foreground" /> 
                    Nom de l'entreprise
                  </Label>
                  {profileLoading ? (
                    <Skeleton className="h-10 w-full" />
                  ) : (
                    <Input
                      id="companyName"
                      name="companyName"
                      placeholder="Entrez le nom de votre entreprise"
                      value={formData.companyName}
                      onChange={handleChange}
                    />
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="contactName" className="flex items-center">
                    <User className="mr-2 h-4 w-4 text-muted-foreground" /> 
                    Nom du contact
                  </Label>
                  {profileLoading ? (
                    <Skeleton className="h-10 w-full" />
                  ) : (
                    <Input
                      id="contactName"
                      name="contactName"
                      placeholder="Entrez votre nom complet"
                      value={formData.contactName}
                      onChange={handleChange}
                    />
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center">
                    <Phone className="mr-2 h-4 w-4 text-muted-foreground" /> 
                    Téléphone
                  </Label>
                  {profileLoading ? (
                    <Skeleton className="h-10 w-full" />
                  ) : (
                    <Input
                      id="phone"
                      name="phone"
                      placeholder="Numéro de téléphone"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="address" className="flex items-center">
                    <MapPin className="mr-2 h-4 w-4 text-muted-foreground" /> 
                    Adresse
                  </Label>
                  {profileLoading ? (
                    <Skeleton className="h-10 w-full" />
                  ) : (
                    <Input
                      id="address"
                      name="address"
                      placeholder="Adresse complète"
                      value={formData.address}
                      onChange={handleChange}
                    />
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                {profileLoading ? (
                  <Skeleton className="h-32 w-full" />
                ) : (
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Décrivez votre entreprise, vos spécialités et votre offre..."
                    value={formData.description}
                    onChange={handleChange}
                    className="min-h-[120px]"
                  />
                )}
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-end">
              <Button 
                type="submit" 
                disabled={profileLoading || updateProfileMutation.isPending}
                className="flex items-center"
              >
                <Save className="mr-2 h-4 w-4" />
                {updateProfileMutation.isPending ? "Enregistrement..." : "Enregistrer les modifications"}
              </Button>
            </CardFooter>
          </form>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Compte utilisateur</CardTitle>
            <CardDescription>
              Gérez les informations de votre compte utilisateur.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label>Email</Label>
                <div className="mt-1 text-muted-foreground">
                  {profileLoading ? (
                    <Skeleton className="h-6 w-48" />
                  ) : (
                    user?.email || "Non renseigné"
                  )}
                </div>
              </div>
              
              <div>
                <Label>Nom d'utilisateur</Label>
                <div className="mt-1 text-muted-foreground">
                  {profileLoading ? (
                    <Skeleton className="h-6 w-32" />
                  ) : (
                    user?.username || "Non renseigné"
                  )}
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div className="pt-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    const newPassword = prompt("Entrez votre nouveau mot de passe:");
                    if (newPassword) {
                      fetch("/api/user/password", {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json"
                        },
                        body: JSON.stringify({ newPassword })
                      })
                      .then(res => {
                        if (res.ok) {
                          toast({
                            title: "Succès",
                            description: "Mot de passe modifié avec succès",
                            variant: "default"
                          });
                        } else {
                          throw new Error("Échec de la modification du mot de passe");
                        }
                      })
                      .catch(error => {
                        toast({
                          title: "Erreur",
                          description: error.message,
                          variant: "destructive"
                        });
                      });
                    }
                  }}
                >
                  Changer de mot de passe
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}