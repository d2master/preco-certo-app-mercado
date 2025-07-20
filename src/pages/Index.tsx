import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ShoppingListView } from '@/components/ShoppingListView';
import { HistoryView } from '@/components/HistoryView';
import { ListDetailView } from '@/components/ListDetailView';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Product, ShoppingList } from '@/types/product';
import { ShoppingCart, History, Package } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type View = 'home' | 'shopping' | 'history' | 'list-detail';

const Index = () => {
  const [currentView, setCurrentView] = useState<View>('home');
  const [currentProducts, setCurrentProducts] = useState<Product[]>([]);
  const [selectedList, setSelectedList] = useState<ShoppingList | null>(null);
  const [shoppingLists, setShoppingLists] = useLocalStorage<ShoppingList[]>('shopping-lists', []);
  const { toast } = useToast();

  const handleStartShopping = () => {
    setCurrentProducts([]);
    setCurrentView('shopping');
  };

  const handleCompleteList = (listName?: string) => {
    if (currentProducts.length === 0) return;
    const total = currentProducts.reduce((sum, product) => sum + product.price * product.quantity, 0);
    const newList: ShoppingList = {
      id: `list-${Date.now()}`,
      name: listName || `Lista ${new Date().toLocaleDateString('pt-BR')}`,
      products: [...currentProducts],
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      total
    };
    setShoppingLists(prev => [newList, ...prev]);
    setCurrentProducts([]);
    setCurrentView('home');
  };

  const handleRepeatList = (list: ShoppingList) => {
    // Criar novos IDs para os produtos para evitar conflitos
    const productsWithNewIds = list.products.map(product => ({
      ...product,
      id: `${product.code}-${Date.now()}-${Math.random()}`
    }));
    setCurrentProducts(productsWithNewIds);
    setCurrentView('shopping');
    toast({
      title: "Lista carregada",
      description: `${list.products.length} produtos adicionados à nova lista`
    });
  };

  const handleViewHistory = () => {
    setCurrentView('history');
  };

  const handleSelectList = (list: ShoppingList) => {
    setSelectedList(list);
    setCurrentView('list-detail');
  };

  const handleBackToHome = () => {
    setCurrentView('home');
  };

  const handleBackToHistory = () => {
    setSelectedList(null);
    setCurrentView('history');
  };

  const handleDeleteList = (listId: string) => {
    setShoppingLists(prev => prev.filter(list => list.id !== listId));
    toast({
      title: "Lista excluída",
      description: "A lista foi removida do histórico"
    });
    // Se estamos visualizando a lista que foi excluída, voltar para o histórico
    if (selectedList?.id === listId) {
      handleBackToHistory();
    }
  };

  if (currentView === 'shopping') {
    return (
      <ShoppingListView 
        products={currentProducts} 
        onUpdateProducts={setCurrentProducts} 
        onComplete={handleCompleteList} 
        onBack={handleBackToHome} 
      />
    );
  }

  if (currentView === 'history') {
    return (
      <HistoryView 
        shoppingLists={shoppingLists} 
        onBack={handleBackToHome} 
        onSelectList={handleSelectList}
      />
    );
  }

  if (currentView === 'list-detail' && selectedList) {
    return (
      <ListDetailView
        shoppingList={selectedList}
        onBack={handleBackToHistory}
        onRepeatList={handleRepeatList}
        onDeleteList={handleDeleteList}
      />
    );
  }

  return <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto p-4 pt-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-card">
            <Package className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Preço Certo</h1>
          <p className="text-muted-foreground">
            Sua lista de compras inteligente
          </p>
        </div>

        {/* Cards Principais */}
        <div className="space-y-4 mb-8">
          {/* Botão Nova Lista */}
          <Card className="p-6 shadow-card border-border bg-gradient-card cursor-pointer hover:shadow-lg transition-all duration-300" onClick={handleStartShopping}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center shadow-button">
                <ShoppingCart className="h-6 w-6 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-foreground">
                  Nova Lista de Compras
                </h2>
                <p className="text-sm text-muted-foreground">
                  Escaneie produtos e organize sua lista
                </p>
              </div>
            </div>
          </Card>

          {/* Botão Histórico */}
          <Card className="p-6 shadow-card border-border bg-gradient-card cursor-pointer hover:shadow-lg transition-all duration-300" onClick={handleViewHistory}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center">
                <History className="h-6 w-6 text-secondary-foreground" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-foreground">
                  Histórico de Compras
                </h2>
                <p className="text-sm text-muted-foreground">
                  {shoppingLists.length} {shoppingLists.length === 1 ? 'lista salva' : 'listas salvas'}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Recursos */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Recursos</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4 text-center shadow-card border-border">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Package className="h-4 w-4 text-blue-600" />
              </div>
              <p className="text-sm font-medium text-foreground">Scanner</p>
              <p className="text-xs text-muted-foreground">Código de barras</p>
            </Card>

            <Card className="p-4 text-center shadow-card border-border">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <ShoppingCart className="h-4 w-4 text-blue-600" />
              </div>
              <p className="text-sm font-medium text-foreground">Organizar</p>
              <p className="text-xs text-muted-foreground">Lista inteligente</p>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 mb-4">
          <p className="text-xs text-muted-foreground">Versão 1.0 • By Jamerson Malheiros</p>
        </div>
      </div>
    </div>;
};

export default Index;
