import { useQuery } from '@tanstack/react-query'
import React, { createContext, useContext, useState, useEffect } from 'react'
import axios from '../services/axios'

interface Data {
  // Define your data structure here
  name: string
  // ... other fields
}

interface ContextProps {
  data: any
  refreshApp: () => void
  isLoading: boolean
  channelData: any
  setChannelData: any
  setData: any
}

const AppContext = createContext<ContextProps | undefined>(undefined)

export const AppContextProvider = ({ children }: any) => {
  const [data, setData] = useState<any | null>(null)
  const [channelData, setChannelData] = useState<any>(null)

  const query = useQuery(
    ['organisation'],
    () => axios.get(`/organisation/${localStorage.getItem('organisationId')}`),
    {
      onSuccess: (data) => {
        setData(data?.data?.data)
      },
    }
  )

  return (
    <AppContext.Provider
      value={{
        data,
        setData,
        refreshApp: query.refetch,
        isLoading: query.isLoading,
        channelData,
        setChannelData,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export const useAppContext = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useAppContext must be used within a AppContextProvider')
  }
  return context
}
