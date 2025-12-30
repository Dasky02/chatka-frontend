import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';


export default function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

 const handleSubmit = async (e) => {
  e.preventDefault();

  if (!username || !password) {
    alert("Vyplň prosím e-mail i heslo");
    return;
  }

  try {
    const response = await fetch("/api/auth/login", { // 🔁 sem změň adresu
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        password,
      }),
    });

    if (!response.ok) {
      throw new Error("Chybné přihlašovací údaje nebo chyba serveru");
    }

    const data = await response.json();

    // ✅ tady můžeš uložit token nebo přesměrovat uživatele
    console.log("Úspěšné přihlášení:", data);
    alert("Přihlášení proběhlo úspěšně!");

    // např.:
     document.cookie = `token=${data.token}; path=/; max-age=${7 * 24 * 60 * 60}; secure; samesite=strict`;
     navigate("/admin");

  } catch (error) {
    console.error("Chyba při přihlašování:", error);
    alert("Nepodařilo se přihlásit");
  }
};

  return (
    <div className="login-page">
      <div className="login-box">
        <h2>Admin Login</h2>
        <form onSubmit={handleSubmit}>
          <label>Email</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="zadejte email"
            required
          />

          <label>Heslo</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="zadejte heslo"
            required
          />

          <button type="submit">Přihlásit se</button>
        </form>
      </div>
    </div>
  );
}