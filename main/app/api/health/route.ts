import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Research AI Backend API',
    version: '0.1.0',
  });
}

