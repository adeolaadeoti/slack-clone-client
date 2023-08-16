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
import { LuEdit, LuUserPlus } from 'react-icons/lu'
import { BiEditAlt, BiUserPlus } from 'react-icons/bi'
import dynamic from 'next/dynamic'
const Message = dynamic(() => import('../message'), {
  ssr: false,
})

export default function MessageLayout({ data, type }: any) {
  return (
    <Flex direction="column" justify="space-between" h="100%">
      <Flex
        p={data?.isOwner ? '1.85rem' : '1rem'}
        align="center"
        justify="space-between"
        style={{
          borderBottom: `1px solid ${useMantineTheme().colors.dark[4]}`,
        }}
      >
        {data?.name && <Text># {String(data?.name)?.toLowerCase()}</Text>}

        {!data?.isOwner && (
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
                {data?.collaborators?.length}
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
        )}
      </Flex>

      <Stack>
        <Flex align="start" gap="sm" p="lg">
          <ThemeIcon
            size="4.25rem"
            radius="md"
            variant="gradient"
            gradient={{ from: '#202020', to: '#414141', deg: 35 }}
          >
            {String(data?.name?.[0])?.toLowerCase()}
          </ThemeIcon>
          <Stack spacing=".1rem">
            {type === 'channel' && (
              <>
                <Text weight="bold" c="white">
                  This is the very first begining of the
                  <Text span c={useMantineTheme().colors.blue[5]}>
                    {' '}
                    #{String(data?.name)?.toLowerCase()}{' '}
                  </Text>{' '}
                  channel
                </Text>
                <Text fz="sm" c={useMantineTheme().colors.dark[2]}>
                  This channel is for everything{' '}
                  <Text span> #{String(data?.name)?.toLowerCase()} </Text> .
                  Hold meetings, share docs, and make decisions together with
                  your team. &nbsp;
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
              </>
            )}
            {type === 'conversation' && (
              <>
                {data?.isOwner ? (
                  <>
                    <Text weight="bold" c="white">
                      This space is just for you.
                    </Text>
                    <Text fz="sm" c={useMantineTheme().colors.dark[2]}>
                      Jot down notes, list your to-dos, or keep links and files
                      handy. You can also talk to yourself here, but please bear
                      in mind you’ll have to supply both sides of the
                      conversation. &nbsp;
                    </Text>
                    <UnstyledButton
                      mt="lg"
                      fz="sm"
                      c={useMantineTheme().colors.blue[5]}
                    >
                      <Flex align="center" justify="start" gap="xs">
                        <BiEditAlt size="2rem" />
                        <Text>Edit profile</Text>
                      </Flex>
                    </UnstyledButton>
                  </>
                ) : (
                  <>
                    <Text weight="bold" c="white">
                      This conversation is just between
                      <Text span c={useMantineTheme().colors.blue[5]}>
                        {' '}
                        @{String(data?.name)?.toLowerCase()}{' '}
                      </Text>{' '}
                      and you.
                    </Text>
                    <Text fz="sm" c={useMantineTheme().colors.dark[2]}>
                      Hold meetings, share docs, and make decisions together
                      with your team. &nbsp;
                      <UnstyledButton
                        fz="sm"
                        c={useMantineTheme().colors.blue[5]}
                      >
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
                  </>
                )}
              </>
            )}
          </Stack>
        </Flex>

        <Message data={data} />
      </Stack>
    </Flex>
  )
}
