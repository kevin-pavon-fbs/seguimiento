import { NextResponse } from 'next/server';
import { appsScript } from '@/lib/appsScript';

export async function POST() {
  try {
    const slackToken = process.env.SLACK_BOT_TOKEN || '';
    const result = await appsScript.testSlackAlerta(slackToken);
    return NextResponse.json(result);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
