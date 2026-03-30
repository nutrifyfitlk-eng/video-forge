import { z } from 'zod';

export const SceneSchema = z.object({
  id: z.number(),
  type: z.enum(['HOOK', 'PROBLEM', 'SOLUTION', 'PROOF', 'CTA']),
  startFrame: z.number(),
  endFrame: z.number(),
  durationFrames: z.number(),
  headline: z.string().max(50),
  subtext: z.string().max(100),
  animation: z.enum(['ZOOM_IN', 'SLIDE_LEFT', 'FADE', 'PUNCH', 'BOUNCE']),
  backgroundType: z.enum(['COLOR', 'VIDEO', 'GRADIENT']),
  backgroundValue: z.string(),
  overlayOpacity: z.number().min(0).max(1),
  textPosition: z.enum(['TOP', 'CENTER', 'BOTTOM']),
  hasLogo: z.boolean(),
  logoPosition: z.enum(['TOP_LEFT', 'TOP_RIGHT', 'BOTTOM_CENTER']),
  logoAnimation: z.enum(['FADE_IN', 'SLIDE_DOWN', 'SCALE_UP', 'NONE']),
});

export const VideoAdSchema = z.object({
  videoMeta: z.object({
    businessName: z.string(),
    adType: z.enum(['REEL', 'AD', 'SHORT']),
    duration: z.literal(900),
    fps: z.literal(30),
    format: z.enum(['9:16', '1:1', '16:9']),
  }),
  brand: z.object({
    primaryColor: z.string(),
    secondaryColor: z.string(),
    accentColor: z.string(),
    fontFamily: z.enum(['BOLD', 'ELEGANT', 'MODERN', 'PLAYFUL']),
    tone: z.string(),
  }),
  scenes: z.array(SceneSchema).length(5),
  audio: z.object({
    musicMood: z.enum(['ENERGETIC', 'CALM', 'DRAMATIC', 'UPBEAT', 'LUXURY']),
    hasVoiceover: z.boolean(),
    voiceoverScript: z.string(),
  }),
  cta: z.object({
    text: z.string(),
    subtext: z.string(),
    urgency: z.string(),
    website: z.string(),
  }),
  logoUrl: z.string().optional(),
});

export const VariantsSchema = z.array(VideoAdSchema).length(3);

export type Scene = z.infer<typeof SceneSchema>;
export type VideoAd = z.infer<typeof VideoAdSchema>;
export type Variants = z.infer<typeof VariantsSchema>;

export interface BusinessFormData {
  businessName: string;
  niche: string;
  primaryOffer: string;
  usp: string;
  targetAudience: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  tone: string;
  logoUrl?: string;
  website: string;
  contentVideoUrl?: string;
}
