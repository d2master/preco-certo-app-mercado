import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ProductCard } from './ProductCard';
import { BarcodeScanner } from './BarcodeScanner';
import { Product } from '@/types/product';
import { getProductByBarcode, formatProductFromAPI } from '@/services/productService';
import { Scan, Check, ArrowLeft, ShoppingCart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ShoppingListViewProps {
  products: Product[];
  onUpdateProducts: (products: Product[]) => void;
  onComplete: () => void;
  onBack: () => void;
}

export function ShoppingListView({ products, onUpdateProducts, onComplete, onBack }: ShoppingListViewProps) {
  const [showScanner, setShowScanner] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [listName, setListName] = useState('');
  const { toast } = useToast();

  const handleScanSuccess = async (barcode: string) => {
    setIsLoading(true);
    try {
      const productData = await getProductByBarcode(barcode);
      
      if (productData && productData.status === 1) {
        const newProduct = formatProductFromAPI(productData);
        
        // Verificar se o produto já existe na lista
        const existingProductIndex = products.findIndex(p => p.code === newProduct.code);
        
        if (existingProductIndex !== -1) {
          // Se existe, incrementar quantidade
          const updatedProducts = [...products];
          updatedProducts[existingProductIndex].quantity += 1;
          onUpdateProducts(updatedProducts);
          toast({
            title: "Produto atualizado",
            description: `Quantidade de ${newProduct.name} incrementada`,
          });
        } else {
          // Se não existe, adicionar novo produto
          onUpdateProducts([...products, newProduct]);
          toast({
            title: "Produto adicionado",
            description: `${newProduct.name} foi adicionado à lista`,
          });
        }
      } else {
        toast({
          title: "Produto não encontrado",
          description: "Não foi possível encontrar informações sobre este produto",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao buscar informações do produto",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setShowScanner(false);
    }
  };

  const handleUpdateQuantity = (id: string, quantity: number) => {
    const updatedProducts = products.map(product =>
      product.id === id ? { ...product, quantity } : product
    );
    onUpdateProducts(updatedProducts);
  };

  const handleRemoveProduct = (id: string) => {
    const updatedProducts = products.filter(product => product.id !== id);
    onUpdateProducts(updatedProducts);
  };

  const handleCompleteList = () => {
    if (products.length === 0) {
      toast({
        title: "Lista vazia",
        description: "Adicione pelo menos um produto para finalizar a lista",
        variant: "destructive",
      });
      return;
    }

    onComplete();
    toast({
      title: "Lista finalizada",
      description: "Sua lista de compras foi salva no histórico",
    });
  };

  const totalItems = products.reduce((sum, product) => sum + product.quantity, 0);

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-foreground">Lista de Compras</h1>
            <p className="text-sm text-muted-foreground">
              {totalItems} {totalItems === 1 ? 'item' : 'itens'}
            </p>
          </div>
        </div>

        {/* Nome da Lista */}
        <Card className="p-4 mb-6 shadow-card border-border">
          <Input
            placeholder="Nome da lista (opcional)"
            value={listName}
            onChange={(e) => setListName(e.target.value)}
            className="border-border"
          />
        </Card>

        {/* Botão Scanner */}
        <Button
          onClick={() => setShowScanner(true)}
          className="w-full mb-6 h-12 text-base shadow-button"
          size="lg"
        >
          <Scan className="h-5 w-5 mr-2" />
          Escanear Produto
        </Button>

        {/* Lista de Produtos */}
        <div className="space-y-4 mb-6">
          {products.length === 0 ? (
            <Card className="p-8 text-center shadow-card border-border">
              <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Sua lista está vazia. Escaneie um produto para começar!
              </p>
            </Card>
          ) : (
            products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onUpdateQuantity={handleUpdateQuantity}
                onRemove={handleRemoveProduct}
              />
            ))
          )}
        </div>

        {/* Botão Finalizar */}
        {products.length > 0 && (
          <Button
            onClick={handleCompleteList}
            variant="default"
            size="lg"
            className="w-full h-12 text-base shadow-button"
          >
            <Check className="h-5 w-5 mr-2" />
            Finalizar Lista
          </Button>
        )}

        {/* Scanner Modal */}
        {showScanner && (
          <BarcodeScanner
            onScanSuccess={handleScanSuccess}
            onClose={() => setShowScanner(false)}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  );
}