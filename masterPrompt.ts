interface BusinessBrief {
  businessName: string;
  product: string;
  targetAudience: string;
  keyBenefit: string;
  tone: 'professional' | 'energetic' | 'emotional' | 'urgent' | 'friendly' | 'luxury';
  website: string;
  primaryColor: string;
}

export function buildMasterPrompt(brief: BusinessBrief): string {
  const toneInstructions = {
    energetic: "Use short punchy words, exclamation energy, and bright accent colors like #00ff00 or #ffff00.",
    professional: "Use measured language, trust signals, and navy/grey accents like #1a365d or #4a5568.",
    emotional: "Use story-driven, empathy-first language and warm accent colors like #f6ad55 or #ed64a1.",
    urgent: "Use scarcity language, red accents like #e53e3e, and create time pressure.",
    luxury: "Use aspirational language, gold accents like #ffd700, and exclusivity signals.",
    friendly: "Use conversational, inclusive language and warm colors like #ecc94b or #ed8936."
  };

  return `You are a world-class video ad director. Generate VideoAdProps JSON for a 30-second ad.
Return ONLY valid JSON, no markdown fences.

Business Info:
- Name: ${brief.businessName}
- Product: ${brief.product}
- Audience: ${brief.targetAudience}
- Key Benefit: ${brief.keyBenefit}
- Tone: ${brief.tone}
- Website: ${brief.website}
- Primary Color: ${brief.primaryColor}

Tone-Specific Guidance: ${toneInstructions[brief.tone]}

GLOBAL JSON RULES:
- All colors must be hex codes.
- accentColor must contrast with backgroundColor (use complementary color theory).
- fontFamily: always "system-ui, sans-serif".
- duration: always 900.
- fps: always 30.

SCENE RULES:

1. HOOK (Frames 0-90):
- Headline: max 5 words, pattern-interrupt opening, no generic phrases.
- Must create immediate curiosity or shock.
- emoji: relevant to the product/industry.
- animationStyle: always "zoom".

2. PROBLEM (Frames 90-270):
- Headline: names the exact pain, uses "you" language.
- subtext: EXACTLY 3 pain points separated by "|" pipes.
- Each pain point: max 6 words, specific not generic.
- animationStyle: always "slide".
- backgroundColor: always "#0d0d0d".

3. SOLUTION (Frames 270-540):
- Headline: "${brief.businessName} + transformation promise".
- subtext: EXACTLY 3 benefits separated by "|" pipes.
- Each benefit starts with a power verb (Get, Build, Unlock, Transform, Achieve).
- animationStyle: always "zoom".

4. PROOF (Frames 540-720):
- Headline: specific number + result (e.g. "10,847 Members Transformed").
- subtext: one specific testimonial quote with name attribution.
- animationStyle: always "fade".
- backgroundColor: always "#0d1117".

5. CTA (Frames 720-900):
- Headline: action verb + outcome (max 4 words).
- urgency field: time or quantity scarcity.
- animationStyle: always "bounce".
- backgroundColor: matches brand.primaryColor.

Ensure the JSON matches the VideoAdProps schema exactly.`;
}
