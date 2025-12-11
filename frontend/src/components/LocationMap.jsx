import React, { useEffect, useRef } from 'react';

const LocationMap = ({ location, className = '' }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const isInitializedRef = useRef(false);

  // Initialize map with world view
  useEffect(() => {
    if (!mapRef.current || isInitializedRef.current) return;

    const initMap = async () => {
      const L = await import('leaflet');

      // Import Leaflet CSS if not already loaded
      if (!document.querySelector('link[href*="leaflet.css"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
        link.crossOrigin = '';
        document.head.appendChild(link);
      }

      // Initialize map with world view (zoom level 2 shows the whole world)
      const map = L.map(mapRef.current).setView([20, 0], 2);
      mapInstanceRef.current = map;
      isInitializedRef.current = true;

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
        minZoom: 1,
      }).addTo(map);
    };

    initMap();
  }, []);

  // Update map when location is selected
  useEffect(() => {
    if (!mapInstanceRef.current || !location || !location.lat || !location.lon) {
      return;
    }

    const updateMapLocation = async () => {
      const L = await import('leaflet');

      // Remove existing marker if it exists
      if (markerRef.current) {
        mapInstanceRef.current.removeLayer(markerRef.current);
        markerRef.current = null;
      }

      // Create custom marker icon
      const customIcon = L.divIcon({
        className: 'custom-location-marker',
        html: `
          <div style="
            width: 40px;
            height: 40px;
            background: #9333ea;
            border: 4px solid white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          ">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40],
      });

      // Add marker at selected location
      const marker = L.marker([location.lat, location.lon], {
        icon: customIcon,
      }).addTo(mapInstanceRef.current);

      markerRef.current = marker;

      // Add popup with location name
      marker.bindPopup(`
        <div style="text-align: center; padding: 8px;">
          <strong style="color: #9333ea;">${location.displayName || 'Selected Location'}</strong>
        </div>
      `).openPopup();

      // Smoothly pan and zoom to the selected location
      mapInstanceRef.current.setView([location.lat, location.lon], 15, {
        animate: true,
        duration: 1.0,
      });
    };

    updateMapLocation();
  }, [location]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
        isInitializedRef.current = false;
      }
    };
  }, []);

  return (
    <div className={`rounded-lg overflow-hidden border border-gray-200 ${className}`} style={{ minHeight: '300px' }}>
      <div ref={mapRef} className="w-full h-full" style={{ minHeight: '300px', zIndex: 1 }} />
    </div>
  );
};

export default LocationMap;

