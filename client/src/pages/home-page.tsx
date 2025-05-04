import { MainLayout } from "@/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { CategoryCard } from "@/components/category-card";
import { ProductGrid } from "@/components/product-grid";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Category, Product } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

export default function HomePage() {
  // Fetch featured categories
  const {
    data: categories,
    isLoading: categoriesLoading,
  } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  // Fetch featured products
  const {
    data: products,
    isLoading: productsLoading,
  } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    select: (data) => data.slice(0, 4), // Just take the first 4 products for the homepage
  });

  // Fetch supplier data
  const {
    data: suppliers,
    isLoading: suppliersLoading,
  } = useQuery<any[]>({
    queryKey: ["/api/suppliers"],
    // Temporary hardcoded fallback since the API endpoint isn't implemented yet
    queryFn: async () => {
      return []; 
    },
  });

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="bg-primary rounded-xl overflow-hidden shadow-md mb-10 mt-8">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center">
            <div className="p-8 md:w-1/2">
              <h2 className="text-white text-3xl md:text-4xl font-bold mb-4">
                Matériaux de qualité pour vos projets de construction
              </h2>
              <p className="text-blue-100 mb-6">
                Trouvez tous les matériaux nécessaires pour vos chantiers auprès de fournisseurs vérifiés.
              </p>
              <Link href="/products">
                <Button size="lg" variant="secondary">
                  Découvrir les produits
                </Button>
              </Link>
            </div>
            <div className="md:w-1/2">
              <img
                src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600&q=80"
                alt="Matériaux de construction"
                className="w-full h-64 md:h-80 object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Popular Categories */}
      <section className="mb-10 container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-semibold text-neutral-800">Catégories populaires</h3>
          <Link href="/categories" className="text-primary hover:underline">
            Voir tout
          </Link>
        </div>
        {categoriesLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-28 w-full rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories?.slice(0, 6).map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        )}
      </section>

      {/* Featured Products */}
      <section className="mb-10 container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-semibold text-neutral-800">Produits en vedette</h3>
          <Link href="/products" className="text-primary hover:underline">
            Voir tout
          </Link>
        </div>
        <ProductGrid products={products} loading={productsLoading} />
      </section>

      {/* Suppliers Section */}
      <section className="container mx-auto px-4 mb-10">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-semibold text-neutral-800">Nos fournisseurs</h3>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-neutral-600 mb-6">
            Nos fournisseurs sont des professionnels qualifiés qui proposent des matériaux de construction de haute qualité.
          </p>
          {suppliersLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          ) : suppliers && suppliers.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {suppliers.map((supplier, index) => (
                <div key={index} className="border border-neutral-200 rounded-lg p-4 text-center hover:border-primary hover:shadow-sm transition duration-150">
                  <h4 className="font-medium mb-1">{supplier.companyName}</h4>
                  <p className="text-sm text-neutral-500">{supplier.specialization}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="border border-neutral-200 rounded-lg p-4 text-center hover:border-primary hover:shadow-sm transition duration-150">
                <h4 className="font-medium mb-1">MatBTP</h4>
                <p className="text-sm text-neutral-500">Matériaux structurels</p>
              </div>
              <div className="border border-neutral-200 rounded-lg p-4 text-center hover:border-primary hover:shadow-sm transition duration-150">
                <h4 className="font-medium mb-1">BricoPro</h4>
                <p className="text-sm text-neutral-500">Outillage professionnel</p>
              </div>
              <div className="border border-neutral-200 rounded-lg p-4 text-center hover:border-primary hover:shadow-sm transition duration-150">
                <h4 className="font-medium mb-1">PeintureDeco</h4>
                <p className="text-sm text-neutral-500">Peintures et enduits</p>
              </div>
              <div className="border border-neutral-200 rounded-lg p-4 text-center hover:border-primary hover:shadow-sm transition duration-150">
                <h4 className="font-medium mb-1">ElecPlomb</h4>
                <p className="text-sm text-neutral-500">Électricité et plomberie</p>
              </div>
            </div>
          )}
          <div className="mt-6 text-center">
            <Link href="/auth" className="text-primary hover:underline">
              Devenir fournisseur
            </Link>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
