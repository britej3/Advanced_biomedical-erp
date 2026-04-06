import React, { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, QrCode, X } from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";

interface ScannedData {
  equipmentId: number;
  serialNumber: string;
  name: string;
  timestamp: string;
}

export default function QRScanner() {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedData, setScannedData] = useState<ScannedData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isScanning) return;

    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      },
      false
    );

    scannerRef.current = scanner;

    const onScanSuccess = (decodedText: string) => {
      try {
        const data = JSON.parse(decodedText);
        setScannedData(data);
        setError(null);
        toast.success(`Equipment scanned: ${data.name}`);
        scanner.clear().catch(() => {});
        setIsScanning(false);
      } catch (err) {
        setError("Invalid QR code format. Please scan a valid equipment QR code.");
        toast.error("Invalid QR code format");
      }
    };

    const onScanError = () => {
      // Silently ignore scanning errors during active scanning
    };

    scanner.render(onScanSuccess, onScanError);

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
      }
    };
  }, [isScanning]);

  const handleStartScanning = () => {
    setIsScanning(true);
    setError(null);
  };

  const handleStopScanning = () => {
    setIsScanning(false);
    if (scannerRef.current) {
      scannerRef.current.clear().catch(() => {});
    }
  };

  const handleClearResult = () => {
    setScannedData(null);
  };

  const handleViewDetails = () => {
    if (scannedData) {
      // Navigate to equipment page with the scanned equipment ID
      setLocation(`/equipment`);
      toast.info(`Navigating to equipment details for ID: ${scannedData.equipmentId}`);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Equipment QR Scanner</h1>
        <p className="text-slate-600 mt-1">Scan equipment QR codes to quickly access information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scanner Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5" />
              QR Code Scanner
            </CardTitle>
            <CardDescription>Point your camera at an equipment QR code</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isScanning ? (
              <Button onClick={handleStartScanning} className="w-full" size="lg">
                Start Scanner
              </Button>
            ) : (
              <>
                <div id="qr-reader" className="w-full rounded-lg overflow-hidden border-2 border-blue-200" />
                <Button onClick={handleStopScanning} variant="destructive" className="w-full">
                  Stop Scanner
                </Button>
              </>
            )}

            {error && (
              <div className="flex gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-red-900">Scan Error</p>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results Section */}
        <Card>
          <CardHeader>
            <CardTitle>Scanned Equipment</CardTitle>
            <CardDescription>Information from the last scanned QR code</CardDescription>
          </CardHeader>
          <CardContent>
            {scannedData ? (
              <div className="space-y-4">
                <div className="space-y-3 p-4 bg-slate-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Equipment Name</p>
                    <p className="text-lg font-semibold text-slate-900">{scannedData.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">Equipment ID</p>
                    <p className="font-mono text-slate-900">{scannedData.equipmentId}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">Serial Number</p>
                    <p className="font-mono text-slate-900">{scannedData.serialNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">Scanned At</p>
                    <p className="text-sm text-slate-600">
                      {new Date(scannedData.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleClearResult}
                    variant="outline"
                    className="flex-1"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Clear
                  </Button>
                  <Button onClick={handleViewDetails} className="flex-1">
                    View Details
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <QrCode className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-slate-600">No equipment scanned yet</p>
                <p className="text-sm text-slate-500 mt-1">
                  Start the scanner and point your camera at a QR code
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How to Use</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3 list-decimal list-inside">
            <li className="text-slate-700">
              <span className="font-medium">Click "Start Scanner"</span> to activate your device camera
            </li>
            <li className="text-slate-700">
              <span className="font-medium">Point your camera</span> at an equipment QR code
            </li>
            <li className="text-slate-700">
              <span className="font-medium">Wait for the scan</span> to complete automatically
            </li>
            <li className="text-slate-700">
              <span className="font-medium">View the equipment details</span> in the results panel
            </li>
            <li className="text-slate-700">
              <span className="font-medium">Click "View Details"</span> to access full equipment information
            </li>
          </ol>
        </CardContent>
      </Card>

      {/* Browser Support Info */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">Browser Support</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-800">
          <p>QR scanning requires:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>HTTPS connection (or localhost)</li>
            <li>Camera permissions granted</li>
            <li>Modern browser (Chrome, Firefox, Safari, Edge)</li>
            <li>Mobile or desktop device with camera</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
