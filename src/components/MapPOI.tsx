import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Bus, 
  TreePine, 
  ShoppingCart,
  Navigation,
  Leaf,
  Info,
  RefreshCw,
  Recycle,
  Zap
} from 'lucide-react';

declare global {
  interface Window {
    google: any;
    initMapPOI: () => void;
  }
}

type FilterType = 'recycling' | 'ev' | 'transit';

interface NearbySuggestion {
  name: string;
  type: 'bus_station' | 'park' | 'grocery_store' | 'recycling' | 'ev';
  distance: number;
  suggestion: string;
  co2Savings: string;
}

const CACHE_TTL_MS = 1000 * 60 * 5; // 5 minutes
// Google Maps API Key
const API_KEY = 'AIzaSyD_i-QqqBVmLeqSALkPk4x75_tJCKns3rM';

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
  const [cityName, setCityName] = useState<string>('Your Location');
  const [nearbySuggestions, setNearbySuggestions] = useState<NearbySuggestion[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Generate context-aware suggestions based on detected places
  const generateSuggestions = useCallback((places: any[], category: string) => {
    const suggestions: NearbySuggestion[] = [];
    
    places.slice(0, 2).forEach(place => {
      if (!place.geometry?.location) return;
      
      const distance = userLocation 
        ? Math.round(window.google.maps.geometry?.spherical?.computeDistanceBetween?.(
            new window.google.maps.LatLng(userLocation.lat, userLocation.lng),
            place.geometry.location
          ) || Math.random() * 300 + 100)
        : Math.round(Math.random() * 300 + 100);

      if (category === 'transit') {
        suggestions.push({
          name: place.name || 'Bus Stop',
          type: 'bus_station',
          distance,
          suggestion: `A bus stop is ${distance}m away — switching to public transport saves ~1.8 kg CO₂/day.`,
          co2Savings: '1.8 kg CO₂/day'
        });
      } else if (category === 'ev') {
        suggestions.push({
          name: place.name || 'EV Charging',
          type: 'ev',
          distance,
          suggestion: `EV charger ${distance}m away — electric vehicles reduce emissions by 50-70%.`,
          co2Savings: '50-70% reduction'
        });
      } else if (category === 'recycling') {
        suggestions.push({
          name: place.name || 'Recycling Center',
          type: 'recycling',
          distance,
          suggestion: `Recycling center ${distance}m away — recycling saves resources and reduces landfill.`,
          co2Savings: 'Reduces waste'
        });
      }
    });

    setNearbySuggestions(prev => [...prev.slice(0, 3), ...suggestions].slice(0, 5));
  }, [userLocation]);

  // Load Google Maps script and auto-detect location
  useEffect(() => {
    // Clear any stale cache that might have bad data
    try {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('places:')) {
          localStorage.removeItem(key);
        }
      });
    } catch (e) {
      // Ignore cache clearing errors
    }

    if (window.google) {
      initMap();
      return;
    }

    window.initMapPOI = () => {
      initMap();
    };

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places,geometry&callback=initMapPOI`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    return () => {
      delete window.initMapPOI;
    };
  }, []);

  // Auto-detect location on mount
  useEffect(() => {
    if (map && placesService && infoWindow && !userLocation) {
      // Try to get user location automatically
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            setUserLocation(loc);
            map.setCenter(loc);
            map.setZoom(14);
            
            // Reverse geocode to get city name
            if (window.google) {
              const geocoder = new window.google.maps.Geocoder();
              geocoder.geocode({ location: loc }, (results: any[], status: string) => {
                if (status === 'OK' && results[0]) {
                  const cityComponent = results[0].address_components?.find(
                    (c: any) => c.types.includes('locality') || c.types.includes('administrative_area_level_2')
                  );
                  if (cityComponent) {
                    setCityName(cityComponent.long_name);
                  }
                }
              });
            }
            
            // Search for nearby places
            performSearches(new window.google.maps.LatLng(loc.lat, loc.lng), placesService, infoWindow);
            
            // Generate context-aware suggestions
            generateContextSuggestions(loc, placesService);
          },
          () => {
            console.log('Location permission denied - using default location');
            // Use default location
            performSearches(map.getCenter(), placesService, infoWindow);
          },
          { enableHighAccuracy: false, timeout: 10000 }
        );
      }
    }
  }, [map, placesService, infoWindow]);

  // Generate context-aware suggestions based on nearby places
  const generateContextSuggestions = (location: { lat: number; lng: number }, service: any) => {
    const suggestions: NearbySuggestion[] = [];
    
    // Search for bus stations
    service.nearbySearch(
      { location, radius: 500, type: 'bus_station' },
      (results: any[], status: string) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && results?.length) {
          results.slice(0, 2).forEach(place => {
            if (!place.geometry?.location) return;
            const distance = Math.round(
              window.google.maps.geometry.spherical.computeDistanceBetween(
                new window.google.maps.LatLng(location.lat, location.lng),
                place.geometry.location
              )
            );
            suggestions.push({
              name: place.name || 'Bus Stop',
              type: 'bus_station',
              distance,
              suggestion: `A bus stop is ${distance}m away — switching to public transport saves ~1.8 kg CO₂/day.`,
              co2Savings: '1.8 kg CO₂/day'
            });
          });
          setNearbySuggestions(prev => [...prev.filter(s => s.type !== 'bus_station'), ...suggestions.filter(s => s.type === 'bus_station')].slice(0, 5));
        }
      }
    );

    // Search for parks
    service.nearbySearch(
      { location, radius: 500, type: 'park' },
      (results: any[], status: string) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && results?.length) {
          results.slice(0, 1).forEach(place => {
            if (!place.geometry?.location) return;
            const distance = Math.round(
              window.google.maps.geometry.spherical.computeDistanceBetween(
                new window.google.maps.LatLng(location.lat, location.lng),
                place.geometry.location
              )
            );
            setNearbySuggestions(prev => {
              const newSugg: NearbySuggestion = {
                name: place.name || 'Park',
                type: 'park',
                distance,
                suggestion: `A park is nearby (${distance}m) — walking here supports heart health and zero emissions.`,
                co2Savings: 'Zero emissions'
              };
              return [...prev.filter(s => s.type !== 'park'), newSugg].slice(0, 5);
            });
          });
        }
      }
    );

    // Search for grocery stores/markets
    service.nearbySearch(
      { location, radius: 500, type: 'grocery_or_supermarket' },
      (results: any[], status: string) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && results?.length) {
          results.slice(0, 1).forEach(place => {
            if (!place.geometry?.location) return;
            const distance = Math.round(
              window.google.maps.geometry.spherical.computeDistanceBetween(
                new window.google.maps.LatLng(location.lat, location.lng),
                place.geometry.location
              )
            );
            setNearbySuggestions(prev => {
              const newSugg: NearbySuggestion = {
                name: place.name || 'Local Market',
                type: 'grocery_store',
                distance,
                suggestion: `Local market ${distance}m away — choosing unpackaged food reduces plastic waste.`,
                co2Savings: 'Reduces plastic waste'
              };
              return [...prev.filter(s => s.type !== 'grocery_store'), newSugg].slice(0, 5);
            });
          });
        }
      }
    );
  };

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
    let idleTimer: ReturnType<typeof setTimeout>;
    mapInstance.addListener('idle', () => {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        performSearches(mapInstance.getCenter(), placesServiceInstance, infoWindowInstance);
      }, 600);
    });
  };

  const clearMarkers = () => {
    markers.forEach((m) => {
      if (m && typeof m.setMap === 'function') m.setMap(null);
    });
    setMarkers([]);
  };

  // Sanitize place results to avoid deprecated properties that throw errors
  const sanitizePlaceResults = (results: any[]) => {
    return results.map((place) => ({
      place_id: place.place_id,
      name: place.name,
      geometry: place.geometry ? {
        location: {
          lat: typeof place.geometry.location.lat === 'function' 
            ? place.geometry.location.lat() 
            : place.geometry.location.lat,
          lng: typeof place.geometry.location.lng === 'function' 
            ? place.geometry.location.lng() 
            : place.geometry.location.lng,
        }
      } : null,
      formatted_address: place.formatted_address,
      vicinity: place.vicinity,
    }));
  };

  const saveCache = (key: string, value: any) => {
    try {
      // Sanitize to avoid deprecated getters like open_now
      const sanitized = sanitizePlaceResults(value);
      const payload = { ts: Date.now(), data: sanitized };
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
    // Guard: ensure Google Maps is loaded
    if (!window.google?.maps) {
      console.warn('Google Maps not ready yet');
      return;
    }

    // Guard: ensure Places service is valid
    if (!service || typeof service.textSearch !== 'function') {
      console.warn('Places service not ready yet');
      return;
    }

    // Normalize lat/lng to handle both LatLng objects and plain {lat, lng} objects
    const lat = typeof location?.lat === 'function' ? location.lat() : (location?.lat ?? 0);
    const lng = typeof location?.lng === 'function' ? location.lng() : (location?.lng ?? 0);
    
    // Guard against invalid coordinates
    if (!lat || !lng) {
      console.warn('Invalid location coordinates');
      return;
    }
    
    const cacheKey = `places:${categoryKey}:${lat.toFixed(4)}:${lng.toFixed(4)}`;
    const cached = loadCache(cacheKey);

    if (cached) {
      placeResultsToMarkers(cached, iconColor, service, infoWin, markersArray);
      return;
    }

    setApiCallCount((prev) => prev + 1);
    setLoading(true);

    // Ensure we pass a proper LatLng object to the API
    const searchLocation = typeof location?.lat === 'function' 
      ? location 
      : new window.google.maps.LatLng(lat, lng);

    const request = {
      location: searchLocation,
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
      
      // Handle both cached (plain object) and fresh (LatLng) location formats
      const position = typeof place.geometry.location.lat === 'function'
        ? place.geometry.location
        : new window.google.maps.LatLng(place.geometry.location.lat, place.geometry.location.lng);

      const marker = new window.google.maps.Marker({
        map,
        position,
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
        setUserLocation(loc);
        map.setCenter(loc);
        map.setZoom(14);
        performSearches(loc, placesService, infoWindow);
        
        // Reverse geocode to get city name
        if (window.google) {
          const geocoder = new window.google.maps.Geocoder();
          geocoder.geocode({ location: loc }, (results: any[], status: string) => {
            if (status === 'OK' && results[0]) {
              const cityComponent = results[0].address_components?.find(
                (c: any) => c.types.includes('locality') || c.types.includes('administrative_area_level_2')
              );
              if (cityComponent) {
                setCityName(cityComponent.long_name);
              }
            }
          });
        }
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

  const SUGGESTION_ICONS = {
    bus_station: Bus,
    park: TreePine,
    grocery_store: ShoppingCart,
    recycling: Recycle,
    ev: Zap
  };

  const SUGGESTION_COLORS = {
    bus_station: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    park: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    grocery_store: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
    recycling: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    ev: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
  };

  return (
    <div className="space-y-4">
      {/* Context-Aware Suggestions Card */}
      {nearbySuggestions.length > 0 && (
        <Card className="glass rounded-2xl border-0 shadow-lg">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="font-poppins font-bold text-lg flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Nearby Smart Suggestions
              </CardTitle>
              <div className="flex items-center gap-2">
                <Navigation className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{cityName}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {nearbySuggestions.slice(0, 3).map((suggestion, index) => {
              const Icon = SUGGESTION_ICONS[suggestion.type] || MapPin;
              const colorClass = SUGGESTION_COLORS[suggestion.type] || 'bg-gray-100 text-gray-700';
              
              return (
                <div 
                  key={index}
                  className="flex items-start gap-3 p-3 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors"
                >
                  <div className={`p-2 rounded-lg ${colorClass}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{suggestion.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        {suggestion.distance}m
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {suggestion.suggestion}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <Leaf className="h-3 w-3 text-green-500" />
                      <span className="text-xs text-green-600 font-medium">
                        {suggestion.co2Savings}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {/* Privacy notice */}
            <div className="flex items-start gap-2 pt-2 border-t">
              <Info className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground">
                We only check nearby public places. We never track or store your movements.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

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
            <Recycle className="h-4 w-4 mr-1" /> Recycling
          </Button>
          <Button
            variant={activeFilters.has('ev') ? 'default' : 'outline'}
            size="sm"
            onClick={() => toggleFilter('ev')}
          >
            <Zap className="h-4 w-4 mr-1" /> EV Chargers
          </Button>
          <Button
            variant={activeFilters.has('transit') ? 'default' : 'outline'}
            size="sm"
            onClick={() => toggleFilter('transit')}
          >
            <Bus className="h-4 w-4 mr-1" /> Transit
          </Button>
        </div>

        <Button variant="secondary" onClick={handleGeolocation} disabled={loading}>
          <Navigation className="h-4 w-4 mr-1" /> Use My Location
        </Button>
      </div>

      <div
        ref={mapRef}
        className="w-full h-[500px] rounded-2xl border shadow-lg"
        role="region"
        aria-label="Interactive map showing recycling centers, EV charging stations, and public transit"
      />

      {loading && <div className="text-sm text-muted-foreground animate-pulse">Loading places...</div>}

      <div className="text-xs text-muted-foreground flex items-center justify-between">
        <span>API calls: {apiCallCount} | Cache: 5 min | Markers: {markers.length}</span>
        {userLocation && (
          <Badge variant="outline" className="text-xs">
            {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
          </Badge>
        )}
      </div>
    </div>
  );
}
