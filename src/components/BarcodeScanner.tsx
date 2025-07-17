import React, { useState } from 'react';
import { useZxing } from 'react-zxing';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X, Camera, Loader2 } from 'lucide-react';

interface BarcodeScannerProps {
  onScanSuccess: (barcode: string) => void;
  onClose: () => void;
  isLoading?: boolean;
}

export function BarcodeScanner({ onScanSuccess, onClose, isLoading }: BarcodeScannerProps) {
  const [error, setError] = useState<string>('');

  const { ref } = useZxing({
    constraints: {
      video: {
        facingMode: "environment", // Force rear camera
        width: { ideal: 1280 },
        height: { ideal: 720 }
      }
    },
    onDecodeResult(result) {
      onScanSuccess(result.getText());
    },
    onDecodeError(error) {
      setError('Erro ao decodificar código de barras');
      console.error('Decode error:', error);
    },
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card border-border">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Camera className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">
                Scanner de Código de Barras
              </h2>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-4">
            <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
              <video ref={ref} className="w-full h-full object-cover" />
              {isLoading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="text-center text-white">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                    <p>Buscando produto...</p>
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="text-center text-destructive text-sm">
                {error}
              </div>
            )}

            <div className="text-center text-muted-foreground text-sm">
              Posicione o código de barras no centro da câmera
            </div>

            <Button 
              variant="outline" 
              onClick={onClose}
              className="w-full"
            >
              Cancelar
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}