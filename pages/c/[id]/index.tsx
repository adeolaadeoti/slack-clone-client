import React from 'react'
import DefaultLayout from '../../../components/pages/default-layout'
import MessageLayout from '../../../components/pages/message-layout'
import { useAppContext } from '../../../providers/app-provider'
import { BackgroundImage } from '@mantine/core'
import { useRouter } from 'next/router'

export default function Conversation({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const {
    data: organisationData,
    channel,
    channelMessagesQuery,
    conversationMessagesQuery,
  } = useAppContext()

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      if (!localStorage.getItem('access-token')) {
        router.push('/signin')
      }
    }
  }, [])

  return (
    <DefaultLayout thread={children}>
      <BackgroundImage h="100vh" src="/bg-chat.png">
        {organisationData && (
          <MessageLayout
            messagesLoading={
              channel
                ? channelMessagesQuery.isLoading
                : conversationMessagesQuery.isLoading
            }
            type={channel ? 'channel' : 'conversation'}
          />
        )}
      </BackgroundImage>
    </DefaultLayout>
  )
}
