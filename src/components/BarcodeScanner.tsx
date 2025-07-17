import React, { useState, useEffect } from 'react';
import { useZxing } from 'react-zxing';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X, Camera, Loader2, SwitchCamera } from 'lucide-react';

interface BarcodeScannerProps {
  onScanSuccess: (barcode: string) => void;
  onClose: () => void;
  isLoading?: boolean;
}

interface CameraDevice {
  deviceId: string;
  label: string;
}

export function BarcodeScanner({ onScanSuccess, onClose, isLoading }: BarcodeScannerProps) {
  const [error, setError] = useState<string>('');
  const [cameras, setCameras] = useState<CameraDevice[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [currentCameraIndex, setCurrentCameraIndex] = useState(0);

  // Get available cameras
  useEffect(() => {
    const getCameras = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices
          .filter(device => device.kind === 'videoinput')
          .map(device => ({
            deviceId: device.deviceId,
            label: device.label || `Câmera ${device.deviceId.slice(0, 5)}`
          }));
        
        setCameras(videoDevices);
        if (videoDevices.length > 0) {
          setSelectedCameraId(videoDevices[0].deviceId);
        }
      } catch (err) {
        console.error('Error getting cameras:', err);
        setError('Erro ao acessar câmeras');
      }
    };

    getCameras();
  }, []);

  const switchCamera = () => {
    if (cameras.length > 1) {
      const nextIndex = (currentCameraIndex + 1) % cameras.length;
      setCurrentCameraIndex(nextIndex);
      setSelectedCameraId(cameras[nextIndex].deviceId);
      setError(''); // Clear any previous errors
    }
  };

  const getVideoConstraints = () => {
    const baseConstraints = {
      width: { ideal: 1920, max: 1920 },
      height: { ideal: 1080, max: 1080 },
      aspectRatio: { ideal: 16/9 },
      frameRate: { ideal: 30, max: 30 }
    };

    if (selectedCameraId) {
      return {
        deviceId: { exact: selectedCameraId },
        ...baseConstraints
      };
    }

    return {
      facingMode: { exact: "environment" },
      ...baseConstraints
    };
  };

  const { ref } = useZxing({
    constraints: {
      video: getVideoConstraints()
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

            {cameras.length > 1 && (
              <Button 
                variant="secondary" 
                onClick={switchCamera}
                className="w-full flex items-center gap-2"
              >
                <SwitchCamera className="h-4 w-4" />
                Trocar Câmera ({currentCameraIndex + 1}/{cameras.length})
              </Button>
            )}

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