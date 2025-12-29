"use client";

import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

type QRCodeCanvasProps = {
  text: string;
  options?: QRCode.QRCodeToCanvasOptions;
  className?: string;
};

export function QRCodeCanvas({ text, options, className }: QRCodeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, text, options, (error) => {
        if (error) console.error(error);
      });
    }
  }, [text, options]);

  return <canvas ref={canvasRef} className={className} />;
}
