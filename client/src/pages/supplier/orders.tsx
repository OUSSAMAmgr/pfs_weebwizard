import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Order } from "@shared/schema";
import { formatCurrency } from "@/lib/utils";
import { getQueryFn } from "@/lib/queryClient";
import { Package, Search, ShoppingBag, TruckIcon } from "lucide-react";

export default function SupplierOrders() {
  const [tab, setTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ["/api/supplier/orders"],
    queryFn: getQueryFn({ on401: "returnNull" })
  });

  const filteredOrders = orders?.filter(order => {
    if (searchQuery) {
      return order.id.toString().includes(searchQuery);
    }
    
    if (tab === "all") return true;
    return order.status === tab;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-amber-100 text-amber-700";
      case "shipped": return "bg-blue-100 text-blue-700";
      case "delivered": return "bg-green-100 text-green-700";
      case "cancelled": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending": return "En attente";
      case "shipped": return "Expédié";
      case "delivered": return "Livré";
      case "cancelled": return "Annulé";
      default: return status;
    }
  };

  return (
    <DashboardLayout role="supplier">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Gestion des commandes</h2>
        <div className="relative mt-2 md:mt-0">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-500" />
          <Input 
            placeholder="Rechercher par # commande" 
            className="pl-8 w-full md:w-auto"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Tabs defaultValue="all" value={tab} onValueChange={setTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">Toutes</TabsTrigger>
          <TabsTrigger value="pending">En attente</TabsTrigger>
          <TabsTrigger value="shipped">Expédiées</TabsTrigger>
          <TabsTrigger value="delivered">Livrées</TabsTrigger>
          <TabsTrigger value="cancelled">Annulées</TabsTrigger>
        </TabsList>

        <TabsContent value={tab}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {tab === "all" ? "Toutes les commandes" : 
                  tab === "pending" ? "Commandes en attente" :
                  tab === "shipped" ? "Commandes expédiées" :
                  tab === "delivered" ? "Commandes livrées" :
                  "Commandes annulées"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                  ))}
                </div>
              ) : !filteredOrders || filteredOrders.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-neutral-300" />
                  <h3 className="text-lg font-medium text-neutral-700 mb-1">Aucune commande trouvée</h3>
                  <p className="text-neutral-500">
                    {searchQuery 
                      ? "Aucune commande ne correspond à votre recherche." 
                      : "Aucune commande dans cette catégorie pour le moment."}
                  </p>
                </div>
              ) : (
                <div className="divide-y">
                  {filteredOrders.map((order) => (
                    <div key={order.id} className="py-4 first:pt-0 last:pb-0">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center">
                            <span className="font-semibold">Commande #{order.id}</span>
                            <span className={`ml-3 text-xs px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                              {getStatusText(order.status)}
                            </span>
                          </div>
                          <div className="text-sm text-neutral-500 mt-1">
                            {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </div>
                        </div>
                        
                        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                          <div className="text-right md:text-left">
                            <div className="font-medium">{formatCurrency(order.total)}</div>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              Détails
                            </Button>
                            
                            {order.status === "pending" && (
                              <Button size="sm" variant="default">
                                <TruckIcon className="h-4 w-4 mr-1" />
                                Expédier
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}