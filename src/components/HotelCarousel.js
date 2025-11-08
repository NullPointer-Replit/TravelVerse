'use client';

import { useState } from 'react';

const formatPrice = (price) => {
  if (!price) return '';
  const priceStr = String(price).replace(/[₹$€£,]/g, '').trim();
  const priceNum = parseInt(priceStr) || 0;
  if (priceNum === 0) return price;
  return `₹${priceNum.toLocaleString('en-IN')}`;
};

export default function HotelCarousel({ hotels }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const cardsPerView = 3; // Show 3 cards at a time on desktop

  if (!hotels || hotels.length === 0) return null;

  const nextSlide = () => {
    setCurrentIndex((prev) => 
      prev + cardsPerView >= hotels.length ? 0 : prev + cardsPerView
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => 
      prev - cardsPerView < 0 
        ? Math.max(0, Math.floor((hotels.length - 1) / cardsPerView) * cardsPerView)
        : prev - cardsPerView
    );
  };

  return (
    <div className="relative">
      {/* Navigation Buttons */}
      {hotels.length > cardsPerView && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-gray-800/80 backdrop-blur-md rounded-full p-3 shadow-lg hover:shadow-xl transition-all hover:scale-110 border-2 border-emerald-500/30"
            aria-label="Previous hotels"
          >
              <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-gray-800/80 backdrop-blur-md rounded-full p-3 shadow-lg hover:shadow-xl transition-all hover:scale-110 border-2 border-emerald-500/30"
            aria-label="Next hotels"
          >
              <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Carousel Container */}
      <div className="overflow-hidden">
        <div 
          className="flex transition-transform duration-500 ease-in-out gap-4"
          style={{ transform: `translateX(-${currentIndex * (100 / cardsPerView)}%)` }}
        >
          {hotels.map((hotel, idx) => (
            <div 
              key={idx} 
              className="flex-shrink-0 w-full md:w-1/2 lg:w-1/3 px-2"
            >
              <div className="border-2 border-emerald-500/30 rounded-2xl p-5 bg-gradient-to-br from-emerald-900/40 via-teal-900/40 to-cyan-900/40 backdrop-blur-sm hover:shadow-xl transition-all hover:border-emerald-500/60 h-full flex flex-col">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-xl text-gray-100 flex-1 line-clamp-2 pr-2">{hotel.name}</h3>
                    <span className="text-2xl flex-shrink-0">🏨</span>
                  </div>
                  <p className="text-sm text-gray-300 mb-3 flex items-center gap-1 line-clamp-1">
                    <span>📍</span>
                    <span className="truncate">{hotel.location}</span>
                  </p>
                  <p className="text-emerald-400 font-bold text-lg mb-3">
                    {hotel.pricePerNight 
                      ? `${formatPrice(hotel.pricePerNight)}/night` 
                      : hotel.priceRange ? formatPrice(hotel.priceRange) : 'Price on request'}
                  </p>
                  {hotel.highlights && (
                    <p className="text-sm text-gray-200 mb-4 line-clamp-2">{hotel.highlights}</p>
                  )}
                </div>
                {hotel.bookingLink && (
                  <a
                    href={hotel.bookingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-auto w-full px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-center rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-700 transition-all shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95"
                  >
                    📅 Book Now
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dots Indicator */}
      {hotels.length > cardsPerView && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: Math.ceil(hotels.length / cardsPerView) }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx * cardsPerView)}
              className={`h-2 rounded-full transition-all ${
                Math.floor(currentIndex / cardsPerView) === idx
                  ? 'w-8 bg-emerald-500'
                  : 'w-2 bg-emerald-500/30 hover:bg-emerald-500/60'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

