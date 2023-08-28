import { useRouter } from 'next/router'
import React from 'react'
import DefaultLayout from '../../components/pages/default-layout'
import MessageLayout from '../../components/pages/message-layout'
import { useQuery } from '@tanstack/react-query'
import axios from '../../services/axios'
import { useAppContext } from '../../providers/app-provider'
import { BackgroundImage } from '@mantine/core'

export default function Client() {
  const router = useRouter()
  const {
    data: organisationData,
    conversations,
    channels,
    socket,
    theme,
  } = useAppContext()
  const { id } = router.query

  const [selected, setSelected] = React.useState<any>()
  const [channel, setChannel] = React.useState('')
  const [messages, setMessages] = React.useState<any>([])

  const query = useQuery([`channel/${id}`], () => axios.get(`/channel/${id}`), {
    enabled: channel === 'true',
    onSuccess: async (data) => {
      if (channel === 'true') {
        setSelected(data?.data?.data)
        const res = await axios.get(`/messages`, {
          params: {
            channelId: data?.data?.data?._id,
            organisation: organisationData?._id,
          },
        })
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
          try {
            const res = await axios.get(`/messages`, {
              params: {
                conversation: data?.data?.data?._id,
                organisation: organisationData?._id,
                isSelf: data?.data?.data?.isSelf,
              },
            })
            setMessages(res?.data?.data)
          } catch (error) {}
        }
      },
    }
  )

  React.useEffect(() => {
    setChannel(localStorage.getItem('channel') as string)
  }, [id])

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
    >
      <BackgroundImage h="100vh" src="/bg-chat.png">
        <MessageLayout
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
