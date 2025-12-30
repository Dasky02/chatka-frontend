export async function logout() {
  try {
    const res = await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include", // nutné, aby se cookie odeslala
    });

    if (res.status !== 204) throw new Error("Nepodařilo se odhlásit");

    // případně smažeme lokálně uložený token, pokud nějaký máme
    // localStorage.removeItem("token"); // pokud používáš
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
}