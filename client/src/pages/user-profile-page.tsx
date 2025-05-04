import { MainLayout } from "@/layouts/MainLayout";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Link } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Mail, Package, User as UserIcon, UserCircle } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

// Form schema for profile update
const clientProfileSchema = z.object({
  firstName: z.string().min(2, { message: "Le prénom doit contenir au moins 2 caractères" }),
  lastName: z.string().min(2, { message: "Le nom doit contenir au moins 2 caractères" }),
  email: z.string().email({ message: "Email invalide" }),
  address: z.string().optional(),
  phone: z.string().optional(),
});

const supplierProfileSchema = z.object({
  companyName: z.string().min(2, { message: "Le nom de l'entreprise doit contenir au moins 2 caractères" }),
  contactName: z.string().min(2, { message: "Le nom du contact doit contenir au moins 2 caractères" }),
  email: z.string().email({ message: "Email invalide" }),
  address: z.string().optional(),
  phone: z.string().optional(),
  description: z.string().optional(),
});

type ClientProfileFormValues = z.infer<typeof clientProfileSchema>;
type SupplierProfileFormValues = z.infer<typeof supplierProfileSchema>;

export default function UserProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("profile");

  // Fetch client or supplier profile data
  const {
    data: profileData,
    isLoading: profileLoading,
  } = useQuery({
    queryKey: [user?.role === 'client' ? "/api/client/profile" : "/api/supplier/profile"],
    enabled: !!user,
  });

  // Form for client profile
  const clientForm = useForm<ClientProfileFormValues>({
    resolver: zodResolver(clientProfileSchema),
    defaultValues: {
      firstName: profileData?.firstName || "",
      lastName: profileData?.lastName || "",
      email: user?.email || "",
      address: profileData?.address || "",
      phone: profileData?.phone || "",
    },
    values: {
      firstName: profileData?.firstName || "",
      lastName: profileData?.lastName || "",
      email: user?.email || "",
      address: profileData?.address || "",
      phone: profileData?.phone || "",
    },
  });

  // Form for supplier profile
  const supplierForm = useForm<SupplierProfileFormValues>({
    resolver: zodResolver(supplierProfileSchema),
    defaultValues: {
      companyName: profileData?.companyName || "",
      contactName: profileData?.contactName || "",
      email: user?.email || "",
      address: profileData?.address || "",
      phone: profileData?.phone || "",
      description: profileData?.description || "",
    },
    values: {
      companyName: profileData?.companyName || "",
      contactName: profileData?.contactName || "",
      email: user?.email || "",
      address: profileData?.address || "",
      phone: profileData?.phone || "",
      description: profileData?.description || "",
    },
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: ClientProfileFormValues | SupplierProfileFormValues) => {
      const endpoint = user?.role === 'client' 
        ? "/api/client/profile" 
        : "/api/supplier/profile";
      
      await apiRequest("PUT", endpoint, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: [user?.role === 'client' ? "/api/client/profile" : "/api/supplier/profile"] 
      });
      
      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été mises à jour avec succès.",
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

  const onClientSubmit = (data: ClientProfileFormValues) => {
    updateProfileMutation.mutate(data);
  };

  const onSupplierSubmit = (data: SupplierProfileFormValues) => {
    updateProfileMutation.mutate(data);
  };

  const isClient = user?.role === 'client';
  const isSupplier = user?.role === 'supplier';

  if (!user) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <h3 className="text-xl font-medium mb-4">Veuillez vous connecter</h3>
            <p className="text-neutral-600 mb-6">
              Vous devez être connecté pour accéder à votre profil.
            </p>
            <Link href="/auth">
              <Button>
                Se connecter
              </Button>
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">Mon profil</h2>
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <div className="w-full md:w-64">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-white text-2xl font-bold mb-3">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <h3 className="font-semibold text-lg">{user.username}</h3>
                <p className="text-sm text-neutral-500">
                  {user.role === 'client' ? 'Client' : user.role === 'supplier' ? 'Fournisseur' : 'Administrateur'}
                </p>
              </div>
              
              <Tabs value={activeTab} onValueChange={setActiveTab} orientation="vertical">
                <TabsList className="flex flex-col h-auto gap-2">
                  <TabsTrigger value="profile" className="w-full justify-start">
                    <UserCircle className="mr-2 h-4 w-4" />
                    Profil
                  </TabsTrigger>
                  {isClient && (
                    <>
                      <TabsTrigger value="orders" className="w-full justify-start">
                        <Package className="mr-2 h-4 w-4" />
                        Mes commandes
                      </TabsTrigger>
                    </>
                  )}
                  {isSupplier && (
                    <>
                      <TabsTrigger value="products" className="w-full justify-start">
                        <Package className="mr-2 h-4 w-4" />
                        Mes produits
                      </TabsTrigger>
                    </>
                  )}
                </TabsList>
              </Tabs>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <>
                  <h3 className="text-xl font-semibold mb-6">Informations personnelles</h3>
                  
                  {profileLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : isClient ? (
                    <Form {...clientForm}>
                      <form onSubmit={clientForm.handleSubmit(onClientSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={clientForm.control}
                            name="firstName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Prénom</FormLabel>
                                <FormControl>
                                  <Input placeholder="Jean" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={clientForm.control}
                            name="lastName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nom</FormLabel>
                                <FormControl>
                                  <Input placeholder="Dupont" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={clientForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="votre@email.com" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={clientForm.control}
                          name="address"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Adresse</FormLabel>
                              <FormControl>
                                <Input placeholder="123 Rue de Paris" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={clientForm.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Téléphone</FormLabel>
                              <FormControl>
                                <Input placeholder="+33 1 23 45 67 89" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <Button 
                          type="submit" 
                          className="w-full md:w-auto"
                          disabled={updateProfileMutation.isPending}
                        >
                          {updateProfileMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Mise à jour...
                            </>
                          ) : (
                            "Mettre à jour le profil"
                          )}
                        </Button>
                      </form>
                    </Form>
                  ) : isSupplier ? (
                    <Form {...supplierForm}>
                      <form onSubmit={supplierForm.handleSubmit(onSupplierSubmit)} className="space-y-6">
                        <FormField
                          control={supplierForm.control}
                          name="companyName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nom de l'entreprise</FormLabel>
                              <FormControl>
                                <Input placeholder="MatBTP France" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={supplierForm.control}
                          name="contactName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nom du contact</FormLabel>
                              <FormControl>
                                <Input placeholder="Jean Dupont" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={supplierForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="contact@matbtp.fr" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={supplierForm.control}
                          name="address"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Adresse</FormLabel>
                              <FormControl>
                                <Input placeholder="123 Rue de Paris" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={supplierForm.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Téléphone</FormLabel>
                              <FormControl>
                                <Input placeholder="+33 1 23 45 67 89" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={supplierForm.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Input placeholder="Votre spécialité et expertise..." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <Button 
                          type="submit" 
                          className="w-full md:w-auto"
                          disabled={updateProfileMutation.isPending}
                        >
                          {updateProfileMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Mise à jour...
                            </>
                          ) : (
                            "Mettre à jour le profil"
                          )}
                        </Button>
                      </form>
                    </Form>
                  ) : (
                    <p>Profil administrateur</p>
                  )}
                </>
              )}
              
              {/* Orders Tab (for Clients) */}
              {activeTab === 'orders' && isClient && (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold">Mes commandes récentes</h3>
                    <Link href="/orders">
                      <Button variant="outline">Voir toutes les commandes</Button>
                    </Link>
                  </div>
                  
                  <p className="text-center text-neutral-600 py-8">
                    Chargement des commandes...
                  </p>
                </>
              )}
              
              {/* Products Tab (for Suppliers) */}
              {activeTab === 'products' && isSupplier && (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold">Mes produits</h3>
                    <Link href="/supplier/products">
                      <Button variant="outline">Gérer tous les produits</Button>
                    </Link>
                  </div>
                  
                  <p className="text-center text-neutral-600 py-8">
                    Chargement des produits...
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
