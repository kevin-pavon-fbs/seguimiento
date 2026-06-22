'use client';
import { useState, useCallback } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { Lead } from '@/lib/types';
import { TOQUES, estaCongelado, formatearFechaHoy } from '@/lib/utils';
import KanbanColumn from './KanbanColumn';

interface Props {
  leads: Lead[];
  filterCloser: string;
  showGanados: boolean;
  showPerdidos: boolean;
  onLeadClick: (lead: Lead) => void;
  onLeadUpdate: (id: string, updates: Partial<Lead>) => void;
}

interface Toast {
  id: number;
  msg: string;
  ok: boolean;
}

export default function KanbanBoard({ leads, filterCloser, showGanados, showPerdidos, onLeadClick, onLeadUpdate }: Props) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((msg: string, ok: boolean) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, msg, ok }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  }, []);

  const filtered = leads.filter(l => {
    if (filterCloser && l.closer !== filterCloser) return false;
    if (l.estado === 'Ganado' && !showGanados) return false;
    if ((l.estado === 'Perdido' || l.estado === 'No interesado') && !showPerdidos) return false;
    return true;
  });

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    const newToque = parseInt(result.destination.droppableId);
    if (isNaN(newToque)) return;

    const lead = leads.find(l => l.id === result.draggableId);
    if (!lead || estaCongelado(lead.estado)) return;
    if (lead.toqueActual === newToque) return;

    const fromInfo = TOQUES.find(t => t.num === lead.toqueActual);
    const toInfo = TOQUES.find(t => t.num === newToque);
    const hoy = formatearFechaHoy();

    // Optimistic update — dragging = confirming the toque (set fechaUltimoToque = today)
    onLeadUpdate(lead.id, { toqueActual: newToque, fechaUltimoToque: hoy });

    try {
      await fetch(`/api/leads/${lead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toqueActual: newToque }),
      });
      addToast(`${lead.nombre} → Toque #${newToque} (${toInfo?.nombre ?? ''})`, true);
    } catch {
      onLeadUpdate(lead.id, { toqueActual: lead.toqueActual, fechaUltimoToque: lead.fechaUltimoToque });
      addToast(`Error al mover ${lead.nombre}`, false);
    }

    void fromInfo; // suppress unused warning
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      {/* Toast stack */}
      <div style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 500, display: 'flex', flexDirection: 'column', gap: 8, pointerEvents: 'none' }}>
        {toasts.map(t => (
          <div
            key={t.id}
            style={{
              background: t.ok ? '#dcfce7' : '#fee2e2',
              border: `1px solid ${t.ok ? '#16a34a' : '#dc2626'}`,
              color: t.ok ? '#166534' : '#991b1b',
              padding: '10px 16px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 500,
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              animation: 'slideIn 200ms ease',
              maxWidth: 320,
            }}
          >
            {t.ok ? '✅' : '❌'} {t.msg}
          </div>
        ))}
      </div>

      <div
        style={{
          display: 'flex',
          gap: 12,
          padding: '16px 20px',
          overflowX: 'auto',
          height: 'calc(100vh - 53px)',
          alignItems: 'flex-start',
          boxSizing: 'border-box',
          background: '#f5f5f8',
        }}
        onWheel={e => { (e.currentTarget as HTMLElement).scrollLeft += e.deltaY; }}
      >
        {TOQUES.map(toque => (
          <KanbanColumn
            key={toque.num}
            toque={toque}
            leads={filtered.filter(l => l.toqueActual === toque.num)}
            onCardClick={onLeadClick}
          />
        ))}
      </div>
    </DragDropContext>
  );
}
