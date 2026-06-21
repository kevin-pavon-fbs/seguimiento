import { NextResponse } from 'next/server';
import { appsScript } from '@/lib/appsScript';

export async function POST(req: Request) {
  try {
    const { stats } = await req.json();
    const result = await appsScript.sendSlackReporte(stats);
    return NextResponse.json(result);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
