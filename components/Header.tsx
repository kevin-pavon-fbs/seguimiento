'use client';

interface Props {
  closers: string[];
  filterCloser: string;
  onFilterChange: (c: string) => void;
  showFrozen: boolean;
  onToggleFrozen: () => void;
  onAddLead: () => void;
  onReporte: () => void;
  onSetup: () => void;
}

export default function Header({
  closers,
  filterCloser,
  onFilterChange,
  showFrozen,
  onToggleFrozen,
  onAddLead,
  onReporte,
  onSetup,
}: Props) {
  return (
    <header style={{
      background: '#1a1a2e',
      borderBottom: '1px solid #2a2a4a',
      padding: '10px 20px',
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      flexWrap: 'wrap',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 'auto' }}>
        <span style={{ fontSize: 20 }}>🎯</span>
        <span style={{ color: '#f0f0ff', fontWeight: 700, fontSize: 16 }}>Seguimiento Leads</span>
        <span style={{ color: '#8888aa', fontSize: 12 }}>12 toques</span>
      </div>

      <select
        value={filterCloser}
        onChange={e => onFilterChange(e.target.value)}
        style={{ background: '#252540', color: '#f0f0ff', border: '1px solid #2a2a4a', borderRadius: 6, padding: '6px 10px', fontSize: 13, cursor: 'pointer' }}
      >
        <option value="">Todos los closers</option>
        {closers.map(c => <option key={c} value={c}>{c}</option>)}
      </select>

      <button
        onClick={onToggleFrozen}
        style={{ background: showFrozen ? '#7c3aed' : '#252540', color: '#f0f0ff', border: '1px solid #2a2a4a', borderRadius: 6, padding: '6px 12px', fontSize: 13, cursor: 'pointer' }}
      >
        {showFrozen ? '👁 Ocultar cerrados' : '👁 Mostrar cerrados'}
      </button>

      <button
        onClick={onReporte}
        style={{ background: '#252540', color: '#f0f0ff', border: '1px solid #2a2a4a', borderRadius: 6, padding: '6px 12px', fontSize: 13, cursor: 'pointer' }}
      >
        📊 Reporte
      </button>

      <button
        onClick={onSetup}
        title="Inicializar pestañas en Google Sheets (solo una vez)"
        style={{ background: '#252540', color: '#8888aa', border: '1px solid #2a2a4a', borderRadius: 6, padding: '6px 10px', fontSize: 12, cursor: 'pointer' }}
      >
        ⚙️ Setup
      </button>

      <button
        onClick={onAddLead}
        style={{ background: '#00ff88', color: '#0f0f1a', borderRadius: 6, padding: '6px 14px', fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer' }}
      >
        + Nuevo Lead
      </button>
    </header>
  );
}
