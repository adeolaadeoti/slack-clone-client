import {
  createStyles,
  Navbar,
  Text,
  Group,
  Grid,
  Avatar,
  Tooltip,
  ActionIcon,
  Switch,
  UnstyledButton,
  useMantineTheme,
  Stack,
  Skeleton,
} from '@mantine/core'
import { getColorByIndex } from '../../utils/helpers'
import { TbHeadphonesOff, TbHeadphones } from 'react-icons/tb'
import { HiPlus } from 'react-icons/hi'
import React from 'react'
import AccountSwitcher from '../account-switcher'
import { useRouter } from 'next/router'

const useStyles = createStyles((theme) => ({
  section: {
    marginBottom: theme.spacing.sm,
    padding: theme.spacing.md,

    '&:not(:first-of-type)': {
      borderTop: `1px solid ${theme.colors.dark[4]}`,
    },
  },
  footer: {
    marginTop: 'auto',
    marginBottom: theme.spacing.sm,
    padding: theme.spacing.md,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: '1rem',

    paddingTop: theme.spacing.md,
    borderTop: `1px solid ${theme.colors.dark[4]}`,
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
  data,
  selected,
  setSelected,
}: any) {
  const router = useRouter()
  const { classes } = useStyles()

  function handleChannel(channel: any) {
    router.push(`/c/${channel?._id}`)
    localStorage.setItem('channel', 'true')
    setSelected(channel)
  }
  function handleConversation(data: any) {
    router.push(`/c/${data?._id}`)
    localStorage.setItem('channel', 'false')
    setSelected(data)
  }

  return (
    <Grid h="100vh" m="0">
      <Grid.Col span={2} p="0">
        <Navbar>
          <Navbar.Section mt="sm" p="sm" pt="xs" pb="1.18rem">
            <AccountSwitcher data={data} />
          </Navbar.Section>

          <Navbar.Section className={classes.section}>
            <Group align="center" position="apart">
              <Text size="xs" mb="sm" color="dimmed">
                Channels
              </Text>
              <Tooltip label="Add channels" withArrow position="right">
                <ActionIcon variant="default" size={30}>
                  <HiPlus size="1.2rem" />
                </ActionIcon>
              </Tooltip>
            </Group>

            {!data?.channels && (
              <Stack spacing="sm">
                <Skeleton height={15} width={250} radius="md" />
                <Skeleton height={15} width={150} radius="md" />
              </Stack>
            )}

            {data?.channels?.map((channel: any) => (
              <UnstyledButton
                w="100%"
                onClick={() => handleChannel(channel)}
                key={channel._id}
                className={classes.collectionLink}
                style={{
                  transition: 'all .2s ease',
                  fontWeight: selected?._id === channel._id ? 'bold' : '400',
                  color: selected?._id === channel._id ? 'white' : '#C1C2C5',
                }}
              >
                # {channel?.name}
              </UnstyledButton>
            ))}
          </Navbar.Section>

          <Navbar.Section className={classes.section}>
            <Group align="center" position="apart">
              <Text size="xs" weight="bold" mb="sm" color="dimmed">
                Direct messages
              </Text>
              <Tooltip label="Add teammates" withArrow position="right">
                <ActionIcon variant="default" size={30}>
                  <HiPlus size="1.2rem" />
                </ActionIcon>
              </Tooltip>
            </Group>
            {!data?.conversations && (
              <Stack spacing="sm">
                <Skeleton height={15} width={250} radius="md" />
                <Skeleton height={15} width={150} radius="md" />
              </Stack>
            )}
            {data?.conversations?.map((convo: any, index: any) => (
              <UnstyledButton
                w="100%"
                onClick={() => handleConversation(convo)}
                key={convo._id}
                className={classes.collectionLink}
                style={{
                  transition: 'all .2s ease',
                  fontWeight: selected?._id === convo._id ? 'bold' : '400',
                  color: selected?._id === convo._id ? 'white' : '#C1C2C5',
                }}
              >
                <Avatar
                  src={`/avatars/${convo?.name[0].toLowerCase()}.png`}
                  size="md"
                  color={getColorByIndex(index)}
                  radius="xl"
                >
                  {convo?.name[0].toLowerCase()}
                </Avatar>
                {convo.name}{' '}
                <Text fw="100" c={useMantineTheme().colors.dark[3]} span>
                  {convo.isLoggedIn ? 'you' : ''}{' '}
                </Text>
              </UnstyledButton>
            ))}
          </Navbar.Section>

          <Navbar.Section className={classes.footer}>
            {!selected?.name && (
              <Skeleton height={15} width={150} radius="md" />
            )}
            {selected?.name && (
              <Text tt="lowercase" size="sm">
                {selected?.name}
              </Text>
            )}
            <Switch
              size="xl"
              color={useMantineTheme().colorScheme === 'dark' ? 'gray' : 'dark'}
              onLabel={
                <TbHeadphonesOff
                  size="1.5rem"
                  color={useMantineTheme().colors.red[4]}
                />
              }
              offLabel={
                <TbHeadphones
                  size="1.5rem"
                  color={useMantineTheme().colors.blue[6]}
                />
              }
            />
          </Navbar.Section>
        </Navbar>
      </Grid.Col>

      <Grid.Col span="auto" p="0">
        {children}
      </Grid.Col>
    </Grid>
  )
}
