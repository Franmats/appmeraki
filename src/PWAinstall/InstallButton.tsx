import { useEffect, useState } from "react";

let deferredPrompt: any;

export default function InstallButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      deferredPrompt = e;
      setVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;

    if (choice.outcome === "accepted") {
      console.log("Usuario aceptó instalación");
    }

    deferredPrompt = null;
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <button
      onClick={handleInstall}
      style={{
        position: "fixed",
        bottom: 20,
        left: 20,
        right: 20,
        padding: "14px",
        borderRadius: "16px",
        background: "#4f46e5",
        color: "white",
        fontWeight: "600",
        zIndex: 9999
      }}
    >
      Instalar App
    </button>
  );
}
