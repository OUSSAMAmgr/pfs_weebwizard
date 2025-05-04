import { DashboardLayout } from "@/layouts/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, Plus, Search, Filter, CalendarClock, Clock, XCircle, CheckCircle, Clock4 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "wouter";

// Données simulées de devis (pour démo en attendant l'API)
const mockQuotes = [
  {
    id: 1,
    clientName: "BTP Construction",
    status: "pending",
    createdAt: "2025-04-20",
    validUntil: "2025-05-20",
    total: 1250.45,
    items: [
      { id: 1, name: "Ciment Portland 25kg", quantity: 10, price: 75.50, total: 755.00 },
      { id: 2, name: "Acier 10mm (barre 6m)", quantity: 15, price: 32.30, total: 484.50 }
    ]
  },
  {
    id: 2,
    clientName: "Rénovation Plus",
    status: "accepted",
    createdAt: "2025-04-15",
    validUntil: "2025-05-15",
    total: 834.20,
    items: [
      { id: 1, name: "Peinture Blanche 10L", quantity: 4, price: 89.90, total: 359.60 },
      { id: 2, name: "Plâtre 25kg", quantity: 8, price: 35.80, total: 286.40 },
      { id: 3, name: "Enduit Lissage 15kg", quantity: 5, price: 37.64, total: 188.20 }
    ]
  },
  {
    id: 3,
    clientName: "Artisans Associés",
    status: "rejected",
    createdAt: "2025-04-10",
    validUntil: "2025-05-10",
    total: 1876.30,
    items: [
      { id: 1, name: "Bois de charpente 200x75mm", quantity: 25, price: 45.60, total: 1140.00 },
      { id: 2, name: "Isolant Thermique 100mm", quantity: 15, price: 49.08, total: 736.20 }
    ]
  },
  {
    id: 4,
    clientName: "Constructeur Régional",
    status: "pending",
    createdAt: "2025-04-05",
    validUntil: "2025-05-05",
    total: 623.75,
    items: [
      { id: 1, name: "Tuiles Terre Cuite", quantity: 250, price: 1.85, total: 462.50 },
      { id: 2, name: "Gravier 20kg", quantity: 15, price: 10.75, total: 161.25 }
    ]
  },
  {
    id: 5,
    clientName: "Habitat Moderne",
    status: "expired",
    createdAt: "2025-03-01",
    validUntil: "2025-04-01",
    total: 2485.60,
    items: [
      { id: 1, name: "Fenêtre PVC 120x150cm", quantity: 4, price: 295.00, total: 1180.00 },
      { id: 2, name: "Porte d'entrée Sécurité", quantity: 1, price: 745.00, total: 745.00 },
      { id: 3, name: "Serrure 3 points", quantity: 3, price: 186.80, total: 560.40 }
    ]
  }
];

export default function SupplierQuotes() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  
  // Simulons la récupération des devis (en attendant l'API réelle)
  const {
    data: quotes,
    isLoading: quotesLoading,
  } = useQuery({
    queryKey: ["/api/supplier/quotes"],
    queryFn: async () => {
      // Simuler un appel API en attendant l'implémentation
      return new Promise(resolve => {
        setTimeout(() => {
          resolve(mockQuotes);
        }, 500);
      });
    },
  });

  // Filtrer les devis selon la recherche et l'onglet actif
  const filteredQuotes = quotes
    ? quotes.filter(quote => {
        const matchesSearch = quote.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              quote.id.toString().includes(searchTerm);
        
        const matchesTab = activeTab === "all" || 
                          (activeTab === "pending" && quote.status === "pending") ||
                          (activeTab === "accepted" && quote.status === "accepted") ||
                          (activeTab === "rejected" && (quote.status === "rejected" || quote.status === "expired"));
        
        return matchesSearch && matchesTab;
      })
    : [];

  // Fonction pour obtenir le badge de statut avec la bonne couleur
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">En attente</Badge>;
      case "accepted":
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Accepté</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Refusé</Badge>;
      case "expired":
        return <Badge variant="outline" className="bg-neutral-100 text-neutral-800 border-neutral-200">Expiré</Badge>;
      default:
        return <Badge variant="outline">Inconnu</Badge>;
    }
  };

  // Fonction pour obtenir l'icône de statut
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-5 w-5 text-amber-500" />;
      case "accepted":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "rejected":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "expired":
        return <Clock4 className="h-5 w-5 text-neutral-500" />;
      default:
        return null;
    }
  };
  
  return (
    <DashboardLayout role="supplier">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h2 className="text-2xl font-bold">Devis</h2>
        <Button className="mt-4 md:mt-0" size="sm">
          <Plus className="mr-2 h-4 w-4" /> Nouveau devis
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
                  placeholder="Rechercher un devis..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex items-center">
                  <Filter className="mr-2 h-4 w-4" />
                  Filtrer
                </Button>
                <Button variant="outline" size="sm" className="flex items-center">
                  <CalendarClock className="mr-2 h-4 w-4" />
                  Période
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Onglets des devis */}
      <Tabs defaultValue="all" className="mb-6" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 md:w-[400px]">
          <TabsTrigger value="all">Tous</TabsTrigger>
          <TabsTrigger value="pending">En attente</TabsTrigger>
          <TabsTrigger value="accepted">Acceptés</TabsTrigger>
          <TabsTrigger value="rejected">Refusés</TabsTrigger>
        </TabsList>
      </Tabs>
      
      {/* Liste des devis */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Liste des devis</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {quotesLoading ? (
            <div className="p-4 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredQuotes.length === 0 ? (
            <div className="p-8 text-center">
              <FileText className="h-12 w-12 mx-auto mb-2 text-neutral-300" />
              <h3 className="text-lg font-medium text-neutral-700 mb-1">Aucun devis trouvé</h3>
              <p className="text-neutral-500 max-w-md mx-auto">
                {searchTerm ? `Aucun résultat pour "${searchTerm}"` : "Vous n'avez pas encore créé de devis."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]"># Devis</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Date de création</TableHead>
                    <TableHead>Validité</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredQuotes.map((quote) => (
                    <TableRow key={quote.id}>
                      <TableCell className="font-medium">#{quote.id}</TableCell>
                      <TableCell>{quote.clientName}</TableCell>
                      <TableCell>{quote.createdAt}</TableCell>
                      <TableCell>{quote.validUntil}</TableCell>
                      <TableCell>{quote.total.toFixed(2)} €</TableCell>
                      <TableCell className="flex items-center">
                        {getStatusIcon(quote.status)}
                        <span className="ml-2">{getStatusBadge(quote.status)}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/supplier/quotes/${quote.id}`}>
                          <Button variant="ghost" size="sm">
                            Voir
                          </Button>
                        </Link>
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