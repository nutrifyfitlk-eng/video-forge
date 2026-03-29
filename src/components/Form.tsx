import React, { useState } from 'react';
import { BusinessFormData } from '../types';
import { Dumbbell, Utensils, Sparkles, Zap, Brain, ShoppingBag, Loader2 } from 'lucide-react';

const presets = [
  { id: 'fitness', label: 'Fitness', icon: Dumbbell, primary: '#FF6B35', secondary: '#1a1a2e', accent: '#00FF88', tone: 'URGENT' },
  { id: 'food', label: 'Food', icon: Utensils, primary: '#D4A017', secondary: '#1a0a00', accent: '#FF6B35', tone: 'LUXURY' },
  { id: 'beauty', label: 'Beauty', icon: Sparkles, primary: '#FF69B4', secondary: '#1a0a1a', accent: '#FFD700', tone: 'LUXURY' },
  { id: 'tech', label: 'Tech', icon: Zap, primary: '#00D4FF', secondary: '#0a0a1a', accent: '#00FF88', tone: 'BOLD' },
  { id: 'coaching', label: 'Coaching', icon: Brain, primary: '#7C3AED', secondary: '#1a0533', accent: '#00FF88', tone: 'TRUST' },
  { id: 'retail', label: 'Retail', icon: ShoppingBag, primary: '#FF4444', secondary: '#1a0000', accent: '#FFD700', tone: 'URGENT' },
];

interface FormProps {
  onSubmit: (data: BusinessFormData) => void;
  isLoading: boolean;
  videoCount: number;
}

export default function BusinessForm({ onSubmit, isLoading, videoCount }: FormProps) {
  const [formData, setFormData] = useState<BusinessFormData>({
    businessName: '',
    niche: 'Fitness',
    primaryOffer: '',
    usp: '',
    targetAudience: '',
    primaryColor: '#7C3AED',
    secondaryColor: '#4F46E5',
    accentColor: '#00FF88',
    tone: 'TRUST',
    website: '',
    logoUrl: '',
    contentVideoUrl: '',
  });

  const applyPreset = (preset: typeof presets[0]) => {
    setFormData(prev => ({
      ...prev,
      primaryColor: preset.primary,
      secondaryColor: preset.secondary,
      accentColor: preset.accent,
      tone: preset.tone,
      niche: preset.label,
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-4 tracking-tight">
          Vision<span className="text-accent-primary">Forge</span>
        </h1>
        <p className="text-xl text-text-muted mb-2">AI Video Ads in 90 Seconds</p>
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-bg-surface border border-border-subtle rounded-full text-xs font-medium text-accent-primary">
          <span className="w-2 h-2 bg-accent-primary rounded-full animate-pulse"></span>
          Powered by GeniuzLab AI · Empire Server Online ✅
        </div>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-8">
        {presets.map(preset => (
          <button
            key={preset.id}
            onClick={() => applyPreset(preset)}
            className="flex flex-col items-center justify-center p-3 bg-bg-surface border border-border-subtle rounded-xl hover:border-accent-primary transition-all group"
          >
            <preset.icon className="w-6 h-6 mb-2 text-text-muted group-hover:text-accent-primary transition-colors" />
            <span className="text-xs font-medium">{preset.label}</span>
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="bg-bg-surface p-8 rounded-2xl border border-border-subtle shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-muted">Business Name</label>
            <input
              required
              name="businessName"
              value={formData.businessName}
              onChange={handleChange}
              placeholder="e.g. Titan Fitness"
              className="w-full bg-bg-elevated border border-border-subtle rounded-lg px-4 py-3 focus:outline-none focus:border-accent-primary transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-muted">Niche</label>
            <select
              name="niche"
              value={formData.niche}
              onChange={handleChange}
              className="w-full bg-bg-elevated border border-border-subtle rounded-lg px-4 py-3 focus:outline-none focus:border-accent-primary transition-all"
            >
              <option>Fitness</option>
              <option>Food</option>
              <option>Beauty</option>
              <option>Tech</option>
              <option>Coaching</option>
              <option>Retail</option>
              <option>Real Estate</option>
              <option>Other</option>
            </select>
          </div>
          <div className="md:col-span-2 space-y-2">
            <label className="text-sm font-medium text-text-muted">What are you selling?</label>
            <input
              required
              name="primaryOffer"
              value={formData.primaryOffer}
              onChange={handleChange}
              placeholder="e.g. 30-Day Weight Loss Challenge"
              className="w-full bg-bg-elevated border border-border-subtle rounded-lg px-4 py-3 focus:outline-none focus:border-accent-primary transition-all"
            />
          </div>
          <div className="md:col-span-2 space-y-2">
            <label className="text-sm font-medium text-text-muted">Why are you different? (USP)</label>
            <textarea
              required
              name="usp"
              value={formData.usp}
              onChange={handleChange}
              placeholder="e.g. Personalized AI coaching with 24/7 support"
              className="w-full bg-bg-elevated border border-border-subtle rounded-lg px-4 py-3 focus:outline-none focus:border-accent-primary transition-all h-24 resize-none"
            />
          </div>
          <div className="md:col-span-2 space-y-2">
            <label className="text-sm font-medium text-text-muted">Who is your customer?</label>
            <input
              required
              name="targetAudience"
              value={formData.targetAudience}
              onChange={handleChange}
              placeholder="e.g. Busy professionals aged 25-45"
              className="w-full bg-bg-elevated border border-border-subtle rounded-lg px-4 py-3 focus:outline-none focus:border-accent-primary transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-text-muted">Primary Color</label>
            <div className="flex gap-3 items-center">
              <input
                type="color"
                name="primaryColor"
                value={formData.primaryColor}
                onChange={handleChange}
                className="w-12 h-12 rounded-lg bg-transparent border-none cursor-pointer"
              />
              <span className="text-xs font-mono uppercase">{formData.primaryColor}</span>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-muted">Secondary Color</label>
            <div className="flex gap-3 items-center">
              <input
                type="color"
                name="secondaryColor"
                value={formData.secondaryColor}
                onChange={handleChange}
                className="w-12 h-12 rounded-lg bg-transparent border-none cursor-pointer"
              />
              <span className="text-xs font-mono uppercase">{formData.secondaryColor}</span>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-muted">Accent Color</label>
            <div className="flex gap-3 items-center">
              <input
                type="color"
                name="accentColor"
                value={formData.accentColor}
                onChange={handleChange}
                className="w-12 h-12 rounded-lg bg-transparent border-none cursor-pointer"
              />
              <span className="text-xs font-mono uppercase">{formData.accentColor}</span>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-muted">Tone</label>
            <select
              name="tone"
              value={formData.tone}
              onChange={handleChange}
              className="w-full bg-bg-elevated border border-border-subtle rounded-lg px-4 py-3 focus:outline-none focus:border-accent-primary transition-all"
            >
              <option>LUXURY</option>
              <option>URGENT</option>
              <option>PLAYFUL</option>
              <option>TRUST</option>
              <option>BOLD</option>
            </select>
          </div>

          <div className="md:col-span-2 space-y-2">
            <label className="text-sm font-medium text-text-muted">Website (yoursite.com)</label>
            <input
              required
              name="website"
              value={formData.website}
              onChange={handleChange}
              placeholder="titanfitness.com"
              className="w-full bg-bg-elevated border border-border-subtle rounded-lg px-4 py-3 focus:outline-none focus:border-accent-primary transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-muted">Logo URL (optional)</label>
            <input
              name="logoUrl"
              value={formData.logoUrl}
              onChange={handleChange}
              placeholder="https://..."
              className="w-full bg-bg-elevated border border-border-subtle rounded-lg px-4 py-3 focus:outline-none focus:border-accent-primary transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-muted">Background footage URL (optional)</label>
            <input
              name="contentVideoUrl"
              value={formData.contentVideoUrl}
              onChange={handleChange}
              placeholder="https://..."
              className="w-full bg-bg-elevated border border-border-subtle rounded-lg px-4 py-3 focus:outline-none focus:border-accent-primary transition-all"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-accent-primary text-bg-primary font-bold py-4 rounded-full hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:scale-100"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Processing with Gemini...
            </>
          ) : (
            <>
              Generate 3 Video Ads →
            </>
          )}
        </button>
        
        <p className="text-center mt-6 text-sm text-text-muted">
          {videoCount} videos generated this session
        </p>
      </form>
    </div>
  );
}
