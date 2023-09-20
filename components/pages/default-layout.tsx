import {
  createStyles,
  Navbar,
  Text,
  Group,
  Grid,
  Avatar,
  Tooltip,
  ActionIcon,
  UnstyledButton,
  Stack,
  Skeleton,
  Box,
  Modal,
  Flex,
} from '@mantine/core'
import { getColorByIndex } from '../../utils/helpers'
import { TbHash } from 'react-icons/tb'
import { HiPlus } from 'react-icons/hi'
import React from 'react'
import AccountSwitcher from '../account-switcher'
import { useRouter } from 'next/router'
import { useDisclosure } from '@mantine/hooks'
import Input from '../input'
import Button from '../button'
import { useAppContext } from '../../providers/app-provider'
import { useForm } from '@mantine/form'
import { useMutation } from '@tanstack/react-query'
import axios from '../../services/axios'
import { notifications } from '@mantine/notifications'
import TagInputs from '../tags-input'
import Huddle from '../huddle'
import {
  ApiError,
  ApiSuccess,
  Channel,
  Conversation,
  DefaultLayoutProps,
} from '../../utils/interfaces'

const useStyles = createStyles((theme) => ({
  section: {
    marginBottom: theme.spacing.sm,
    padding: theme.spacing.md,

    '&:not(:first-of-type)': {
      borderTop: `1px solid ${theme.colors.dark[4]}`,
    },
  },
  collectionLink: {
    display: 'flex',
    gap: theme.spacing.sm,
    alignItems: 'center',
    padding: `.7rem ${theme.spacing.xs}`,
    textDecoration: 'none',
    borderRadius: theme.radius.sm,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.dark[0],
    lineHeight: 1,
    fontWeight: 500,
    textTransform: 'lowercase',

    '&:hover': {
      backgroundColor: theme.colors.dark[6],
      color: theme.white,
    },
  },
}))
export default function DefaultLayout({
  children,
  thread,
}: DefaultLayoutProps) {
  const router = useRouter()
  const { classes } = useStyles()
  const [opened, { open, close }] = useDisclosure(false)
  const [inviteOpened, { open: inviteOpen, close: inviteClose }] =
    useDisclosure(false)
  const {
    organisationId,
    setChannels,
    refreshApp,
    data: organisationData,

    conversations,
    channels,
    setMessages,
    selected,
    setSelected,
    theme,
  } = useAppContext()
  const userId = organisationData?.profile?._id

  const form = useForm({
    initialValues: {
      name: '',
      organisationId: organisationId,
    },
    validate: {
      name: (val) =>
        val.length > 3 ? null : 'Channel name must be more than three words',
    },
  })

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
    onSuccess(data: ApiSuccess['data']) {
      setChannels((channels) => [...(channels as Channel[]), data?.data?.data])
      refreshApp()
      close()
      form.reset()
      notifications.show({
        message: `#${form.values.name} channel created succesfully`,
        color: 'green',
        p: 'md',
      })
    },
  })

  const inviteForm = useForm({
    initialValues: {
      emails: [''],
      organisationId,
    },
    validate: {
      emails: (val) => (val.length > 0 ? null : 'Email must be more than one'),
    },
  })

  const [isDisabled, setIsDisabled] = React.useState(true)

  const inviteMutation = useMutation({
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
      inviteClose()
      form.reset()
      notifications.show({
        message: `Invite sent successfully to ${inviteForm.values.emails.join(
          ', '
        )}`,
        color: 'green',
        p: 'md',
      })
    },
  })

  function handleChannel(channel: Channel) {
    setSelected(channel)
    router.push(`/c/${channel?._id}`)
    localStorage.setItem('channel', 'true')
    setMessages([])
  }
  function handleConversation(conversation: Conversation) {
    setSelected(conversation)
    router.push(`/c/${conversation?._id}`)
    localStorage.setItem('channel', 'false')
    setMessages([])
  }

  const [popupWindow, setPopupWindow] = React.useState(false)
  return (
    <>
      <Modal
        opened={inviteOpened}
        onClose={inviteClose}
        title={`Invite people to ${organisationData?.name}`}
        centered
        size="45.25rem"
        radius="lg"
        padding="xl"
        overlayProps={{
          color: theme.colors.dark[9],
          opacity: 0.55,
          blur: 2,
        }}
      >
        <TagInputs
          onValueChange={(val) => {
            inviteForm.setFieldValue('emails', val)
            setIsDisabled(false)
          }}
        />
        <Flex align="center" gap="md" mt="lg">
          <Button
            disabled={isDisabled}
            onClick={() =>
              inviteMutation.mutate({
                emails: inviteForm.values.emails,
                organisationId,
              } as any)
            }
            loading={inviteMutation.isLoading}
            type="submit"
          >
            {inviteMutation.isLoading ? '' : 'Send invite'}
          </Button>
        </Flex>
      </Modal>
      <Modal
        opened={opened}
        onClose={close}
        title="Create a channel"
        centered
        size="lg"
        radius="lg"
        padding="xl"
        overlayProps={{
          color: theme.colors.dark[9],
          opacity: 0.55,
          blur: 2,
        }}
      >
        <form
          onSubmit={form.onSubmit(() =>
            mutation.mutate({
              name: form.values.name,
              organisationId,
            } as any)
          )}
        >
          <Stack spacing="md">
            <Input
              data-autofocus
              required
              label="Name"
              placeholder="e.g plan-budget"
              icon={<TbHash />}
              onChange={(event) =>
                form.setFieldValue('name', event.currentTarget.value)
              }
              error={
                form.errors.name && 'Channel name must be more than three words'
              }
            />
            <Text size="xs" mb="lg">
              Channels are where conversations happen around a topic. Use a name
              that is easy to find and understand.
            </Text>
            <Button loading={mutation.isLoading} type="submit">
              {mutation.isLoading ? '' : 'Create channel'}
            </Button>
          </Stack>
        </form>
      </Modal>
      <Grid h="100vh" m="0">
        <Grid.Col
          span={2}
          p="0"
          style={{
            ...(popupWindow ? { position: 'unset' } : { position: 'relative' }),
          }}
        >
          <Navbar>
            <Navbar.Section mt="sm" p="sm" pt="xs" pb="1.18rem">
              <AccountSwitcher data={organisationData} />
            </Navbar.Section>

            <Navbar.Section className={classes.section} px="0" mx="sm">
              <Group pl="sm" align="center" position="apart">
                <Text size="xs" mb="sm" color="dimmed">
                  Channels
                </Text>
                <Tooltip label="Add channels" withArrow position="right">
                  <ActionIcon onClick={open} variant="default" size={30}>
                    <HiPlus size="1.2rem" />
                  </ActionIcon>
                </Tooltip>
              </Group>

              {!channels && (
                <Stack spacing="sm">
                  <Skeleton height={15} width={250} radius="md" />
                  <Skeleton height={15} width={150} radius="md" />
                </Stack>
              )}

              {channels?.map((channel) => (
                <UnstyledButton
                  w="100%"
                  px="sm"
                  onClick={() => handleChannel(channel)}
                  key={channel?._id}
                  className={classes.collectionLink}
                  style={{
                    transition: 'all .2s ease',
                    borderRadius: 10,
                    fontWeight: channel?.hasNotOpen?.includes(
                      organisationData?.profile?._id ?? ''
                    )
                      ? 'bold'
                      : '400',
                    color: channel?.hasNotOpen?.includes(
                      organisationData?.profile?._id ?? ''
                    )
                      ? 'white'
                      : '#C1C2C5',
                    backgroundColor:
                      selected?._id === channel?._id
                        ? theme.colors.dark[6]
                        : 'transparent',
                  }}
                >
                  # {channel?.name}
                </UnstyledButton>
              ))}
            </Navbar.Section>

            <Navbar.Section className={classes.section} px="0" mx="sm">
              <Group pl="sm" align="center" position="apart">
                <Text size="xs" weight="bold" mb="sm" color="dimmed">
                  Direct messages
                </Text>
                <Tooltip
                  label={`Invite people to ${organisationData?.name}`}
                  withArrow
                  position="right"
                >
                  <ActionIcon onClick={inviteOpen} variant="default" size={30}>
                    <HiPlus size="1.2rem" />
                  </ActionIcon>
                </Tooltip>
              </Group>
              {!conversations && (
                <Stack spacing="sm">
                  <Skeleton height={15} width={250} radius="md" />
                  <Skeleton height={15} width={150} radius="md" />
                </Stack>
              )}
              {conversations?.map((convo, index) => (
                <UnstyledButton
                  w="100%"
                  px="sm"
                  onClick={() => handleConversation(convo)}
                  key={convo?._id}
                  className={classes.collectionLink}
                  style={{
                    transition: 'all .2s ease',
                    borderRadius: 10,
                    fontWeight: convo?.hasNotOpen?.includes(
                      organisationData?.profile?._id ?? ''
                    )
                      ? 'bold'
                      : '400',
                    color: convo?.hasNotOpen?.includes(
                      organisationData?.profile?._id ?? ''
                    )
                      ? 'white'
                      : '#C1C2C5',

                    backgroundColor:
                      selected?._id === convo._id
                        ? theme.colors.dark[6]
                        : 'transparent',
                  }}
                >
                  <Avatar
                    src={`/avatars/${convo?.name?.[0].toLowerCase()}.png`}
                    size="md"
                    color={getColorByIndex(index)}
                    radius="xl"
                  >
                    {convo?.name?.[0].toLowerCase()}
                  </Avatar>
                  {convo.name}{' '}
                  {convo.isOnline || convo.isSelf ? (
                    <Box
                      h=".7rem"
                      w=".7rem"
                      bg="green"
                      style={{
                        borderRadius: '5rem',
                      }}
                    ></Box>
                  ) : (
                    <Box
                      h=".7rem"
                      w=".7rem"
                      bg="gray"
                      style={{
                        borderRadius: '5rem',
                      }}
                    ></Box>
                  )}
                  <Text fw="100" c={theme.colors.dark[3]} span>
                    {convo.isSelf ? 'you' : ''}{' '}
                  </Text>
                </UnstyledButton>
              ))}
            </Navbar.Section>

            {selected?.isConversation && !selected?.isSelf && (
              <Huddle
                // selected={selected}
                // theme={theme}
                // socket={socket}
                userId={userId as string}
                popupWindow={popupWindow}
                setPopupWindow={setPopupWindow}
              />
            )}
          </Navbar>
        </Grid.Col>

        <Grid.Col span="auto" p="0">
          {children}
        </Grid.Col>
        {thread && (
          <Grid.Col
            span={3}
            p="0"
            style={{
              borderLeft: `1px solid ${theme.colors.dark[5]}`,
            }}
          >
            {thread}
          </Grid.Col>
        )}
      </Grid>
    </>
  )
}
