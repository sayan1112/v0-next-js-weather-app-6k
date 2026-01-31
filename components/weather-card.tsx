'use client'
import Image from 'next/image'

import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { WeatherIcon } from './weather-icon'
import { WeatherResponse } from '@/types/weather'
import { 
  Droplets, 
  Wind, 
  Eye, 
  Gauge, 
  Sunrise, 
  Sunset, 
  Thermometer, 
  Waves,
  Navigation,
  Sun
} from 'lucide-react'

interface WeatherCardProps {
  data: WeatherResponse
}

export function WeatherCard({ data }: WeatherCardProps) {
  if (!data || !data.current || !data.location) return null
  
  const { current, location } = data
  const condition = current.condition
  const temp = Math.round(current.temp_c)
  const feelsLike = Math.round(current.feelslike_c)

  const stats = [
    { icon: Droplets, label: 'Moisture', value: `${current.humidity}%`, color: 'text-blue-400' },
    { icon: Wind, label: 'Velocity', value: `${current.wind_kph} km/h`, color: 'text-cyan-400' },
    { icon: Eye, label: 'Horizon', value: `${current.vis_km} km`, color: 'text-amber-400' },
    { icon: Gauge, label: 'Pressure', value: `${current.pressure_mb} mb`, color: 'text-purple-400' },
  ]

  const aqi = current.air_quality ? current.air_quality['us-epa-index'] : 'N/A'
  const aqiLabel = aqi === 1 ? 'Good' : aqi === 2 ? 'Moderate' : aqi === 3 ? 'Unhealthy' : 'Polluted'

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-6"
    >
      <Card className="glass-card border-none overflow-hidden relative rounded-[2rem] shadow-[0_16px_32px_-8px_rgba(0,0,0,0.8)]">
        {/* Cinematic Background Elements */}
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-0 p-12 opacity-[0.03] pointer-events-none scale-150">
          <WeatherIcon conditionText={condition.text} className="w-80 h-80" />
        </div>
        
        <CardContent className="p-6 relative z-10">
          {/* Top Decorative Ticker */}
          <div className="mb-6 flex items-center gap-4 overflow-hidden border-b border-white/5 pb-4">
             <div className="flex gap-8 animate-marquee whitespace-nowrap">
                {['ATMOSPHERIC_SCAN_ACTIVE', 'SIGNAL_SYNC_STABLE', 'METADATA_ENCRYPTED', 'SAYANOCAST_GLOBAL'].map(text => (
                   <span key={text} className="text-[7px] font-black tracking-[0.4em] text-white/20">{text}</span>
                ))}
             </div>
             <div className="flex gap-8 animate-marquee whitespace-nowrap" aria-hidden="true">
                {['ATMOSPHERIC_SCAN_ACTIVE', 'SIGNAL_SYNC_STABLE', 'METADATA_ENCRYPTED', 'SAYANOCAST_GLOBAL'].map(text => (
                   <span key={text} className="text-[7px] font-black tracking-[0.4em] text-white/20">{text}</span>
                ))}
             </div>
          </div>
          
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-1 max-w-[60%] min-w-0">
              <div className="flex items-center gap-3">
                 <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                 <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/40 italic">Geospatial Target</p>
              </div>
              <motion.h2 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="text-2xl md:text-4xl font-black tracking-tighter uppercase italic leading-tight break-words"
                title={location.name}
              >
                {location.name}
              </motion.h2>
              <div className="flex items-center gap-2">
                 <p className="text-sm text-primary font-black italic uppercase tracking-tighter leading-tight">
                   {location.region ? `${location.region} • ` : ''}{location.country}
                 </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 group bg-white/5 p-4 rounded-[1.5rem] border border-white/10 hover:bg-white/10 transition-all shrink-0">
              <div className="p-3 bg-primary/20 rounded-xl group-hover:rotate-12 transition-transform shrink-0">
                <WeatherIcon conditionText={condition.text} className="w-10 h-10 text-white" />
              </div>
              <div className="flex flex-col items-end">
                <span className="text-5xl md:text-6xl font-black tracking-tighter italic leading-none whitespace-nowrap">
                  {temp}°
                </span>
                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/30 mt-0.5">Thermal Center</span>
              </div>
            </div>
          </div>

          {/* Tactical Atmospheric Scan - Fills Blank Space */}
          <div className="mt-8 relative h-12 bg-white/5 rounded-xl border border-white/5 overflow-hidden flex items-center px-4 group">
            <div className="absolute inset-y-0 left-0 w-1 bg-primary animate-pulse" />
            <div className="flex items-center gap-3 w-full">
               <Image 
                src="/app-icon.png" 
                alt="Scan Icon" 
                width={16} 
                height={16} 
                className="w-4 h-4 object-cover rounded-sm animate-pulse"
              />
               <div className="flex-1 h-[2px] bg-white/10 relative overflow-hidden">
                  <motion.div 
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-primary to-transparent"
                  />
               </div>
               <span className="text-[8px] font-black uppercase tracking-[0.4em] text-white/20 whitespace-nowrap">Atmospheric Scan: Active</span>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-3">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card p-6 flex flex-col items-center justify-center border border-white/5 hover:border-primary/30 group transition-all rounded-[1.5rem]"
              >
                <div className="mb-3 p-3 bg-white/5 rounded-xl group-hover:bg-primary/20 transition-colors">
                  <stat.icon className={`w-6 h-6 ${stat.color} group-hover:scale-110 transition-transform`} />
                </div>
                <span className="text-[8px] text-white/20 uppercase tracking-[0.2em] font-black mb-0.5">{stat.label}</span>
                <span className="text-lg font-black italic">{stat.value}</span>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3 items-center border-t border-white/5 pt-6">
            <div className="px-4 py-3 bg-white/5 rounded-xl flex items-center gap-2 border border-white/5 hover:border-primary/20 transition-all">
               <Thermometer className="w-3.5 h-3.5 text-orange-400" />
               <div className="flex flex-col">
                  <span className="text-[7px] font-black uppercase tracking-[0.2em] text-white/30">Feels Like</span>
                  <span className="text-base font-black italic">{feelsLike}°C</span>
               </div>
            </div>

            <motion.div 
               whileHover={{ scale: 1.05 }}
               className="px-4 py-3 bg-white/5 rounded-xl flex items-center gap-2 border border-white/5 hover:border-blue-400/20 transition-all"
            >
               <Waves className="w-3.5 h-3.5 text-blue-400" />
               <div className="flex flex-col">
                  <span className="text-[7px] font-black uppercase tracking-[0.2em] text-white/30">Air Quality</span>
                  <span className="text-base font-black italic text-blue-400 uppercase">{aqiLabel}</span>
               </div>
            </motion.div>

            <div className="px-4 py-3 bg-white/5 rounded-xl flex items-center gap-2 border border-white/5">
                <Sun className="w-3.5 h-3.5 text-yellow-400" />
                <div className="flex flex-col">
                  <span className="text-[7px] font-black uppercase tracking-[0.2em] text-white/30">UV Index</span>
                  <span className="text-base font-black italic text-yellow-400">{current.uv}</span>
                </div>
            </div>

            <div className="flex-1 text-right">
              <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/10 italic">Updated at {current.last_updated_epoch ? new Date(current.last_updated_epoch * 1000).toLocaleTimeString() : 'N/A'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
