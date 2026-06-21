import { NextResponse } from 'next/server';
import { appsScript } from '@/lib/appsScript';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await appsScript.addNota(body);
    return NextResponse.json(result);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
