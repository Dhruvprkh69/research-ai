from dataclasses import dataclass
from typing import Dict, Optional
from uuid import uuid4

from langchain_community.vectorstores import FAISS


@dataclass
class PaperJob:
    summary: str
    vector_store: FAISS


@dataclass
class FullTextJob:
    full_text: str
    question_count: int = 0


class InMemoryJobStore:
    """Lightweight in-memory cache for processed papers."""

    def __init__(self) -> None:
        self._jobs: Dict[str, PaperJob] = {}
        self._full_text_jobs: Dict[str, FullTextJob] = {}

    def create_job(self, summary: str, vector_store: FAISS) -> str:
        job_id = uuid4().hex
        self._jobs[job_id] = PaperJob(summary=summary, vector_store=vector_store)
        return job_id

    def get_job(self, job_id: str) -> Optional[PaperJob]:
        return self._jobs.get(job_id)

    def delete_job(self, job_id: str) -> None:
        self._jobs.pop(job_id, None)

    def create_full_text_job(self, full_text: str) -> str:
        job_id = uuid4().hex
        self._full_text_jobs[job_id] = FullTextJob(full_text=full_text, question_count=0)
        return job_id

    def get_full_text_job(self, job_id: str) -> Optional[FullTextJob]:
        return self._full_text_jobs.get(job_id)

    def increment_question_count(self, job_id: str) -> int:
        job = self._full_text_jobs.get(job_id)
        if job:
            job.question_count += 1
            return job.question_count
        return 0

    def delete_full_text_job(self, job_id: str) -> None:
        self._full_text_jobs.pop(job_id, None)


job_store = InMemoryJobStore()

