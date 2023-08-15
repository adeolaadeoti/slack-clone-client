import React, { useState } from 'react'
import {
  Avatar,
  Flex,
  Paper,
  Stack,
  Text,
  useMantineTheme,
} from '@mantine/core'
import { EditorState } from 'draft-js'
import { Editor } from 'react-draft-wysiwyg'
import { convertToHTML } from 'draft-convert'
import DOMPurify from 'dompurify'
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css'
import { getColorByIndex } from '../utils/helpers'

const Message = ({ data }: any) => {
  const [messageData, setMessageData] = React.useState<any>()

  const [editorState, setEditorState] = useState(() =>
    EditorState.createEmpty()
  )

  const [messages, setMessages] = useState([
    {
      profileImage: 'a',
      name: 'adeola.adeoti',
      time: 'Aug 1st at 2:21:45 AM',
      timeRender: '2:21 AM',
      content: `<p>joined. Also, mumu and 2 others joined.</p>`,
    },
  ])

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

      setMessages((msg) => [
        ...msg,
        {
          profileImage: 'a',
          name: 'adeola.adeoti',
          time: 'Aug 1st at 2:21:45 AM',
          timeRender: '2:21 AM',
          content: htmlContent,
        },
      ])
      setEditorState(EditorState.createEmpty())
      returnValue = true
    }
    return returnValue
  }

  React.useEffect(() => {
    setMessageData(data)
  }, [data])

  return (
    <>
      <Stack p="lg">
        {messages?.map((msg, index) => (
          <Flex>
            <Avatar size="md" color={getColorByIndex(index)} radius="xl">
              {msg.profileImage}
            </Avatar>
            <Flex direction="column">
              <Flex align="item" gap="md">
                <Text fw="100" c={useMantineTheme().colors.dark[3]} span>
                  {msg.name}
                </Text>
                <Text fw="100" c={useMantineTheme().colors.dark[3]} span>
                  {msg.timeRender}
                </Text>
              </Flex>
              <div
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
          placeholder={`Message #${data?.name.toLowerCase()}`}
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
