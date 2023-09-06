import {
  ActionIcon,
  Flex,
  Skeleton,
  Stack,
  Switch,
  Text,
  Tooltip,
  createStyles,
} from '@mantine/core'
import adapter from 'webrtc-adapter'
import React from 'react'
import { BiMicrophone, BiScreenshot, BiVideo, BiWindow } from 'react-icons/bi'
import { BsRecord } from 'react-icons/bs'
import { FaRegWindowRestore } from 'react-icons/fa'
import { LuScreenShare } from 'react-icons/lu'
import { TbHeadphones, TbHeadphonesOff } from 'react-icons/tb'

const useStyles = createStyles((theme) => ({
  huddle: {
    // overflow: 'hidden',
    position: 'absolute',
    bottom: '0',
    left: '0',
    zIndex: 10,
    padding: theme.spacing.md,
    borderRadius: '1rem',
    paddingTop: theme.spacing.md,
    borderTop: `1px solid ${theme.colors.dark[4]}`,
    backgroundColor: theme.colors.dark[7],
    width: '100%',
  },
  video: {
    height: 100,
    borderRadius: '1rem',
    border: `1px solid ${theme.colors.dark[4]}`,
  },
}))

const config = {
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
}

export default function Huddle({ selected, theme, socket, userId }: any) {
  const { classes } = useStyles()

  const [checked, setChecked] = React.useState(true)
  const localVideoRef = React.useRef<any>()
  const remoteVideoRef = React.useRef<any>()
  const pcRef = React.useRef<RTCPeerConnection>()

  React.useEffect(() => {
    if (checked) {
      setupWebRTC()
    }
  }, [checked])

  async function setupWebRTC() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: true,
      })

      localVideoRef.current.srcObject = stream

      const pc = new RTCPeerConnection(config)

      pc.onicecandidate = (e) => {
        if (e.candidate) {
          console.log('ICE candidate:', e.candidate)
          localStorage.setItem('candidate', JSON.stringify(e.candidate))
        }
      }

      pc.onconnectionstatechange = (e) => {
        console.log('Connection state:', pc.connectionState)
        console.log('Connection state:', pc)
      }

      pc.ontrack = (e) => {
        remoteVideoRef.current.srcObject = e.streams[0]
      }

      pc.onnegotiationneeded = async () => {
        createOffer()
      }

      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream)
      })

      pcRef.current = pc
    } catch (error) {
      console.error('Error setting up WebRTC:', error)
    }
  }

  async function createOffer() {
    try {
      const offer = await pcRef.current?.createOffer()
      await pcRef.current?.setLocalDescription(offer)
      localStorage.setItem('offer', JSON.stringify(offer))
      console.log('Offer created:', offer)
    } catch (error) {
      console.error('Error creating offer:', error)
    }
  }

  async function createAnswer() {
    try {
      const offer = await pcRef.current?.createAnswer()
      await pcRef.current?.setLocalDescription(offer)
      localStorage.setItem('offer', JSON.stringify(offer))
      console.log('Answer created:', offer)
    } catch (error) {
      console.error('Error creating answer:', error)
    }
  }

  function setRemoteDescription() {
    const offer = JSON.parse(localStorage.getItem('offer') as string)

    if (offer) {
      pcRef.current
        ?.setRemoteDescription(new RTCSessionDescription(offer))
        .then(() => {
          console.log('Remote description set successfully')
        })
        .catch((error) => {
          console.error('Error setting remote description:', error)
        })
    }
  }

  async function addIceCandidate() {
    try {
      const candidate = JSON.parse(localStorage.getItem('candidate') as string)

      if (candidate) {
        await pcRef.current?.addIceCandidate(new RTCIceCandidate(candidate))
        console.log('ICE candidate added successfully:', candidate)
      }
    } catch (error) {
      console.error('Error adding ICE candidate:', error)
    }
  }

  return (
    <Stack w="100%" className={classes.huddle}>
      {checked && (
        <Stack w="100%">
          <Flex align="center" justify="space-between">
            <Text tt="lowercase" size="sm">
              {selected?.isChannel && '#'}
              {selected?.name}
            </Text>
            <Tooltip label="Open mini window" withArrow position="top">
              <ActionIcon onClick={() => {}} variant="default" size={40}>
                <FaRegWindowRestore size="1.3rem" />
              </ActionIcon>
            </Tooltip>
          </Flex>

          <Flex align="center" gap="sm">
            <video autoPlay ref={localVideoRef} className={classes.video} />
            <video
              id="video"
              autoPlay
              ref={remoteVideoRef}
              className={classes.video}
            />
          </Flex>
          <Flex gap="sm" align="center">
            <button onClick={createOffer}>create offer</button>
            <button onClick={createAnswer}>create answer</button>
            <button onClick={setRemoteDescription}>setRemoteDescription</button>
            <button onClick={addIceCandidate}>add candidate</button>
            <Tooltip label="Mute mic" withArrow position="top">
              <ActionIcon onClick={() => {}} variant="default" size={40}>
                <BiMicrophone size="1.7rem" />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Turn on video" withArrow position="top">
              <ActionIcon onClick={() => {}} variant="default" size={40}>
                <BiVideo size="2rem" />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Share screen" withArrow position="top">
              <ActionIcon onClick={() => {}} variant="default" size={40}>
                <LuScreenShare size="1.6rem" />
              </ActionIcon>
            </Tooltip>
            <Switch
              ml="auto"
              checked={checked}
              onChange={(event) => setChecked(event.currentTarget.checked)}
              size="xl"
              color={theme.colorScheme === 'dark' ? 'gray' : 'dark'}
              onLabel={
                <TbHeadphonesOff size="1.5rem" color={theme.colors.red[4]} />
              }
              offLabel={
                <TbHeadphones size="1.5rem" color={theme.colors.blue[6]} />
              }
            />
          </Flex>
        </Stack>
      )}
      {!checked && (
        <Flex align="center" justify="space-between">
          {!selected?.name && <Skeleton height={15} width={150} radius="md" />}
          {selected?.name && (
            <Text tt="lowercase" size="sm">
              {selected?.isChannel && '#'}
              {selected?.name}
            </Text>
          )}
          <Switch
            checked={checked}
            onChange={(event) => setChecked(event.currentTarget.checked)}
            size="xl"
            color={theme.colorScheme === 'dark' ? 'gray' : 'dark'}
            onLabel={
              <TbHeadphonesOff size="1.5rem" color={theme.colors.red[4]} />
            }
            offLabel={
              <TbHeadphones size="1.5rem" color={theme.colors.blue[6]} />
            }
          />
        </Flex>
      )}
    </Stack>
  )
}
