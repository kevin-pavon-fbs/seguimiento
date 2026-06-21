import { NextResponse } from 'next/server';
import { appsScript } from '@/lib/appsScript';

export async function GET(_: Request, { params }: { params: Promise<{ leadId: string }> }) {
  try {
    const { leadId } = await params;
    const notas = await appsScript.getNotas(leadId);
    return NextResponse.json(notas);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
