'use client';

const formatPrice = (price) => {
  if (!price) return '';
  const priceStr = String(price).replace(/[₹$€£,]/g, '').trim();
  const priceNum = parseInt(priceStr) || 0;
  if (priceNum === 0) return price;
  return `₹${priceNum.toLocaleString('en-IN')}`;
};

export default function FlightSuggestions({ flights }) {
  if (!flights || flights.length === 0) return null;

  return (
    <div className="bg-gradient-to-br from-blue-900/40 via-indigo-900/40 to-purple-900/40 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border-2 border-blue-500/30">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-100 flex items-center gap-3 mb-2">
          <span className="text-4xl">✈️</span>
          Flight Suggestions
        </h2>
        <p className="text-gray-300">Recommended flights for your trip</p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-4">
        {flights.map((flight, idx) => (
          <div 
            key={idx}
            className="bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 border-2 border-blue-500/30 hover:border-blue-500/60 hover:shadow-lg transition-all flex flex-col min-h-[280px]"
          >
            <div className="flex items-start justify-between mb-4 flex-shrink-0">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl flex-shrink-0">✈️</span>
                  <h3 className="font-bold text-lg text-gray-100 truncate">{flight.airline || 'Flight'}</h3>
                </div>
                <p className="text-sm text-blue-400 font-medium mb-1 truncate">
                  {flight.type === 'outbound' ? '🛫 Outbound Flight' : '🛬 Return Flight'}
                </p>
              </div>
            </div>

            <div className="space-y-3 flex-1 flex flex-col">
              <div className="flex items-center justify-between gap-3 flex-1">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-400 mb-1">From</p>
                  <p className="font-semibold text-gray-100 truncate" title={flight.departureAirport}>{flight.departureAirport}</p>
                  {flight.departureTime && (
                    <p className="text-sm text-gray-300 truncate">🕐 {flight.departureTime}</p>
                  )}
                </div>
                <div className="text-2xl text-blue-500 flex-shrink-0 px-2">→</div>
                <div className="text-right flex-1 min-w-0">
                  <p className="text-xs text-gray-400 mb-1">To</p>
                  <p className="font-semibold text-gray-100 truncate" title={flight.arrivalAirport}>{flight.arrivalAirport}</p>
                  {flight.arrivalTime && (
                    <p className="text-sm text-gray-300 truncate">🕐 {flight.arrivalTime}</p>
                  )}
                </div>
              </div>

              {flight.price && (
                <div className="pt-3 border-t border-gray-700 flex-shrink-0">
                  <p className="text-emerald-400 font-bold text-xl mb-3 truncate">
                    {formatPrice(flight.price)}
                  </p>
                </div>
              )}

              {flight.bookingLink && (
                <a
                  href={flight.bookingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-center rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 block flex-shrink-0"
                >
                  ✈️ Book Flight
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

