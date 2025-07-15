import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ShoppingList } from '@/types/product';
import { ArrowLeft, Calendar, ShoppingBag, RotateCcw, Package, Trash2 } from 'lucide-react';

interface HistoryViewProps {
  shoppingLists: ShoppingList[];
  onBack: () => void;
  onRepeatList: (list: ShoppingList) => void;
  onDeleteList: (listId: string) => void;
}

export function HistoryView({ shoppingLists, onBack, onRepeatList, onDeleteList }: HistoryViewProps) {
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
            <h1 className="text-xl font-bold text-foreground">Histórico de Compras</h1>
            <p className="text-sm text-muted-foreground">
              {shoppingLists.length} {shoppingLists.length === 1 ? 'lista' : 'listas'} salvas
            </p>
          </div>
        </div>

        {/* Lista de Histórico */}
        <div className="space-y-4">
          {shoppingLists.length === 0 ? (
            <Card className="p-8 text-center shadow-card border-border">
              <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-2">
                Nenhuma lista finalizada ainda
              </p>
              <p className="text-sm text-muted-foreground">
                Complete uma lista de compras para vê-la aqui
              </p>
            </Card>
          ) : (
            shoppingLists.map((list) => (
              <Card key={list.id} className="p-4 shadow-card border-border bg-gradient-card">
                <div className="space-y-3">
                  {/* Header da Lista */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground truncate">
                        {list.name || `Lista ${formatDate(list.createdAt).split(' ')[0]}`}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">
                          {formatDate(list.completedAt || list.createdAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Package className="h-3 w-3 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">
                          {getTotalItems(list)} {getTotalItems(list) === 1 ? 'item' : 'itens'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 ml-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onRepeatList(list)}
                      >
                        <RotateCcw className="h-4 w-4 mr-1" />
                        Repetir
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDeleteList(list.id)}
                        className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Produtos da Lista */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-foreground">Produtos:</h4>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {list.products.map((product, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <div className="w-8 h-8 rounded bg-muted flex items-center justify-center overflow-hidden">
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
                            <Package className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-foreground truncate">{product.name}</p>
                            {product.brand && (
                              <p className="text-xs text-muted-foreground truncate">
                                {product.brand}
                              </p>
                            )}
                          </div>
                          <span className="text-muted-foreground font-medium">
                            {product.quantity}x
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}