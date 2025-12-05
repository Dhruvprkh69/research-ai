import logging
import os
import re
from typing import List, Optional

import google.generativeai as genai
from dotenv import load_dotenv
from langchain.chains.question_answering import load_qa_chain
from langchain.prompts import PromptTemplate
from langchain.schema import Document
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_google_genai import ChatGoogleGenerativeAI
from PyPDF2 import PdfReader

logger = logging.getLogger(__name__)


def configure_gemini() -> None:
    """Configure the Gemini client using GOOGLE_API_KEY from env."""
    load_dotenv()
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise ValueError("GOOGLE_API_KEY not found in environment.")
    genai.configure(api_key=api_key)


def extract_text_from_pdf(pdf_doc) -> str:
    """Extract plain text from an uploaded PDF document."""
    text = ""
    pdf_reader = PdfReader(pdf_doc)
    for page in pdf_reader.pages:
        text += page.extract_text() or ""
    return text.strip()


def split_text_into_chunks(text: str, chunk_size: int = 5000, chunk_overlap: int = 500) -> List[str]:
    """Split large text into overlapping chunks."""
    splitter = RecursiveCharacterTextSplitter(chunk_size=chunk_size, chunk_overlap=chunk_overlap)
    return splitter.split_text(text)


def build_vector_store(chunks: List[str]) -> Optional[FAISS]:
    """Create a FAISS vector store from text chunks."""
    if not chunks:
        return None
    embeddings = HuggingFaceEmbeddings()
    return FAISS.from_texts(chunks, embedding=embeddings)


def generate_summary(text: str, model_name: str = "gemini-2.0-flash") -> str:
    """Generate a literature-style summary for the provided text."""
    prompt = f"""
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
    {text}
    """
    model = genai.GenerativeModel(model_name)
    response = model.generate_content(prompt)
    return response.text.strip()


def build_qa_chain(model_name: str = "gemini-2.0-flash", temperature: float = 0.3):
    """Create a LangChain QA chain backed by Gemini."""
    prompt_template = """
    You are an AI research assistant. Use the provided context from research papers to answer the question as accurately as possible.
    
    IMPORTANT: The context includes a Document Summary section at the beginning. Check the summary FIRST - it contains key information about the document including mathematical equations, concepts, and findings.
    
    Instructions:
    1. First, check the Document Summary section - it often contains the answer you need.
    2. Then check the document chunks for additional details.
    3. If the question asks about a concept mentioned in the summary, use that information to answer.
    4. Include mathematical formulations, equations, or examples if they are in the context.
    5. Explain the concept clearly based on what the context says.
    6. Only respond with "The information is not available in the provided context" if you cannot find the answer anywhere in the context.

    Context: {context}
    Question: {question}
    Answer:
    """
    model = ChatGoogleGenerativeAI(model=model_name, temperature=temperature)
    prompt = PromptTemplate(template=prompt_template, input_variables=["context", "question"])
    return load_qa_chain(llm=model, chain_type="stuff", prompt=prompt)


def run_qa(vector_store: FAISS, question: str, chain, summary: str = None) -> str:
    """Run a QA query against the stored document chunks.
    
    Args:
        vector_store: FAISS vector store with document chunks
        question: User's question
        chain: QA chain for processing
        summary: Optional summary of the document (like ChatGPT conversation context)
    """
    # Get relevant chunks from vector store (simple approach like original)
    docs = vector_store.similarity_search(question, k=5)
    
    # IMPORTANT: Include summary FIRST in context (like ChatGPT conversation memory)
    # This ensures Gemini knows what it summarized earlier and checks it first
    context_docs = []
    if summary:
        # Add summary as the FIRST document with clear label
        summary_doc = Document(
            page_content=f"=== DOCUMENT SUMMARY (Check this first) ===\n\n{summary}\n\n=== END OF SUMMARY ===\n\n=== DOCUMENT CHUNKS ===\n",
            metadata={"source": "summary", "type": "summary"}
        )
        context_docs.append(summary_doc)
    
    # Add document chunks after summary
    context_docs.extend(docs)
    
    response = chain({"input_documents": context_docs, "question": question}, return_only_outputs=True)
    return response["output_text"]


def run_qa_full_text(full_text: str, question: str, model_name: str = "gemini-2.0-flash", temperature: float = 0.3) -> str:
    """Run a QA query using full paper text (like summary generation approach).
    
    Args:
        full_text: Complete text of the research paper
        question: User's question
        model_name: Gemini model to use
        temperature: Model temperature
    """
    prompt = f"""
    You are an AI research assistant. Based on the following research paper, answer the user's question in detail.
    
    Question: {question}
    
    Instructions:
    1. Analyze the full paper text to find the answer.
    2. Provide a comprehensive and detailed answer based on what is written in the paper.
    3. Include specific details, examples, mathematical formulations, or equations if mentioned in the paper.
    4. If the question asks about research gaps, contributions, methodology, findings, or conclusions, provide detailed information from the paper.
    5. Cite specific sections or concepts from the paper when relevant.
    6. Only respond with "The information is not available in the provided paper" if you cannot find the answer anywhere in the paper text.
    
    Research Paper Text:
    {full_text}
    
    Answer:
    """
    model = genai.GenerativeModel(model_name)
    response = model.generate_content(prompt)
    return response.text.strip()


def convert_math_tokens_to_latex(text: str) -> str:
    """Convert common math tokens to LaTeX equivalents."""
    patterns = {
        r"(\d+)\^(\d+)": r"\1^{\2}",
        r"(\d+)_(\d+)": r"\1_{\2}",
        r"sigma": r"\\sigma",
        r"alpha": r"\\alpha",
        r"beta": r"\\beta",
        r"gamma": r"\\gamma",
        r"delta": r"\\delta",
        r"epsilon": r"\\epsilon",
        r"lambda": r"\\lambda",
        r"mu": r"\\mu",
        r"pi": r"\\pi",
        r"omega": r"\\omega",
        r"\\frac": r"\\frac",
        r"\\sum": r"\\sum",
        r"\\prod": r"\\prod",
        r"\\int": r"\\int",
        r"\\sqrt": r"\\sqrt",
        r"\\infty": r"\\infty",
        r"\\partial": r"\\partial",
        r"\\nabla": r"\\nabla",
        r"\\cdot": r"\\cdot",
        r"\\times": r"\\times",
        r"\\div": r"\\div",
        r"\\pm": r"\\pm",
        r"\\leq": r"\\leq",
        r"\\geq": r"\\geq",
        r"\\neq": r"\\neq",
        r"\\approx": r"\\approx",
        r"\\propto": r"\\propto",
        r"\\in": r"\\in",
        r"\\subset": r"\\subset",
        r"\\cup": r"\\cup",
        r"\\cap": r"\\cap",
    }
    for pattern, replacement in patterns.items():
        text = re.sub(pattern, replacement, text, flags=re.IGNORECASE)
    return text