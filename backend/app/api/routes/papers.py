import io

from fastapi import APIRouter, File, HTTPException, UploadFile
from pydantic import BaseModel

from services.paper_processing import (
    build_qa_chain,
    build_vector_store,
    configure_gemini,
    convert_math_tokens_to_latex,
    extract_text_from_pdf,
    generate_summary as generate_summary_content,
    run_qa,
    split_text_into_chunks,
)

from ...core.cache import job_store

# Configure Gemini on module import
try:
    configure_gemini()
except Exception as e:
    print(f"Warning: Gemini configuration failed: {e}")

router = APIRouter(prefix="/papers", tags=["papers"])

MAX_FILE_SIZE_MB = 20


class UploadResponse(BaseModel):
    job_id: str
    summary: str


class QuestionRequest(BaseModel):
    question: str


class AnswerResponse(BaseModel):
    answer: str


@router.post("/upload", response_model=UploadResponse)
async def upload_paper(file: UploadFile = File(...)):
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    contents = await file.read()
    file_size_mb = len(contents) / (1024 * 1024)
    if file_size_mb > MAX_FILE_SIZE_MB:
        raise HTTPException(status_code=400, detail="PDF exceeds 20MB limit.")

    pdf_buffer = io.BytesIO(contents)
    text = extract_text_from_pdf(pdf_buffer)
    if not text:
        raise HTTPException(status_code=400, detail="Failed to extract text from PDF.")

    chunks = split_text_into_chunks(text)
    vector_store = build_vector_store(chunks)
    if vector_store is None:
        raise HTTPException(status_code=500, detail="Failed to build vector store.")

    summary = generate_summary_content(text)
    formatted_summary = convert_math_tokens_to_latex(summary)

    job_id = job_store.create_job(summary=formatted_summary, vector_store=vector_store)
    return UploadResponse(job_id=job_id, summary=formatted_summary)


@router.post("/{job_id}/qa", response_model=AnswerResponse)
def ask_question(job_id: str, payload: QuestionRequest):
    job = job_store.get_job(job_id)
    if not job:
        raise HTTPException(
            status_code=404, 
            detail="Session expired. The document was processed but the session is no longer available. Please upload the document again."
        )

    chain = build_qa_chain()
    if chain is None:
        raise HTTPException(status_code=500, detail="QA chain initialization failed.")

    # Pass summary to run_qa so Gemini has conversation context (like ChatGPT)
    answer = run_qa(job.vector_store, payload.question, chain, summary=job.summary)
    return AnswerResponse(answer=answer)

