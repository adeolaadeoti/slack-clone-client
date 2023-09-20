import {
  Avatar,
  Flex,
  Grid,
  Skeleton,
  Stack,
  Text,
  UnstyledButton,
} from '@mantine/core'
import { NextPage } from 'next'
import { useForm } from '@mantine/form'
import Button from '../../components/button'
import { useMutation, useQuery } from '@tanstack/react-query'
import axios from '../../services/axios'
import { notifications } from '@mantine/notifications'
import { useRouter } from 'next/router'
import React from 'react'
import TagInputs from '../../components/tags-input'
import { ApiError } from '../../utils/interfaces'

const Coworkers: NextPage = () => {
  const router = useRouter()
  const { id } = router.query
  const form = useForm({
    initialValues: {
      emails: [''],
      organisationId: id,
    },
    validate: {
      emails: (val) => (val.length > 0 ? null : 'Email must be more than one'),
    },
  })

  const [isDisabled, setIsDisabled] = React.useState(true)

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
      return axios.post('/teammates', body)
    },
    onError(error: ApiError) {
      notifications.show({
        message: error?.response?.data?.data?.name,
        color: 'red',
        p: 'md',
      })
    },
    onSuccess() {
      router.push(`/${id}/channels`)
    },
  })

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
        <Text size="xs">Step 2 of 3</Text>
        <Text size="3xl" lh="4rem" my="2xl" c="white" fw={600}>
          Who else is on the <br /> {organisationName} team?
        </Text>

        <TagInputs
          onValueChange={(val) => {
            form.setFieldValue('emails', val)
            setIsDisabled(false)
          }}
        />
        <Flex align="center" gap="md" mt="lg">
          <Button
            disabled={isDisabled}
            onClick={() =>
              mutation.mutate({
                emails: form.values.emails,
                organisationId: id,
              } as any)
            }
            loading={mutation.isLoading}
            type="submit"
            w="10%"
          >
            {mutation.isLoading ? '' : 'Next'}
          </Button>
          {/* <UnstyledButton
            fw="normal"
            fz="xs"
            onClick={() => router.push(`/${id}/channels`)}
          >
            Skip this step
          </UnstyledButton> */}
        </Flex>
      </Grid.Col>
    </Grid>
  )
}

export default Coworkers
