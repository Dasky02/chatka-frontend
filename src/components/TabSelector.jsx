export default function TabSelector({ tab, setTab, auth, setAuth, setShowLogin }) {
  return (
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
            <button onClick={() => setAuth('')} style={{ padding: '8px 14px' }}>Odhlásit</button>
          </div>
        )}
      </div>
    </div>
  );
}