import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { Category } from "@shared/schema";
import { 
  BrickWall, 
  Paintbrush, 
  Wrench, 
  Hammer, 
  Droplet, 
  Lightbulb, 
  Construction, 
  Ruler
} from "lucide-react";

interface CategoryCardProps {
  category: Category;
}

const getCategoryIcon = (name: string) => {
  const categoryIcons: Record<string, JSX.Element> = {
    "Briques & Blocs": <BrickWall className="text-primary text-2xl" />,
    "Peintures": <Paintbrush className="text-primary text-2xl" />,
    "Outils": <Wrench className="text-primary text-2xl" />,
    "Quincaillerie": <Hammer className="text-primary text-2xl" />,
    "Plomberie": <Droplet className="text-primary text-2xl" />,
    "Électricité": <Lightbulb className="text-primary text-2xl" />,
    "Matériaux": <Construction className="text-primary text-2xl" />,
  };

  return categoryIcons[name] || <Ruler className="text-primary text-2xl" />;
};

export function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link href={`/categories/${category.id}`}>
      <Card className="bg-white rounded-lg shadow-sm p-4 flex flex-col items-center cursor-pointer hover:shadow-md transition duration-150">
        <div className="bg-primary-light/10 p-3 rounded-full mb-3">
          {getCategoryIcon(category.name)}
        </div>
        <CardContent className="p-0 text-center">
          <h4 className="font-medium">{category.name}</h4>
        </CardContent>
      </Card>
    </Link>
  );
}
