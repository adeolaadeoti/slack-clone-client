import { useEffect, useRef } from 'react'
import React from 'react'
import {
  Avatar,
  Flex,
  Text,
  Tooltip,
  createStyles,
  getStylesRef,
} from '@mantine/core'
import DOMPurify from 'dompurify'
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css'
import { useAppContext } from '../providers/app-provider'
import { formatDate } from '../utils/helpers'
import { LuReplyAll } from 'react-icons/lu'
import { useRouter } from 'next/router'

const useStyles = createStyles((theme) => ({
  message: {
    padding: theme.spacing.sm,
    position: 'relative',
    '&:hover': {
      backgroundColor: theme.colors.dark[7],
      [`& .${getStylesRef('actions')}`]: {
        display: 'flex !important',
      },
    },
  },
  actions: {
    ref: getStylesRef('actions'),
    display: 'none !important',
    position: 'absolute',
    right: 0,
    top: -20,
    borderRadius: theme.radius.md,
    padding: theme.spacing.xs,
    backgroundColor: theme.colors.dark[8],
    border: `1px solid ${theme.colors.dark[4]}`,
    '& > *': {
      cursor: 'pointer',
      paddingInline: theme.spacing.sm,
      paddingBlock: theme.spacing.xs,
      borderRadius: theme.radius.md,
      '&:hover': {
        backgroundColor: theme.colors.dark[5],
      },
    },
  },
  reaction: {
    color: theme.colors.dark[1],
    paddingInline: theme.spacing.sm,
    paddingBlock: theme.spacing.xs,
    cursor: 'pointer',
    borderRadius: 10,
    border: `1px solid ${theme.colors.dark[5]}`,
    transition: 'all .2s ease',
    '&:hover': {
      backgroundColor: theme.colors.dark[5],
    },
  },
}))

export default function MessageList({ userId, messages, theme }: any) {
  const { socket } = useAppContext()
  const messageRefs = useRef<Array<HTMLDivElement>>([])
  const { classes } = useStyles()
  const router = useRouter()

  function handleReaction(emoji: string, id: string) {
    socket.emit('reaction', { emoji, id, userId })
  }

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
      observer.disconnect()
    }
  }, [messages])

  return (
    <>
      {messages?.map((msg: any) => (
        <Flex
          className={classes.message}
          gap="sm"
          key={msg?._id}
          data-message-id={msg._id}
          data-message-seen={msg.hasRead}
          ref={(element: HTMLDivElement) => {
            messageRefs.current.push(element)
          }}
        >
          <Flex className={classes.actions} gap="xs" align="center">
            <Tooltip
              label="Completed"
              withArrow
              position="top"
              onClick={() => handleReaction('✅', msg._id)}
            >
              <Text fz="md" tt="lowercase" c={theme.colors.dark[3]} span>
                ✅
              </Text>
            </Tooltip>
            <Tooltip
              label="Taking a look"
              withArrow
              position="top"
              onClick={() => handleReaction('👀', msg._id)}
            >
              <Text fz="md" tt="lowercase" c={theme.colors.dark[3]} span>
                👀
              </Text>
            </Tooltip>
            <Tooltip
              label="Nicely done"
              withArrow
              position="top"
              onClick={() => handleReaction('👍', msg._id)}
            >
              <Text fz="md" tt="lowercase" c={theme.colors.dark[3]} span>
                👍
              </Text>
            </Tooltip>
            <Tooltip
              label="Reply in thread"
              withArrow
              position="top"
              onClick={() => router.push(`/c/${router.query.id}/t/${msg._id}`)}
            >
              <Flex align="flex-start" gap="xs">
                <LuReplyAll color={theme.colors.dark[1]} />
                <Text fz="xs" fw="bold" c={theme.colors.dark[1]}>
                  Reply
                </Text>
              </Flex>
            </Tooltip>
          </Flex>
          <Avatar
            src={`/avatars/${msg?.sender?.username?.[0].toLowerCase()}.png`}
            size="lg"
            radius="lg"
          />
          <Flex direction="column">
            <Flex align="center" gap="md">
              <Text fz="sm" fw="bold" c="white" span>
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
            <Flex align="center" gap="sm">
              {msg.reactions?.map((reaction: any) => {
                const reactionsFrom = reaction.reactedToBy.map(
                  (user: any) => user.username
                )

                return (
                  <Tooltip
                    label={reactionsFrom?.join(', ')}
                    withArrow
                    position="top"
                    key={reaction._id}
                  >
                    <Text
                      role="button"
                      fz="xs"
                      tt="lowercase"
                      className={classes.reaction}
                      span
                      onClick={() => handleReaction(reaction?.emoji, msg?._id)}
                      style={{
                        backgroundColor: reaction?.reactedToBy?.some(
                          (user: any) => user?._id === userId
                        )
                          ? theme.colors.dark[5]
                          : 'transparent',
                      }}
                    >
                      {reaction?.emoji} &nbsp;{reaction?.reactedToBy?.length}
                    </Text>
                  </Tooltip>
                )
              })}
            </Flex>
          </Flex>
        </Flex>
      ))}
    </>
  )
}
