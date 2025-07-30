import React, { useState, useEffect } from 'react';
import { useZxing } from 'react-zxing';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X, Camera, Loader2, SwitchCamera, Flashlight, FlashlightOff } from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface BarcodeScannerProps {
  onScanSuccess: (barcode: string) => void;
  onClose: () => void;
  isLoading?: boolean;
}

interface CameraDevice {
  deviceId: string;
  label: string;
}

// Extend MediaTrackCapabilities to include torch
interface ExtendedMediaTrackCapabilities extends MediaTrackCapabilities {
  torch?: boolean;
}

// Extend MediaTrackConstraints to include torch
interface TorchConstraint {
  torch?: boolean;
}

export function BarcodeScanner({ onScanSuccess, onClose, isLoading }: BarcodeScannerProps) {
  const [error, setError] = useState<string>('');
  const [cameras, setCameras] = useState<CameraDevice[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useLocalStorage<string>('barcode-scanner-camera-id', '');
  const [currentCameraIndex, setCurrentCameraIndex] = useLocalStorage<number>('barcode-scanner-camera-index', 0);
  const [flashEnabled, setFlashEnabled] = useLocalStorage<boolean>('barcode-scanner-flash-enabled', false);
  const [videoTrack, setVideoTrack] = useState<MediaStreamTrack | null>(null);

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
        
        // Restore saved camera or use first available
        if (videoDevices.length > 0) {
          const savedCameraId = selectedCameraId;
          const savedCameraIndex = Math.max(0, Math.min(currentCameraIndex, videoDevices.length - 1));
          
          // Check if saved camera still exists
          const savedCameraExists = savedCameraId && videoDevices.some(camera => camera.deviceId === savedCameraId);
          
          if (savedCameraExists) {
            // Use saved camera
            setSelectedCameraId(savedCameraId);
            const actualIndex = videoDevices.findIndex(camera => camera.deviceId === savedCameraId);
            setCurrentCameraIndex(actualIndex);
          } else {
            // Use first camera or saved index if valid
            const targetIndex = savedCameraIndex < videoDevices.length ? savedCameraIndex : 0;
            setSelectedCameraId(videoDevices[targetIndex].deviceId);
            setCurrentCameraIndex(targetIndex);
          }
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
      const nextCameraId = cameras[nextIndex].deviceId;
      
      // Save to localStorage and update state
      setCurrentCameraIndex(nextIndex);
      setSelectedCameraId(nextCameraId);
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

  // Toggle flash
  const toggleFlash = async () => {
    if (videoTrack) {
      try {
        const capabilities = videoTrack.getCapabilities() as any;
        if (capabilities.torch) {
          await videoTrack.applyConstraints({
            advanced: [{ torch: !flashEnabled } as any]
          });
          setFlashEnabled(!flashEnabled);
        } else {
          setError('Flash não disponível neste dispositivo');
        }
      } catch (err) {
        console.error('Error toggling flash:', err);
        setError('Erro ao controlar o flash');
      }
    }
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

  // Update video track when video element is ready
  useEffect(() => {
    if (ref.current && ref.current.srcObject) {
      const stream = ref.current.srcObject as MediaStream;
      const track = stream.getVideoTracks()[0];
      setVideoTrack(track);
      
      // Apply flash state if available
      if (track && flashEnabled) {
        try {
          const capabilities = track.getCapabilities() as any;
          if (capabilities.torch) {
            track.applyConstraints({
              advanced: [{ torch: true } as any]
            }).catch(err => console.error('Error applying flash constraint:', err));
          }
        } catch (err) {
          console.error('Error applying flash constraint:', err);
        }
      }
    }
  }, [ref.current?.srcObject, flashEnabled]);

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

            <div className="space-y-2">
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
                variant="secondary" 
                onClick={toggleFlash}
                className="w-full"
              >
                {flashEnabled ? (
                  <>
                    <FlashlightOff className="h-4 w-4 mr-2" />
                    Desligar Flash
                  </>
                ) : (
                  <>
                    <Flashlight className="h-4 w-4 mr-2" />
                    Ligar Flash
                  </>
                )}
              </Button>
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