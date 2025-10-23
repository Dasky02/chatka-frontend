export default function AdminLoginPanel({ showLogin, setShowLogin, loginUser, setLoginUser, loginPass, setLoginPass, setAuth, setMsg }) {
  if (!showLogin) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
      <div style={{ background: '#fff', color: '#000', padding: 20, borderRadius: 10, width: 320, boxShadow: '0 10px 30px rgba(0,0,0,.3)' }}>
        <h3 style={{ marginTop: 0 }}>Přihlášení</h3>
        <label>Uživatel</label>
        <input type="text" value={loginUser} onChange={e => setLoginUser(e.target.value)} style={{ display: 'block', padding: 8, margin: '6px 0 12px', width: '100%' }} />
        <label>Heslo</label>
        <input type="password" value={loginPass} onChange={e => setLoginPass(e.target.value)} style={{ display: 'block', padding: 8, margin: '6px 0 12px', width: '100%' }} />
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
          <button onClick={() => setShowLogin(false)} style={{ padding: '8px 12px' }}>Zpět</button>
          <button
            onClick={() => {
              const b = 'Basic ' + btoa(`${loginUser}:${loginPass}`);
              setAuth(b);
              setShowLogin(false);
              setLoginUser('');
              setLoginPass('');
              setMsg('');
            }}
            style={{ padding: '8px 12px' }}
          >Přihlásit</button>
        </div>
      </div>
    </div>
  );
}
