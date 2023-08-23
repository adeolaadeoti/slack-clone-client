import React, { useState } from 'react'
import {
  Avatar,
  Flex,
  Paper,
  Stack,
  Text,
  ThemeIcon,
  UnstyledButton,
  useMantineTheme,
} from '@mantine/core'
import { EditorState } from 'draft-js'
import { Editor } from 'react-draft-wysiwyg'
import { convertToHTML } from 'draft-convert'
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css'
import { useAppContext } from '../providers/app-provider'
import { BiEditAlt, BiUserPlus } from 'react-icons/bi'
import { truncateDraftToHtml } from '../utils/helpers'
import { notifications } from '@mantine/notifications'
import MessageList from './message-list'

const Message = ({ data, messages, setMessages, isLoading, type }: any) => {
  const { data: organisationData, socket, conversations } = useAppContext()
  const channelCollaborators = data?.collaborators?.map((d: any) => d._id)
  const userId = organisationData?.profile?._id
  const conversationCollaborators = conversations?.map((conversation: any) => {
    return conversation.collaborators.map(
      (collaborator: any) => collaborator._id
    )
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
                <a target="_blank" href={url}>
                  {originalText}
                </a>
              )
            }

            return originalText
          },
        })(contentState)

        const message = {
          sender: userId,
          username: organisationData?.profile?.username,
          time: new Date().toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
          }),
          timeRender: new Date().toLocaleString('en-US', {
            hour: 'numeric',
            minute: 'numeric',
            hour12: true,
          }),
          content: htmlContent,
          name: organisationData?.profile?.username,
        }

        if (socket.connected) {
          socket.emit('message', {
            message,
            organisation: data?.organisation,
            ...(data?.isChannel && {
              channelId: data?._id,
              channelName: data?.name,
              collaborators: data?.collaborators,
            }),
            ...(data?.isConversation && {
              conversationId: data?._id,
              collaborators: data?.collaborators,
              isSelf:
                data?.collaborators[0]?._id === data?.collaborators[1]?._id,
            }),
          })
        }

        setEditorState(EditorState.createEmpty())
        returnValue = true
      }
    }
    return returnValue
  }

  React.useEffect(() => {
    socket.on('message', ({ collaborators, message }) => {
      if (
        collaborators?.includes(userId) ||
        channelCollaborators?.includes(userId)
      ) {
        setMessages((prevMessages: any) => [...prevMessages, message])
      }
    })

    socket.on(
      'notification',
      ({ message, organisation, collaborators, channelName }) => {
        const collaboratorsId = collaborators?.map((collab: any) => {
          return collab._id
        })

        const exists = conversationCollaborators.some(
          (collaboratorArray: any) =>
            collaboratorArray.every((collaborator: any) =>
              collaboratorsId.includes(collaborator)
            )
        )
        if (organisationData?._id === organisation) {
          if (exists) {
            notifications.show({
              title: message?.username,
              message: truncateDraftToHtml(message?.content),
              color: 'green',
              p: 'md',
            })
          }
        }
        if (collaboratorsId?.includes(userId) && channelName) {
          notifications.show({
            title: `${message?.username} #${channelName?.toLowerCase()}`,
            message: truncateDraftToHtml(message?.content),
            color: 'green',
            p: 'md',
          })
        }
      }
    )

    return () => {
      socket.off('message')
      socket.off('notification')
    }
  }, [])

  React.useEffect(() => {
    if (messages.length > 5) {
      stackRef.current?.scrollTo(0, stackRef.current.scrollHeight)
    }
  }, [messages])

  return (
    <>
      <Stack
        p="lg"
        ref={stackRef}
        style={{
          height: '78vh',
          overflowY: 'scroll',
        }}
      >
        {!isLoading && (
          <>
            <Flex
              align="start"
              gap="sm"
              p="lg"
              px="0"
              style={{
                borderBottom: `1px solid ${useMantineTheme().colors.dark[5]}`,
              }}
            >
              {type === 'channel' && (
                <ThemeIcon
                  size="4.25rem"
                  radius="md"
                  variant="gradient"
                  gradient={{ from: '#202020', to: '#414141', deg: 35 }}
                >
                  {String(data?.name?.[0])?.toLowerCase()}
                </ThemeIcon>
              )}
              {type === 'conversation' && (
                <Avatar
                  src={`/avatars/${data?.name[0].toLowerCase()}.png`}
                  size="xl"
                  radius="xl"
                />
              )}
              <Stack spacing=".1rem">
                {type === 'channel' && (
                  <>
                    <Text weight="bold" c="white">
                      This is the very first begining of the
                      <Text span c={useMantineTheme().colors.blue[5]}>
                        {' '}
                        #{String(data?.name)?.toLowerCase()}{' '}
                      </Text>{' '}
                      channel
                    </Text>
                    <Text fz="sm" c={useMantineTheme().colors.dark[2]}>
                      This channel is for everything{' '}
                      <Text span> #{String(data?.name)?.toLowerCase()} </Text> .
                      Hold meetings, share docs, and make decisions together
                      with your team. &nbsp;
                      <UnstyledButton
                        fz="sm"
                        c={useMantineTheme().colors.blue[5]}
                      >
                        Edit description
                      </UnstyledButton>
                    </Text>
                    <UnstyledButton
                      mt="lg"
                      fz="sm"
                      c={useMantineTheme().colors.blue[5]}
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
                    {data?.isSelf ? (
                      <>
                        <Text weight="bold" c="white">
                          This space is just for you.
                        </Text>
                        <Text fz="sm" c={useMantineTheme().colors.dark[2]}>
                          Jot down notes, list your to-dos, or keep links and
                          files handy. You can also talk to yourself here, but
                          please bear in mind you’ll have to supply both sides
                          of the conversation. &nbsp;
                        </Text>
                        <UnstyledButton
                          mt="lg"
                          fz="sm"
                          c={useMantineTheme().colors.blue[5]}
                        >
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
                          <Text span c={useMantineTheme().colors.blue[5]}>
                            {' '}
                            @{String(data?.name)?.toLowerCase()}{' '}
                          </Text>{' '}
                          and you.
                        </Text>
                        <Text fz="sm" c={useMantineTheme().colors.dark[2]}>
                          Hold meetings, share docs, and make decisions together
                          with your team. &nbsp;
                          <UnstyledButton
                            fz="sm"
                            c={useMantineTheme().colors.blue[5]}
                          >
                            Edit description
                          </UnstyledButton>
                        </Text>
                        <UnstyledButton
                          mt="lg"
                          fz="sm"
                          c={useMantineTheme().colors.blue[5]}
                        >
                          <Flex align="center" justify="start" gap="xs">
                            <BiUserPlus size="2.2rem" />
                            <Text>Add people</Text>
                          </Flex>
                        </UnstyledButton>
                      </>
                    )}
                  </>
                )}
              </Stack>
            </Flex>
          </>
        )}
        {messages?.length >= 1 && <MessageList messages={messages} />}
      </Stack>

      {!data?.isChannel && (
        <Paper
          radius="md"
          mt="xs"
          m="lg"
          style={{
            border: '1.5px solid #404146',
            borderRadius: '1rem',
            position: 'absolute',
            bottom: 5,
            width: '81%',
          }}
        >
          <Editor
            placeholder={`Message #${data?.name?.toLowerCase()}`}
            editorState={editorState}
            toolbarClassName="toolbarClassName"
            wrapperClassName="wrapperClassName"
            editorClassName="editorClassName"
            onEditorStateChange={handleChange}
            handleReturn={handleReturn}
            toolbar={{
              options: ['inline', 'link', 'list', 'emoji'],
              inline: {
                options: ['bold', 'italic', 'strikethrough'],
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

      {channelCollaborators?.includes(userId) && (
        <Paper
          radius="md"
          mt="xs"
          m="lg"
          style={{
            border: '1.5px solid #404146',
            borderRadius: '1rem',
            position: 'absolute',
            bottom: 5,
            width: '81%',
          }}
        >
          <Editor
            placeholder={`Message #${data?.name?.toLowerCase()}`}
            editorState={editorState}
            toolbarClassName="toolbarClassName"
            wrapperClassName="wrapperClassName"
            editorClassName="editorClassName"
            onEditorStateChange={handleChange}
            handleReturn={handleReturn}
            toolbar={{
              options: ['inline', 'link', 'list', 'emoji'],
              inline: {
                options: ['bold', 'italic', 'strikethrough'],
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
      {data?.isChannel && !channelCollaborators?.includes(userId) && (
        <Text>Join Channel</Text>
      )}
    </>
  )
}

export default Message
