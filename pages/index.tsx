import type { NextPage } from 'next'
import Head from 'next/head'
import { Box } from '@mantine/core'

const Home: NextPage = () => {
  return (
    <Box>
      <Head>
        <title>Slack clone app</title>
        <meta name="description" content="This is a clone version of slack" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
    </Box>
  )
}

export default Home
