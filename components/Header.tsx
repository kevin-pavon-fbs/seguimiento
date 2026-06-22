'use client';
import { Closer } from '@/lib/types';

interface Props {
  closers: Closer[];
  filterCloser: string;
  onFilterChange: (c: string) => void;
  showGanados: boolean;
  onToggleGanados: () => void;
  showPerdidos: boolean;
  onTogglePerdidos: () => void;
  onAddLead: () => void;
  onReporte: () => void;
  onSetup: () => void;
}

export default function Header({
  closers,
  filterCloser,
  onFilterChange,
  showGanados,
  onToggleGanados,
  showPerdidos,
  onTogglePerdidos,
  onAddLead,
  onReporte,
  onSetup,
}: Props) {
  return (
    <header style={{
      background: '#ffffff',
      borderBottom: '1px solid #e2e2ea',
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
        <span style={{ color: '#1a1a2e', fontWeight: 700, fontSize: 16 }}>Seguimiento Leads</span>
        <span style={{ color: '#6b7280', fontSize: 12 }}>12 toques</span>
      </div>

      <select
        value={filterCloser}
        onChange={e => onFilterChange(e.target.value)}
        style={{ background: '#f9f9fb', color: '#1a1a2e', border: '1px solid #e2e2ea', borderRadius: 6, padding: '6px 10px', fontSize: 13, cursor: 'pointer' }}
      >
        <option value="">Todos los closers</option>
        {closers.map(c => <option key={c.nombre} value={c.nombre}>{c.nombre}</option>)}
      </select>

      <button
        onClick={onToggleGanados}
        style={{ background: showGanados ? '#dbeafe' : '#f9f9fb', color: showGanados ? '#1e40af' : '#6b7280', border: '1px solid #e2e2ea', borderRadius: 6, padding: '6px 12px', fontSize: 13, cursor: 'pointer' }}
      >
        {showGanados ? '👁 Ocultar ganados' : '👁 Ganados'}
      </button>

      <button
        onClick={onTogglePerdidos}
        style={{ background: showPerdidos ? '#fee2e2' : '#f9f9fb', color: showPerdidos ? '#991b1b' : '#6b7280', border: '1px solid #e2e2ea', borderRadius: 6, padding: '6px 12px', fontSize: 13, cursor: 'pointer' }}
      >
        {showPerdidos ? '👁 Ocultar perdidos' : '👁 Perdidos'}
      </button>

      <button
        onClick={onReporte}
        style={{ background: '#f9f9fb', color: '#1a1a2e', border: '1px solid #e2e2ea', borderRadius: 6, padding: '6px 12px', fontSize: 13, cursor: 'pointer' }}
      >
        📊 Reporte
      </button>

      <button
        onClick={onSetup}
        title="Inicializar pestañas en Google Sheets (solo una vez)"
        style={{ background: '#f9f9fb', color: '#6b7280', border: '1px solid #e2e2ea', borderRadius: 6, padding: '6px 10px', fontSize: 12, cursor: 'pointer' }}
      >
        ⚙️ Setup
      </button>

      <button
        onClick={onAddLead}
        style={{ background: '#6d28d9', color: '#ffffff', borderRadius: 6, padding: '6px 14px', fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer' }}
      >
        + Nuevo Lead
      </button>
    </header>
  );
}
