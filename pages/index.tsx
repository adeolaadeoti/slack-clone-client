import { Avatar, Center, Flex, Paper, Stack, Text } from '@mantine/core'
import { useMutation, useQuery } from '@tanstack/react-query'
import { NextPage } from 'next'
import axios from '../services/axios'
import { notifications } from '@mantine/notifications'
import { useRouter } from 'next/router'
import SlackLogo from '../components/slack-logo'
import Button from '../components/button'
import WorkspacesSvg from '../components/pages/workspaces-svg'
import React from 'react'
import { BsArrowRightShort } from 'react-icons/bs'
import { getColorByIndex } from '../utils/helpers'
import { useAppContext } from '../providers/app-provider'

const Workspaces: NextPage = () => {
  const router = useRouter()
  const [email, setEmail] = React.useState('')
  const { refreshApp, setData } = useAppContext()
  const mutation = useMutation({
    mutationFn: () => {
      return axios.post('/organisation')
    },
    onError(error: any) {
      notifications.show({
        message: error?.response?.data?.data?.name,
        color: 'red',
        p: 'md',
      })
    },
    onSuccess(data) {
      router.push(`${data?.data?.data?._id}`)
    },
  })

  const query = useQuery(
    ['workspaces'],
    () => axios.get(`/organisation/workspaces`),
    {
      enabled: !!email,
    }
  )

  const organisations = query?.data?.data?.data

  function handleOpenWorkspace(organisation: any) {
    setData(null)
    localStorage.setItem('organisationId', organisation?._id)
    refreshApp()
    router.push(`/c/${organisation?.channels?.[0]?._id}?channel=true`)
  }

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setEmail(localStorage.getItem('signUpEmail') as string)

      const signUpEmail = localStorage.getItem('signUpEmail')
      if (!signUpEmail) {
        router.push('/signin')
      }
    }
  }, [])

  return (
    <Center p="xl" h="100vh" w="100vw" bg="#111317">
      <Stack spacing="10rem">
        <Center>
          <SlackLogo />
        </Center>
        <Flex justify="center">
          <Stack spacing="xs" align="start" w="38%" justify="center">
            <Text fz="3xl" fw={600} c="white">
              Get started on Slack
            </Text>
            <Text fz="sm" mt="xs" w="75%">
              it's a new way to communicate with everyone you work with. it's
              faster, better organized, and more secure than email - and it's
              free to try.
            </Text>
            <Stack>
              <Button
                loading={mutation.isLoading}
                type="submit"
                mt="lg"
                px="2xl"
                onClick={() => mutation.mutate()}
              >
                {mutation.isLoading ? '' : 'Create Workspace'}
              </Button>
            </Stack>
          </Stack>
          <Flex align="center" justify="center">
            <WorkspacesSvg />
          </Flex>
        </Flex>
        <Paper radius="lg" p="2xl" withBorder mt="xl" w="50%" mx="auto">
          {organisations?.length >= 1 && (
            <Text fw="bold" c="white" mb="xl">
              Open a workspace
            </Text>
          )}
          {organisations?.length === 0 && (
            <Center>
              <Flex direction="column" align="center" justify="center">
                <Text fz="lg" fw={600} c="white">
                  is your team already on Slack?
                </Text>
                <Text fz="sm" mt="xs" w="75%" align="center">
                  We coudn't find any existing workspaces for the email address{' '}
                  {email}
                </Text>
                <Button
                  appearance="outline"
                  mt="lg"
                  px="2xl"
                  onClick={() => router.push('/signin')}
                >
                  Try a Different Email
                </Button>
              </Flex>
            </Center>
          )}
          <Stack>
            {organisations?.length >= 1 &&
              organisations?.map((organisation: any, index: number) => (
                <Flex
                  pb="md"
                  align="center"
                  style={{
                    borderBottom:
                      organisations.length - 1 === index
                        ? ''
                        : '1px solid #373A40',
                    justifyContent: 'space-between',
                  }}
                >
                  <Flex align="center" gap="sm">
                    <Avatar
                      size="lg"
                      color={getColorByIndex(index)}
                      radius="xl"
                    >
                      {organisation.name[0].toUpperCase()}
                    </Avatar>
                    <Flex direction="column">
                      <Text c="white" transform="capitalize">
                        {organisation.name}
                      </Text>
                      <Text size="xs" transform="capitalize">
                        {organisation.coWorkers.length} members
                      </Text>
                    </Flex>
                  </Flex>
                  <Button
                    onClick={() => handleOpenWorkspace(organisation)}
                    rightIcon={<BsArrowRightShort />}
                    appearance="outline"
                  >
                    Open
                  </Button>
                </Flex>
              ))}
          </Stack>
        </Paper>
      </Stack>
    </Center>
  )
}

export default Workspaces
