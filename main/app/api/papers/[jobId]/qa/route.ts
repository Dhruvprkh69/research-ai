import { NextRequest, NextResponse } from 'next/server';
import { runQA } from '@/lib/paperProcessing';
import { jobStore } from '@/lib/jobStore';

export async function POST(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const { jobId } = params;
    const body = await request.json();
    const { question } = body;

    if (!question) {
      return NextResponse.json(
        { detail: 'Question is required' },
        { status: 400 }
      );
    }

    const job = jobStore.getPaperJob(jobId);
    if (!job) {
      return NextResponse.json(
        { detail: 'Session expired. The document was processed but the session is no longer available. Please upload the document again.' },
        { status: 404 }
      );
    }

    // Use the stored text and summary for Q&A
    // For simplicity, we'll use the full text (can be optimized with vector search later)
    const answer = await runQA(job.text, question, job.summary);

    return NextResponse.json({
      answer,
    });
  } catch (error) {
    console.error('QA error:', error);
    return NextResponse.json(
      { detail: error instanceof Error ? error.message : 'Failed to get answer' },
      { status: 500 }
    );
  }
}

