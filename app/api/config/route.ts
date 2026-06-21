import { NextResponse } from 'next/server';
import { appsScript } from '@/lib/appsScript';

export async function GET() {
  try {
    const config = await appsScript.getConfig();
    return NextResponse.json(config);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
