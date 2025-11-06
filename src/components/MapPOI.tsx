import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

declare global {
  interface Window {
    google: any;
    initMapPOI: () => void;
  }
}

type FilterType = 'recycling' | 'ev' | 'transit';

const CACHE_TTL_MS = 1000 * 60 * 5; // 5 minutes
const API_KEY = 'AIzaSyAu2XMlIlcizlgDJC1eFrpYt0u_sj6qFko';

export default function MapPOI() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [placesService, setPlacesService] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<Set<FilterType>>(
    new Set(['recycling', 'ev', 'transit'])
  );
  const [markers, setMarkers] = useState<any[]>([]);
  const [infoWindow, setInfoWindow] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [apiCallCount, setApiCallCount] = useState(0);

  // Load Google Maps script
  useEffect(() => {
    if (window.google) {
      initMap();
      return;
    }

    window.initMapPOI = () => {
      initMap();
    };

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places&callback=initMapPOI`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    return () => {
      delete window.initMapPOI;
    };
  }, []);

  const initMap = () => {
    if (!mapRef.current || !window.google) return;

    const mapInstance = new window.google.maps.Map(mapRef.current, {
      center: { lat: 19.9975, lng: 73.7898 },
      zoom: 13,
      streetViewControl: false,
      mapTypeControl: false,
    });

    const infoWindowInstance = new window.google.maps.InfoWindow();
    const placesServiceInstance = new window.google.maps.places.PlacesService(mapInstance);

    setMap(mapInstance);
    setInfoWindow(infoWindowInstance);
    setPlacesService(placesServiceInstance);

    // Debounced search on map idle
    let idleTimer: NodeJS.Timeout;
    mapInstance.addListener('idle', () => {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        performSearches(mapInstance.getCenter(), placesServiceInstance, infoWindowInstance);
      }, 600);
    });
  };

  const clearMarkers = () => {
    markers.forEach((m) => m.setMap(null));
    setMarkers([]);
  };

  const saveCache = (key: string, value: any) => {
    try {
      const payload = { ts: Date.now(), data: value };
      localStorage.setItem(key, JSON.stringify(payload));
    } catch (e) {
      console.warn('Cache save failed', e);
    }
  };

  const loadCache = (key: string) => {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      const obj = JSON.parse(raw);
      if (Date.now() - obj.ts > CACHE_TTL_MS) return null;
      return obj.data;
    } catch (e) {
      return null;
    }
  };

  const performSearches = (location: any, service: any, infoWin: any) => {
    clearMarkers();
    const newMarkers: any[] = [];

    const queries: { filter: FilterType; query: string; icon: string }[] = [];
    if (activeFilters.has('recycling')) {
      queries.push({ filter: 'recycling', query: 'recycling center', icon: 'green-dot' });
    }
    if (activeFilters.has('ev')) {
      queries.push({ filter: 'ev', query: 'EV charging station', icon: 'blue-dot' });
    }
    if (activeFilters.has('transit')) {
      queries.push({ filter: 'transit', query: 'bus stop', icon: 'orange-dot' });
    }

    queries.forEach(({ filter, query, icon }) => {
      doPlacesSearch(location, query, filter, icon, service, infoWin, newMarkers);
    });
  };

  const doPlacesSearch = (
    location: any,
    queryText: string,
    categoryKey: string,
    iconColor: string,
    service: any,
    infoWin: any,
    markersArray: any[]
  ) => {
    const cacheKey = `places:${categoryKey}:${location.lat().toFixed(4)}:${location.lng().toFixed(4)}`;
    const cached = loadCache(cacheKey);

    if (cached) {
      placeResultsToMarkers(cached, iconColor, service, infoWin, markersArray);
      return;
    }

    setApiCallCount((prev) => prev + 1);
    setLoading(true);

    const request = {
      location,
      radius: 5000,
      query: queryText,
    };

    service.textSearch(request, (results: any[], status: string) => {
      setLoading(false);
      if (status === window.google.maps.places.PlacesServiceStatus.OK && results?.length) {
        saveCache(cacheKey, results);
        placeResultsToMarkers(results, iconColor, service, infoWin, markersArray);
      }
    });
  };

  const placeResultsToMarkers = (
    results: any[],
    iconColor: string,
    service: any,
    infoWin: any,
    markersArray: any[]
  ) => {
    results.forEach((place) => {
      if (!place.geometry?.location) return;

      const iconUrl = `https://maps.gstatic.com/mapfiles/ms2/micons/${iconColor}.png`;

      const marker = new window.google.maps.Marker({
        map,
        position: place.geometry.location,
        title: place.name,
        icon: { url: iconUrl },
      });

      marker.addListener('click', () => {
        service.getDetails(
          {
            placeId: place.place_id,
            fields: ['name', 'formatted_address', 'formatted_phone_number', 'opening_hours', 'website', 'photos'],
          },
          (detail: any) => {
            let html = `<div style="min-width:200px"><strong>${escapeHtml(place.name)}</strong><br>`;
            html += detail?.formatted_address ? `${detail.formatted_address}<br>` : '';
            if (detail?.formatted_phone_number) html += `☎ ${detail.formatted_phone_number}<br>`;
            if (detail?.website)
              html += `<a href="${detail.website}" target="_blank" rel="noopener">Website</a><br>`;
            if (detail?.opening_hours?.weekday_text) {
              html += `<div style="margin-top:6px; font-size:12px">Hours:<br>${detail.opening_hours.weekday_text.join('<br>')}</div>`;
            }
            html += '</div>';
            infoWin.setContent(html);
            infoWin.open(map, marker);
          }
        );
      });

      markersArray.push(marker);
    });

    setMarkers((prev) => [...prev, ...markersArray]);
  };

  const escapeHtml = (str: string) => {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[m] || m));
  };

  const handleSearch = () => {
    if (!searchQuery.trim() || !window.google || !map) return;

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: searchQuery }, (results: any[], status: string) => {
      if (status === 'OK' && results[0]) {
        const loc = results[0].geometry.location;
        map.setCenter(loc);
        map.setZoom(14);
        performSearches(loc, placesService, infoWindow);
      }
    });
  };

  const handleGeolocation = () => {
    if (!navigator.geolocation || !map) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        map.setCenter(loc);
        map.setZoom(14);
        performSearches(loc, placesService, infoWindow);
      },
      () => alert('Location permission denied or unavailable')
    );
  };

  const toggleFilter = (filter: FilterType) => {
    setActiveFilters((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(filter)) {
        newSet.delete(filter);
      } else {
        newSet.add(filter);
      }
      return newSet;
    });

    if (map && placesService && infoWindow) {
      setTimeout(() => {
        performSearches(map.getCenter(), placesService, infoWindow);
      }, 50);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex gap-2 flex-1 min-w-[200px]">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search location or address"
            className="flex-1"
          />
          <Button onClick={handleSearch} disabled={loading}>
            Search
          </Button>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button
            variant={activeFilters.has('recycling') ? 'default' : 'outline'}
            size="sm"
            onClick={() => toggleFilter('recycling')}
          >
            ♻️ Recycling
          </Button>
          <Button
            variant={activeFilters.has('ev') ? 'default' : 'outline'}
            size="sm"
            onClick={() => toggleFilter('ev')}
          >
            ⚡ EV Chargers
          </Button>
          <Button
            variant={activeFilters.has('transit') ? 'default' : 'outline'}
            size="sm"
            onClick={() => toggleFilter('transit')}
          >
            🚌 Transit
          </Button>
        </div>

        <Button variant="secondary" onClick={handleGeolocation} disabled={loading}>
          📍 Use My Location
        </Button>
      </div>

      <div
        ref={mapRef}
        className="w-full h-[600px] rounded-lg border shadow-lg"
        role="region"
        aria-label="Interactive map showing recycling centers, EV charging stations, and public transit"
      />

      {loading && <div className="text-sm text-muted-foreground">Loading places...</div>}

      <div className="text-xs text-muted-foreground">
        API calls: {apiCallCount} | Cache: 5 min | Markers: {markers.length}
      </div>
    </div>
  );
}
