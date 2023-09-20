import { useState } from 'react'
import {
  createStyles,
  UnstyledButton,
  Group,
  Text,
  Menu,
  ThemeIcon,
  Flex,
  Skeleton,
  Stack,
} from '@mantine/core'
import {
  TbLogout,
  TbHeart,
  TbStar,
  TbMessage,
  TbSettings,
  TbPlayerPause,
  TbTrash,
  TbSwitchHorizontal,
} from 'react-icons/tb'

import { LuChevronsUpDown } from 'react-icons/lu'
import { useRouter } from 'next/router'
import { ContextProps, useAppContext } from '../providers/app-provider'

const useStyles = createStyles((theme) => ({
  user: {
    color: theme.colors.dark[0],
    padding: theme.spacing.xs,
    borderRadius: theme.radius.lg,
    transition: 'background-color 100ms ease',

    '&:hover': {
      backgroundColor: theme.colors.dark[8],
    },
  },
}))

interface AccountSwitcherProps {
  data: ContextProps['data']
}

export default function AccountSwitcher({ data }: AccountSwitcherProps) {
  const router = useRouter()
  const { classes, theme, cx } = useStyles()
  const { socket } = useAppContext()
  const [, setUserMenuOpened] = useState(false)

  function handleLogout() {
    localStorage.removeItem('organisationId')
    localStorage.removeItem('signUpEmail')
    localStorage.removeItem('access-token')
    localStorage.removeItem('channel')
    socket.emit('user-leave', { id: data?.profile?._id, isOnline: false })
    router.push('/signin')
  }

  return (
    <>
      <Menu
        width="26rem"
        position="bottom-start"
        transitionProps={{ transition: 'pop-top-left' }}
        onClose={() => setUserMenuOpened(false)}
        onOpen={() => setUserMenuOpened(true)}
        withinPortal
      >
        <Menu.Target>
          {!data?.name ? (
            <Flex align="center" gap="sm">
              <Skeleton circle height={61} />
              <Stack spacing="sm">
                <Skeleton height={15} width={250} radius="md" />
                <Skeleton height={15} width={150} radius="md" />
              </Stack>
            </Flex>
          ) : (
            <UnstyledButton className={cx(classes.user)}>
              <Group spacing={7}>
                <ThemeIcon size="3rem" radius="md" variant="gradient">
                  <Text weight="bold" size="sm">
                    {data?.name[0].toUpperCase()}
                  </Text>
                </ThemeIcon>
                <Text weight="bold" size="sm" pl="sm" mr="md">
                  {data?.name}
                </Text>
                <LuChevronsUpDown size="1.4rem" />
              </Group>
            </UnstyledButton>
          )}
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Item
            p="sm"
            fz="xs"
            onClick={() => router.push('/')}
            icon={<TbHeart size="1.5rem" color={theme.colors.red[6]} />}
          >
            Workspaces
          </Menu.Item>
          <Menu.Item
            p="sm"
            fz="xs"
            icon={<TbStar size="1.5rem" color={theme.colors.yellow[6]} />}
          >
            Saved posts
          </Menu.Item>
          <Menu.Item
            p="sm"
            fz="xs"
            icon={<TbMessage size="1.5rem" color={theme.colors.blue[6]} />}
          >
            Your comments
          </Menu.Item>

          <Menu.Label p="sm" fz="xs">
            Settings
          </Menu.Label>
          <Menu.Item p="sm" fz="xs" icon={<TbSettings size="1.5rem" />}>
            Account settings
          </Menu.Item>
          <Menu.Item p="sm" fz="xs" icon={<TbSwitchHorizontal size="1.5rem" />}>
            Change account
          </Menu.Item>
          <Menu.Item
            onClick={handleLogout}
            p="sm"
            fz="xs"
            icon={<TbLogout size="1.5rem" />}
          >
            Logout
          </Menu.Item>

          <Menu.Divider />

          <Menu.Label p="sm" fz="xs">
            Danger zone
          </Menu.Label>
          <Menu.Item p="sm" fz="xs" icon={<TbPlayerPause size="1.5rem" />}>
            Pause subscription
          </Menu.Item>
          <Menu.Item
            p="sm"
            fz="xs"
            color="red"
            icon={<TbTrash size="1.5rem" />}
          >
            Delete account
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </>
  )
}
