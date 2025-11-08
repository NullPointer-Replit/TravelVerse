'use client';

export default function FlyingPlane({ className = '' }) {
  return (
    <div className={`fixed inset-0 pointer-events-none overflow-hidden ${className}`} style={{ zIndex: 0 }}>
      {/* Animated plane flying across */}
      <div className="absolute top-[20%] left-0 animate-fly">
        <svg 
          className="w-16 h-16 text-emerald-500 opacity-60"
          fill="currentColor" 
          viewBox="0 0 24 24"
        >
          <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
        </svg>
      </div>
      
      {/* Second plane with delay */}
      <div className="absolute top-[50%] left-0 animate-fly-delayed">
        <svg 
          className="w-12 h-12 text-teal-400 opacity-50"
          fill="currentColor" 
          viewBox="0 0 24 24"
        >
          <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
        </svg>
      </div>

      {/* Third plane with different delay */}
      <div className="absolute top-[80%] left-0 animate-fly-slow">
        <svg 
          className="w-10 h-10 text-cyan-400 opacity-40"
          fill="currentColor" 
          viewBox="0 0 24 24"
        >
          <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
        </svg>
      </div>
    </div>
  );
}

