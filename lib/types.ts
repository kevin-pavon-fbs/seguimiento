export type EstadoLead = 'Activo' | 'Ganado' | 'No interesado' | 'No responde' | 'Perdido';

export interface Lead {
  id: string;
  nombre: string;
  fuente: string;
  closer: string;
  fechaIngreso: string;
  estado: EstadoLead;
  toqueActual: number;
  fechaUltimoToque: string;
  fechaProximoToque: string;
  notas: string;
  slackIdCloser: string;
  diasEnSeguimiento: number;
  tieneToqueHoy: boolean;
}

export interface Nota {
  id: string;
  leadId: string;
  fecha: string;
  closer: string;
  nota: string;
}

export interface Closer {
  nombre: string;
  slackId: string;
}

export interface Toque {
  num: number;
  nombre: string;
  dia: number;
}

export interface ReporteStats {
  totalLeads: number;
  activos: number;
  ganados: number;
  cerrados: number;
  toquesSemana: number;
  porCloser: Record<string, { activos: number; ganados: number; toques: number }>;
  fechaGenerado: string;
}
