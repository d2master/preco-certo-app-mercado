
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ShoppingList } from '@/types/product';
import { ArrowLeft, Calendar, ShoppingBag, Package } from 'lucide-react';

interface HistoryViewProps {
  shoppingLists: ShoppingList[];
  onBack: () => void;
  onSelectList: (list: ShoppingList) => void;
}

export function HistoryView({ shoppingLists, onBack, onSelectList }: HistoryViewProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getTotalItems = (list: ShoppingList) => {
    return list.products.reduce((sum, product) => sum + product.quantity, 0);
  };

  const getListIcon = (list: ShoppingList) => {
    // Gerar cor baseada no ID da lista para consistência
    const colors = [
      'bg-blue-500',
      'bg-green-500', 
      'bg-purple-500',
      'bg-orange-500',
      'bg-pink-500',
      'bg-indigo-500'
    ];
    const colorIndex = list.id.length % colors.length;
    return colors[colorIndex];
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

        {/* Grid de Listas */}
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
            <div className="grid grid-cols-2 gap-4">
              {shoppingLists.map((list) => (
                <Card 
                  key={list.id} 
                  className="p-4 shadow-card border-border bg-gradient-card cursor-pointer hover:shadow-lg transition-all duration-300"
                  onClick={() => onSelectList(list)}
                >
                  <div className="space-y-3">
                    {/* Ícone da Lista */}
                    <div className={`w-12 h-12 rounded-lg ${getListIcon(list)} flex items-center justify-center mx-auto shadow-button`}>
                      <ShoppingBag className="h-6 w-6 text-white" />
                    </div>

                    {/* Nome da Lista */}
                    <div className="text-center">
                      <h3 className="font-medium text-foreground text-sm truncate">
                        {list.name}
                      </h3>
                      <div className="flex items-center justify-center gap-1 mt-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">
                          {formatDate(list.completedAt || list.createdAt)}
                        </p>
                      </div>
                    </div>

                    {/* Informações Resumidas */}
                    <div className="space-y-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Package className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {getTotalItems(list)} {getTotalItems(list) === 1 ? 'item' : 'itens'}
                        </span>
                      </div>
                      <div className="text-sm font-medium text-primary">
                        R$ {list.total?.toFixed(2) || '0,00'}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
