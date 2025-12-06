import { NextRequest, NextResponse } from 'next/server';
import { extractTextFromPdf } from '@/lib/paperProcessing';
import { jobStore } from '@/lib/jobStore';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { detail: 'No file provided' },
        { status: 400 }
      );
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { detail: 'Only PDF files are supported' },
        { status: 400 }
      );
    }

    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > 20) {
      return NextResponse.json(
        { detail: 'PDF exceeds 20MB limit' },
        { status: 400 }
      );
    }

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Extract text from PDF
    const fullText = await extractTextFromPdf(buffer);
    if (!fullText || fullText.length === 0) {
      return NextResponse.json(
        { detail: 'Failed to extract text from PDF' },
        { status: 400 }
      );
    }

    // Limit text length to prevent issues (500KB of text max)
    const maxTextLength = 500000;
    const processedText = fullText.length > maxTextLength 
      ? fullText.substring(0, maxTextLength) + '\n\n[Text truncated due to length]'
      : fullText;

    // Store full text job
    const jobId = jobStore.createFullTextJob(processedText);

    return NextResponse.json({
      job_id: jobId,
      message: 'Document uploaded successfully. You can now ask questions about it.',
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { detail: error instanceof Error ? error.message : 'Failed to upload PDF' },
      { status: 500 }
    );
  }
}

