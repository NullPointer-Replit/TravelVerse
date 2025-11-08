'use client';

import { useState } from 'react';

const formatPrice = (price) => {
  if (!price) return '';
  const priceStr = String(price).replace(/[₹$€£,]/g, '').trim();
  const priceNum = parseInt(priceStr) || 0;
  if (priceNum === 0) return price;
  return `₹${priceNum.toLocaleString('en-IN')}`;
};

export default function DayCard({ day, onClick }) {
  const getActivityCount = () => {
    let count = 0;
    if (day.morning) count++;
    if (day.lunch) count++;
    if (day.afternoon) count++;
    if (day.dinner) count++;
    if (day.evening) count++;
    return count;
  };

  const getActivitySummary = (activity, isRestaurant = false) => {
    if (!activity) return null;
    const text = isRestaurant ? activity.name : activity.activity;
    // Truncate to 30 characters for summary
    return text && text.length > 30 ? text.substring(0, 30) + '...' : text;
  };

  const activityCount = getActivityCount();

  return (
    <button
      onClick={onClick}
      className="w-full h-full min-h-[320px] bg-gradient-to-br from-emerald-900/40 via-teal-900/40 to-cyan-900/40 backdrop-blur-sm rounded-2xl border-2 border-emerald-500/30 hover:border-emerald-500/60 transition-all p-5 text-left group relative overflow-hidden shadow-lg hover:shadow-xl"
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-200/20 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
      
      <div className="relative h-full flex flex-col justify-between">
        <div>
          <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">📅</div>
          <h3 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-4">
            Day {day.day}
          </h3>
        </div>
        
        <div className="space-y-2 flex-1">
          {day.morning && (
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-2 border border-emerald-500/30">
              <div className="flex items-start gap-2">
                <span className="text-lg">🌅</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-emerald-400 mb-0.5">Morning</p>
                  <p className="text-sm text-gray-200 line-clamp-2">{getActivitySummary(day.morning)}</p>
                </div>
              </div>
            </div>
          )}
          
          {day.lunch && (
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-2 border border-emerald-500/30">
              <div className="flex items-start gap-2">
                <span className="text-lg">🍽️</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-emerald-400 mb-0.5">Lunch</p>
                  <p className="text-sm text-gray-200 line-clamp-2">{getActivitySummary(day.lunch, true)}</p>
                </div>
              </div>
            </div>
          )}
          
          {day.afternoon && (
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-2 border border-emerald-500/30">
              <div className="flex items-start gap-2">
                <span className="text-lg">☀️</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-emerald-400 mb-0.5">Afternoon</p>
                  <p className="text-sm text-gray-200 line-clamp-2">{getActivitySummary(day.afternoon)}</p>
                </div>
              </div>
            </div>
          )}
          
          {day.dinner && (
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-2 border border-emerald-500/30">
              <div className="flex items-start gap-2">
                <span className="text-lg">🍷</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-emerald-400 mb-0.5">Dinner</p>
                  <p className="text-sm text-gray-200 line-clamp-2">{getActivitySummary(day.dinner, true)}</p>
                </div>
              </div>
            </div>
          )}
          
          {day.evening && (
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-2 border border-emerald-500/30">
              <div className="flex items-start gap-2">
                <span className="text-lg">🌙</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-emerald-400 mb-0.5">Evening</p>
                  <p className="text-sm text-gray-200 line-clamp-2">{getActivitySummary(day.evening)}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-3 pt-3 border-t border-emerald-500/30">
          <div className="flex items-center justify-between">
            <span className="text-sm text-emerald-400 font-semibold">
              {activityCount} {activityCount === 1 ? 'activity' : 'activities'}
            </span>
            <svg className="w-5 h-5 text-emerald-400 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </button>
  );
}

