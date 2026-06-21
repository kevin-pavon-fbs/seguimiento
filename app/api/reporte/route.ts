import { NextResponse } from 'next/server';
import { appsScript } from '@/lib/appsScript';

export async function POST() {
  try {
    const stats = await appsScript.getReporte();
    return NextResponse.json(stats);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
