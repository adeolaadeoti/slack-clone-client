import React from 'react'
import Conversation from '..'
import {
  Divider,
  Flex,
  Text,
  Tooltip,
  Avatar,
  createStyles,
  getStylesRef,
} from '@mantine/core'
import { useAppContext } from '../../../../providers/app-provider'
import { IoMdClose } from 'react-icons/io'
import { useRouter } from 'next/router'
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css'
import { useQuery } from '@tanstack/react-query'
import axios from '../../../../services/axios'
import dynamic from 'next/dynamic'
const Message = dynamic(() => import('../../../../components/message'), {
  ssr: false,
})
import DOMPurify from 'dompurify'
import { formatDate } from '../../../../utils/helpers'
import { Thread } from '../../../../utils/interfaces'

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

export default function ThreadPage() {
  const {
    theme,
    socket,
    data,
    selected,
    setThreadMessages,
    selectedMessage,
    setSelectedMessage,
  } = useAppContext()
  const router = useRouter()
  const { threadId, id } = router.query
  const { classes } = useStyles()
  const userId = data?.profile?._id

  const query = useQuery(
    [`messages`, threadId],
    () => axios.get(`/messages/${threadId}`),
    {
      refetchOnMount: false,
      onSuccess(data) {
        setSelectedMessage(data?.data?.data)
      },
    }
  )

  function handleReaction(emoji: string, id: string) {
    socket.emit('reaction', { emoji, id, userId })
  }

  React.useEffect(() => {
    socket.on('thread-message', ({ newMessage }) => {
      setThreadMessages((prevMessages) => [
        ...(prevMessages as Thread[]),
        newMessage,
      ])
    })
    return () => {
      socket.off('thread-message')
    }
  }, [])

  return (
    <Conversation>
      <Flex
        bg={theme.colors.dark[7]}
        py={'1.85rem'}
        px="1.85rem"
        align="center"
        gap="sm"
        style={{
          borderBottom: `1px solid ${theme.colors.dark[4]}`,
        }}
      >
        <Text fw="bold">Thread</Text>
        <Text fz="xs"># {String(selected?.name)?.toLowerCase()}</Text>
        <IoMdClose
          onClick={() => router.push(`/c/${id}`)}
          style={{
            cursor: 'pointer',
            marginLeft: 'auto',
          }}
        />
      </Flex>

      {!query.isLoading && (
        <Flex className={classes.message} gap="sm" direction="column">
          <Flex className={classes.message} gap="sm">
            <Flex className={classes.actions} gap="xs" align="center">
              <Tooltip
                label="Completed"
                withArrow
                position="top"
                onClick={() =>
                  handleReaction('✅', selectedMessage?._id as string)
                }
              >
                <Text fz="md" tt="lowercase" c={theme.colors.dark[3]} span>
                  ✅
                </Text>
              </Tooltip>
              <Tooltip
                label="Taking a look"
                withArrow
                position="top"
                onClick={() =>
                  handleReaction('👀', selectedMessage?._id as string)
                }
              >
                <Text fz="md" tt="lowercase" c={theme.colors.dark[3]} span>
                  👀
                </Text>
              </Tooltip>
              <Tooltip
                label="Nicely done"
                withArrow
                position="top"
                onClick={() =>
                  handleReaction('👍', selectedMessage?._id as string)
                }
              >
                <Text fz="md" tt="lowercase" c={theme.colors.dark[3]} span>
                  👍
                </Text>
              </Tooltip>
            </Flex>
            <Avatar
              src={`/avatars/${selectedMessage?.sender?.username?.[0].toLowerCase()}.png`}
              size="lg"
              radius="lg"
            />
            <Flex direction="column">
              <Flex align="center" gap="md">
                <Text fz="sm" fw="bold" c="white" span>
                  {selectedMessage?.sender?.username}
                </Text>
                <Tooltip
                  label={formatDate(selectedMessage?.createdAt as string)?.time}
                  withArrow
                  position="right"
                >
                  <Text fz="xs" tt="lowercase" c={theme.colors.dark[3]} span>
                    {
                      formatDate(selectedMessage?.createdAt as string)
                        ?.timeRender
                    }
                  </Text>
                </Tooltip>
              </Flex>
              <div
                className="chat-wrapper"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(
                    selectedMessage?.content as string,
                    {
                      ADD_ATTR: ['target'],
                    }
                  ),
                }}
              />
              <Flex align="center" gap="sm">
                {selectedMessage?.reactions?.map((reaction) => {
                  const reactionsFrom = reaction.reactedToBy.map(
                    (user) => user.username
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
                        onClick={() =>
                          handleReaction(reaction?.emoji, selectedMessage?._id)
                        }
                        style={{
                          backgroundColor: reaction?.reactedToBy?.some(
                            (user) => user?._id === userId
                          )
                            ? theme.colors.dark[5]
                            : 'transparent',
                        }}
                      >
                        {reaction?.emoji} &nbsp;
                        {reaction?.reactedToBy?.length}
                      </Text>
                    </Tooltip>
                  )
                })}
              </Flex>
            </Flex>
          </Flex>
          {selectedMessage?.threadRepliesCount && (
            <Divider
              px="sm"
              label={`${selectedMessage?.threadRepliesCount} replies`}
            />
          )}
        </Flex>
      )}
      <Message isThread />
    </Conversation>
  )
}
