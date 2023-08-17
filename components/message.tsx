import React, { useState } from 'react'
import {
  Avatar,
  Flex,
  Paper,
  Stack,
  Text,
  Tooltip,
  useMantineTheme,
} from '@mantine/core'
import { EditorState } from 'draft-js'
import { Editor } from 'react-draft-wysiwyg'
import { convertToHTML } from 'draft-convert'
import DOMPurify from 'dompurify'
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css'
import { getColorByIndex } from '../utils/helpers'

const Message = ({ data }: any) => {
  const [editorState, setEditorState] = useState(() =>
    EditorState.createEmpty()
  )

  const [messages, setMessages] = useState<any>([])

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

      const htmlContent = convertToHTML({
        styleToHTML: (style) => {
          if (style === 'BOLD') {
            return <strong />
          }
          if (style === 'ITALIC') {
            return <em />
          }
        },
        blockToHTML: (block) => {
          if (block.type === 'unstyled') {
            return <p />
          }
        },
        entityToHTML: (entity, originalText) => {
          if (entity.type === 'LINK') {
            const { url } = entity.data
            console.log(
              <a href={url} target="_blank">
                {originalText}
              </a>
            )
            return (
              <a href={url} target="_blank">
                {originalText}
              </a>
            )
          }
          return originalText
        },
      })(contentState)

      setMessages((msg: any) => [
        ...msg,
        {
          name: data?.name,
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
        },
      ])

      setEditorState(EditorState.createEmpty())
      returnValue = true
    }
    return returnValue
  }

  return (
    <>
      <Stack p="lg">
        {messages?.map((msg: any) => (
          <Flex gap="sm" align="center">
            <Avatar
              src={`/avatars/${msg?.name[0].toLowerCase()}.png`}
              size="xl"
              radius="xl"
            />
            <Flex direction="column">
              <Flex align="item" gap="md">
                <Text
                  fz="sm"
                  fw="bold"
                  c={useMantineTheme().colors.dark[2]}
                  span
                >
                  {msg.name}
                </Text>
                <Tooltip label={msg.time} withArrow position="right">
                  <Text
                    fz="xs"
                    fw="medium"
                    tt="lowercase"
                    c={useMantineTheme().colors.dark[3]}
                    span
                  >
                    {msg.timeRender}
                  </Text>
                </Tooltip>
              </Flex>
              <div
                className="chat-wrapper"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(msg.content), // Sanitize and render HTML
                }}
              />
            </Flex>
          </Flex>
        ))}
      </Stack>

      <Paper
        radius="md"
        mt="xs"
        m="lg"
        style={{ border: '1.5px solid #404146', borderRadius: '1rem' }}
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
    </>
  )
}

export default Message
