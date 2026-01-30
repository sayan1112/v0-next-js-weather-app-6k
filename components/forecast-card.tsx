'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { WeatherIcon } from './weather-icon'
import { ForecastDay } from '@/types/weather'
import { Navigation, Calendar, ThermometerSun, ThermometerSnowflake } from 'lucide-react'

interface ForecastCardProps {
  forecast: ForecastDay[]
}

export function ForecastCard({ forecast }: ForecastCardProps) {
  if (!forecast || forecast.length === 0) return null

  return (
    <Card className="glass-card border-none rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.8)] overflow-hidden relative">
      <div className="absolute top-[-20%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[130px] rounded-full" />
      
      <CardHeader className="px-8 pt-8 relative z-10">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-primary/20 rounded-xl">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <CardTitle className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter">Strategic Predictive Range</CardTitle>
          </div>
          <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20">Sayanocast Node: Forecast Sync</p>
        </div>
      </CardHeader>

      <CardContent className="px-8 pb-8 relative z-10">
        <div className="grid grid-cols-1 gap-4">
          {forecast.map((day, i) => (
            <motion.div
              key={day.date}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="group p-6 flex items-center justify-between bg-white/5 hover:bg-white/10 border border-white/5 hover:border-primary/30 transition-all rounded-[2rem] relative overflow-hidden"
            >
              {/* Day ID */}
              <div className="flex items-center gap-10 w-1/4">
                <div className="flex flex-col shrink-0">
                  <span className="text-2xl font-black uppercase italic text-primary leading-none">
                    {i === 0 ? 'Tdy' : new Date(day.date).toLocaleDateString(undefined, { weekday: 'short' })}
                  </span>
                  <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20 mt-1">
                    {new Date(day.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <div className="p-3 bg-white/5 rounded-xl group-hover:scale-110 transition-transform shrink-0">
                  <WeatherIcon conditionText={day.condition.text} className="w-10 h-10 text-white" />
                </div>
              </div>
              
              {/* Condition Tag */}
              <div className="flex items-center gap-4 w-1/3 justify-center">
                <div className="px-4 py-1.5 bg-black/40 border border-white/10 rounded-full max-w-full overflow-hidden">
                  <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40 truncate block">{day.condition.text}</span>
                </div>
              </div>

              {/* Temp Vectors */}
              <div className="flex items-center justify-end gap-8 w-1/3">
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-end">
                     <span className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1 flex items-center gap-1">
                        <ThermometerSun className="w-2.5 h-2.5" /> Max
                     </span>
                     <span className="text-2xl font-black italic">{Math.round(day.maxtemp_c)}°</span>
                  </div>
                  <div className="h-8 w-[1px] bg-white/10" />
                  <div className="flex flex-col items-start">
                     <span className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1 flex items-center gap-1">
                        <ThermometerSnowflake className="w-2.5 h-2.5" /> Min
                     </span>
                     <span className="text-xl font-black text-white/40 italic">{Math.round(day.mintemp_c)}°</span>
                  </div>
                </div>
                
                {/* Visual Bar */}
                <div className="hidden lg:block w-48 h-2.5 bg-black/60 rounded-full overflow-hidden border border-white/10 shadow-inner">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.max(10, (day.maxtemp_c / 45) * 100)}%` }}
                    transition={{ duration: 1.5, delay: i * 0.1 }}
                    className="h-full bg-gradient-to-r from-blue-600 via-primary to-orange-600 rounded-full"
                  />
                </div>
              </div>

              {/* Hover Glow */}
              <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors pointer-events-none" />
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
