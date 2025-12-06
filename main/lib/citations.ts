import axios from 'axios';

export async function generateCitation(arxivUrl: string, style: string): Promise<string> {
  try {
    // Extract arXiv ID from URL
    const arxivIdMatch = arxivUrl.match(/arxiv\.org\/(?:abs|pdf)\/(\d{4}\.\d{4,5})(?:v\d+)?/);
    if (!arxivIdMatch) {
      throw new Error('Invalid arXiv URL format');
    }
    const arxivId = arxivIdMatch[1];

    // Fetch metadata from arXiv API
    const response = await axios.get(`https://export.arxiv.org/api/query?id_list=${arxivId}`);
    const xmlData = response.data;

    // Parse XML (simple parsing - can be improved)
    const titleMatch = xmlData.match(/<title>(.*?)<\/title>/s);
    const authorsMatch = xmlData.match(/<author>[\s\S]*?<name>(.*?)<\/name>[\s\S]*?<\/author>/g);
    const publishedMatch = xmlData.match(/<published>(.*?)<\/published>/);
    const summaryMatch = xmlData.match(/<summary>(.*?)<\/summary>/s);

    const title = titleMatch ? titleMatch[1].replace(/\n/g, ' ').trim() : 'Unknown Title';
    const authors = authorsMatch 
      ? authorsMatch.map((m: string) => m.match(/<name>(.*?)<\/name>/)?.[1] || '').filter(Boolean)
      : ['Unknown Author'];
    const published = publishedMatch ? publishedMatch[1].split('T')[0] : 'Unknown Date';
    const year = published.split('-')[0];

    // Generate citation based on style
    switch (style.toUpperCase()) {
      case 'APA':
        return `${authors.slice(0, 5).join(', ')}${authors.length > 5 ? ', et al.' : ''} (${year}). ${title}. arXiv preprint arXiv:${arxivId}.`;

      case 'MLA':
        return `${authors[0]}${authors.length > 1 ? ', et al' : ''}. "${title}." arXiv preprint arXiv:${arxivId} (${year}).`;

      case 'CHICAGO':
        return `${authors.slice(0, 5).join(', ')}${authors.length > 5 ? ', et al.' : ''}. "${title}." arXiv preprint arXiv:${arxivId} (${year}).`;

      case 'IEEE':
        return `${authors.slice(0, 6).join(', ')}${authors.length > 6 ? ', et al.' : ''}, "${title}," arXiv preprint arXiv:${arxivId}, ${year}.`;

      default:
        return `${authors.join(', ')} (${year}). ${title}. arXiv:${arxivId}`;
    }
  } catch (error) {
    throw new Error(`Failed to generate citation: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

