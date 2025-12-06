import { NextRequest, NextResponse } from 'next/server';
import { generateCitation } from '@/lib/citations';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { arxiv_url, style } = body;

    if (!arxiv_url) {
      return NextResponse.json(
        { detail: 'arxiv_url is required' },
        { status: 400 }
      );
    }

    if (!style) {
      return NextResponse.json(
        { detail: 'style is required (APA, MLA, Chicago, or IEEE)' },
        { status: 400 }
      );
    }

    const citation = await generateCitation(arxiv_url, style);

    return NextResponse.json({
      citation,
    });
  } catch (error) {
    console.error('Citation error:', error);
    return NextResponse.json(
      { detail: error instanceof Error ? error.message : 'Failed to generate citation' },
      { status: 500 }
    );
  }
}

