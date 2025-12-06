import { NextRequest, NextResponse } from 'next/server';
import { runQAFullText } from '@/lib/paperProcessing';
import { jobStore } from '@/lib/jobStore';

const MAX_QUESTIONS = 5;

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

    const job = jobStore.getFullTextJob(jobId);
    if (!job) {
      return NextResponse.json(
        { detail: 'Session expired. Please upload the document again.' },
        { status: 404 }
      );
    }

    // Check question limit
    if (job.questionCount >= MAX_QUESTIONS) {
      return NextResponse.json(
        { detail: `Question limit reached. Maximum ${MAX_QUESTIONS} questions per document.` },
        { status: 400 }
      );
    }

    // Increment question count
    const newCount = jobStore.incrementQuestionCount(jobId);
    const questionsRemaining = MAX_QUESTIONS - newCount;

    // Get answer
    const answer = await runQAFullText(job.fullText, question);

    return NextResponse.json({
      answer,
      questions_remaining: questionsRemaining,
    });
  } catch (error) {
    console.error('QA error:', error);
    return NextResponse.json(
      { detail: error instanceof Error ? error.message : 'Failed to get answer' },
      { status: 500 }
    );
  }
}

