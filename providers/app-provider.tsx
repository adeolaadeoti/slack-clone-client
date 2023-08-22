import { useQuery } from '@tanstack/react-query'
import React, { createContext, useContext, useState } from 'react'
import axios from '../services/axios'
import { LoadingOverlay } from '@mantine/core'
import io, { Socket } from 'socket.io-client'
const socket = io('http://localhost:3000')

interface Data {
  // Define your data structure here
  name: string
  // ... other fields
}

interface ContextProps {
  socket: Socket
  data: any
  conversations: any
  setConversations: any
  channels: any
  refreshApp: () => void
  isLoading: boolean
  channelData: any
  setChannelData: any
  setData: any
}

const AppContext = createContext<ContextProps | undefined>(undefined)

export const AppContextProvider = ({ children }: any) => {
  const [data, setData] = useState<any | null>(null)
  const [conversations, setConversations] = useState<any | null>(null)
  const [channels, setChannels] = useState<any | null>(null)
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

  React.useEffect(() => {
    socket.connect()
    if (data) {
      setChannels(data?.channels)
      socket.emit('user-join', data?.profile?._id)
      socket.on('user-join', ({ id, isOnline }) => {
        const updatedConversations = data?.conversations.map(
          (conversation: any) => {
            if (conversation.createdById === id) {
              return {
                ...conversation,
                isOnline,
              }
            }
            return conversation
          }
        )
        console.log(updatedConversations, id)
        setConversations(updatedConversations)
      })
      // socket.on('notificati-layout', ({ channelId, collaborators }) => {
      // const updatedChannels = data?.channels.map((channel: any) => {
      //   if (channel._id === channelId) {
      //     return {
      //       ...channel,
      //       hasUnreadMessages: true,
      //     }
      //   }
      //   return channel
      // })
      // setChannels(updatedChannels)
      // const updatedConversations = data?.conversations.map(
      //   (conversation: any) => {
      //     if (conversation._id === conversationId) {
      //       return {
      //         ...conversation,
      //         hasUnreadMessages: true,
      //       }
      //     }
      //     return conversation
      //   }
      // )
      // setChannels(updatedConversations)
      // })
      // console.log(data?.channels)
    }
    return () => {
      socket.off('user-join')
      // socket.off('notification')
      // socket.disconnect()
    }
  }, [data])

  if (query.isLoading) return <LoadingOverlay visible />

  return (
    <AppContext.Provider
      value={{
        socket,
        data,
        setData,
        conversations,
        setConversations,
        channels,
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
