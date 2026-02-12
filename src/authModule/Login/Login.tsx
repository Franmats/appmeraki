import React, { useState, useEffect, } from "react";
import type {ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

interface LoginForm {
  name: string;
  password: string;
}

interface LoginResponse {
  payload: {
    token: string;
  };
  message?: string;
}

export const Login: React.FC = () => {
  const [form, setForm] = useState<LoginForm>({
    name: "",
    password: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL as string;

  const localStorageSetItem = (token: any): void => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("token", JSON.stringify(token));
    }
  };

  const tokenExtractor = (): string | null => {
    try {
      if (typeof window !== "undefined") {
        return window.localStorage.getItem("token");
      }
      return null;
    } catch {
      return null;
    }
  };

  // ✅ Redirección automática si ya existe token
  useEffect(() => {
    const token = tokenExtractor();
    if (token) {
      navigate("/");
    }
  }, [navigate]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value.toLocaleUpperCase() }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setIsSubmitting(true);

    try {
      const response = await fetch(`${apiUrl}/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form), // { name, password }
      });

      const result: LoginResponse = await response.json();
      if (!response.ok) {
        window.localStorage.removeItem("token");
        throw new Error(result.message || "Credenciales incorrectas");
      }

      // Guardamos solo el token
      localStorageSetItem(result.payload);

      setMessage("Inicio de sesión exitoso");

      setTimeout(() => {
        navigate("/");
      }, 1200);

    } catch (err) {
      window.localStorage.removeItem("token");
      setError(
        err instanceof Error
          ? err.message
          : "Error del servidor. Intente más tarde."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <div className="login-header">
          <div className="login-logo-circle">CD</div>
          <div>
            <h2>Iniciar sesión</h2>
            <p className="login-subtitle">Accedé a tu Lector de Codigos</p>
          </div>
        </div>

        {error && <p className="alert alert-error">{error}</p>}
        {message && <p className="alert alert-success">{message}</p>}

        <label className="login-label">
          Nombre de usuario
          <input
            type="text"
            name="name"
            placeholder="Tu usuario"
            value={form.name}
            onChange={handleChange}
            required
          />
        </label>

        <label className="login-label">
          Contraseña
          <input
            type="password"
            name="password"
            placeholder="Tu contraseña"
            value={form.password}
            onChange={handleChange}
            required
          />
        </label>

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Ingresando..." : "Entrar"}
        </button>

        <p className="info-text">
          Verificá que el usuario y la contraseña sean correctos.
        </p>
      </form>
    </div>
  );
};
