import '../styles/globals.css'
import adapter from 'webrtc-adapter'
import { AppProps } from 'next/app'
import Head from 'next/head'
import { MantineProvider } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AppContextProvider } from '../providers/app-provider'

// Create react query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 0,
    },
  },
})

export default function App(props: AppProps) {
  const { Component, pageProps } = props

  return (
    <QueryClientProvider client={queryClient}>
      <Head>
        <title>Slack-clone</title>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
      </Head>

      <AppContextProvider>
        <MantineProvider
          withGlobalStyles
          withNormalizeCSS
          theme={{
            colorScheme: 'dark',
            fontFamily: 'Epilogue, sans-serif',
            fontSizes: {
              xs: '1.2rem',
              sm: '1.4rem',
              md: '1.6rem',
              lg: '1.8rem',
              xl: '2.2rem',
              '2xl': '2.8rem',
              '3xl': '4rem',
            },
            spacing: {
              xs: '.4rem',
              sm: '.8rem',
              md: '1.6rem',
              lg: '2rem',
              xl: '2.4rem',
              '2xl': '3.2rem',
              '3xl': '4.8rem',
              '4xl': '6.4rem',
              '5xl': '8.0rem',
            },
            shadows: {
              tiny: '0px 1px 2px rgba(0, 0, 0, 0.1)',
              subtle: '0px 1px 2px rgba(0, 0, 0, 0.04)',
              deep: '0px 20px 48px rgba(0, 0, 0, 0.14)',
              normal: '0rem 1.2rem 3.2rem rgba(0, 0, 0, 10%)',
            },
          }}
        >
          <Notifications position="top-right" />
          <Component {...pageProps} />
        </MantineProvider>
      </AppContextProvider>
    </QueryClientProvider>
  )
}
