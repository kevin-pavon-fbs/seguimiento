'use client';
import { Droppable } from '@hello-pangea/dnd';
import { Lead, Toque } from '@/lib/types';
import LeadCard from './LeadCard';

function columnHeaderColor(num: number): string {
  if (num <= 3) return '#14532d';
  if (num <= 7) return '#1e3a5f';
  return '#7c2d12';
}

interface Props {
  toque: Toque;
  leads: Lead[];
  onCardClick: (lead: Lead) => void;
}

export default function KanbanColumn({ toque, leads, onCardClick }: Props) {
  return (
    <div style={{
      minWidth: 220,
      maxWidth: 220,
      display: 'flex',
      flexDirection: 'column',
      background: '#0f0f1a',
      borderRadius: 10,
      border: '1px solid #2a2a4a',
      overflow: 'hidden',
      flexShrink: 0,
    }}>
      <div style={{ background: columnHeaderColor(toque.num), padding: '10px 12px' }}>
        <div style={{ color: '#f0f0ff', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>
          Toque {toque.num}
        </div>
        <div style={{ color: 'rgba(240,240,255,0.75)', fontSize: 11, marginTop: 2, lineHeight: 1.3 }}>
          {toque.nombre}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
          <span style={{ color: 'rgba(240,240,255,0.55)', fontSize: 10 }}>Día {toque.dia}</span>
          <span style={{ background: 'rgba(0,0,0,0.35)', color: '#f0f0ff', fontSize: 10, padding: '1px 7px', borderRadius: 10, fontWeight: 600 }}>
            {leads.length}
          </span>
        </div>
      </div>

      <Droppable droppableId={String(toque.num)}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            style={{
              flex: 1,
              padding: 8,
              minHeight: 80,
              background: snapshot.isDraggingOver ? '#1a1a2e' : 'transparent',
              transition: 'background 150ms ease',
              overflowY: 'auto',
              maxHeight: 'calc(100vh - 160px)',
            }}
          >
            {leads.map((lead, i) => (
              <LeadCard key={lead.id} lead={lead} index={i} onClick={onCardClick} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
