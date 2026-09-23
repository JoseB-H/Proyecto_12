import { useEffect, useMemo, useState } from 'react';
import { api } from './services/api';
import './styles.css';

const products = [
  { sku: 'TEC-1048', name: 'Teclado mecánico K2', category: 'Periféricos', stock: 24, min: 10, price: 89.9, status: 'En stock', color: 'violet' },
  { sku: 'MON-2201', name: 'Monitor UltraWide 34"', category: 'Monitores', stock: 7, min: 8, price: 429, status: 'Reponer', color: 'amber' },
  { sku: 'AUD-0872', name: 'Auriculares Studio Pro', category: 'Audio', stock: 41, min: 12, price: 149.5, status: 'En stock', color: 'teal' },
  { sku: 'CAM-0319', name: 'Webcam 4K Vision', category: 'Accesorios', stock: 3, min: 6, price: 119, status: 'Crítico', color: 'rose' },
  { sku: 'LAP-5504', name: 'Laptop Air 15 M3', category: 'Equipos', stock: 16, min: 5, price: 1299, status: 'En stock', color: 'blue' },
  { sku: 'HUB-4410', name: 'Hub USB-C 8 en 1', category: 'Accesorios', stock: 12, min: 10, price: 54.9, status: 'En stock', color: 'orange' },
];

const movements = [
  { product: 'Laptop Air 15 M3', detail: 'Entrada de compra · #OC-2048', type: 'Entrada', quantity: '+12', time: 'Hoy, 09:42', icon: '↓' },
  { product: 'Webcam 4K Vision', detail: 'Salida · Pedido #PV-8812', type: 'Salida', quantity: '-4', time: 'Hoy, 08:15', icon: '↑' },
  { product: 'Monitor UltraWide 34"', detail: 'Ajuste de inventario', type: 'Ajuste', quantity: '-1', time: 'Ayer, 17:30', icon: '↔' },
];

function App() {
  const [activeView, setActiveView] = useState('Resumen');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('Todos');
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState('');
  const [dbStatus, setDbStatus] = useState('Comprobando');

  useEffect(() => {
    api.get('/health/db')
      .then(() => setDbStatus('Conectada'))
      .catch(() => setDbStatus('Sin conexión'));
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const timeout = setTimeout(() => setToast(''), 3200);
    return () => clearTimeout(timeout);
  }, [toast]);

  const filteredProducts = useMemo(() => products.filter((product) => {
    const matchesQuery = `${product.name} ${product.sku} ${product.category}`.toLowerCase().includes(query.toLowerCase());
    const matchesFilter = filter === 'Todos' || product.status === filter;
    return matchesQuery && matchesFilter;
  }), [filter, query]);

  const notify = (message) => {
    setToast(message);
    setShowModal(false);
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">N</div>
          <div><strong>NORDSTOCK</strong><span>Control de inventario</span></div>
        </div>

        <nav className="main-nav" aria-label="Navegación principal">
          <p className="nav-label">Workspace</p>
          {['Resumen', 'Productos', 'Movimientos', 'Proveedores'].map((item) => (
            <button className={`nav-item ${activeView === item ? 'active' : ''}`} key={item} onClick={() => setActiveView(item)}>
              <span className="nav-icon">{item === 'Resumen' ? '⌂' : item === 'Productos' ? '▦' : item === 'Movimientos' ? '↕' : '◌'}</span>{item}
            </button>
          ))}
          <p className="nav-label nav-label-spaced">Administración</p>
          <button className="nav-item" onClick={() => setToast('La configuración estará disponible pronto')}><span className="nav-icon">⚙</span>Configuración</button>
        </nav>

        <div className="sidebar-bottom">
          <div className="sync-card"><span className="status-dot" />{dbStatus === 'Conectada' ? 'Sistema sincronizado' : dbStatus}<small>Actualizado hace 2 min</small></div>
          <div className="user-card"><div className="avatar">LM</div><div><strong>Lucía Martínez</strong><span>Administradora</span></div><button aria-label="Abrir menú de usuario">•••</button></div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb"><span>Workspace</span><b>/</b><strong>{activeView}</strong></div>
          <div className="topbar-actions"><button className="icon-button" aria-label="Buscar">⌕</button><button className="icon-button notification" aria-label="Notificaciones">♢<i /></button><div className="top-avatar">LM</div></div>
        </header>

        <div className="page-content">
          <section className="welcome-row">
            <div><p className="eyebrow">MIÉRCOLES, 23 DE SEPTIEMBRE DE 2026</p><h1>Buenos días, Lucía <span>✦</span></h1><p className="subheading">Esto es lo que está pasando con tu inventario.</p></div>
            <button className="primary-button" onClick={() => setShowModal(true)}><span>＋</span> Registrar movimiento</button>
          </section>

          <section className="metrics-grid" aria-label="Indicadores principales">
            <Metric label="Valor del inventario" value="$184,260" change="+8.4%" detail="vs. mes anterior" accent="violet" />
            <Metric label="Productos activos" value="248" change="+12" detail="este mes" accent="teal" />
            <Metric label="Stock bajo" value="14" change="-3" detail="vs. semana anterior" accent="amber" />
            <Metric label="Movimientos hoy" value="36" change="+18.2%" detail="vs. ayer" accent="blue" />
          </section>

          <section className="content-grid">
            <div className="panel inventory-panel">
              <div className="panel-heading"><div><h2>Inventario</h2><p>Vista rápida de tus productos</p></div><button className="text-button" onClick={() => setActiveView('Productos')}>Ver todos <span>→</span></button></div>
              <div className="table-toolbar"><label className="search-box"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar producto o SKU..." /></label><select value={filter} onChange={(event) => setFilter(event.target.value)} aria-label="Filtrar productos"><option>Todos</option><option>En stock</option><option>Reponer</option><option>Crítico</option></select></div>
              <div className="table-wrap"><table><thead><tr><th>Producto</th><th>Categoría</th><th>Stock actual</th><th>Precio</th><th>Estado</th><th /></tr></thead><tbody>{filteredProducts.map((product) => <tr key={product.sku}><td><div className="product-cell"><div className={`product-icon ${product.color}`}>{product.name.charAt(0)}</div><div><strong>{product.name}</strong><span>{product.sku}</span></div></div></td><td>{product.category}</td><td><strong>{product.stock}</strong><span className="stock-min"> / mín. {product.min}</span></td><td>${product.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td><td><span className={`badge ${product.status.toLowerCase().replace(' ', '-')}`}>{product.status}</span></td><td><button className="row-menu" aria-label={`Opciones de ${product.name}`}>•••</button></td></tr>)}</tbody></table></div>
              {filteredProducts.length === 0 && <div className="empty-state">No encontramos productos con esos criterios.</div>}
            </div>

            <div className="side-column">
                <div className="panel alerts-panel"><div className="panel-heading"><div><h2>Alertas</h2><p>Requieren tu atención</p></div><span className="alert-count">4</span></div><div className="alert-list"><Alert title="Stock crítico" text="Webcam 4K Vision · quedan 3 uds." type="critical" /><Alert title="Stock bajo" text="Monitor UltraWide 34 pulgadas · quedan 7 uds." type="warning" /><Alert title="Revisión pendiente" text="2 productos sin categoría" type="neutral" /></div><button className="outline-button" onClick={() => setFilter('Crítico')}>Revisar alertas</button></div>
              <div className="panel activity-panel"><div className="panel-heading"><div><h2>Actividad reciente</h2><p>Últimos movimientos</p></div><button className="more-button" aria-label="Más actividad">•••</button></div><div className="activity-list">{movements.map((movement) => <div className="activity-item" key={movement.product}><div className={`movement-icon ${movement.type.toLowerCase()}`}>{movement.icon}</div><div className="activity-copy"><strong>{movement.product}</strong><span>{movement.detail}</span></div><div className="activity-meta"><b className={movement.type.toLowerCase()}>{movement.quantity}</b><span>{movement.time}</span></div></div>)}</div></div>
            </div>
          </section>
          <p className="demo-note"><span>●</span> Datos de demostración · La conexión con la base de datos está {dbStatus.toLowerCase()}.</p>
        </div>
      </main>

      {showModal && <div className="modal-backdrop" onClick={() => setShowModal(false)}><div className="modal" onClick={(event) => event.stopPropagation()}><button className="modal-close" onClick={() => setShowModal(false)} aria-label="Cerrar">×</button><p className="eyebrow">NUEVO REGISTRO</p><h2>Registrar movimiento</h2><p className="modal-copy">Selecciona el tipo de movimiento que quieres preparar.</p><div className="movement-options"><button onClick={() => notify('Formulario de entrada preparado')}><span className="movement-icon entrada">↓</span><b>Entrada</b><small>Recibir mercancía</small></button><button onClick={() => notify('Formulario de salida preparado')}><span className="movement-icon salida">↑</span><b>Salida</b><small>Despachar producto</small></button><button onClick={() => notify('Formulario de ajuste preparado')}><span className="movement-icon ajuste">↔</span><b>Ajuste</b><small>Corregir existencias</small></button></div></div></div>}
      {toast && <div className="toast"><span>✓</span>{toast}</div>}
    </div>
  );
}

function Metric({ label, value, change, detail, accent }) {
  return <div className={`metric-card ${accent}`}><div className="metric-top"><span>{label}</span><span className="metric-menu">•••</span></div><strong className="metric-value">{value}</strong><div className="metric-change"><b>{change}</b><span>{detail}</span></div><div className="mini-chart"><i /><i /><i /><i /><i /><i /><i /></div></div>;
}

function Alert({ title, text, type }) {
  return <div className="alert-item"><span className={`alert-indicator ${type}`} /><div><strong>{title}</strong><p>{text}</p></div><button aria-label={`Abrir alerta: ${title}`}>→</button></div>;
}

export default App;
