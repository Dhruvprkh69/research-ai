import io
from datetime import datetime
from typing import Any, Dict, Literal

import requests
import xmltodict


CitationStyle = Literal["APA", "MLA", "Chicago", "IEEE"]


class ArxivFetchError(Exception):
    """Raised when the arXiv API request fails."""


def _extract_arxiv_id(arxiv_url: str) -> str:
    """Return the trailing identifier from an arXiv URL."""
    if not arxiv_url:
        raise ValueError("ArXiv URL is required.")
    arxiv_url = arxiv_url.strip()
    if "/" not in arxiv_url:
        return arxiv_url
    return arxiv_url.rstrip("/").split("/")[-1]


def fetch_arxiv_entry(arxiv_url: str) -> Dict[str, Any]:
    """Fetch metadata for an arXiv paper."""
    arxiv_id = _extract_arxiv_id(arxiv_url)
    api_url = f"http://export.arxiv.org/api/query?id_list={arxiv_id}"
    response = requests.get(api_url, timeout=10)
    if response.status_code != 200:
        raise ArxivFetchError(f"Request failed with status {response.status_code}")
    data = xmltodict.parse(response.content)
    entry = data.get("feed", {}).get("entry")
    if not entry:
        raise ArxivFetchError("No entry found for the provided arXiv ID.")
    return entry


def _parse_year(paper_data: Dict[str, Any]) -> int:
    published_date = paper_data.get("published")
    if not published_date:
        raise ValueError("Published date missing in arXiv response.")
    return datetime.strptime(published_date, "%Y-%m-%dT%H:%M:%SZ").year


def _format_authors_for_apa(authors: Any) -> str:
    if isinstance(authors, list):
        names = [f"{author['name'].split()[-1]}, {author['name'][0]}." for author in authors]
        if len(names) == 1:
            return names[0]
        if len(names) == 2:
            return f"{names[0]} & {names[1]}"
        return ", ".join(names[:-1]) + f", & {names[-1]}"
    return f"{authors['name'].split()[-1]}, {authors['name'][0]}."


def _format_authors_last_first(authors: Any, joiner: str) -> str:
    if isinstance(authors, list):
        names = [f"{author['name'].split()[-1]}, {author['name'].split()[0]}" for author in authors]
        return joiner.join(names)
    return f"{authors['name'].split()[-1]}, {authors['name'].split()[0]}"


def _format_authors_for_ieee(authors: Any) -> str:
    if isinstance(authors, list):
        names = [f"{author['name'][0]}. {author['name'].split()[-1]}" for author in authors]
        return ", ".join(names)
    return f"{authors['name'][0]}. {authors['name'].split()[-1]}"


def format_citation(paper_data: Dict[str, Any], style: CitationStyle) -> str:
    """Return a formatted citation string in the desired style."""
    title = paper_data.get("title", "No title available").replace("\n", " ")
    authors = paper_data.get("author", [])
    year = _parse_year(paper_data)
    arxiv_id = paper_data.get("id", "").split("/")[-1]

    if style == "APA":
        authors_str = _format_authors_for_apa(authors)
        return f"{authors_str} ({year}). {title}. arXiv. https://arxiv.org/abs/{arxiv_id}"
    if style == "MLA":
        authors_str = _format_authors_last_first(authors, ", and ")
        return f'{authors_str}. "{title}." arXiv, {year}, https://arxiv.org/abs/{arxiv_id}.'
    if style == "Chicago":
        authors_str = _format_authors_last_first(authors, " and ")
        return f'{authors_str}. "{title}." {year}. arXiv. https://arxiv.org/abs/{arxiv_id}.'
    if style == "IEEE":
        authors_str = _format_authors_for_ieee(authors)
        return f'{authors_str}, "{title}," arXiv, {year}. [Online]. Available: https://arxiv.org/abs/{arxiv_id}.'
    raise ValueError(f"Unsupported citation style: {style}")


def build_download_buffer(citation: str) -> io.StringIO:
    """Return a buffer that can be served as a downloadable text file."""
    buffer = io.StringIO()
    buffer.write(citation)
    buffer.seek(0)
    return buffer

