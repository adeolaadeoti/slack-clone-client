import {
  Avatar,
  Flex,
  Modal,
  MultiSelect,
  Paper,
  Portal,
  Skeleton,
  Text,
  ThemeIcon,
  createStyles,
} from '@mantine/core'
import React from 'react'
import { getColorByIndex, getColorHexByIndex } from '../../utils/helpers'
import { LuUserPlus } from 'react-icons/lu'
import dynamic from 'next/dynamic'
import { useDisclosure } from '@mantine/hooks'
import TagInputs from '../tags-input'
import { useForm } from '@mantine/form'
import Button from '../button'
import { useMutation } from '@tanstack/react-query'
import axios from '../../services/axios'
import { notifications } from '@mantine/notifications'
const Message = dynamic(() => import('../message'), {
  ssr: false,
})

const useStyles = createStyles((theme) => ({
  select: {
    paddingBlock: theme.spacing.sm,
    paddingInline: theme.spacing.sm,
  },
  values: {
    gap: theme.spacing.sm,
  },
}))

export default function MessageLayout({
  data,
  type,
  messagesLoading,
  messages,
  setMessages,
  theme,
  socket,
  refreshApp,
  organisationData,
}: any) {
  const { classes } = useStyles()
  const [isDisabled, setIsDisabled] = React.useState(true)

  const isLoading = !data?.name
  const [opened, { open, close }] = useDisclosure(false)

  const form = useForm({
    initialValues: {
      userIds: [''],
      channelId: data?._id,
    },
    validate: {
      userIds: (val) =>
        val.length > 0 ? null : 'At least one person must be selected',
    },
  })

  const mutation = useMutation({
    mutationFn: (body) => {
      return axios.post('/teammates', body)
    },
    onError(error: any) {
      notifications.show({
        message: error?.response?.data?.data?.name,
        color: 'red',
        p: 'md',
      })
    },
    onSuccess() {
      refreshApp()
      close()
      form.reset()
      notifications.show({
        message: `Teammate(s) added successful`,
        color: 'green',
        p: 'md',
      })
    },
  })

  const collaboratorsToRemove = data?.collaborators?.map((c: any) => c._id)

  const removeCollaboratorsFromCoworkers = organisationData?.coWorkers?.filter(
    (c: any) => {
      return !collaboratorsToRemove?.includes?.(c._id)
    }
  )

  const coWorkersSelect = removeCollaboratorsFromCoworkers?.map((c: any) => {
    return {
      value: c._id,
      label: c.email,
    }
  })

  return (
    <>
      <Modal
        opened={opened}
        onClose={close}
        title={`Add people to #${data?.name}`}
        centered
        size="45.25rem"
        radius="lg"
        padding="xl"
        overlayProps={{
          color: theme.colors.dark[10],
          opacity: 0.55,
          blur: 2,
        }}
      >
        <MultiSelect
          classNames={{
            input: classes.select,
            values: classes.values,
          }}
          onChange={(val) => {
            form.setFieldValue('userIds', val)
            setIsDisabled(false)
          }}
          searchable
          nothingFound="Nothing found"
          valueComponent={({ label }) => (
            <Flex gap="sm">
              <Avatar
                src={`/avatars/${label?.[0].toLowerCase()}.png`}
                size="md"
                color={getColorByIndex(label)}
                radius="xl"
              >
                {label[0].toLowerCase()}
              </Avatar>
              <Text>{label}</Text>
            </Flex>
          )}
          radius="md"
          data={coWorkersSelect}
          placeholder="Select a teammate"
        />
        <Text fz="xs" mt="lg">
          Expand your team collaboration by inviting your teammates to join the
          #{data?.name} channel. Share insights, and achieve more together.
        </Text>
        <Flex align="center" gap="md" mt="lg">
          <Button
            disabled={isDisabled}
            onClick={() =>
              mutation.mutate({
                userIds: form.values.userIds,
                channelId: data?._id,
              } as any)
            }
            loading={mutation.isLoading}
            type="submit"
          >
            {mutation.isLoading ? '' : 'Send invite'}
          </Button>
        </Flex>
      </Modal>
      <Flex
        direction="column"
        justify="space-between"
        style={{
          position: 'relative',
        }}
      >
        <Flex
          bg={theme.colors.dark[7]}
          py={data?.isChannel ? '1rem' : '1.85rem'}
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

          {data?.isChannel && (
            <Paper radius="md" p="sm" px="md" withBorder>
              <Flex align="center">
                {data?.collaborators?.map(
                  (collaborator: any, index: number) => (
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
                  )
                )}
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
                  onClick={open}
                  style={{
                    cursor: 'pointer',
                  }}
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
    </>
  )
}
