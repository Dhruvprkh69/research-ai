'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'

export default function UnderstandPage() {
  const [file, setFile] = useState<File | null>(null)
  const [jobId, setJobId] = useState<string | null>(null)
  const [summary, setSummary] = useState('')
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(false)
  const [qaLoading, setQaLoading] = useState(false)
  const [error, setError] = useState('')
  const [copySuccess, setCopySuccess] = useState(false)
  const summaryRef = useRef<HTMLDivElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setSummary('')
      setJobId(null)
      setAnswer('')
    }
  }

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a PDF file')
      return
    }

    if (file.size > 20 * 1024 * 1024) {
      setError('File size must be less than 20MB')
      return
    }

    setLoading(true)
    setError('')
    setSummary('')

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/papers/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to upload and process PDF')
      }

      const data = await response.json()
      setJobId(data.job_id)
      setSummary(data.summary)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  // Preprocess summary to ensure proper markdown formatting
  const preprocessSummary = (text: string): string => {
    // Ensure LaTeX equations are properly formatted
    // Replace escaped backslashes in LaTeX
    let processed = text.replace(/\\multimodal/g, 'multimodal')
    processed = processed.replace(/\\multiple/g, 'multiple')
    processed = processed.replace(/\\sigma/g, '\\sigma')
    processed = processed.replace(/\\alpha/g, '\\alpha')
    // Ensure markdown bold is properly formatted
    processed = processed.replace(/\*\*([^*]+)\*\*/g, '**$1**')
    return processed
  }

  const handleAskQuestion = async () => {
    if (!question.trim() || !jobId) {
      setError('Please upload a document first and enter a question')
      return
    }

    setQaLoading(true)
    setError('')
    setAnswer('')

    try {
      const response = await fetch(`/api/papers/${jobId}/qa`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        
        // Handle 404 - Job expired (server reloaded)
        if (response.status === 404) {
          setError('Session expired. Please upload the document again to continue asking questions.')
          setJobId(null) // Clear job ID so user knows to re-upload
          setSummary('') // Clear summary
          setAnswer('')
          return
        }
        
        throw new Error(errorData.detail || 'Failed to get answer')
      }

      const data = await response.json()
      setAnswer(data.answer)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setQaLoading(false)
    }
  }

  const handleCopySummary = async () => {
    try {
      await navigator.clipboard.writeText(summary)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (err) {
      setError('Failed to copy summary')
    }
  }


  return (
    <main style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <Link href="/" style={{ display: 'inline-block', marginBottom: '2rem', color: '#1f77b4' }}>
        ← Back to Home
      </Link>

      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>📄 Understand Any Research Paper</h1>

      <div style={{ background: 'white', padding: '2rem', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>Upload Research Paper (PDF)</h2>
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          style={{ marginBottom: '1rem', display: 'block' }}
        />
        {file && (
          <p style={{ marginBottom: '1rem', color: '#666' }}>
            Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
          </p>
        )}
        <button
          onClick={handleUpload}
          disabled={loading || !file}
          style={{
            padding: '0.75rem 1.5rem',
            background: loading || !file ? '#ccc' : '#1f77b4',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: loading || !file ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Processing...' : 'Upload & Process'}
        </button>

        {error && (
          <div style={{ marginTop: '1rem', padding: '1rem', background: '#fee', color: '#c33', borderRadius: '5px' }}>
            {error}
          </div>
        )}
      </div>

      {summary && (
        <div style={{ background: 'white', padding: '2rem', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ margin: 0 }}>Document Summary (Literature Review Style)</h2>
            <button
              onClick={handleCopySummary}
              style={{
                padding: '0.5rem 1rem',
                background: copySuccess ? '#28a745' : '#1f77b4',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'background 0.2s',
              }}
              title="Copy summary to clipboard"
            >
              {copySuccess ? '✅ Copied!' : '📋 Copy'}
            </button>
          </div>
          <div ref={summaryRef} style={{ lineHeight: '1.8', fontSize: '1rem', color: '#333' }}>
            <ReactMarkdown
              remarkPlugins={[remarkMath]}
              rehypePlugins={[rehypeKatex]}
              components={{
                h1: ({node, ...props}) => <h1 style={{ marginTop: '2rem', marginBottom: '1rem', color: '#1f77b4', fontSize: '1.8rem', fontWeight: 'bold' }} {...props} />,
                h2: ({node, ...props}) => <h2 style={{ marginTop: '1.5rem', marginBottom: '0.75rem', color: '#1f77b4', fontSize: '1.5rem', fontWeight: 'bold' }} {...props} />,
                h3: ({node, ...props}) => <h3 style={{ marginTop: '1.25rem', marginBottom: '0.5rem', color: '#2c3e50', fontSize: '1.25rem', fontWeight: 'bold' }} {...props} />,
                h4: ({node, ...props}) => <h4 style={{ marginTop: '1rem', marginBottom: '0.5rem', color: '#2c3e50', fontSize: '1.1rem', fontWeight: 'bold' }} {...props} />,
                p: ({node, ...props}) => <p style={{ marginBottom: '1rem', lineHeight: '1.8' }} {...props} />,
                ul: ({node, ...props}) => <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem', lineHeight: '1.8' }} {...props} />,
                ol: ({node, ...props}) => <ol style={{ marginLeft: '1.5rem', marginBottom: '1rem', lineHeight: '1.8' }} {...props} />,
                li: ({node, ...props}) => <li style={{ marginBottom: '0.5rem', lineHeight: '1.8' }} {...props} />,
                strong: ({node, ...props}) => <strong style={{ fontWeight: 'bold', color: '#2c3e50' }} {...props} />,
                em: ({node, ...props}) => <em style={{ fontStyle: 'italic' }} {...props} />,
                code: ({node, inline, ...props}: any) => 
                  inline ? (
                    <code style={{ background: '#f4f4f4', padding: '0.2rem 0.4rem', borderRadius: '3px', fontSize: '0.9em', fontFamily: 'monospace' }} {...props} />
                  ) : (
                    <code style={{ display: 'block', background: '#f4f4f4', padding: '1rem', borderRadius: '5px', overflow: 'auto', fontSize: '0.9em', fontFamily: 'monospace' }} {...props} />
                  ),
              }}
            >
              {preprocessSummary(summary)}
            </ReactMarkdown>
          </div>
        </div>
      )}

      {jobId && (
        <div style={{ background: 'white', padding: '2rem', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h2 style={{ marginBottom: '1rem' }}>Ask Questions</h2>
          <p style={{ marginBottom: '1rem', color: '#666', fontSize: '0.9rem' }}>
            Ask questions related to this summary. The system will search through the document chunks to provide detailed answers.
          </p>
          <div style={{ marginBottom: '1rem' }}>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Enter your question about the document..."
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '5px',
                border: '1px solid #ddd',
                fontSize: '1rem',
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') handleAskQuestion()
              }}
            />
          </div>
          <button
            onClick={handleAskQuestion}
            disabled={qaLoading || !question.trim()}
            style={{
              padding: '0.75rem 1.5rem',
              background: qaLoading || !question.trim() ? '#ccc' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: qaLoading || !question.trim() ? 'not-allowed' : 'pointer',
            }}
          >
            {qaLoading ? 'Thinking...' : 'Ask Question'}
          </button>

          {answer && (
            <div style={{ marginTop: '1.5rem', padding: '1.5rem', background: '#f9f9f9', borderRadius: '5px' }}>
              <h3 style={{ marginBottom: '1rem', color: '#1f77b4' }}>Answer:</h3>
              <div style={{ lineHeight: '1.8', fontSize: '1rem', color: '#333' }}>
                <ReactMarkdown
                  remarkPlugins={[remarkMath]}
                  rehypePlugins={[rehypeKatex]}
                  components={{
                    h2: ({node, ...props}) => <h2 style={{ marginTop: '1.5rem', marginBottom: '0.75rem', color: '#1f77b4', fontSize: '1.5rem', fontWeight: 'bold' }} {...props} />,
                    h3: ({node, ...props}) => <h3 style={{ marginTop: '1.25rem', marginBottom: '0.5rem', color: '#2c3e50', fontSize: '1.25rem', fontWeight: 'bold' }} {...props} />,
                    h4: ({node, ...props}) => <h4 style={{ marginTop: '1rem', marginBottom: '0.5rem', color: '#2c3e50', fontSize: '1.1rem', fontWeight: 'bold' }} {...props} />,
                    p: ({node, ...props}) => <p style={{ marginBottom: '1rem', lineHeight: '1.8' }} {...props} />,
                    ul: ({node, ...props}) => <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem', lineHeight: '1.8' }} {...props} />,
                    ol: ({node, ...props}) => <ol style={{ marginLeft: '1.5rem', marginBottom: '1rem', lineHeight: '1.8' }} {...props} />,
                    li: ({node, ...props}) => <li style={{ marginBottom: '0.5rem', lineHeight: '1.8' }} {...props} />,
                    strong: ({node, ...props}) => <strong style={{ fontWeight: 'bold', color: '#2c3e50' }} {...props} />,
                    em: ({node, ...props}) => <em style={{ fontStyle: 'italic' }} {...props} />,
                    code: ({node, inline, ...props}: any) => 
                      inline ? (
                        <code style={{ background: '#f4f4f4', padding: '0.2rem 0.4rem', borderRadius: '3px', fontSize: '0.9em', fontFamily: 'monospace' }} {...props} />
                      ) : (
                        <code style={{ display: 'block', background: '#f4f4f4', padding: '1rem', borderRadius: '5px', overflow: 'auto', fontSize: '0.9em', fontFamily: 'monospace' }} {...props} />
                      ),
                  }}
                >
                  {preprocessSummary(answer)}
                </ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  )
}
