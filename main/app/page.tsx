import Link from 'next/link'

export default function Home() {
  return (
    <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#1f77b4' }}>
        🔬 Research AI Assistant
      </h1>
      <p style={{ fontSize: '1.2rem', marginBottom: '3rem', color: '#2c3e50' }}>
        Your AI-powered assistant for academic research
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        <Link href="/understand" style={{ 
          background: '#f0f2f6', 
          padding: '1.5rem', 
          borderRadius: '10px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          transition: 'transform 0.2s'
        }}>
          <h2 style={{ color: '#1f77b4', marginBottom: '0.5rem' }}>📄 Understand Any Research Paper</h2>
          <p style={{ color: '#2c3e50', lineHeight: '1.5' }}>
            Upload any research paper and get detailed summaries, key concepts explained, and interactive Q&A.
          </p>
        </Link>

        <Link href="/ask-about" style={{ 
          background: '#f0f2f6', 
          padding: '1.5rem', 
          borderRadius: '10px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          transition: 'transform 0.2s'
        }}>
          <h2 style={{ color: '#1f77b4', marginBottom: '0.5rem' }}>💬 Ask About Any Paper</h2>
          <p style={{ color: '#2c3e50', lineHeight: '1.5' }}>
            Upload a research paper and ask detailed questions. Full paper analysis with comprehensive answers (5 questions per paper).
          </p>
        </Link>

        <Link href="/citations" style={{ 
          background: '#f0f2f6', 
          padding: '1.5rem', 
          borderRadius: '10px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          transition: 'transform 0.2s'
        }}>
          <h2 style={{ color: '#1f77b4', marginBottom: '0.5rem' }}>📚 Generate Citations</h2>
          <p style={{ color: '#2c3e50', lineHeight: '1.5' }}>
            Generate accurate citations in multiple formats: APA, MLA, Chicago, and IEEE.
          </p>
        </Link>
      </div>
    </main>
  )
}
