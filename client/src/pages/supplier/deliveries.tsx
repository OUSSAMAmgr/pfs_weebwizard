import { DashboardLayout } from "@/layouts/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, MapPin, Package, Search, Filter, Truck, RefreshCw, Clock, CheckCheck, AlertCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Types pour l'application
interface Delivery {
  id: number;
  orderId: number;
  clientName: string;
  status: "pending" | "in_transit" | "delivered" | "failed";
  trackingNumber?: string;
  estimatedDelivery: string;
  address: string;
  createdAt: string;
}

// Données simulées pour la démonstration
const mockDeliveries = [
  {
    id: 1,
    orderId: 2045,
    clientName: "BTP Construction",
    status: "in_transit",
    trackingNumber: "TRK-23456789",
    estimatedDelivery: "2025-05-03",
    address: "123 Avenue de la Construction, 75001 Paris",
    createdAt: "2025-04-27"
  },
  {
    id: 2,
    orderId: 2046,
    clientName: "Rénovation Plus",
    status: "pending",
    trackingNumber: "TRK-23456790",
    estimatedDelivery: "2025-05-04",
    address: "45 Rue de la Rénovation, 69002 Lyon",
    createdAt: "2025-04-27"
  },
  {
    id: 3,
    orderId: 2025,
    clientName: "Artisans Associés",
    status: "delivered",
    trackingNumber: "TRK-23456740",
    estimatedDelivery: "2025-04-25",
    address: "78 Boulevard des Artisans, 33000 Bordeaux",
    createdAt: "2025-04-20"
  },
  {
    id: 4,
    orderId: 2018,
    clientName: "Habitat Moderne",
    status: "failed",
    trackingNumber: "TRK-23456720",
    estimatedDelivery: "2025-04-22",
    address: "12 Avenue des Modernes, 44000 Nantes",
    createdAt: "2025-04-18"
  }
] as Delivery[];

export default function SupplierDeliveries() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<string>("all");
  const [selectedFilter, setSelectedFilter] = useState<string>("");
  
  // Simuler une requête API pour récupérer les livraisons
  const {
    data: deliveries,
    isLoading
  } = useQuery<Delivery[]>({
    queryKey: ["/api/supplier/deliveries"],
    queryFn: async () => {
      // Simuler un appel API en attendant l'implémentation
      return new Promise<Delivery[]>(resolve => {
        setTimeout(() => {
          resolve(mockDeliveries);
        }, 800);
      });
    }
  });
  
  // Filtrer les livraisons selon la recherche et les filtres
  const filteredDeliveries = deliveries
    ? deliveries.filter(delivery => {
        const matchesSearch = 
          delivery.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          delivery.trackingNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          delivery.orderId.toString().includes(searchTerm);
        
        const matchesTab = 
          activeTab === "all" || 
          (activeTab === "in_transit" && delivery.status === "in_transit") ||
          (activeTab === "pending" && delivery.status === "pending") ||
          (activeTab === "delivered" && delivery.status === "delivered") ||
          (activeTab === "failed" && delivery.status === "failed");
        
        const matchesFilter = selectedFilter === "all" || !selectedFilter || delivery.status === selectedFilter;
        
        return matchesSearch && matchesTab && matchesFilter;
      })
    : [];
  
  // Badge de statut avec la couleur appropriée
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">En attente d'expédition</Badge>;
      case "in_transit":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">En transit</Badge>;
      case "delivered":
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Livré</Badge>;
      case "failed":
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Échec de livraison</Badge>;
      default:
        return <Badge variant="outline">Statut inconnu</Badge>;
    }
  };
  
  // Icône de statut
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-5 w-5 text-amber-500" />;
      case "in_transit":
        return <Truck className="h-5 w-5 text-blue-500" />;
      case "delivered":
        return <CheckCheck className="h-5 w-5 text-green-500" />;
      case "failed":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };
  
  return (
    <DashboardLayout role="supplier">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h2 className="text-2xl font-bold">Livraisons</h2>
        <Button className="mt-4 md:mt-0" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Actualiser
        </Button>
      </div>
      
      {/* Filtres et recherche */}
      <div className="mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-grow">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-500" />
                <Input
                  placeholder="Rechercher par client, numéro de commande ou suivi..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filtrer par statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="pending">En attente</SelectItem>
                    <SelectItem value="in_transit">En transit</SelectItem>
                    <SelectItem value="delivered">Livré</SelectItem>
                    <SelectItem value="failed">Échec</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Onglets */}
      <Tabs defaultValue="all" className="mb-6" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 md:w-[600px]">
          <TabsTrigger value="all">Toutes</TabsTrigger>
          <TabsTrigger value="pending">En attente</TabsTrigger>
          <TabsTrigger value="in_transit">En transit</TabsTrigger>
          <TabsTrigger value="delivered">Livrées</TabsTrigger>
          <TabsTrigger value="failed">Échecs</TabsTrigger>
        </TabsList>
      </Tabs>
      
      {/* Liste des livraisons */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Suivi des livraisons</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredDeliveries.length === 0 ? (
            <div className="p-8 text-center">
              <Truck className="h-12 w-12 mx-auto mb-2 text-neutral-300" />
              <h3 className="text-lg font-medium text-neutral-700 mb-1">Aucune livraison trouvée</h3>
              <p className="text-neutral-500 max-w-md mx-auto">
                {searchTerm ? `Aucun résultat pour "${searchTerm}"` : "Vous n'avez pas encore de livraisons en cours."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">ID</TableHead>
                    <TableHead className="w-[100px]">Commande</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Numéro de suivi</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDeliveries.map((delivery) => (
                    <TableRow key={delivery.id}>
                      <TableCell className="font-medium">#{delivery.id}</TableCell>
                      <TableCell>#{delivery.orderId}</TableCell>
                      <TableCell>{delivery.clientName}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        <div className="flex items-center">
                          <Calendar className="mr-2 h-4 w-4 text-neutral-500" />
                          {delivery.createdAt}
                        </div>
                      </TableCell>
                      <TableCell>
                        {delivery.trackingNumber || "Non disponible"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {getStatusIcon(delivery.status)}
                          <span className="ml-2">{getStatusBadge(delivery.status)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="mr-2"
                          onClick={() => {
                            toast({
                              title: "Détails de la livraison",
                              description: `Informations détaillées pour la livraison #${delivery.id}`,
                            });
                          }}
                        >
                          <Package className="mr-2 h-4 w-4" />
                          Détails
                        </Button>
                        {delivery.status !== "delivered" && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              if (delivery.trackingNumber) {
                                // Simuler l'ouverture d'une page de suivi
                                toast({
                                  title: "Suivi de livraison",
                                  description: `Redirection vers le suivi de la commande: ${delivery.trackingNumber}`,
                                });
                              } else {
                                toast({
                                  title: "Numéro de suivi non disponible",
                                  description: "Cette livraison n'a pas encore de numéro de suivi assigné.",
                                  variant: "destructive",
                                });
                              }
                            }}
                          >
                            <MapPin className="mr-2 h-4 w-4" />
                            Suivi
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}