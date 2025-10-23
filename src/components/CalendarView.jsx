import { useState, useEffect } from 'react';
import GuestView from '../components/GuestView.jsx';
import AdminView from '../components/AdminView.jsx';
import LoginModal from '../components/LoginModal.jsx';
import { getStoredAuth, saveAuth } from '../helpers.js';

export default function MainApp() {
  const [tab, setTab] = useState('guest');
  const [auth, setAuth] = useState(getStoredAuth());
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => { saveAuth(auth); }, [auth]);

  return (
    <div style={{ maxWidth: 920, margin: '30px auto', fontFamily: 'system-ui' }}>
      <h1>TinyHouse – rezervace</h1>
      <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <button onClick={() => setTab('guest')} disabled={tab === 'guest'} style={{ marginRight: 10, padding: '8px 16px' }}>Host</button>
          {auth && <button onClick={() => setTab('admin')} disabled={tab === 'admin'} style={{ padding: '8px 16px' }}>Admin</button>}
        </div>
        <div>
          {!auth ? (
            <button onClick={() => setShowLogin(true)} style={{ padding: '8px 14px' }}>Přihlásit</button>
          ) : (
            <div style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
              <span style={{ opacity: .8 }}>Přihlášen (admin)</span>
              <button onClick={() => { setAuth(''); setTab('guest'); }} style={{ padding: '8px 14px' }}>Odhlásit</button>
            </div>
          )}
        </div>
      </div>

      {showLogin && <LoginModal setAuth={setAuth} setShowLogin={setShowLogin} />}

      {tab === 'guest' && <GuestView />}
      {tab === 'admin' && <AdminView auth={auth} />}
    </div>
  );
}