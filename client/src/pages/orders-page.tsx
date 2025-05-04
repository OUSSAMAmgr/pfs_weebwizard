import { MainLayout } from "@/layouts/MainLayout";
import { useQuery } from "@tanstack/react-query";
import { Order } from "@shared/schema";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { Eye, Package, ShoppingBag } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function OrdersPage() {
  // Fetch client orders
  const {
    data: orders,
    isLoading: ordersLoading,
  } = useQuery<Order[]>({
    queryKey: ["/api/client/orders"],
  });

  // Helper function to get status badge class
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

  // Helper function to get status text in French
  const getStatusText = (status: string) => {
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

  // Format date helper
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd MMMM yyyy", { locale: fr });
    } catch (error) {
      return dateString;
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">Mes commandes</h2>
        
        {ordersLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : !orders || orders.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Aucune commande</CardTitle>
              <CardDescription>
                Vous n'avez pas encore passé de commande.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center my-8">
                <ShoppingBag className="h-16 w-16 text-neutral-300" />
              </div>
              <p className="text-center text-neutral-600 mb-6">
                Explorez notre catalogue et passez votre première commande !
              </p>
              <div className="flex justify-center">
                <Link href="/products">
                  <Button>
                    Voir les produits
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Commande</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>État</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">#{order.id}</TableCell>
                      <TableCell>{formatDate(order.createdAt)}</TableCell>
                      <TableCell>{order.total.toFixed(2)} €</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeClass(
                            order.status
                          )}`}
                        >
                          {getStatusText(order.status)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/orders/${order.id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              Détails
                            </Button>
                          </Link>
                          {order.status === "shipped" && (
                            <Link href={`/orders/${order.id}/delivery`}>
                              <Button variant="ghost" size="sm">
                                <Package className="h-4 w-4 mr-1" />
                                Suivi
                              </Button>
                            </Link>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
