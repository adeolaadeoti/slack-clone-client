import { Flex, Stack } from '@mantine/core'
import React, { useState, useEffect } from 'react'
import ReactHtmlParser from 'react-html-parser'

export default function ChatLink({ url, children }: any) {
  const [metaData, setMetaData] = useState<any>(null)

  useEffect(() => {
    // Fetch the HTML content of the linked page
    fetch(url)
      .then((response) => response.text())
      .then((html) => {
        // Parse the HTML content to extract meta data
        const parser = new DOMParser()
        const doc = parser.parseFromString(html, 'text/html') as any

        // Extract meta tags or other relevant data
        const title = doc.querySelector('title')!.textContent
        const description = doc
          .querySelector('meta[name="description"]')
          .getAttribute('content')
        const img = doc
          .querySelector('meta[property="og:image"]')
          .getAttribute('content')

        // Set the extracted meta data in state
        setMetaData({ title, description, img })
      })
      .catch((error) => {
        console.error('Error fetching or parsing the linked page:', error)
      })
  }, [url])

  return (
    <Stack>
      <a className="entity-link" target="_blank" href={url}>
        {children}
      </a>
      {metaData && (
        <>
          <div>
            <strong>Title:</strong> {metaData.title}
          </div>
          <div>
            <strong>Description:</strong> {metaData.description}
          </div>
          <div>
            <strong>Image:</strong>{' '}
            <img src={metaData.img} alt="Link Preview" />
          </div>
        </>
      )}
    </Stack>
  )
}
