import type { NextPage } from 'next'
import Head from 'next/head'
import { Box, Text } from '@mantine/core'
import { useQuery } from '@tanstack/react-query'
import axios from '../services/axios'

const Home: NextPage = () => {
  const query = useQuery(['organisations'], () =>
    axios.get(`/organisation/${localStorage.getItem('organisationId')}`)
  )

  const organisationName = query?.data?.data?.data?.name

  return (
    <Box h="100vh">
      <Head>
        <title>Slack clone app</title>
        <meta name="description" content="This is a clone version of slack" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Text>Hello from {organisationName}</Text>
    </Box>
  )
}

export default Home
