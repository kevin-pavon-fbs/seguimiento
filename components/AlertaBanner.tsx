'use client';
import { useState, useMemo } from 'react';
import { Lead } from '@/lib/types';
import { diasVencido, TOQUES, getToqueStatus } from '@/lib/utils';

interface Props {
  leads: Lead[];
  onLeadClick: (lead: Lead) => void;
}

export default function AlertaBanner({ leads, onLeadClick }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [tab, setTab] = useState<'hoy' | 'vencidos'>('hoy');

  const pendientesHoy = useMemo(
    () => leads.filter(l => l.estado === 'Activo' && getToqueStatus(l) === 'hoy'),
    [leads]
  );

  const vencidos = useMemo(
    () =>
      leads
        .filter(l => l.estado === 'Activo' && getToqueStatus(l) === 'vencido')
        .sort((a, b) => diasVencido(b.fechaProximoToque) - diasVencido(a.fechaProximoToque)),
    [leads]
  );

  const total = pendientesHoy.length + vencidos.length;
  if (total === 0) return null;

  const activeList = tab === 'hoy' ? pendientesHoy : vencidos;

  return (
    <div style={{ background: '#ffffff', borderBottom: '1px solid #e2e2ea' }}>
      {/* Barra resumen — siempre visible */}
      <div
        onClick={() => setExpanded(p => !p)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '8px 20px',
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        <span style={{ fontSize: 14 }}>🔔</span>

        <div style={{ display: 'flex', gap: 10, flex: 1, flexWrap: 'wrap' }}>
          {pendientesHoy.length > 0 && (
            <span style={{
              background: 'rgba(245,158,11,0.12)',
              color: '#d97706',
              fontSize: 12,
              fontWeight: 600,
              padding: '2px 10px',
              borderRadius: 20,
              border: '1px solid rgba(245,158,11,0.3)',
            }}>
              {pendientesHoy.length} toque{pendientesHoy.length !== 1 ? 's' : ''} hoy
            </span>
          )}
          {vencidos.length > 0 && (
            <span style={{
              background: 'rgba(239,68,68,0.1)',
              color: '#ef4444',
              fontSize: 12,
              fontWeight: 600,
              padding: '2px 10px',
              borderRadius: 20,
              border: '1px solid rgba(239,68,68,0.3)',
            }}>
              {vencidos.length} vencido{vencidos.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        <span style={{ color: '#6b7280', fontSize: 12, flexShrink: 0 }}>
          {expanded ? '▲ Ocultar' : '▼ Ver leads'}
        </span>
      </div>

      {/* Panel expandido */}
      {expanded && (
        <div style={{ borderTop: '1px solid #e2e2ea' }}>
          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid #e2e2ea', padding: '0 20px' }}>
            {pendientesHoy.length > 0 && (
              <button
                onClick={() => setTab('hoy')}
                style={{
                  background: 'none',
                  border: 'none',
                  borderBottom: tab === 'hoy' ? '2px solid #f59e0b' : '2px solid transparent',
                  color: tab === 'hoy' ? '#d97706' : '#6b7280',
                  padding: '8px 14px',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 600,
                  marginBottom: -1,
                }}
              >
                🟡 Toques hoy ({pendientesHoy.length})
              </button>
            )}
            {vencidos.length > 0 && (
              <button
                onClick={() => setTab('vencidos')}
                style={{
                  background: 'none',
                  border: 'none',
                  borderBottom: tab === 'vencidos' ? '2px solid #ef4444' : '2px solid transparent',
                  color: tab === 'vencidos' ? '#ef4444' : '#6b7280',
                  padding: '8px 14px',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 600,
                  marginBottom: -1,
                }}
              >
                🔴 Vencidos ({vencidos.length})
              </button>
            )}
          </div>

          {/* Lista */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
            padding: '12px 20px',
            maxHeight: 180,
            overflowY: 'auto',
          }}>
            {activeList.map(lead => {
              const toqueInfo = TOQUES.find(t => t.num === lead.toqueActual);
              const dias = tab === 'vencidos' ? diasVencido(lead.fechaProximoToque) : null;

              return (
                <div
                  key={lead.id}
                  onClick={() => { onLeadClick(lead); setExpanded(false); }}
                  style={{
                    background: '#f5f5f8',
                    border: `1px solid ${tab === 'hoy' ? 'rgba(245,158,11,0.3)' : 'rgba(239,68,68,0.3)'}`,
                    borderRadius: 8,
                    padding: '8px 12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    minWidth: 220,
                    transition: 'background 150ms',
                  }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#ebebf0'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = '#f5f5f8'}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: '#1a1a2e', fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {lead.nombre}
                    </div>
                    <div style={{ color: '#6b7280', fontSize: 11, marginTop: 2 }}>
                      Toque #{lead.toqueActual} · {toqueInfo?.nombre}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    {dias !== null ? (
                      <span style={{ color: '#ef4444', fontSize: 11, fontWeight: 600 }}>
                        {dias}d atrasado
                      </span>
                    ) : (
                      <span style={{ color: '#d97706', fontSize: 11, fontWeight: 600 }}>
                        hoy
                      </span>
                    )}
                    <div style={{ color: '#6b7280', fontSize: 10 }}>{lead.closer}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
