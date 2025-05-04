import { DashboardLayout } from "@/layouts/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingBag, Package, DollarSign, BarChart4, TrendingUp, AlertTriangle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

// Sample data for charts (would be replaced with real API data)
const salesData = [
  { name: "Jan", Ventes: 1200 },
  { name: "Fev", Ventes: 900 },
  { name: "Mar", Ventes: 1500 },
  { name: "Avr", Ventes: 1000 },
  { name: "Mai", Ventes: 800 },
  { name: "Juin", Ventes: 1300 },
  { name: "Juil", Ventes: 1700 },
];

const productPerformanceData = [
  { name: "Ciment 25kg", value: 400 },
  { name: "Peinture 10L", value: 300 },
  { name: "Marteau pro", value: 200 },
  { name: "Vis 200pcs", value: 150 },
  { name: "Plâtre 5kg", value: 100 },
];

export default function SupplierDashboard() {
  const { user } = useAuth();

  // Fetch supplier statistics
  const {
    data: stats,
    isLoading: statsLoading,
  } = useQuery({
    queryKey: ["/api/supplier/stats"],
    queryFn: async () => {
      const res = await fetch("/api/supplier/stats");
      if (!res.ok) throw new Error("Failed to fetch supplier stats");
      return res.json();
    },
  });

  // Fetch recent orders
  const {
    data: recentOrders,
    isLoading: ordersLoading,
  } = useQuery({
    queryKey: ["/api/supplier/orders"],
    queryFn: async () => {
      const res = await fetch("/api/supplier/orders?limit=5");
      if (!res.ok) throw new Error("Failed to fetch recent orders");
      return res.json();
    },
  });

  // Fetch low stock products
  const {
    data: lowStockProducts,
    isLoading: productsLoading,
  } = useQuery({
    queryKey: ["/api/supplier/products/low-stock"],
    queryFn: async () => {
      const res = await fetch("/api/supplier/products?lowStock=true&limit=5");
      if (!res.ok) throw new Error("Failed to fetch low stock products");
      return res.json();
    },
  });

  return (
    <DashboardLayout role="supplier">
      <h2 className="text-2xl font-bold mb-6">Tableau de bord fournisseur</h2>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-amber-100 text-amber-600 mr-4">
                <Package className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-neutral-500">Produits actifs</p>
                {statsLoading ? (
                  <Skeleton className="h-6 w-12" />
                ) : (
                  <h4 className="text-xl font-semibold">{stats?.totalProducts || 0}</h4>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-success mr-4">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-neutral-500">Commandes du mois</p>
                {statsLoading ? (
                  <Skeleton className="h-6 w-12" />
                ) : (
                  <h4 className="text-xl font-semibold">{stats?.totalOrders || 0}</h4>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-primary mr-4">
                <DollarSign className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-neutral-500">Ventes du mois</p>
                {statsLoading ? (
                  <Skeleton className="h-6 w-12" />
                ) : (
                  <h4 className="text-xl font-semibold">{(stats?.totalSales || 0).toFixed(2)} €</h4>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Évolution des ventes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={salesData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="Ventes"
                    stroke="#1976D2"
                    strokeWidth={2}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Performance des produits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={productPerformanceData}
                  layout="vertical"
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={80} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" name="Ventes" fill="#1976D2" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">Commandes récentes</CardTitle>
              <Link href="/supplier/orders">
                <Button variant="link" className="text-sm">Voir toutes</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {ordersLoading ? (
              <div className="p-6 space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : !recentOrders || recentOrders.length === 0 ? (
              <div className="p-6 text-center text-neutral-500">
                <ShoppingBag className="h-12 w-12 mx-auto mb-2 text-neutral-300" />
                <p>Aucune commande récente</p>
              </div>
            ) : (
              <div className="divide-y">
                {recentOrders.map((order: any) => (
                  <div key={order.id} className="p-4 hover:bg-neutral-50">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">Commande #{order.id}</div>
                        <div className="text-sm text-neutral-500">{order.createdAt}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{order.total.toFixed(2)} €</div>
                        <div className="text-xs px-2 py-1 rounded-full inline-block mt-1 
                          bg-blue-100 text-blue-800">
                          {order.status === 'pending' ? 'En attente' : 
                           order.status === 'shipped' ? 'Expédié' : 
                           order.status === 'delivered' ? 'Livré' : 
                           'Annulé'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Low Stock Products */}
        <Card className="overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">Produits à faible stock</CardTitle>
              <Link href="/supplier/products">
                <Button variant="link" className="text-sm">Gérer les stocks</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {productsLoading ? (
              <div className="p-6 space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : !lowStockProducts || lowStockProducts.length === 0 ? (
              <div className="p-6 text-center text-neutral-500">
                <Package className="h-12 w-12 mx-auto mb-2 text-neutral-300" />
                <p>Tous les produits ont un stock suffisant</p>
              </div>
            ) : (
              <div className="divide-y">
                {lowStockProducts.map((product: any) => (
                  <div key={product.id} className="p-4 hover:bg-neutral-50">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        {product.imageUrl && (
                          <div className="h-10 w-10 bg-neutral-100 rounded mr-3 overflow-hidden">
                            <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
                          </div>
                        )}
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-neutral-500">{product.price.toFixed(2)} €</div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className={`px-2 py-1 rounded-full text-xs
                          ${product.stock <= 5 ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}`}>
                          {product.stock} en stock
                        </div>
                        <AlertTriangle className={`ml-2 h-4 w-4 ${product.stock <= 5 ? 'text-red-500' : 'text-amber-500'}`} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
