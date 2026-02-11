import React, { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";

/* =======================
   Props
======================= */

interface AuthGuardProps {
  children: ReactNode;
}

/* =======================
   Componente
======================= */

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL as string;

  /* =======================
     Token utils
  ======================= */

  const getToken = (): string | null => {
    try {
      const storedToken = window.localStorage.getItem("token");
      return storedToken ? JSON.parse(storedToken) : null;
    } catch {
      return null;
    }
  };

  /* =======================
     Effect
  ======================= */

  useEffect(() => {
    const checkAuth = async (): Promise<void> => {
      const token = getToken();

      if (!token) {
        setIsAuthenticated(false);
        navigate("/login", { replace: true });
        return;
      }

      try {
        const response = await fetch(`${apiUrl}/users/auth`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          window.localStorage.removeItem("token");
          setIsAuthenticated(false);
          navigate("/login", { replace: true });
        }
      } catch (error) {
        console.error("Error en autenticación:", error);
        window.localStorage.removeItem("token");
        setIsAuthenticated(false);
        navigate("/login", { replace: true });
      }
    };

    checkAuth();
  }, [apiUrl, navigate]);

  /* =======================
     Render
  ======================= */

  if (isAuthenticated === null) {
    return <div>Cargando...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};

export default AuthGuard;
