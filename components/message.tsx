import React, { useState } from 'react'
import { Paper } from '@mantine/core'
import { EditorState, ContentState, convertToRaw } from 'draft-js'
import { Editor } from 'react-draft-wysiwyg'
import { convertToHTML } from 'draft-convert' // To convert ContentState to HTML
import createEmojiPlugin from 'draft-js-emoji-plugin'

import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css'

const emojiPlugin = createEmojiPlugin({
  selectButtonContent: '😊',
  //   theme: defaultTheme, // This should be imported from your created theme file
})
const { EmojiSuggestions, EmojiSelect } = emojiPlugin

const Message = () => {
  const [editorState, setEditorState] = useState(() =>
    EditorState.createEmpty()
  )

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

      // Convert ContentState to HTML
      const htmlContent = convertToHTML({
        styleToHTML: (style) => {
          if (style === 'BOLD') {
            return <strong />
          }
          if (style === 'ITALIC') {
            return <em />
          }
          // Handle other styles as needed
        },
        blockToHTML: (block) => {
          if (block.type === 'unstyled') {
            return <p />
          }
          // Handle other block types as needed
        },
      })(contentState)

      console.log('Editor HTML content:', htmlContent)
      setEditorState(EditorState.createEmpty())
      returnValue = true
    }
    return returnValue
  }

  return (
    <Paper
      radius="md"
      mt="xl"
      m="lg"
      style={{ border: '1.5px solid #404146', borderRadius: '1rem' }}
    >
      <Editor
        editorState={editorState}
        toolbarClassName="toolbarClassName"
        wrapperClassName="wrapperClassName"
        editorClassName="editorClassName"
        onEditorStateChange={handleChange}
        // plugins={[createEmojiPlugin()]}
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
  )
}

export default Message
