import React, { useState } from 'react'
import {
  Avatar,
  Box,
  Flex,
  Loader,
  Paper,
  Stack,
  Text,
  ThemeIcon,
  UnstyledButton,
} from '@mantine/core'
import { EditorState } from 'draft-js'
import { Editor } from 'react-draft-wysiwyg'
import { convertToHTML } from 'draft-convert'
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css'
import 'draft-js-mention-plugin/lib/plugin.css'
import { useAppContext } from '../providers/app-provider'
import { BiEditAlt, BiUserPlus } from 'react-icons/bi'
import { truncateDraftToHtml } from '../utils/helpers'
import { notifications } from '@mantine/notifications'
import MessageList from './message-list'
import { useRouter } from 'next/router'
import { GoMegaphone } from 'react-icons/go'
import { Message as IMessage, MessageProps, User } from '../utils/interfaces'

const Message = ({
  messagesLoading,
  isLoading,
  type,
  isThread = false,
  open,
}: MessageProps) => {
  const router = useRouter()
  const { threadId } = router.query

  const {
    data: organisationData,
    socket,
    conversations,
    selected,
    threadMessages,
    messages,
    setMessages,
    theme,
    channelCollaborators,
  } = useAppContext()
  const userId = organisationData?.profile?._id
  const conversationCollaborators = conversations?.map((conversation) => {
    return conversation.collaborators.map((collaborator) => collaborator._id)
  })

  const [editorState, setEditorState] = useState(() =>
    EditorState.createEmpty()
  )
  const stackRef = React.useRef<HTMLDivElement | null>(null)

  const handleChange = (newEditorState: EditorState) => {
    setEditorState(newEditorState)
  }

  const handleReturn = (
    e: React.KeyboardEvent<{}>,
    editorState: EditorState
  ) => {
    let returnValue = false
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      const contentState = editorState.getCurrentContent()
      const hasText = contentState.getPlainText().trim()

      if (hasText) {
        const htmlContent = convertToHTML({
          entityToHTML: (entity, originalText) => {
            if (entity.type === 'LINK') {
              const { url } = entity.data
              return (
                <a className="entity-link" target="_blank" href={url}>
                  {originalText}
                </a>
              )
            } else if (entity.type === 'MENTION' || entity.type === 'HASHTAG') {
              return <span className="entity-mention">{originalText}</span>
            } else if (entity.type === 'IMAGE') {
              const { src } = entity.data
              return <img src={src} className="entity-image" />
            }

            return originalText
          },
        })(contentState)

        if (htmlContent.includes('@<')) {
          return false
        }

        const message = {
          sender: userId,
          content: htmlContent,
        }

        if (isThread) {
          socket.emit('thread-message', {
            message,
            messageId: threadId,
            userId,
          })
        } else {
          socket.emit('message', {
            message,
            organisation: selected?.organisation,
            hasNotOpen: selected?.collaborators?.filter(
              (c) => c._id !== userId
            ),
            ...(selected?.isChannel && {
              channelId: selected?._id,
              channelName: selected?.name,
              collaborators: selected?.collaborators,
            }),
            ...(selected?.isConversation && {
              conversationId: selected?._id,
              collaborators: selected?.collaborators,
              isSelf:
                selected?.collaborators[0]?._id ===
                selected?.collaborators[1]?._id,
            }),
          })
        }

        const newState = EditorState.createEmpty()
        setEditorState(EditorState.moveFocusToEnd(newState))
        returnValue = true
      }
    }
    return returnValue
  }

  React.useEffect(() => {
    socket.on('message', ({ collaborators, newMessage }) => {
      if (
        collaborators?.includes(userId) ||
        channelCollaborators?.includes(userId ?? '')
      ) {
        setMessages((prevMessages) => [
          ...(prevMessages as IMessage[]),
          newMessage,
        ])
      }
    })

    socket.on(
      'notification',
      ({ newMessage, organisation, collaborators, channelName }) => {
        const collaboratorsId = collaborators?.map((collab: User) => {
          return collab._id
        })

        const exists = conversationCollaborators?.some((collaboratorArray) =>
          collaboratorArray.every((collaborator) =>
            collaboratorsId.includes(collaborator)
          )
        )
        if (organisationData?._id === organisation) {
          if (collaboratorsId?.includes(userId) && channelName) {
            console.log('channel')
            notifications.show({
              title: `${
                newMessage?.sender?.username
              } #${channelName?.toLowerCase()}`,
              message: truncateDraftToHtml(newMessage?.content),
              color: 'green',
              p: 'md',
            })
            return
          } else if (exists) {
            notifications.show({
              title: newMessage?.sender?.username,
              message: truncateDraftToHtml(newMessage?.content),
              color: 'green',
              p: 'md',
            })
            return
          }
        }
      }
    )

    return () => {
      socket.off('message')
      socket.off('notification')
    }
  }, [])

  React.useEffect(() => {
    if (messages?.length && messages?.length > 5) {
      stackRef.current?.scrollTo(0, stackRef.current.scrollHeight)
    }
  }, [messages])

  let suggestions = organisationData?.coWorkers?.map((user) => {
    return {
      text: (
        <Flex align="center" gap="sm">
          <Avatar src={`/avatars/${user?.username?.[0]}.png`} size="sm" />
          <Text fz="sm">
            {user.username} {userId === user._id && '(you)'}
          </Text>
          {user.isOnline || userId === user._id ? (
            <Box
              h=".7rem"
              w=".7rem"
              bg="green"
              style={{
                borderRadius: '5rem',
              }}
            ></Box>
          ) : (
            <Box
              h=".7rem"
              w=".7rem"
              bg="gray"
              style={{
                borderRadius: '5rem',
              }}
            ></Box>
          )}
        </Flex>
      ),
      value: user.username,
    }
  })

  suggestions = suggestions && [
    ...suggestions,
    {
      text: (
        <Flex align="center" gap="sm">
          <GoMegaphone />
          <Text fz="sm">@channel Notify everyone in this channel.</Text>
        </Flex>
      ),
      value: 'channel',
    },
    {
      text: (
        <Flex align="center" gap="sm">
          <GoMegaphone />
          <Text fz="sm">@here Notify every online member in this channel.</Text>
        </Flex>
      ),
      value: 'here',
    },
  ]

  return (
    <>
      <Stack
        p={isThread ? 'md' : 'lg'}
        ref={stackRef}
        style={{
          ...(isThread ? { maxHeight: '63.5vh' } : { height: '77.5vh' }),
          overflowY: 'scroll',
          gap: '0',
          ...(isThread && { paddingBlock: 'unset', paddingTop: '2rem' }),
        }}
      >
        {!isLoading && !isThread && (
          <Flex
            align="start"
            gap="sm"
            p="lg"
            px="0"
            mb="md"
            style={{
              borderBottom: `1px solid ${theme?.colors?.dark[5]}`,
            }}
          >
            {type === 'channel' && (
              <ThemeIcon
                size="4.25rem"
                radius="md"
                variant="gradient"
                gradient={{ from: '#202020', to: '#414141', deg: 35 }}
              >
                {String(selected?.name?.[0])?.toLowerCase()}
              </ThemeIcon>
            )}
            {type === 'conversation' && (
              <Avatar
                src={`/avatars/${selected?.name[0].toLowerCase()}.png`}
                size="xl"
                radius="xl"
              />
            )}
            <Stack spacing=".1rem">
              {type === 'channel' && (
                <>
                  <Text weight="bold" c="white">
                    This is the very first begining of the
                    <Text span c={theme.colors.blue[5]}>
                      {' '}
                      #{String(selected?.name)?.toLowerCase()}{' '}
                    </Text>{' '}
                    channel
                  </Text>
                  <Text fz="sm" c={theme.colors.dark[2]}>
                    This channel is for everything{' '}
                    <Text span> #{String(selected?.name)?.toLowerCase()} </Text>{' '}
                    . Hold meetings, share docs, and make decisions together
                    with your team. &nbsp;
                    <UnstyledButton fz="sm" c={theme.colors.blue[5]}>
                      Edit description
                    </UnstyledButton>
                  </Text>
                  <UnstyledButton
                    mt="lg"
                    fz="sm"
                    c={theme.colors.blue[5]}
                    onClick={open}
                  >
                    <Flex align="center" justify="start" gap="xs">
                      <BiUserPlus size="2.2rem" />
                      <Text>Add people</Text>
                    </Flex>
                  </UnstyledButton>
                </>
              )}
              {type === 'conversation' && (
                <>
                  {selected?.isSelf ? (
                    <>
                      <Text weight="bold" c="white">
                        This space is just for you.
                      </Text>
                      <Text fz="sm" c={theme.colors.dark[2]}>
                        Jot down notes, list your to-dos, or keep links and
                        files handy. You can also talk to yourself here, but
                        please bear in mind you’ll have to supply both sides of
                        the conversation. &nbsp;
                      </Text>
                      <UnstyledButton mt="lg" fz="sm" c={theme.colors.blue[5]}>
                        <Flex align="center" justify="start" gap="xs">
                          <BiEditAlt size="2rem" />
                          <Text>Edit profile</Text>
                        </Flex>
                      </UnstyledButton>
                    </>
                  ) : (
                    <>
                      <Text weight="bold" c="white">
                        This conversation is just between
                        <Text span c={theme.colors.blue[5]}>
                          {' '}
                          @{String(selected?.name)?.toLowerCase()}{' '}
                        </Text>{' '}
                        and you.
                      </Text>
                      <Text fz="sm" c={theme.colors.dark[2]}>
                        Hold meetings, share docs, and make decisions together
                        with your team. &nbsp;
                        <UnstyledButton fz="sm" c={theme.colors.blue[5]}>
                          Edit description
                        </UnstyledButton>
                      </Text>
                    </>
                  )}
                </>
              )}
            </Stack>
          </Flex>
        )}
        {!isThread && (
          <>
            {messagesLoading ? (
              <Loader color={theme.colors.dark[1]} mt="md" />
            ) : (
              <MessageList userId={userId as string} messages={messages} />
            )}
          </>
        )}
        {isThread && (
          <MessageList
            isThread
            userId={userId as string}
            messages={threadMessages}
          />
        )}
      </Stack>

      {(channelCollaborators?.includes(userId ?? '') ||
        !selected?.isChannel) && (
        <Paper
          radius="md"
          mt="xs"
          m="lg"
          style={{
            border: '1.5px solid #404146',
            borderRadius: '1rem',

            position: 'sticky',
            bottom: 20,
          }}
        >
          <Editor
            placeholder={`Message ${
              selected?.isChannel ? '#' : ''
            }${selected?.name?.toLowerCase()}`}
            editorState={editorState}
            hashtag={{
              separator: ' ',
              trigger: '#',
            }}
            mention={{
              separator: ' ',
              trigger: '@',
              suggestions,
            }}
            toolbarClassName="toolbarClassName"
            wrapperClassName="wrapperClassName"
            editorClassName="editorClassName"
            onEditorStateChange={handleChange}
            handleReturn={handleReturn}
            toolbar={{
              options: ['inline', 'link', 'list', 'emoji', 'image'],
              image: {
                previewImage: true,
                uploadCallback: (file: File) => {
                  return new Promise((resolve, reject) => {
                    const reader = new FileReader()
                    reader.onloadend = () => {
                      resolve({
                        data: {
                          url: reader.result,
                        },
                      })
                    }

                    reader.onerror = (reason) => reject(reason)
                    reader.readAsDataURL(file)
                  })
                },
              },
              inline: {
                options: ['bold', 'italic'],
                className: 'inline-style',
                bold: { icon: '/bold.svg' },
              },
              link: {
                className: 'inline-style',
                defaultTargetOption: '_blank',
                showOpenOptionOnHover: true,
                options: ['link', 'unlink'],
                linkCallback: undefined,
              },
              list: {
                options: ['unordered', 'ordered'],
                className: 'inline-style',
              },
            }}
          />
        </Paper>
      )}
    </>
  )
}

export default Message
