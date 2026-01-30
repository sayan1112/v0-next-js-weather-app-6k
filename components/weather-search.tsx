'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Search, MapPin, Loader2, Navigation, Compass, Activity, Clock, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { motion, AnimatePresence } from 'framer-motion'

interface Suggestion {
  id: number;
  name: string;
  region: string;
  country: string;
  lat: number;
  lon: number;
}

interface WeatherSearchProps {
  onSearch: (city: string) => void
  onUseLocation: () => void
  onSelection?: (lat: number, lon: number) => void
  isLoading?: boolean
  placeholder?: string
}

export function WeatherSearch({
  onSearch,
  onUseLocation,
  onSelection,
  isLoading = false,
  placeholder = "Search cities, states, or towns globally...",
}: WeatherSearchProps) {
  const [city, setCity] = useState('')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [recentSearches, setRecentSearches] = useState<{name: string, lat: number, lon: number}[]>([])
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const saved = localStorage.getItem('recent_searches')
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved).slice(0, 5))
      } catch (e) {
        console.error('Failed to parse recent searches', e)
      }
    }
  }, [])

  const saveRecentSearch = (name: string, lat: number, lon: number) => {
    const newSearch = { name, lat, lon }
    const updated = [newSearch, ...recentSearches.filter(s => s.name !== name)].slice(0, 5)
    setRecentSearches(updated)
    localStorage.setItem('recent_searches', JSON.stringify(updated))
  }

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (city.trim().length < 3) {
        setSuggestions([])
        return
      }

      setIsSearching(true)
      try {
        const res = await fetch(`/api/v1/search?q=${encodeURIComponent(city)}`)
        const data = await res.json()
        if (Array.isArray(data)) {
          setSuggestions(data)
        }
      } catch (err) {
        console.error('Search calibration failed:', err)
      } finally {
        setIsSearching(false)
      }
    }

    const timer = setTimeout(fetchSuggestions, 400)
    return () => clearTimeout(timer)
  }, [city])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (city.trim()) {
      onSearch(city)
      setShowSuggestions(false)
    }
  }

  const handleSelect = (s: Suggestion) => {
    setCity(`${s.name}, ${s.country}`)
    setShowSuggestions(false)
    saveRecentSearch(s.name, s.lat, s.lon)
    if (onSelection) {
      onSelection(s.lat, s.lon)
    }
  }

  const isCoordinateInput = (val: string) => {
    const parts = val.split(',').map(p => p.trim());
    if (parts.length === 2) {
      const lat = parseFloat(parts[0]);
      const lon = parseFloat(parts[1]);
      return !isNaN(lat) && !isNaN(lon) && Math.abs(lat) <= 90 && Math.abs(lon) <= 180;
    }
    return false;
  }

  const handleCoordinateSearch = () => {
    const parts = city.split(',').map(p => p.trim());
    const lat = parseFloat(parts[0]);
    const lon = parseFloat(parts[1]);
    if (onSelection) {
      onSelection(lat, lon);
      saveRecentSearch(`${lat}, ${lon}`, lat, lon);
      setShowSuggestions(false);
    }
  }

  return (
    <div className="relative w-full z-[100]" ref={dropdownRef}>
      <motion.form 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit} 
        className="w-full"
      >
        <div className="flex gap-2">
          <div className="relative flex-1 group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none z-10">
              {(isLoading || isSearching) ? (
                <Loader2 className="w-5 h-5 text-primary animate-spin" />
              ) : (
                <Compass className="w-5 h-5 text-primary/60 group-focus-within:text-primary transition-colors" />
              )}
            </div>
            <Input
              placeholder={placeholder}
              value={city}
              onFocus={() => setShowSuggestions(true)}
              onChange={(e) => {
                setCity(e.target.value)
                setShowSuggestions(true)
              }}
              className="pl-12 h-12 bg-white/10 backdrop-blur-2xl border-white/20 text-lg rounded-xl focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all placeholder:text-white/20 text-white font-medium shadow-xl shadow-black/20"
              disabled={isLoading}
            />
          </div>
          
          <Button 
            type="submit" 
            disabled={isLoading || !city.trim()} 
            className="h-12 px-8 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-[0.2em] shadow-lg shadow-primary/20 transition-all active:scale-95 border-none"
          >
            SYNC
          </Button>
          
          <Button
            type="button"
            variant="outline"
            onClick={onUseLocation}
            disabled={isLoading}
            className="h-12 w-12 p-0 rounded-xl bg-white/10 backdrop-blur-2xl border-white/20 hover:bg-white/20 transition-all active:scale-95 group shadow-lg"
            title="Calibrate Current Location"
          >
            <Navigation className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
          </Button>
        </div>
      </motion.form>

      {/* INTELLIGENT SUGGESTIONS DROPDOWN */}
      <AnimatePresence>
        {showSuggestions && (city.length > 0 || recentSearches.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            className="absolute top-16 left-0 right-0 z-[1000] bg-black/95 backdrop-blur-[60px] border border-white/10 rounded-3xl overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,1)] flex flex-col"
          >
            <div className="max-h-[500px] overflow-y-auto custom-scrollbar p-1">
              {/* COORDINATE DETECTOR - TOP PRIORITY */}
              {isCoordinateInput(city) && (
                <button
                  onClick={handleCoordinateSearch}
                  className="w-full p-4 flex items-center gap-4 bg-primary/20 hover:bg-primary/30 transition-all text-left rounded-2xl group border border-primary/20 m-1 mb-2"
                >
                  <div className="p-3 bg-primary rounded-xl text-primary-foreground shadow-lg shadow-primary/40">
                    <Navigation className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-extrabold text-primary text-base uppercase italic tracking-tighter">Precision coordinate sync detected</p>
                    <p className="text-[10px] text-white/60 uppercase tracking-widest mt-0.5">Jump to: {city.trim()}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-primary animate-pulse" />
                </button>
              )}

              {suggestions.length > 0 ? (
                <div className="space-y-1">
                  <div className="px-5 pt-3 pb-1">
                    <p className="text-[8px] font-black uppercase tracking-[0.4em] text-white/20">Satellite Suggestions</p>
                  </div>
                  {suggestions.map((s) => (
                    <button
                      key={`${s.lat}-${s.lon}-${s.id}`}
                      onClick={() => handleSelect(s)}
                      className="w-full p-4 flex items-center gap-4 hover:bg-white/10 transition-all text-left rounded-2xl group border border-transparent hover:border-white/10"
                    >
                      <div className="p-3 bg-white/5 rounded-xl group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                           <p className="font-black text-white text-base md:text-lg leading-tight uppercase italic truncate">{s.name}</p>
                           <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest text-white/40 shrink-0">POS-{s.id.toString().slice(-3)}</span>
                        </div>
                        <p className="text-[11px] text-white/30 uppercase tracking-[0.2em] mt-1 font-bold truncate">
                          {s.region ? `${s.region} • ` : ''}{s.country}
                        </p>
                      </div>
                      <div className="flex flex-col items-end opacity-20 group-hover:opacity-100 transition-opacity">
                        <span className="text-[9px] font-mono text-primary font-bold">{s.lat.toFixed(3)}°</span>
                        <span className="text-[9px] font-mono text-primary font-bold">{s.lon.toFixed(3)}°</span>
                      </div>
                    </button>
                  ))}
                </div>
              ) : city.length === 0 ? (
                <div className="p-2 space-y-2">
                  {recentSearches.length > 0 && (
                     <div className="mb-4">
                        <div className="px-3 pb-2 flex items-center gap-2">
                           <Clock className="w-3 h-3 text-white/20" />
                           <p className="text-[8px] font-black uppercase tracking-[0.4em] text-white/20">Recent Temporal Links</p>
                        </div>
                        <div className="space-y-1">
                           {recentSearches.map((s, i) => (
                             <button 
                               key={i}
                               onClick={() => { if (onSelection) onSelection(s.lat, s.lon); setCity(s.name); setShowSuggestions(false); }}
                               className="w-full p-3 flex items-center gap-4 hover:bg-white/5 transition-all text-left rounded-xl group"
                             >
                               <div className="p-2 bg-white/5 rounded-lg group-hover:text-primary transition-colors">
                                 <Compass className="w-3 h-3" />
                               </div>
                               <span className="text-xs font-bold text-white/60 group-hover:text-white transition-colors truncate">{s.name}</span>
                             </button>
                           ))}
                        </div>
                     </div>
                  )}

                  <div className="px-3 py-2 border-l-2 border-primary/40 bg-primary/5 rounded-r-xl">
                    <p className="text-[8px] font-black uppercase tracking-[0.4em] text-primary/60 mb-3">Priority Tactical Targets</p>
                    <div className="grid grid-cols-2 gap-1.5">
                       {['Thiruvananthapuram', 'London', 'New York', 'Tokyo', 'Pune', 'Paris'].map(loc => (
                         <button 
                           key={loc}
                           onClick={() => { setCity(loc); onSearch(loc); setShowSuggestions(false); }}
                           className="px-3 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-black text-white/40 hover:text-white transition-all text-left truncate uppercase tracking-widest border border-white/5"
                         >
                           {loc}
                         </button>
                       ))}
                    </div>
                  </div>
                  
                  <div className="px-4 py-8 bg-white/5 rounded-2xl border border-white/5 mt-4 flex flex-col items-center gap-3 text-center">
                    <div className="p-4 bg-primary/10 rounded-full ring-1 ring-primary/20">
                       <Compass className="w-6 h-6 text-primary animate-pulse" />
                    </div>
                    <div>
                       <p className="text-xs font-black uppercase tracking-[0.2em] text-white">Precision Targeting Active</p>
                       <p className="text-[9px] text-white/20 uppercase tracking-[0.3em] mt-2 max-w-[240px] leading-relaxed">
                          Enter comma-separated coordinates for direct vector sync.
                       </p>
                    </div>
                  </div>
                </div>
              ) : isSearching ? (
                 <div className="p-24 flex flex-col items-center justify-center gap-6">
                    <div className="relative">
                       <Loader2 className="w-16 h-16 text-primary animate-spin opacity-20" />
                       <div className="absolute inset-0 flex items-center justify-center">
                          <Activity className="w-6 h-6 text-primary animate-pulse" />
                       </div>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[1em] text-white/20 italic animate-pulse">Scanning...</p>
                 </div>
              ) : (
                <div className="p-16 flex flex-col items-center justify-center gap-6 text-center">
                   <div className="p-5 bg-red-500/10 rounded-full ring-1 ring-red-500/20">
                      <Search className="w-10 h-10 text-red-500/20" />
                   </div>
                   <div>
                      <p className="text-xs font-black uppercase tracking-[0.4em] text-white/40">No Signal Detected</p>
                      <p className="text-[9px] text-white/20 uppercase tracking-[0.3em] mt-3 leading-relaxed">
                         The target is out of range. <br />Try standardizing the query or use coordinates.
                      </p>
                   </div>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-white/10 bg-white/5 text-center">
              <p className="text-[8px] text-white/10 uppercase tracking-[0.6em] font-black italic">Geospatial Intelligence Engine • V2.42</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
