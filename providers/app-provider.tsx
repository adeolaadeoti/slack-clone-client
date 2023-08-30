import { useQuery } from '@tanstack/react-query'
import React, { createContext, useContext, useState } from 'react'
import axios from '../services/axios'
import {
  Center,
  Flex,
  Loader,
  LoadingOverlay,
  MantineTheme,
  Skeleton,
  Stack,
  useMantineTheme,
} from '@mantine/core'
import io, { Socket } from 'socket.io-client'
import { useRouter } from 'next/router'
const socket = io('http://localhost:3000')

interface Data {
  // Define your data structure here
  name: string
  // ... other fields
}

interface ContextProps {
  theme: MantineTheme
  socket: Socket
  data: any
  conversations: any
  setConversations: any
  channels: any
  setChannels: any
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
  const theme = useMantineTheme()
  const router = useRouter()
  const { id } = router.query

  const query = useQuery(
    ['organisation'],
    () => axios.get(`/organisation/${localStorage.getItem('organisationId')}`),
    {
      onSuccess: (data) => {
        setData(data?.data?.data)
      },
    }
  )

  function updateUserStatus(id: string, isOnline: boolean) {
    const updatedConversations = data?.conversations?.map(
      (conversation: any) => {
        if (conversation.createdBy === id) {
          const newConvo = { ...conversation, isOnline }
          return newConvo
        }
        return conversation
      }
    )
    setConversations(updatedConversations)
  }

  React.useEffect(() => {
    socket.connect()
    if (data) {
      setChannels(data?.channels)
      socket.emit('user-join', { id: data?.profile?._id, isOnline: true })
      socket.on('user-join', ({ id, isOnline }) => {
        updateUserStatus(id, isOnline)
      })
      socket.on('user-leave', ({ id, isOnline }) => {
        updateUserStatus(id, isOnline)
      })
    }
    return () => {
      socket.off('user-join')
      socket.off('user-leave')
      socket.disconnect()
    }
  }, [data])

  React.useEffect(() => {
    if (data && id && localStorage.getItem('channel')) {
      socket.emit('channel-open', {
        id,
        userId: data?.profile?._id,
      })
      socket.on('channel-updated', (updatedChannel) => {
        const channels = data?.channels?.map((c: any) => {
          if (c._id === id) {
            return updatedChannel
          }
          return c
        })
        setChannels(channels)
      })
    }
    if (data && id && localStorage.getItem('channel') === 'false') {
      socket.emit('convo-open', {
        id,
        userId: data?.profile?._id,
      })
      socket.on('convo-updated', (updatedConversations) => {
        const conversations = data?.conversations?.map((c: any) => {
          if (c._id === id) {
            return {
              ...c,
              hasNotOpen: updatedConversations.hasNotOpen,
            }
          }
          return c
        })
        setConversations(conversations)
      })
    }
    return () => {
      socket.off('channel-open')
      socket.off('channel-updated')
      socket.off('convo-open')
      socket.off('convo-updated')
    }
  }, [data, id])

  if (query.isLoading)
    return (
      <Center p="xl" h="100vh" w="100vw" bg={theme.colors.dark[9]}>
        <Flex gap={10} align="center" w="30%" mx="auto">
          <Skeleton className="page-skeleton" height={50} width={50} circle />
          <Stack spacing="xs" w="80%">
            <Skeleton className="page-skeleton" height={15} radius="xl" />
            <Skeleton
              className="page-skeleton"
              height={15}
              w="80%"
              radius="xl"
            />
          </Stack>
        </Flex>
      </Center>
    )

  return (
    <AppContext.Provider
      value={{
        theme,
        socket,
        data,
        setData,
        conversations,
        setConversations,
        channels,
        setChannels,
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
