import { useState } from 'react'
import {
  createStyles,
  Avatar,
  UnstyledButton,
  Group,
  Text,
  Menu,
  ThemeIcon,
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
  data: any
}

export default function AccountSwitcher({ data }: AccountSwitcherProps) {
  const { classes, theme, cx } = useStyles()
  const [userMenuOpened, setUserMenuOpened] = useState(false)

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
          <UnstyledButton className={cx(classes.user)}>
            <Group spacing={7}>
              <ThemeIcon size="3rem" radius="md" variant="gradient">
                <Text weight="bold" size="sm">
                  {data?.name[0].toUpperCase()}
                </Text>
              </ThemeIcon>
              <Text weight="bold" size="sm" pl="sm" mr="md">
                {data.name}
              </Text>
              <LuChevronsUpDown size="1.4rem" />
            </Group>
          </UnstyledButton>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Item
            p="sm"
            fz="xs"
            icon={<TbHeart size="0.9rem" color={theme.colors.red[6]} />}
          >
            Liked posts
          </Menu.Item>
          <Menu.Item
            p="sm"
            fz="xs"
            icon={<TbStar size="0.9rem" color={theme.colors.yellow[6]} />}
          >
            Saved posts
          </Menu.Item>
          <Menu.Item
            p="sm"
            fz="xs"
            icon={<TbMessage size="0.9rem" color={theme.colors.blue[6]} />}
          >
            Your comments
          </Menu.Item>

          <Menu.Label p="sm" fz="xs">
            Settings
          </Menu.Label>
          <Menu.Item p="sm" fz="xs" icon={<TbSettings size="0.9rem" />}>
            Account settings
          </Menu.Item>
          <Menu.Item p="sm" fz="xs" icon={<TbSwitchHorizontal size="0.9rem" />}>
            Change account
          </Menu.Item>
          <Menu.Item p="sm" fz="xs" icon={<TbLogout size="0.9rem" />}>
            Logout
          </Menu.Item>

          <Menu.Divider />

          <Menu.Label p="sm" fz="xs">
            Danger zone
          </Menu.Label>
          <Menu.Item p="sm" fz="xs" icon={<TbPlayerPause size="0.9rem" />}>
            Pause subscription
          </Menu.Item>
          <Menu.Item
            p="sm"
            fz="xs"
            color="red"
            icon={<TbTrash size="0.9rem" />}
          >
            Delete account
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </>
  )
}
