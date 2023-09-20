import {
  Avatar,
  Flex,
  Grid,
  LoadingOverlay,
  Skeleton,
  Stack,
  Text,
} from '@mantine/core'
import { NextPage } from 'next'
import Input from '../../components/input'
import { useForm } from '@mantine/form'
import Button from '../../components/button'
import { useMutation, useQuery } from '@tanstack/react-query'
import axios from '../../services/axios'
import { notifications } from '@mantine/notifications'
import { useRouter } from 'next/router'
import React from 'react'
import { ApiError, ApiSuccess } from '../../utils/interfaces'

const Onboarding: NextPage = () => {
  const router = useRouter()
  const { id } = router.query
  const query = useQuery(
    ['organisation', id],
    () => axios.get(`/organisation/${id}`),
    {
      refetchOnMount: false,
      enabled: !!id,
    }
  )

  const organisationName = query?.data?.data?.data?.name

  const form = useForm({
    initialValues: {
      name: '',
    },
    validate: {
      name: (val) => (val.length > 3 ? null : 'Invalid name'),
    },
  })

  const mutation = useMutation({
    mutationFn: (body) => {
      return axios.post('/organisation', body)
    },
    onError(error: ApiError) {
      notifications.show({
        message: error?.response?.data?.data?.name,
        color: 'red',
        p: 'md',
      })
    },
    onSuccess(data: ApiSuccess['data']) {
      router.push(`${data?.data?.data?._id}/coworkers`)
    },
  })

  if (query.isLoading) {
    return <LoadingOverlay visible />
  }

  return (
    <Grid h="100vh" m="0">
      <Grid.Col span={2} p="lg">
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
        {!organisationName && (
          <Flex gap={10} align="center">
            <Skeleton height={50} width={50} circle />
            <Stack spacing="xs" w="80%">
              <Skeleton height={15} radius="xl" />
              <Skeleton height={15} w="80%" radius="xl" />
            </Stack>
          </Flex>
        )}
      </Grid.Col>
      <Grid.Col bg="dark" span="auto" p="3rem 8rem">
        <Text size="xs">Step 1 of 3</Text>
        <Text size="3xl" lh="4rem" mt="2xl" c="white" fw={600}>
          What's the name of your <br />
          company or team?
        </Text>
        <Text size="xs" mt="sm">
          This will be the name of your Slack workspace &mdash; choose something
          that your team will recognize.
        </Text>
        <form
          onSubmit={form.onSubmit(() =>
            mutation.mutate({ name: form.values.name, id } as any)
          )}
        >
          <Input
            w="50%"
            placeholder="Ex: Acme Marketing or Acme Co"
            mt="xl"
            required
            label="Name"
            defaultValue={organisationName}
            // value={form.values.name}
            onChange={(event) =>
              form.setFieldValue('name', event.currentTarget.value)
            }
            error={form.errors.name && 'Name should be atleast 3'}
          />
          <Button loading={mutation.isLoading} type="submit" mt="lg" w="10%">
            {mutation.isLoading ? '' : 'Next'}
          </Button>
        </form>
      </Grid.Col>
    </Grid>
  )
}

export default Onboarding
