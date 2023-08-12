import { Button, Flex, Stack, Text } from '@mantine/core'
import { useMutation } from '@tanstack/react-query'
import { NextPage } from 'next'
import axios from '../services/axios'
import { notifications } from '@mantine/notifications'
import { useRouter } from 'next/router'

const Workspaces: NextPage = () => {
  const router = useRouter()
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

  return (
    <Stack>
      <Text>Create workspace</Text>
      <Button
        loading={mutation.isLoading}
        type="submit"
        mt="lg"
        onClick={() => mutation.mutate()}
      >
        {mutation.isLoading ? '' : 'Create Workspace'}
      </Button>
    </Stack>
  )
}

export default Workspaces
