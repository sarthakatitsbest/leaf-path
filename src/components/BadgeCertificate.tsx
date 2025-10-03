import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import QRCode from "qrcode";
import { useEffect, useState } from "react";

interface Badge {
  id: string;
  title: string;
  issued_at: string;
  verification_code: string;
  points: number;
  challenge_title?: string;
}

interface BadgeCertificateProps {
  badge: Badge;
  userName: string;
}

export default function BadgeCertificate({ badge, userName }: BadgeCertificateProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  useEffect(() => {
    const verifyUrl = `${window.location.origin}/verify/${badge.verification_code}`;
    QRCode.toDataURL(verifyUrl, { margin: 1, width: 200 })
      .then(setQrDataUrl)
      .catch(console.error);
  }, [badge.verification_code]);

  const downloadCertificate = () => {
    const svg = document.getElementById(`certificate-${badge.id}`);
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `certificate-${badge.title.replace(/\s+/g, "-")}.svg`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="p-6">
      <svg
        id={`certificate-${badge.id}`}
        width="800"
        height="600"
        viewBox="0 0 800 600"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto"
      >
        <defs>
          <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: "#10b981", stopOpacity: 0.1 }} />
            <stop offset="100%" style={{ stopColor: "#3b82f6", stopOpacity: 0.1 }} />
          </linearGradient>
        </defs>

        <rect width="800" height="600" fill="url(#bgGradient)" />
        <rect x="20" y="20" width="760" height="560" fill="none" stroke="#10b981" strokeWidth="3" />
        <rect x="30" y="30" width="740" height="540" fill="none" stroke="#10b981" strokeWidth="1" />

        <text x="400" y="100" textAnchor="middle" fontSize="48" fontWeight="bold" fill="#1e293b">
          Certificate of Achievement
        </text>
        
        <text x="400" y="140" textAnchor="middle" fontSize="20" fontWeight="600" fill="#10b981">
          Awarded by Eco Pulse AI
        </text>

        <text x="400" y="200" textAnchor="middle" fontSize="18" fill="#475569">
          This certifies that
        </text>

        <text x="400" y="250" textAnchor="middle" fontSize="36" fontWeight="bold" fill="#0f172a">
          {userName}
        </text>

        <text x="400" y="300" textAnchor="middle" fontSize="18" fill="#475569">
          has successfully completed
        </text>

        <text x="400" y="350" textAnchor="middle" fontSize="28" fontWeight="600" fill="#10b981">
          {badge.challenge_title || badge.title}
        </text>

        <text x="400" y="400" textAnchor="middle" fontSize="16" fill="#64748b">
          Issued: {new Date(badge.issued_at).toLocaleDateString()}
        </text>

        <text x="400" y="430" textAnchor="middle" fontSize="16" fill="#64748b">
          Points Earned: {badge.points}
        </text>

        {qrDataUrl && (
          <image href={qrDataUrl} x="325" y="460" width="150" height="150" />
        )}

        <text x="400" y="540" textAnchor="middle" fontSize="12" fill="#94a3b8">
          Verification Code: {badge.verification_code}
        </text>
      </svg>

      <div className="mt-4 flex justify-center">
        <Button onClick={downloadCertificate} className="gap-2">
          <Download className="w-4 h-4" />
          Download Certificate
        </Button>
      </div>
    </Card>
  );
}
