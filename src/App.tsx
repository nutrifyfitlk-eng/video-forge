import { useState, useEffect } from 'react';
import BusinessForm from './components/Form';
import VariantsDisplay from './components/Variants';
import RenderProgress from './components/RenderProgress';
import { BusinessFormData, VideoAd } from './types';

type View = 'form' | 'variants' | 'render';

export default function App() {
  const [view, setView] = useState<View>('form');
  const [isLoading, setIsLoading] = useState(false);
  const [variants, setVariants] = useState<VideoAd[]>([]);
  const [jobId, setJobId] = useState<string | null>(null);
  const [videoCount, setVideoCount] = useState(73);

  const handleFormSubmit = async (data: BusinessFormData) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      
      if (!res.ok) {
        throw new Error(result.error || 'Failed to generate variants');
      }

      if (!Array.isArray(result)) {
        throw new Error('Invalid response format: Expected an array of variants');
      }

      setVariants(result);
      setView('variants');
      setVideoCount(prev => prev + 1);
    } catch (error: any) {
      console.error("Generation error:", error);
      alert(error.message || "Failed to generate variants. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRender = async (variant: VideoAd, compositionId: string) => {
    try {
      const res = await fetch('/api/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ props: variant, compositionId }),
      });
      const result = await res.json();
      setJobId(result.jobId);
      setView('render');
    } catch (error) {
      console.error("Render error:", error);
      alert("Failed to start render.");
    }
  };

  const handleRenderAll = async (variant: VideoAd) => {
    try {
      const res = await fetch('/api/render-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ props: variant }),
      });
      const result = await res.json();
      // For simplicity in MVP, we track the first jobId from the batch
      if (result.jobIds && result.jobIds.length > 0) {
        setJobId(result.jobIds[0]);
        setView('render');
      }
    } catch (error) {
      console.error("Render all error:", error);
      alert("Failed to start batch render.");
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary selection:bg-accent-primary selection:text-bg-primary">
      {view === 'form' && (
        <BusinessForm 
          onSubmit={handleFormSubmit} 
          isLoading={isLoading} 
          videoCount={videoCount} 
        />
      )}
      
      {view === 'variants' && (
        <VariantsDisplay 
          variants={variants} 
          onRender={handleRender}
          onRenderAll={handleRenderAll}
          onRegenerate={() => setView('form')}
        />
      )}

      {view === 'render' && jobId && (
        <RenderProgress 
          jobId={jobId} 
          onNew={() => setView('form')} 
        />
      )}

      <footer className="py-8 text-center text-[10px] text-text-muted uppercase tracking-[0.2em] border-t border-border-subtle/50 mt-auto">
        &copy; 2026 GeniuzLab Ltd · VisionForge Engine v2.5
      </footer>
    </div>
  );
}
