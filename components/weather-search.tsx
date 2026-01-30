'use client'

import React from "react"

import { useState } from 'react'
import { Search, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface WeatherSearchProps {
  onSearch: (city: string) => void
  onUseLocation: () => void
  isLoading?: boolean
}

export function WeatherSearch({
  onSearch,
  onUseLocation,
  isLoading = false,
}: WeatherSearchProps) {
  const [city, setCity] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (city.trim()) {
      onSearch(city)
      setCity('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search for a city..."
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="pl-10"
            disabled={isLoading}
          />
        </div>
        <Button type="submit" disabled={isLoading} className="gap-2">
          {isLoading ? 'Searching...' : 'Search'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onUseLocation}
          disabled={isLoading}
          className="gap-2 bg-transparent"
        >
          <MapPin className="w-4 h-4" />
          <span className="hidden sm:inline">Location</span>
        </Button>
      </div>
    </form>
  )
}
