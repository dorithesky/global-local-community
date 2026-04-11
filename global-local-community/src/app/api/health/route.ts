import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    app: 'global-local-community',
    city: process.env.NEXT_PUBLIC_CITY ?? 'Daegu',
    layers: ['interface', 'application', 'data', 'intelligence', 'orchestration'],
  });
}
