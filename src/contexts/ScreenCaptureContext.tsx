import { createContext, useContext, ReactNode } from "react";
import { useScreenCapture } from "../hooks/useScreenCapture";

interface ScreenCaptureContextType {
  stream: MediaStream | null;
  isCapturing: boolean;
  startCapture: () => Promise<void>;
  stopCapture: () => void;
}

const ScreenCaptureContext = createContext<ScreenCaptureContextType | null>(null);

export function ScreenCaptureProvider({ children }: { children: ReactNode }) {
  const screenCapture = useScreenCapture();

  return (
    <ScreenCaptureContext.Provider value={screenCapture}>
      {children}
    </ScreenCaptureContext.Provider>
  );
}

export function useScreenCaptureContext() {
  const context = useContext(ScreenCaptureContext);
  if (!context) {
    throw new Error("useScreenCaptureContext must be used within ScreenCaptureProvider");
  }
  return context;
}
