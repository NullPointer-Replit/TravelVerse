'use client';

import { useEffect, useRef, useState } from 'react';

export default function ItineraryMap({ itinerary, destination }) {
  const mapRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (!itinerary || !destination) return;

    // Check if Google Maps API key is available
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      setMapLoaded(false);
      return;
    }

    // Load Google Maps script
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = initializeMap;
      script.onerror = () => {
        setMapLoaded(false);
      };
      document.head.appendChild(script);
    } else {
      initializeMap();
    }

    function initializeMap() {
      if (!mapRef.current || !window.google) return;

      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address: destination }, (results, status) => {
        if (status === 'OK' && results[0]) {
          const location = results[0].geometry.location;
          
          const map = new window.google.maps.Map(mapRef.current, {
            zoom: 13,
            center: location,
            styles: [
              {
                featureType: 'poi',
                elementType: 'labels',
                stylers: [{ visibility: 'off' }]
              }
            ]
          });

          const dayMarkers = [];
          const allWaypoints = [];
          let bounds = new window.google.maps.LatLngBounds();
          bounds.extend(location);

          // Add big markers for each day
          itinerary.forEach((day, dayIndex) => {
            // Collect all locations for this day
            const dayLocations = [
              day.morning?.location,
              day.lunch?.location,
              day.afternoon?.location,
              day.dinner?.location,
              day.evening?.location,
            ].filter(Boolean);

            if (dayLocations.length > 0) {
              // Use the first location as the day marker position
              const primaryLocation = dayLocations[0];
              
              geocoder.geocode({ address: `${primaryLocation}, ${destination}` }, (results, status) => {
                if (status === 'OK' && results[0]) {
                  const position = results[0].geometry.location;
                  bounds.extend(position);

                  // Create big day marker
                  const dayMarker = new window.google.maps.Marker({
                    position: position,
                    map: map,
                    title: `Day ${day.day}`,
                    label: {
                      text: `Day ${day.day}`,
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '14px'
                    },
                    icon: {
                      path: window.google.maps.SymbolPath.CIRCLE,
                      scale: 20,
                      fillColor: '#10b981',
                      fillOpacity: 1,
                      strokeColor: '#ffffff',
                      strokeWeight: 4,
                    },
                    zIndex: 1000 - dayIndex // Earlier days on top
                  });

                  // Create info window for day
                  const dayInfo = new window.google.maps.InfoWindow({
                    content: `
                      <div style="padding: 12px; min-width: 250px;">
                        <div style="font-weight: bold; color: #10b981; font-size: 18px; margin-bottom: 8px;">
                          📅 Day ${day.day}
                        </div>
                        <div style="font-size: 14px; color: #666; margin-bottom: 4px;">
                          ${day.morning?.activity ? `🌅 ${day.morning.activity}` : ''}
                        </div>
                        <div style="font-size: 14px; color: #666; margin-bottom: 4px;">
                          ${day.lunch?.name ? `🍽️ ${day.lunch.name}` : ''}
                        </div>
                        <div style="font-size: 14px; color: #666; margin-bottom: 4px;">
                          ${day.afternoon?.activity ? `☀️ ${day.afternoon.activity}` : ''}
                        </div>
                        <div style="font-size: 14px; color: #666;">
                          ${day.dinner?.name ? `🍷 ${day.dinner.name}` : ''}
                        </div>
                      </div>
                    `
                  });

                  dayMarker.addListener('click', () => {
                    // Close all other info windows
                    dayMarkers.forEach(m => {
                      if (m.infoWindow) m.infoWindow.close();
                    });
                    dayInfo.open(map, dayMarker);
                  });

                  dayMarkers.push({ marker: dayMarker, infoWindow: dayInfo });

                  // Add waypoints for the day (smaller markers)
                  dayLocations.slice(1).forEach((waypointLocation) => {
                    geocoder.geocode({ address: `${waypointLocation}, ${destination}` }, (results, status) => {
                      if (status === 'OK' && results[0]) {
                        const waypointPosition = results[0].geometry.location;
                        bounds.extend(waypointPosition);

                        const waypointMarker = new window.google.maps.Marker({
                          position: waypointPosition,
                          map: map,
                          icon: {
                            path: window.google.maps.SymbolPath.CIRCLE,
                            scale: 6,
                            fillColor: '#34d399',
                            fillOpacity: 0.8,
                            strokeColor: '#ffffff',
                            strokeWeight: 2,
                          },
                          zIndex: 500
                        });

                        allWaypoints.push(waypointMarker);
                      }
                    });
                  });
                }
              });
            }
          });

          // Fit bounds to show all markers after a delay
          setTimeout(() => {
            if (bounds.getNorthEast() && bounds.getSouthWest()) {
              map.fitBounds(bounds);
              const listener = window.google.maps.event.addListener(map, 'idle', () => {
                if (map.getZoom() > 14) map.setZoom(14);
                window.google.maps.event.removeListener(listener);
              });
            }
          }, 1000);

          setMapLoaded(true);
        }
      });
    }
  }, [itinerary, destination]);

  if (!itinerary || !destination) return null;

  const hasGoogleMapsKey = typeof window !== 'undefined' && !!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  return (
    <div className="bg-gray-800/60 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-emerald-500/30">
      <h2 className="text-2xl font-bold text-gray-100 mb-4 flex items-center gap-2">
        🗺️ Map View
      </h2>
      <div className="relative w-full h-96 rounded-xl overflow-hidden border border-emerald-500/30">
        {hasGoogleMapsKey ? (
          <>
            <div ref={mapRef} className="w-full h-full" />
            {!mapLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-emerald-900/40 to-teal-900/40">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400 mx-auto mb-4"></div>
                  <p className="text-gray-300">Loading map...</p>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-900/40 to-teal-900/40">
            <div className="text-center p-6">
              <p className="text-gray-300 mb-2">🗺️ Map View</p>
              <p className="text-sm text-gray-400">
                Add <code className="bg-gray-700/60 px-2 py-1 rounded text-gray-200">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> to your environment variables to enable map view
              </p>
            </div>
          </div>
        )}
      </div>
      {hasGoogleMapsKey && (
        <p className="mt-3 text-sm text-gray-300">
          Large markers labeled "Day 1", "Day 2", etc. show primary locations for each day. Smaller green markers are waypoints. Click markers to see day details.
        </p>
      )}
    </div>
  );
}

