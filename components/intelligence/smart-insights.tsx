'use client'

import Image from 'next/image'
import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Camera, Plane, Navigation, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react'
import { WeatherIntelligence, DecisionInsight } from '@/types/weather'

interface SmartInsightsProps {
  insights: WeatherIntelligence['insights']
}

const RunningIcon = ({ className }: { className?: string }) => (
  <Image src="/app-icon.png" alt="Running icon" width={20} height={20} className={`${className} object-cover rounded-md`} />
)

export function SmartInsights({ insights }: SmartInsightsProps) {
  const renderInsight = (key: string, data: DecisionInsight, Icon: any) => {
    const statusColor = {
      OPTIMAL: 'text-green-400 bg-green-400/10',
      CAUTION: 'text-orange-400 bg-orange-400/10',
      DANGER: 'text-red-400 bg-red-400/10'
    }[data.status]

    const StatusIcon = {
      OPTIMAL: CheckCircle2,
      CAUTION: AlertTriangle,
      DANGER: XCircle
    }[data.status]

    return (
      <motion.div
        key={key}
        whileHover={{ scale: 1.02 }}
        className="glass-card p-5 rounded-2xl flex flex-col gap-3 border-white/5 shadow-lg"
      >
        <div className="flex justify-between items-start">
          <div className="p-2.5 bg-white/5 rounded-xl">
            <Icon className="w-5 h-5 text-primary" />
          </div>
          <div className={`px-3 py-1 rounded-full flex items-center gap-1.5 ${statusColor}`}>
            <StatusIcon className="w-3.5 h-3.5" />
            <span className="text-[10px] font-black uppercase tracking-widest">{data.status}</span>
          </div>
        </div>

        <div>
          <h4 className="text-[10px] text-white/30 uppercase tracking-[0.3em] font-black mb-1">{data.label}</h4>
          <div className="flex items-end gap-1.5">
            <span className="text-2xl font-black italic text-white">{data.score}</span>
            <span className="text-[9px] font-black uppercase tracking-widest text-white/20 mb-1.5">/ 100</span>
          </div>
        </div>

        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${data.score}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={`h-full ${data.status === 'OPTIMAL' ? 'bg-green-500' : data.status === 'CAUTION' ? 'bg-orange-500' : 'bg-red-500'}`}
          />
        </div>

        <p className="text-xs font-bold text-white/60 leading-relaxed italic">
          "{data.advice}"
        </p>
      </motion.div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {renderInsight('running', insights.running, RunningIcon)}
      {renderInsight('photography', insights.photography, Camera)}
      {renderInsight('travel', insights.travel, Navigation)}
      {renderInsight('aviation', insights.aviation, Plane)}
    </div>
  )
}
