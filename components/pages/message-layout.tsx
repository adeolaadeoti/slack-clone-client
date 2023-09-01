import { Avatar, Flex, Paper, Skeleton, Text, ThemeIcon } from '@mantine/core'
import React from 'react'
import { getColorHexByIndex } from '../../utils/helpers'
import { LuUserPlus } from 'react-icons/lu'
import dynamic from 'next/dynamic'
const Message = dynamic(() => import('../message'), {
  ssr: false,
})

export default function MessageLayout({
  data,
  type,
  messagesLoading,
  messages,
  setMessages,
  theme,
  socket,
}: any) {
  const isLoading = !data?.name

  return (
    <Flex
      direction="column"
      justify="space-between"
      style={{
        position: 'relative',
      }}
    >
      <Flex
        bg={theme.colors.dark[7]}
        py={data?.isOwner ? '1.85rem' : '1rem'}
        px="1.85rem"
        align="center"
        justify="space-between"
        style={{
          borderBottom: `1px solid ${theme.colors.dark[4]}`,
        }}
      >
        {isLoading && <Skeleton height={15} width={150} radius="md" />}
        {type === 'channel' && !isLoading && (
          <Text># {String(data?.name)?.toLowerCase()}</Text>
        )}
        {type === 'conversation' && !isLoading && (
          <Flex gap="sm">
            <Avatar
              src={`/avatars/${data?.name[0].toLowerCase()}.png`}
              size="md"
              radius="xl"
            ></Avatar>
            <Text>{String(data?.name)?.toLowerCase()}</Text>
          </Flex>
        )}

        {!data?.isOwner && (
          <Paper radius="md" p="sm" px="md" withBorder>
            <Flex align="center">
              {data?.collaborators?.map((collaborator: any, index: number) => (
                <Avatar
                  key={index}
                  ml="-1rem"
                  size="md"
                  style={{
                    border: `2px solid ${theme.colors.dark[7]}`,
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
                  borderRight: `1px solid ${theme.colors.dark[4]}`,
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

      {data && (
        <Message
          isLoading={isLoading}
          messagesLoading={messagesLoading}
          type={type}
          theme={theme}
          socket={socket}
          messages={messages}
          setMessages={setMessages}
          data={data}
        />
      )}
    </Flex>
  )
}
