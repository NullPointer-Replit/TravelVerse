'use client';

import { useEffect, useRef, useState } from 'react';

export default function DayMap({ day, destination }) {
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (!day || !destination) return;

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      setMapLoaded(false);
      return;
    }

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
          const waypoints = [];
          let bounds = new window.google.maps.LatLngBounds();

          // Collect all activities with locations and times
          const activities = [
            { 
              section: 'morning', 
              location: day.morning?.location, 
              activity: day.morning?.activity,
              time: day.morning?.time || 'Morning'
            },
            { 
              section: 'lunch', 
              location: day.lunch?.location, 
              activity: day.lunch?.name,
              time: 'Lunch Time'
            },
            { 
              section: 'afternoon', 
              location: day.afternoon?.location, 
              activity: day.afternoon?.activity,
              time: day.afternoon?.time || 'Afternoon'
            },
            { 
              section: 'dinner', 
              location: day.dinner?.location, 
              activity: day.dinner?.name,
              time: 'Dinner Time'
            },
            { 
              section: 'evening', 
              location: day.evening?.location, 
              activity: day.evening?.activity,
              time: day.evening?.time || 'Evening'
            },
          ].filter(act => act.location);

          let activityIndex = 0;
          activities.forEach((activity) => {
            if (activity.location) {
              geocoder.geocode({ address: `${activity.location}, ${destination}` }, (results, status) => {
                if (status === 'OK' && results[0]) {
                  const position = results[0].geometry.location;
                  bounds.extend(position);

                  // Create marker with timestamp
                  const marker = new window.google.maps.Marker({
                    position: position,
                    map: map,
                    label: {
                      text: `${activityIndex + 1}`,
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '14px'
                    },
                    icon: {
                      path: window.google.maps.SymbolPath.CIRCLE,
                      scale: 12,
                      fillColor: '#10b981',
                      fillOpacity: 1,
                      strokeColor: '#ffffff',
                      strokeWeight: 3,
                    }
                  });

                  // Create info window with timestamp and activity details
                  const infoWindow = new window.google.maps.InfoWindow({
                    content: `
                      <div style="padding: 8px; min-width: 200px;">
                        <div style="font-weight: bold; color: #10b981; margin-bottom: 4px;">
                          🕐 ${activity.time}
                        </div>
                        <div style="font-weight: 600; margin-bottom: 4px;">
                          ${activity.activity || activity.section}
                        </div>
                        <div style="color: #666; font-size: 12px;">
                          📍 ${activity.location}
                        </div>
                      </div>
                    `
                  });

                  marker.addListener('click', () => {
                    // Close all other info windows
                    dayMarkers.forEach(m => {
                      if (m.infoWindow) m.infoWindow.close();
                    });
                    infoWindow.open(map, marker);
                  });

                  dayMarkers.push({ marker, infoWindow, activity });
                  markersRef.current.push(marker);
                  waypoints.push(position);
                  activityIndex++;

                  // Draw route if we have multiple waypoints
                  if (waypoints.length === activities.length) {
                    if (waypoints.length > 1) {
                      const directionsService = new window.google.maps.DirectionsService();
                      const directionsRenderer = new window.google.maps.DirectionsRenderer({
                        map: map,
                        suppressMarkers: true, // We use our own markers
                        polylineOptions: {
                          strokeColor: '#10b981',
                          strokeWeight: 4,
                          strokeOpacity: 0.7
                        }
                      });

                      const route = {
                        origin: waypoints[0],
                        destination: waypoints[waypoints.length - 1],
                        waypoints: waypoints.slice(1, -1).map(wp => ({ location: wp, stopover: true })),
                        travelMode: window.google.maps.TravelMode.DRIVING
                      };

                      directionsService.route(route, (result, status) => {
                        if (status === 'OK') {
                          directionsRenderer.setDirections(result);
                        }
                      });
                    }

                    // Fit bounds to show all markers
                    map.fitBounds(bounds);
                    if (map.getZoom() > 15) map.setZoom(15);
                  }
                }
              });
            }
          });

          setMapLoaded(true);
        }
      });
    }

    return () => {
      // Cleanup markers
      markersRef.current.forEach(marker => {
        if (marker && marker.setMap) {
          marker.setMap(null);
        }
      });
      markersRef.current = [];
    };
  }, [day, destination]);

  if (!day || !destination) return null;

  const hasGoogleMapsKey = typeof window !== 'undefined' && !!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  return (
    <div className="mt-4">
      <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
        🗺️ Day {day.day} Map
      </h3>
      <div className="relative w-full h-64 rounded-xl overflow-hidden border-2 border-emerald-200">
        {hasGoogleMapsKey ? (
          <>
            <div ref={mapRef} className="w-full h-full" />
            {!mapLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-2"></div>
                  <p className="text-sm text-gray-600">Loading map...</p>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50">
            <p className="text-sm text-gray-500 text-center px-4">
              Map view requires Google Maps API key
            </p>
          </div>
        )}
      </div>
      {mapLoaded && (
        <p className="mt-2 text-xs text-gray-600">
          Click markers to see timestamps and activity details. Route shows suggested path.
        </p>
      )}
    </div>
  );
}

