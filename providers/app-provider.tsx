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
import { threadId } from 'worker_threads'
const socket = io('http://localhost:3000')

interface ContextProps {
  theme: MantineTheme
  socket: Socket
  data: any
  conversations: any
  setConversations: any
  messages: any
  setMessages: any
  selected: any
  setSelected: any
  channels: any
  setChannels: any
  refreshApp: () => void
  isLoading: boolean
  // channelData: any
  // setChannelData: any
  setData: any

  channel: any
  channelMessagesQuery: any
  conversationMessagesQuery: any
  channelQuery: any
  conversationQuery: any
  threadMessages: any
  setThreadMessages: any
  threadMessagesQuery: any
  selectedMessage: any
  setSelectedMessage: any
  organisationId: any
}

const AppContext = createContext<ContextProps | undefined>(undefined)

export const AppContextProvider = React.memo(({ children }: any) => {
  const [data, setData] = useState<any | null>(null)
  const [conversations, setConversations] = useState<any | null>(null)
  const [channels, setChannels] = useState<any | null>(null)

  const theme = useMantineTheme()
  const router = useRouter()
  const { id, threadId } = router.query
  const [messages, setMessages] = React.useState<any>([])
  const [threadMessages, setThreadMessages] = React.useState<any>([])

  const [selected, setSelected] = React.useState<any>()
  const [selectedMessage, setSelectedMessage] = React.useState<any>()
  const [organisationId, setOrganisationId] = React.useState<string>()

  const [channel, setChannel] = React.useState<boolean>()

  const [canQueryChannelMessages, setCanQueryChannelMessages] =
    React.useState(false)
  const [canQueryConversationMessages, setCanQueryConversationMessages] =
    React.useState(false)

  const query = useQuery(
    ['organisation', organisationId],
    () => axios.get(`/organisation/${organisationId}`),
    {
      enabled: !!organisationId,
      refetchOnMount: false,
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

  const channelQuery = useQuery(
    [`channel`, id],
    () => axios.get(`/channel/${id}`),
    {
      enabled: !!id && channel,
      refetchOnMount: false,
      onSuccess: async (data) => {
        if (channel) {
          setSelected(data?.data?.data)
          setCanQueryChannelMessages(true)
        }
      },
    }
  )

  const channelMessagesQuery = useQuery(
    [`messages`, selected?._id],
    () =>
      axios.get(`/messages`, {
        params: {
          channelId: selected?._id,
          organisation: organisationId,
        },
      }),
    {
      enabled: canQueryChannelMessages,
      refetchOnMount: false,
      onSuccess: async (data) => {
        setMessages(data?.data?.data)
        setCanQueryChannelMessages(false)
      },
    }
  )

  const conversationQuery = useQuery(
    [`conversations`, id],
    () => axios.get(`/conversations/${id}`),
    {
      enabled: !!id && channel === false,
      refetchOnMount: false,

      onSuccess: async (data) => {
        if (channel === false) {
          setSelected(data?.data?.data)
          setCanQueryConversationMessages(true)
        }
      },
    }
  )

  const conversationMessagesQuery = useQuery(
    [`messages`, selected?._id],
    () =>
      axios.get(`/messages`, {
        params: {
          conversation: selected?._id,
          organisation: organisationId,
          isSelf: selected?.isSelf,
        },
      }),
    {
      enabled: canQueryConversationMessages,
      refetchOnMount: false,
      onSuccess: async (data) => {
        setMessages(data?.data?.data)
        setCanQueryConversationMessages(false)
      },
    }
  )
  const threadMessagesQuery = useQuery(
    [`threads`, threadId],
    () =>
      axios.get(`/threads`, {
        params: {
          message: threadId,
        },
      }),
    {
      enabled: !!threadId,
      refetchOnMount: false,
      onSuccess: async (data) => {
        setThreadMessages(data?.data?.data)
      },
    }
  )

  React.useEffect(() => {
    setChannel(localStorage.getItem('channel') === 'true' ? true : false)

    socket.on('message-updated', ({ id, message, isThread }) => {
      if (id === selectedMessage?._id) {
        setSelectedMessage(message)
      }
      if (isThread) {
        const newMessages = threadMessages.map((msg: any) => {
          if (msg._id === id) {
            return message
          }
          return msg
        })
        setThreadMessages(newMessages)
      } else {
        const newMessages = messages.map((msg: any) => {
          if (msg._id === id) {
            return message
          }
          return msg
        })
        setMessages(newMessages)
      }
    })

    return () => {
      socket.off('message-updated')
    }
  }, [id, messages, threadMessages, selectedMessage])

  React.useEffect(() => {
    setOrganisationId(localStorage.getItem('organisationId') as string)
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
    if (data && id && channel) {
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
    if (data && id && channel === false) {
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

  if (query.isLoading && router.pathname.includes('c/'))
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
        organisationId,
        theme,
        socket,
        data,
        setData,
        conversations,
        setConversations,

        messages,
        setMessages,
        selected,
        setSelected,
        channels,
        setChannels,
        refreshApp: query.refetch,
        isLoading: query.isLoading,
        // channelData,
        // setChannelData,

        channel,
        channelMessagesQuery,
        conversationMessagesQuery,
        channelQuery,
        conversationQuery,
        threadMessages,
        setThreadMessages,
        threadMessagesQuery,
        selectedMessage,
        setSelectedMessage,
      }}
    >
      {children}
    </AppContext.Provider>
  )
})

export const useAppContext = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useAppContext must be used within a AppContextProvider')
  }
  return context
}
