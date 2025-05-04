import { useEffect, useState } from "react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  Download, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Clock4,
  Printer,
  Share2
} from "lucide-react";
import { Link } from "wouter";

// Type pour un produit dans un devis
interface QuoteProduct {
  id: number;
  productId: number;
  name: string; // Récupéré du produit
  quantity: number;
  priceAtQuote: number;
}

// Type pour un devis complet
interface Quote {
  id: number;
  clientId: number;
  clientName: string; // Récupéré du client
  supplierId: number;
  status: "pending" | "accepted" | "rejected" | "expired";
  total: number;
  createdAt: string;
  validUntil: string;
  items: QuoteProduct[];
}

export default function QuoteDetailPage() {
  const [, navigate] = useLocation();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const quoteId = parseInt(id);

  // Récupérer les détails du devis
  const {
    data: quote,
    isLoading,
    error,
  } = useQuery<Quote>({
    queryKey: [`/api/supplier/quotes/${quoteId}`],
    queryFn: async () => {
      // Comme l'API n'est pas encore implémentée, on utilise une donnée simulée
      // Dans une implémentation réelle, on ferait:
      // const res = await fetch(`/api/supplier/quotes/${quoteId}`);
      // if (!res.ok) throw new Error("Failed to fetch quote details");
      // return res.json();
      
      // Simulation de données pour la démo
      return new Promise<Quote>((resolve) => {
        setTimeout(() => {
          resolve({
            id: quoteId,
            clientId: 1,
            clientName: "BTP Construction",
            supplierId: 1,
            status: "pending",
            total: 1250.45,
            createdAt: "2025-04-20",
            validUntil: "2025-05-20",
            items: [
              { id: 1, productId: 1, name: "Ciment Portland 25kg", quantity: 10, priceAtQuote: 75.50 },
              { id: 2, productId: 2, name: "Acier 10mm (barre 6m)", quantity: 15, priceAtQuote: 32.30 }
            ]
          });
        }, 500);
      });
    },
  });

  // Gérer les actions sur le devis
  const handleAcceptQuote = () => {
    if (!quote) return;
    
    // Dans une implémentation réelle:
    // fetch(`/api/supplier/quotes/${quoteId}/status`, {
    //   method: "PATCH",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ status: "accepted" })
    // })
    // .then(res => {
    //   if (res.ok) {
    //     toast({ title: "Devis accepté", description: "Le devis a été marqué comme accepté." });
    //     queryClient.invalidateQueries([`/api/supplier/quotes/${quoteId}`]);
    //   }
    // });
    
    toast({
      title: "Devis accepté",
      description: "Le devis a été marqué comme accepté."
    });
  };

  const handleRejectQuote = () => {
    if (!quote) return;
    
    toast({
      title: "Devis refusé",
      description: "Le devis a été marqué comme refusé."
    });
  };

  const handlePrintQuote = () => {
    window.print();
  };
  
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

  // Gérer les erreurs
  if (error) {
    return (
      <DashboardLayout role="supplier">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            className="mr-4" 
            onClick={() => navigate("/supplier/quotes")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
          <h2 className="text-2xl font-bold">Erreur</h2>
        </div>
        
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-8">
              <XCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Impossible de charger le devis</h3>
              <p className="text-neutral-600 mb-6">
                Une erreur est survenue lors du chargement des détails du devis.
              </p>
              <Button onClick={() => navigate("/supplier/quotes")}>
                Retourner à la liste des devis
              </Button>
            </div>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="supplier">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            className="mr-4" 
            onClick={() => navigate("/supplier/quotes")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
          <h2 className="text-2xl font-bold">
            {isLoading ? (
              <Skeleton className="h-8 w-40" />
            ) : (
              <>Devis #{quote?.id}</>
            )}
          </h2>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handlePrintQuote}>
            <Printer className="mr-2 h-4 w-4" />
            Imprimer
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="mr-2 h-4 w-4" />
            Partager
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Télécharger
          </Button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-[200px] w-full" />
          <Skeleton className="h-[300px] w-full" />
        </div>
      ) : quote ? (
        <>
          {/* En-tête du devis */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h3 className="text-sm font-semibold text-neutral-500 mb-1">Client</h3>
                  <p className="font-medium text-lg">{quote.clientName}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-semibold text-neutral-500 mb-1">Statut</h3>
                  <div className="flex items-center">
                    {getStatusIcon(quote.status)}
                    <span className="ml-2">{getStatusBadge(quote.status)}</span>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-semibold text-neutral-500 mb-1">Total</h3>
                  <p className="font-medium text-lg">{quote.total.toFixed(2)} €</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-semibold text-neutral-500 mb-1">Date de création</h3>
                  <p>{quote.createdAt}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-semibold text-neutral-500 mb-1">Valide jusqu'au</h3>
                  <p>{quote.validUntil}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-semibold text-neutral-500 mb-1">Référence</h3>
                  <p>QT-{quote.id.toString().padStart(6, '0')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Produits du devis */}
          <Card className="mb-6">
            <CardHeader className="pb-0">
              <CardTitle className="text-lg">Produits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">ID</TableHead>
                      <TableHead>Produit</TableHead>
                      <TableHead className="text-right">Prix unitaire</TableHead>
                      <TableHead className="text-right">Quantité</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {quote.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.productId}</TableCell>
                        <TableCell>{item.name}</TableCell>
                        <TableCell className="text-right">{item.priceAtQuote.toFixed(2)} €</TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right">{(item.priceAtQuote * item.quantity).toFixed(2)} €</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end border-t pt-6">
              <div className="text-right">
                <div className="flex justify-between mb-2">
                  <span className="font-medium mr-8">Sous-total :</span>
                  <span>{quote.total.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="font-medium mr-8">TVA (20%) :</span>
                  <span>{(quote.total * 0.2).toFixed(2)} €</span>
                </div>
                <div className="flex justify-between text-lg font-bold mt-4 pt-4 border-t">
                  <span className="mr-8">Total :</span>
                  <span>{(quote.total * 1.2).toFixed(2)} €</span>
                </div>
              </div>
            </CardFooter>
          </Card>
          
          {/* Actions */}
          {quote.status === "pending" && (
            <div className="flex justify-end gap-4">
              <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700" onClick={handleRejectQuote}>
                <XCircle className="mr-2 h-4 w-4" />
                Refuser
              </Button>
              <Button className="bg-green-600 hover:bg-green-700" onClick={handleAcceptQuote}>
                <CheckCircle className="mr-2 h-4 w-4" />
                Accepter
              </Button>
            </div>
          )}
        </>
      ) : null}
    </DashboardLayout>
  );
}