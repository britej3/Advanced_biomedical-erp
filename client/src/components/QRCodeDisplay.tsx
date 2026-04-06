import React, { useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Printer, X } from "lucide-react";
import { toast } from "sonner";

interface QRCodeDisplayProps {
  equipmentId: number;
  equipmentName: string;
  serialNumber: string;
  onClose?: () => void;
}

export default function QRCodeDisplay({
  equipmentId,
  equipmentName,
  serialNumber,
  onClose,
}: QRCodeDisplayProps) {
  const qrRef = useRef<HTMLDivElement>(null);

  // Generate QR code data - includes equipment ID and serial number for tracking
  const qrData = JSON.stringify({
    equipmentId,
    serialNumber,
    name: equipmentName,
    timestamp: new Date().toISOString(),
  });

  const handleDownload = () => {
    try {
      const svg = qrRef.current?.querySelector("svg") as SVGSVGElement;
      if (!svg) {
        toast.error("QR code not found");
        return;
      }

      // Convert SVG to PNG and download
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const svgData = new XMLSerializer().serializeToString(svg);
      const img = new Image();
      const blob = new Blob([svgData], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);

        const link = document.createElement("a");
        link.href = canvas.toDataURL("image/png");
        link.download = `equipment-qr-${equipmentId}-${serialNumber}.png`;
        link.click();
        toast.success("QR code downloaded successfully");
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        toast.error("Failed to download QR code");
      };

      img.src = url;
    } catch (error) {
      toast.error("Failed to download QR code");
    }
  };

  const handlePrint = () => {
    try {
      const svg = qrRef.current?.querySelector("svg") as SVGSVGElement;
      if (!svg) {
        toast.error("QR code not found");
        return;
      }

      const printWindow = window.open("", "", "height=600,width=600");
      if (printWindow) {
        const svgString = new XMLSerializer().serializeToString(svg);
        printWindow.document.write("<html><head><title>Equipment QR Code</title>");
        printWindow.document.write("<style>body { font-family: Arial, sans-serif; text-align: center; padding: 20px; }</style>");
        printWindow.document.write("</head><body>");
        printWindow.document.write(`<h2>${equipmentName}</h2>`);
        printWindow.document.write(`<p><strong>Serial Number:</strong> ${serialNumber}</p>`);
        printWindow.document.write(`<p><strong>Equipment ID:</strong> ${equipmentId}</p>`);
        printWindow.document.write("<div style='margin: 20px 0;'>");
        printWindow.document.write(svgString);
        printWindow.document.write("</div>");
        printWindow.document.write("<p style='font-size: 12px; color: #666;'>Scan this QR code to access equipment information</p>");
        printWindow.document.write("</body></html>");
        printWindow.document.close();
        setTimeout(() => printWindow.print(), 250);
        toast.success("Print dialog opened");
      }
    } catch (error) {
      toast.error("Failed to open print dialog");
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle>Equipment QR Code</CardTitle>
          <CardDescription>{equipmentName}</CardDescription>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div ref={qrRef} className="flex justify-center p-4 bg-white rounded-lg border">
          <QRCodeSVG
            value={qrData}
            size={256}
            level="H"
            includeMargin={true}
          />
        </div>

        <div className="space-y-2 text-sm">
          <div>
            <span className="font-medium">Equipment ID:</span>
            <span className="ml-2 text-muted-foreground">{equipmentId}</span>
          </div>
          <div>
            <span className="font-medium">Serial Number:</span>
            <span className="ml-2 text-muted-foreground font-mono">{serialNumber}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleDownload}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
          <Button
            onClick={handlePrint}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Scan this QR code with a mobile device to quickly access equipment information
        </p>
      </CardContent>
    </Card>
  );
}
