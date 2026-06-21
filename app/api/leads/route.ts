import { NextResponse } from 'next/server';
import { appsScript } from '@/lib/appsScript';
import { calcularDias, tieneToqueHoy } from '@/lib/utils';
import { Lead } from '@/lib/types';

export async function GET() {
  try {
    const leads = await appsScript.getLeads() as Lead[];
    const enriched = leads.map(l => ({
      ...l,
      diasEnSeguimiento: calcularDias(l.fechaIngreso),
      tieneToqueHoy: tieneToqueHoy(l.fechaIngreso),
    }));
    return NextResponse.json(enriched);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Error desconocido';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await appsScript.addLead(body);
    return NextResponse.json(result);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Error desconocido';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
