import React from 'react'
import { TextInput, createStyles, TextInputProps } from '@mantine/core'

const useStyles = createStyles((theme) => ({
  input: {
    paddingBlock: theme.spacing.lg,
    paddingInline: theme.spacing.sm,
  },
}))

const Input = React.forwardRef<HTMLInputElement, TextInputProps>(
  (props, ref) => {
    const { classes } = useStyles()

    return (
      <TextInput
        classNames={{
          input: classes.input,
        }}
        radius="md"
        {...props}
        ref={ref}
      />
    )
  }
)

Input.displayName = 'Input'

export default Input
