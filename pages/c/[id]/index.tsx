import React from 'react'
import DefaultLayout from '../../../components/pages/default-layout'
import MessageLayout from '../../../components/pages/message-layout'
import { useAppContext } from '../../../providers/app-provider'
import { BackgroundImage } from '@mantine/core'

export default function Conversation({ children }: any) {
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
    organisationId,
    channel,
    channelMessagesQuery,
    conversationMessagesQuery,
    channelQuery,
    conversationQuery,
    refreshApp,
  } = useAppContext()

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
      thread={children}
    >
      <BackgroundImage h="100vh" src="/bg-chat.png">
        {organisationData && (
          <MessageLayout
            organisationData={organisationData}
            organisationId={organisationId}
            refreshApp={refreshApp}
            messagesLoading={
              channel
                ? channelMessagesQuery.isLoading
                : conversationMessagesQuery.isLoading
            }
            messages={messages}
            setMessages={setMessages}
            theme={theme}
            type={channel ? 'channel' : 'conversation'}
            data={
              channel
                ? channelQuery?.data?.data?.data
                : conversationQuery?.data?.data?.data
            }
          />
        )}
      </BackgroundImage>
    </DefaultLayout>
  )
}
