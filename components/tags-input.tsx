import { TextInputProps, Badge, ActionIcon, Flex, Input } from '@mantine/core'
import React from 'react'
import { IoCloseSharp } from 'react-icons/io5'

type TagInputsType = TextInputProps

const TagInputs = React.forwardRef<HTMLInputElement, TagInputsType>(
  (props, ref) => {
    return (
      <Flex ref={ref}>
        <Badge size="xl" variant="outline" pr={3} rightSection={removeButton}>
          Badge with right section
        </Badge>
        <Input w="50%"></Input>
      </Flex>
    )
  }
)

Input.displayName = 'TagInputs'
export default TagInputs

const removeButton = (
  <ActionIcon size="xs" color="blue" radius="xl" variant="transparent">
    <IoCloseSharp size="10rem" />
  </ActionIcon>
)
