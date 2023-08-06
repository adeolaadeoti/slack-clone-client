import type { NextPage } from 'next'
import Head from 'next/head'
import { Box, Text } from '@mantine/core'

const Home: NextPage = () => {
  return (
    <Box bg="red" h="100vh">
      <Head>
        <title>Slack clone app</title>
        <meta name="description" content="This is a clone version of slack" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Text>Hello from home</Text>
    </Box>
  )
}

export default Home
