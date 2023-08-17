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
  const { id } = router.query
  const [selected, setSelected] = React.useState<any>()
  const [channel, setChannel] = React.useState('')
  const [messages, setMessages] = React.useState<any>([])

  const { data } = useAppContext()
  const query = useQuery([`channel/${id}`], () => axios.get(`/channel/${id}`), {
    enabled: channel === 'true',
    onSuccess(data) {
      if (channel === 'true') {
        setSelected(data?.data?.data)
      }
    },
    retry: 0,
  })
  const convoQuery = useQuery(
    [`convo/${id}`],
    () => axios.get(`/conversations/${id}`),
    {
      enabled: channel === 'false',
      onSuccess(data) {
        if (channel === 'false') {
          setSelected(data?.data?.data)
        }
      },
      retry: 0,
    }
  )

  const messageQuery = useQuery(
    [`messages/${id}`],
    () =>
      axios.get(`/messages`, {
        params: {
          channelId: id,
        },
      }),
    {
      enabled: !!id,
      onSuccess(data) {
        setMessages(data?.data?.data)
      },
    }
  )

  React.useEffect(() => {
    if (id) {
      messageQuery.refetch()

      if (channel === 'true') {
        query.refetch()
      }
      if (channel === 'false') {
        convoQuery.refetch()
      }
      setChannel(localStorage.getItem('channel') as string)
    }
  }, [id])

  return (
    <DefaultLayout data={data} selected={selected} setSelected={setSelected}>
      <BackgroundImage h="100vh" src="/bg-chat.png">
        <MessageLayout
          messages={messages}
          setMessages={setMessages}
          refetch={messageQuery.refetch}
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
