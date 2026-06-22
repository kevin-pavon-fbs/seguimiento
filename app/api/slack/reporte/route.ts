import { NextResponse } from 'next/server';
import { appsScript } from '@/lib/appsScript';

export async function POST(req: Request) {
  try {
    const { stats } = await req.json();
    const slackToken = process.env.SLACK_BOT_TOKEN || '';
    const result = await appsScript.sendSlackReporte(stats, slackToken);
    return NextResponse.json(result);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
