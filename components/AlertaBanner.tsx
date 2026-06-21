'use client';
import { useState, useMemo } from 'react';
import { Lead } from '@/lib/types';
import { estaVencido, diasVencido, TOQUES } from '@/lib/utils';

interface Props {
  leads: Lead[];
  onLeadClick: (lead: Lead) => void;
}

export default function AlertaBanner({ leads, onLeadClick }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [tab, setTab] = useState<'hoy' | 'vencidos'>('hoy');

  const pendientesHoy = useMemo(
    () => leads.filter(l => l.tieneToqueHoy && l.estado === 'Activo'),
    [leads]
  );

  const vencidos = useMemo(
    () =>
      leads
        .filter(l => estaVencido(l.fechaProximoToque, l.estado))
        .sort((a, b) => diasVencido(b.fechaProximoToque) - diasVencido(a.fechaProximoToque)),
    [leads]
  );

  const total = pendientesHoy.length + vencidos.length;
  if (total === 0) return null;

  const activeList = tab === 'hoy' ? pendientesHoy : vencidos;

  return (
    <div style={{ background: '#1a1a2e', borderBottom: '1px solid #2a2a4a' }}>
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
              background: 'rgba(249,115,22,0.15)',
              color: '#f97316',
              fontSize: 12,
              fontWeight: 600,
              padding: '2px 10px',
              borderRadius: 20,
              border: '1px solid rgba(249,115,22,0.3)',
            }}>
              {pendientesHoy.length} toque{pendientesHoy.length !== 1 ? 's' : ''} hoy
            </span>
          )}
          {vencidos.length > 0 && (
            <span style={{
              background: 'rgba(248,113,113,0.15)',
              color: '#f87171',
              fontSize: 12,
              fontWeight: 600,
              padding: '2px 10px',
              borderRadius: 20,
              border: '1px solid rgba(248,113,113,0.3)',
            }}>
              {vencidos.length} vencido{vencidos.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        <span style={{ color: '#8888aa', fontSize: 12, flexShrink: 0 }}>
          {expanded ? '▲ Ocultar' : '▼ Ver leads'}
        </span>
      </div>

      {/* Panel expandido */}
      {expanded && (
        <div style={{ borderTop: '1px solid #2a2a4a' }}>
          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid #2a2a4a', padding: '0 20px' }}>
            {pendientesHoy.length > 0 && (
              <button
                onClick={() => setTab('hoy')}
                style={{
                  background: 'none',
                  border: 'none',
                  borderBottom: tab === 'hoy' ? '2px solid #f97316' : '2px solid transparent',
                  color: tab === 'hoy' ? '#f97316' : '#8888aa',
                  padding: '8px 14px',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 600,
                  marginBottom: -1,
                }}
              >
                🟠 Toques hoy ({pendientesHoy.length})
              </button>
            )}
            {vencidos.length > 0 && (
              <button
                onClick={() => setTab('vencidos')}
                style={{
                  background: 'none',
                  border: 'none',
                  borderBottom: tab === 'vencidos' ? '2px solid #f87171' : '2px solid transparent',
                  color: tab === 'vencidos' ? '#f87171' : '#8888aa',
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
                    background: '#252540',
                    border: `1px solid ${tab === 'hoy' ? 'rgba(249,115,22,0.3)' : 'rgba(248,113,113,0.3)'}`,
                    borderRadius: 8,
                    padding: '8px 12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    minWidth: 220,
                    transition: 'background 150ms',
                  }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#2e2e54'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = '#252540'}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: '#f0f0ff', fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {lead.nombre}
                    </div>
                    <div style={{ color: '#8888aa', fontSize: 11, marginTop: 2 }}>
                      Toque #{lead.toqueActual} · {toqueInfo?.nombre}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    {dias !== null ? (
                      <span style={{ color: '#f87171', fontSize: 11, fontWeight: 600 }}>
                        {dias}d atrasado
                      </span>
                    ) : (
                      <span style={{ color: '#f97316', fontSize: 11, fontWeight: 600 }}>
                        hoy
                      </span>
                    )}
                    <div style={{ color: '#8888aa', fontSize: 10 }}>{lead.closer}</div>
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
