'use client';

import { useState } from 'react';
import DayDetailModal from './DayDetailModal';
import HotelCarousel from './HotelCarousel';
import ItineraryCarousel from './ItineraryCarousel';
import FlightSuggestions from './FlightSuggestions';

// Helper function to format prices with rupee symbol
const formatPrice = (price) => {
  if (!price) return '';
  // Remove any existing currency symbols and extract number
  const priceStr = String(price).replace(/[₹$€£,]/g, '').trim();
  const priceNum = parseInt(priceStr) || 0;
  if (priceNum === 0) return price; // Return original if can't parse
  return `₹${priceNum.toLocaleString('en-IN')}`;
};

export default function ItineraryDisplay({ data, onRegenerateDay, formData, onUpdateItinerary, onSaveItinerary }) {
  if (!data) return null;

  const { itinerary, hotels, flights, tips, struckOffItems } = data;
  const [selectedDay, setSelectedDay] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDayClick = (day) => {
    setSelectedDay(day);
    setIsModalOpen(true);
  };

  const handleUpdateDay = (struckOffData = null) => {
    // Auto-save when user interacts
    if (onSaveItinerary && struckOffData && selectedDay) {
      // Save struck-off items with day key
      const dayKey = `day-${selectedDay.day}`;
      const updatedStruckOffItems = {
        ...(struckOffItems || {}),
        [dayKey]: struckOffData
      };
      onSaveItinerary(null, updatedStruckOffItems);
    } else if (onSaveItinerary) {
      onSaveItinerary(null, struckOffItems);
    }
  };

  const handleSuggestAlternative = async (dayNumber, section, currentItem) => {
    if (!onRegenerateDay || !formData) return;
    
    try {
      // Regenerate the specific day with context about what to replace
      await onRegenerateDay(dayNumber, section, currentItem);
      // Auto-save after generating alternative
      if (onSaveItinerary) {
        onSaveItinerary();
      }
    } catch (error) {
      console.error('Error suggesting alternative:', error);
      throw error;
    }
  };

  return (
    <div className="space-y-8">
      {/* Flight Suggestions */}
      {flights && flights.length > 0 && (
        <FlightSuggestions flights={flights} />
      )}

      {/* Hotels Section - Carousel */}
      {hotels && hotels.length > 0 && (
        <div className="bg-gradient-to-br from-emerald-900/40 via-teal-900/40 to-cyan-900/40 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border-2 border-emerald-500/30">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-100 flex items-center gap-3 mb-2">
                <span className="text-4xl">🏨</span>
                Recommended Hotels
              </h2>
              <p className="text-gray-300">Browse through {hotels.length} carefully selected options</p>
            </div>
          </div>
          <HotelCarousel hotels={hotels} />
        </div>
      )}

      {/* Daily Itinerary - Carousel */}
      {itinerary && itinerary.length > 0 && (
        <div className="bg-gradient-to-br from-emerald-900/40 via-teal-900/40 to-cyan-900/40 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border-2 border-emerald-500/30">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-100 flex items-center gap-3 mb-2">
              <span className="text-4xl">📅</span>
              Your Itinerary
            </h2>
            <p className="text-gray-300">Browse through {itinerary.length} days of your journey</p>
          </div>
          <ItineraryCarousel 
            itinerary={itinerary} 
            onDayClick={handleDayClick}
          />
        </div>
      )}

      {/* Day Detail Modal */}
          <DayDetailModal
            day={selectedDay}
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onUpdateDay={handleUpdateDay}
            onSuggestAlternative={handleSuggestAlternative}
            formData={formData}
            destination={formData?.destination}
            savedStruckOffItems={struckOffItems}
          />

      {/* Travel Tips - Enhanced UX */}
      {tips && tips.length > 0 && (
        <div className="bg-gradient-to-br from-amber-900/40 via-orange-900/40 to-yellow-900/40 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border-2 border-amber-500/30 relative overflow-hidden">
          {/* Decorative Background Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-500/10 rounded-full -ml-24 -mb-24"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="text-5xl animate-bounce">💡</div>
              <div>
                <h2 className="text-3xl font-bold text-gray-100 mb-1">
                  Essential Travel Tips
                </h2>
                <p className="text-gray-300 text-sm">Expert advice for a smooth journey</p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              {tips.map((tip, idx) => (
                <div 
                  key={idx} 
                  className="bg-gray-800/60 backdrop-blur-sm p-5 rounded-xl border-2 border-amber-500/30 hover:border-amber-500/60 hover:shadow-lg transition-all transform hover:scale-[1.02] flex items-start gap-3"
                >
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
                    {idx + 1}
                  </div>
                  <p className="text-gray-200 font-medium leading-relaxed">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Copyright Footer */}
      <div className="text-center py-6 border-t border-emerald-200 mt-8">
        <p className="text-gray-400 text-sm">
          © {new Date().getFullYear()} <span className="font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">TravelR</span>. All rights reserved.
        </p>
        <p className="text-gray-500 text-xs mt-2">
          Your intelligent travel planning assistant
        </p>
      </div>
    </div>
  );
}
