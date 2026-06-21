'use client';
import { useState, useEffect } from 'react';
import { Lead } from '@/lib/types';
import { calcularDias, tieneToqueHoy } from '@/lib/utils';
import Header from '@/components/Header';
import AlertaBanner from '@/components/AlertaBanner';
import KanbanBoard from '@/components/KanbanBoard';
import LeadModal from '@/components/LeadModal';
import AddLeadModal from '@/components/AddLeadModal';
import ReporteModal from '@/components/ReporteModal';

export default function Home() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [closers, setClosers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterCloser, setFilterCloser] = useState('');
  const [showFrozen, setShowFrozen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showReporte, setShowReporte] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/api/leads').then(r => r.json()),
      fetch('/api/config').then(r => r.json()),
    ])
      .then(([leadsData, configData]) => {
        if (Array.isArray(leadsData)) setLeads(leadsData);
        if (configData?.closers) setClosers(configData.closers);
        else setClosers(['Kevin Pavon']);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const updateLead = (id: string, updates: Partial<Lead>) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
    setSelectedLead(prev => prev?.id === id ? { ...prev, ...updates } : prev);
  };

  const addLead = (lead: Lead) => {
    const enriched: Lead = {
      ...lead,
      diasEnSeguimiento: calcularDias(lead.fechaIngreso),
      tieneToqueHoy: tieneToqueHoy(lead.fechaIngreso),
    };
    setLeads(prev => [...prev, enriched]);
  };

  const deleteLead = (id: string) => {
    setLeads(prev => prev.filter(l => l.id !== id));
  };

  const handleSetup = async () => {
    try {
      const res = await fetch('/api/setup', { method: 'POST' });
      const data = await res.json();
      alert(data.error ? `❌ ${data.error}` : '✅ Google Sheets inicializado correctamente');
    } catch {
      alert('❌ Error al conectar con Apps Script. Verificá la URL en .env.local');
    }
  };

  if (loading) {
    return (
      <div style={{ background: '#0f0f1a', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, system-ui, sans-serif' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#00ff88', fontSize: 32, marginBottom: 12 }}>🎯</div>
          <div style={{ color: '#8888aa', fontSize: 16 }}>Cargando leads...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ background: '#0f0f1a', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, system-ui, sans-serif' }}>
        <div style={{ textAlign: 'center', maxWidth: 440, padding: 20 }}>
          <div style={{ color: '#f87171', fontSize: 32, marginBottom: 12 }}>⚠️</div>
          <div style={{ color: '#f0f0ff', fontSize: 16, marginBottom: 8 }}>Error al conectar</div>
          <div style={{ color: '#8888aa', fontSize: 13, marginBottom: 16 }}>{error}</div>
          <div style={{ color: '#8888aa', fontSize: 12, background: '#1a1a2e', padding: 12, borderRadius: 8, textAlign: 'left', lineHeight: 1.6 }}>
            Verificá que <code style={{ color: '#00ff88' }}>NEXT_PUBLIC_APPS_SCRIPT_URL</code> esté configurada en <code style={{ color: '#00ff88' }}>.env.local</code>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#0f0f1a', minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Header
        closers={closers}
        filterCloser={filterCloser}
        onFilterChange={setFilterCloser}
        showFrozen={showFrozen}
        onToggleFrozen={() => setShowFrozen(p => !p)}
        onAddLead={() => setShowAddModal(true)}
        onReporte={() => setShowReporte(true)}
        onSetup={handleSetup}
      />

      <AlertaBanner leads={leads} onLeadClick={setSelectedLead} />

      <KanbanBoard
        leads={leads}
        filterCloser={filterCloser}
        showFrozen={showFrozen}
        onLeadClick={setSelectedLead}
        onLeadUpdate={updateLead}
      />

      {selectedLead && (
        <LeadModal
          lead={selectedLead}
          closers={closers}
          onClose={() => setSelectedLead(null)}
          onUpdate={updateLead}
          onDelete={deleteLead}
        />
      )}

      {showAddModal && (
        <AddLeadModal
          closers={closers}
          onClose={() => setShowAddModal(false)}
          onAdd={addLead}
        />
      )}

      {showReporte && <ReporteModal onClose={() => setShowReporte(false)} />}
    </div>
  );
}
