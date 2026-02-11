'use client'

import React, { useEffect, useRef, useMemo, useState, Suspense, useCallback } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Environment, Stars, Html } from '@react-three/drei'
import * as THREE from 'three'
import ThreeGlobe from 'three-globe'
import { MapIcon } from 'lucide-react'

interface GlobeInnerProps {
  onLocationSelect?: (lat: number, lng: number) => void
  selectedLocation?: { lat: number; lng: number } | null
  selectedLocationName?: string
  setViewMode?: (mode: 'dashboard' | 'map') => void
}

// Custom Pin Marker Component
const PinMarker = ({ position }: { position: THREE.Vector3 }) => {
  const meshRef = useRef<THREE.Group>(null)
  
  useFrame((state) => {
    if (meshRef.current) {
      // Gentle pulsing animation
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1
      meshRef.current.scale.set(scale, scale, scale)
    }
  })

  return (
    <group ref={meshRef} position={position}>
      {/* Pin stick */}
      <mesh position={[0, -2, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 4, 8]} />
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.5} />
      </mesh>
      {/* Pin head */}
      <mesh position={[0, 0.5, 0]}>
        <sphereGeometry args={[0.8, 16, 16]} />
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.8} />
      </mesh>
      {/* Glow effect */}
      <pointLight position={[0, 0, 0]} intensity={50} distance={10} color="#ef4444" />
    </group>
  )
}

const GlobeInner = ({ onLocationSelect, selectedLocation, selectedLocationName }: GlobeInnerProps) => {
  const globeRef = useRef<THREE.Group>(null)
  const cloudsRef = useRef<THREE.Mesh>(null)
  const [hoveredData, setHoveredData] = useState<{
    name: string;
    type: string;
    position: THREE.Vector3;
  } | null>(null)
  const lastFrameTime = useRef(0)
  
  // State for Geo Data
  const [geoData, setGeoData] = useState<{
    countries: any;
    states: any;
    cities: any[];
  } | null>(null)
  
  const [lodLevel, setLodLevel] = useState<'global' | 'regional' | 'tactical'>('global')
  const lastLodLevel = useRef<'global' | 'regional' | 'tactical'>('global')

  // Data Loading
  useEffect(() => {
    Promise.all([
      fetch('/globe/countries.geojson').then(res => res.json()).catch(() => ({ features: [] })),
      fetch('/globe/states.geojson').then(res => res.json()).catch(() => ({ features: [] })),
      fetch('/globe/cities.json').then(res => res.json()).catch(() => [])
    ]).then(([countries, states, cities]) => {
      setGeoData({ countries, states, cities })
    })
  }, [])

  // Data Loading & Globe Configuration
  const globe = useMemo(() => {
    const g = new ThreeGlobe()
    const globeAny = g as any
    
    // Smooth Atmosphere & Globe Configuration
    globeAny.showGlobe(true)
    globeAny.showAtmosphere(true)
    globeAny.atmosphereColor('#3b82f6')
    globeAny.atmosphereAltitude(0.18)
    
    // Use local assets for reliability
    globeAny.globeImageUrl('/globe/earth-blue-marble.jpg')
    globeAny.bumpImageUrl('/globe/earth-topology.png')
    
    // Removed Tiled Engine to fix "black and clumsy" issues
    // Using high-res static textures instead for smoothness
    
    // Base Styles - Sophisticated blue highlights
    globeAny.polygonCapColor(() => 'rgba(59, 130, 246, 0.15)')
    globeAny.polygonSideColor(() => 'rgba(59, 130, 246, 0.05)')
    globeAny.polygonStrokeColor(() => 'rgba(96, 165, 250, 0.3)')
    
    return g
  }, [])

  // Pre-processed data for LOD levels - MEMOIZED to prevent lag
  const processedData = useMemo(() => {
    if (!geoData) return null

    // 1. Process Countries
    const validCountries = geoData.countries.features.filter((d: any) => d.properties.ISO_A2 !== 'AQ')
    const countryLabels = validCountries.map((f: any) => ({
      name: f.properties.NAME || f.properties.name,
      lat: f.properties.LABEL_Y || f.properties.label_y || 0,
      lng: f.properties.LABEL_X || f.properties.label_x || 0,
      type: 'Country',
      size: 1.4,
      color: 'rgba(255,255,255, 0.9)'
    })).filter((l: any) => l.lat !== 0)

    // 2. Process States
    const stateLabels = geoData.states.features.map((f: any) => ({
      name: f.properties.name || f.properties.NAME,
      lat: f.properties.latitude || f.properties.LABEL_Y || 0,
      lng: f.properties.longitude || f.properties.LABEL_X || 0,
      type: 'Region',
      size: 0.8,
      color: 'rgba(255,255,255, 0.7)'
    })).filter((l: any) => l.lat !== 0)

    // 3. Process Cities
    const formattedCities = Array.isArray(geoData.cities) ? geoData.cities.map((c: any) => ({
       name: c.name,
       lat: parseFloat(c.lat),
       lng: parseFloat(c.lng),
       type: 'City',
       size: 0.45,
       color: '#60a5fa'
    })) : []

    return {
      global: {
        polygons: validCountries,
        labels: countryLabels,
        points: formattedCities.slice(0, 100)
      },
      regional: {
        polygons: validCountries,
        labels: [...countryLabels, ...stateLabels],
        points: formattedCities.slice(0, 400)
      },
      tactical: {
        polygons: [...validCountries, ...geoData.states.features],
        labels: [...countryLabels, ...stateLabels, ...formattedCities.slice(0, 800)],
        points: formattedCities.slice(0, 800)
      }
    }
  }, [geoData])

  // LOD Controller - Applies pre-processed data ONLY when level changes
  useEffect(() => {
    if (!processedData) return
    const globeAny = globe as any
    const data = processedData[lodLevel]

    // Batch updates to the globe engine
    globeAny.polygonsData(data.polygons)
    globeAny.labelsData(data.labels)
    globeAny.pointsData(data.points)

    // Add hexagons for "Weather Intel" vibe
    globeAny.hexPolygonsData(data.polygons)
    globeAny.hexPolygonResolution(3)
    globeAny.hexPolygonMargin(0.7)
    globeAny.hexPolygonColor(() => 'rgba(96, 165, 250, 0.4)')
    globeAny.hexPolygonAltitude(0.01)

    // Performance Props & Static Styles
    globeAny.pointRadius(lodLevel === 'tactical' ? 0.08 : 0.12)
    globeAny.pointAltitude(0.02) // Raised to stay above hexagons
    globeAny.polygonAltitude(0.001) // Lower than hexagons
    
    globeAny.pointColor(() => '#ffffff')
    globeAny.labelLat((d: any) => d.lat)
    globeAny.labelLng((d: any) => d.lng)
    globeAny.labelText((d: any) => d.name)
    globeAny.labelSize((d: any) => d.size)
    globeAny.labelDotRadius((d: any) => d.type === 'City' ? 0.15 : 0)
    globeAny.labelColor((d: any) => d.color || '#bfdbfe')
    globeAny.labelResolution(2) // Reduced slightly for performance
    globeAny.labelIncludeDot((d: any) => d.type === 'City')

  }, [processedData, lodLevel, globe])



  // Optimized Atmospheric Layer
  useEffect(() => {
    const current = globeRef.current;
    if (!cloudsRef.current && current) {
      const loader = new THREE.TextureLoader()
      loader.load('/globe/earth-clouds.png', (texture) => {
        const geometry = new THREE.SphereGeometry(101.5, 32, 32) 
        const material = new THREE.MeshPhongMaterial({
          map: texture,
          transparent: true,
          opacity: 0.08, // Subtle clouds to not obscure tiled maps
          depthWrite: false,
          side: THREE.DoubleSide
        })
        const clouds = new THREE.Mesh(geometry, material)
        cloudsRef.current = clouds
        current.add(clouds)
      })
    }
  }, [])

  useEffect(() => {
    if (globeRef.current) {
      const children = globeRef.current.children;
      if (cloudsRef.current && !children.includes(cloudsRef.current)) {
          globeRef.current.add(cloudsRef.current)
      }
      if (!children.includes(globe)) {
          globeRef.current.add(globe)
      }
      globeRef.current.scale.set(1, 1, 1)
    }
  }, [globe])

  // Optimized Selection Rings
  useEffect(() => {
    const g = globe as any
    if (selectedLocation) {
      const ringData = [{
        lat: selectedLocation.lat,
        lng: selectedLocation.lng,
      }]
      
      g.ringsData(ringData)
      g.ringColor(() => '#ef4444')
      g.ringMaxRadius(4)
      g.ringPropagationSpeed(2)
      g.ringRepeatPeriod(1000)
    } else {
      g.ringsData([])
    }
  }, [selectedLocation, globe])

  // Optimized animation frame with smooth camera transitions
  useFrame((state) => {
    const current = globeRef.current;
    if (!current) return;

    // Throttle to ~30fps for smoother performance
    const now = state.clock.elapsedTime
    if (now - lastFrameTime.current < 0.033) return
    lastFrameTime.current = now

    // LOD Distance Detection with HYSTERESIS to prevent flickering
    const distance = state.camera.position.length()
    let nextLod: 'global' | 'regional' | 'tactical' = lastLodLevel.current
    
    // Add margin to prevent jitter
    if (distance < 170) nextLod = 'tactical'
    else if (distance > 185 && distance < 235) nextLod = 'regional'
    else if (distance > 245) nextLod = 'global'

    if (nextLod !== lastLodLevel.current) {
      lastLodLevel.current = nextLod
      setLodLevel(nextLod)
    }


    // Dynamic Cloud Opacity based on distance
    if (cloudsRef.current) {
      const cloudOpacity = THREE.MathUtils.clamp((distance - 160) / 100, 0, 0.12)
      if (Array.isArray(cloudsRef.current.material)) {
        cloudsRef.current.material.forEach(m => { m.opacity = cloudOpacity; m.transparent = true; })
      } else {
        (cloudsRef.current.material as THREE.MeshPhongMaterial).opacity = cloudOpacity
        cloudsRef.current.material.transparent = true
      }
      cloudsRef.current.visible = cloudOpacity > 0
    }

    if (selectedLocation) {
      const targetY = -(selectedLocation.lng * (THREE.MathUtils.DEG2RAD))
      const currentY = current.rotation.y
      let diffY = targetY - (currentY % (Math.PI * 2))
      diffY = ((diffY + Math.PI) % (Math.PI * 2)) - Math.PI
      
      const targetX = (selectedLocation.lat * (THREE.MathUtils.DEG2RAD)) * 0.5 
      const currentX = current.rotation.x
      
      // Smoother interpolation with better easing
      current.rotation.y += diffY * 0.05
      current.rotation.x += (targetX - currentX) * 0.05
    } else {
      current.rotation.y += 0.0003
      current.rotation.x += (0 - current.rotation.x) * 0.05
    }
    
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += 0.0005
    }
  })



  const getPosition = useCallback((lat: number, lng: number, radius: number = 100) => {
    const latRad = lat * (Math.PI / 180);
    const lngRad = lng * (Math.PI / 180);
    
    const x = radius * Math.cos(latRad) * Math.cos(lngRad); 
    const y = radius * Math.sin(latRad);
    const z = -radius * Math.cos(latRad) * Math.sin(lngRad);
    
    return new THREE.Vector3(x, y, z);
  }, [])

  const handlePointerMove = useCallback((e: any) => {
    e.stopPropagation()
    const obj = e.object as any
    const data = obj.__data
    
    if (data && (data.name || (data.properties && data.properties.name))) {
      document.body.style.cursor = 'pointer'
      setHoveredData({
        name: data.name || data.properties.name,
        type: data.type || (data.geometry ? 'Territory' : 'Location'),
        position: e.point.clone()
      })
    } else {
      document.body.style.cursor = 'default'
      setHoveredData(null)
    }
  }, [])

  const handlePointerDown = useCallback((e: any) => {
    e.stopPropagation()
    
    // Only allow selection if we are hovering over specific data (City, Country, etc.)
    // This prevents random pinning on the ocean or empty land.
    if (hoveredData && onLocationSelect) {
      const globeRadius = 100
      const localPoint = globeRef.current!.worldToLocal(hoveredData.position.clone())
      const lat = Math.asin(localPoint.y / globeRadius) * (180 / Math.PI)
      const lng = -Math.atan2(localPoint.z, localPoint.x) * (180 / Math.PI)
      
      onLocationSelect(lat, lng)
    }
  }, [onLocationSelect, hoveredData])

  return (
    <>
      <group 
        ref={globeRef} 
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerOut={() => setHoveredData(null)}
      />
      
      {/* Custom Pin Marker */}
      {selectedLocation && (
        <PinMarker position={getPosition(selectedLocation.lat, selectedLocation.lng, 104)} />
      )}
      
      {hoveredData && (
        <Html position={hoveredData.position} style={{ pointerEvents: 'none', zIndex: 10000 }}>
          <div className="bg-black/80 backdrop-blur-xl border border-primary/40 px-5 py-3 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] transform -translate-y-full -translate-x-1/2 mt-[-20px] min-w-[140px] animate-in zoom-in-95 fade-in duration-200">
             <div className="flex items-center justify-between gap-3 mb-1.5 pb-1.5 border-b border-white/5">
                <div className="flex items-center gap-1.5">
                   <div className={`w-1.5 h-1.5 rounded-full ${hoveredData.type === 'City' ? 'bg-blue-400 animate-pulse' : 'bg-white'}`} />
                   <p className="text-[7px] font-black uppercase text-white/40 tracking-[0.2em]">{hoveredData.type}</p>
                </div>
                <span className="text-[6px] font-mono text-primary/60">LVL_{lodLevel.toUpperCase()}</span>
             </div>
             <p className="text-sm font-black text-white italic tracking-tight">{hoveredData.name}</p>
             <div className="flex gap-2 mt-2">
                <div className="h-1 flex-1 bg-primary/20 rounded-full overflow-hidden">
                   <div className="h-full w-2/3 bg-primary animate-shimmer" />
                </div>
             </div>
          </div>
        </Html>
      )}

      
      {selectedLocation && selectedLocationName && (
         <Html position={getPosition(selectedLocation.lat, selectedLocation.lng, 108)} style={{ pointerEvents: 'none', zIndex: 9000 }}>
            <div className="relative">
              <div className="bg-gradient-to-r from-red-500/20 to-orange-500/20 backdrop-blur-md border-2 border-red-500/60 px-4 py-2 rounded-xl shadow-2xl transform -translate-x-1/2 -translate-y-full">
                 <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                   <p className="text-xs font-black uppercase text-red-400 tracking-wider whitespace-nowrap">{selectedLocationName}</p>
                 </div>
              </div>
            </div>
         </Html>
      )}

    </>
  )
}

export const WorldGlobe = ({ onLocationSelect, selectedLocation, selectedLocationName, setViewMode }: GlobeInnerProps) => {
  return (
    <div className="w-full h-full min-h-[400px]">
      <Canvas 
        camera={{ position: [0, 0, 280], fov: 45 }} 
        dpr={[1, 2]} // Better resolution on Retina/High-DPI screens
        gl={{ 
          antialias: true, // Smooth edges
          alpha: true, 
          powerPreference: "high-performance",
          stencil: false,
          depth: true
        }}
        performance={{ min: 0.5 }}
      >

        <color attach="background" args={['#03050c']} />
        
        {/* Optimized Lighting */}
        <ambientLight intensity={1.5} color="#ffffff" />
        <directionalLight position={[200, 200, 200]} intensity={2} color="#ffffff" />
        <pointLight position={[-200, 100, 100]} intensity={1.5} color="#3b82f6" />
        
        <OrbitControls 
          enablePan={false} 
          enableZoom={true} 
          minDistance={120} 
          maxDistance={600} 
          rotateSpeed={0.6}
          zoomSpeed={1.2}
          enableDamping={true}
          dampingFactor={0.05}
          autoRotate={!selectedLocation}
          autoRotateSpeed={0.5}
          makeDefault
          maxPolarAngle={Math.PI}
          minPolarAngle={0}
          mouseButtons={{
            LEFT: THREE.MOUSE.ROTATE,
            MIDDLE: THREE.MOUSE.DOLLY,
            RIGHT: THREE.MOUSE.ROTATE
          }}
          touches={{
            ONE: THREE.TOUCH.ROTATE,
            TWO: THREE.TOUCH.DOLLY_ROTATE
          }}
        />
        
        <Stars radius={300} depth={100} count={6000} factor={4} saturation={0} fade speed={1} />
        
        <Suspense fallback={null}>
          <Environment preset="city" />
          <GlobeInner 
            onLocationSelect={onLocationSelect} 
            selectedLocation={selectedLocation} 
            selectedLocationName={selectedLocationName}
            setViewMode={setViewMode}
          />
        </Suspense>
      </Canvas>

      {/* Precision Targeting Interface - The Google Maps Integration (Placed Outside Canvas for Performance) */}
      <div className="absolute top-8 left-8 z-50 flex flex-col gap-4">
        <button 
          onClick={() => setViewMode?.('map')}
          className="group relative flex items-center gap-4 bg-blue-600 hover:bg-blue-500 border border-blue-400/50 px-8 py-4 rounded-full transition-all duration-500 shadow-[0_0_40px_rgba(59,130,246,0.4)] active:scale-95 hover:scale-105"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-blue-600 shadow-inner">
            <MapIcon className="h-6 w-6" />
          </div>
          <div className="flex flex-col items-start leading-tight">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-100/80">Satellite Data</span>
            <span className="text-lg font-black text-white tracking-tight">MAP VIEW</span>
          </div>
          
          {/* Visual pulse for attention */}
          <span className="absolute -right-1 -top-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-500 border-2 border-white"></span>
          </span>
        </button>
        
        <div className="bg-black/80 backdrop-blur-xl border border-white/10 p-4 rounded-3xl flex flex-col gap-3 shadow-2xl">
          <div className="flex items-center justify-between">
            <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Weather Intelligence</div>
            <div className="flex h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
          </div>
          
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-8">
              <span className="text-[9px] text-white/40 font-bold">SOURCE</span>
              <span className="text-[9px] text-blue-300 font-mono">SAT_HD_HYBRID</span>
            </div>
            <div className="flex items-center justify-between gap-8">
              <span className="text-[9px] text-white/40 font-bold">UPTIME</span>
              <span className="text-[9px] text-green-400 font-mono">99.9%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
