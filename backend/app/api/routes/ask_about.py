import io

from fastapi import APIRouter, File, HTTPException, UploadFile
from pydantic import BaseModel

from services.paper_processing import (
    configure_gemini,
    extract_text_from_pdf,
    run_qa_full_text,
)

from ...core.cache import job_store

# Configure Gemini on module import
try:
    configure_gemini()
except Exception as e:
    print(f"Warning: Gemini configuration failed: {e}")

router = APIRouter(prefix="/ask-about", tags=["ask-about"])

MAX_FILE_SIZE_MB = 20
MAX_QUESTIONS = 5


class UploadResponse(BaseModel):
    job_id: str
    message: str


class QuestionRequest(BaseModel):
    question: str


class AnswerResponse(BaseModel):
    answer: str
    questions_remaining: int


@router.post("/upload", response_model=UploadResponse)
async def upload_paper(file: UploadFile = File(...)):
    """Upload a paper for full-text Q&A (5 questions limit)."""
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    contents = await file.read()
    file_size_mb = len(contents) / (1024 * 1024)
    if file_size_mb > MAX_FILE_SIZE_MB:
        raise HTTPException(status_code=400, detail="PDF exceeds 20MB limit.")

    pdf_buffer = io.BytesIO(contents)
    full_text = extract_text_from_pdf(pdf_buffer)
    if not full_text:
        raise HTTPException(status_code=400, detail="Failed to extract text from PDF.")

    job_id = job_store.create_full_text_job(full_text=full_text)
    return UploadResponse(
        job_id=job_id,
        message=f"Paper uploaded successfully. You can ask up to {MAX_QUESTIONS} questions."
    )


@router.post("/{job_id}/qa", response_model=AnswerResponse)
def ask_question(job_id: str, payload: QuestionRequest):
    """Ask a question about the uploaded paper (full text analysis)."""
    job = job_store.get_full_text_job(job_id)
    if not job:
        raise HTTPException(
            status_code=404,
            detail="Session expired. The document was processed but the session is no longer available. Please upload the document again."
        )

    # Check question limit
    if job.question_count >= MAX_QUESTIONS:
        raise HTTPException(
            status_code=400,
            detail=f"You have reached the maximum limit of {MAX_QUESTIONS} questions. Please upload the paper again to ask more questions."
        )

    # Increment question count
    questions_remaining = MAX_QUESTIONS - job_store.increment_question_count(job_id)

    # Get answer using full text
    answer = run_qa_full_text(job.full_text, payload.question)

    return AnswerResponse(
        answer=answer,
        questions_remaining=questions_remaining
    )

