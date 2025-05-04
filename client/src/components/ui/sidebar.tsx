import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingBag,
  LineChart,
  BarChart4,
  Settings,
  FileText,
  Truck,
} from "lucide-react";

interface SidebarProps {
  role: "admin" | "supplier";
}

export function Sidebar({ role }: SidebarProps) {
  const [location] = useLocation();

  const isActiveLink = (path: string) => {
    return location === path;
  };

  return (
    <div className="w-64 bg-white shadow-md h-[calc(100vh-64px)] flex-shrink-0 hidden md:block">
      <div className="px-4 py-4">
        <h3 className="font-semibold text-lg border-b border-neutral-200 pb-2 mb-3">
          {role === "admin" ? "Administration" : "Espace fournisseur"}
        </h3>
        <nav className="space-y-1">
          {role === "admin" ? (
            <>
              <Link
                href="/admin" 
                className={`flex items-center px-3 py-2 rounded-md ${
                  isActiveLink("/admin")
                    ? "bg-primary-light/10 text-primary font-medium"
                    : "text-neutral-700 hover:bg-neutral-100"
                }`}
              >
                <LayoutDashboard className="mr-3 h-5 w-5" />
                <span>Tableau de bord</span>
              </Link>
              <Link
                href="/admin/users"
                className={`flex items-center px-3 py-2 rounded-md ${
                  isActiveLink("/admin/users")
                    ? "bg-primary-light/10 text-primary font-medium"
                    : "text-neutral-700 hover:bg-neutral-100"
                }`}
              >
                <Users className="mr-3 h-5 w-5" />
                <span>Utilisateurs</span>
              </Link>
              <Link
                href="/admin/products"
                className={`flex items-center px-3 py-2 rounded-md ${
                  isActiveLink("/admin/products")
                    ? "bg-primary-light/10 text-primary font-medium"
                    : "text-neutral-700 hover:bg-neutral-100"
                }`}
              >
                <Package className="mr-3 h-5 w-5" />
                <span>Produits</span>
              </Link>
              <Link
                href="/admin/orders"
                className={`flex items-center px-3 py-2 rounded-md ${
                  isActiveLink("/admin/orders")
                    ? "bg-primary-light/10 text-primary font-medium"
                    : "text-neutral-700 hover:bg-neutral-100"
                }`}
              >
                <ShoppingBag className="mr-3 h-5 w-5" />
                <span>Commandes</span>
              </Link>
              <a
                href="#"
                className="flex items-center px-3 py-2 rounded-md text-neutral-700 hover:bg-neutral-100"
              >
                <BarChart4 className="mr-3 h-5 w-5" />
                <span>Statistiques</span>
              </a>
              <a
                href="#"
                className="flex items-center px-3 py-2 rounded-md text-neutral-700 hover:bg-neutral-100"
              >
                <Settings className="mr-3 h-5 w-5" />
                <span>Paramètres</span>
              </a>
            </>
          ) : (
            <>
              <Link
                  href="/supplier"
                  className={`flex items-center px-3 py-2 rounded-md ${
                    isActiveLink("/supplier")
                      ? "bg-primary-light/10 text-primary font-medium"
                      : "text-neutral-700 hover:bg-neutral-100"
                  }`}
                >
                  <LayoutDashboard className="mr-3 h-5 w-5" />
                  <span>Tableau de bord</span>
              </Link>
              <Link
                href="/supplier/products"
                className={`flex items-center px-3 py-2 rounded-md ${
                  isActiveLink("/supplier/products")
                    ? "bg-primary-light/10 text-primary font-medium"
                    : "text-neutral-700 hover:bg-neutral-100"
                }`}
              >
                <Package className="mr-3 h-5 w-5" />
                <span>Mes produits</span>
              </Link>
              <Link
                href="/supplier/orders"
                className={`flex items-center px-3 py-2 rounded-md ${
                  isActiveLink("/supplier/orders")
                    ? "bg-primary-light/10 text-primary font-medium"
                    : "text-neutral-700 hover:bg-neutral-100"
                }`}
              >
                <ShoppingBag className="mr-3 h-5 w-5" />
                <span>Commandes</span>
              </Link>
              <Link
                href="/supplier/statistics"
                className={`flex items-center px-3 py-2 rounded-md ${
                  isActiveLink("/supplier/statistics")
                    ? "bg-primary-light/10 text-primary font-medium"
                    : "text-neutral-700 hover:bg-neutral-100"
                }`}
              >
                <LineChart className="mr-3 h-5 w-5" />
                <span>Statistiques</span>
              </Link>
              <Link
                href="/supplier/quotes"
                className={`flex items-center px-3 py-2 rounded-md ${
                  isActiveLink("/supplier/quotes")
                    ? "bg-primary-light/10 text-primary font-medium"
                    : "text-neutral-700 hover:bg-neutral-100"
                }`}
              >
                <FileText className="mr-3 h-5 w-5" />
                <span>Devis</span>
              </Link>
              <Link
                href="/supplier/deliveries"
                className={`flex items-center px-3 py-2 rounded-md ${
                  isActiveLink("/supplier/deliveries")
                    ? "bg-primary-light/10 text-primary font-medium"
                    : "text-neutral-700 hover:bg-neutral-100"
                }`}
              >
                <Truck className="mr-3 h-5 w-5" />
                <span>Livraisons</span>
              </Link>
              <Link
                href="/supplier/settings"
                className={`flex items-center px-3 py-2 rounded-md ${
                  isActiveLink("/supplier/settings")
                    ? "bg-primary-light/10 text-primary font-medium"
                    : "text-neutral-700 hover:bg-neutral-100"
                }`}
              >
                <Settings className="mr-3 h-5 w-5" />
                <span>Paramètres</span>
              </Link>
            </>
          )}
        </nav>
      </div>
    </div>
  );
}
