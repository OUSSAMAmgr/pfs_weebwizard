import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Building } from "lucide-react";
import { registerClientSchema, registerSupplierSchema, loginSchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function AuthPage() {
  const [location] = useLocation();
  const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const initialTab = params.get('tab') === 'register' ? 'register' : 'login';
  
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [accountType, setAccountType] = useState<"client" | "supplier">("client");
  const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const { user, loginMutation, registerClientMutation, registerSupplierMutation } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  // Login form
  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Register client form
  const registerClientForm = useForm<z.infer<typeof registerClientSchema>>({
    resolver: zodResolver(registerClientSchema),
    defaultValues: {
      username: "",
      password: "",
      email: "",
      role: "client",
      firstName: "",
      lastName: "",
      address: "",
      phone: "",
    },
  });

  // Register supplier form
  const registerSupplierForm = useForm<z.infer<typeof registerSupplierSchema>>({
    resolver: zodResolver(registerSupplierSchema),
    defaultValues: {
      username: "",
      password: "",
      email: "",
      role: "supplier",
      companyName: "",
      contactName: "",
      address: "",
      phone: "",
      description: "",
    },
  });

  // Form submission handlers
  const onLoginSubmit = (data: z.infer<typeof loginSchema>) => {
    loginMutation.mutate(data);
  };

  const onRegisterClientSubmit = (data: z.infer<typeof registerClientSchema>) => {
    registerClientMutation.mutate(data);
  };

  const onRegisterSupplierSubmit = (data: z.infer<typeof registerSupplierSchema>) => {
    registerSupplierMutation.mutate(data);
  };
  
  const handleResetPassword = () => {
    if (!resetEmail || !resetEmail.includes('@')) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir une adresse email valide",
        variant: "destructive",
      });
      return;
    }
    
    // Simuler l'envoi d'un email de réinitialisation
    toast({
      title: "Email envoyé",
      description: "Si un compte existe avec cette adresse, vous recevrez un email avec les instructions pour réinitialiser votre mot de passe.",
      variant: "default",
    });
    
    setIsResetPasswordDialogOpen(false);
    setResetEmail("");
  };

  const isPending = 
    loginMutation.isPending || 
    registerClientMutation.isPending || 
    registerSupplierMutation.isPending;

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center">
          <div className="w-full max-w-6xl bg-white rounded-lg shadow-md overflow-hidden flex flex-col lg:flex-row">
            {/* Form Section */}
            <div className="w-full lg:w-1/2 p-8">
              <div className="flex items-center space-x-2 mb-8">
                <Building className="text-primary h-6 w-6" />
                <h1 className="text-2xl font-bold font-inter text-neutral-800">MateriauxPro</h1>
              </div>
              
              <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-2 mb-6">
                  <TabsTrigger value="login">Connexion</TabsTrigger>
                  <TabsTrigger value="register">Inscription</TabsTrigger>
                </TabsList>
                
                {/* Login Form */}
                <TabsContent value="login">
                  <h2 className="text-2xl font-bold text-center mb-6">Connexion</h2>
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                      <FormField
                        control={loginForm.control}
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
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Mot de passe</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="••••••••" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Checkbox id="remember-me" />
                          <label htmlFor="remember-me" className="ml-2 text-sm text-neutral-700">
                            Se souvenir de moi
                          </label>
                        </div>
                        <span 
                          onClick={() => setIsResetPasswordDialogOpen(true)}
                          className="text-sm font-medium text-primary hover:underline cursor-pointer"
                        >
                          Mot de passe oublié?
                        </span>
                      </div>
                      
                      <Button type="submit" className="w-full" disabled={isPending}>
                        {isPending ? "Connexion en cours..." : "Se connecter"}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>
                
                {/* Register Form */}
                <TabsContent value="register">
                  <h2 className="text-2xl font-bold text-center mb-6">Inscription</h2>
                  
                  {/* Account Type Selection */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Type de compte</label>
                    <div className="grid grid-cols-2 gap-4">
                      <div 
                        className={`border rounded-md p-4 cursor-pointer hover:border-primary flex items-center space-x-3 ${
                          accountType === 'client' ? 'border-primary bg-blue-50' : ''
                        }`}
                        onClick={() => setAccountType('client')}
                      >
                        <input 
                          type="radio" 
                          id="client-type" 
                          name="account-type" 
                          value="client" 
                          checked={accountType === 'client'}
                          onChange={() => setAccountType('client')}
                          className="h-4 w-4 text-primary focus:ring-primary"
                        />
                        <label htmlFor="client-type" className="cursor-pointer flex-1">
                          <div className="font-medium">Client</div>
                          <div className="text-sm text-neutral-500">Acheter des produits</div>
                        </label>
                      </div>
                      <div 
                        className={`border rounded-md p-4 cursor-pointer hover:border-primary flex items-center space-x-3 ${
                          accountType === 'supplier' ? 'border-primary bg-blue-50' : ''
                        }`}
                        onClick={() => setAccountType('supplier')}
                      >
                        <input 
                          type="radio" 
                          id="supplier-type" 
                          name="account-type" 
                          value="supplier" 
                          checked={accountType === 'supplier'}
                          onChange={() => setAccountType('supplier')}
                          className="h-4 w-4 text-primary focus:ring-primary"
                        />
                        <label htmlFor="supplier-type" className="cursor-pointer flex-1">
                          <div className="font-medium">Fournisseur</div>
                          <div className="text-sm text-neutral-500">Vendre des produits</div>
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  {/* Client Registration Form */}
                  {accountType === 'client' && (
                    <Form {...registerClientForm}>
                      <form onSubmit={registerClientForm.handleSubmit(onRegisterClientSubmit)} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={registerClientForm.control}
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
                            control={registerClientForm.control}
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
                          control={registerClientForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nom d'utilisateur</FormLabel>
                              <FormControl>
                                <Input placeholder="jean_dupont" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={registerClientForm.control}
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
                          control={registerClientForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Mot de passe</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="••••••••" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={registerClientForm.control}
                          name="address"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Adresse (optionnel)</FormLabel>
                              <FormControl>
                                <Input placeholder="123 Rue de Paris" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={registerClientForm.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Téléphone (optionnel)</FormLabel>
                              <FormControl>
                                <Input placeholder="+33 1 23 45 67 89" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="flex items-center">
                          <Checkbox id="terms" required />
                          <label htmlFor="terms" className="ml-2 block text-sm text-neutral-700">
                            J'accepte les <a href="#" className="text-primary hover:underline">conditions d'utilisation</a> et la <a href="#" className="text-primary hover:underline">politique de confidentialité</a>
                          </label>
                        </div>
                        
                        <Button type="submit" className="w-full" disabled={isPending}>
                          {isPending ? "Inscription en cours..." : "S'inscrire"}
                        </Button>
                      </form>
                    </Form>
                  )}
                  
                  {/* Supplier Registration Form */}
                  {accountType === 'supplier' && (
                    <Form {...registerSupplierForm}>
                      <form onSubmit={registerSupplierForm.handleSubmit(onRegisterSupplierSubmit)} className="space-y-4">
                        <FormField
                          control={registerSupplierForm.control}
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
                          control={registerSupplierForm.control}
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
                          control={registerSupplierForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nom d'utilisateur</FormLabel>
                              <FormControl>
                                <Input placeholder="matbtp_france" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={registerSupplierForm.control}
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
                          control={registerSupplierForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Mot de passe</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="••••••••" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={registerSupplierForm.control}
                          name="address"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Adresse (optionnel)</FormLabel>
                              <FormControl>
                                <Input placeholder="123 Rue de Paris" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={registerSupplierForm.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Téléphone (optionnel)</FormLabel>
                              <FormControl>
                                <Input placeholder="+33 1 23 45 67 89" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={registerSupplierForm.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description (optionnel)</FormLabel>
                              <FormControl>
                                <Input placeholder="Votre spécialité et expertise..." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="flex items-center">
                          <Checkbox id="terms-supplier" required />
                          <label htmlFor="terms-supplier" className="ml-2 block text-sm text-neutral-700">
                            J'accepte les <a href="#" className="text-primary hover:underline">conditions d'utilisation</a> et la <a href="#" className="text-primary hover:underline">politique de confidentialité</a>
                          </label>
                        </div>
                        
                        <Button type="submit" className="w-full" disabled={isPending}>
                          {isPending ? "Inscription en cours..." : "S'inscrire"}
                        </Button>
                      </form>
                    </Form>
                  )}
                </TabsContent>
              </Tabs>
            </div>
            
            {/* Hero Section */}
            <div className="w-full lg:w-1/2 bg-primary p-8 flex items-center justify-center">
              <div className="max-w-md text-white">
                <h2 className="text-3xl font-bold mb-4">Bienvenue sur MateriauxPro</h2>
                <p className="text-lg mb-6 text-blue-100">
                  La plateforme de référence pour les professionnels du bâtiment et les particuliers à la recherche de matériaux de construction de qualité.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="bg-white bg-opacity-20 p-2 rounded-full">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold">Grande variété de produits</h3>
                      <p className="text-blue-100 text-sm">Des milliers de références de matériaux pour tous vos projets.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="bg-white bg-opacity-20 p-2 rounded-full">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold">Fournisseurs qualifiés</h3>
                      <p className="text-blue-100 text-sm">Tous nos fournisseurs sont vérifiés pour vous garantir qualité et fiabilité.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="bg-white bg-opacity-20 p-2 rounded-full">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold">Livraison rapide</h3>
                      <p className="text-blue-100 text-sm">Livraison rapide sur toute la France pour ne pas retarder vos projets.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
