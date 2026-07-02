import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import NetInfo, { NetInfoState } from '@react-native-community/netinfo'

interface NetworkContextValue {
  isConnected: boolean
  isInternetReachable: boolean | null
}

const NetworkContext = createContext<NetworkContextValue>({
  isConnected: true,
  isInternetReachable: true,
})

export function NetworkProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<NetInfoState | null>(null)

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(setState)
    return unsubscribe
  }, [])

  return (
    <NetworkContext.Provider value={{
      isConnected: state?.isConnected ?? true,
      isInternetReachable: state?.isInternetReachable ?? true,
    }}>
      {children}
    </NetworkContext.Provider>
  )
}

export function useNetwork() {
  return useContext(NetworkContext)
}
