import re
from typing import List, Optional

import streamlit as st
from langchain_community.vectorstores import FAISS

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

try:
    configure_gemini()
except Exception as exc:
    st.error(f"❌ Gemini configuration failed: {exc}")
    st.stop()

@st.cache_data
def get_pdf_text(pdf_doc) -> str:
    """Extract text from PDF document."""
    try:
        text = extract_text_from_pdf(pdf_doc)
        if not text.strip():
            st.warning("⚠️ The PDF appears to be empty or unreadable.")
        return text
    except Exception as e:
        st.error(f"❌ Error reading PDF: {str(e)}")
        return ""

@st.cache_data
def get_text_chunks(text: str) -> List[str]:
    """Split text into chunks for processing."""
    try:
        chunks = split_text_into_chunks(text)
        if not chunks:
            st.warning("⚠️ No text chunks were generated. The document might be too short or empty.")
        return chunks
    except Exception as e:
        st.error(f"❌ Error splitting text: {str(e)}")
        return []

@st.cache_resource
def get_vector_store(chunks: List[str]) -> Optional[FAISS]:
    """Create vector store from text chunks."""
    try:
        if not chunks:
            return None
        return build_vector_store(chunks)
    except Exception as e:
        st.error(f"❌ Error creating vector store: {str(e)}")
        return None

@st.cache_data
def generate_summary(text: str) -> str:
    """Generate summary from text using Gemini model."""
    try:
        if not text.strip():
            return "No text available for summarization."
        return generate_summary_content(text)
    except Exception as e:
        st.error(f"❌ Error generating summary: {str(e)}")
        return "Error generating summary. Please try again."

@st.cache_resource
def get_qa_chain():
    """Create QA chain for question answering."""
    try:
        return build_qa_chain()
    except Exception as e:
        st.error(f"❌ Error creating QA chain: {str(e)}")
        return None

def process_document(pdf_doc) -> None:
    """Process uploaded document."""
    with st.spinner("Your Research Paper is getting processed..."):
        try:
            st.session_state.raw_text = get_pdf_text(pdf_doc)
            if not st.session_state.raw_text:
                st.error("❌ Failed to extract text from the PDF.")
                return
                
            text_chunks = get_text_chunks(st.session_state.raw_text)
            if not text_chunks:
                st.error("❌ Failed to create text chunks.")
                return

            st.session_state.vector_store = get_vector_store(text_chunks)
            if not st.session_state.vector_store:
                st.error("❌ Failed to create vector store.")
                return

            st.success("✅ Document processed successfully!")
        except Exception as e:
            st.error(f"❌ Error processing document: {str(e)}")

def generate_document_summary() -> None:
    """Generate document summary."""
    with st.spinner("Your Summary is getting generated..."):
        try:
            if not st.session_state.raw_text:
                st.error("❌ No document text available for summarization.")
                return

            summary_text = generate_summary(st.session_state.raw_text)
            st.session_state.summary = convert_math_tokens_to_latex(summary_text)
            st.success("✅ Summary generated!")
        except Exception as e:
            st.error(f"❌ Error generating summary: {str(e)}")

def answer_question(question: str) -> Optional[str]:
    """Answer questions about the document."""
    if not st.session_state.vector_store:
        st.error("❌ Please upload a document first.")
        return None

    with st.spinner("Thinking..."):
        try:
            chain = get_qa_chain()
            if not chain:
                st.error("❌ Failed to create QA chain.")
                return None

            # Pass summary to run_qa so Gemini has conversation context (like ChatGPT)
            summary = st.session_state.get('summary', '')
            return run_qa(st.session_state.vector_store, question, chain, summary=summary)
        except Exception as e:
            st.error(f"❌ Error answering question: {str(e)}")
            return None

def display_summary_with_latex(summary: str):
    """Display the summary with LaTeX support for equations."""
    # Split the summary into sections
    sections = summary.split('\n\n')
    
    for section in sections:
        if section.strip():
            # Check if this is a main section header (starts with a number and dot)
            if re.match(r'^\d+\.', section.strip()):
                # Extract the header text without the number
                header_text = re.sub(r'^\d+\.\s*', '', section.strip())
                st.markdown(f"## {header_text}")
                continue
            
            # Split into paragraphs
            paragraphs = section.split('\n')
            for para in paragraphs:
                if para.strip():
                    # Check if this is a subheading (starts with a dash or bullet point)
                    if para.strip().startswith(('-', '•', '*', '1.', '2.', '3.')):
                        st.markdown(f"**{para.strip().lstrip('-•* ')}**")
                        continue
                    
                    # Check for LaTeX-style equations
                    if '$' in para:
                        # Extract and display equations
                        equations = re.findall(r'\$(.*?)\$', para)
                        for eq in equations:
                            st.latex(eq)
                        # Display the rest of the paragraph without equations
                        text = re.sub(r'\$.*?\$', '', para)
                        if text.strip():
                            st.write(text)
                    else:
                        st.write(para)

def main():
    st.title("📄 Understand Any Research Paper")
    
    # Initialize session state
    if 'vector_store' not in st.session_state:
        st.session_state.vector_store = None
    if 'raw_text' not in st.session_state:
        st.session_state.raw_text = ""
    if 'summary' not in st.session_state:
        st.session_state.summary = ""

    with st.sidebar:
        st.header("Document Upload")
        pdf_doc = st.file_uploader("Upload your Research Documentation (PDF)", type="pdf")
        
        if pdf_doc:
            process_document(pdf_doc)
            if st.button("Generate Document Summary"):
                generate_document_summary()

    if st.session_state.summary:
        st.header("Document Summary (Literature Review Style)")
        display_summary_with_latex(st.session_state.summary)
    
    st.header("Ask research-related questions about the document")
    question = st.text_input("Enter your question:")
    
    if question:
        answer = answer_question(question)
        if answer:
            st.subheader("Answer:")
            st.write(answer)

if __name__ == "__main__":
    main()
