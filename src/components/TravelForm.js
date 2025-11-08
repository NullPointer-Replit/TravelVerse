'use client';

import { useState } from 'react';

export default function TravelForm({ onSubmit, loading, onError }) {
  const [formData, setFormData] = useState({
    destination: '',
    days: 3,
    interests: [],
    budget: 'moderate',
    startDate: '',
    travelerCount: 1,
  });

  const interestOptions = [
    'Sightseeing',
    'Food & Dining',
    'Adventure',
    'Culture & History',
    'Nature',
    'Shopping',
    'Nightlife',
    'Relaxation',
  ];

  const handleInterestToggle = (interest) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const validateDate = (dateString) => {
    if (!dateString) return { valid: true }; // Optional field
    
    const selectedDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const fiveYearsFromNow = new Date();
    fiveYearsFromNow.setFullYear(today.getFullYear() + 5);
    
    if (selectedDate < today) {
      return { valid: false, message: 'Date cannot be in the past' };
    }
    
    if (selectedDate > fiveYearsFromNow) {
      return { valid: false, message: 'Date cannot be more than 5 years in the future' };
    }
    
    return { valid: true };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (formData.startDate) {
      const dateValidation = validateDate(formData.startDate);
      if (!dateValidation.valid) {
        if (onError) onError(dateValidation.message);
        return;
      }
    }
    
    if (formData.destination && formData.interests.length > 0) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-emerald-100">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Destination
        </label>
        <input
          type="text"
          value={formData.destination}
          onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
          placeholder="e.g., Paris, Tokyo, New York"
          className="w-full px-4 py-2 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Number of Days: {formData.days}
        </label>
        <input
          type="range"
          min="1"
          max="14"
          value={formData.days}
          onChange={(e) => setFormData({ ...formData, days: parseInt(e.target.value) })}
          className="w-full accent-emerald-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Interests (select at least one)
        </label>
        <div className="grid grid-cols-2 gap-2">
          {interestOptions.map(interest => (
            <button
              key={interest}
              type="button"
              onClick={() => handleInterestToggle(interest)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                formData.interests.includes(interest)
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md'
                  : 'bg-emerald-50 text-gray-700 hover:bg-emerald-100 border border-emerald-200'
              }`}
            >
              {interest}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Start Date
          </label>
          <input
            type="date"
            value={formData.startDate}
            onChange={(e) => {
              const dateValidation = validateDate(e.target.value);
              if (!dateValidation.valid && onError) {
                onError(dateValidation.message);
                return;
              }
              setFormData({ ...formData, startDate: e.target.value });
            }}
            min={new Date().toISOString().split('T')[0]}
            max={(() => {
              const maxDate = new Date();
              maxDate.setFullYear(maxDate.getFullYear() + 5);
              return maxDate.toISOString().split('T')[0];
            })()}
            className="w-full px-4 py-2 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Travelers
          </label>
          <input
            type="number"
            min="1"
            max="20"
            value={formData.travelerCount}
            onChange={(e) => setFormData({ ...formData, travelerCount: parseInt(e.target.value) || 1 })}
            className="w-full px-4 py-2 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Budget Level
        </label>
        <select
          value={formData.budget}
          onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
          className="w-full px-4 py-2 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
        >
          <option value="budget">Budget-Friendly</option>
          <option value="moderate">Moderate</option>
          <option value="luxury">Luxury</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={loading || !formData.destination || formData.interests.length === 0}
        className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3 rounded-lg font-semibold hover:from-emerald-600 hover:to-teal-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
      >
        {loading ? 'Generating Your Perfect Trip...' : 'Generate Itinerary'}
      </button>
    </form>
  );
}
