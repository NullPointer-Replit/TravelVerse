'use client';

import { useState } from 'react';
import DayCard from './DayCard';

export default function ItineraryCarousel({ itinerary, onDayClick }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const cardsPerView = 3; // Show 3 cards at a time on desktop (reduced for bigger cards)

  if (!itinerary || itinerary.length === 0) return null;

  const nextSlide = () => {
    setCurrentIndex((prev) => 
      prev + cardsPerView >= itinerary.length ? 0 : prev + cardsPerView
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => 
      prev - cardsPerView < 0 
        ? Math.max(0, Math.floor((itinerary.length - 1) / cardsPerView) * cardsPerView)
        : prev - cardsPerView
    );
  };

  return (
    <div className="relative">
      {/* Navigation Buttons */}
      {itinerary.length > cardsPerView && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-gray-800/80 backdrop-blur-md rounded-full p-3 shadow-lg hover:shadow-xl transition-all hover:scale-110 border-2 border-emerald-500/30"
            aria-label="Previous days"
          >
            <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-gray-800/80 backdrop-blur-md rounded-full p-3 shadow-lg hover:shadow-xl transition-all hover:scale-110 border-2 border-emerald-500/30"
            aria-label="Next days"
          >
            <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Carousel Container */}
      <div className="overflow-hidden px-8">
        <div 
          className="flex transition-transform duration-500 ease-in-out gap-4"
          style={{ transform: `translateX(-${currentIndex * (100 / cardsPerView)}%)` }}
        >
          {itinerary.map((day) => (
            <div 
              key={day.day} 
              className="flex-shrink-0"
              style={{ width: `calc(${100 / cardsPerView}% - 1rem)` }}
            >
              <DayCard day={day} onClick={() => onDayClick(day)} />
            </div>
          ))}
        </div>
      </div>

      {/* Dots Indicator */}
      {itinerary.length > cardsPerView && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: Math.ceil(itinerary.length / cardsPerView) }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx * cardsPerView)}
              className={`h-2 rounded-full transition-all ${
                Math.floor(currentIndex / cardsPerView) === idx
                  ? 'w-8 bg-emerald-600'
                  : 'w-2 bg-emerald-200 hover:bg-emerald-400'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

