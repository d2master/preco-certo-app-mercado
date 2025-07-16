import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Product } from '@/types/product';
import { Minus, Plus, Trash2, Package } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onUpdatePrice: (id: string, price: number) => void;
  onRemove: (id: string) => void;
}

export function ProductCard({ product, onUpdateQuantity, onUpdatePrice, onRemove }: ProductCardProps) {
  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1) {
      onUpdateQuantity(product.id, newQuantity);
    }
  };

  const handlePriceChange = (newPrice: number) => {
    if (newPrice >= 0) {
      onUpdatePrice(product.id, newPrice);
    }
  };

  const totalPrice = product.price * product.quantity;

  return (
    <Card className="p-4 shadow-card border-border bg-gradient-card">
      <div className="flex gap-4 items-start">
        <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
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

        <div className="flex-1 min-w-0 space-y-2">
          <div className="space-y-1">
            <h3 className="font-medium text-foreground text-sm leading-tight break-words">
              {product.name}
            </h3>
            {product.brand && (
              <p className="text-xs text-muted-foreground">
                {product.brand}
              </p>
            )}
            {product.code && (
              <p className="text-xs text-muted-foreground">
                Código: {product.code}
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">R$</span>
            <Input
              type="number"
              value={product.price.toFixed(2)}
              onChange={(e) => handlePriceChange(parseFloat(e.target.value) || 0)}
              className="w-20 h-6 text-xs"
              min="0"
              step="0.01"
              placeholder="0,00"
            />
          </div>
          
          {product.quantity > 1 && (
            <p className="text-sm font-medium text-primary">
              Total: R$ {totalPrice.toFixed(2)}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2 items-end flex-shrink-0">
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuantityChange(product.quantity - 1)}
              disabled={product.quantity <= 1}
              className="h-7 w-7 p-0"
            >
              <Minus className="h-3 w-3" />
            </Button>
            
            <Input
              type="number"
              value={product.quantity}
              onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
              className="w-12 h-7 text-center text-xs"
              min="1"
            />
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuantityChange(product.quantity + 1)}
              className="h-7 w-7 p-0"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onRemove(product.id)}
            className="h-7 w-7 p-0 text-destructive hover:text-destructive-foreground hover:bg-destructive"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </Card>
  );
}