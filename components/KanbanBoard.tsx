'use client';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { Lead } from '@/lib/types';
import { TOQUES, estaCongelado } from '@/lib/utils';
import KanbanColumn from './KanbanColumn';

interface Props {
  leads: Lead[];
  filterCloser: string;
  showFrozen: boolean;
  onLeadClick: (lead: Lead) => void;
  onLeadUpdate: (id: string, updates: Partial<Lead>) => void;
}

export default function KanbanBoard({ leads, filterCloser, showFrozen, onLeadClick, onLeadUpdate }: Props) {
  const filtered = leads.filter(l => {
    if (filterCloser && l.closer !== filterCloser) return false;
    if (!showFrozen && estaCongelado(l.estado)) return false;
    return true;
  });

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    const newToque = parseInt(result.destination.droppableId);
    if (isNaN(newToque)) return;

    const lead = leads.find(l => l.id === result.draggableId);
    if (!lead || estaCongelado(lead.estado)) return;
    if (lead.toqueActual === newToque) return;

    // Optimistic update
    onLeadUpdate(lead.id, { toqueActual: newToque });

    try {
      await fetch(`/api/leads/${lead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toqueActual: newToque }),
      });
    } catch {
      // Revert on error
      onLeadUpdate(lead.id, { toqueActual: lead.toqueActual });
    }
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div
        style={{
          display: 'flex',
          gap: 12,
          padding: '16px 20px',
          overflowX: 'auto',
          height: 'calc(100vh - 53px)',
          alignItems: 'flex-start',
          boxSizing: 'border-box',
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
