import { useEffect, useRef } from 'react'
import React from 'react'
import { Avatar, Flex, Text, Tooltip } from '@mantine/core'
import DOMPurify from 'dompurify'
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css'
import { useAppContext } from '../providers/app-provider'
import { formatDate } from '../utils/helpers'

export default function MessageList({ messages, theme }: any) {
  const { socket } = useAppContext()
  const messageRefs = useRef<Array<HTMLDivElement>>([])

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const messageId = entry.target.getAttribute('data-message-id')
          const hasRead = entry.target.getAttribute('data-message-seen')
          if (hasRead === 'false') {
            socket.emit('message-view', messageId)
          }
        }
      })
    })

    messageRefs.current.forEach((ref) => {
      if (ref) {
        observer.observe(ref)
      }
    })

    socket.on('message-view', async (messageId) => {
      //   console.log(messageId)
    })

    return () => {
      // Disconnect the observer when the component unmounts
      observer.disconnect()
    }
  }, [messages])

  return (
    <>
      {messages?.map((msg: any) => (
        <Flex
          gap="sm"
          align="center"
          key={msg?._id}
          data-message-id={msg._id}
          data-message-seen={msg.hasRead}
          ref={(element: HTMLDivElement) => {
            messageRefs.current.push(element)
          }}
        >
          {msg?.username ? (
            <Avatar
              src={`/avatars/${msg?.username?.[0].toLowerCase()}.png`}
              size="xl"
              radius="xl"
            />
          ) : (
            <Avatar
              src={`/avatars/${msg?.sender?.username?.[0].toLowerCase()}.png`}
              size="xl"
              radius="xl"
            />
          )}
          <Flex direction="column">
            <Flex align="center" gap="md">
              <Text fz="sm" fw="bold" c={theme.colors.dark[2]} span>
                {msg?.sender?.username ?? msg?.username}
              </Text>
              <Tooltip
                label={msg?.time ?? formatDate(msg?.createdAt).time}
                withArrow
                position="right"
              >
                <Text fz="xs" tt="lowercase" c={theme.colors.dark[3]} span>
                  {msg?.timeRender ?? formatDate(msg?.createdAt).timeRender}
                </Text>
              </Tooltip>
            </Flex>
            <div
              className="chat-wrapper"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(msg.content, {
                  ADD_ATTR: ['target'],
                }),
              }}
            />
          </Flex>
        </Flex>
      ))}
    </>
  )
}
