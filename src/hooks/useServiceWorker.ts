"use client";

import { useEffect, useState } from "react";

export function useServiceWorker() {
  const [isRegistered, setIsRegistered] = useState(false);
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          setIsRegistered(true);

          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener("statechange", () => {
                if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                  setIsUpdateAvailable(true);
                }
              });
            }
          });
        })
        .catch((error) => {
          console.warn("Service Worker registration failed:", error);
        });

      const handleControllerChange = () => {
        if (navigator.serviceWorker.controller) {
          window.location.reload();
        }
      };

      navigator.serviceWorker.addEventListener("controllerchange", handleControllerChange);

      return () => {
        navigator.serviceWorker.removeEventListener("controllerchange", handleControllerChange);
      };
    }
  }, []);

  const applyUpdate = () => {
    if (isUpdateAvailable) {
      navigator.serviceWorker.controller?.postMessage("skipWaiting");
    }
  };

  return { isRegistered, isUpdateAvailable, applyUpdate };
}
