import { DashboardLayout } from "@/layouts/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart4, ShoppingBag, Store, Users, FileTextIcon, Package, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

// Sample data for charts (would be replaced with real API data)
const salesData = [
  { name: "Jan", Ventes: 4000 },
  { name: "Fev", Ventes: 3000 },
  { name: "Mar", Ventes: 5000 },
  { name: "Avr", Ventes: 2780 },
  { name: "Mai", Ventes: 1890 },
  { name: "Juin", Ventes: 2390 },
  { name: "Juil", Ventes: 3490 },
];

const categoryData = [
  { name: "Briques", value: 400 },
  { name: "Peintures", value: 300 },
  { name: "Outils", value: 300 },
  { name: "Quincaillerie", value: 200 },
  { name: "Plomberie", value: 278 },
  { name: "Électricité", value: 189 },
];

export default function AdminDashboard() {
  // Fetch dashboard stats
  const {
    data: stats,
    isLoading: statsLoading,
  } = useQuery({
    queryKey: ["/api/admin/stats"],
    queryFn: async () => {
      const res = await fetch("/api/admin/stats");
      if (!res.ok) throw new Error("Failed to fetch admin stats");
      return res.json();
    },
  });

  // Fetch recent activity (would be implemented in a real API)
  const {
    data: activities,
    isLoading: activitiesLoading,
  } = useQuery({
    queryKey: ["/api/admin/recent-activity"],
    queryFn: async () => {
      // This would be a real API call in production
      await new Promise(resolve => setTimeout(resolve, 1000));
      return [
        { id: 1, type: "order", action: "Nouvelle commande créée", user: "Jean Dupont", date: new Date().toISOString() },
        { id: 2, type: "supplier", action: "Nouveau fournisseur inscrit", user: "MatBTP France", date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
        { id: 3, type: "product", action: "Produit modifié", user: "PeintureDeco", date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
        { id: 4, type: "user", action: "Nouvel utilisateur inscrit", user: "Marie Martin", date: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString() },
        { id: 5, type: "category", action: "Catégorie ajoutée", user: "Admin", date: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString() },
      ];
    },
  });

  // Fetch pending approvals (would be implemented in a real API)
  const {
    data: approvals,
    isLoading: approvalsLoading,
  } = useQuery({
    queryKey: ["/api/admin/pending-approvals"],
    queryFn: async () => {
      // This would be a real API call in production
      await new Promise(resolve => setTimeout(resolve, 1000));
      return [
        { id: 1, type: "supplier", name: "MatBTP Lorraine", action: "Demande d'inscription fournisseur", date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
        { id: 2, type: "product", name: "ToutQuincaille", action: "15 nouveaux produits à valider", date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
        { id: 3, type: "quote", name: "Quote #45892", action: "Demande de devis spécial", date: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString() },
      ];
    },
  });

  const formatDate = (dateString: string) => {
    try {
      const now = new Date();
      const date = new Date(dateString);
      const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
      
      if (diffHours < 24) {
        return `Il y a ${diffHours} heures`;
      } else if (diffHours < 48) {
        return `Hier`;
      } else {
        return format(date, "dd/MM/yyyy", { locale: fr });
      }
    } catch (error) {
      return dateString;
    }
  };

  // Helper function to determine badge color based on activity type
  const getActivityBadgeColor = (type: string) => {
    switch (type) {
      case "order":
        return "bg-green-100 text-green-800";
      case "supplier":
        return "bg-purple-100 text-purple-800";
      case "product":
        return "bg-amber-100 text-amber-800";
      case "user":
        return "bg-blue-100 text-blue-800";
      case "category":
        return "bg-indigo-100 text-indigo-800";
      case "quote":
        return "bg-pink-100 text-pink-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <DashboardLayout role="admin">
      <h2 className="text-2xl font-bold mb-6">Tableau de bord administrateur</h2>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-primary mr-4">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-neutral-500">Utilisateurs</p>
                {statsLoading ? (
                  <Skeleton className="h-6 w-12" />
                ) : (
                  <h4 className="text-xl font-semibold">{stats?.totalUsers || 0}</h4>
                )}
              </div>
            </div>
            <div className="mt-4 text-xs text-success flex items-center">
              <TrendingUp className="mr-1 h-3 w-3" />
              <span>12% depuis le mois dernier</span>
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
                <p className="text-sm text-neutral-500">Commandes</p>
                {statsLoading ? (
                  <Skeleton className="h-6 w-12" />
                ) : (
                  <h4 className="text-xl font-semibold">{stats?.totalOrders || 0}</h4>
                )}
              </div>
            </div>
            <div className="mt-4 text-xs text-success flex items-center">
              <TrendingUp className="mr-1 h-3 w-3" />
              <span>8% depuis le mois dernier</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
                <Store className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-neutral-500">Fournisseurs</p>
                {statsLoading ? (
                  <Skeleton className="h-6 w-12" />
                ) : (
                  <h4 className="text-xl font-semibold">{stats?.totalSuppliers || 0}</h4>
                )}
              </div>
            </div>
            <div className="mt-4 text-xs text-success flex items-center">
              <TrendingUp className="mr-1 h-3 w-3" />
              <span>3 nouveaux ce mois-ci</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-amber-100 text-amber-600 mr-4">
                <Package className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-neutral-500">Produits</p>
                {statsLoading ? (
                  <Skeleton className="h-6 w-12" />
                ) : (
                  <h4 className="text-xl font-semibold">{stats?.totalProducts || 0}</h4>
                )}
              </div>
            </div>
            <div className="mt-4 text-xs text-success flex items-center">
              <TrendingUp className="mr-1 h-3 w-3" />
              <span>56 nouveaux ce mois-ci</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
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
            <CardTitle className="text-lg">Ventes par catégorie</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={categoryData}
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
                  <Bar dataKey="value" name="Ventes" fill="#1976D2" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Recent Activity */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Activité récente</CardTitle>
        </CardHeader>
        <CardContent>
          {activitiesLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex justify-between items-center">
                  <Skeleton className="h-6 w-1/3" />
                  <Skeleton className="h-6 w-20" />
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Action</TableHead>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activities?.map((activity) => (
                    <TableRow key={activity.id}>
                      <TableCell className="whitespace-nowrap text-sm text-neutral-800">
                        {activity.action}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm text-neutral-600">
                        {activity.user}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm">
                        <Badge variant="outline" className={getActivityBadgeColor(activity.type)}>
                          {activity.type === "order" ? "Commande" :
                           activity.type === "supplier" ? "Fournisseur" :
                           activity.type === "product" ? "Produit" :
                           activity.type === "user" ? "Utilisateur" :
                           activity.type === "category" ? "Catégorie" :
                           activity.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm text-neutral-500">
                        {formatDate(activity.date)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Pending Approvals */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Approbations en attente</CardTitle>
        </CardHeader>
        <CardContent>
          {approvalsLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {approvals?.map((approval) => (
                <div key={approval.id} className="border border-neutral-200 rounded-md p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{approval.name}</h4>
                      <p className="text-sm text-neutral-500">
                        {approval.action} • {formatDate(approval.date)}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      {approval.type === "supplier" && (
                        <>
                          <Button size="sm" variant="success" className="bg-success hover:bg-success/90">
                            Approuver
                          </Button>
                          <Button size="sm" variant="outline">
                            Rejeter
                          </Button>
                        </>
                      )}
                      {approval.type === "product" && (
                        <Button size="sm" variant="default">
                          Voir les produits
                        </Button>
                      )}
                      {approval.type === "quote" && (
                        <Button size="sm" variant="default">
                          Vérifier
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
