import React from 'react';
import {
  Sequence,
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from 'remotion';

export interface Scene {
  id: number;
  type: 'HOOK' | 'PROBLEM' | 'SOLUTION' | 'PROOF' | 'CTA';
  startFrame: number;
  endFrame: number;
  durationFrames: number;
  headline: string;
  subtext: string;
  animation: 'ZOOM_IN' | 'SLIDE_LEFT' | 'FADE' | 'PUNCH' | 'BOUNCE';
  backgroundType: 'COLOR' | 'VIDEO' | 'GRADIENT';
  backgroundValue: string;
  overlayOpacity: number;
  textPosition: 'TOP' | 'CENTER' | 'BOTTOM';
  hasLogo: boolean;
  logoPosition: 'TOP_LEFT' | 'TOP_RIGHT' | 'BOTTOM_CENTER';
  logoAnimation: 'FADE_IN' | 'SLIDE_DOWN' | 'SCALE_UP' | 'NONE';
}

export interface VideoAdProps {
  videoMeta: {
    businessName: string;
    adType: 'REEL' | 'AD' | 'SHORT';
    duration: number;
    fps: number;
    format: '9:16' | '1:1' | '16:9';
  };
  brand: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    fontFamily: 'BOLD' | 'ELEGANT' | 'MODERN' | 'PLAYFUL';
    tone: string;
  };
  scenes: Scene[];
  audio: {
    musicMood: 'ENERGETIC' | 'CALM' | 'DRAMATIC' | 'UPBEAT' | 'LUXURY';
    hasVoiceover: boolean;
    voiceoverScript: string;
  };
  cta: {
    text: string;
    subtext: string;
    urgency: string;
    website: string;
  };
  logoUrl?: string;
}

const Logo: React.FC<{ url?: string; position: Scene['logoPosition']; animation: Scene['logoAnimation'] }> = ({ url, position, animation }) => {
  if (!url || animation === 'NONE') return null;
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const spr = spring({ frame, fps, config: { damping: 12 } });
  
  const opacity = animation === 'FADE_IN' ? interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp' }) : 1;
  const translateY = animation === 'SLIDE_DOWN' ? interpolate(spr, [0, 1], [-50, 0]) : 0;
  const scale = animation === 'SCALE_UP' ? spr : 1;

  const style: React.CSSProperties = {
    position: 'absolute',
    width: 120,
    height: 120,
    objectFit: 'contain',
    opacity,
    transform: `translateY(${translateY}px) scale(${scale})`,
    zIndex: 100,
  };

  if (position === 'TOP_LEFT') { 
    style.top = 40; 
    style.left = 40; 
  } else if (position === 'TOP_RIGHT') { 
    style.top = 40; 
    style.right = 40; 
  } else if (position === 'BOTTOM_CENTER') { 
    style.bottom = 40; 
    style.left = '50%'; 
    style.transform = `${style.transform} translateX(-50%)`; 
  }

  return <img src={url} style={style} referrerPolicy="no-referrer" />;
};

const HookScene: React.FC<{ scene: Scene; brand: VideoAdProps['brand']; logoUrl?: string }> = ({ scene, brand, logoUrl }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const spr = spring({
    frame,
    fps,
    config: { damping: 12 },
  });

  const headlineSpr = spring({
    frame: frame - 10,
    fps,
    config: { damping: 10, stiffness: 100 },
  });

  const subtextOpacity = interpolate(frame, [20, 35], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const accentBarWidth = interpolate(frame, [15, 40], [0, 100], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ 
      background: `linear-gradient(135deg, ${scene.backgroundValue}, ${brand.primaryColor})`,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
    }}>
      {scene.hasLogo && <Logo url={logoUrl} position={scene.logoPosition} animation={scene.logoAnimation} />}
      {/* Diagonal Stripe Overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(45deg, transparent 45%, rgba(255,255,255,0.1) 50%, transparent 55%)',
        backgroundSize: '200% 200%',
        transform: `translateX(${interpolate(frame, [0, 90], [-100, 100])}%)`,
      }} />

      {/* Particle Dots */}
      {[...Array(6)].map((_, i) => (
        <div key={i} style={{
          position: 'absolute',
          width: 10 + i * 5,
          height: 10 + i * 5,
          borderRadius: '50%',
          backgroundColor: 'white',
          opacity: 0.2,
          left: `${(i * 17) % 100}%`,
          top: `${(i * 23) % 100}%`,
          transform: `translateY(${Math.sin(frame / 20 + i) * 20}px)`,
        }} />
      ))}

      <div style={{ textAlign: 'center', padding: '0 60px', zIndex: 10 }}>
        <div style={{ 
          fontSize: 120, 
          marginBottom: 40,
          transform: `scale(${spr})`,
        }}>
          🚀
        </div>
        <h1 style={{
          fontSize: 80,
          fontWeight: 900,
          color: 'white',
          margin: 0,
          letterSpacing: -2,
          lineHeight: 1.1,
          transform: `translateY(${interpolate(headlineSpr, [0, 1], [100, 0])}px)`,
          opacity: headlineSpr,
        }}>
          {scene.headline}
        </h1>
        <p style={{
          fontSize: 40,
          color: 'white',
          opacity: subtextOpacity,
          marginTop: 20,
          fontWeight: 500,
        }}>
          {scene.subtext}
        </p>
      </div>

      {/* Bottom Accent Bar */}
      <div style={{
        position: 'absolute',
        bottom: 100,
        left: 0,
        height: 8,
        width: `${accentBarWidth}%`,
        backgroundColor: brand.accentColor,
      }} />
    </AbsoluteFill>
  );
};

const ProblemScene: React.FC<{ scene: Scene; brand: VideoAdProps['brand']; logoUrl?: string }> = ({ scene, brand, logoUrl }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const painPoints = scene.subtext.split('|');

  const headlineSpr = spring({
    frame,
    fps,
    config: { damping: 12 },
  });

  const lineGrow = interpolate(frame, [10, 30], [0, 100], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ 
      backgroundColor: '#0d0d0d',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '0 60px',
    }}>
      {scene.hasLogo && <Logo url={logoUrl} position={scene.logoPosition} animation={scene.logoAnimation} />}
      {/* Red Vignette */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle, transparent 40%, rgba(255, 0, 0, 0.15) 100%)',
      }} />

      <div style={{
        backgroundColor: '#ff4757',
        color: 'white',
        padding: '8px 24px',
        borderRadius: 99,
        fontSize: 24,
        fontWeight: 800,
        marginBottom: 30,
        transform: `scale(${spring({ frame, fps, config: { damping: 8 } })})`,
      }}>
        THE PROBLEM
      </div>

      <h1 style={{
        fontSize: 68,
        fontWeight: 900,
        color: 'white',
        textAlign: 'center',
        margin: '0 0 40px 0',
        transform: `translateY(${interpolate(headlineSpr, [0, 1], [50, 0])}px)`,
        opacity: headlineSpr,
      }}>
        {scene.headline}
      </h1>

      <div style={{ width: '100%', maxWidth: 600 }}>
        {painPoints.map((point, i) => {
          const pointFrame = frame - (20 + i * 10);
          const pointSpr = spring({ frame: pointFrame, fps, config: { damping: 12 } });
          return (
            <div key={i} style={{ 
              display: 'flex', 
              alignItems: 'center', 
              marginBottom: 20,
              opacity: interpolate(pointFrame, [0, 10], [0, 1], { extrapolateLeft: 'clamp' }),
              transform: `translateX(${interpolate(pointSpr, [0, 1], [-30, 0])}px)`,
            }}>
              <span style={{ 
                color: '#ff4757', 
                fontSize: 40, 
                marginRight: 20,
                transform: `scale(${pointSpr})`,
              }}>✗</span>
              <span style={{ color: 'white', fontSize: 32, fontWeight: 500 }}>{point.trim()}</span>
            </div>
          );
        })}
      </div>

      <div style={{
        width: `${lineGrow}%`,
        height: 4,
        backgroundColor: '#ff4757',
        marginTop: 40,
      }} />
    </AbsoluteFill>
  );
};

const SolutionScene: React.FC<{ scene: Scene; brand: VideoAdProps['brand']; logoUrl?: string }> = ({ scene, brand, logoUrl }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const features = scene.subtext.split('|');

  const zoomSpr = spring({
    frame,
    fps,
    config: { damping: 12 },
  });

  return (
    <AbsoluteFill style={{ 
      background: `linear-gradient(135deg, ${brand.primaryColor}, ${brand.accentColor})`,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '0 60px',
      overflow: 'hidden',
    }}>
      {scene.hasLogo && <Logo url={logoUrl} position={scene.logoPosition} animation={scene.logoAnimation} />}
      {/* Rotating Glow Orb */}
      <div style={{
        position: 'absolute',
        width: 800,
        height: 800,
        background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)',
        transform: `rotate(${frame * 0.5}deg)`,
        zIndex: 0,
      }} />

      {/* Animated Border Tracing */}
      <div style={{
        position: 'absolute',
        top: 20,
        left: 20,
        right: 20,
        bottom: 20,
        border: `2px solid ${brand.accentColor}`,
        boxShadow: `0 0 ${interpolate(Math.sin(frame / 10), [-1, 1], [10, 30])}px ${brand.accentColor}`,
        opacity: 0.5,
      }} />

      <div style={{ zIndex: 10, textAlign: 'center' }}>
        <div style={{
          backgroundColor: brand.accentColor,
          color: 'white',
          padding: '8px 24px',
          borderRadius: 99,
          fontSize: 24,
          fontWeight: 800,
          marginBottom: 20,
          display: 'inline-block',
        }}>
          THE SOLUTION
        </div>

        <div style={{ 
          fontSize: 32, 
          color: 'white', 
          fontWeight: 700, 
          marginBottom: 10,
          textShadow: `0 0 10px ${brand.accentColor}`,
        }}>
          {brand.tone.toUpperCase()}
        </div>

        <h1 style={{
          fontSize: 76,
          fontWeight: 900,
          color: 'white',
          margin: '0 0 40px 0',
          transform: `scale(${interpolate(zoomSpr, [0, 1], [0.6, 1])})`,
          opacity: zoomSpr,
        }}>
          {scene.headline}
        </h1>

        <div style={{ textAlign: 'left', display: 'inline-block' }}>
          {features.map((feature, i) => {
            const fFrame = frame - (30 + i * 10);
            const fSpr = spring({ frame: fFrame, fps, config: { damping: 12 } });
            return (
              <div key={i} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                marginBottom: 15,
                opacity: interpolate(fFrame, [0, 10], [0, 1], { extrapolateLeft: 'clamp' }),
                transform: `translateY(${interpolate(fSpr, [0, 1], [20, 0])}px)`,
              }}>
                <span style={{ 
                  color: 'white', 
                  fontSize: 36, 
                  marginRight: 15,
                  backgroundColor: brand.accentColor,
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>✓</span>
                <span style={{ color: 'white', fontSize: 32, fontWeight: 600 }}>{feature.trim()}</span>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const ProofScene: React.FC<{ scene: Scene; brand: VideoAdProps['brand']; logoUrl?: string }> = ({ scene, brand, logoUrl }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headlineSpr = spring({
    frame,
    fps,
    config: { damping: 12 },
  });

  const count = Math.floor(interpolate(frame, [10, 50], [0, parseInt(scene.headline.match(/\d+/)?.[0] || '100')], { extrapolateRight: 'clamp' }));

  return (
    <AbsoluteFill style={{ 
      backgroundColor: '#0d1117',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '0 60px',
    }}>
      {scene.hasLogo && <Logo url={logoUrl} position={scene.logoPosition} animation={scene.logoAnimation} />}
      <div style={{ display: 'flex', marginBottom: 40 }}>
        {[...Array(5)].map((_, i) => {
          const sFrame = frame - (i * 10);
          const sSpr = spring({ frame: sFrame, fps, config: { damping: 8 } });
          return (
            <div key={i} style={{ 
              fontSize: 60, 
              color: '#ffd700', 
              margin: '0 5px',
              transform: `scale(${sSpr})`,
              opacity: sFrame > 0 ? 1 : 0,
            }}>
              ★
            </div>
          );
        })}
      </div>

      <h1 style={{
        fontSize: 90,
        fontWeight: 900,
        color: 'white',
        margin: '0 0 20px 0',
        transform: `translateY(${interpolate(headlineSpr, [0, 1], [40, 0])}px)`,
        opacity: headlineSpr,
      }}>
        {scene.headline.replace(/\d+/, count.toString())}
      </h1>

      <p style={{
        fontSize: 32,
        color: 'rgba(255,255,255,0.8)',
        fontStyle: 'italic',
        textAlign: 'center',
        maxWidth: 700,
        opacity: interpolate(frame, [20, 40], [0, 1], { extrapolateLeft: 'clamp' }),
      }}>
        "{scene.subtext}"
      </p>

      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 10,
        background: `linear-gradient(to right, transparent, #ffd700, transparent)`,
        opacity: interpolate(Math.sin(frame / 15), [-1, 1], [0.3, 0.8]),
      }} />
    </AbsoluteFill>
  );
};

const CTAScene: React.FC<{ scene: Scene; brand: VideoAdProps['brand']; cta: VideoAdProps['cta']; logoUrl?: string }> = ({ scene, brand, cta, logoUrl }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const zoomSpr = spring({
    frame,
    fps,
    config: { damping: 12 },
  });

  const pulse = Math.sin(frame / 8) * 0.05 + 1;

  return (
    <AbsoluteFill style={{ 
      background: `linear-gradient(135deg, ${scene.backgroundValue}, ${brand.primaryColor}, ${brand.accentColor})`,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '0 60px',
      overflow: 'hidden',
    }}>
      {scene.hasLogo && <Logo url={logoUrl} position={scene.logoPosition} animation={scene.logoAnimation} />}
      {/* Confetti */}
      {[...Array(12)].map((_, i) => (
        <div key={i} style={{
          position: 'absolute',
          width: 15,
          height: 15,
          backgroundColor: i % 2 === 0 ? brand.primaryColor : brand.accentColor,
          left: `${(i * 9) % 100}%`,
          bottom: -20,
          transform: `translateY(${-frame * (3 + i % 5)}px) rotate(${frame * 2}deg)`,
          opacity: 0.6,
        }} />
      ))}

      <div style={{
        backgroundColor: 'white',
        color: brand.primaryColor,
        padding: '10px 30px',
        borderRadius: 99,
        fontSize: 28,
        fontWeight: 800,
        marginBottom: 40,
        transform: `scale(${pulse})`,
        boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
      }}>
        🔥 {cta.urgency}
      </div>

      <h1 style={{
        fontSize: 88,
        fontWeight: 900,
        color: 'white',
        textAlign: 'center',
        margin: '0 0 60px 0',
        transform: `scale(${interpolate(zoomSpr, [0, 1], [0.5, 1])})`,
        opacity: zoomSpr,
        textShadow: '0 10px 20px rgba(0,0,0,0.3)',
      }}>
        {scene.headline}
      </h1>

      <div style={{
        backgroundColor: 'white',
        padding: '25px 60px',
        borderRadius: 20,
        boxShadow: `0 0 ${interpolate(Math.sin(frame / 10), [-1, 1], [20, 50])}px rgba(255,255,255,0.5)`,
        transform: `scale(${Math.sin(frame / 15) * 0.03 + 1})`,
      }}>
        <div style={{ fontSize: 48, fontWeight: 900, color: brand.primaryColor }}>
          {cta.text}
        </div>
      </div>

      <div style={{
        marginTop: 40,
        fontSize: 36,
        color: 'white',
        fontWeight: 700,
        opacity: interpolate(frame, [40, 60], [0, 1], { extrapolateLeft: 'clamp' }),
      }}>
        {cta.website}
      </div>
    </AbsoluteFill>
  );
};

export const VideoAd: React.FC<VideoAdProps> = ({ scenes, brand, cta, logoUrl }) => {
  return (
    <AbsoluteFill style={{ backgroundColor: 'black', fontFamily: 'system-ui, sans-serif' }}>
      {scenes.map((scene) => (
        <Sequence
          key={scene.id}
          from={scene.startFrame}
          durationInFrames={scene.durationFrames}
        >
          {scene.type === 'HOOK' && <HookScene scene={scene} brand={brand} logoUrl={logoUrl} />}
          {scene.type === 'PROBLEM' && <ProblemScene scene={scene} brand={brand} logoUrl={logoUrl} />}
          {scene.type === 'SOLUTION' && <SolutionScene scene={scene} brand={brand} logoUrl={logoUrl} />}
          {scene.type === 'PROOF' && <ProofScene scene={scene} brand={brand} logoUrl={logoUrl} />}
          {scene.type === 'CTA' && <CTAScene scene={scene} brand={brand} cta={cta} logoUrl={logoUrl} />}
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

