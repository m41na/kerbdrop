import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import * as Location from 'expo-location'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { DEFAULT_RADIUS_MILES } from '@kerbdrop/shared'

const LOCATION_STORAGE_KEY = 'kerbdrop:location'

export interface UserLocation {
  lat: number
  lng: number
  label: string          // "Brooklyn, NY" — display only
  radiusMiles: number
  source: 'gps' | 'manual'
}

interface LocationContextValue {
  location: UserLocation | null
  isLoading: boolean
  hasPermission: boolean | null
  requestPermission: () => Promise<boolean>
  setManualLocation: (label: string, lat: number, lng: number) => Promise<void>
  setRadius: (miles: number) => void
  refreshGPS: () => Promise<void>
}

const LocationContext = createContext<LocationContextValue | null>(null)

export function LocationProvider({ children }: { children: ReactNode }) {
  const [location, setLocation] = useState<UserLocation | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)

  useEffect(() => {
    initLocation()
  }, [])

  async function initLocation() {
    // Try to restore from storage first
    const stored = await AsyncStorage.getItem(LOCATION_STORAGE_KEY)
    if (stored) {
      setLocation(JSON.parse(stored))
      setIsLoading(false)
    }

    // Check permission status
    const { status } = await Location.getForegroundPermissionsAsync()
    setHasPermission(status === 'granted')

    if (status === 'granted') {
      await refreshGPS()
    } else {
      setIsLoading(false)
    }
  }

  async function requestPermission(): Promise<boolean> {
    const { status } = await Location.requestForegroundPermissionsAsync()
    const granted = status === 'granted'
    setHasPermission(granted)
    if (granted) await refreshGPS()
    return granted
  }

  async function refreshGPS() {
    try {
      setIsLoading(true)
      const coords = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })
      const [geocoded] = await Location.reverseGeocodeAsync(coords.coords)

      const label = [geocoded?.city, geocoded?.region]
        .filter(Boolean)
        .join(', ') || 'Your area'

      const newLocation: UserLocation = {
        lat: coords.coords.latitude,
        lng: coords.coords.longitude,
        label,
        radiusMiles: location?.radiusMiles ?? DEFAULT_RADIUS_MILES,
        source: 'gps',
      }

      setLocation(newLocation)
      await AsyncStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(newLocation))
    } catch {
      // GPS failed — keep existing location if available
    } finally {
      setIsLoading(false)
    }
  }

  async function setManualLocation(label: string, lat: number, lng: number) {
    const newLocation: UserLocation = {
      lat,
      lng,
      label,
      radiusMiles: location?.radiusMiles ?? DEFAULT_RADIUS_MILES,
      source: 'manual',
    }
    setLocation(newLocation)
    await AsyncStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(newLocation))
  }

  function setRadius(miles: number) {
    if (!location) return
    const updated = { ...location, radiusMiles: miles }
    setLocation(updated)
    AsyncStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(updated))
  }

  return (
    <LocationContext.Provider value={{
      location,
      isLoading,
      hasPermission,
      requestPermission,
      setManualLocation,
      setRadius,
      refreshGPS,
    }}>
      {children}
    </LocationContext.Provider>
  )
}

export function useLocation() {
  const ctx = useContext(LocationContext)
  if (!ctx) throw new Error('useLocation must be used within LocationProvider')
  return ctx
}
