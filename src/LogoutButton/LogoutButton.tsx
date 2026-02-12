import React from "react";
import { useNavigate } from "react-router-dom";

interface LogoutButtonProps {
  className?: string;
}

export const LogoutButton: React.FC<LogoutButtonProps> = ({ className }) => {
  const navigate = useNavigate();

  const handleLogout = (): void => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("token");
    }

    // Redirige al login y evita volver atrás
    navigate("/login", { replace: true });
  };

  return (
    <button onClick={handleLogout} className={className}>
      Cerrar sesión
    </button>
  );
};
