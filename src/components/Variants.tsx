import { VideoAd } from '../types';
import { Zap, Heart, Users, RefreshCw, Play } from 'lucide-react';
import { motion } from 'motion/react';

interface VariantsProps {
  variants: VideoAd[];
  onRender: (variant: VideoAd, compositionId: string) => void;
  onRenderAll: (variant: VideoAd) => void;
  onRegenerate: () => void;
}

const energyBadges = [
  { label: 'Emotional', icon: Heart, color: 'text-pink-400', bg: 'bg-pink-400/10' },
  { label: 'Urgency', icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
  { label: 'Social Proof', icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10' },
];

export default function VariantsDisplay({ variants, onRender, onRenderAll, onRegenerate }: VariantsProps) {
  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <div className="flex justify-between items-end mb-12">
        <div>
          <h1 className="text-4xl font-bold mb-2 tracking-tight">Select Your Variant</h1>
          <p className="text-text-muted">Gemini has crafted 3 unique strategies for your business.</p>
        </div>
        <button
          onClick={onRegenerate}
          className="flex items-center gap-2 px-6 py-3 bg-bg-surface border border-border-subtle rounded-full hover:border-accent-primary transition-all text-sm font-medium"
        >
          <RefreshCw className="w-4 h-4" />
          Regenerate
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {variants.map((variant, idx) => {
          const badge = energyBadges[idx];
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-bg-surface border border-border-subtle rounded-2xl overflow-hidden hover:border-accent-primary transition-all group flex flex-col"
            >
              <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-6">
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${badge.bg} ${badge.color}`}>
                    <badge.icon className="w-3 h-3" />
                    {badge.label}
                  </div>
                  <div className="flex -space-x-2">
                    {[variant.brand.primaryColor, variant.brand.secondaryColor, variant.brand.accentColor].map((c, i) => (
                      <div key={i} className="w-6 h-6 rounded-full border-2 border-bg-surface" style={{ backgroundColor: c }} />
                    ))}
                  </div>
                </div>

                <h3 className="text-xl font-bold mb-4">Variant {idx + 1}</h3>
                
                <div className="space-y-3 mb-6">
                  <div className="text-xs font-bold text-text-muted uppercase tracking-wider">Scene Timeline</div>
                  <div className="flex gap-1 h-8">
                    {variant.scenes.map((scene, sIdx) => (
                      <div
                        key={sIdx}
                        className="flex-1 rounded-sm relative group/scene"
                        style={{ backgroundColor: variant.brand.primaryColor, opacity: 0.4 + (sIdx * 0.15) }}
                      >
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-bg-elevated border border-border-subtle px-2 py-1 rounded text-[10px] whitespace-nowrap opacity-0 group-hover/scene:opacity-100 transition-opacity pointer-events-none z-10">
                          {scene.type}: {scene.headline}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between text-[10px] text-text-muted font-mono">
                    <span>0s</span>
                    <span>15s</span>
                    <span>30s</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="px-2 py-1 bg-bg-elevated border border-border-subtle rounded text-[10px] font-bold text-text-muted uppercase">
                    {variant.audio.musicMood} MUSIC
                  </span>
                  <span className="px-2 py-1 bg-bg-elevated border border-border-subtle rounded text-[10px] font-bold text-text-muted uppercase">
                    {variant.brand.fontFamily} FONT
                  </span>
                </div>

                <div className="bg-bg-elevated p-4 rounded-xl border border-border-subtle mb-6">
                  <div className="text-[10px] font-bold text-text-muted uppercase mb-2">CTA Preview</div>
                  <div className="text-sm font-bold mb-1">{variant.cta.text}</div>
                  <div className="text-xs text-text-muted">{variant.cta.subtext}</div>
                </div>
              </div>

              <div className="p-6 pt-0 space-y-3">
                <button
                  onClick={() => onRender(variant, "VideoAd_Reel")}
                  className="w-full bg-accent-primary text-bg-primary font-bold py-3 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4 fill-current" />
                  Render Reel (9:16)
                </button>
                <button
                  onClick={() => onRenderAll(variant)}
                  className="w-full bg-bg-elevated text-text-primary border border-border-subtle font-bold py-3 rounded-xl hover:border-accent-primary transition-all text-sm"
                >
                  Render All Formats
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-12 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-bg-surface border border-border-subtle rounded-full text-xs text-text-muted">
          <Zap className="w-3 h-3 text-accent-primary" />
          Estimated time: ~45 sec on Empire Server
        </div>
      </div>
    </div>
  );
}
