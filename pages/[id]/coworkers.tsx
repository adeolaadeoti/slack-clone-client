import { Avatar, Flex, Grid, Skeleton, Stack, Text } from '@mantine/core'
import { NextPage } from 'next'
import { useForm } from '@mantine/form'
import Button from '../../components/button'
import { useMutation, useQuery } from '@tanstack/react-query'
import axios from '../../services/axios'
import { notifications } from '@mantine/notifications'
import { useRouter } from 'next/router'
import React from 'react'
import TagInputs from '../../components/tags-input'

const Coworkers: NextPage = () => {
  const router = useRouter()
  const { id } = router.query
  const form = useForm({
    initialValues: {
      name: '',
    },
    validate: {
      name: (val) => (val.length > 3 ? null : 'Invalid name'),
    },
  })

  const query = useQuery(
    ['organisation-coworkers'],
    () => axios.get(`/organisation/${id}`),
    {
      enabled: !!id,
    }
  )

  const organisationName = query?.data?.data?.data?.name

  const mutation = useMutation({
    mutationFn: (body) => {
      return axios.post('/onboard', body)
    },
    onError(error: any) {
      notifications.show({
        message: error?.response?.data?.data?.name,
        color: 'red',
        p: 'md',
      })
    },
    onSuccess(data) {
      router.push(`add-teammates/${data?.data?.data?._id}`)
    },
  })

  return (
    <Grid h="100vh" m="0">
      <Grid.Col span={2}>
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
        <Text size="xs">Step 2 of 3</Text>
        <Text size="3xl" lh="4rem" my="2xl" c="white" fw={600}>
          Who else is on the <br /> {organisationName} team?
        </Text>

        <form
          onSubmit={form.onSubmit(() =>
            mutation.mutate({ name: form.values.name } as any)
          )}
        >
          <TagInputs />
          <Button loading={mutation.isLoading} type="submit" mt="lg" w="10%">
            {mutation.isLoading ? '' : 'Next'}
          </Button>
        </form>
      </Grid.Col>
    </Grid>
  )
}

export default Coworkers
