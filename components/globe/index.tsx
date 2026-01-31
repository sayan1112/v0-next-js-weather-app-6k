'use client'

import React, { useEffect, useRef, useMemo, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, Environment, Stars, Float, ContactShadows } from '@react-three/drei'
import * as THREE from 'three'
import ThreeGlobe from 'three-globe'

interface GlobeInnerProps {
  onLocationSelect?: (lat: number, lng: number) => void
  selectedLocation?: { lat: number; lng: number } | null
}

const GlobeInner = ({ onLocationSelect, selectedLocation }: GlobeInnerProps) => {
  const globeRef = useRef<THREE.Group>(null)
  const cloudsRef = useRef<THREE.Mesh>(null)
  
  const globe = useMemo(() => {
    const g = new ThreeGlobe()
    const globeAny = g as any
    
    // High-Res Textures with HTTPS
    globeAny.globeImageUrl('https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
    globeAny.bumpImageUrl('https://unpkg.com/three-globe/example/img/earth-topology.png')
    globeAny.atmosphereColor('#3b82f6')
    globeAny.atmosphereAltitude(0.25)
    
    // Administrative Boundaries
    globeAny.polygonCapColor(() => 'rgba(255, 255, 255, 0.05)')
    globeAny.polygonSideColor(() => 'rgba(0, 0, 0, 0.2)')
    globeAny.polygonStrokeColor(() => 'rgba(59, 130, 246, 0.4)')
    
    fetch('https://raw.githubusercontent.com/vasturiano/three-globe/master/example/country-polygons/ne_110m_admin_0_countries.geojson')
      .then(res => res.json())
      .then(geojson => {
        globeAny.polygonsData(geojson.features)
      })

    const cities = [
      { name: 'San Francisco', lat: 37.7, lng: -122.4, size: 0.8 },
      { name: 'New York', lat: 40.7, lng: -74, size: 0.8 },
      { name: 'London', lat: 51.5, lng: -0.1, size: 0.8 },
      { name: 'Tokyo', lat: 35.6, lng: 139.7, size: 0.8 },
      { name: 'Sydney', lat: -33.8, lng: 151.2, size: 0.7 },
      { name: 'Mumbai', lat: 19, lng: 72.8, size: 0.8 },
      { name: 'Pune', lat: 18.5, lng: 73.8, size: 0.6 },
      { name: 'Moscow', lat: 55.7, lng: 37.6, size: 0.8 },
      { name: 'Seoul', lat: 37.5, lng: 126.9, size: 0.8 },
      { name: 'Lagos', lat: 6.5, lng: 3.3, size: 0.7 },
      { name: 'Jakarta', lat: -6.2, lng: 106.8, size: 0.7 },
    ]

    globeAny.labelsData(cities)
    globeAny.labelLat((d: any) => d.lat)
    globeAny.labelLng((d: any) => d.lng)
    globeAny.labelText((d: any) => d.name)
    globeAny.labelSize(0.6)
    globeAny.labelDotRadius(0.2)
    globeAny.labelColor(() => '#3b82f6')
    globeAny.labelResolution(3)

    return g
  }, [])

  // Atmospheric Layer
  useEffect(() => {
    const current = globeRef.current;
    if (!cloudsRef.current && current) {
      const loader = new THREE.TextureLoader()
      loader.load('https://unpkg.com/three-globe/example/img/earth-clouds.png', (texture) => {
        const geometry = new THREE.SphereGeometry(100.2, 64, 64)
        const material = new THREE.MeshPhongMaterial({
          map: texture,
          transparent: true,
          opacity: 0.3,
          depthWrite: false
        })
        const clouds = new THREE.Mesh(geometry, material)
        cloudsRef.current = clouds
        current.add(clouds)
      })
    }
  }, [])

  useEffect(() => {
    if (globeRef.current) {
      globeRef.current.add(globe)
      globeRef.current.scale.set(1, 1, 1)
    }
  }, [globe])

  // Radar Pulse for Selection
  useEffect(() => {
    if (selectedLocation) {
      const g = globe as any
      g.pointsData([{ 
        lat: selectedLocation.lat, 
        lng: selectedLocation.lng, 
        size: 1.5, 
        color: '#ff3e3e' 
      }])
      g.pointAltitude(0.01)
      g.pointRadius(0.8)
      g.pointsTransitionDuration(1000)
    }
  }, [selectedLocation, globe])

  useFrame(() => {
    const current = globeRef.current;
    if (!current) return;

    if (selectedLocation) {
      // Rotate for Longitude (Y-axis)
      const targetY = -(selectedLocation.lng * (Math.PI / 180))
      const currentY = current.rotation.y
      let diffY = targetY - (currentY % (Math.PI * 2))
      diffY = ((diffY + Math.PI) % (Math.PI * 2)) - Math.PI
      current.rotation.y += diffY * 0.08

      // Rotate for Latitude (X-axis)
      const targetX = (selectedLocation.lat * (Math.PI / 180))
      const currentX = current.rotation.x
      let diffX = targetX - (currentX % (Math.PI * 2))
      diffX = ((diffX + Math.PI) % (Math.PI * 2)) - Math.PI
      current.rotation.x += diffX * 0.08
    } else {
      current.rotation.y += 0.001
      // Slowly return to neutral X rotation
      current.rotation.x += (0 - current.rotation.x) * 0.02
    }
    
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += 0.0007
    }
  })

  const handlePointerDown = (e: any) => {
    e.stopPropagation()
    const globeRadius = 100
    if (e.point) {
      const localPoint = new THREE.Vector3().copy(e.point)
      globeRef.current?.worldToLocal(localPoint)
      const lat = Math.asin(localPoint.y / globeRadius) * (180 / Math.PI)
      const lng = -Math.atan2(localPoint.z, localPoint.x) * (180 / Math.PI)
      if (onLocationSelect) onLocationSelect(lat, lng)
    }
  }

  return <group ref={globeRef} onPointerDown={handlePointerDown} />
}

export const WorldGlobe = ({ onLocationSelect, selectedLocation }: GlobeInnerProps) => {
  return (
    <div className="w-full h-full min-h-[400px]">
      <Canvas 
        shadows 
        camera={{ position: [0, 0, 250], fov: 45 }} 
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <color attach="background" args={['#010208']} />
        <ambientLight intensity={1.2} />
        <pointLight position={[150, 150, 150]} intensity={3} />
        <spotLight position={[-150, -150, -150]} intensity={2} color="#3b82f6" />
        <directionalLight position={[0, 0, 200]} intensity={0.5} />
        <PerspectiveCamera makeDefault position={[0, 0, 220]} />
        <OrbitControls 
          enablePan={false} 
          enableZoom={true} 
          minDistance={120} 
          maxDistance={400} 
          rotateSpeed={0.8}
          autoRotate={!selectedLocation}
          autoRotateSpeed={0.5}
        />
        <Stars radius={300} depth={60} count={15000} factor={7} saturation={0} fade />
        <Suspense fallback={null}>
          <Environment preset="night" />
          <Float speed={0.5} rotationIntensity={0.1} floatIntensity={0.1}>
            <GlobeInner onLocationSelect={onLocationSelect} selectedLocation={selectedLocation} />
          </Float>
        </Suspense>
        <ContactShadows position={[0, -110, 0]} opacity={0.4} scale={200} blur={2.5} far={150} />
      </Canvas>
    </div>
  )
}
