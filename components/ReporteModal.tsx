'use client';
import { useState } from 'react';
import { ReporteStats } from '@/lib/types';

interface Props {
  onClose: () => void;
}

export default function ReporteModal({ onClose }: Props) {
  const [stats, setStats] = useState<ReporteStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [testing, setTesting] = useState(false);
  const [toast, setToast] = useState('');

  const generar = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/reporte', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error');
      setStats(data);
    } catch (e: unknown) {
      setToast('❌ ' + (e instanceof Error ? e.message : 'Error al generar reporte'));
      setTimeout(() => setToast(''), 3000);
    }
    setLoading(false);
  };

  const testSlack = async () => {
    setTesting(true);
    try {
      const res = await fetch('/api/slack/test', { method: 'POST' });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || 'Error desconocido');
      setToast('✅ Mensaje de test enviado a Slack');
      setTimeout(() => setToast(''), 5000);
    } catch (e: unknown) {
      setToast('❌ ' + (e instanceof Error ? e.message : 'Error al enviar test'));
      setTimeout(() => setToast(''), 8000);
    }
    setTesting(false);
  };

  const enviarSlack = async () => {
    if (!stats) return;
    setSending(true);
    try {
      await fetch('/api/slack/reporte', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stats }),
      });
      setToast('✅ Reporte enviado a Slack');
      setTimeout(() => setToast(''), 3000);
    } catch {
      setToast('❌ Error al enviar a Slack');
      setTimeout(() => setToast(''), 3000);
    }
    setSending(false);
  };

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 200 }} />
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%,-50%)',
          background: '#ffffff',
          border: '1px solid #e2e2ea',
          borderRadius: 12,
          padding: 24,
          width: 500,
          maxWidth: '92vw',
          zIndex: 201,
          maxHeight: '88vh',
          overflowY: 'auto',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        }}
      >
        {toast && (
          <div style={{ background: '#f5f5f8', color: '#1a1a2e', padding: '10px 12px', borderRadius: 6, marginBottom: 12, fontSize: 14, border: '1px solid #e2e2ea' }}>
            {toast}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ color: '#1a1a2e', margin: 0, fontSize: 18, fontWeight: 700 }}>📊 Reporte Semanal</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: 22, lineHeight: 1 }}>×</button>
        </div>

        {!stats ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button
              onClick={generar}
              disabled={loading}
              style={{ width: '100%', background: '#6d28d9', color: '#ffffff', border: 'none', borderRadius: 8, padding: 14, fontWeight: 700, fontSize: 15, cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Generando...' : 'Generar Reporte'}
            </button>
            <button
              onClick={testSlack}
              disabled={testing}
              style={{ width: '100%', background: '#f9f9fb', color: '#1a1a2e', border: '1px solid #e2e2ea', borderRadius: 8, padding: 12, fontWeight: 600, fontSize: 14, cursor: testing ? 'wait' : 'pointer', opacity: testing ? 0.7 : 1 }}
            >
              {testing ? 'Enviando...' : '🔔 Test alarma Slack'}
            </button>
          </div>
        ) : (
          <>
            <div style={{ color: '#6b7280', fontSize: 12, marginBottom: 16 }}>Generado: {stats.fechaGenerado}</div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
              {[
                { label: 'Total', value: stats.totalLeads, color: '#1a1a2e' },
                { label: 'Activos', value: stats.activos, color: '#16a34a' },
                { label: 'Ganados', value: stats.ganados, color: '#2563eb' },
                { label: 'Cerrados', value: stats.cerrados, color: '#6b7280' },
                { label: 'Toques/sem', value: stats.toquesSemana, color: '#d97706' },
              ].map(s => (
                <div key={s.label} style={{ background: '#f5f5f8', borderRadius: 8, padding: '12px 8px', textAlign: 'center', border: '1px solid #e2e2ea' }}>
                  <div style={{ color: s.color, fontSize: 26, fontWeight: 700 }}>{s.value}</div>
                  <div style={{ color: '#6b7280', fontSize: 11, marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {Object.keys(stats.porCloser).length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ color: '#6b7280', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Por Closer</div>
                {Object.entries(stats.porCloser).map(([closer, data]) => (
                  <div key={closer} style={{ background: '#f5f5f8', borderRadius: 6, padding: '10px 12px', marginBottom: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #e2e2ea' }}>
                    <span style={{ color: '#1a1a2e', fontSize: 14, fontWeight: 600 }}>{closer}</span>
                    <div style={{ display: 'flex', gap: 12 }}>
                      <span style={{ color: '#16a34a', fontSize: 12 }}>{data.activos} activos</span>
                      <span style={{ color: '#2563eb', fontSize: 12 }}>{data.ganados} ganados</span>
                      <span style={{ color: '#d97706', fontSize: 12 }}>{data.toques} toques</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={generar}
                style={{ background: '#f9f9fb', color: '#1a1a2e', border: '1px solid #e2e2ea', borderRadius: 8, padding: '10px 16px', cursor: 'pointer', fontSize: 13 }}
              >
                Regenerar
              </button>
              <button
                onClick={enviarSlack}
                disabled={sending}
                style={{ flex: 1, background: '#6d28d9', color: '#fff', border: 'none', borderRadius: 8, padding: 12, fontWeight: 700, fontSize: 14, cursor: sending ? 'wait' : 'pointer', opacity: sending ? 0.7 : 1 }}
              >
                {sending ? 'Enviando...' : '📤 Enviar a Slack'}
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
