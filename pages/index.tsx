import type { NextPage } from 'next'
import Head from 'next/head'
import { useQuery } from '@tanstack/react-query'
import axios from '../services/axios'
import DefaultLayout from '../components/pages/default-layout'
import React from 'react'
import { LoadingOverlay, Text } from '@mantine/core'
import { useRouter } from 'next/router'
import MessageLayout from '../components/pages/message-layout'

const Home: NextPage = () => {
  const router = useRouter()
  const [selectedData, setSelectedData] = React.useState<any>(null)
  const [selectedView, setSelectedView] = React.useState<
    'channel' | 'coworker'
  >('channel')
  const query = useQuery(
    ['organisations'],
    () => axios.get(`/organisation/${localStorage.getItem('organisationId')}`),
    {
      onSuccess: (data) => {
        setSelectedData(data?.data?.data?.channels?.[0])
      },
    }
  )

  function handleChannelChange(channel: any) {
    setSelectedView('channel')
    setSelectedData(channel)
  }
  function handleCoworkerChange(data: any) {
    setSelectedView('coworker')
    setSelectedData(data)
  }

  React.useEffect(() => {
    if (query?.data?.data?.data?.channels.length === 0) {
      router.push(`${localStorage.getItem('organisationId')}/channels`)
    }
  }, [])

  if (query.isLoading) return <LoadingOverlay visible />

  return (
    <>
      <Head>
        <title>Slack clone app</title>
        <meta name="description" content="This is a clone version of slack" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <DefaultLayout
        data={query?.data?.data?.data}
        onChannelChange={handleChannelChange}
        onCoworkerChange={handleCoworkerChange}
      >
        {selectedView === 'channel' && (
          <MessageLayout data={selectedData} appearance="channel" />
        )}
        {selectedView === 'coworker' && (
          <MessageLayout data={selectedData} appearance="coworker" />
        )}
      </DefaultLayout>
    </>
  )
}

export default Home
