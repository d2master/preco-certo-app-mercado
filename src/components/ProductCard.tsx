import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Product } from '@/types/product';
import { Minus, Plus, Trash2, Package } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onUpdatePrice: (id: string, price: number) => void;
  onRemove: (id: string) => void;
}

export function ProductCard({ product, onUpdateQuantity, onUpdatePrice, onRemove }: ProductCardProps) {
  const [priceInput, setPriceInput] = useState('');
  const [isEditingPrice, setIsEditingPrice] = useState(false);

  // Initialize price input when component mounts or product changes
  useEffect(() => {
    const formattedPrice = (product.price * 100).toFixed(0).padStart(3, '0');
    setPriceInput(formattedPrice);
  }, [product.price]);

  const formatPriceDisplay = (centavos: string) => {
    const paddedCentavos = centavos.padStart(3, '0');
    const reais = paddedCentavos.slice(0, -2) || '0';
    const cents = paddedCentavos.slice(-2);
    return `${reais},${cents}`;
  };

  const handlePriceInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Only allow digits
    const digitsOnly = value.replace(/\D/g, '');
    
    // Limit to reasonable number of digits (max 999999 = R$ 9999,99)
    if (digitsOnly.length <= 6) {
      setPriceInput(digitsOnly);
    }
  };

  const handlePriceKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      setPriceInput(prev => prev.slice(0, -1));
    } else if (e.key === 'Delete' || e.key === 'Clear') {
      e.preventDefault();
      setPriceInput('0');
    } else if (e.key === 'Enter') {
      handlePriceBlur();
    } else if (!/\d/.test(e.key) && !['Tab', 'Escape'].includes(e.key)) {
      e.preventDefault();
    }
  };

  const handlePriceFocus = () => {
    setIsEditingPrice(true);
  };

  const handlePriceBlur = () => {
    setIsEditingPrice(false);
    const centavos = parseInt(priceInput || '0');
    const newPrice = centavos / 100;
    if (newPrice !== product.price) {
      onUpdatePrice(product.id, newPrice);
    }
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1) {
      onUpdateQuantity(product.id, newQuantity);
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
            <input
              type="text"
              value={formatPriceDisplay(priceInput)}
              onChange={handlePriceInputChange}
              onKeyDown={handlePriceKeyDown}
              onFocus={handlePriceFocus}
              onBlur={handlePriceBlur}
              className={`w-20 h-6 text-xs px-2 py-1 rounded border text-right font-mono ${
                isEditingPrice 
                  ? 'border-primary bg-primary/5 ring-1 ring-primary/20' 
                  : 'border-border bg-background'
              } focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20`}
              placeholder="0,00"
            />
          </div>
          
          {product.quantity > 1 && (
            <p className="text-sm font-medium text-primary">
              Total: R$ {totalPrice.toFixed(2).replace('.', ',')}
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
            
            <input
              type="number"
              value={product.quantity}
              onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
              className="w-12 h-7 text-center text-xs px-2 py-1 rounded border border-border bg-background focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
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
