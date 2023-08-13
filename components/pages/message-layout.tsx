import {
  Avatar,
  Flex,
  Paper,
  Text,
  ThemeIcon,
  useMantineTheme,
} from '@mantine/core'
import React from 'react'
import { getColorHexByIndex } from '../../utils/helpers'
import { LuUserPlus } from 'react-icons/lu'

export default function MessageLayout({ data, appearance }: any) {
  return (
    <div>
      <Flex
        p="1rem"
        align="center"
        justify="space-between"
        style={{
          borderBottom: `1px solid ${useMantineTheme().colors.dark[4]}`,
        }}
      >
        <Text># {String(data?.name)?.toLowerCase()}</Text>

        <Paper radius="md" p="sm" pl="md" withBorder>
          <Flex align="center">
            {data?.collaborators?.map((collaborator: any, index: number) => (
              <Avatar
                ml="-1rem"
                size="md"
                style={{
                  border: `2px solid ${useMantineTheme().colors.dark[7]}`,
                  backgroundColor: getColorHexByIndex(index),
                }}
                opacity={1}
                radius="xl"
              >
                {collaborator.username[0].toUpperCase()}
              </Avatar>
            ))}
            <Text
              pl="sm"
              pr="lg"
              size="sm"
              style={{
                borderRight: `1px solid ${useMantineTheme().colors.dark[4]}`,
              }}
            >
              {data?.collaborators.length}
            </Text>
            <ThemeIcon
              size="2.5rem"
              radius="md"
              variant="gradient"
              ml="xl"
              gradient={{ from: '#202020', to: '#414141', deg: 35 }}
            >
              <LuUserPlus size="1.5rem" color="white" />
            </ThemeIcon>
          </Flex>
        </Paper>
      </Flex>
    </div>
  )
}
