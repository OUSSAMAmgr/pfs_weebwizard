import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { Building, ShoppingCart, Search, Menu, X, User, Heart } from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { apiRequest } from "@/lib/queryClient";
import { Product } from "@shared/schema";

export function Navbar() {
  const [location, navigate] = useLocation();
  const { user, logoutMutation } = useAuth();
  const { cartItems, getTotalItems } = useCart();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setShowResults(true);
    
    try {
      const response = await apiRequest("GET", `/api/products/search?query=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error("Erreur lors de la recherche :", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleProductClick = (productId: number) => {
    navigate(`/products/${productId}`);
    setIsSearchOpen(false);
    setShowResults(false);
    setSearchQuery("");
  };

  const isActive = (path: string) => {
    return location === path;
  };

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center space-x-2 cursor-pointer">
              <Building className="text-primary h-6 w-6" />
              <h1 className="text-2xl font-bold font-inter text-neutral-800">MateriauxPro</h1>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/">
              <span className={`font-medium ${isActive('/') ? 'text-primary' : 'text-neutral-700 hover:text-primary'} transition duration-150 cursor-pointer`}>
                Accueil
              </span>
            </Link>
            <Link href="/products">
              <span className={`font-medium ${isActive('/products') ? 'text-primary' : 'text-neutral-700 hover:text-primary'} transition duration-150 cursor-pointer`}>
                Produits
              </span>
            </Link>
            <Link href="/categories">
              <span className={`font-medium ${isActive('/categories') ? 'text-primary' : 'text-neutral-700 hover:text-primary'} transition duration-150 cursor-pointer`}>
                Catégories
              </span>
            </Link>
            {user?.role === 'client' && (
              <Link href="/favorites">
                <span className={`font-medium ${isActive('/favorites') ? 'text-primary' : 'text-neutral-700 hover:text-primary'} transition duration-150 cursor-pointer`}>
                  Favoris
                </span>
              </Link>
            )}
            {user?.role === 'supplier' && (
              <Link href="/supplier">
                <span className={`font-medium ${isActive('/supplier') ? 'text-primary' : 'text-neutral-700 hover:text-primary'} transition duration-150 cursor-pointer`}>
                  Mes Produits
                </span>
              </Link>
            )}
            {user?.role === 'admin' && (
              <Link href="/admin">
                <span className={`font-medium ${isActive('/admin') ? 'text-primary' : 'text-neutral-700 hover:text-primary'} transition duration-150 cursor-pointer`}>
                  Administration
                </span>
              </Link>
            )}
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {/* Search Button */}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              aria-label="Search"
            >
              <Search className="h-5 w-5 text-neutral-600" />
            </Button>

            {/* Cart Button - Only show if client is logged in */}
            {user?.role === 'client' && (
              <Link href="/cart">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="relative"
                  aria-label="Cart"
                >
                  <ShoppingCart className="h-5 w-5 text-neutral-600" />
                  {cartItems.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-secondary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {getTotalItems()}
                    </span>
                  )}
                </Button>
              </Link>
            )}

            {/* User Menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="relative h-9 w-9 rounded-full bg-primary text-primary-foreground"
                  >
                    <User className="h-5 w-5 text-white" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
                  <DropdownMenuLabel className="text-sm font-normal text-neutral-500">{user.email}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile">
                      <div className="w-full cursor-pointer">Mon profil</div>
                    </Link>
                  </DropdownMenuItem>
                  {user.role === 'client' && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/orders">
                          <div className="w-full cursor-pointer">Mes commandes</div>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/favorites">
                          <div className="w-full cursor-pointer">Mes favoris</div>
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  {user.role === 'supplier' && (
                    <DropdownMenuItem asChild>
                      <Link href="/supplier">
                        <div className="w-full cursor-pointer">Tableau de bord</div>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {user.role === 'admin' && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin">
                        <div className="w-full cursor-pointer">Administration</div>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-500 cursor-pointer" onClick={handleLogout}>
                    Déconnexion
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Login">
                    <User className="h-5 w-5 text-neutral-600" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Compte</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/auth">
                      <div className="w-full cursor-pointer flex items-center">
                        <span className="mr-2">🔐</span> Se connecter
                      </div>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/auth?tab=register">
                      <div className="w-full cursor-pointer flex items-center">
                        <span className="mr-2">✨</span> S'inscrire
                      </div>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Mobile Menu Trigger */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden" aria-label="Menu">
                  <Menu className="h-5 w-5 text-neutral-600" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <div className="flex flex-col space-y-4 mt-8">
                  <Link href="/">
                    <span className="font-medium text-lg py-2 cursor-pointer">Accueil</span>
                  </Link>
                  <Link href="/products">
                    <span className="font-medium text-lg py-2 cursor-pointer">Produits</span>
                  </Link>
                  <Link href="/categories">
                    <span className="font-medium text-lg py-2 cursor-pointer">Catégories</span>
                  </Link>
                  {user?.role === 'client' && (
                    <>
                      <Link href="/favorites">
                        <span className="font-medium text-lg py-2 cursor-pointer">Favoris</span>
                      </Link>
                      <Link href="/cart">
                        <span className="font-medium text-lg py-2 cursor-pointer">Panier</span>
                      </Link>
                      <Link href="/orders">
                        <span className="font-medium text-lg py-2 cursor-pointer">Mes commandes</span>
                      </Link>
                    </>
                  )}
                  {user?.role === 'supplier' && (
                    <Link href="/supplier">
                      <span className="font-medium text-lg py-2 cursor-pointer">Tableau de bord</span>
                    </Link>
                  )}
                  {user?.role === 'admin' && (
                    <Link href="/admin">
                      <span className="font-medium text-lg py-2 cursor-pointer">Administration</span>
                    </Link>
                  )}
                  {!user && (
                    <Link href="/auth">
                      <span className="font-medium text-lg py-2 cursor-pointer">Se connecter</span>
                    </Link>
                  )}
                  {user && (
                    <Button variant="destructive" onClick={handleLogout}>
                      Déconnexion
                    </Button>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Search bar */}
      {isSearchOpen && (
        <div className="border-t border-gray-200 py-4 px-4">
          <div className="container mx-auto relative">
            <form onSubmit={handleSearch} className="relative">
              <input 
                type="text" 
                placeholder="Rechercher un produit..." 
                className="w-full border rounded-md py-2 px-4 pr-16 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
                <Button
                  type="submit"
                  variant="ghost"
                  size="icon"
                  disabled={isSearching}
                >
                  {isSearching ? (
                    <div className="h-5 w-5 border-2 border-t-transparent border-primary rounded-full animate-spin"></div>
                  ) : (
                    <Search className="h-5 w-5 text-neutral-600" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setIsSearchOpen(false);
                    setShowResults(false);
                  }}
                >
                  <X className="h-5 w-5 text-neutral-400" />
                </Button>
              </div>
            </form>
            
            {/* Search Results */}
            {showResults && searchResults.length > 0 && (
              <div className="absolute z-50 mt-2 w-full bg-white rounded-md shadow-lg border border-gray-200 max-h-96 overflow-y-auto">
                <div className="p-2">
                  <h3 className="text-sm font-medium text-neutral-500 mb-2">Résultats ({searchResults.length})</h3>
                  <div className="space-y-2">
                    {searchResults.map((product) => (
                      <div 
                        key={product.id}
                        className="p-2 hover:bg-gray-50 rounded-md cursor-pointer flex items-center"
                        onClick={() => handleProductClick(product.id)}
                      >
                        <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center mr-3">
                          {product.imageUrl ? (
                            <img 
                              src={product.imageUrl} 
                              alt={product.name} 
                              className="w-10 h-10 object-cover rounded"
                            />
                          ) : (
                            <Building className="h-6 w-6 text-neutral-400" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium">{product.name}</h4>
                          <p className="text-sm text-neutral-500">{product.price.toFixed(2)} €</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {showResults && searchQuery && !isSearching && searchResults.length === 0 && (
              <div className="absolute z-50 mt-2 w-full bg-white rounded-md shadow-lg border border-gray-200 p-4 text-center">
                <p className="text-neutral-500">Aucun résultat pour "{searchQuery}"</p>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
