import {
  Avatar,
  Flex,
  Paper,
  Stack,
  Text,
  ThemeIcon,
  UnstyledButton,
  useMantineTheme,
} from '@mantine/core'
import React from 'react'
import { getColorHexByIndex } from '../../utils/helpers'
import { LuUserPlus } from 'react-icons/lu'
import { BiUserPlus } from 'react-icons/bi'
import dynamic from 'next/dynamic'
const Message = dynamic(() => import('../message'), {
  ssr: false,
})

export default function MessageLayout({ data }: any) {
  return (
    <Flex direction="column" justify="space-between" h="100%">
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

      <Stack>
        <Flex align="start" gap="sm" p="lg">
          <ThemeIcon
            size="4.25rem"
            radius="md"
            variant="gradient"
            gradient={{ from: '#202020', to: '#414141', deg: 35 }}
          >
            {String(data?.name[0])?.toLowerCase()}
          </ThemeIcon>
          <Stack spacing=".1rem">
            <Text weight="bold" c="white">
              This is the very first begining of the
              <Text span c={useMantineTheme().colors.blue[5]}>
                {' '}
                #{String(data?.name)?.toLowerCase()}{' '}
              </Text>{' '}
              data
            </Text>
            <Text fz="sm" c={useMantineTheme().colors.dark[2]}>
              This data is for everything{' '}
              <Text span> #{String(data?.name)?.toLowerCase()} </Text> . Hold
              meetings, share docs, and make decisions together with your team.
              &nbsp;
              <UnstyledButton fz="sm" c={useMantineTheme().colors.blue[5]}>
                Edit description
              </UnstyledButton>
            </Text>
            <UnstyledButton
              mt="lg"
              fz="sm"
              c={useMantineTheme().colors.blue[5]}
            >
              <Flex align="center" justify="start" gap="xs">
                <BiUserPlus size="2.2rem" />
                <Text>Add people</Text>
              </Flex>
            </UnstyledButton>
          </Stack>
        </Flex>

        <Message data={data} />
      </Stack>
    </Flex>
  )
}
