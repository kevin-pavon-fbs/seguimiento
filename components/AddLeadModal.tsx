'use client';
import { useState } from 'react';
import { Lead, Closer } from '@/lib/types';
import { formatearFechaHoy, calcularDias, tieneToqueHoy } from '@/lib/utils';

const FUENTES = ['Meta Ads', 'Orgánico', 'Referido', 'Otro'];

interface Props {
  closers: Closer[];
  onClose: () => void;
  onAdd: (lead: Lead) => void;
}

export default function AddLeadModal({ closers, onClose, onAdd }: Props) {
  const [form, setForm] = useState({
    nombre: '',
    fuente: 'Meta Ads',
    closer: closers[0]?.nombre || 'Kevin Pavon',
    fechaIngreso: formatearFechaHoy(),
    largoplazo: false,
    proximoContacto: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre.trim()) { setError('El nombre es requerido'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al crear lead');
      onAdd({
        ...form,
        id: data.id,
        estado: 'Activo',
        toqueActual: 1,
        fechaUltimoToque: '',
        fechaProximoToque: form.fechaIngreso,
        notas: '',
        slackIdCloser: '',
        diasEnSeguimiento: calcularDias(form.fechaIngreso),
        tieneToqueHoy: tieneToqueHoy(form.fechaIngreso),
      });
      onClose();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    background: '#f9f9fb',
    border: '1px solid #e2e2ea',
    borderRadius: 6,
    padding: '8px 10px',
    color: '#1a1a2e',
    fontSize: 14,
    boxSizing: 'border-box' as const,
    outline: 'none',
  };

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: '#ffffff', border: '1px solid #e2e2ea', borderRadius: 12, padding: 24, width: 420, maxWidth: '92vw', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}
      >
        <h2 style={{ color: '#1a1a2e', margin: '0 0 20px', fontSize: 18, fontWeight: 700 }}>Nuevo Lead</h2>

        {error && (
          <div style={{ color: '#ef4444', marginBottom: 12, fontSize: 13, background: 'rgba(239,68,68,0.08)', padding: '8px 10px', borderRadius: 6, border: '1px solid rgba(239,68,68,0.2)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ color: '#6b7280', fontSize: 12, display: 'block', marginBottom: 4 }}>Nombre *</label>
            <input
              value={form.nombre}
              onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))}
              autoFocus
              style={inputStyle}
            />
          </div>

          <div>
            <label style={{ color: '#6b7280', fontSize: 12, display: 'block', marginBottom: 4 }}>Fuente</label>
            <select
              value={form.fuente}
              onChange={e => setForm(p => ({ ...p, fuente: e.target.value }))}
              style={inputStyle}
            >
              {FUENTES.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>

          <div>
            <label style={{ color: '#6b7280', fontSize: 12, display: 'block', marginBottom: 4 }}>Closer</label>
            <select
              value={form.closer}
              onChange={e => setForm(p => ({ ...p, closer: e.target.value }))}
              style={inputStyle}
            >
              {closers.map(c => <option key={c.nombre} value={c.nombre}>{c.nombre}</option>)}
            </select>
          </div>

          <div>
            <label style={{ color: '#6b7280', fontSize: 12, display: 'block', marginBottom: 4 }}>Fecha Ingreso (DD/MM/YYYY)</label>
            <input
              value={form.fechaIngreso}
              onChange={e => setForm(p => ({ ...p, fechaIngreso: e.target.value }))}
              placeholder="DD/MM/YYYY"
              style={inputStyle}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="checkbox"
              id="add-largoplazo"
              checked={form.largoplazo}
              onChange={e => setForm(p => ({ ...p, largoplazo: e.target.checked }))}
              style={{ width: 16, height: 16, cursor: 'pointer', accentColor: '#6d28d9' }}
            />
            <label htmlFor="add-largoplazo" style={{ color: '#1a1a2e', fontSize: 13, cursor: 'pointer' }}>
              Seguimiento a largo plazo
            </label>
          </div>

          {form.largoplazo && (
            <div>
              <label style={{ color: '#6b7280', fontSize: 12, display: 'block', marginBottom: 4 }}>Próximo contacto (DD/MM/YYYY)</label>
              <input
                value={form.proximoContacto}
                onChange={e => setForm(p => ({ ...p, proximoContacto: e.target.value }))}
                placeholder="DD/MM/YYYY"
                style={inputStyle}
              />
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
            <button
              type="button"
              onClick={onClose}
              style={{ flex: 1, background: '#f9f9fb', color: '#1a1a2e', border: '1px solid #e2e2ea', borderRadius: 6, padding: 10, cursor: 'pointer', fontSize: 14 }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{ flex: 1, background: '#6d28d9', color: '#ffffff', borderRadius: 6, padding: 10, cursor: loading ? 'wait' : 'pointer', fontWeight: 700, fontSize: 14, border: 'none', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Creando...' : 'Crear Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
