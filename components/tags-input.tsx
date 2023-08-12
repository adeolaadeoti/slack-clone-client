import {
  TextInputProps,
  Badge,
  ActionIcon,
  Flex,
  TextInput,
  Paper,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import React, { KeyboardEvent, useRef } from 'react'
import { IoCloseSharp } from 'react-icons/io5'

type TagInputsType = TextInputProps & {
  onValueChange: (value: string[]) => void
}

const TagInputs = React.forwardRef<HTMLInputElement, TagInputsType>(
  (props, ref) => {
    const [values, setValues] = React.useState<string[]>([])
    const inputRef = useRef<HTMLInputElement | null>(null)

    const form = useForm({
      initialValues: {
        email: '',
      },
      validate: {
        email: (val) => (/^\S+@\S+$/.test(val) ? null : 'Invalid email'),
      },
    })

    function handleEnterKey(e: KeyboardEvent<HTMLInputElement>) {
      if (e.key === 'Enter') {
        if (!form.validateField('email').hasError) {
          const newValues = [...values, form.values.email]
          setValues(newValues)
          inputRef.current!.value = ''
          form.setFieldValue('email', '')
          props.onValueChange(newValues)
        }
      }
    }

    function handleRemoveValue(valueToRemove: string) {
      const newValues = values.filter((value) => value !== valueToRemove)
      setValues(newValues)
      props.onValueChange(newValues)
    }

    return (
      <Paper
        radius="md"
        p="sm"
        withBorder
        w={'40rem'}
        mih={'10rem'}
        onClick={() => inputRef.current?.focus()}
        style={{
          cursor: 'text',
        }}
      >
        <Flex align="center" gap="sm" ref={ref} wrap="wrap">
          {values &&
            values?.map((value) => (
              <Badge
                key={value}
                size="xl"
                fz="xs"
                px="sm"
                py="md"
                variant="outline"
                tt="lowercase"
                rightSection={
                  <ActionIcon
                    onClick={() => handleRemoveValue(value)}
                    size="sm"
                    color="blue"
                    radius="xl"
                    variant="transparent"
                  >
                    <IoCloseSharp size="12rem" />
                  </ActionIcon>
                }
              >
                {value}
              </Badge>
            ))}

          <TextInput
            ref={inputRef}
            variant="unstyled"
            placeholder="hello@adeola.xyz"
            onChange={(event) =>
              form.setFieldValue('email', event.currentTarget.value)
            }
            onKeyDown={handleEnterKey}
            error={form.errors.email && 'Invalid email'}
          />
        </Flex>
      </Paper>
    )
  }
)

TagInputs.displayName = 'TagInputs'
export default TagInputs
