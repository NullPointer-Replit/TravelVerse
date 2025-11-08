'use client';

import { useState } from 'react';
import CustomDatePicker from './CustomDatePicker';

export default function TravelFormCards({ onSubmit, loading, onError }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    destination: '',
    startDate: '',
    endDate: '',
    days: 0, // Will be calculated from dates
    interests: [],
    budget: 'moderate',
    travelerCount: 1,
  });

  const interestOptions = [
    { id: 'Sightseeing', label: 'Sightseeing', icon: '🏛️' },
    { id: 'Food & Dining', label: 'Food & Dining', icon: '🍽️' },
    { id: 'Adventure', label: 'Adventure', icon: '⛰️' },
    { id: 'Culture & History', label: 'Culture & History', icon: '🏛️' },
    { id: 'Nature', label: 'Nature', icon: '🌲' },
    { id: 'Shopping', label: 'Shopping', icon: '🛍️' },
    { id: 'Nightlife', label: 'Nightlife', icon: '🌃' },
    { id: 'Relaxation', label: 'Relaxation', icon: '🏖️' },
  ];

  const steps = [
    { id: 'destination', title: 'Where to?', subtitle: 'Tell us your dream destination' },
    { id: 'dates', title: 'Travel Dates', subtitle: 'Select your start and end dates' },
    { id: 'interests', title: 'What interests you?', subtitle: 'Select your travel preferences' },
    { id: 'budget', title: 'Budget Level', subtitle: 'Choose your spending range' },
    { id: 'travelers', title: 'Travelers', subtitle: 'How many people are traveling?' },
  ];

  const validateDate = (dateString) => {
    if (!dateString) return { valid: false, message: 'Date is required' };
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

  const calculateDays = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end days
    return diffDays;
  };

  const handleNext = () => {
    // Validate current step before proceeding
    if (currentStep === 0 && !formData.destination.trim()) {
      if (onError) onError('Please enter a destination');
      return;
    }
    if (currentStep === 2 && formData.interests.length === 0) {
      if (onError) onError('Please select at least one interest');
      return;
    }
    if (currentStep === 4 && formData.startDate) {
      const dateValidation = validateDate(formData.startDate);
      if (!dateValidation.valid) {
        if (onError) onError(dateValidation.message);
        return;
      }
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Last step - submit form
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    // Calculate days before submitting
    if (formData.startDate && formData.endDate) {
      const days = calculateDays(formData.startDate, formData.endDate);
      if (days <= 0) {
        if (onError) onError('Please select valid start and end dates');
        return;
      }
      const finalFormData = { ...formData, days };
      if (finalFormData.destination && finalFormData.interests.length > 0 && days > 0) {
        onSubmit(finalFormData);
      } else {
        if (onError) onError('Please fill in all required fields');
      }
    } else {
      if (onError) onError('Please select both start and end dates');
    }
  };

  const handleInterestToggle = (interestId) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interestId)
        ? prev.interests.filter(i => i !== interestId)
        : [...prev.interests, interestId]
    }));
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Destination
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">✈️</div>
              <h2 className="text-3xl font-bold text-gray-100 mb-2">{steps[0].title}</h2>
              <p className="text-gray-300">{steps[0].subtitle}</p>
            </div>
            <input
              type="text"
              value={formData.destination}
              onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
              onKeyPress={(e) => e.key === 'Enter' && formData.destination.trim() && handleNext()}
              placeholder="e.g., Paris, Tokyo, New York, Bali..."
              className="w-full px-6 py-4 text-lg border-2 border-emerald-500/30 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all bg-gray-700/60 backdrop-blur-sm text-gray-200 placeholder-gray-400"
              autoFocus
            />
            <div className="flex gap-2 flex-wrap justify-center">
              {['Paris', 'Tokyo', 'New York', 'Bali', 'London', 'Dubai'].map((place) => (
                <button
                  key={place}
                  type="button"
                  onClick={() => {
                    setFormData({ ...formData, destination: place });
                    setTimeout(() => handleNext(), 300);
                  }}
                  className="px-4 py-2 bg-emerald-900/40 backdrop-blur-sm text-emerald-300 rounded-lg hover:bg-emerald-900/60 transition-colors border border-emerald-500/30"
                >
                  {place}
                </button>
              ))}
            </div>
          </div>
        );

      case 1: // Travel Dates
        const maxDate = new Date();
        maxDate.setFullYear(maxDate.getFullYear() + 5);
        const maxDateString = maxDate.toISOString().split('T')[0];
        const minDateString = new Date().toISOString().split('T')[0];
        const calculatedDays = formData.startDate && formData.endDate 
          ? calculateDays(formData.startDate, formData.endDate) 
          : 0;

        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">📅</div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">{steps[1].title}</h2>
              <p className="text-gray-300">{steps[1].subtitle}</p>
            </div>
            
            <div className="space-y-6">
              <CustomDatePicker
                label="Start Date"
                value={formData.startDate}
                onChange={(date) => {
                  const dateValidation = validateDate(date);
                  if (!dateValidation.valid && date) {
                    if (onError) onError(dateValidation.message);
                    return;
                  }
                  setFormData({ ...formData, startDate: date });
                }}
                minDate={minDateString}
                maxDate={maxDateString}
                placeholder="Select start date"
              />

              <CustomDatePicker
                label="End Date"
                value={formData.endDate}
                onChange={(date) => {
                  const dateValidation = validateDate(date);
                  if (!dateValidation.valid && date) {
                    if (onError) onError(dateValidation.message);
                    return;
                  }
                  if (formData.startDate && date && new Date(date) < new Date(formData.startDate)) {
                    if (onError) onError('End date must be after start date');
                    return;
                  }
                  setFormData({ ...formData, endDate: date });
                }}
                minDate={formData.startDate || minDateString}
                maxDate={maxDateString}
                placeholder="Select end date"
              />

              {calculatedDays > 0 && (
                <div className="bg-gradient-to-r from-emerald-900/40 to-teal-900/40 backdrop-blur-sm p-4 rounded-xl border-2 border-emerald-500/30 text-center">
                  <p className="text-sm text-gray-300 mb-1">Trip Duration</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    {calculatedDays} {calculatedDays === 1 ? 'Day' : 'Days'}
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      case 2: // Interests (was case 2, now case 2 after dates)
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">🎯</div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">{steps[2].title}</h2>
              <p className="text-gray-300">{steps[2].subtitle}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {interestOptions.map((interest) => (
                <button
                  key={interest.id}
                  type="button"
                  onClick={() => handleInterestToggle(interest.id)}
                  className={`p-6 rounded-xl transition-all transform hover:scale-105 ${
                    formData.interests.includes(interest.id)
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-xl scale-105'
                      : 'bg-gray-700/60 backdrop-blur-sm border-2 border-emerald-500/30 text-gray-200 hover:border-emerald-500/60'
                  }`}
                >
                  <div className="text-4xl mb-2">{interest.icon}</div>
                  <div className="font-semibold">{interest.label}</div>
                </button>
              ))}
            </div>
            {formData.interests.length > 0 && (
              <div className="text-center text-sm text-emerald-600 mt-4">
                {formData.interests.length} selected
              </div>
            )}
          </div>
        );

      case 3: // Budget (was case 3, now case 3 after dates)
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">💰</div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">{steps[3].title}</h2>
              <p className="text-gray-300">{steps[3].subtitle}</p>
            </div>
            <div className="space-y-4">
              {[
                { value: 'budget', label: 'Budget-Friendly', icon: '💵', desc: 'Affordable options' },
                { value: 'moderate', label: 'Moderate', icon: '💳', desc: 'Balanced spending' },
                { value: 'luxury', label: 'Luxury', icon: '💎', desc: 'Premium experience' },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    setFormData({ ...formData, budget: option.value });
                    setTimeout(() => handleNext(), 300);
                  }}
                  className={`w-full p-6 rounded-xl transition-all transform hover:scale-105 ${
                    formData.budget === option.value
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-xl scale-105'
                      : 'bg-gray-700/60 backdrop-blur-sm border-2 border-emerald-500/30 text-gray-200 hover:border-emerald-500/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-4xl">{option.icon}</div>
                      <div className="text-left">
                        <div className="font-bold text-lg">{option.label}</div>
                        <div className="text-sm opacity-80">{option.desc}</div>
                      </div>
                    </div>
                    {formData.budget === option.value && (
                      <div className="text-2xl">✓</div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 4: // Travelers
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">👥</div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">{steps[4].title}</h2>
              <p className="text-gray-300">{steps[4].subtitle}</p>
            </div>
            <div className="text-center">
              <div className="text-6xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-4">
                {formData.travelerCount}
              </div>
              <div className="text-gray-300 mb-6">traveler{formData.travelerCount !== 1 ? 's' : ''}</div>
              <div className="flex items-center justify-center gap-4 mb-8">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, travelerCount: Math.max(1, formData.travelerCount - 1) })}
                  className="w-12 h-12 rounded-full bg-emerald-900/50 backdrop-blur-sm text-emerald-300 hover:bg-emerald-800/70 transition-colors font-bold text-xl"
                >
                  −
                </button>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={formData.travelerCount}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 1;
                    setFormData({ ...formData, travelerCount: Math.min(20, Math.max(1, val)) });
                  }}
                  className="w-24 px-4 py-2 text-center text-2xl font-bold border-2 border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, travelerCount: Math.min(20, formData.travelerCount + 1) })}
                  className="w-12 h-12 rounded-full bg-emerald-900/50 backdrop-blur-sm text-emerald-300 hover:bg-emerald-800/70 transition-colors font-bold text-xl"
                >
                  +
                </button>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 4, 6].map((count) => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => setFormData({ ...formData, travelerCount: count })}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                      formData.travelerCount === count
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg'
                        : 'bg-emerald-900/40 backdrop-blur-sm text-emerald-300 hover:bg-emerald-900/60 border border-emerald-500/30'
                    }`}
                  >
                    {count}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-300">
            Step {currentStep + 1} of {steps.length}
          </span>
          <span className="text-sm font-medium text-emerald-400">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="w-full bg-gray-700/60 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-emerald-500 to-teal-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Card */}
      <div className="bg-gray-800/60 backdrop-blur-sm rounded-3xl shadow-2xl border border-emerald-500/30 p-8 md:p-12 min-h-[500px] flex flex-col">
        <div className="flex-1">
          <div
            key={currentStep}
            className="animate-fade-in"
          >
            {renderStepContent()}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-emerald-500/30">
          <button
            type="button"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="px-6 py-3 bg-gray-700/60 text-gray-200 rounded-xl font-semibold hover:bg-gray-600/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            ← Previous
          </button>
          <button
            type="button"
            onClick={handleNext}
            disabled={loading || (currentStep === 0 && !formData.destination.trim()) || (currentStep === 2 && formData.interests.length === 0)}
            className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
          >
            {currentStep === steps.length - 1
              ? (loading ? 'Generating...' : '✨ Generate Itinerary')
              : 'Next →'}
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

