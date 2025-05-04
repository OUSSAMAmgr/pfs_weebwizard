import { Button } from "@/components/ui/button";
import { Trash2, Minus, Plus } from "lucide-react";

export interface CartItemType {
  id: number;
  productId: number;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  category?: string;
  stock: number;
}

interface CartItemProps {
  item: CartItemType;
  onQuantityChange: (id: number, quantity: number) => void;
  onRemove: (id: number) => void;
}

export function CartItem({ item, onQuantityChange, onRemove }: CartItemProps) {
  const handleIncrement = () => {
    if (item.quantity < item.stock) {
      onQuantityChange(item.id, item.quantity + 1);
    }
  };

  const handleDecrement = () => {
    if (item.quantity > 1) {
      onQuantityChange(item.id, item.quantity - 1);
    }
  };

  return (
    <div className="flex items-center p-4 border-b border-gray-200 last:border-b-0">
      <div className="flex-shrink-0 w-20 h-20 mr-4">
        <img
          src={item.imageUrl || "https://via.placeholder.com/100?text=Produit"}
          alt={item.name}
          className="w-full h-full object-cover rounded"
        />
      </div>
      <div className="flex-grow">
        <h3 className="font-medium text-neutral-800">{item.name}</h3>
        <div className="text-sm text-neutral-500 mb-2">
          {item.category || "Catégorie"}
        </div>
        <div className="flex items-center justify-between">
          <div className="text-primary font-semibold">
            {(item.price * item.quantity).toFixed(2)} €
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={handleDecrement}
              disabled={item.quantity <= 1}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-8 text-center">{item.quantity}</span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={handleIncrement}
              disabled={item.quantity >= item.stock}
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive ml-2"
              onClick={() => onRemove(item.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}