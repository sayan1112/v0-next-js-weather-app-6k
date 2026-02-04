'use client'

import React, { useEffect, useRef, useMemo, useState, Suspense, useCallback } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Environment, Stars, Html } from '@react-three/drei'
import * as THREE from 'three'
import ThreeGlobe from 'three-globe'

interface GlobeInnerProps {
  onLocationSelect?: (lat: number, lng: number) => void
  selectedLocation?: { lat: number; lng: number } | null
  selectedLocationName?: string
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
  
  const globe = useMemo(() => {
    const g = new ThreeGlobe()
    const globeAny = g as any
    
    // Optimized Textures - Lower resolution for better performance
    globeAny.globeImageUrl('/globe/earth-blue-marble.jpg')
    globeAny.bumpImageUrl('/globe/earth-topology.png')
    globeAny.atmosphereColor('#3b82f6')
    globeAny.atmosphereAltitude(0.2)
    
    // Base Styles
    globeAny.polygonCapColor(() => 'rgba(59, 130, 246, 0.03)')
    globeAny.polygonSideColor(() => 'rgba(0, 0, 0, 0)')
    globeAny.polygonStrokeColor(() => 'rgba(59, 130, 246, 0.08)')
    
    // Load Data with reduced complexity
    Promise.all([
      fetch('/globe/countries.geojson').then(res => res.json()).catch((e) => { console.error('Failed to load countries', e); return { features: [] } }),
      fetch('/globe/states.geojson').then(res => res.json()).catch((e) => { console.error('Failed to load states', e); return { features: [] } }),
      fetch('/globe/cities.json').then(res => res.json()).catch((e) => { console.error('Failed to load cities', e); return [] })
    ]).then(([countriesGeo, statesGeo, citiesData]) => {
      
      // 1. Countries (Polygons) - Simplified
      const simplifiedCountries = countriesGeo.features.filter((d: any) => d.properties.ISO_A2 !== 'AQ')
      globeAny.polygonsData(simplifiedCountries) 
      
      const countryLabels = countriesGeo.features.slice(0, 50).map((f: any) => ({
        name: f.properties.NAME || f.properties.name,
        lat: f.properties.LABEL_Y || f.properties.label_y || 0,
        lng: f.properties.LABEL_X || f.properties.label_x || 0,
        type: 'Country',
        size: 1.0
      })).filter((l: any) => l.lat !== 0)

      // 2. States (Heavily reduced for performance)
      const stateLabels = statesGeo.features.slice(0, 50).map((f: any) => ({
        name: f.properties.name || f.properties.NAME,
        lat: f.properties.latitude || f.properties.LABEL_Y || 0,
        lng: f.properties.longitude || f.properties.LABEL_X || 0,
        type: 'Region',
        size: 0.6
      })).filter((l: any) => l.lat !== 0)

      // 3. Cities (Reduced to 150 for better performance)
      const formattedCities = Array.isArray(citiesData) ? citiesData.slice(0, 150).map((c: any) => ({
         name: c.name,
         lat: parseFloat(c.lat),
         lng: parseFloat(c.lng),
         type: 'City',
         size: 0.4,
         color: '#60a5fa'
      })) : []
      
      globeAny.pointsData(formattedCities)
      globeAny.pointColor(() => '#60a5fa')
      globeAny.pointAltitude(0.005)
      globeAny.pointRadius(0.15)

      // Merge Labels - Reduced total count
      globeAny.labelsData([...countryLabels, ...stateLabels])
      globeAny.labelLat((d: any) => d.lat)
      globeAny.labelLng((d: any) => d.lng)
      globeAny.labelText((d: any) => d.name)
      globeAny.labelSize((d: any) => d.size)
      globeAny.labelDotRadius(0)
      globeAny.labelColor((d: any) => {
        if (d.type === 'Country') return 'rgba(255,255,255, 0.7)'
        if (d.type === 'Region') return 'rgba(255,255,255, 0.5)'
        return '#bfdbfe'
      })
      globeAny.labelResolution(1) // Reduced from 2 to 1 for better performance
    })
    
    return g
  }, [])

  // Optimized Atmospheric Layer
  useEffect(() => {
    const current = globeRef.current;
    if (!cloudsRef.current && current) {
      const loader = new THREE.TextureLoader()
      loader.load('/globe/earth-clouds.png', (texture) => {
        const geometry = new THREE.SphereGeometry(100.15, 32, 32) // Reduced segments from 64 to 32
        const material = new THREE.MeshPhongMaterial({
          map: texture,
          transparent: true,
          opacity: 0.15,
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

    if (selectedLocation) {
      const targetY = -(selectedLocation.lng * (THREE.MathUtils.DEG2RAD))
      const currentY = current.rotation.y
      let diffY = targetY - (currentY % (Math.PI * 2))
      diffY = ((diffY + Math.PI) % (Math.PI * 2)) - Math.PI
      
      const targetX = (selectedLocation.lat * (THREE.MathUtils.DEG2RAD)) * 0.5 
      const currentX = current.rotation.x
      
      // Smoother interpolation with better easing
      current.rotation.y += diffY * 0.1
      current.rotation.x += (targetX - currentX) * 0.1
      
      // Smooth zoom in when location is selected
      const targetDistance = 220
      const currentDistance = state.camera.position.length()
      if (Math.abs(currentDistance - targetDistance) > 1) {
        const newDistance = THREE.MathUtils.lerp(currentDistance, targetDistance, 0.05)
        state.camera.position.normalize().multiplyScalar(newDistance)
      }
    } else {
      current.rotation.y += 0.0003
      current.rotation.x += (0 - current.rotation.x) * 0.05
      
      // Smooth zoom out when no location selected
      const targetDistance = 280
      const currentDistance = state.camera.position.length()
      if (Math.abs(currentDistance - targetDistance) > 1) {
        const newDistance = THREE.MathUtils.lerp(currentDistance, targetDistance, 0.03)
        state.camera.position.normalize().multiplyScalar(newDistance)
      }
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
    const globeRadius = 100
    if (e.point && globeRef.current) {
      const localPoint = globeRef.current.worldToLocal(e.point.clone())
      const lat = Math.asin(localPoint.y / globeRadius) * (180 / Math.PI)
      const lng = -Math.atan2(localPoint.z, localPoint.x) * (180 / Math.PI)
      
      if (onLocationSelect) {
        onLocationSelect(lat, lng)
      }
    }
  }, [onLocationSelect])

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
          <div className="bg-black/90 backdrop-blur-sm border border-white/20 px-3 py-2 rounded-lg shadow-xl transform -translate-y-full -translate-x-1/2 mt-[-10px] min-w-[100px]">
             <div className="flex items-center gap-2 mb-0.5">
                <div className={`w-1.5 h-1.5 rounded-full ${hoveredData.type === 'City' ? 'bg-blue-400' : 'bg-white'}`} />
                <p className="text-[8px] font-bold uppercase text-white/50 tracking-wider">{hoveredData.type}</p>
             </div>
             <p className="text-xs font-bold text-white whitespace-nowrap">{hoveredData.name}</p>
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

export const WorldGlobe = ({ onLocationSelect, selectedLocation, selectedLocationName }: GlobeInnerProps) => {
  return (
    <div className="w-full h-full min-h-[400px]">
      <Canvas 
        camera={{ position: [0, 0, 280], fov: 45 }} 
        dpr={[1, 1.5]}
        gl={{ 
          antialias: true, 
          alpha: true, 
          powerPreference: "high-performance",
          stencil: false,
          depth: true
        }}
        frameloop="always"
        performance={{ min: 0.5 }}
      >
        <color attach="background" args={['#010208']} />
        
        {/* Optimized Lighting */}
        <ambientLight intensity={1.2} color="#ffffff" />
        <pointLight position={[200, 200, 200]} intensity={20000} color="#ffffff" />
        <spotLight position={[-200, 0, 100]} intensity={25000} color="#3b82f6" angle={0.3} penumbra={1} />
        
        <OrbitControls 
          enablePan={false} 
          enableZoom={true} 
          minDistance={150} 
          maxDistance={500} 
          rotateSpeed={0.5}
          zoomSpeed={1.5}
          enableDamping={true}
          dampingFactor={0.1}
          autoRotate={!selectedLocation}
          autoRotateSpeed={0.3}
          makeDefault
          maxPolarAngle={Math.PI * 0.95}
          minPolarAngle={Math.PI * 0.05}
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
        
        <Stars radius={300} depth={50} count={3000} factor={3} saturation={0} fade speed={0.3} />
        
        <Suspense fallback={null}>
          <Environment preset="city" />
          <GlobeInner 
            onLocationSelect={onLocationSelect} 
            selectedLocation={selectedLocation} 
            selectedLocationName={selectedLocationName}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}
