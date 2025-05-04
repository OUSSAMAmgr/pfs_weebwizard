import { DashboardLayout } from "@/layouts/DashboardLayout";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Order } from "@shared/schema";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Eye, 
  MoreVertical, 
  Search, 
  Truck, 
  Calendar, 
  Package,
  X,
  ShoppingBag
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminOrders() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isUpdateStatusDialogOpen, setIsUpdateStatusDialogOpen] = useState(false);
  
  // Fetch orders
  const {
    data: orders,
    isLoading: ordersLoading,
    refetch: refetchOrders,
  } = useQuery<Order[]>({
    queryKey: ["/api/admin/orders", { search: searchQuery, status: statusFilter }],
    queryFn: async ({ queryKey }) => {
      const [_, params] = queryKey;
      const queryParams = new URLSearchParams();
      
      if (params.search) {
        queryParams.append("q", params.search as string);
      }
      
      if (params.status) {
        queryParams.append("status", params.status as string);
      }
      
      const url = `/api/admin/orders${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch orders");
      return res.json();
    },
  });

  // Fetch order details
  const {
    data: orderDetails,
    isLoading: orderDetailsLoading,
    refetch: refetchOrderDetails,
  } = useQuery({
    queryKey: [`/api/admin/orders/${selectedOrder?.id}/details`],
    queryFn: async ({ queryKey }) => {
      const [url] = queryKey;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch order details");
      return res.json();
    },
    enabled: !!selectedOrder && isDetailsDialogOpen,
  });

  // Update order status mutation
  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: number; status: string }) => {
      await apiRequest("PUT", `/api/admin/orders/${orderId}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      refetchOrders();
      
      toast({
        title: "Statut mis à jour",
        description: "Le statut de la commande a été mis à jour avec succès.",
        variant: "default",
      });
      
      setIsUpdateStatusDialogOpen(false);
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
    refetchOrders();
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailsDialogOpen(true);
  };

  const handleUpdateStatus = (order: Order) => {
    setSelectedOrder(order);
    setIsUpdateStatusDialogOpen(true);
  };

  const confirmUpdateStatus = (status: string) => {
    if (selectedOrder) {
      updateOrderStatusMutation.mutate({
        orderId: selectedOrder.id,
        status,
      });
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: fr });
    } catch (error) {
      return dateString;
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-amber-100 text-amber-800";
      case "shipped":
        return "bg-blue-100 text-blue-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "En attente";
      case "shipped":
        return "Expédié";
      case "delivered":
        return "Livré";
      case "cancelled":
        return "Annulé";
      default:
        return status;
    }
  };

  // Stats summary cards
  const pendingOrders = orders?.filter(order => order.status === "pending").length || 0;
  const shippedOrders = orders?.filter(order => order.status === "shipped").length || 0;
  const deliveredOrders = orders?.filter(order => order.status === "delivered").length || 0;
  const cancelledOrders = orders?.filter(order => order.status === "cancelled").length || 0;
  const totalSales = orders?.reduce((sum, order) => sum + order.total, 0) || 0;

  return (
    <DashboardLayout role="admin">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6">
        <h2 className="text-2xl font-bold mb-4 lg:mb-0">Gestion des commandes</h2>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Rechercher une commande..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button type="submit">Rechercher</Button>
          </form>
          
          <Select
            value={statusFilter}
            onValueChange={(value) => {
              setStatusFilter(value);
              // Auto-search when status changes
              setTimeout(() => refetchOrders(), 100);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Tous les statuts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tous les statuts</SelectItem>
              <SelectItem value="pending">En attente</SelectItem>
              <SelectItem value="shipped">Expédié</SelectItem>
              <SelectItem value="delivered">Livré</SelectItem>
              <SelectItem value="cancelled">Annulé</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">Chiffre d'affaires</p>
                <p className="text-2xl font-bold">{totalSales.toFixed(2)} €</p>
              </div>
              <ShoppingBag className="h-5 w-5 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">En attente</p>
                <p className="text-2xl font-bold">{pendingOrders}</p>
              </div>
              <Calendar className="h-5 w-5 text-amber-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">Expédiées</p>
                <p className="text-2xl font-bold">{shippedOrders}</p>
              </div>
              <Truck className="h-5 w-5 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">Livrées</p>
                <p className="text-2xl font-bold">{deliveredOrders}</p>
              </div>
              <Package className="h-5 w-5 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">Annulées</p>
                <p className="text-2xl font-bold">{cancelledOrders}</p>
              </div>
              <X className="h-5 w-5 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ordersLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8 rounded-full" /></TableCell>
                  </TableRow>
                ))
              ) : !orders || orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Aucune commande trouvée
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">#{order.id}</TableCell>
                    <TableCell>Client {order.clientId}</TableCell>
                    <TableCell>{formatDate(order.createdAt)}</TableCell>
                    <TableCell className="font-medium">{order.total.toFixed(2)} €</TableCell>
                    <TableCell>
                      <Badge className={getStatusBadgeClass(order.status)}>
                        {getStatusLabel(order.status)}
                      </Badge>
                    </TableCell>
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
                          <DropdownMenuItem onClick={() => handleViewDetails(order)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Voir les détails
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUpdateStatus(order)}>
                            <Truck className="mr-2 h-4 w-4" />
                            Mettre à jour le statut
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

      {/* Order Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Détails de la commande #{selectedOrder?.id}</DialogTitle>
            <DialogDescription>
              Commande passée le {selectedOrder && formatDate(selectedOrder.createdAt)}
            </DialogDescription>
          </DialogHeader>

          {orderDetailsLoading ? (
            <div className="space-y-4 py-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          ) : (
            <div className="py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">Informations client</h4>
                  <div className="bg-neutral-50 p-4 rounded-md">
                    <p><span className="font-medium">Client ID:</span> {orderDetails?.client?.id}</p>
                    <p><span className="font-medium">Nom:</span> {orderDetails?.client?.firstName} {orderDetails?.client?.lastName}</p>
                    <p><span className="font-medium">Email:</span> {orderDetails?.client?.email}</p>
                    <p><span className="font-medium">Téléphone:</span> {orderDetails?.client?.phone || 'Non renseigné'}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">Informations de livraison</h4>
                  <div className="bg-neutral-50 p-4 rounded-md">
                    <p><span className="font-medium">Adresse:</span> {orderDetails?.delivery?.address || 'Non renseignée'}</p>
                    <p><span className="font-medium">Date de livraison prévue:</span> {orderDetails?.delivery?.deliveryDate ? formatDate(orderDetails.delivery.deliveryDate) : 'Non planifiée'}</p>
                    <p><span className="font-medium">Statut:</span> <Badge className={getStatusBadgeClass(selectedOrder?.status || 'pending')}>{getStatusLabel(selectedOrder?.status || 'pending')}</Badge></p>
                  </div>
                </div>
              </div>
              
              <h4 className="font-medium text-sm text-muted-foreground mb-2">Articles commandés</h4>
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produit</TableHead>
                      <TableHead>Prix unitaire</TableHead>
                      <TableHead>Quantité</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orderDetails?.items?.map((item: any) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {item.product.imageUrl && (
                              <div className="h-10 w-10 bg-neutral-100 rounded">
                                <img src={item.product.imageUrl} alt={item.product.name} className="h-full w-full object-cover" />
                              </div>
                            )}
                            <div>{item.product.name}</div>
                          </div>
                        </TableCell>
                        <TableCell>{item.priceAtPurchase.toFixed(2)} €</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell className="text-right font-medium">{(item.priceAtPurchase * item.quantity).toFixed(2)} €</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              <div className="flex justify-end mt-6 space-x-4">
                <div className="text-right">
                  <div className="flex justify-between gap-8 text-sm">
                    <span>Sous-total:</span>
                    <span>{(selectedOrder?.total ? selectedOrder.total * 0.8 : 0).toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between gap-8 text-sm">
                    <span>TVA (20%):</span>
                    <span>{(selectedOrder?.total ? selectedOrder.total * 0.2 : 0).toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between gap-8 font-bold mt-2">
                    <span>Total:</span>
                    <span>{selectedOrder?.total?.toFixed(2)} €</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog open={isUpdateStatusDialogOpen} onOpenChange={setIsUpdateStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mettre à jour le statut de la commande</DialogTitle>
            <DialogDescription>
              Commande #{selectedOrder?.id}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Statut actuel:</h4>
                <Badge className={getStatusBadgeClass(selectedOrder?.status || 'pending')}>
                  {getStatusLabel(selectedOrder?.status || 'pending')}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Nouveau statut:</h4>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={selectedOrder?.status === 'pending' ? "secondary" : "outline"}
                    className="justify-start"
                    onClick={() => confirmUpdateStatus('pending')}
                    disabled={updateOrderStatusMutation.isPending}
                  >
                    <Calendar className="mr-2 h-4 w-4 text-amber-500" />
                    En attente
                  </Button>
                  
                  <Button
                    variant={selectedOrder?.status === 'shipped' ? "secondary" : "outline"}
                    className="justify-start"
                    onClick={() => confirmUpdateStatus('shipped')}
                    disabled={updateOrderStatusMutation.isPending}
                  >
                    <Truck className="mr-2 h-4 w-4 text-blue-500" />
                    Expédié
                  </Button>
                  
                  <Button
                    variant={selectedOrder?.status === 'delivered' ? "secondary" : "outline"}
                    className="justify-start"
                    onClick={() => confirmUpdateStatus('delivered')}
                    disabled={updateOrderStatusMutation.isPending}
                  >
                    <Package className="mr-2 h-4 w-4 text-green-500" />
                    Livré
                  </Button>
                  
                  <Button
                    variant={selectedOrder?.status === 'cancelled' ? "secondary" : "outline"}
                    className="justify-start"
                    onClick={() => confirmUpdateStatus('cancelled')}
                    disabled={updateOrderStatusMutation.isPending}
                  >
                    <X className="mr-2 h-4 w-4 text-red-500" />
                    Annulé
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUpdateStatusDialogOpen(false)}>
              Annuler
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
