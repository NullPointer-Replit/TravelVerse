'use client';

import { useState, useEffect } from 'react';

export default function BudgetCalculator({ itinerary, budget, travelerCount, days }) {
  const [budgetBreakdown, setBudgetBreakdown] = useState({
    accommodation: 0,
    food: 0,
    activities: 0,
    transportation: 0,
    miscellaneous: 0,
  });

  useEffect(() => {
    // Check if we have the minimum required data
    if (!budget || !travelerCount || !days || days === 0 || days === null || days === undefined) {
      // Reset to zero if conditions not met
      setBudgetBreakdown({
        accommodation: 0,
        food: 0,
        activities: 0,
        transportation: 0,
        miscellaneous: 0,
      });
      return;
    }

    // Budget estimates per day per person (in INR) - Realistic Indian travel costs
    const budgetRanges = {
      budget: {
        accommodation: 1200,  // Budget hotels/hostels
        food: 600,            // Street food, local restaurants
        activities: 500,       // Free/low-cost attractions
        transportation: 400,   // Public transport, shared cabs
        miscellaneous: 300,   // Shopping, tips, etc.
      },
      moderate: {
        accommodation: 3500,  // 3-star hotels, good locations
        food: 1500,           // Mix of local and mid-range restaurants
        activities: 1200,      // Paid attractions, tours
        transportation: 800,  // Private cabs, metro, trains
        miscellaneous: 500,   // Shopping, tips, extras
      },
      luxury: {
        accommodation: 10000, // 5-star hotels, premium locations
        food: 4000,           // Fine dining, premium restaurants
        activities: 3000,     // Premium experiences, private tours
        transportation: 2000, // Private cars, premium transport
        miscellaneous: 1000,  // Luxury shopping, premium services
      },
    };

    const daily = budgetRanges[budget] || budgetRanges.moderate;
    const total = {
      accommodation: daily.accommodation * days * travelerCount,
      food: daily.food * days * travelerCount,
      activities: daily.activities * days * travelerCount,
      transportation: daily.transportation * days * travelerCount,
      miscellaneous: daily.miscellaneous * days * travelerCount,
    };

    setBudgetBreakdown(total);
  }, [budget, travelerCount, days]);

  const totalBudget = Object.values(budgetBreakdown).reduce((sum, val) => sum + val, 0);
  const perPerson = travelerCount > 0 ? totalBudget / travelerCount : 0;
  const perDay = days > 0 ? totalBudget / days : 0;

  const categories = [
    { name: 'Accommodation', value: budgetBreakdown.accommodation, color: 'from-emerald-500 to-emerald-600' },
    { name: 'Food & Dining', value: budgetBreakdown.food, color: 'from-teal-500 to-teal-600' },
    { name: 'Activities', value: budgetBreakdown.activities, color: 'from-cyan-500 to-cyan-600' },
    { name: 'Transportation', value: budgetBreakdown.transportation, color: 'from-blue-500 to-blue-600' },
    { name: 'Miscellaneous', value: budgetBreakdown.miscellaneous, color: 'from-indigo-500 to-indigo-600' },
  ];

  return (
    <div className="bg-gray-800/60 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-emerald-500/30">
      <h2 className="text-2xl font-bold text-gray-100 mb-6 flex items-center gap-2">
        💰 Budget Calculator
      </h2>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-emerald-900/50 to-teal-900/50 backdrop-blur-sm p-4 rounded-xl border border-emerald-500/30">
          <p className="text-sm text-gray-400 mb-1">Total Budget</p>
          <p className="text-2xl font-bold text-emerald-400">
            {totalBudget > 0 ? `₹${totalBudget.toLocaleString('en-IN')}` : '₹0'}
          </p>
        </div>
        <div className="bg-gradient-to-br from-teal-900/50 to-cyan-900/50 backdrop-blur-sm p-4 rounded-xl border border-teal-500/30">
          <p className="text-sm text-gray-400 mb-1">Per Person</p>
          <p className="text-2xl font-bold text-teal-400">
            {perPerson > 0 ? `₹${perPerson.toLocaleString('en-IN')}` : '₹0'}
          </p>
        </div>
        <div className="bg-gradient-to-br from-cyan-900/50 to-blue-900/50 backdrop-blur-sm p-4 rounded-xl border border-cyan-500/30">
          <p className="text-sm text-gray-400 mb-1">Per Day</p>
          <p className="text-2xl font-bold text-cyan-400">
            {perDay > 0 ? `₹${perDay.toLocaleString('en-IN')}` : '₹0'}
          </p>
        </div>
      </div>

      {totalBudget > 0 ? (
        <div className="space-y-3">
          {categories.map((category) => {
            const percentage = totalBudget > 0 ? (category.value / totalBudget) * 100 : 0;
            return (
              <div key={category.name} className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-300">{category.name}</span>
                  <span className="text-sm font-bold text-gray-100">₹{category.value.toLocaleString('en-IN')}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2.5">
                  <div
                    className={`bg-gradient-to-r ${category.color} h-2.5 rounded-full transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-400">
          <p>Please generate an itinerary to see budget breakdown</p>
        </div>
      )}

      <p className="mt-4 text-xs text-gray-400 italic">
        * Estimates based on {budget || 'moderate'} budget level. Actual costs may vary.
      </p>
    </div>
  );
}

