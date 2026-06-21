'use client';
import { Draggable } from '@hello-pangea/dnd';
import { Lead } from '@/lib/types';
import { estaCongelado } from '@/lib/utils';

const estadoColors: Record<string, string> = {
  'Activo': '#00ff88',
  'No responde': '#fbbf24',
  'Ganado': '#60a5fa',
  'No interesado': '#4a4a6a',
  'Perdido': '#4a4a6a',
};

interface Props {
  lead: Lead;
  index: number;
  onClick: (lead: Lead) => void;
}

export default function LeadCard({ lead, index, onClick }: Props) {
  const congelado = estaCongelado(lead.estado);
  const color = estadoColors[lead.estado] || '#8888aa';

  return (
    <Draggable draggableId={lead.id} index={index} isDragDisabled={congelado}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onClick(lead)}
          style={{
            ...provided.draggableProps.style,
            background: '#1a1a2e',
            borderRadius: 8,
            padding: '10px 12px',
            marginBottom: 8,
            borderLeft: `3px solid ${color}`,
            boxShadow: snapshot.isDragging
              ? '0 8px 20px rgba(0,0,0,0.5)'
              : '0 2px 8px rgba(0,0,0,0.3)',
            cursor: congelado ? 'default' : 'grab',
            opacity: congelado ? 0.4 : 1,
          }}
          onMouseEnter={e => {
            if (!congelado && !snapshot.isDragging) {
              (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
              (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 16px rgba(0,0,0,0.4)';
            }
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.transform = '';
            (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 5 }}>
            <span style={{ color: '#f0f0ff', fontSize: 14, fontWeight: 600, lineHeight: 1.3, flex: 1, transition: 'color 150ms' }}>
              {lead.nombre}
            </span>
            {lead.tieneToqueHoy && (
              <span
                title="Toque pendiente hoy"
                style={{
                  width: 8,
                  height: 8,
                  background: '#f97316',
                  borderRadius: '50%',
                  display: 'inline-block',
                  marginLeft: 6,
                  marginTop: 4,
                  animation: 'pulse 2s infinite',
                  flexShrink: 0,
                }}
              />
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ background: '#252540', color: '#8888aa', fontSize: 10, fontWeight: 500, padding: '2px 6px', borderRadius: 4 }}>
              {lead.fuente}
            </span>
            <span style={{ color: '#8888aa', fontSize: 11 }}>{lead.closer}</span>
          </div>

          <div style={{ marginTop: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#8888aa', fontSize: 11 }} title="Fecha de ingreso al circuito">
              📅 {lead.fechaIngreso}
            </span>
            <span style={{ color, fontSize: 10, fontWeight: 600 }}>{lead.estado}</span>
          </div>
          <div style={{ marginTop: 3 }}>
            <span style={{ color: '#4a4a6a', fontSize: 10 }}>{lead.diasEnSeguimiento}d en seguimiento</span>
          </div>

          {lead.notas && (
            <div style={{
              marginTop: 5,
              color: '#8888aa',
              fontSize: 11,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              borderTop: '1px solid #2a2a4a',
              paddingTop: 5,
            }}>
              {lead.notas}
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
}
