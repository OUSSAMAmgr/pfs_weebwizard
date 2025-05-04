import { MainLayout } from "@/layouts/MainLayout";
import { CategoryCard } from "@/components/category-card";
import { useQuery } from "@tanstack/react-query";
import { Category } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

export default function CategoriesPage() {
  // Fetch categories
  const {
    data: categories,
    isLoading: categoriesLoading,
  } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">Catégories</h2>
        
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <p className="text-neutral-600">
            Explorez notre large gamme de catégories de produits pour trouver rapidement les matériaux de construction dont vous avez besoin pour vos projets.
          </p>
        </div>
        
        {categoriesLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} className="h-28 w-full rounded-lg" />
            ))}
          </div>
        ) : categories && categories.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-neutral-700">Aucune catégorie trouvée</h3>
            <p className="text-neutral-500 mt-2">
              Aucune catégorie n'est disponible pour le moment.
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
