'use client';
import { Droppable } from '@hello-pangea/dnd';
import { Lead, Toque } from '@/lib/types';
import LeadCard from './LeadCard';

function columnHeaderColors(num: number): { bg: string; text: string; subtext: string } {
  if (num <= 3) return { bg: '#dcfce7', text: '#166534', subtext: '#15803d' };
  if (num <= 7) return { bg: '#dbeafe', text: '#1e40af', subtext: '#1d4ed8' };
  return { bg: '#ffedd5', text: '#9a3412', subtext: '#c2410c' };
}

interface Props {
  toque: Toque;
  leads: Lead[];
  onCardClick: (lead: Lead) => void;
}

export default function KanbanColumn({ toque, leads, onCardClick }: Props) {
  const colors = columnHeaderColors(toque.num);
  return (
    <div style={{
      minWidth: 220,
      maxWidth: 220,
      display: 'flex',
      flexDirection: 'column',
      background: '#f5f5f8',
      borderRadius: 10,
      border: '1px solid #e2e2ea',
      overflow: 'hidden',
      flexShrink: 0,
    }}>
      <div style={{ background: colors.bg, padding: '10px 12px' }}>
        <div style={{ color: colors.text, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>
          Toque {toque.num}
        </div>
        <div style={{ color: colors.subtext, fontSize: 11, marginTop: 2, lineHeight: 1.3 }}>
          {toque.nombre}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
          <span style={{ color: colors.subtext, fontSize: 10, opacity: 0.8 }}>Día {toque.dia}</span>
          <span style={{ background: 'rgba(0,0,0,0.1)', color: colors.text, fontSize: 10, padding: '1px 7px', borderRadius: 10, fontWeight: 600 }}>
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
              background: snapshot.isDraggingOver ? '#ebebf0' : 'transparent',
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
