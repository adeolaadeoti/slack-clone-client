import { Avatar, Flex, Grid, Skeleton, Stack, Text } from '@mantine/core'
import { NextPage } from 'next'
import { useForm } from '@mantine/form'
import Button from '../../components/button'
import { useMutation, useQuery } from '@tanstack/react-query'
import axios from '../../services/axios'
import { notifications } from '@mantine/notifications'
import { useRouter } from 'next/router'
import React from 'react'
import Input from '../../components/input'
import { getColorByIndex } from '../../utils/helpers'
import { ApiError, User } from '../../utils/interfaces'

const Channels: NextPage = () => {
  const router = useRouter()
  const { id } = router.query
  const form = useForm({
    initialValues: {
      name: '',
      organisationId: id,
    },
    validate: {
      name: (val) =>
        val.length > 3 ? null : 'Channel name must be more than three words',
    },
  })

  const query = useQuery(
    ['organisation', id],
    () => axios.get(`/organisation/${id}`),
    {
      refetchOnMount: false,
      enabled: !!id,
    }
  )

  const organisationName = query?.data?.data?.data?.name

  const mutation = useMutation({
    mutationFn: (body) => {
      return axios.post('/channel', body)
    },
    onError(error: ApiError) {
      notifications.show({
        message: error?.response?.data?.data?.name,
        color: 'red',
        p: 'md',
      })
    },
    onSuccess() {
      localStorage.setItem('organisationId', id as string)
      router.push(`/`)
    },
  })

  const coWorkers = query.data?.data?.data?.coWorkers

  return (
    <Grid h="100vh" m="0">
      <Grid.Col span={2} p="lg">
        {!organisationName && (
          <Flex gap={10} align="center">
            <Skeleton height={50} width={50} circle />
            <Stack spacing="xs" w="80%">
              <Skeleton height={15} radius="xl" />
              <Skeleton height={15} w="80%" radius="xl" />
            </Stack>
          </Flex>
        )}
        {organisationName && (
          <Flex align="center" gap="sm">
            <Avatar size="lg" color="cyan" radius="xl">
              {organisationName[0].toUpperCase()}
            </Avatar>

            <Text weight="bold" transform="capitalize">
              {organisationName}
            </Text>
          </Flex>
        )}
        <Flex
          mt="2xl"
          direction="column"
          py="md"
          style={{ borderTop: '.1px solid #53565C' }}
        >
          <Text size="xs">Direct messages</Text>
          {coWorkers?.map((coWorker: User, index: number) => (
            <Flex key={coWorker._id} align="center" gap="sm" mt="sm">
              <Avatar size="md" color={getColorByIndex(index)} radius="xl">
                {coWorker?.email?.[0].toUpperCase()}
              </Avatar>

              <Text size="xs" transform="lowercase">
                {coWorker.username}
              </Text>
            </Flex>
          ))}
        </Flex>
      </Grid.Col>
      <Grid.Col bg="dark" span="auto" p="3rem 8rem">
        <Text size="xs">Step 3 of 3</Text>
        <Text size="3xl" lh="4rem" my="2xl" c="white" fw={600}>
          What's your team working on <br /> right now?
        </Text>

        <form
          onSubmit={form.onSubmit(() =>
            mutation.mutate({
              name: form.values.name,
              organisationId: id,
            } as any)
          )}
        >
          <Input
            mb="md"
            w="50%"
            required
            placeholder="This could be anything: a project, campaign, event, or the deal you're trying to close."
            onChange={(event) =>
              form.setFieldValue('name', event.currentTarget.value)
            }
            error={
              form.errors.name && 'Channel name must be more than three words'
            }
          />
          <Button loading={mutation.isLoading} type="submit">
            {mutation.isLoading ? '' : 'Continue'}
          </Button>
        </form>
      </Grid.Col>
    </Grid>
  )
}

export default Channels
