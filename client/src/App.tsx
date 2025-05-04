import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import ProductsPage from "@/pages/products-page";
import ProductDetailPage from "@/pages/product-detail-page";
import CategoriesPage from "@/pages/categories-page";
import CartPage from "@/pages/cart-page";
import FavoritesPage from "@/pages/favorites-page";
import OrdersPage from "@/pages/orders-page";
import UserProfilePage from "@/pages/user-profile-page";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminProducts from "@/pages/admin/products";
import AdminUsers from "@/pages/admin/users";
import AdminOrders from "@/pages/admin/orders";
import SupplierDashboard from "@/pages/supplier/dashboard";
import SupplierProducts from "@/pages/supplier/products";
import SupplierOrders from "@/pages/supplier/orders";
import SupplierStatistics from "@/pages/supplier/statistics";
import SupplierQuotes from "@/pages/supplier/quotes";
import QuoteDetailPage from "@/pages/supplier/quote-detail";
import SupplierSettings from "@/pages/supplier/settings";
import SupplierDeliveries from "@/pages/supplier/deliveries";
import AddProductPage from "@/pages/supplier/add-product";
import { ProtectedRoute } from "./lib/protected-route";
import { useAuth, AuthProvider } from "./hooks/use-auth";
import { CartProvider } from "./hooks/use-cart";

function AppRouter() {
  const { user } = useAuth();
  
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/products" component={ProductsPage} />
      <Route path="/products/:id" component={ProductDetailPage} />
      <Route path="/categories" component={CategoriesPage} />
      <Route path="/categories/:id" component={ProductsPage} />
      
      {/* Client routes */}
      <ProtectedRoute path="/cart" role="client" component={CartPage} />
      <ProtectedRoute path="/favorites" role="client" component={FavoritesPage} />
      <ProtectedRoute path="/orders" role="client" component={OrdersPage} />
      <ProtectedRoute path="/profile" component={UserProfilePage} />
      
      {/* Admin routes */}
      <ProtectedRoute path="/admin" role="admin" component={AdminDashboard} />
      <ProtectedRoute path="/admin/products" role="admin" component={AdminProducts} />
      <ProtectedRoute path="/admin/users" role="admin" component={AdminUsers} />
      <ProtectedRoute path="/admin/orders" role="admin" component={AdminOrders} />
      
      {/* Supplier routes */}
      <ProtectedRoute path="/supplier" role="supplier" component={SupplierDashboard} />
      <ProtectedRoute path="/supplier/products" role="supplier" component={SupplierProducts} />
      <ProtectedRoute path="/supplier/products/add" role="supplier" component={AddProductPage} />
      <ProtectedRoute path="/supplier/orders" role="supplier" component={SupplierOrders} />
      <ProtectedRoute path="/supplier/statistics" role="supplier" component={SupplierStatistics} />
      <ProtectedRoute path="/supplier/quotes" role="supplier" component={SupplierQuotes} />
      <ProtectedRoute path="/supplier/quotes/:id" role="supplier" component={QuoteDetailPage} />
      <ProtectedRoute path="/supplier/settings" role="supplier" component={SupplierSettings} />
      <ProtectedRoute path="/supplier/deliveries" role="supplier" component={SupplierDeliveries} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider attribute="class" defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <CartProvider>
            <AppRouter />
          </CartProvider>
        </TooltipProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
