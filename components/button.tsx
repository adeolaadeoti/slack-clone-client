import React from 'react'
import { ButtonProps, Button as MantineButton } from '@mantine/core'

const Button = React.forwardRef<
  HTMLButtonElement,
  ButtonProps & { onClick?: () => void; appearance?: 'primary' | 'outline' }
>((props, ref) => {
  return (
    <MantineButton
      ref={ref}
      h="4.5rem"
      radius="md"
      {...props}
      styles={(theme) => ({
        root: {
          backgroundColor:
            props.appearance === 'outline' ? 'transparent' : '#376FBC',
          border:
            props.appearance === 'outline' ? '1px solid #373A40' : 'unset',
          '&:not([data-disabled])': theme.fn.hover({
            backgroundColor: theme.fn.darken('#373A40', 0.05),
            transition: 'background-color .3s ease',
          }),
        },

        leftIcon: {
          marginRight: theme.spacing.md,
        },
      })}
    >
      {props.children}
    </MantineButton>
  )
})

Button.displayName = 'Button'

export default Button
