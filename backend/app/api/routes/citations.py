from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, HttpUrl

from services.citations import (
    ArxivFetchError,
    CitationStyle,
    fetch_arxiv_entry,
    format_citation,
)

router = APIRouter(prefix="/citations", tags=["citations"])


class CitationRequest(BaseModel):
    arxiv_url: HttpUrl
    style: CitationStyle


class CitationResponse(BaseModel):
    citation: str


@router.post("/", response_model=CitationResponse)
def create_citation(payload: CitationRequest):
    """Generate a citation for the provided arXiv URL."""
    try:
        # Convert HttpUrl to string
        arxiv_url_str = str(payload.arxiv_url)
        paper_data = fetch_arxiv_entry(arxiv_url_str)
        citation = format_citation(paper_data, payload.style)
        return CitationResponse(citation=citation)
    except (ArxivFetchError, ValueError) as exc:
        raise HTTPException(status_code=400, detail=str(exc))

