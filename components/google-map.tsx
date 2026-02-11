'use client'

import React, { useEffect, useRef, useState } from 'react'
import { AlertTriangle, Map as MapIcon, Loader2 } from 'lucide-react'

interface GoogleMapProps {
  lat: number
  lng: number
  zoom?: number
}

declare global {
  interface Window {
    google: any
    initMap: () => void
  }
}

export const GoogleMap = ({ lat, lng, zoom = 12 }: GoogleMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<any>(null)
  const markerInstance = useRef<any>(null)
  const [mapStatus, setMapStatus] = useState<'loading' | 'ready' | 'error'>('loading')

  useEffect(() => {
    if (typeof window === 'undefined') return

    const timeout = setTimeout(() => {
      if (!window.google) setMapStatus('error')
    }, 5000)

    const initializeMap = () => {
      if (!window.google || !mapRef.current) {
        setMapStatus('error')
        return
      }

      try {
        if (!mapInstance.current) {
          mapInstance.current = new window.google.maps.Map(mapRef.current, {
            center: { lat, lng },
            zoom,
            mapTypeId: 'hybrid',
            disableDefaultUI: true, // cleaner look
            gestureHandling: 'greedy',
            styles: [
              { elementType: 'geometry', stylers: [{ color: '#010208' }] },
              { elementType: 'labels.text.stroke', stylers: [{ visibility: 'off' }] },
              { elementType: 'labels.text.fill', stylers: [{ color: '#3b82f6' }] },
              { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#000000' }] },
              { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#010208' }] },
              { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1e293b', visibility: 'simplified' }] },
              { featureType: 'poi', stylers: [{ visibility: 'off' }] },
              { featureType: 'transit', stylers: [{ visibility: 'off' }] },
              { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#3b82f6', weight: 0.5 }] },
              { featureType: 'administrative.country', elementType: 'geometry.stroke', stylers: [{ color: '#3b82f6', weight: 1.5 }] },
            ]
          })
        } else {
          mapInstance.current.setCenter({ lat, lng })
          mapInstance.current.setZoom(zoom)
        }

        if (markerInstance.current) {
          markerInstance.current.setMap(null)
        }

        // Custom Tactical Marker
        markerInstance.current = new window.google.maps.Marker({
          position: { lat, lng },
          map: mapInstance.current,
          icon: {
             path: window.google.maps.SymbolPath.CIRCLE,
             fillColor: '#ef4444',
             fillOpacity: 0.8,
             strokeColor: '#ffffff',
             strokeWeight: 2,
             scale: 10,
          },
          animation: window.google.maps.Animation.DROP,
          title: 'PRECISION_VECTOR_LOCK'
        })
        
        setMapStatus('ready')
      } catch (e) {
        console.error('Map Initialization Error:', e)
        setMapStatus('error')
      }
    }

    if (window.google && window.google.maps) {
      initializeMap()
    } else {
      window.initMap = initializeMap
    }

    return () => clearTimeout(timeout)
  }, [lat, lng, zoom])

  return (
    <div className="w-full h-full rounded-[2rem] overflow-hidden border border-white/5 shadow-2xl relative bg-[#010208] group">
      {mapStatus === 'loading' && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/40 backdrop-blur-md gap-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-primary/60 italic">Initializing Satellite Link...</p>
        </div>
      )}

      {mapStatus === 'error' && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/80 backdrop-blur-xl p-12 text-center gap-6">
          <div className="p-6 bg-red-500/10 rounded-full ring-1 ring-red-500/20">
            <MapIcon className="w-12 h-12 text-red-500" />
          </div>
          <div className="space-y-3">
            <h3 className="text-2xl font-black uppercase italic tracking-tighter text-white">Overlink Failure</h3>
            <p className="text-[11px] text-white/40 uppercase tracking-[0.2em] font-bold leading-relaxed max-w-[300px]">
              Offline protocols active. Ensure NEXT_PUBLIC_GOOGLE_MAPS_KEY is active for satellite reconnaissance.
            </p>
          </div>
        </div>
      )}

      {/* Tactical HUD Overlay for Map */}
      <div className="absolute inset-0 pointer-events-none z-10 p-8 flex flex-col justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-700">
         <div className="flex justify-between items-start">
            <div className="bg-black/60 backdrop-blur-md border border-primary/20 p-4 rounded-2xl space-y-2">
               <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-[8px] font-black uppercase tracking-widest text-white/60">Target Lock: Active</span>
               </div>
               <div className="font-mono text-[10px] text-primary">
                  {lat.toFixed(6)}, {lng.toFixed(6)}
               </div>
            </div>
            <div className="bg-black/40 backdrop-blur-sm border border-white/10 px-3 py-1.5 rounded-full">
               <span className="text-[7px] font-black uppercase text-white/30 tracking-[0.3em]">Link_Security: HIGH</span>
            </div>
         </div>
         
         <div className="flex justify-between items-end">
            <div className="space-y-2">
               <div className="w-32 h-0.5 bg-primary/20 rounded-full overflow-hidden">
                  <div className="w-2/3 h-full bg-primary/80 animate-pulse" />
               </div>
               <span className="text-[7px] font-mono text-white/20 uppercase">Stream_Buffer_94%</span>
            </div>
            <div className="flex flex-col items-end gap-1">
               <span className="text-[8px] font-black text-primary italic uppercase tracking-tighter">Precise Grid_7</span>
               <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(i => <div key={i} className="w-1 h-3 bg-primary/40 rounded-full" />)}
               </div>
            </div>
         </div>
      </div>

      <div ref={mapRef} className={`w-full h-full transition-opacity duration-1000 ${mapStatus === 'ready' ? 'opacity-100' : 'opacity-0 scale-105'} transform transition-transform duration-[2000ms]`} />
      
      {/* Decorative Grid Mesh */}
      <div className="absolute inset-0 pointer-events-none opacity-20" style={{ backgroundImage: 'linear-gradient(#3b82f6 0.5px, transparent 0.5px), linear-gradient(90deg, #3b82f6 0.5px, transparent 0.5px)', backgroundSize: '40px 40px' }} />
    </div>
  )
}


