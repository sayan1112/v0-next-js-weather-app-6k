'use client'

import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ForecastDay } from '@/types/weather'
import { motion } from 'framer-motion'
import { Activity, Zap } from 'lucide-react'

interface WeatherChartsProps {
  data: ForecastDay[]
}

export function WeatherCharts({ data }: WeatherChartsProps) {
  if (!data || data.length === 0) return null

  // Prepare hourly data from the first day
  const hourlyData = data[0].hours.filter((_, index) => index % 2 === 0).map(h => ({
    time: h.time.split(' ')[1],
    temp: Math.round(h.temp_c),
    rain: h.chance_of_rain,
    wind: Math.round(h.wind_kph)
  }))

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
      {/* Thermal Vector Chart */}
      <motion.div
        initial={{ opacity: 0, scale: 0.99 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="glass-card overflow-hidden border-none rounded-[3rem] shadow-2xl relative">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-3xl rounded-full" />
          <CardHeader className="p-10 relative z-10 flex flex-row items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/20 rounded-2xl">
                 <Activity className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-xl font-black uppercase italic tracking-tighter">Thermal Prediction (24H)</CardTitle>
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">Metric: Temp-C</span>
          </CardHeader>
          <CardContent className="h-[350px] w-full p-4 relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyData}>
                <defs>
                  <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.5}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="time" 
                  stroke="rgba(255,255,255,0.1)" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  tick={{ fill: 'rgba(255,255,255,0.3)', fontWeight: 'bold' }}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(0,0,0,0.95)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: '24px', color: '#fff', backdropFilter: 'blur(20px)', padding: '20px' }}
                  itemStyle={{ color: '#3b82f6', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '10px', letterSpacing: '0.1em' }}
                  cursor={{ stroke: 'rgba(59,130,246,0.3)', strokeWidth: 2 }}
                />
                <Area type="monotone" dataKey="temp" name="Temperature" stroke="#3b82f6" strokeWidth={5} fillOpacity={1} fill="url(#colorTemp)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Precipitation / Wind Vector Chart */}
      <motion.div
        initial={{ opacity: 0, scale: 0.99 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="glass-card overflow-hidden border-none rounded-[3rem] shadow-2xl relative">
          <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-400/10 blur-3xl rounded-full" />
          <CardHeader className="p-10 relative z-10 flex flex-row items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-cyan-400/20 rounded-2xl">
                 <Zap className="w-6 h-6 text-cyan-400" />
              </div>
              <CardTitle className="text-xl font-black uppercase italic tracking-tighter">Moisture Vectors (%)</CardTitle>
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">Metric: Prob-Rain</span>
          </CardHeader>
          <CardContent className="h-[350px] w-full p-4 relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyData}>
                <defs>
                  <linearGradient id="colorRain" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.5}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                   dataKey="time" 
                   stroke="rgba(255,255,255,0.1)" 
                   fontSize={10} 
                   tickLine={false} 
                   axisLine={false}
                   tick={{ fill: 'rgba(255,255,255,0.3)', fontWeight: 'bold' }}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(0,0,0,0.95)', border: '1px solid rgba(6,182,212,0.3)', borderRadius: '24px', color: '#fff', backdropFilter: 'blur(20px)', padding: '20px' }}
                  itemStyle={{ color: '#06b6d4', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '10px', letterSpacing: '0.1em' }}
                  cursor={{ stroke: 'rgba(6,182,212,0.3)', strokeWidth: 2 }}
                />
                <Area type="monotone" dataKey="rain" name="Rain Prob" stroke="#06b6d4" strokeWidth={5} fillOpacity={1} fill="url(#colorRain)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
