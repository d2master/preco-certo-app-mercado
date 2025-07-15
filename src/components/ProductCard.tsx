import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Product } from '@/types/product';
import { Minus, Plus, Trash2, Package } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
}

export function ProductCard({ product, onUpdateQuantity, onRemove }: ProductCardProps) {
  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1) {
      onUpdateQuantity(product.id, newQuantity);
    }
  };

  return (
    <Card className="p-4 shadow-card border-border bg-gradient-card">
      <div className="flex gap-4">
        <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
          {product.image ? (
            <img 
              src={product.image} 
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          <Package className="h-8 w-8 text-muted-foreground" />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-foreground truncate">
            {product.name}
          </h3>
          {product.brand && (
            <p className="text-sm text-muted-foreground mt-1">
              {product.brand}
            </p>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            Código: {product.code}
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuantityChange(product.quantity - 1)}
              disabled={product.quantity <= 1}
              className="h-8 w-8 p-0"
            >
              <Minus className="h-4 w-4" />
            </Button>
            
            <Input
              type="number"
              value={product.quantity}
              onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
              className="w-16 h-8 text-center text-sm"
              min="1"
            />
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuantityChange(product.quantity + 1)}
              className="h-8 w-8 p-0"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onRemove(product.id)}
            className="h-8 w-8 p-0 text-destructive hover:text-destructive-foreground hover:bg-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}