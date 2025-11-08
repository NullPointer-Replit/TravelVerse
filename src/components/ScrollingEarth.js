'use client';

import Link from 'next/link';

export default function ScrollingEarth() {
  return (
    <div className="fixed inset-0 w-full h-screen overflow-hidden">
      {/* Scrolling Earth Image Container */}
      <div className="scrolling-earth-container">
          {/* First image */}
          <img
            src="/earth.jpg"
            alt="Earth"
            className="scrolling-earth-image"
          />
          {/* Duplicate image for seamless loop */}
          <img
            src="/earth.jpg"
            alt="Earth"
            className="scrolling-earth-image"
          />
        </div>

        {/* Overlay with blur and content */}
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
          <div className="text-center px-4 flex-1 flex flex-col justify-center">
            {/* Product Name */}
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold mb-8 tracking-tight">
              <span className="bg-gradient-to-r from-white via-gray-100 to-gray-200 bg-clip-text text-transparent drop-shadow-2xl">
                TravelR
              </span>
            </h1>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
              <Link
                href="/auth"
                className="px-10 py-4 bg-white/95 backdrop-blur-md text-gray-900 rounded-xl font-semibold text-lg hover:bg-white transition-all shadow-xl hover:shadow-2xl transform hover:scale-105"
              >
                Sign In
              </Link>
              <Link
                href="/auth"
                className="px-10 py-4 bg-transparent backdrop-blur-md text-white rounded-xl font-semibold text-lg border-2 border-white/80 hover:bg-white/10 hover:border-white transition-all shadow-lg"
              >
                Register
              </Link>
            </div>
          </div>

          {/* Copyright Footer */}
          <div className="absolute bottom-6 left-0 right-0 text-center">
            <p className="text-white/70 text-sm font-medium">
              © {new Date().getFullYear()} <span className="font-semibold">TravelR</span>. All rights reserved.
            </p>
          </div>
        </div>
      </div>
  );
}

