'use client'

import React, { useState, useEffect } from 'react'
import { WeatherSearch } from '@/components/weather-search'
import { WeatherCard } from '@/components/weather-card'
import { ForecastCard } from '@/components/forecast-card'
import { WeatherCharts } from '@/components/weather-charts'
import { ExplainableWeather } from '@/components/intelligence/explainable-weather'
import { SmartInsights } from '@/components/intelligence/smart-insights'
import { ThemeToggle } from '@/components/theme-toggle'
import { 
  AlertCircle, 
  Loader2, 
  Globe as GlobeIcon, 
  Cloud, 
  Wind, 
  Layers, 
  Map as MapIcon, 
  ShieldCheck, 
  Activity, 
  Clock,
  Zap,
  ChevronRight
} from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { WeatherResponse } from '@/types/weather'
import { motion, AnimatePresence } from 'framer-motion'
import dynamic from 'next/dynamic'

// Lazy load the globe
const WorldGlobe = dynamic(() => import('@/components/globe').then(m => m.WorldGlobe), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-black/20 backdrop-blur-md rounded-3xl">
      <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
    </div>
  )
})

export default function Home() {
  const [data, setData] = useState<WeatherResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'forecast' | 'charts' | 'intelligence'>('forecast')
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [timeStep, setTimeStep] = useState(0) // 0-24 for hourly scrub

  // System Calibration on Mount
  useEffect(() => {
    fetchWeather('/api/v1/weather?city=Pune')

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => handleLocationSelect(pos.coords.latitude, pos.coords.longitude),
        () => console.log('Location Calibration: Precision mode declined.')
      )
    }
  }, [])

  const fetchWeather = async (url: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch(url)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Geospatial Sync Out of Range')
      }

      setData(result)
      setSelectedLocation({ lat: result.location.lat, lng: result.location.lon })
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const loadWeatherByCity = (city: string) => {
    fetchWeather(`/api/v1/weather?city=${encodeURIComponent(city)}`)
  }

  const handleLocationSelect = (lat: number, lon: number) => {
    fetchWeather(`/api/v1/weather?lat=${lat}&lon=${lon}`)
  }

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      setError('Geospatial Protocols Restricted')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => handleLocationSelect(pos.coords.latitude, pos.coords.longitude),
      (err) => setError('Precision Calibration Failed: ' + err.message)
    )
  }

  const tabs = [
    { id: 'forecast', label: 'Strategic Range' },
    { id: 'charts', label: 'Thermal Vectors' },
    { id: 'intelligence', label: 'Met-Intelligence' }
  ] as const

  return (
    <div className="min-h-screen w-full bg-[#010208] text-white selection:bg-primary/30 font-sans">
      {/* Premium Background FX */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/5 blur-[160px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-900/10 blur-[160px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* NASA-Grade Tactical Header */}
        <header className="px-10 py-4 flex flex-col lg:flex-row items-center justify-between gap-6 border-b border-white/5 backdrop-blur-3xl bg-black/60 sticky top-0 z-[100]">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-6"
          >
            <div className="p-4 bg-gradient-to-br from-primary to-blue-800 rounded-[2rem] border border-white/20 shadow-[0_0_40px_rgba(59,130,246,0.3)] group cursor-pointer">
              <Activity className="w-10 h-10 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-4xl font-black tracking-tighter uppercase italic bg-gradient-to-r from-white via-white to-white/20 bg-clip-text text-transparent">SAYANOCAST</h1>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                <span className="text-[10px] tracking-[0.5em] font-black text-white/40 uppercase">Strategic Meteorological Intelligence</span>
              </div>
            </div>
          </motion.div>

          <div className="w-full max-w-3xl">
            <WeatherSearch 
              onSearch={loadWeatherByCity} 
              onUseLocation={handleUseLocation}
              onSelection={handleLocationSelect}
              isLoading={isLoading} 
              placeholder="Search cities, regions, or coordinates (e.g. 48.8, 2.3)..."
            />
          </div>

          <div className="hidden lg:flex items-center gap-8">
             <div className="flex flex-col items-end">
                <span className="text-[9px] text-white/20 uppercase tracking-[0.4em] font-black mb-1">Network Quality</span>
                <span className="text-sm font-black text-green-400 italic">SECURE / ENCRYPTED</span>
             </div>
             <ThemeToggle />
          </div>
        </header>

        <main className="flex-1 container mx-auto px-6 py-4 space-y-6">
          {/* Error Terminal */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Alert variant="destructive" className="bg-red-950/40 border-red-500/30 backdrop-blur-3xl text-red-100 rounded-[2.5rem] py-8 px-10 shadow-2xl">
                  <div className="flex items-center gap-6">
                    <div className="p-4 bg-red-500/20 rounded-2xl">
                        <AlertCircle className="h-8 w-8 text-red-500" />
                    </div>
                    <div>
                        <h4 className="text-xl font-black uppercase italic tracking-widest text-red-500">Sync Failure Detected</h4>
                        <AlertDescription className="font-bold opacity-70 mt-2 text-lg">{error}</AlertDescription>
                    </div>
                  </div>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          {/* MAIN TACTICAL GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* LEFT: MASTER GLOBE CONSOLE */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              className="lg:col-span-12 xl:col-span-8 space-y-6"
            >
              <div className="relative glass-card rounded-[2rem] border-white/10 overflow-hidden h-[400px] lg:h-[500px] shadow-[0_20px_40px_-10px_rgba(0,0,0,1)] bg-[#010208]">
                {/* Tactical Scan Overlay - Fills Blank Void when loading/failed */}
                <div className="absolute inset-0 z-0 flex items-center justify-center opacity-10">
                   <div className="w-full h-full" style={{ 
                     backgroundImage: 'radial-gradient(circle, #3b82f6 1px, transparent 1px)', 
                     backgroundSize: '30px 30px' 
                   }} />
                </div>
                
                <div className="absolute inset-0 z-0">
                  <WorldGlobe onLocationSelect={handleLocationSelect} selectedLocation={selectedLocation} />
                </div>
                
                {/* Tactical Overlays */}
                <div className="absolute top-6 left-6 z-10 space-y-3 max-w-[280px]">
                  <div className="glass-card p-4 rounded-2xl border-white/10 backdrop-blur-md bg-black/40">
                    <div className="flex items-center gap-2 mb-2">
                       <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
                       <h3 className="text-sm font-black uppercase italic tracking-wider">Live Earth Console</h3>
                    </div>
                    <p className="text-[10px] text-white/40 leading-relaxed uppercase font-bold">
                       Interactive Global Surface Modeling. Vector selection active.
                    </p>
                    <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-white/10">
                       <div>
                          <p className="text-[7px] text-white/20 uppercase font-black">Projection</p>
                          <p className="text-[9px] font-black italic text-primary">SPHERICAL 3D</p>
                       </div>
                       <div>
                          <p className="text-[7px] text-white/20 uppercase font-black">Precision</p>
                          <p className="text-[9px] font-black italic text-primary">0.001 VECTORS</p>
                       </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {['Atmospheric', 'Wind-Flow', 'Heatmap'].map(layer => (
                      <button key={layer} className="px-3 py-1.5 bg-white/5 hover:bg-primary/20 border border-white/10 rounded-full text-[8px] font-black uppercase tracking-widest transition-all">
                        {layer}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="absolute bottom-6 left-6 z-10 flex items-center gap-4">
                   <div className="px-4 py-2 bg-black/60 backdrop-blur-md rounded-full border border-white/10 flex items-center gap-2">
                      <Zap className="w-3 h-3 text-primary" />
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/60">Orbital Data Stream: OK</span>
                   </div>
                </div>

                <div className="absolute bottom-6 right-6 z-10 flex items-center gap-4">
                   <div className="px-4 py-2 bg-black/60 backdrop-blur-md rounded-full border border-white/10 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/60">Polar Drift: Stabilized</span>
                   </div>
                </div>
              </div>

                {data && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* TIME SCRUBBER SIMULATION */}
                      <div className="glass-card p-4 rounded-2xl border-white/10 shadow-lg h-full flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-3 text-white/60">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-primary" />
                            <h3 className="text-sm font-black uppercase italic tracking-wider">Temporal Sequence</h3>
                          </div>
                          <span className="text-[9px] font-black uppercase tracking-widest opacity-40">Scrubbing Active</span>
                        </div>
                        
                        <div className="relative pt-2">
                          <input 
                            type="range" 
                            min="0" 
                            max="23" 
                            value={timeStep}
                            onChange={(e) => setTimeStep(parseInt(e.target.value))}
                            className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-primary"
                          />
                          <div className="flex justify-between mt-4">
                            {data.forecast[0].hours.filter((_, i) => i % 4 === 0).map((h, i) => (
                              <div key={i} className="flex flex-col items-center gap-1">
                                <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">{h.time.split(' ')[1]}</span>
                                <div className={`h-1 w-[1px] ${timeStep === i*4 ? 'bg-primary h-2' : 'bg-white/10'}`} />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* TACTICAL TELEMETRY FEED - Fills Middle Gap */}
                      <div className="glass-card p-4 rounded-2xl border-white/10 shadow-lg border-l-4 border-l-primary/40 bg-primary/5">
                        <div className="flex items-center gap-2 mb-4">
                           <Layers className="w-4 h-4 text-primary" />
                           <h3 className="text-sm font-black uppercase italic tracking-wider">Tactical Telemetry</h3>
                        </div>
                        <div className="space-y-3">
                           {[
                             { label: 'Signal Strength', value: '0.998', unit: 'dBm', status: 'Optimal' },
                             { label: 'Refresh Rate', value: '42.5', unit: 'ms', status: 'Low Latency' },
                             { label: 'Coordinate Lock', value: 'PRECISION', unit: 'GEO', status: 'Active' }
                           ].map((item, i) => (
                             <div key={i} className="flex items-center justify-between border-b border-white/5 pb-2">
                                <div>
                                   <p className="text-[8px] font-black uppercase text-white/20 tracking-widest">{item.label}</p>
                                   <p className="text-xs font-mono font-black text-white/90">{item.value} <span className="text-[9px] text-primary/60">{item.unit}</span></p>
                                </div>
                                <span className="text-[7px] font-black uppercase px-2 py-0.5 bg-primary/10 rounded text-primary border border-primary/20">{item.status}</span>
                             </div>
                           ))}
                        </div>
                      </div>
                    </div>

                    {/* Atmospheric Logic Engine - Moved to Left to Fill Space */}
                    <ExplainableWeather explanation={data.intelligence.explanation} />
                    
                    {/* NEW: INFRASTRUCTURE STATUS FEED - Fills local gaps */}
                    <div className="glass-card p-4 rounded-2xl border-white/5 bg-white/5 flex items-center justify-between group cursor-help">
                       <div className="flex items-center gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40 group-hover:text-white/60 transition-colors">Infrastructure Sync: 100%</span>
                       </div>
                       <div className="flex gap-4">
                          {['SAT-9', 'VOID-LINK', 'ATMOS-GRID'].map(tag => (
                            <span key={tag} className="text-[7px] font-mono text-primary/40 uppercase tracking-widest">{tag}</span>
                          ))}
                       </div>
                    </div>
                  </>
                )}
            </motion.div>

            {/* RIGHT: TACTICAL INTELLIGENCE STACK */}
            <div className="lg:col-span-12 xl:col-span-4 space-y-6">
              {data ? (
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-3"
                >
                  {/* Decorative Tactical Feed Fill */}
                  <div className="flex items-center justify-between px-4 py-2 bg-primary/5 border border-primary/10 rounded-full">
                     <div className="flex items-center gap-2">
                        <Activity className="w-3 h-3 text-primary animate-pulse" />
                        <span className="text-[7px] font-black uppercase tracking-[0.3em] text-white/40">Network Node: Active</span>
                     </div>
                     <span className="text-[7px] font-mono text-primary/40">DS-{Math.random().toString(36).substring(7).toUpperCase()}</span>
                  </div>

                  {/* Phase 1: Summary Card */}
                  <WeatherCard data={data} />
                  
                  {/* Phase 2: Metadata / Location Details */}
                    <div className="glass-card p-4 rounded-[1.5rem] border-white/10 space-y-4 shadow-xl relative overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/20 blur-3xl rounded-full" />
                    <h3 className="font-black text-2xl uppercase tracking-[0.2em] italic flex items-center gap-4">
                      <GlobeIcon className="w-7 h-7 text-primary" />
                      Geospatial ID
                    </h3>
                    <div className="grid grid-cols-2 gap-3 relative z-10">
                      <div className="p-4 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-all group">
                        <span className="text-[8px] text-white/20 uppercase tracking-[0.4em] font-black block mb-1">Zone Identifier</span>
                        <span className="font-mono text-[10px] font-black truncate block text-white/90">{data.location.timezone}</span>
                      </div>
                      <div className="p-4 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-all group">
                        <span className="text-[8px] text-white/20 uppercase tracking-[0.4em] font-black block mb-1">Solar Sync</span>
                        <span className="font-mono text-lg font-black block text-primary italic">{data.location.localtime.split(' ')[1]}</span>
                      </div>
                      <div className="p-4 bg-white/5 rounded-xl border border-white/5 col-span-2 hover:bg-white/10 transition-all group">
                        <span className="text-[8px] text-white/20 uppercase tracking-[0.4em] font-black block mb-1">Coord Vector (N/E)</span>
                        <span className="font-mono text-base font-black text-blue-400 truncate">
                          {data.location.lat.toFixed(5)}° N • {data.location.lon.toFixed(5)}° E
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Extra Operational Status Bar */}
                  <div className="p-6 glass-card rounded-[1.5rem] border-white/5 flex items-center justify-between">
                     <div className="flex flex-col">
                        <span className="text-[8px] text-white/20 uppercase tracking-[0.4em] font-black mb-1">System Entropy</span>
                        <div className="flex gap-1">
                           {[1, 2, 3, 4, 5, 6].map(i => (
                             <div key={i} className={`h-1.5 w-4 rounded-full ${i < 5 ? 'bg-primary' : 'bg-white/10'}`} />
                           ))}
                        </div>
                     </div>
                     <span className="text-[10px] font-black text-primary italic">94% OPTIMAL</span>
                  </div>

                  {/* METEOROLOGICAL EVENT LOG - Fills the Gap */}
                  <div className="glass-card p-5 rounded-[1.5rem] border-white/5 space-y-4">
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                           <Activity className="w-4 h-4 text-primary animate-pulse" />
                           <h3 className="text-xs font-black uppercase tracking-widest">Event Log</h3>
                        </div>
                        <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em]">Live Stream</span>
                     </div>
                     <div className="space-y-3">
                        {[
                          { time: '00:32', event: 'Ionospheric Sync Complete', color: 'text-green-400' },
                          { time: '00:28', event: 'Pressure Vector Shift Detected', color: 'text-blue-400' },
                          { time: '00:15', event: 'Orbital Handover: SAT-7B', color: 'text-white/40' },
                          { time: '00:05', event: 'Thermal Anomaly Neutralized', color: 'text-primary' }
                        ].map((log, i) => (
                          <div key={i} className="flex gap-4 items-start border-l border-white/10 pl-4 py-1">
                             <span className="text-[9px] font-mono text-white/20">{log.time}</span>
                             <p className={`text-[10px] font-black uppercase tracking-wider ${log.color}`}>{log.event}</p>
                          </div>
                        ))}
                     </div>
                  </div>

                  {/* Decorative Radar Element */}
                  <div className="relative glass-card h-32 rounded-[1.5rem] border-white/5 overflow-hidden flex items-center justify-center bg-primary/5">
                     <div className="absolute inset-0 opacity-10">
                        <div className="absolute inset-0 border border-primary/20 rounded-full scale-50" />
                        <div className="absolute inset-0 border border-primary/20 rounded-full scale-[0.8]" />
                        <motion.div 
                          animate={{ rotate: 360 }}
                          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                          className="absolute inset-0 bg-gradient-to-tr from-primary/30 to-transparent origin-center"
                        />
                     </div>
                     <div className="relative z-10 flex flex-col items-center gap-1">
                        <MapIcon className="w-6 h-6 text-primary opacity-40" />
                        <span className="text-[8px] font-black uppercase tracking-[0.5em] text-white/20">Spatial Scanning...</span>
                     </div>
                  </div>
                </motion.div>
              ) : (
                <div className="space-y-6">
                  <div className="glass-card min-h-[500px] rounded-[2rem] flex flex-col items-center justify-center p-12 text-center space-y-8 border-white/5 shadow-2xl relative overflow-hidden bg-gradient-to-b from-transparent to-primary/5">
                    {/* Background Radar FX */}
                    <div className="absolute inset-0 z-0 opacity-5 pointer-events-none">
                      <div className="absolute inset-0 border border-primary rounded-full scale-[1.5] animate-pulse" />
                      <div className="absolute inset-0 border border-primary rounded-full scale-[2.5]" />
                      <div className="absolute top-1/2 left-0 w-full h-[1px] bg-primary" />
                      <div className="absolute top-0 left-1/2 w-[1px] h-full bg-primary" />
                    </div>

                    {isLoading ? (
                       <div className="flex flex-col items-center gap-12 relative z-10">
                          <div className="relative">
                             <div className="absolute inset-[-20px] bg-primary/20 blur-3xl rounded-full animate-pulse" />
                             <Loader2 className="w-40 h-40 text-primary animate-spin" />
                             <div className="absolute inset-0 flex items-center justify-center">
                                 <Activity className="w-16 h-16 text-blue-400 animate-pulse" />
                             </div>
                          </div>
                          <div className="space-y-4">
                             <p className="text-xl font-black uppercase tracking-[1em] text-primary italic animate-shimmer">Synchronizing Aether Core</p>
                             <div className="flex justify-center gap-3">
                                {[1, 2, 3].map(i => (
                                  <div key={i} className="h-1 w-8 bg-primary/20 rounded-full overflow-hidden">
                                    <motion.div 
                                      animate={{ x: [-32, 32] }}
                                      transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                                      className="h-full w-4 bg-primary"
                                    />
                                  </div>
                                ))}
                             </div>
                             <p className="text-[10px] text-white/20 uppercase tracking-widest mt-6 font-bold">Establishing secure orbital link • Protocol Alpha-7</p>
                          </div>
                       </div>
                    ) : (
                       <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center gap-10 relative z-10"
                       >
                         <div className="w-40 h-40 bg-primary/5 rounded-[4rem] flex items-center justify-center border border-white/10 shadow-[0_0_100px_rgba(59,130,246,0.1)] group cursor-pointer hover:border-primary/50 transition-all duration-700">
                           <div className="relative">
                              <div className="absolute inset-0 bg-primary blur-3xl opacity-0 group-hover:opacity-40 transition-opacity" />
                              <Wind className="w-20 h-20 text-primary group-hover:scale-110 transition-transform duration-700" />
                           </div>
                         </div>
                         <div className="space-y-6">
                           <div className="flex flex-col items-center gap-2">
                             <span className="text-[10px] font-black tracking-[0.6em] text-primary uppercase italic">System Status: Standby</span>
                             <h3 className="text-5xl font-black italic uppercase tracking-tighter text-white">Intelligence Ready</h3>
                           </div>
                           <p className="text-white/30 max-w-[340px] mx-auto font-bold uppercase text-[11px] tracking-[0.3em] leading-relaxed">
                             Awaiting geospatial coordinate input. <br />
                             Select a point on the globe or use the tactical search terminal to initiate sync.
                           </p>
                         </div>
                         <div className="flex gap-6 items-center">
                            <div className="flex gap-2">
                               <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                               <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse delay-75" />
                               <div className="h-2 w-2 rounded-full bg-white/10 border border-white/5" />
                            </div>
                            <span className="text-[8px] font-mono text-white/20 uppercase tracking-widest">Core-Link: SECURE</span>
                         </div>
                       </motion.div>
                    )}
                  </div>

                  {/* STANDBY METADATA FILL */}
                  {!isLoading && (
                    <div className="grid grid-cols-2 gap-4">
                       <div className="glass-card p-6 rounded-3xl border-white/5 bg-white/5 flex flex-col gap-2">
                          <span className="text-[8px] font-black uppercase tracking-widest text-white/20">Orbital Nodes</span>
                          <span className="text-2xl font-black italic text-white/40 uppercase">Offline</span>
                       </div>
                       <div className="glass-card p-6 rounded-3xl border-white/5 bg-white/5 flex flex-col gap-2">
                          <span className="text-[8px] font-black uppercase tracking-widest text-white/20">Data Stream</span>
                          <div className="flex gap-1 h-6 items-end">
                             {[1, 2, 3, 4, 5].map(i => (
                               <div key={i} className="w-1 bg-white/5 rounded-full" style={{ height: '20%' }} />
                             ))}
                          </div>
                       </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* THE ATMOSPHERIC BRIDGE - Fills the visual gap */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className={`relative py-12 px-10 glass-card rounded-[3rem] border-white/5 overflow-hidden shadow-2xl transition-all duration-1000 mt-6 ${
              data ? 'bg-gradient-to-br from-primary/5 via-transparent to-blue-900/5' : 'bg-white/5 opacity-50 grayscale'
            }`}
          >
             <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary via-transparent to-primary/20" />
             <div className="flex flex-col lg:flex-row items-center justify-between gap-12 relative z-10">
                <div className="max-w-xl space-y-4">
                   <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${data ? 'bg-primary/20' : 'bg-white/10'}`}>
                         <Activity className={`w-5 h-5 ${data ? 'text-primary' : 'text-white/20'}`} />
                      </div>
                      <span className="text-xs font-black uppercase tracking-[0.5em] text-white/20 italic">
                        {data ? 'Regional Pulse' : 'Global Surveillance Standby'}
                      </span>
                   </div>
                   <h2 className={`text-4xl font-black italic tracking-tighter uppercase leading-tight ${data ? 'text-white' : 'text-white/20'}`}>
                      {data ? (
                        <>Deep-Space <span className="text-primary italic">Atmospheric Calibration</span> Successful</>
                      ) : (
                        <>Awaiting <span className="italic">Orbital Acquisition</span> Signature</>
                      )}
                   </h2>
                   <p className="text-white/20 text-sm font-bold leading-relaxed uppercase tracking-wide">
                      {data ? (
                        `The current meteorological profile indicates a stable transition phase. Satellite telemetry (H-24) confirms orbital alignment over ${data.location.name}.`
                      ) : (
                        "Satellite network idling in geosynchronous orbit. Establishing handshake protocols for global moisture and thermal density mapping."
                      )}
                   </p>
                </div>
                
                <div className="flex flex-wrap gap-10 lg:gap-20">
                   {[
                     { label: 'Cloud Density', val: data ? 'Low' : '---', sub: data ? '12% Coverage' : 'Awaiting Data' },
                     { label: 'Barometric Trend', val: data ? 'Steady' : '---', sub: data ? '1013.2 hPa' : 'No Signal' },
                     { label: 'Signal Latency', val: data ? '32ms' : '999ms', sub: data ? 'Secure' : 'Unlinked' }
                   ].map((stat, i) => (
                     <div key={i} className="flex flex-col gap-2">
                        <span className="text-[8px] font-black tracking-[0.4em] text-white/20 uppercase">{stat.label}</span>
                        <span className={`text-3xl font-black italic tracking-tighter uppercase leading-none ${data ? 'text-white' : 'text-white/10'}`}>{stat.val}</span>
                        <span className="text-[10px] font-bold text-primary/40 uppercase tracking-widest">{stat.sub}</span>
                     </div>
                   ))}
                </div>
             </div>
             
             {/* Decorative background grid */}
             <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
          </motion.div>

          {/* SECONDARY STRATEGIC ANALYSIS PANEL */}
          {data && (
            <motion.div 
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8 pt-8 border-t border-white/5 mt-6"
            >
              <div className="flex flex-col lg:flex-row items-end lg:items-center justify-between gap-10 px-6">
                <div>
                   <div className="flex items-center gap-4 mb-3">
                      <div className="h-10 w-[2px] bg-primary" />
                      <h2 className="text-6xl font-black tracking-tighter uppercase italic bg-gradient-to-r from-white to-white/10 bg-clip-text text-transparent leading-none">Intelligence Hub</h2>
                   </div>
                   <p className="text-white/20 text-xs font-black uppercase tracking-[0.5em] mt-4 ml-8">Decision matrices and synchronized 7-day predictive vectors</p>
                </div>
                
                <div className="flex gap-4 p-3 bg-black/60 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] shadow-3xl">
                  {tabs.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-12 py-5 rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.4em] transition-all duration-700 ${
                        activeTab === tab.id 
                          ? 'bg-primary text-primary-foreground shadow-[0_15px_40px_rgba(59,130,246,0.5)] scale-105' 
                          : 'hover:bg-white/10 text-white/30'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.div 
                  key={activeTab}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="grid grid-cols-1 gap-6"
                >
                  {activeTab === 'intelligence' ? (
                    <SmartInsights insights={data.intelligence.insights} />
                  ) : activeTab === 'charts' ? (
                    <WeatherCharts data={data.forecast} />
                  ) : (
                    <ForecastCard forecast={data.forecast} />
                  )}
                </motion.div>
              </AnimatePresence>
            </motion.div>
          )}
        </main>

        {/* Cinematic Footer Section */}
        <footer className="mt-10 px-8 py-10 border-t border-white/5 bg-black relative overflow-hidden">
           <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
           <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-primary/10 to-transparent" />
           
           <div className="container mx-auto flex flex-col items-center gap-8 relative z-10">
              <div className="flex items-center gap-6 group cursor-pointer">
                 <div className="p-5 bg-primary/10 rounded-[2rem] border border-primary/20 group-hover:border-primary/60 transition-all duration-500">
                    <Activity className="w-12 h-12 text-primary group-hover:rotate-180 transition-transform duration-700" />
                 </div>
                  <span className="font-black tracking-[0.8em] uppercase text-4xl italic bg-gradient-to-r from-white to-white/30 bg-clip-text text-transparent">SAYANOCAST</span>
              </div>
              
              <div className="flex flex-col items-center gap-6">
                <p className="text-[12px] uppercase tracking-[0.8em] text-white/20 font-black text-center leading-relaxed">
                   Next-Generation Tactical Weather Intelligence Platform
                   <br />
                   <span className="text-primary/60 mt-2 block italic">Crafted by Sayan • Network Node: GLOBAL-SYNC</span>
                </p>
                <div className="flex gap-10 mt-6 overflow-hidden">
                  {['Privacy Protocol', 'Security Terminal', 'Core Assets', 'Met-Labs'].map(link => (
                    <span key={link} className="text-[9px] font-black uppercase tracking-[0.6em] text-white/10 hover:text-primary transition-colors cursor-pointer">{link}</span>
                  ))}
                </div>
              </div>
           </div>
        </footer>
      </div>
    </div>
  )
}
