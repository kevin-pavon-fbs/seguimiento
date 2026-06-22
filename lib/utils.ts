import { EstadoLead, Lead, Toque } from './types';

export const ESTADOS_CONGELADOS: EstadoLead[] = ['Ganado', 'No interesado', 'Perdido'];

export const TOQUES: Toque[] = [
  { num: 1,  nombre: 'Email resumen post-llamada',          dia: 0  },
  { num: 2,  nombre: 'Seguimiento WhatsApp',                 dia: 1  },
  { num: 3,  nombre: 'Caso de éxito similar',                dia: 3  },
  { num: 4,  nombre: 'Llamada - Romper objeción',            dia: 7  },
  { num: 5,  nombre: 'Testimonio + garantía reforzada',      dia: 10 },
  { num: 6,  nombre: 'Contenido de valor / Lead Magnet',     dia: 15 },
  { num: 7,  nombre: 'Check-in suave',                       dia: 21 },
  { num: 8,  nombre: 'Llamada - Nuevo ángulo',               dia: 35 },
  { num: 9,  nombre: 'Caso de estudio / Win reciente',       dia: 45 },
  { num: 10, nombre: 'Oferta especial por tiempo limitado',  dia: 60 },
  { num: 11, nombre: 'Check-in suave',                       dia: 70 },
  { num: 12, nombre: 'Llamada final - Decisión',             dia: 80 },
];

export function parseDate(str: string): Date {
  if (!str) return new Date();
  const parts = str.split('/');
  if (parts.length === 3) {
    return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
  }
  return new Date(str);
}

export function calcularDias(fechaIngreso: string): number {
  if (!fechaIngreso) return 0;
  const ingreso = parseDate(fechaIngreso);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  ingreso.setHours(0, 0, 0, 0);
  return Math.max(0, Math.floor((hoy.getTime() - ingreso.getTime()) / 86400000));
}

export function tieneToqueHoy(fechaIngreso: string): boolean {
  const dias = calcularDias(fechaIngreso);
  return TOQUES.some(t => t.dia === dias);
}

export function estaVencido(fechaProximoToque: string, estado: EstadoLead): boolean {
  if (!fechaProximoToque || ESTADOS_CONGELADOS.includes(estado)) return false;
  const proximo = parseDate(fechaProximoToque);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  proximo.setHours(0, 0, 0, 0);
  return proximo < hoy;
}

export function diasVencido(fechaProximoToque: string): number {
  if (!fechaProximoToque) return 0;
  const proximo = parseDate(fechaProximoToque);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  proximo.setHours(0, 0, 0, 0);
  return Math.floor((hoy.getTime() - proximo.getTime()) / 86400000);
}

export function toqueSegunDias(dias: number): Toque | null {
  return TOQUES.find(t => t.dia === dias) || null;
}

export function generarId(prefix: string): string {
  return `${prefix}_${Date.now()}`;
}

export function estaCongelado(estado: EstadoLead): boolean {
  return ESTADOS_CONGELADOS.includes(estado);
}

export function formatearFechaHoy(): string {
  const hoy = new Date();
  return `${String(hoy.getDate()).padStart(2, '0')}/${String(hoy.getMonth() + 1).padStart(2, '0')}/${hoy.getFullYear()}`;
}

export type ToqueStatus = 'ok' | 'hoy' | 'vencido' | 'futuro';

export function getToqueStatus(lead: Lead): ToqueStatus {
  const { fechaIngreso, toqueActual, fechaUltimoToque } = lead;
  const toque = TOQUES.find(t => t.num === toqueActual);
  if (!toque || !fechaIngreso) return 'futuro';

  const ingreso = parseDate(fechaIngreso);
  ingreso.setHours(0, 0, 0, 0);
  const expectedDate = new Date(ingreso.getTime() + toque.dia * 86400000);
  expectedDate.setHours(0, 0, 0, 0);

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  // Confirmed: fechaUltimoToque >= expectedDate
  if (fechaUltimoToque) {
    const ultimo = parseDate(fechaUltimoToque);
    ultimo.setHours(0, 0, 0, 0);
    if (ultimo >= expectedDate) return 'ok';
  }

  if (expectedDate.getTime() === hoy.getTime()) return 'hoy';
  if (expectedDate < hoy) return 'vencido';
  return 'futuro';
}
