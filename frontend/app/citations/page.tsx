'use client'

import { useState } from 'react'
import Link from 'next/link'

const CITATION_STYLES = ['APA', 'MLA', 'Chicago', 'IEEE'] as const

export default function CitationsPage() {
  const [arxivUrl, setArxivUrl] = useState('')
  const [style, setStyle] = useState<typeof CITATION_STYLES[number]>('APA')
  const [citation, setCitation] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleGenerate = async () => {
    if (!arxivUrl.trim()) {
      setError('Please enter an arXiv URL')
      return
    }

    setLoading(true)
    setError('')
    setCitation('')

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'
      const response = await fetch(`${apiUrl}/api/citations/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          arxiv_url: arxivUrl,
          style: style,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to generate citation')
      }

      const data = await response.json()
      setCitation(data.citation)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = () => {
    const blob = new Blob([citation], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'citation.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <main style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <Link href="/" style={{ display: 'inline-block', marginBottom: '2rem', color: '#1f77b4' }}>
        ← Back to Home
      </Link>

      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>📚 Multi-Style Citation Generator</h1>
      <p style={{ marginBottom: '2rem', color: '#666' }}>
        Generate citations for arXiv papers in APA, MLA, Chicago, or IEEE style.
      </p>

      <div style={{ background: 'white', padding: '2rem', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            arXiv Paper URL:
          </label>
          <input
            type="text"
            value={arxivUrl}
            onChange={(e) => setArxivUrl(e.target.value)}
            placeholder="https://arxiv.org/abs/2106.14834"
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '5px',
              border: '1px solid #ddd',
              fontSize: '1rem',
            }}
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Citation Style:
          </label>
          <select
            value={style}
            onChange={(e) => setStyle(e.target.value as typeof CITATION_STYLES[number])}
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '5px',
              border: '1px solid #ddd',
              fontSize: '1rem',
            }}
          >
            {CITATION_STYLES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading}
          style={{
            width: '100%',
            padding: '0.75rem',
            background: loading ? '#ccc' : '#1f77b4',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            fontSize: '1rem',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Generating...' : 'Generate Citation'}
        </button>

        {error && (
          <div style={{ marginTop: '1rem', padding: '1rem', background: '#fee', color: '#c33', borderRadius: '5px' }}>
            {error}
          </div>
        )}

        {citation && (
          <div style={{ marginTop: '2rem' }}>
            <h2 style={{ marginBottom: '1rem' }}>{style} Citation:</h2>
            <div style={{ padding: '1rem', background: '#f9f9f9', borderRadius: '5px', marginBottom: '1rem', whiteSpace: 'pre-wrap' }}>
              {citation}
            </div>
            <button
              onClick={handleDownload}
              style={{
                padding: '0.5rem 1rem',
                background: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
              }}
            >
              Download Citation as TXT
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
