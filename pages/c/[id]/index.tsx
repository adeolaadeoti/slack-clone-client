import { useRouter } from 'next/router'
import React from 'react'
import DefaultLayout from '../../../components/pages/default-layout'
import MessageLayout from '../../../components/pages/message-layout'
import { useQuery } from '@tanstack/react-query'
import axios from '../../../services/axios'
import { useAppContext } from '../../../providers/app-provider'
import { BackgroundImage } from '@mantine/core'

export default function Conversation({ children }: any) {
  const router = useRouter()
  const {
    data: organisationData,
    conversations,
    channels,
    socket,
    theme,
    messages,
    setMessages,
    selected,
    setSelected,
  } = useAppContext()
  const { id } = router.query

  const [channel, setChannel] = React.useState('')
  const [messagesLoading, setMessagesLoading] = React.useState(false)

  const query = useQuery([`channel/${id}`], () => axios.get(`/channel/${id}`), {
    enabled: channel === 'true',
    onSuccess: async (data) => {
      if (channel === 'true') {
        setSelected(data?.data?.data)
        // setMessagesLoading(true)
        const res = await axios.get(`/messages`, {
          params: {
            channelId: data?.data?.data?._id,
            organisation: organisationData?._id,
          },
        })
        setMessagesLoading(false)
        setMessages(res?.data?.data)
      }
    },
  })

  const convoQuery = useQuery(
    [`convo/${id}`],
    () => axios.get(`/conversations/${id}`),
    {
      enabled: channel === 'false',
      onSuccess: async (data) => {
        if (channel === 'false') {
          setSelected(data?.data?.data)
          // setMessagesLoading(true)
          try {
            const res = await axios.get(`/messages`, {
              params: {
                conversation: data?.data?.data?._id,
                organisation: organisationData?._id,
                isSelf: data?.data?.data?.isSelf,
              },
            })
            setMessagesLoading(false)
            setMessages(res?.data?.data)
          } catch (error) {}
        }
      },
    }
  )

  React.useEffect(() => {
    setChannel(localStorage.getItem('channel') as string)

    socket.on('message-updated', ({ id, message }) => {
      const newMessages = messages.map((msg: any) => {
        if (msg._id == id) {
          return message
        }
        return msg
      })
      setMessages(newMessages)
    })

    return () => {
      socket.off('message-updated')
    }
  }, [id, messages])

  return (
    <DefaultLayout
      data={organisationData}
      socket={socket}
      conversations={conversations}
      channels={channels}
      selected={selected}
      setSelected={setSelected}
      setMessages={setMessages}
      theme={theme}
      style={{
        position: 'relative',
      }}
      thread={children}
    >
      <BackgroundImage
        h="100vh"
        src="/bg-chat.png"
        style={{
          position: 'relative',
        }}
      >
        <MessageLayout
          messagesLoading={messagesLoading}
          messages={messages}
          setMessages={setMessages}
          theme={theme}
          type={channel === 'true' ? 'channel' : 'conversation'}
          data={
            channel === 'true'
              ? query?.data?.data?.data
              : convoQuery?.data?.data?.data
          }
        />
      </BackgroundImage>
    </DefaultLayout>
  )
}
