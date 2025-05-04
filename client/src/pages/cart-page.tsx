import { MainLayout } from "@/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { CartItem } from "@/components/cart-item";
import { OrderSummary } from "@/components/order-summary";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { useCart } from "@/hooks/use-cart";

export default function CartPage() {
  const { toast } = useToast();
  const { 
    cartItems, 
    updateQuantity, 
    removeFromCart, 
    clearCart, 
    getSubtotal, 
    isLoading 
  } = useCart();

  const handleQuantityChange = (id: number, quantity: number) => {
    updateQuantity(id, quantity);
  };

  const handleRemoveItem = (id: number) => {
    removeFromCart(id);
  };

  const handleRefreshCart = () => {
    // Simply reload the current page to refresh cart
    window.location.reload();
  };

  const handleCheckout = () => {
    // In a real app, this would navigate to checkout page or API call
    toast({
      title: "Paiement",
      description: "Redirection vers la page de paiement...",
      variant: "default",
    });
    
    // For now, we'll just clear the cart after "checkout"
    setTimeout(() => {
      clearCart();
      toast({
        title: "Commande confirmée",
        description: "Merci pour votre achat!",
        variant: "default",
      });
    }, 1500);
  };

  // Calculate totals
  const subtotal = getSubtotal();
  const shippingCost = subtotal > 100 ? 0 : 9.99; // Free shipping over 100€
  const tax = subtotal * 0.2; // 20% VAT

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">Mon panier</h2>
        
        {isLoading ? (
          <div className="flex justify-center my-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <h3 className="text-xl font-medium mb-4">Votre panier est vide</h3>
            <p className="text-neutral-600 mb-6">
              Vous n'avez pas encore ajouté de produits à votre panier.
            </p>
            <Link href="/products">
              <Button>
                Découvrir nos produits
              </Button>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Cart Items */}
            <div className="lg:w-2/3">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-4">
                <div className="p-4 border-b border-neutral-200">
                  <h3 className="font-semibold">Articles ({cartItems.length})</h3>
                </div>
                
                <div className="divide-y divide-neutral-200">
                  {cartItems.map(item => (
                    <CartItem
                      key={item.id}
                      item={item}
                      onQuantityChange={handleQuantityChange}
                      onRemove={handleRemoveItem}
                    />
                  ))}
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <Link href="/products">
                  <Button variant="ghost" className="text-primary">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Continuer les achats
                  </Button>
                </Link>
                
                <Button 
                  variant="ghost"
                  onClick={handleRefreshCart}
                  disabled={isLoading}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Actualiser le panier
                </Button>
              </div>
            </div>
            
            {/* Order Summary */}
            <div className="lg:w-1/3">
              <OrderSummary
                subtotal={subtotal}
                shippingCost={shippingCost}
                tax={tax}
                onCheckout={handleCheckout}
              />
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
