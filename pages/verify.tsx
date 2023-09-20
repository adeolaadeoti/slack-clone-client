import React from 'react'
import {
  Center,
  Flex,
  Text,
  Stack,
  PinInput,
  Loader,
  Button as MantineButton,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import SlackLogo from '../components/slack-logo'
import { IoLogoGithub } from 'react-icons/io'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/router'
import axios from '../services/axios'
import { notifications } from '@mantine/notifications'

import { NextPage } from 'next'
import { ApiError, ApiSuccess } from '../utils/interfaces'

const Verify: NextPage = () => {
  const [email, setEmail] = React.useState('')
  const router = useRouter()
  const form = useForm({
    initialValues: {
      code: '',
    },
    validate: {
      code: (val) => (val.length === 6 ? null : 'Code must be 6 characters'),
    },
  })

  const mutation = useMutation({
    mutationFn: (body) => {
      return axios.post('/auth/verify', body)
    },
    onError(error: ApiError) {
      notifications.show({
        message: error?.response?.data?.data?.name,
        color: 'red',
        p: 'md',
      })
    },
    onSuccess: (data: ApiSuccess['data']) => {
      notifications.show({
        message: `Confirmed as ${data?.data?.data?.email}`,
        color: 'green',
        p: 'md',
      })
      // localStorage.removeItem('signUpEmail')
      localStorage.setItem('access-token', data?.data?.data?.token)
      router.push('/')
    },
  })

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
      <Stack justify="between">
        <Flex direction="column" align="center">
          <SlackLogo />
          <Text fz="3xl" fw={600} mt="3xl" c="white">
            Check your email for a code
          </Text>
          <Text fz="sm" mt="xs">
            We've sent a 6-character code to &nbsp;
            <Text span fw={600}>
              {email}.
            </Text>
            <Text span fz="sm" mt="xs">
              &nbsp;The code expires shortly, so please enter it soon.
            </Text>
          </Text>

          <PinInput
            my="5rem"
            size="10rem"
            aria-label="One time code"
            oneTimeCode
            length={6}
            disabled={mutation.isLoading}
            styles={() => ({
              input: {
                fontSize: '3.5rem',
              },
            })}
            value={form.values.code}
            onChange={(value) => form.setFieldValue('code', value)}
            error={!!form.errors.code}
            onComplete={() => {
              mutation.mutate({
                loginVerificationCode: form.values.code,
              } as any)
            }}
          />

          {mutation.isLoading && (
            <Flex align="center" justify="center" gap="sm">
              <Loader size="md" />
              <Text size="sm">Checking your code</Text>
            </Flex>
          )}

          <Text mt="10rem" size="xs">
            Can't find your code? Check your spam folder!
          </Text>
        </Flex>

        <Center p="xl">
          <MantineButton
            component="a"
            target="_blank"
            rel="noopener noreferrer"
            href="https://github.com/adeolaadeoti"
            leftIcon={<IoLogoGithub size="1.4rem" />}
            styles={(theme) => ({
              root: {
                backgroundColor: 'transparent',
                fontSize: '1.2rem',
                fontWeight: 300,
                color: '#737780',
                '&:not([data-disabled])': theme.fn.hover({
                  color: theme.fn.darken('#373A40', 0.08),
                  backgroundColor: 'transparent',
                }),
              },
              leftIcon: {
                marginRight: theme.spacing.xs,
              },
            })}
          >
            adeolaadeoti
          </MantineButton>
        </Center>
      </Stack>
    </Center>
  )
}

export default Verify
