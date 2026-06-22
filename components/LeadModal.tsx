'use client';
import { useState, useEffect } from 'react';
import { Lead, Nota, Closer } from '@/lib/types';
import { TOQUES, estaCongelado, formatearFechaHoy } from '@/lib/utils';

const ESTADOS = ['Activo', 'No responde', 'Ganado', 'No interesado', 'Perdido'] as const;
const FUENTES = ['Meta Ads', 'Orgánico', 'Referido', 'Otro'];

const estadoColors: Record<string, string> = {
  'Activo': '#16a34a',
  'No responde': '#d97706',
  'Ganado': '#2563eb',
  'No interesado': '#9ca3af',
  'Perdido': '#9ca3af',
};

interface Props {
  lead: Lead;
  closers: Closer[];
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<Lead>) => void;
  onDelete: (id: string) => void;
}

export default function LeadModal({ lead: initialLead, closers, onClose, onUpdate, onDelete }: Props) {
  const [lead, setLead] = useState(initialLead);
  const [notas, setNotas] = useState<Nota[]>([]);
  const [nuevaNota, setNuevaNota] = useState('');
  const [savingNota, setSavingNota] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    fetch(`/api/notas/${lead.id}`)
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setNotas(data); })
      .catch(() => {});
  }, [lead.id]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/leads/${lead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lead),
      });
      if (!res.ok) throw new Error('Error al guardar');
      onUpdate(lead.id, lead);
      showToast('✅ Cambios guardados');
    } catch {
      showToast('❌ Error al guardar');
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!confirm(`¿Eliminar a ${lead.nombre}? Esta acción no se puede deshacer.`)) return;
    await fetch(`/api/leads/${lead.id}`, { method: 'DELETE' });
    onDelete(lead.id);
    onClose();
  };

  const handleEstadoChange = (estado: string) => {
    if (estaCongelado(estado as Lead['estado'])) {
      if (!confirm(`¿Cambiar estado a "${estado}"?\nEl lead dejará de avanzar automáticamente.`)) return;
    }
    setLead(p => ({ ...p, estado: estado as Lead['estado'] }));
  };

  // Confirms current toque and advances to next
  const handleConfirmar = async () => {
    if (lead.toqueActual >= 12) return;
    setConfirming(true);
    const next = lead.toqueActual + 1;
    const hoy = formatearFechaHoy();
    try {
      await fetch(`/api/leads/${lead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toqueActual: next }),
      });
      setLead(p => ({ ...p, toqueActual: next, fechaUltimoToque: hoy }));
      onUpdate(lead.id, { toqueActual: next, fechaUltimoToque: hoy });
      showToast(`✅ Toque #${next} — listo`);
    } catch {
      showToast('❌ Error al confirmar');
    }
    setConfirming(false);
  };

  // Manual nav (prev/next) without confirming
  const handleToqueNav = async (delta: number) => {
    const next = Math.max(1, Math.min(12, lead.toqueActual + delta));
    if (next === lead.toqueActual) return;
    const hoy = formatearFechaHoy();
    setLead(p => ({ ...p, toqueActual: next, ...(delta > 0 ? { fechaUltimoToque: hoy } : {}) }));
    await fetch(`/api/leads/${lead.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ toqueActual: next }),
    });
    onUpdate(lead.id, { toqueActual: next, ...(delta > 0 ? { fechaUltimoToque: hoy } : {}) });
  };

  const handleAddNota = async () => {
    if (!nuevaNota.trim()) return;
    setSavingNota(true);
    try {
      const res = await fetch('/api/notas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId: lead.id, closer: lead.closer, nota: nuevaNota }),
      });
      const data = await res.json();
      const nota: Nota = {
        id: data.id || `nota_${Date.now()}`,
        leadId: lead.id,
        fecha: new Date().toLocaleDateString('es-AR'),
        closer: lead.closer,
        nota: nuevaNota,
      };
      setNotas(prev => [nota, ...prev]);
      setLead(p => ({ ...p, notas: nuevaNota }));
      onUpdate(lead.id, { notas: nuevaNota });
      setNuevaNota('');
      showToast('✅ Nota guardada');
    } catch {
      showToast('❌ Error al guardar nota');
    }
    setSavingNota(false);
  };

  const toqueInfo = TOQUES.find(t => t.num === lead.toqueActual);
  const nextToqueInfo = TOQUES.find(t => t.num === lead.toqueActual + 1);

  // Ensure the current closer is always available in the dropdown
  const closerOptions = closers.length > 0
    ? closers
    : [{ nombre: lead.closer, slackId: '' }];
  const hasCurrentCloser = closerOptions.some(c => c.nombre === lead.closer);

  const inputStyle = {
    width: '100%',
    background: '#f9f9fb',
    border: '1px solid #e2e2ea',
    borderRadius: 6,
    padding: '6px 8px',
    color: '#1a1a2e',
    fontSize: 13,
    boxSizing: 'border-box' as const,
    outline: 'none',
  };

  const labelStyle = {
    color: '#6b7280',
    fontSize: 11,
    display: 'block' as const,
    marginBottom: 4,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  };

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 200 }} />
      <div style={{
        position: 'fixed',
        top: 0,
        right: 0,
        height: '100vh',
        width: 480,
        maxWidth: '95vw',
        background: '#ffffff',
        borderLeft: '1px solid #e2e2ea',
        zIndex: 201,
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
      }}>
        {toast && (
          <div style={{
            position: 'fixed',
            top: 16,
            right: 16,
            background: '#ffffff',
            color: '#1a1a2e',
            padding: '10px 16px',
            borderRadius: 8,
            zIndex: 300,
            fontSize: 14,
            border: '1px solid #e2e2ea',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          }}>
            {toast}
          </div>
        )}

        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e2ea', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <div style={{ flex: 1 }}>
            <input
              value={lead.nombre}
              onChange={e => setLead(p => ({ ...p, nombre: e.target.value }))}
              style={{ background: 'transparent', border: 'none', color: '#1a1a2e', fontSize: 18, fontWeight: 700, width: '100%', outline: 'none', padding: 0 }}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
              <span style={{ color: estadoColors[lead.estado] || '#6b7280', fontSize: 12, fontWeight: 600 }}>{lead.estado}</span>
              <span style={{ color: '#9ca3af', fontSize: 12 }}>{lead.diasEnSeguimiento} días en seguimiento</span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: 22, padding: 4, lineHeight: 1 }}>×</button>
        </div>

        <div style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column', gap: 18 }}>

          {/* Datos básicos */}
          <section>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={labelStyle}>Fuente</label>
                <select value={lead.fuente} onChange={e => setLead(p => ({ ...p, fuente: e.target.value }))} style={inputStyle}>
                  {FUENTES.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Closer</label>
                <select value={lead.closer} onChange={e => setLead(p => ({ ...p, closer: e.target.value }))} style={inputStyle}>
                  {!hasCurrentCloser && lead.closer && (
                    <option value={lead.closer}>{lead.closer}</option>
                  )}
                  {closerOptions.map(c => (
                    <option key={c.nombre} value={c.nombre}>{c.nombre}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Fecha Ingreso</label>
                <input value={lead.fechaIngreso} onChange={e => setLead(p => ({ ...p, fechaIngreso: e.target.value }))} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Estado</label>
                <select
                  value={lead.estado}
                  onChange={e => handleEstadoChange(e.target.value)}
                  style={{ ...inputStyle, color: estadoColors[lead.estado] || '#1a1a2e', borderColor: estadoColors[lead.estado] || '#e2e2ea', fontWeight: 600 }}
                >
                  {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
            </div>

            {/* Largo plazo */}
            <div style={{ marginTop: 12, background: '#f9f9fb', borderRadius: 8, padding: '10px 12px', border: '1px solid #e2e2ea' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={lead.largoplazo || false}
                  onChange={e => setLead(p => ({ ...p, largoplazo: e.target.checked }))}
                  style={{ width: 15, height: 15, accentColor: '#6d28d9' }}
                />
                <span style={{ color: '#1a1a2e', fontSize: 13, fontWeight: 600 }}>Seguimiento a largo plazo</span>
              </label>
              {lead.largoplazo && (
                <div style={{ marginTop: 10 }}>
                  <label style={labelStyle}>Próximo contacto (DD/MM/YYYY)</label>
                  <input
                    value={lead.proximoContacto || ''}
                    onChange={e => setLead(p => ({ ...p, proximoContacto: e.target.value }))}
                    placeholder="DD/MM/YYYY"
                    style={inputStyle}
                  />
                </div>
              )}
            </div>
          </section>

          {/* Toque + Confirmar */}
          <section style={{ background: '#f9f9fb', borderRadius: 8, padding: '14px', border: '1px solid #e2e2ea' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div>
                <div style={{ color: '#6b7280', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Toque Actual</div>
                <div style={{ color: '#1a1a2e', fontSize: 15, fontWeight: 700 }}>
                  #{lead.toqueActual} — {toqueInfo?.nombre}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: '#9ca3af', fontSize: 11, marginBottom: 2 }}>Ingreso</div>
                <div style={{ color: '#1a1a2e', fontSize: 13, fontWeight: 600 }}>{lead.fechaIngreso}</div>
              </div>
            </div>

            {lead.fechaProximoToque && (
              <div style={{ background: '#eff6ff', borderRadius: 6, padding: '8px 10px', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8, border: '1px solid #bfdbfe' }}>
                <span style={{ fontSize: 13 }}>📅</span>
                <div>
                  <span style={{ color: '#6b7280', fontSize: 11 }}>Próximo toque: </span>
                  <span style={{ color: '#1e40af', fontSize: 13, fontWeight: 700 }}>{lead.fechaProximoToque}</span>
                </div>
              </div>
            )}

            {/* Confirmar button — main CTA */}
            {!estaCongelado(lead.estado) && lead.toqueActual < 12 && (
              <button
                onClick={handleConfirmar}
                disabled={confirming}
                style={{
                  width: '100%',
                  background: '#16a34a',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '11px 16px',
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: confirming ? 'wait' : 'pointer',
                  opacity: confirming ? 0.7 : 1,
                  marginBottom: 8,
                }}
              >
                {confirming ? 'Confirmando...' : `✅ Confirmar seguimiento → Toque #${lead.toqueActual + 1}${nextToqueInfo ? ` (${nextToqueInfo.nombre})` : ''}`}
              </button>
            )}

            {/* Manual nav */}
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => handleToqueNav(-1)}
                disabled={lead.toqueActual <= 1}
                style={{ flex: 1, background: '#fff', color: '#6b7280', border: '1px solid #e2e2ea', borderRadius: 6, padding: '7px 8px', cursor: lead.toqueActual <= 1 ? 'not-allowed' : 'pointer', opacity: lead.toqueActual <= 1 ? 0.4 : 1, fontSize: 12 }}
              >
                ← Anterior
              </button>
              <button
                onClick={() => handleToqueNav(1)}
                disabled={lead.toqueActual >= 12}
                style={{ flex: 1, background: '#fff', color: '#6b7280', border: '1px solid #e2e2ea', borderRadius: 6, padding: '7px 8px', cursor: lead.toqueActual >= 12 ? 'not-allowed' : 'pointer', opacity: lead.toqueActual >= 12 ? 0.4 : 1, fontSize: 12 }}
              >
                Siguiente →
              </button>
            </div>
          </section>

          {/* Nueva nota */}
          <section>
            <div style={{ color: '#6b7280', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Nueva Nota</div>
            <textarea
              value={nuevaNota}
              onChange={e => setNuevaNota(e.target.value)}
              placeholder="Agregar nota sobre este lead..."
              rows={3}
              style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.5 }}
            />
            <button
              onClick={handleAddNota}
              disabled={savingNota || !nuevaNota.trim()}
              style={{ marginTop: 8, background: '#6d28d9', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px', cursor: !nuevaNota.trim() ? 'not-allowed' : 'pointer', fontSize: 13, opacity: !nuevaNota.trim() ? 0.5 : 1 }}
            >
              {savingNota ? 'Guardando...' : 'Guardar nota'}
            </button>
          </section>

          {/* Historial notas */}
          {notas.length > 0 && (
            <section>
              <div style={{ color: '#6b7280', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                Historial ({notas.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {notas.map(n => (
                  <div key={n.id} style={{ background: '#f9f9fb', borderRadius: 6, padding: '10px 12px', border: '1px solid #e2e2ea' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ color: '#6b7280', fontSize: 11 }}>{n.closer}</span>
                      <span style={{ color: '#9ca3af', fontSize: 11 }}>{n.fecha}</span>
                    </div>
                    <p style={{ color: '#1a1a2e', fontSize: 13, margin: 0, lineHeight: 1.5 }}>{n.nota}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '14px 20px', borderTop: '1px solid #e2e2ea', display: 'flex', gap: 10 }}>
          <button
            onClick={handleDelete}
            style={{ background: 'transparent', color: '#ef4444', border: '1px solid #fecaca', borderRadius: 6, padding: '8px 14px', cursor: 'pointer', fontSize: 13 }}
          >
            Eliminar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{ flex: 1, background: '#6d28d9', color: '#ffffff', borderRadius: 6, padding: 8, cursor: saving ? 'wait' : 'pointer', fontWeight: 700, fontSize: 14, border: 'none', opacity: saving ? 0.7 : 1 }}
          >
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </div>
    </>
  );
}
