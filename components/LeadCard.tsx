'use client';
import { Draggable } from '@hello-pangea/dnd';
import { Lead } from '@/lib/types';
import { estaCongelado, getToqueStatus } from '@/lib/utils';

const estadoColors: Record<string, string> = {
  'Activo': '#16a34a',
  'No responde': '#d97706',
  'Ganado': '#2563eb',
  'No interesado': '#9ca3af',
  'Perdido': '#9ca3af',
};

const toqueStatusBorder: Record<string, string> = {
  'ok': '#22c55e',
  'hoy': '#f59e0b',
  'vencido': '#ef4444',
  'futuro': '#e2e2ea',
};

interface Props {
  lead: Lead;
  index: number;
  onClick: (lead: Lead) => void;
}

export default function LeadCard({ lead, index, onClick }: Props) {
  const congelado = estaCongelado(lead.estado);
  const statusColor = estadoColors[lead.estado] || '#9ca3af';
  const toqueStatus = getToqueStatus(lead);
  const borderColor = congelado ? '#e2e2ea' : toqueStatusBorder[toqueStatus];

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
            background: '#ffffff',
            borderRadius: 8,
            padding: '10px 12px',
            marginBottom: 8,
            border: `1px solid #e2e2ea`,
            borderLeftColor: borderColor,
            borderLeftWidth: 3,
            boxShadow: snapshot.isDragging
              ? '0 8px 20px rgba(0,0,0,0.15)'
              : '0 1px 4px rgba(0,0,0,0.06)',
            cursor: congelado ? 'default' : 'grab',
            opacity: congelado ? 0.5 : 1,
          }}
          onMouseEnter={e => {
            if (!congelado && !snapshot.isDragging) {
              (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
              (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
            }
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.transform = '';
            (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 5 }}>
            <span style={{ color: '#1a1a2e', fontSize: 14, fontWeight: 600, lineHeight: 1.3, flex: 1 }}>
              {lead.nombre}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ background: '#f0f0f5', color: '#6b7280', fontSize: 10, fontWeight: 500, padding: '2px 6px', borderRadius: 4 }}>
              {lead.fuente}
            </span>
            <span style={{ color: '#6b7280', fontSize: 11 }}>{lead.closer}</span>
          </div>

          <div style={{ marginTop: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#6b7280', fontSize: 11 }} title="Fecha de ingreso al circuito">
              📅 {lead.fechaIngreso}
            </span>
            <span style={{ color: statusColor, fontSize: 10, fontWeight: 600 }}>{lead.estado}</span>
          </div>
          <div style={{ marginTop: 3 }}>
            <span style={{ color: '#9ca3af', fontSize: 10 }}>{lead.diasEnSeguimiento}d en seguimiento</span>
          </div>

          {lead.notas && (
            <div style={{
              marginTop: 5,
              color: '#6b7280',
              fontSize: 11,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              borderTop: '1px solid #e2e2ea',
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
