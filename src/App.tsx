// src/App.tsx — VisionForge Frontend
// Gemini 2.0 Flash → VideoAdProps JSON → Render API → MP4 download

import { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

const RENDER_API = import.meta.env.VITE_RENDER_API || 'http://34.225.138.109:3005';
const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

// ─── Types ────────────────────────────────────────────────────────────────────
type RenderFormat = 'VideoAd_Reel' | 'VideoAd_Square' | 'VideoAd_Short';
type JobStatus = 'idle' | 'generating' | 'queued' | 'bundling' | 'rendering' | 'completed' | 'failed';

interface JobState {
  jobId: string;
  format: RenderFormat;
  status: JobStatus;
  progress: number;
  outputUrl: string | null;
  error: string | null;
}

interface BusinessBrief {
  businessName: string;
  product: string;
  targetAudience: string;
  keyBenefit: string;
  tone: string;
  website: string;
  primaryColor: string;
}

// ─── Gemini prompt builder ────────────────────────────────────────────────────
function buildGeminiPrompt(brief: BusinessBrief): string {
  return `You are a world-class video ad copywriter and creative director.

Generate a VideoAdProps JSON object for a 30-second video ad (900 frames at 30fps).

Business Brief:
- Business: ${brief.businessName}
- Product/Service: ${brief.product}
- Target Audience: ${brief.targetAudience}
- Key Benefit: ${brief.keyBenefit}
- Tone: ${brief.tone}
- Website: ${brief.website}
- Primary Color: ${brief.primaryColor}

Return ONLY valid JSON matching this exact structure (no markdown, no explanation):

{
  "videoMeta": {
    "businessName": "${brief.businessName}",
    "adType": "product",
    "duration": 900,
    "fps": 30,
    "format": "VideoAd_Reel"
  },
  "brand": {
    "primaryColor": "${brief.primaryColor}",
    "secondaryColor": "#FFFFFF",
    "accentColor": "#FFD700",
    "fontFamily": "Inter",
    "tone": "${brief.tone}"
  },
  "scenes": [
    {
      "type": "HOOK",
      "startFrame": 0,
      "endFrame": 90,
      "headline": "[Attention-grabbing hook — 5 words max]",
      "subtext": "[Supporting line that creates curiosity]",
      "visualDescription": "[What should appear on screen]",
      "backgroundColor": "${brief.primaryColor}",
      "textColor": "#FFFFFF",
      "animationStyle": "zoom-in"
    },
    {
      "type": "PROBLEM",
      "startFrame": 90,
      "endFrame": 270,
      "headline": "[Pain point headline]",
      "subtext": "[Describe the problem ${brief.targetAudience} faces]",
      "visualDescription": "[Problem visualization]",
      "backgroundColor": "#1A1A2E",
      "textColor": "#FFFFFF",
      "animationStyle": "slide-up"
    },
    {
      "type": "SOLUTION",
      "startFrame": 270,
      "endFrame": 540,
      "headline": "[Solution headline featuring ${brief.businessName}]",
      "subtext": "[How ${brief.product} solves the problem]",
      "visualDescription": "[Product/solution visual]",
      "backgroundColor": "${brief.primaryColor}",
      "textColor": "#FFFFFF",
      "animationStyle": "fade-in"
    },
    {
      "type": "PROOF",
      "startFrame": 540,
      "endFrame": 720,
      "headline": "[Social proof or result headline]",
      "subtext": "[Specific result or testimonial for ${brief.targetAudience}]",
      "visualDescription": "[Proof/results visual]",
      "backgroundColor": "#0D0D0D",
      "textColor": "#FFFFFF",
      "animationStyle": "slide-left"
    },
    {
      "type": "CTA",
      "startFrame": 720,
      "endFrame": 900,
      "headline": "[Strong call to action]",
      "subtext": "${brief.website}",
      "visualDescription": "[CTA screen with urgency]",
      "backgroundColor": "${brief.primaryColor}",
      "textColor": "#FFFFFF",
      "animationStyle": "pulse"
    }
  ],
  "audio": {
    "musicMood": "energetic",
    "hasVoiceover": false,
    "voiceoverScript": ""
  },
  "cta": {
    "text": "[Primary CTA button text]",
    "subtext": "[Secondary CTA line]",
    "urgency": "[Urgency line — limited time / spots]",
    "website": "${brief.website}"
  }
}`;
}

// ─── Poll job status ──────────────────────────────────────────────────────────
async function pollJobStatus(
  jobId: string,
  onUpdate: (status: string, progress: number, outputUrl: string | null) => void
): Promise<string | null> {
  return new Promise((resolve) => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${RENDER_API}/status/${jobId}`);
        const data = await res.json();
        onUpdate(data.status, data.progress, data.outputUrl);

        if (data.status === 'completed') {
          clearInterval(interval);
          resolve(data.outputUrl);
        } else if (data.status === 'failed') {
          clearInterval(interval);
          resolve(null);
        }
      } catch {
        clearInterval(interval);
        resolve(null);
      }
    }, 2000); // Poll every 2 seconds
  });
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [brief, setBrief] = useState<BusinessBrief>({
    businessName: '',
    product: '',
    targetAudience: '',
    keyBenefit: '',
    tone: 'professional',
    website: '',
    primaryColor: '#6C63FF',
  });

  const [selectedFormats, setSelectedFormats] = useState<RenderFormat[]>(['VideoAd_Reel']);
  const [jobs, setJobs] = useState<JobState[]>([]);
  const [globalStatus, setGlobalStatus] = useState<JobStatus>('idle');
  const [generatedProps, setGeneratedProps] = useState<object | null>(null);
  const [error, setError] = useState<string | null>(null);

  const updateJob = (jobId: string, updates: Partial<JobState>) => {
    setJobs(prev => prev.map(j => j.jobId === jobId ? { ...j, ...updates } : j));
  };

  const handleGenerate = async () => {
    if (!brief.businessName || !brief.product) {
      setError('Business name and product are required.');
      return;
    }
    if (!GEMINI_KEY) {
      setError('VITE_GEMINI_API_KEY not set in Netlify environment variables.');
      return;
    }

    setError(null);
    setJobs([]);
    setGlobalStatus('generating');

    try {
      // Step 1: Generate VideoAdProps via Gemini
      const genAI = new GoogleGenerativeAI(GEMINI_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      const prompt = buildGeminiPrompt(brief);

      const result = await model.generateContent(prompt);
      const rawText = result.response.text().trim();

      // Clean JSON (remove markdown fences if present)
      const jsonText = rawText.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
      const baseProps = JSON.parse(jsonText);
      setGeneratedProps(baseProps);

      // Step 2: Queue renders for each selected format
      setGlobalStatus('queued');
      const newJobs: JobState[] = [];

      for (const format of selectedFormats) {
        const props = {
          ...baseProps,
          videoMeta: { ...baseProps.videoMeta, format },
        };

        const renderRes = await fetch(`${RENDER_API}/render`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ compositionId: format, props }),
        });

        const renderData = await renderRes.json();
        const job: JobState = {
          jobId: renderData.jobId,
          format,
          status: 'queued',
          progress: 0,
          outputUrl: null,
          error: null,
        };
        newJobs.push(job);
      }

      setJobs(newJobs);
      setGlobalStatus('rendering');

      // Step 3: Poll all jobs in parallel
      await Promise.all(
        newJobs.map(job =>
          pollJobStatus(job.jobId, (status, progress, outputUrl) => {
            updateJob(job.jobId, {
              status: status as JobStatus,
              progress,
              outputUrl,
            });
          })
        )
      );

      setGlobalStatus('completed');

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setError(`Pipeline failed: ${msg}`);
      setGlobalStatus('failed');
    }
  };

  const formatLabels: Record<RenderFormat, string> = {
    VideoAd_Reel: '📱 Reel (9:16)',
    VideoAd_Square: '⬛ Square (1:1)',
    VideoAd_Short: '🖥️ Short (16:9)',
  };

  const toggleFormat = (fmt: RenderFormat) => {
    setSelectedFormats(prev =>
      prev.includes(fmt) ? prev.filter(f => f !== fmt) : [...prev, fmt]
    );
  };

  const statusColor: Record<JobStatus, string> = {
    idle: '#888',
    generating: '#F59E0B',
    queued: '#3B82F6',
    bundling: '#8B5CF6',
    rendering: '#6C63FF',
    completed: '#10B981',
    failed: '#EF4444',
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0D0D0D 0%, #1A0A2E 100%)',
      color: '#FFFFFF',
      fontFamily: 'Inter, system-ui, sans-serif',
      padding: '40px 20px',
    }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h1 style={{ fontSize: 42, fontWeight: 800, margin: 0, background: 'linear-gradient(90deg, #6C63FF, #FF6584)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            VisionForge
          </h1>
          <p style={{ color: '#888', marginTop: 8, fontSize: 16 }}>
            AI-Powered Video Ad Generator — Powered by Gemini + Remotion
          </p>
        </div>

        {/* Brief Form */}
        <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 32, marginBottom: 24, border: '1px solid rgba(255,255,255,0.1)' }}>
          <h2 style={{ margin: '0 0 24px', fontSize: 18, fontWeight: 700 }}>📋 Business Brief</h2>

          {[
            { key: 'businessName', label: 'Business Name', placeholder: 'e.g. FastFitPro' },
            { key: 'product', label: 'Product / Service', placeholder: 'e.g. AI fitness coaching app' },
            { key: 'targetAudience', label: 'Target Audience', placeholder: 'e.g. busy professionals aged 25-45 in the UK' },
            { key: 'keyBenefit', label: 'Key Benefit', placeholder: 'e.g. Get fit in 15 minutes a day with AI coaching' },
            { key: 'website', label: 'Website', placeholder: 'e.g. fastfitpro.com' },
          ].map(({ key, label, placeholder }) => (
            <div key={key} style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, color: '#AAA', marginBottom: 6 }}>{label}</label>
              <input
                type="text"
                placeholder={placeholder}
                value={brief[key as keyof BusinessBrief]}
                onChange={e => setBrief(prev => ({ ...prev, [key]: e.target.value }))}
                style={{
                  width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, color: '#FFF',
                  fontSize: 14, boxSizing: 'border-box', outline: 'none',
                }}
              />
            </div>
          ))}

          <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: 13, color: '#AAA', marginBottom: 6 }}>Tone</label>
              <select
                value={brief.tone}
                onChange={e => setBrief(prev => ({ ...prev, tone: e.target.value }))}
                style={{ width: '100%', padding: '10px 14px', background: '#1A1A2E', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, color: '#FFF', fontSize: 14 }}
              >
                {['professional', 'energetic', 'emotional', 'urgent', 'friendly', 'luxury'].map(t => (
                  <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                ))}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: 13, color: '#AAA', marginBottom: 6 }}>Primary Color</label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input
                  type="color"
                  value={brief.primaryColor}
                  onChange={e => setBrief(prev => ({ ...prev, primaryColor: e.target.value }))}
                  style={{ width: 44, height: 44, border: 'none', borderRadius: 8, cursor: 'pointer', background: 'none' }}
                />
                <input
                  type="text"
                  value={brief.primaryColor}
                  onChange={e => setBrief(prev => ({ ...prev, primaryColor: e.target.value }))}
                  style={{ flex: 1, padding: '10px 14px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, color: '#FFF', fontSize: 14 }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Format Selection */}
        <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 24, marginBottom: 24, border: '1px solid rgba(255,255,255,0.1)' }}>
          <h2 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 700 }}>🎬 Output Formats</h2>
          <div style={{ display: 'flex', gap: 12 }}>
            {(Object.keys(formatLabels) as RenderFormat[]).map(fmt => (
              <button
                key={fmt}
                onClick={() => toggleFormat(fmt)}
                style={{
                  flex: 1, padding: '12px 8px', borderRadius: 10, cursor: 'pointer',
                  border: selectedFormats.includes(fmt) ? '2px solid #6C63FF' : '2px solid rgba(255,255,255,0.1)',
                  background: selectedFormats.includes(fmt) ? 'rgba(108,99,255,0.2)' : 'rgba(255,255,255,0.03)',
                  color: '#FFF', fontSize: 13, fontWeight: 600, transition: 'all 0.2s',
                }}
              >
                {formatLabels[fmt]}
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid #EF4444', borderRadius: 10, padding: '12px 16px', marginBottom: 24, color: '#FCA5A5', fontSize: 14 }}>
            ⚠️ {error}
          </div>
        )}

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={globalStatus === 'generating' || globalStatus === 'rendering' || selectedFormats.length === 0}
          style={{
            width: '100%', padding: '16px', borderRadius: 12, border: 'none', cursor: 'pointer',
            background: (globalStatus === 'generating' || globalStatus === 'rendering')
              ? 'rgba(108,99,255,0.4)'
              : 'linear-gradient(135deg, #6C63FF, #FF6584)',
            color: '#FFF', fontSize: 18, fontWeight: 800, marginBottom: 32,
            transition: 'all 0.2s', letterSpacing: 0.5,
          }}
        >
          {globalStatus === 'generating' ? '🧠 Gemini Generating...' :
           globalStatus === 'rendering' ? '🎬 Rendering Videos...' :
           globalStatus === 'completed' ? '✅ Generate New Ads' :
           '⚡ Generate Video Ads'}
        </button>

        {/* Job Progress Cards */}
        {jobs.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {jobs.map(job => (
              <div key={job.jobId} style={{
                background: 'rgba(255,255,255,0.05)', borderRadius: 14, padding: 20,
                border: `1px solid ${statusColor[job.status]}40`,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span style={{ fontWeight: 700, fontSize: 15 }}>{formatLabels[job.format]}</span>
                  <span style={{
                    padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700,
                    background: `${statusColor[job.status]}25`, color: statusColor[job.status],
                  }}>
                    {job.status.toUpperCase()}
                  </span>
                </div>

                {/* Progress bar */}
                <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 4, height: 6, marginBottom: 12 }}>
                  <div style={{
                    height: '100%', borderRadius: 4, transition: 'width 0.5s ease',
                    width: `${job.progress}%`,
                    background: `linear-gradient(90deg, #6C63FF, ${statusColor[job.status]})`,
                  }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#888', fontSize: 13 }}>{job.progress}% complete</span>
                  {job.outputUrl && (
                    <a
                      href={job.outputUrl}
                      download
                      style={{
                        padding: '8px 20px', background: '#10B981', borderRadius: 8,
                        color: '#FFF', fontWeight: 700, fontSize: 13, textDecoration: 'none',
                      }}
                    >
                      ⬇️ Download MP4
                    </a>
                  )}
                  {job.error && (
                    <span style={{ color: '#EF4444', fontSize: 12 }}>❌ {job.error}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Generated Props Preview */}
        {generatedProps && (
          <details style={{ marginTop: 24 }}>
            <summary style={{ cursor: 'pointer', color: '#888', fontSize: 13, marginBottom: 8 }}>
              🔍 View Generated VideoAdProps JSON
            </summary>
            <pre style={{
              background: 'rgba(0,0,0,0.4)', borderRadius: 10, padding: 16,
              fontSize: 11, color: '#A78BFA', overflow: 'auto', maxHeight: 300,
            }}>
              {JSON.stringify(generatedProps, null, 2)}
            </pre>
          </details>
        )}

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: 48, color: '#444', fontSize: 12 }}>
          VisionForge by GeniuzLab · Powered by Gemini + Remotion · {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
}
