'use client';

import { useState, useEffect } from 'react';

export default function PackingList({ destination, days, interests, startDate, onSave, savedPackingList }) {
  const [packingList, setPackingList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);

  useEffect(() => {
    // If saved packing list is provided, use it
    if (savedPackingList && savedPackingList.length > 0) {
      setPackingList(savedPackingList);
      setLoading(false);
      return;
    }

    // Otherwise generate new one
    if (destination && days && days > 0) {
      generatePackingList();
    } else {
      // Reset packing list if conditions not met
      setPackingList([]);
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [destination, days, interests, savedPackingList]);

  const generatePackingList = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/generate-packing-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destination, days, interests, startDate }),
      });

      const result = await response.json();
      if (result.success && result.data) {
        // Handle both direct array and nested packingList structure
        const dataArray = Array.isArray(result.data) ? result.data : (result.data.packingList || []);
        // Initialize checked state for all items
        const listWithChecked = dataArray.map(category => ({
          ...category,
          checked: category.checked || {}
        }));
        setPackingList(listWithChecked);
      } else {
        // Fallback to default list
        const defaultList = getDefaultPackingList();
        const listWithChecked = defaultList.map(category => ({
          ...category,
          checked: category.checked || {}
        }));
        setPackingList(listWithChecked);
      }
    } catch (error) {
      console.error('Error generating packing list:', error);
      const defaultList = getDefaultPackingList();
      const listWithChecked = defaultList.map(category => ({
        ...category,
        checked: category.checked || {}
      }));
      setPackingList(listWithChecked);
    } finally {
      setLoading(false);
    }
  };

  const getDefaultPackingList = () => {
    const essentials = [
      { category: 'Clothing', items: ['T-shirts', 'Pants/Jeans', 'Underwear', 'Socks', 'Pajamas'] },
      { category: 'Footwear', items: ['Comfortable walking shoes', 'Sandals'] },
      { category: 'Toiletries', items: ['Toothbrush', 'Toothpaste', 'Shampoo', 'Soap', 'Deodorant'] },
      { category: 'Documents', items: ['Passport/ID', 'Travel insurance', 'Flight tickets', 'Hotel reservations'] },
      { category: 'Electronics', items: ['Phone charger', 'Power bank', 'Camera'] },
      { category: 'Essentials', items: ['Wallet', 'Keys', 'Medications', 'Sunglasses'] },
    ];

    if (days > 7) {
      essentials[0].items.push('Extra clothes for longer stay');
    }

    if (interests?.includes('Adventure')) {
      essentials.push({ category: 'Adventure Gear', items: ['Hiking boots', 'Backpack', 'Water bottle'] });
    }

    if (interests?.includes('Nature')) {
      essentials.push({ category: 'Nature Gear', items: ['Insect repellent', 'Sunscreen', 'Hat'] });
    }

    return essentials;
  };

  const toggleItem = (categoryIndex, itemIndex, e) => {
    e.preventDefault();
    e.stopPropagation();
    setPackingList((prev) => {
      const newList = prev.map((category, catIdx) => {
        if (catIdx === categoryIndex) {
          const checked = category.checked || {};
          return {
            ...category,
            checked: {
              ...checked,
              [itemIndex]: !checked[itemIndex]
            }
          };
        }
        return category;
      });
      // Auto-save when item is checked/unchecked
      if (onSave) {
        setTimeout(() => onSave(newList), 500); // Debounce auto-save, pass current state
      }
      return newList;
    });
  };

  const getTotalItems = () => {
    return packingList.reduce((total, category) => total + category.items.length, 0);
  };

  const getCheckedItems = () => {
    return packingList.reduce((total, category) => {
      const checked = category.checked || {};
      return total + Object.values(checked).filter(Boolean).length;
    }, 0);
  };

  const progressPercentage = packingList.length > 0 ? (getCheckedItems() / getTotalItems()) * 100 : 0;

  if (loading && !showOverlay && packingList.length === 0) {
    return (
      <button
        onClick={() => setShowOverlay(true)}
        className="w-full bg-gray-800/60 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-emerald-500/30 hover:shadow-2xl transition-all cursor-pointer text-center"
      >
        <div className="flex flex-col items-center justify-center">
          <div className="text-7xl mb-4">🧳</div>
          <h3 className="text-xl font-bold text-gray-100 mb-2">Packing List</h3>
          <p className="text-sm text-gray-400 mb-3">Generating your checklist...</p>
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-500"></div>
        </div>
      </button>
    );
  }

  if (!destination || !days || days === 0) {
    return (
      <div className="w-full bg-gray-800/60 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-emerald-500/30 text-center">
        <div className="flex flex-col items-center justify-center">
          <div className="text-7xl mb-4">🧳</div>
          <h3 className="text-xl font-bold text-gray-100 mb-2">Packing List</h3>
          <p className="text-sm text-gray-400">Generate an itinerary to see your packing checklist</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Clickable Card - Redesigned */}
      <button
        onClick={() => setShowOverlay(true)}
        className="w-full bg-gradient-to-br from-emerald-900/30 via-teal-900/30 to-cyan-900/30 p-6 rounded-2xl shadow-xl border-2 border-emerald-500/30 hover:border-emerald-500/60 hover:shadow-2xl transition-all cursor-pointer text-center group relative overflow-hidden"
      >
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
        
        <div className="relative flex flex-col items-center justify-center">
          {/* Centered Suitcase Emoji */}
          <div className="text-7xl mb-4 group-hover:scale-110 transition-transform">🧳</div>
          
          <div className="w-full">
            <h3 className="text-xl font-bold text-gray-100 mb-2">Packing List</h3>
            <p className="text-sm text-gray-300 mb-3">
              {packingList.length > 0 
                ? `${getCheckedItems()} of ${getTotalItems()} items packed`
                : 'Click to view your checklist'}
            </p>
            {packingList.length > 0 && (
              <div className="w-full max-w-xs mx-auto h-2 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            )}
          </div>
          
          <div className="mt-4 flex items-center gap-2">
            {packingList.length > 0 && progressPercentage === 100 && (
              <span className="text-2xl">✅</span>
            )}
            <svg className="w-6 h-6 text-emerald-400 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </button>

      {/* Overlay Modal - Redesigned */}
      {showOverlay && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowOverlay(false)}>
          <div className="bg-gray-800/80 backdrop-blur-md rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-emerald-500/30" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6 text-white">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-3xl font-bold flex items-center gap-3">
                  <span className="text-4xl">🧳</span>
                  Packing Checklist
                </h2>
                <button
                  onClick={() => setShowOverlay(false)}
                  className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/20 rounded-lg"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {packingList.length > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span className="font-semibold">{getCheckedItems()} / {getTotalItems()} items</span>
                  </div>
                  <div className="w-full h-3 bg-white/30 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-white transition-all duration-500 rounded-full"
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              {packingList.map((category, catIdx) => {
                const categoryChecked = category.checked || {};
                const categoryProgress = Object.values(categoryChecked).filter(Boolean).length;
                const categoryTotal = category.items.length;
                const categoryPercentage = categoryTotal > 0 ? (categoryProgress / categoryTotal) * 100 : 0;

                    return (
                      <div key={catIdx} className="border-2 border-emerald-500/30 rounded-xl p-5 bg-gradient-to-br from-emerald-900/20 to-teal-900/20 backdrop-blur-sm hover:shadow-lg transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-lg text-emerald-300 flex items-center gap-2">
                        <span className="text-2xl">
                          {categoryPercentage === 100 ? '✅' : '📦'}
                        </span>
                        {category.category}
                      </h3>
                      <span className="text-sm font-medium text-emerald-400">
                        {categoryProgress}/{categoryTotal}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {category.items.map((item, itemIdx) => {
                        const isChecked = (category.checked && category.checked[itemIdx]) || false;
                        return (
                          <button
                            key={itemIdx}
                            type="button"
                            onClick={(e) => toggleItem(catIdx, itemIdx, e)}
                            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all cursor-pointer text-left active:scale-95 ${
                              isChecked
                                ? 'bg-emerald-900/50 border-2 border-emerald-500 shadow-sm'
                                : 'bg-gray-700 border-2 border-emerald-500/30 hover:border-emerald-500/60 hover:bg-gray-600 hover:shadow-sm'
                            }`}
                          >
                            {/* Custom Checkbox */}
                            <div className={`flex-shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
                              isChecked
                                ? 'bg-emerald-500 border-emerald-500'
                                : 'border-emerald-500/50 bg-gray-600'
                            }`}>
                              {isChecked && (
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                            <span className={`flex-1 font-medium ${
                              isChecked 
                                ? 'line-through text-gray-500' 
                                : 'text-gray-200'
                            }`}>
                              {item}
                            </span>
                            {isChecked && (
                              <span className="text-emerald-400 text-xl">✓</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

