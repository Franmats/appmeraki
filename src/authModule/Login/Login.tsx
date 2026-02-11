import React, { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

/* =======================
   Tipos
======================= */

interface LoginForm {
  email: string;
  password: string;
}

interface LoginPayload {
  token: string;
}

interface LoginResponse {
  payload: LoginPayload;
  status?: string;
}

/* =======================
   Componente
======================= */

export const Login: React.FC = () => {
  const [form, setForm] = useState<LoginForm>({
    email: "",
    password: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL as string;

  /* =======================
     Handlers
  ======================= */

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (
    e: FormEvent<HTMLFormElement>
  ): Promise<void> => {
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
        body: JSON.stringify(form), // { email, password }
      });

      const result: LoginResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.status || "Credenciales incorrectas");
      }

      // Guardamos SOLO el token
      window.localStorage.setItem(
        "token",
        JSON.stringify(result.payload.token)
      );

      setMessage("Inicio de sesión exitoso");

      setTimeout(() => {
        navigate("/protected");
      }, 1000);
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

  /* =======================
     Render
  ======================= */

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <div className="login-header">
          <div className="login-logo-circle">CD</div>
          <div>
            <h2>Iniciar sesión</h2>
            <p className="login-subtitle">Accedé a tu app</p>
          </div>
        </div>

        {error && <p className="alert alert-error">{error}</p>}
        {message && <p className="alert alert-success">{message}</p>}

        <label className="login-label">
          Correo electrónico
          <input
            type="email"
            name="email"
            placeholder="ejemplo@correo.com"
            value={form.email}
            onChange={handleChange}
            required
          />
        </label>

        <label className="login-label">
          Contraseña
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
          />
        </label>

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Ingresando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
};
