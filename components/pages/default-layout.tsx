import {
  createStyles,
  Navbar,
  Text,
  Group,
  Grid,
  Flex,
  Avatar,
  Tooltip,
  ActionIcon,
  Switch,
  UnstyledButton,
  useMantineTheme,
} from '@mantine/core'
import { getColorByIndex } from '../../utils/helpers'
import { TbHeadphonesOff, TbHeadphones } from 'react-icons/tb'
import { HiPlus } from 'react-icons/hi'
import React from 'react'

const useStyles = createStyles((theme) => ({
  section: {
    marginBottom: theme.spacing.sm,
    padding: theme.spacing.sm,

    '&:not(:first-of-type)': {
      paddingTop: theme.spacing.md,
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
  onChannelChange,
  onCoworkerChange,
}: any) {
  const { classes } = useStyles()
  const [selected, setSelected] = React.useState(data?.channels?.[0])

  function handleChannel(channel: any) {
    onChannelChange(channel)
    setSelected(channel)
  }
  function handleCoworker(data: any) {
    onCoworkerChange(data)
    setSelected(data)
  }

  return (
    <Grid h="100vh" m="0">
      <Grid.Col span={2} p="0">
        <Navbar>
          <Navbar.Section className={classes.section} mt="sm">
            <Flex align="center" gap="sm">
              <Avatar size="lg" color="gold" radius="xl">
                {data?.name[0].toUpperCase()}
              </Avatar>

              <Text transform="capitalize">{data?.name}</Text>
            </Flex>
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

            {data?.channels?.map((channel: any) => (
              <UnstyledButton
                w="100%"
                onClick={() => handleChannel(channel)}
                key={channel._id}
                className={classes.collectionLink}
                style={{
                  transition: 'all .2s ease',
                  fontWeight: selected._id === channel._id ? 'bold' : '400',
                  color: selected._id === channel._id ? 'white' : '#C1C2C5',
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
            {data?.coWorkers?.map((coWorker: any, index: any) => (
              <UnstyledButton
                w="100%"
                onClick={() => handleCoworker(coWorker)}
                key={coWorker._id}
                className={classes.collectionLink}
                style={{
                  transition: 'all .2s ease',
                  fontWeight: selected._id === coWorker._id ? 'bold' : '400',
                  color: selected._id === coWorker._id ? 'white' : '#C1C2C5',
                }}
              >
                <Avatar size="md" color={getColorByIndex(index)} radius="xl">
                  {coWorker?.username[0].toUpperCase()}
                </Avatar>
                {coWorker.username}{' '}
                <Text fw="100" c={useMantineTheme().colors.dark[3]} span>
                  {coWorker.isLoggedIn ? 'you' : ''}{' '}
                </Text>
              </UnstyledButton>
            ))}
          </Navbar.Section>

          <Navbar.Section className={classes.footer}>
            <Text tt="lowercase" size="sm">
              {selected?.name ?? selected?.username}
            </Text>

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
