'use client';
import { useState, useEffect } from 'react';
import { Lead, Nota, Closer } from '@/lib/types';
import { TOQUES, estaCongelado } from '@/lib/utils';

const ESTADOS = ['Activo', 'No responde', 'Ganado', 'No interesado', 'Perdido'] as const;
const FUENTES = ['Meta Ads', 'Orgánico', 'Referido', 'Otro'];

const estadoColors: Record<string, string> = {
  'Activo': '#00ff88',
  'No responde': '#fbbf24',
  'Ganado': '#60a5fa',
  'No interesado': '#4a4a6a',
  'Perdido': '#4a4a6a',
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

  const handleToqueNav = async (delta: number) => {
    const next = Math.max(1, Math.min(12, lead.toqueActual + delta));
    setLead(p => ({ ...p, toqueActual: next }));
    await fetch(`/api/leads/${lead.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ toqueActual: next }),
    });
    onUpdate(lead.id, { toqueActual: next });
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

  const inputStyle = {
    width: '100%',
    background: '#252540',
    border: '1px solid #2a2a4a',
    borderRadius: 6,
    padding: '6px 8px',
    color: '#f0f0ff',
    fontSize: 13,
    boxSizing: 'border-box' as const,
    outline: 'none',
  };

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200 }} />
      <div style={{
        position: 'fixed',
        top: 0,
        right: 0,
        height: '100vh',
        width: 480,
        maxWidth: '95vw',
        background: '#1a1a2e',
        borderLeft: '1px solid #2a2a4a',
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
            background: '#252540',
            color: '#f0f0ff',
            padding: '10px 16px',
            borderRadius: 8,
            zIndex: 300,
            fontSize: 14,
            border: '1px solid #2a2a4a',
          }}>
            {toast}
          </div>
        )}

        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #2a2a4a', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <div style={{ flex: 1 }}>
            <input
              value={lead.nombre}
              onChange={e => setLead(p => ({ ...p, nombre: e.target.value }))}
              style={{ background: 'transparent', border: 'none', color: '#f0f0ff', fontSize: 18, fontWeight: 700, width: '100%', outline: 'none', padding: 0 }}
            />
            <span style={{ color: estadoColors[lead.estado] || '#8888aa', fontSize: 12, fontWeight: 600 }}>{lead.estado}</span>
            <span style={{ color: '#8888aa', fontSize: 12, marginLeft: 8 }}>{lead.diasEnSeguimiento} días</span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#8888aa', cursor: 'pointer', fontSize: 22, padding: 4, lineHeight: 1 }}>×</button>
        </div>

        <div style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Datos básicos */}
          <section>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ color: '#8888aa', fontSize: 11, display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Fuente</label>
                <select value={lead.fuente} onChange={e => setLead(p => ({ ...p, fuente: e.target.value }))} style={inputStyle}>
                  {FUENTES.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label style={{ color: '#8888aa', fontSize: 11, display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Closer</label>
                <select value={lead.closer} onChange={e => setLead(p => ({ ...p, closer: e.target.value }))} style={inputStyle}>
                  {closers.map(c => <option key={c.nombre} value={c.nombre}>{c.nombre}</option>)}
                </select>
              </div>
              <div>
                <label style={{ color: '#8888aa', fontSize: 11, display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Fecha Ingreso</label>
                <input
                  value={lead.fechaIngreso}
                  onChange={e => setLead(p => ({ ...p, fechaIngreso: e.target.value }))}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={{ color: '#8888aa', fontSize: 11, display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Estado</label>
                <select
                  value={lead.estado}
                  onChange={e => handleEstadoChange(e.target.value)}
                  style={{ ...inputStyle, color: estadoColors[lead.estado] || '#f0f0ff', borderColor: estadoColors[lead.estado] || '#2a2a4a', fontWeight: 600 }}
                >
                  {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
            </div>
          </section>

          {/* Navegación de toque */}
          <section style={{ background: '#252540', borderRadius: 8, padding: 14 }}>
            <div style={{ color: '#8888aa', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Toque Actual</div>
            <div style={{ color: '#f0f0ff', fontSize: 15, fontWeight: 600, marginBottom: 2 }}>
              #{lead.toqueActual} — {toqueInfo?.nombre}
            </div>
            <div style={{ color: '#8888aa', fontSize: 12, marginBottom: 12 }}>
              Día {toqueInfo?.dia} del seguimiento
              {lead.fechaProximoToque && ` · Próximo: ${lead.fechaProximoToque}`}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => handleToqueNav(-1)}
                disabled={lead.toqueActual <= 1}
                style={{ flex: 1, background: '#1a1a2e', color: '#f0f0ff', border: '1px solid #2a2a4a', borderRadius: 6, padding: 8, cursor: lead.toqueActual <= 1 ? 'not-allowed' : 'pointer', opacity: lead.toqueActual <= 1 ? 0.4 : 1, fontSize: 13 }}
              >
                ← Anterior
              </button>
              <button
                onClick={() => handleToqueNav(1)}
                disabled={lead.toqueActual >= 12}
                style={{ flex: 1, background: '#1a1a2e', color: '#f0f0ff', border: '1px solid #2a2a4a', borderRadius: 6, padding: 8, cursor: lead.toqueActual >= 12 ? 'not-allowed' : 'pointer', opacity: lead.toqueActual >= 12 ? 0.4 : 1, fontSize: 13 }}
              >
                Siguiente →
              </button>
            </div>
          </section>

          {/* Nueva nota */}
          <section>
            <div style={{ color: '#8888aa', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Nueva Nota</div>
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
              style={{ marginTop: 8, background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px', cursor: !nuevaNota.trim() ? 'not-allowed' : 'pointer', fontSize: 13, opacity: !nuevaNota.trim() ? 0.5 : 1 }}
            >
              {savingNota ? 'Guardando...' : 'Guardar nota'}
            </button>
          </section>

          {/* Historial notas */}
          {notas.length > 0 && (
            <section>
              <div style={{ color: '#8888aa', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                Historial ({notas.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {notas.map(n => (
                  <div key={n.id} style={{ background: '#252540', borderRadius: 6, padding: '10px 12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ color: '#8888aa', fontSize: 11 }}>{n.closer}</span>
                      <span style={{ color: '#8888aa', fontSize: 11 }}>{n.fecha}</span>
                    </div>
                    <p style={{ color: '#f0f0ff', fontSize: 13, margin: 0, lineHeight: 1.5 }}>{n.nota}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '14px 20px', borderTop: '1px solid #2a2a4a', display: 'flex', gap: 10 }}>
          <button
            onClick={handleDelete}
            style={{ background: 'transparent', color: '#f87171', border: '1px solid #f87171', borderRadius: 6, padding: '8px 14px', cursor: 'pointer', fontSize: 13 }}
          >
            Eliminar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{ flex: 1, background: '#00ff88', color: '#0f0f1a', borderRadius: 6, padding: 8, cursor: saving ? 'wait' : 'pointer', fontWeight: 700, fontSize: 14, border: 'none', opacity: saving ? 0.7 : 1 }}
          >
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </div>
    </>
  );
}
