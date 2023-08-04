import React from 'react'
import { Flex, Text, ThemeIcon } from '@mantine/core'
import { IoLogoSlack } from 'react-icons/io'

export default function SlackLogo() {
  return (
    <Flex align="start" gap="sm">
      <ThemeIcon
        size="4rem"
        radius="md"
        variant="gradient"
        gradient={{ from: '#ed6ea0', to: '#ec8c69', deg: 35 }}
      >
        <IoLogoSlack size="2.5rem" color="white" />
      </ThemeIcon>
      <Text c="white" size="2xl" weight={600}>
        slack
      </Text>
    </Flex>
  )
}
