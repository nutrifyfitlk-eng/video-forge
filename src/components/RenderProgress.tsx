import { useEffect, useState } from 'react';
import { Loader2, CheckCircle2, Download, Copy, Plus, Server, Settings2 } from 'lucide-react';
import { motion } from 'motion/react';

interface RenderProgressProps {
  jobId: string;
  onNew: () => void;
}

const loadingMessages = [
  "Crafting your hook...",
  "Designing your scenes...",
  "Rendering on Empire Server (m5.2xlarge)...",
  "Adding final touches...",
  "Almost ready...",
];

export default function RenderProgress({ jobId, onNew }: RenderProgressProps) {
  const [status, setStatus] = useState<any>(null);
  const [msgIdx, setMsgIdx] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [quality, setQuality] = useState<'Low' | 'Medium' | 'High'>('High');

  useEffect(() => {
    const msgInterval = setInterval(() => {
      setMsgIdx(prev => (prev + 1) % loadingMessages.length);
    }, 3000);

    const pollStatus = async () => {
      try {
        const res = await fetch(`/api/status/${jobId}`);
        const data = await res.json();
        setStatus(data);

        if (data.status === 'completed' || data.status === 'failed') {
          clearInterval(pollInterval);
          clearInterval(msgInterval);
        }
      } catch (err) {
        console.error("Poll error:", err);
      }
    };

    const pollInterval = setInterval(pollStatus, 2000);
    pollStatus();

    return () => {
      clearInterval(pollInterval);
      clearInterval(msgInterval);
    };
  }, [jobId]);

  const copyToClipboard = () => {
    if (status?.outputUrl) {
      navigator.clipboard.writeText(status.outputUrl);
      alert("Link copied to clipboard!");
    }
  };

  const handleDownload = async () => {
    if (!status?.outputUrl) return;
    
    try {
      // Attempt to fetch as blob for forced download with proper naming
      const response = await fetch(status.outputUrl);
      if (!response.ok) throw new Error('Network response was not ok');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Use a more descriptive filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      link.download = `VisionForge_Ad_${timestamp}.mp4`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download error:", err);
      // Fallback: open in new tab if blob download fails (e.g. CORS)
      const link = document.createElement('a');
      link.href = status.outputUrl;
      link.target = '_blank';
      link.download = 'visionforge-video.mp4';
      link.click();
    }
  };

  const isDone = status?.status === 'completed';
  const progress = status?.progress || 0;

  return (
    <div className="max-w-2xl mx-auto py-24 px-4 text-center">
      {!isDone ? (
        <div className="space-y-8">
          <div className="relative w-32 h-32 mx-auto">
            <div className="absolute inset-0 border-4 border-accent-primary/20 rounded-full"></div>
            <motion.div
              className="absolute inset-0 border-4 border-accent-primary rounded-full border-t-transparent"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            ></motion.div>
            <div className="absolute inset-0 flex items-center justify-center text-2xl font-bold font-mono">
              {Math.round(progress)}%
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-2">{loadingMessages[msgIdx]}</h2>
            <p className="text-text-muted">Your high-quality video is being forged.</p>
          </div>

          <div className="w-full bg-bg-surface h-2 rounded-full overflow-hidden border border-border-subtle">
            <motion.div
              className="h-full bg-accent-primary accent-glow"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
            ></motion.div>
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 bg-bg-surface border border-border-subtle rounded-full text-xs font-bold">
            <Server className="w-3 h-3 text-accent-primary" />
            🔱 Empire Server · m5.2xlarge · 8 vCPU
          </div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-8"
        >
          <div className="w-20 h-20 bg-accent-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10 text-accent-primary" />
          </div>

          <h2 className="text-4xl font-bold">Video Forged!</h2>
          
          <div className="flex flex-col gap-4 max-w-[300px] mx-auto">
            <div className="flex items-center justify-between px-4 py-2 bg-bg-surface border border-border-subtle rounded-xl">
              <div className="flex items-center gap-2 text-sm text-text-muted">
                <Settings2 className="w-4 h-4" />
                Preview
              </div>
              <select 
                value={quality}
                onChange={(e) => setQuality(e.target.value as any)}
                className="bg-transparent text-sm font-bold text-accent-primary focus:outline-none cursor-pointer"
              >
                <option value="Low" className="bg-bg-primary">480p</option>
                <option value="Medium" className="bg-bg-primary">720p</option>
                <option value="High" className="bg-bg-primary">1080p</option>
              </select>
            </div>

            <div className="aspect-[9/16] w-full bg-bg-surface rounded-2xl border border-border-subtle overflow-hidden shadow-2xl">
              <video
                key={quality} // Force re-render on quality change
                src={`${status.outputUrl}${status.outputUrl.includes('?') ? '&' : '?'}quality=${quality.toLowerCase()}`}
                controls
                autoPlay
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={handleDownload}
              className="flex items-center justify-center gap-2 bg-accent-primary text-bg-primary font-bold py-4 rounded-full hover:scale-[1.02] transition-all"
            >
              <Download className="w-5 h-5" />
              Download MP4
            </button>
            <button
              onClick={copyToClipboard}
              className="flex items-center justify-center gap-2 bg-bg-surface border border-border-subtle font-bold py-4 rounded-full hover:border-accent-primary transition-all"
            >
              <Copy className="w-5 h-5" />
              Copy Link
            </button>
          </div>

          <div className="pt-8 border-t border-border-subtle">
            <button
              onClick={onNew}
              className="flex items-center justify-center gap-2 mx-auto text-accent-primary font-bold hover:underline"
            >
              <Plus className="w-5 h-5" />
              Generate New Ad
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
