import streamlit as st
from services.citations import (
    ArxivFetchError,
    CitationStyle,
    build_download_buffer,
    fetch_arxiv_entry,
    format_citation,
)

# Main function to be called from other scripts
def main():
    st.title("📚 Multi-Style Citation Generator")
    st.write("Generate citations for arXiv papers in APA, MLA, Chicago, or IEEE style.")

    # Input field for arXiv link
    arxiv_url = st.text_input("Enter the arXiv Paper URL:")

    # Dropdown for citation style
    citation_style: CitationStyle = st.selectbox(
        "Select Citation Style", ["APA", "MLA", "Chicago", "IEEE"]
    )

    # Generate citation button
    if st.button("Generate Citation"):
        if not arxiv_url:
            st.error("Please enter a valid arXiv URL.")
            return

        try:
            paper_data = fetch_arxiv_entry(arxiv_url)
            citation = format_citation(paper_data, citation_style)
        except (ArxivFetchError, ValueError) as exc:
            st.error(f"Could not retrieve data: {exc}")
            return

        st.subheader(f"{citation_style} Citation:")
        st.write(citation)

        buffer = build_download_buffer(citation)
        st.download_button(
            label="Download Citation as TXT",
            data=buffer.getvalue(),
            file_name="citation.txt",
            mime="text/plain"
        )

# Check if the file is being run directly or imported
if __name__ == "__main__":
    main()
