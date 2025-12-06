import { GoogleGenerativeAI } from '@google/generative-ai';

function getGeminiClient(): GoogleGenerativeAI {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error('GOOGLE_API_KEY not found in environment variables. Please create .env.local file with GOOGLE_API_KEY=your-key');
  }
  return new GoogleGenerativeAI(apiKey);
}

import pdfParse from 'pdf-parse';

export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  const data = await pdfParse(buffer);
  return data.text.trim();
}

export function splitTextIntoChunks(
  text: string,
  chunkSize: number = 5000,
  chunkOverlap: number = 500
): string[] {
  if (!text || text.length === 0) {
    return [];
  }

  // Ensure chunkOverlap is less than chunkSize to avoid infinite loops
  const overlap = Math.min(chunkOverlap, Math.floor(chunkSize / 2));
  const chunks: string[] = [];
  let start = 0;
  const maxChunks = Math.ceil(text.length / (chunkSize - overlap)) + 1; // Safety limit

  while (start < text.length && chunks.length < maxChunks) {
    const end = Math.min(start + chunkSize, text.length);
    const chunk = text.slice(start, end);
    
    if (chunk.length > 0) {
      chunks.push(chunk);
    }
    
    // Move start position forward
    const nextStart = end - overlap;
    if (nextStart <= start) {
      // Prevent infinite loop - move at least one character forward
      start = end;
    } else {
      start = nextStart;
    }
  }

  return chunks;
}

export async function generateSummary(text: string): Promise<string> {
  // Limit text length for Gemini (approximately 300K characters to stay within token limits)
  const maxTextForSummary = 300000;
  const textToSummarize = text.length > maxTextForSummary 
    ? text.substring(0, maxTextForSummary) + '\n\n[Document truncated for summary generation]'
    : text;

  const genAI = getGeminiClient();
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  
  const prompt = `
    You are an AI assistant specializing in creating detailed summaries of academic documents for literature reviews. 
    Your task is to summarize the document following these EXACT guidelines:

    1. Identify the main theories or concepts discussed

    Instruction:
    List only the theories, frameworks, or core concepts explicitly mentioned in the text.
    For each one, provide a one-sentence definition based only on the paper's explanation, not external knowledge.

    2. Summarize the key findings from relevant studies

    Instruction:
    Extract the findings the paper attributes to previous research.
    Do not generalize or add new findings.
    Present each finding as a short bullet (≤15 words), citing the study name or number when possible.

    3. Highlight areas of agreement or consensus in the research

    Instruction:
    Identify points where multiple studies or the authors consistently agree.
    Only include consensus explicitly stated or strongly implied in the text.
    Summaries must be ≤1 sentence per point.

    4. Summarize the methodologies used in the research

    Instruction:
    Describe the research methods used in this paper only, not in other studies.
    Mention only what is explicitly written: e.g., literature review, conceptual framework, case references.
    Keep the description objective and concise.

    5. Provide an overview of the potential implications of the research

    Instruction:
    List 3–5 implications clearly grounded in the authors' claims (not speculation).
    Explain implications in terms of impact on:
    - manufacturing
    - AI/ML
    - system design
    - future agentic systems (if mentioned)

    6. Suggest possible directions for future research based on the current literature

    Instruction:
    Only include directions that the authors mention or logically follow from explicitly identified gaps/challenges.
    Phrase each direction as a research question or actionable direction.

    7. If the paper describes an architecture, explain it stepwise

    Instruction:
    Describe the architecture exactly as defined in the paper, without adding components not mentioned.
    Break the architecture into steps/modules in the order used by the paper.
    Provide:
    - a one-sentence purpose of the architecture
    - step-by-step description
    - a short note on how each module interacts

    8. Mathematical Aspects (if applicable)

    Instruction:
    Describe and explain the key mathematical models, theorems, or equations used in the paper.
    For each equation, format it in LaTeX style using: $equation$

    Document text:
    ${textToSummarize}
    `;

  const result = await model.generateContent(prompt);
  const response = result.response;
  return response.text();
}

export function convertMathTokensToLatex(text: string): string {
  // Simple conversion - can be enhanced
  return text.replace(/\$\$([^$]+)\$\$/g, '$$$1$$');
}

export async function runQA(
  text: string,
  question: string,
  summary?: string
): Promise<string> {
  const genAI = getGeminiClient();
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const context = summary 
    ? `Document Summary:\n${summary}\n\nFull Document Text:\n${text}`
    : text;

  const prompt = `
    You are an AI research assistant. Use the provided context from research papers to answer the question as accurately as possible.
    
    IMPORTANT: The context includes a Document Summary section at the beginning. Check the summary FIRST - it contains key information about the document including mathematical equations, concepts, and findings.
    
    Instructions:
    1. First, check the Document Summary section - it often contains the answer you need.
    2. Then check the document chunks for additional details.
    3. If the question asks about a concept mentioned in the summary, use that information to answer.
    4. Include mathematical formulations, equations, or examples if they are in the context.
    5. Explain the concept clearly based on what the context says.
    6. Only respond with "The information is not available in the provided context" if you cannot find the answer anywhere in the context.

    Context: ${context}
    Question: ${question}
    Answer:
    `;

  const result = await model.generateContent(prompt);
  const response = result.response;
  return response.text();
}

export async function runQAFullText(
  fullText: string,
  question: string
): Promise<string> {
  const genAI = getGeminiClient();
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const prompt = `
    You are an AI research assistant. Answer the question based on the provided research paper text.
    Be comprehensive and detailed in your response. Include specific examples, equations, or concepts from the paper when relevant.

    Paper Text:
    ${fullText}

    Question: ${question}
    Answer:
    `;

  const result = await model.generateContent(prompt);
  const response = result.response;
  return response.text();
}

