'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import DayMap from './DayMap';

const formatPrice = (price) => {
  if (!price) return '';
  const priceStr = String(price).replace(/[₹$€£,]/g, '').trim();
  const priceNum = parseInt(priceStr) || 0;
  if (priceNum === 0) return price;
  return `₹${priceNum.toLocaleString('en-IN')}`;
};

export default function DayDetailModal({ 
  day, 
  isOpen, 
  onClose, 
  onUpdateDay,
  onSuggestAlternative,
  formData,
  destination,
  savedStruckOffItems
}) {
  const [struckOffItems, setStruckOffItems] = useState({});
  const [suggesting, setSuggesting] = useState(null);

  // Load saved struck-off items or reset when day changes
  useEffect(() => {
    if (day) {
      // If saved struck-off items exist for this day, use them
      if (savedStruckOffItems && day.day) {
        const dayStruckOff = savedStruckOffItems[`day-${day.day}`] || {};
        setStruckOffItems(dayStruckOff);
      } else {
        setStruckOffItems({});
      }
    }
  }, [day, savedStruckOffItems]);

  if (!isOpen || !day) return null;

  const toggleStrikeOff = (section) => {
    setStruckOffItems(prev => {
      const newState = {
        ...prev,
        [section]: !prev[section]
      };
      // Trigger auto-save with current state
      if (onUpdateDay) {
        onUpdateDay(newState);
      }
      return newState;
    });
  };

  const handleSuggestAlternative = async (section, currentItem) => {
    if (!onSuggestAlternative || !formData) return;
    
    setSuggesting(section);
    try {
      await onSuggestAlternative(day.day, section, currentItem);
      toast.success('Alternative suggestion generated!');
      // Remove strike-off after alternative is generated
      setStruckOffItems(prev => ({
        ...prev,
        [section]: false
      }));
      // Close modal to show updated itinerary
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      toast.error('Failed to generate alternative');
      console.error(error);
    } finally {
      setSuggesting(null);
    }
  };

  const activities = [
    { 
      key: 'morning', 
      icon: '🌅', 
      label: 'Morning', 
      data: day.morning,
      color: 'from-emerald-900/40 to-teal-900/40',
      borderColor: 'border-emerald-500/30',
      buttonColor: 'bg-emerald-600 hover:bg-emerald-700'
    },
    { 
      key: 'lunch', 
      icon: '🍽️', 
      label: 'Lunch', 
      data: day.lunch,
      color: 'from-teal-900/40 to-cyan-900/40',
      borderColor: 'border-teal-500/30',
      buttonColor: 'bg-teal-600 hover:bg-teal-700',
      isRestaurant: true
    },
    { 
      key: 'afternoon', 
      icon: '☀️', 
      label: 'Afternoon', 
      data: day.afternoon,
      color: 'from-cyan-900/40 to-blue-900/40',
      borderColor: 'border-cyan-500/30',
      buttonColor: 'bg-cyan-600 hover:bg-cyan-700'
    },
    { 
      key: 'dinner', 
      icon: '🍷', 
      label: 'Dinner', 
      data: day.dinner,
      color: 'from-blue-900/40 to-indigo-900/40',
      borderColor: 'border-blue-500/30',
      buttonColor: 'bg-blue-600 hover:bg-blue-700',
      isRestaurant: true
    },
    { 
      key: 'evening', 
      icon: '🌙', 
      label: 'Evening', 
      data: day.evening,
      color: 'from-indigo-900/40 to-purple-900/40',
      borderColor: 'border-indigo-500/30',
      buttonColor: 'bg-indigo-600 hover:bg-indigo-700'
    },
  ];

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4" 
      onClick={onClose}
      style={{ 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0,
        position: 'fixed',
        width: '100vw',
        height: '100vh',
        margin: 0,
        padding: '1rem'
      }}
    >
      <div 
        className="bg-gray-800/80 backdrop-blur-md rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col relative border border-emerald-500/30" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6 text-white">
          <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold flex items-center gap-3">
              <span className="text-4xl">📅</span>
              Day {day.day}
            </h2>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/20 rounded-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content with fade effect */}
        <div className="relative flex-1 overflow-hidden">
          <div className="px-6 pt-6 pb-32 space-y-4 overflow-y-auto h-full max-h-[calc(90vh-200px)]">
            {activities.map((activity) => {
            if (!activity.data) return null;
            
            const isStruckOff = struckOffItems[activity.key];
            const displayText = activity.isRestaurant ? activity.data.name : activity.data.activity;

            return (
              <div 
                key={activity.key}
                className={`border-2 ${activity.borderColor} rounded-xl p-5 bg-gradient-to-br ${activity.color} backdrop-blur-sm transition-all ${
                  isStruckOff ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="text-3xl">{activity.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-bold text-lg text-gray-100">{activity.label}</h4>
                        <button
                          onClick={() => toggleStrikeOff(activity.key)}
                          className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                            isStruckOff
                              ? 'bg-red-500 text-white hover:bg-red-600 shadow-md'
                              : 'bg-red-900/50 text-red-300 hover:bg-red-800/70 border border-red-500/50'
                          }`}
                        >
                          {isStruckOff ? '✓ Struck Off' : 'Strike Off'}
                        </button>
                      </div>
                      <p className={`text-gray-200 font-medium ${isStruckOff ? 'line-through' : ''}`}>
                        {displayText}
                      </p>
                      {activity.data.location && (
                        <p className="text-sm text-gray-400 mt-1">📍 {activity.data.location}</p>
                      )}
                      {activity.data.time && (
                        <p className="text-sm text-gray-400">🕐 {activity.data.time}</p>
                      )}
                      {activity.data.cuisine && (
                        <p className="text-sm text-gray-400 mt-1">🍴 {activity.data.cuisine}</p>
                      )}
                      {activity.data.price && (
                        <p className="text-sm font-medium text-emerald-400 mt-1">
                          💰 {formatPrice(activity.data.price)}
                        </p>
                      )}
                      {activity.data.bookingLink && (
                        <a
                          href={activity.data.bookingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`mt-2 inline-block px-3 py-1.5 ${activity.buttonColor} text-white text-sm rounded-lg transition-colors`}
                        >
                          {activity.isRestaurant ? '📅 Make Reservation' : '🎫 Book Tickets'}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
                
                {isStruckOff && (
                  <div className="mt-3 pt-3 border-t border-gray-300">
                    <button
                      onClick={() => handleSuggestAlternative(activity.key, activity.data)}
                      disabled={suggesting === activity.key}
                      className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 text-white rounded-xl font-bold text-base hover:from-purple-600 hover:via-pink-600 hover:to-rose-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                      <span className="text-xl">{suggesting === activity.key ? '✨' : '✨'}</span>
                      <span>{suggesting === activity.key ? 'Generating Alternative...' : 'Suggest Alternative'}</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
          </div>
          {/* Bottom fade gradient for seamless scroll */}
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-gray-800 via-gray-800/90 to-transparent pointer-events-none z-10"></div>
        </div>

        {/* Day Map with Timestamps */}
        {destination && (
          <div className="px-6 pb-6 bg-gray-800/60 backdrop-blur-sm">
            <DayMap day={day} destination={destination} />
          </div>
        )}
      </div>
    </div>
  );
}

