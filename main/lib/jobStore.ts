import { v4 as uuidv4 } from 'uuid';

// In-memory job store for processed papers
export interface PaperJob {
  summary: string;
  text: string;
  chunks: string[];
  questionCount?: number;
}

export interface FullTextJob {
  fullText: string;
  questionCount: number;
}

class JobStore {
  private papers: Map<string, PaperJob> = new Map();
  private fullTextJobs: Map<string, FullTextJob> = new Map();

  createPaperJob(summary: string, text: string, chunks: string[]): string {
    const jobId = uuidv4();
    this.papers.set(jobId, { summary, text, chunks });
    return jobId;
  }

  getPaperJob(jobId: string): PaperJob | undefined {
    return this.papers.get(jobId);
  }

  deletePaperJob(jobId: string): void {
    this.papers.delete(jobId);
  }

  createFullTextJob(fullText: string): string {
    const jobId = uuidv4();
    this.fullTextJobs.set(jobId, { fullText, questionCount: 0 });
    return jobId;
  }

  getFullTextJob(jobId: string): FullTextJob | undefined {
    return this.fullTextJobs.get(jobId);
  }

  incrementQuestionCount(jobId: string): number {
    const job = this.fullTextJobs.get(jobId);
    if (job) {
      job.questionCount += 1;
      return job.questionCount;
    }
    return 0;
  }

  deleteFullTextJob(jobId: string): void {
    this.fullTextJobs.delete(jobId);
  }
}

// Singleton instance
export const jobStore = new JobStore();

