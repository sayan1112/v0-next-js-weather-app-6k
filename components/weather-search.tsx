'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Search, MapPin, Loader2, Navigation, Compass } from 'lucide-react'
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
  const dropdownRef = useRef<HTMLDivElement>(null)

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
    if (onSelection) {
      onSelection(s.lat, s.lon)
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
        {showSuggestions && (city.length === 0 || suggestions.length > 0 || isSearching) && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            className="absolute top-16 left-0 right-0 z-[1000] bg-black/90 backdrop-blur-[40px] border border-white/10 rounded-3xl overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.8)] p-3"
          >
            <div className="max-h-[400px] overflow-y-auto custom-scrollbar flex flex-col gap-1">
              {suggestions.length > 0 ? (
                suggestions.map((s) => (
                  <button
                    key={`${s.lat}-${s.lon}-${s.id}`}
                    onClick={() => handleSelect(s)}
                    className="w-full p-4 flex items-center gap-4 hover:bg-white/10 transition-all text-left rounded-2xl group border border-transparent hover:border-white/10"
                  >
                    <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 max-w-full overflow-hidden">
                         <p className="font-black text-white text-base md:text-lg leading-tight uppercase italic truncate">{s.name}</p>
                         <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest text-white/40 shrink-0">Verified</span>
                      </div>
                      <p className="text-[11px] text-white/30 uppercase tracking-[0.2em] mt-1 font-bold truncate">
                        {s.region ? `${s.region} • ` : ''}{s.country}
                      </p>
                    </div>
                    <div className="flex flex-col items-end opacity-20 group-hover:opacity-100 transition-opacity">
                      <span className="text-[9px] font-mono text-primary font-bold">{s.lat.toFixed(3)}° N</span>
                      <span className="text-[9px] font-mono text-primary font-bold">{s.lon.toFixed(3)}° E</span>
                    </div>
                  </button>
                ))
              ) : city.length === 0 ? (
                <div className="p-2 space-y-4">
                  <div className="px-4 py-2 border-l-2 border-primary/40 bg-primary/5 rounded-r-xl">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60 mb-3">Priority Tactical Targets</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                       {['Thiruvananthapuram', 'London', 'New York', 'Tokyo', 'Pune', 'Pune, India'].map(loc => (
                         <button 
                           key={loc}
                           onClick={() => { setCity(loc); onSearch(loc); setShowSuggestions(false); }}
                           className="px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] font-bold text-white/50 hover:text-white transition-all text-left truncate"
                         >
                           {loc}
                         </button>
                       ))}
                    </div>
                  </div>
                  
                  <div className="px-4 py-6 bg-white/5 rounded-2xl border border-white/5 flex flex-col items-center gap-3 text-center">
                    <div className="p-3 bg-primary/10 rounded-full">
                       <Compass className="w-6 h-6 text-primary animate-pulse" />
                    </div>
                    <div>
                       <p className="text-xs font-black uppercase tracking-widest text-white">Precision Targeting Active</p>
                       <p className="text-[10px] text-white/20 uppercase tracking-[0.2em] mt-1 max-w-[200px]">
                          Enter coordinates (e.g. 18.5, 73.8) for perfect location sync if search fails.
                       </p>
                    </div>
                  </div>
                </div>
              ) : isSearching ? (
                 <div className="p-20 flex flex-col items-center justify-center gap-6">
                    <Loader2 className="w-12 h-12 text-primary animate-spin opacity-20" />
                    <p className="text-[10px] font-black uppercase tracking-[0.8em] text-white/20 italic">Scanning Satellite DB...</p>
                 </div>
              ) : (
                <div className="p-10 flex flex-col items-center justify-center gap-4 text-center">
                   <div className="p-4 bg-red-500/10 rounded-full">
                      <Search className="w-8 h-8 text-red-500/40" />
                   </div>
                   <div>
                      <p className="text-xs font-black uppercase tracking-[0.2em] text-white/40">No Signal Detected</p>
                      <p className="text-[10px] text-white/20 uppercase tracking-[0.2em] mt-2">Try entering full coordinates or state name.</p>
                   </div>
                </div>
              )}
            </div>
            <div className="p-3 mt-2 border-t border-white/5 text-center">
              <p className="text-[9px] text-white/10 uppercase tracking-[0.4em] font-black italic">Sayanocast Geospatial Intelligence • Network Active</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
