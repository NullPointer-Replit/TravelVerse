'use client';

import { useEffect, useRef } from 'react';

export default function RotatingGlobe() {
  const globeRef = useRef(null);

  useEffect(() => {
    const globe = globeRef.current;
    if (!globe) return;

    let rotation = 0;
    const rotationSpeed = 0.5; // degrees per frame

    const animate = () => {
      rotation += rotationSpeed;
      globe.style.transform = `rotateY(${rotation}deg)`;
      requestAnimationFrame(animate);
    };

    animate();
  }, []);

  return (
    <div className="relative w-full h-[500px] flex items-center justify-center" style={{ perspective: '1000px' }}>
      {/* Scrolling Text Behind Globe */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden z-0">
        <div className="scrolling-text-globe text-5xl md:text-7xl lg:text-8xl font-bold text-emerald-500/15 whitespace-nowrap">
          Your Journey, Your Itinerary! • Your Journey, Your Itinerary! • Your Journey, Your Itinerary! • Your Journey, Your Itinerary! • Your Journey, Your Itinerary! • Your Journey, Your Itinerary! • 
        </div>
      </div>

        {/* 3D Globe */}
        <div className="relative z-10">
          <div
            ref={globeRef}
            className="globe-container"
            style={{
              width: '350px',
              height: '350px',
              position: 'relative',
              transformStyle: 'preserve-3d',
            }}
          >
            {/* Globe Sphere */}
            <div
              className="globe-sphere"
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                background: 'radial-gradient(circle at 30% 30%, #1e40af 0%, #1e3a8a 25%, #1e293b 50%, #0f172a 75%, #020617 100%)',
                position: 'relative',
                boxShadow: '0 0 80px rgba(16, 185, 129, 0.4), inset -30px -30px 60px rgba(0, 0, 0, 0.6), inset 30px 30px 60px rgba(59, 130, 246, 0.4)',
                transformStyle: 'preserve-3d',
              }}
            >
              {/* Continents Pattern - Simplified */}
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  backgroundImage: `
                    radial-gradient(ellipse 80px 40px at 20% 30%, rgba(34, 197, 94, 0.5) 0%, transparent 50%),
                    radial-gradient(ellipse 100px 50px at 60% 40%, rgba(34, 197, 94, 0.5) 0%, transparent 50%),
                    radial-gradient(ellipse 90px 45px at 40% 60%, rgba(34, 197, 94, 0.5) 0%, transparent 50%),
                    radial-gradient(ellipse 70px 35px at 80% 50%, rgba(34, 197, 94, 0.5) 0%, transparent 50%),
                    radial-gradient(ellipse 85px 42px at 15% 70%, rgba(34, 197, 94, 0.5) 0%, transparent 50%),
                    radial-gradient(ellipse 75px 38px at 70% 20%, rgba(34, 197, 94, 0.5) 0%, transparent 50%)
                  `,
                  mixBlendMode: 'screen',
                }}
              />
              
              {/* Grid Lines */}
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  backgroundImage: `
                    linear-gradient(0deg, transparent 0%, rgba(16, 185, 129, 0.15) 50%, transparent 100%),
                    linear-gradient(90deg, transparent 0%, rgba(16, 185, 129, 0.15) 50%, transparent 100%),
                    linear-gradient(45deg, transparent 0%, rgba(16, 185, 129, 0.08) 50%, transparent 100%),
                    linear-gradient(-45deg, transparent 0%, rgba(16, 185, 129, 0.08) 50%, transparent 100%)
                  `,
                }}
              />

              {/* Highlight */}
              <div
                className="absolute top-0 left-1/4 w-1/2 h-1/2 rounded-full"
                style={{
                  background: 'radial-gradient(ellipse at center, rgba(255, 255, 255, 0.4) 0%, transparent 70%)',
                  transform: 'translateZ(10px)',
                }}
              />
            </div>
          </div>
        </div>
      </div>
  );
}

