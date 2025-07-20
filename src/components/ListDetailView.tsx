
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ShoppingList } from '@/types/product';
import { ArrowLeft, Calendar, ShoppingBag, RotateCcw, Package, Trash2 } from 'lucide-react';

interface ListDetailViewProps {
  shoppingList: ShoppingList;
  onBack: () => void;
  onRepeatList: (list: ShoppingList) => void;
  onDeleteList: (listId: string) => void;
}

export function ListDetailView({ shoppingList, onBack, onRepeatList, onDeleteList }: ListDetailViewProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTotalItems = (list: ShoppingList) => {
    return list.products.reduce((sum, product) => sum + product.quantity, 0);
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-foreground">{shoppingList.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Calendar className="h-3 w-3 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {formatDate(shoppingList.completedAt || shoppingList.createdAt)}
              </p>
            </div>
          </div>
        </div>

        {/* Informações da Lista */}
        <Card className="p-4 mb-6 shadow-card border-border bg-gradient-card">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="flex items-center justify-center gap-2 mb-1">
                <Package className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Total de Itens</span>
              </div>
              <p className="text-2xl font-bold text-foreground">
                {getTotalItems(shoppingList)}
              </p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-2 mb-1">
                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Valor Total</span>
              </div>
              <p className="text-2xl font-bold text-primary">
                R$ {shoppingList.total?.toFixed(2) || '0,00'}
              </p>
            </div>
          </div>
        </Card>

        {/* Botões de Ação */}
        <div className="flex gap-3 mb-6">
          <Button
            onClick={() => onRepeatList(shoppingList)}
            className="flex-1"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Repetir Lista
          </Button>
          <Button
            variant="outline"
            onClick={() => onDeleteList(shoppingList.id)}
            className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Produtos da Lista */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Produtos</h2>
          <div className="space-y-3">
            {shoppingList.products.map((product, index) => (
              <Card key={index} className="p-4 shadow-card border-border">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
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
                    <Package className="h-6 w-6 text-muted-foreground" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground truncate">{product.name}</h3>
                    {product.brand && (
                      <p className="text-sm text-muted-foreground truncate">
                        {product.brand}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-muted-foreground">
                        Quantidade: {product.quantity}
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Preço unitário</p>
                    <p className="font-medium text-foreground">
                      R$ {product.price?.toFixed(2) || '0,00'}
                    </p>
                    {product.quantity > 1 && (
                      <>
                        <p className="text-xs text-muted-foreground mt-1">Total</p>
                        <p className="text-sm font-medium text-primary">
                          R$ {((product.price || 0) * product.quantity).toFixed(2)}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
