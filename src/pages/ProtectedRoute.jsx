import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const [authorized, setAuthorized] = useState(null);
  const [error, setError] = useState(null);

  function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
}

  useEffect(() => {
    const token = getCookie("token");
    if (!token) {
      setAuthorized(false); // redirect
      return;
    }

    const checkAuth = async () => {
      try {
        const res = await fetch("/api/check-auth", {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          method: "GET",
          credentials: "include",
        });

        if (res.status === 401) {
          setAuthorized(false);
          return;
        }

        if (!res.ok) throw new Error("Server error");

        setAuthorized(true);
      } catch (err) {
        console.error("Chyba při ověřování přihlášení:", err);
        setError(err);
        setAuthorized(false);
      }
    };

    checkAuth();
  }, []);

  if (authorized === null) return <div>Načítám...</div>;
  if (authorized === false) return <Navigate to="/login" replace />;

  return children;
}