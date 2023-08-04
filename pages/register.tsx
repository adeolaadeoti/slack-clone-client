import React from 'react'
import {
  Center,
  Flex,
  Text,
  Stack,
  Paper,
  Divider,
  Button as MantineButton,
  Anchor,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import SlackLogo from '../components/slack-logo'
import Input from '../components/input'
import Button from '../components/button'
import { BiLogoGoogle } from 'react-icons/bi'
import { FaApple } from 'react-icons/fa'
import { IoLogoGithub } from 'react-icons/io'

export default function register() {
  const form = useForm({
    initialValues: {
      email: '',
    },
    validate: {
      email: (val) => (/^\S+@\S+$/.test(val) ? null : 'Invalid email'),
    },
  })

  async function handleRegister() {
    console.log('called')
  }

  return (
    <Center p="xl" h="100vh" w="100vw" style={{ backgroundColor: '#111317' }}>
      <Stack justify="between">
        <Flex direction="column" align="center">
          <SlackLogo />
          <Text fz="3xl" fw={600} mt="3xl" c="white">
            First, enter your email
          </Text>
          <Text fz="sm" mt="xs">
            We suggest using the{' '}
            <Text span fw={600}>
              email address you use at work.
            </Text>
          </Text>

          <Paper radius="md" p="xl" withBorder w={'40rem'} mt="xl">
            <form onSubmit={form.onSubmit(handleRegister)}>
              <Stack>
                <Input
                  required
                  label="Email"
                  placeholder="hello@adeolaadeoti.xyz"
                  value={form.values.email}
                  onChange={(event) =>
                    form.setFieldValue('email', event.currentTarget.value)
                  }
                  error={form.errors.email && 'Invalid email'}
                />
                <Button type="submit">Continue</Button>
                <Divider label="or" labelPosition="center" my="md" />
                <MantineButton
                  leftIcon={<BiLogoGoogle size="1.8rem" />}
                  radius="md"
                  size="sm"
                  styles={(theme) => ({
                    root: {
                      backgroundColor: 'transparent',
                      border: '1px solid #373A40',
                      height: '4.5rem',
                      fontSize: '1.2rem',
                      '&:not([data-disabled])': theme.fn.hover({
                        backgroundColor: theme.fn.darken('#373A40', 0.05),
                        transition: 'background-color .3s ease',
                      }),
                    },

                    leftIcon: {
                      marginRight: theme.spacing.md,
                    },
                  })}
                >
                  Continue with Google
                </MantineButton>
                <MantineButton
                  leftIcon={<FaApple size="1.8rem" />}
                  radius="md"
                  size="sm"
                  styles={(theme) => ({
                    root: {
                      backgroundColor: 'transparent',
                      border: '1px solid #373A40',
                      height: '4.5rem',
                      fontSize: '1.2rem',
                      '&:not([data-disabled])': theme.fn.hover({
                        backgroundColor: theme.fn.darken('#373A40', 0.05),
                        transition: 'background-color .3s ease',
                      }),
                    },

                    leftIcon: {
                      marginRight: theme.spacing.md,
                    },
                  })}
                >
                  Continue with Apple
                </MantineButton>
                <Stack spacing="xs" mt="lg">
                  <Text size="xs" align="center">
                    Already using Slack?
                  </Text>
                  <Anchor size="xs" align="center" href="/">
                    Sign in to an existing workspace
                  </Anchor>
                </Stack>
              </Stack>
            </form>
          </Paper>
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
