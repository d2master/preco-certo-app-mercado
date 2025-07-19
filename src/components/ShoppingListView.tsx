import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ProductCard } from './ProductCard';
import { BarcodeScanner } from './BarcodeScanner';
import { Product } from '@/types/product';
import { getProductByBarcode, formatProductFromAPI } from '@/services/productService';
import { Scan, Check, ArrowLeft, ShoppingCart, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ShoppingListViewProps {
  products: Product[];
  onUpdateProducts: (products: Product[]) => void;
  onComplete: (listName?: string) => void;
  onBack: () => void;
}

export function ShoppingListView({ products, onUpdateProducts, onComplete, onBack }: ShoppingListViewProps) {
  const [showScanner, setShowScanner] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [listName, setListName] = useState('');
  const [showManualDialog, setShowManualDialog] = useState(false);
  const [manualProductName, setManualProductName] = useState('');
  const [manualProductPrice, setManualProductPrice] = useState('0');
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

  const handleUpdatePrice = (id: string, price: number) => {
    const updatedProducts = products.map(product =>
      product.id === id ? { ...product, price } : product
    );
    onUpdateProducts(updatedProducts);
  };

  const handleRemoveProduct = (id: string) => {
    const updatedProducts = products.filter(product => product.id !== id);
    onUpdateProducts(updatedProducts);
  };

  const formatPriceDisplay = (centavos: string) => {
    const numCentavos = parseInt(centavos || '0');
    const reais = Math.floor(numCentavos / 100);
    const cents = numCentavos % 100;
    return `${reais},${cents.toString().padStart(2, '0')}`;
  };

  const handlePriceInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Only allow digits
    const digitsOnly = value.replace(/\D/g, '');
    
    // Limit to reasonable number of digits (max 999999 = R$ 9999,99)
    if (digitsOnly.length <= 6) {
      setManualProductPrice(digitsOnly);
    }
  };

  const handlePriceKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      setManualProductPrice(prev => prev.slice(0, -1));
    } else if (e.key === 'Delete' || e.key === 'Clear') {
      e.preventDefault();
      setManualProductPrice('0');
    } else if (e.key === 'Enter') {
      handleManualAdd();
    } else if (!/\d/.test(e.key) && !['Tab', 'Escape'].includes(e.key)) {
      e.preventDefault();
    }
  };

  const handleManualAdd = () => {
    if (!manualProductName.trim()) {
      toast({
        title: "Nome inválido",
        description: "Digite o nome do produto",
        variant: "destructive",
      });
      return;
    }

    const centavos = parseInt(manualProductPrice || '0');
    const price = centavos / 100;

    const newProduct: Product = {
      id: Date.now().toString(),
      name: manualProductName.trim(),
      brand: '',
      code: '',
      image: '',
      quantity: 1,
      price: price
    };

    // Verificar se o produto já existe na lista
    const existingProductIndex = products.findIndex(p => 
      p.name.toLowerCase() === newProduct.name.toLowerCase()
    );
    
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

    setManualProductName('');
    setManualProductPrice('0');
    setShowManualDialog(false);
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

    onComplete(listName.trim() || undefined);
    toast({
      title: "Lista finalizada",
      description: "Sua lista de compras foi salva no histórico",
    });
  };

  const totalItems = products.reduce((sum, product) => sum + product.quantity, 0);
  const totalPrice = products.reduce((sum, product) => sum + (product.price * product.quantity), 0);

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
            <div className="text-sm text-muted-foreground">
              <p>{totalItems} {totalItems === 1 ? 'item' : 'itens'}</p>
              <p className="font-medium text-primary">Total: R$ {totalPrice.toFixed(2)}</p>
            </div>
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

        {/* Botões de Adicionar */}
        <div className="space-y-3 mb-6">
          <Button
            onClick={() => setShowScanner(true)}
            className="w-full h-12 text-base shadow-button"
            size="lg"
          >
            <Scan className="h-5 w-5 mr-2" />
            Escanear Produto
          </Button>
          
          <Dialog open={showManualDialog} onOpenChange={setShowManualDialog}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="w-full h-12 text-base shadow-button"
                size="lg"
              >
                <Plus className="h-5 w-5 mr-2" />
                Adicionar Produto Manual
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Produto Manual</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Nome do Produto
                  </label>
                  <Input
                    placeholder="Digite o nome do produto"
                    value={manualProductName}
                    onChange={(e) => setManualProductName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && document.getElementById('price-input')?.focus()}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Preço
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">R$</span>
                    <input
                      id="price-input"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={formatPriceDisplay(manualProductPrice)}
                      onChange={handlePriceInputChange}
                      onKeyDown={handlePriceKeyDown}
                      className="flex-1 h-10 px-3 py-2 text-right font-mono rounded-md border border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      placeholder="0,00"
                    />
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowManualDialog(false);
                      setManualProductName('');
                      setManualProductPrice('0');
                    }}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleManualAdd}
                    disabled={!manualProductName.trim()}
                    className="flex-1"
                  >
                    Adicionar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

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
                onUpdatePrice={handleUpdatePrice}
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
