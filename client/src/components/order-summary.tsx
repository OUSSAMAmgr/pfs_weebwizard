import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Shield, Truck, RotateCcw } from "lucide-react";

interface OrderSummaryProps {
  subtotal: number;
  shippingCost: number;
  tax: number;
  onCheckout: () => void;
}

export function OrderSummary({ 
  subtotal, 
  shippingCost, 
  tax, 
  onCheckout 
}: OrderSummaryProps) {
  const [promoCode, setPromoCode] = useState("");
  const total = subtotal + shippingCost + tax;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Apply promo code logic would go here
    console.log("Applying promo code:", promoCode);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden sticky top-4">
      <div className="p-4 border-b border-neutral-200">
        <h3 className="font-semibold">Récapitulatif</h3>
      </div>
      <div className="p-4 space-y-4">
        <div className="flex justify-between">
          <span className="text-neutral-600">Sous-total</span>
          <span className="font-medium">{subtotal.toFixed(2)} €</span>
        </div>
        <div className="flex justify-between">
          <span className="text-neutral-600">Frais de livraison</span>
          <span className="font-medium">{shippingCost.toFixed(2)} €</span>
        </div>
        <div className="flex justify-between">
          <span className="text-neutral-600">TVA (20%)</span>
          <span className="font-medium">{tax.toFixed(2)} €</span>
        </div>
        <div className="border-t border-neutral-200 pt-4 flex justify-between">
          <span className="font-semibold">Total</span>
          <span className="font-bold text-lg">{total.toFixed(2)} €</span>
        </div>
        
        <div className="mt-6">
          <Button 
            className="w-full"
            onClick={onCheckout}
          >
            Procéder au paiement
          </Button>
        </div>
        
        <div className="mt-4">
          <div className="flex items-center space-x-2 text-sm text-neutral-600">
            <Shield className="h-4 w-4" />
            <span>Paiement sécurisé</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-neutral-600 mt-1">
            <Truck className="h-4 w-4" />
            <span>Livraison rapide</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-neutral-600 mt-1">
            <RotateCcw className="h-4 w-4" />
            <span>Retours sous 30 jours</span>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-neutral-200">
          <h4 className="font-medium mb-2">Code promo</h4>
          <form onSubmit={handleSubmit} className="flex">
            <Input
              type="text"
              className="flex-grow rounded-r-none"
              placeholder="Entrez votre code"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
            />
            <Button type="submit" className="rounded-l-none">Appliquer</Button>
          </form>
        </div>
      </div>
    </div>
  );
}
