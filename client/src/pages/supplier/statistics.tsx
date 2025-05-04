import { DashboardLayout } from "@/layouts/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { Product } from "@shared/schema";

// Données des ventes mensuelles pour le graphique
const monthlyData = [
  { name: "Jan", ventes: 0 },
  { name: "Fév", ventes: 0 },
  { name: "Mar", ventes: 0 },
  { name: "Avr", ventes: 0 },
  { name: "Mai", ventes: 0 },
  { name: "Juin", ventes: 0 },
  { name: "Juil", ventes: 0 },
  { name: "Aoû", ventes: 0 },
  { name: "Sep", ventes: 0 },
  { name: "Oct", ventes: 0 },
  { name: "Nov", ventes: 0 },
  { name: "Déc", ventes: 0 },
];

// Couleurs pour les graphiques
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function SupplierStatistics() {
  const { user } = useAuth();

  // Récupérer les statistiques du fournisseur
  const {
    data: stats,
    isLoading: statsLoading,
  } = useQuery({
    queryKey: ["/api/supplier/stats"],
    queryFn: async () => {
      const res = await fetch("/api/supplier/stats");
      if (!res.ok) throw new Error("Échec lors de la récupération des statistiques du fournisseur");
      return res.json();
    },
  });

  // Récupérer les produits du fournisseur pour les analyses
  const {
    data: products,
    isLoading: productsLoading,
  } = useQuery<Product[]>({
    queryKey: ["/api/supplier/products"],
    queryFn: async () => {
      const res = await fetch("/api/supplier/products");
      if (!res.ok) throw new Error("Échec lors de la récupération des produits");
      return res.json();
    },
  });

  // Préparer les données pour le graphique en camembert des stocks
  const prepareStockData = () => {
    if (!products || products.length === 0) return [];

    const stockData = [
      { name: "En stock (>20)", value: 0 },
      { name: "Stock moyen (10-20)", value: 0 },
      { name: "Stock faible (<10)", value: 0 },
    ];

    products.forEach(product => {
      if (product.stock > 20) {
        stockData[0].value++;
      } else if (product.stock >= 10) {
        stockData[1].value++;
      } else {
        stockData[2].value++;
      }
    });

    // Si toutes les valeurs sont à zéro, créer une entrée pour éviter un graphique vide
    if (stockData.every(item => item.value === 0)) {
      return [{ name: "Aucun produit", value: 1 }];
    }

    // Filtrer les catégories vides pour un meilleur affichage
    return stockData.filter(item => item.value > 0);
  };

  // Préparer les données pour le graphique des produits par catégorie
  const prepareCategoryData = () => {
    if (!products || products.length === 0) return [];

    const categoryCounts: Record<string, number> = {};
    
    products.forEach(product => {
      const categoryId = product.categoryId;
      if (categoryId) {
        if (categoryCounts[categoryId]) {
          categoryCounts[categoryId]++;
        } else {
          categoryCounts[categoryId] = 1;
        }
      }
    });

    return Object.entries(categoryCounts).map(([id, count]) => ({
      name: `Catégorie ${id}`,
      value: count
    }));
  };

  const stockData = prepareStockData();
  const categoryData = prepareCategoryData();

  return (
    <DashboardLayout role="supplier">
      <h2 className="text-2xl font-bold mb-6">Statistiques</h2>
      
      {/* Résumé */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <h3 className="text-lg font-medium mb-2">Total des produits</h3>
              {statsLoading ? (
                <Skeleton className="h-10 w-20 mx-auto" />
              ) : (
                <p className="text-3xl font-bold text-primary">{stats?.totalProducts || 0}</p>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <h3 className="text-lg font-medium mb-2">Commandes totales</h3>
              {statsLoading ? (
                <Skeleton className="h-10 w-20 mx-auto" />
              ) : (
                <p className="text-3xl font-bold text-green-600">{stats?.totalOrders || 0}</p>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <h3 className="text-lg font-medium mb-2">Chiffre d'affaires total</h3>
              {statsLoading ? (
                <Skeleton className="h-10 w-20 mx-auto" />
              ) : (
                <p className="text-3xl font-bold text-blue-600">{(stats?.totalSales || 0).toFixed(2)} €</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Ventes mensuelles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={monthlyData}
                  margin={{
                    top: 10,
                    right: 30,
                    left: 0,
                    bottom: 10,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="ventes"
                    name="Ventes (€)"
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
            <CardTitle className="text-lg">État des stocks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {productsLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Skeleton className="h-40 w-40 rounded-full" />
                </div>
              ) : products && products.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <p className="text-neutral-500 mb-2">Aucun produit à afficher</p>
                  <p className="text-sm text-neutral-400">Ajoutez des produits pour voir les statistiques de stock</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stockData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {stockData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} produit(s)`, 'Quantité']} />
                    <Legend verticalAlign="bottom" align="center" />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Produits par catégorie</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {productsLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Skeleton className="h-60 w-full" />
                </div>
              ) : products && products.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <p className="text-neutral-500 mb-2">Aucun produit à afficher</p>
                  <p className="text-sm text-neutral-400">Ajoutez des produits pour voir les statistiques par catégorie</p>
                </div>
              ) : categoryData.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <p className="text-neutral-500 mb-2">Aucune catégorie disponible</p>
                  <p className="text-sm text-neutral-400">Ajoutez des catégories à vos produits pour voir les statistiques</p>
                </div>
              ) : (
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
                    <Tooltip formatter={(value) => [`${value} produit(s)`, 'Quantité']} />
                    <Legend />
                    <Bar dataKey="value" name="Nombre de produits" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}