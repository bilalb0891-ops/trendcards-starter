'use client';

import { useState } from 'react';

type GenResponse = {
  cards: { title: string; body: string }[];
  sources: { title: string; url: string }[];
  caption_linkedin: string;
  caption_instagram: string;
  hashtags: string[];
};

export default function Home() {
  const [url, setUrl] = useState('');
  const [topic, setTopic] = useState('');
  const [audience, setAudience] = useState<'beginner' | 'pro' | 'both'>('both');
  const [tone, setTone] = useState<'neutral' | 'optimistic' | 'critical'>('critical');
  const [primaryColor, setPrimaryColor] = useState('#D32F2F');
  const [secondaryColor, setSecondaryColor] = useState('#1E3A8A');

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<GenResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onGenerate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, topic, audience, tone, primaryColor, secondaryColor })
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || 'Failed to generate');
      }
      const json = (await res.json()) as GenResponse;
      setData(json);
    } catch (err: any) {
      setError(err?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  const makeCardUrl = (card: { title: string; body: string }, size: 'square' | 'portrait') => {
    const params = new URLSearchParams({
      title: card.title,
      body: card.body,
      color: primaryColor,
      accent: secondaryColor,
      size,
      watermark: '1'
    });
    return `/api/card?${params.toString()}`;
  };

  return (
    <main style={{ minHeight: '100vh', background: '#fff', color: '#111' }}>
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '40px 24px' }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, margin: '0 0 8px' }}>
          TrendCards — 5‑Card Explainers
        </h1>
        <p style={{ color: '#374151', margin: '0 0 20px' }}>
          Paste a topic or URL. Choose audience and tone. Get 5 crisp carousel cards with sources and captions.
        </p>

        <form onSubmit={onGenerate} style={{ display: 'grid', gap: 12 }}>
          <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 600 }}>URL (optional)</label>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/article"
              style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 8, padding: '10px 12px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 600 }}>Topic (optional)</label>
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Punjab AI driving test car"
              style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 8, padding: '10px 12px' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 600 }}>Audience</label>
              <select
                value={audience}
                onChange={(e) => setAudience(e.target.value as any)}
                style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 8, padding: '10px 12px' }}
              >
                <option value="beginner">Beginner</option>
                <option value="pro">Pro</option>
                <option value="both">Both</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 600 }}>Tone</label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value as any)}
                style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 8, padding: '10px 12px' }}
              >
                <option value="neutral">Neutral</option>
                <option value="optimistic">Optimistic</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 600 }}>Primary Color</label>
              <input
                type="text"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                placeholder="#D32F2F"
                style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 8, padding: '10px 12px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 600 }}>Secondary Color</label>
              <input
                type="text"
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
                placeholder="#1E3A8A"
                style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 8, padding: '10px 12px' }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              background: '#000',
              color: '#fff',
              borderRadius: 8,
              padding: '10px 16px',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Generating…' : 'Generate'}
          </button>
        </form>

        {error && (
          <div style={{ marginTop: 16, padding: 12, border: '1px solid #fca5a5', borderRadius: 8, color: '#b91c1c' }}>
            {error}
          </div>
        )}

        {data && (
          <div style={{ marginTop: 32, display: 'grid', gap: 24 }}>
            <section>
              <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Cards Preview (text)</h2>
              <ol style={{ paddingLeft: 20, display: 'grid', gap: 12 }}>
                {data.cards.map((c, i) => (
                  <li key={i}>
                    <div style={{ fontWeight: 700 }}>{c.title}</div>
                    <pre style={{ whiteSpace: 'pre-wrap', fontSize: 14, color: '#1f2937', margin: 0 }}>
                      {c.body}
                    </pre>
                  </li>
                ))}
              </ol>
            </section>

            <section>
              <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Download Images</h2>
              <div style={{ display: 'grid', gap: 16, gridTemplateColumns: '1fr 1fr' }}>
                {data.cards.map((c, i) => {
                  const square = makeCardUrl(c, 'square');
                  const portrait = makeCardUrl(c, 'portrait');
                  return (
                    <div key={i} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 12 }}>
                      <div style={{ fontWeight: 600, marginBottom: 8 }}>Card {i + 1}</div>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={square} alt={c.title} style={{ width: '100%', height: 'auto', borderRadius: 6, border: '1px solid #e5e7eb' }} />
                      <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                        <a href={square} download={`card_${i + 1}_square.png`} style={{ color: '#2563EB', textDecoration: 'underline' }}>
                          Download Square
                        </a>
                        <a href={portrait} download={`card_${i + 1}_portrait.png`} style={{ color: '#2563EB', textDecoration: 'underline' }}>
                          Download Portrait
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section>
              <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Captions & Hashtags</h2>
              <div style={{ display: 'grid', gap: 8 }}>
                <div>
                  <div style={{ fontWeight: 700 }}>LinkedIn</div>
                  <p style={{ fontSize: 14, color: '#1f2937', margin: 0 }}>{data.caption_linkedin}</p>
                </div>
                <div>
                  <div style={{ fontWeight: 700 }}>Instagram</div>
                  <p style={{ fontSize: 14, color: '#1f2937', margin: 0 }}>{data.caption_instagram}</p>
                </div>
                <div>
                  <div style={{ fontWeight: 700 }}>Hashtags</div>
                  <p style={{ fontSize: 14, color: '#1f2937', margin: 0 }}>{data.hashtags.join(' ')}</p>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
