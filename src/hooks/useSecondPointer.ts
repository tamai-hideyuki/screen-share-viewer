import { useState, useCallback } from "react";

type DeviceType = "primary" | "secondary";

export function useSecondPointer() {
  const [connectedDevices, setConnectedDevices] = useState<DeviceType[]>([]);

  const connectPrimary = useCallback(() => {
    if (!connectedDevices.includes("primary")) {
      setConnectedDevices((prev) => [...prev, "primary"]);
      console.log("Primary pointer connected");
    }
  }, [connectedDevices]);

  const connectSecondary = useCallback(() => {
    if (!connectedDevices.includes("secondary")) {
      setConnectedDevices((prev) => [...prev, "secondary"]);
      console.log("Secondary pointer connected");
    }
  }, [connectedDevices]);

  const disconnectPrimary = useCallback(() => {
    setConnectedDevices((prev) => prev.filter((device) => device !== "primary"));
    console.log("Primary pointer disconnected");
  }, []);

  const disconnectSecondary = useCallback(() => {
    setConnectedDevices((prev) => prev.filter((device) => device !== "secondary"));
    console.log("Secondary pointer disconnected");
  }, []);

  return {
    connectedDevices,
    connectPrimary,
    connectSecondary,
    disconnectPrimary,
    disconnectSecondary,
  };
}
