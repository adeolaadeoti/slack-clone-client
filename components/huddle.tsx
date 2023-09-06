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
import { error } from 'console'
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

export default function Huddle({ selected, theme, socket, userId }: any) {
  const { classes } = useStyles()

  const [checked, setChecked] = React.useState(true)
  const localVideo = React.useRef<any>()
  const remoteVideo = React.useRef<any>()
  const pc = React.useRef<RTCPeerConnection>()

  React.useEffect(() => {
    if (checked) {
      navigator.mediaDevices
        .getUserMedia({ audio: false, video: true })
        .then((stream) => {
          localVideo.current.srcObject = stream
          stream.getTracks().forEach((track) => {
            _pc?.addTrack(track, stream)
          })
        })
        .catch((error) => {
          console.log('get userMediaError', error)
        })

      const _pc = new RTCPeerConnection()
      _pc.onicecandidate = (e) => {
        if (e.candidate) {
          console.log(JSON.stringify(e.candidate))
          localStorage.setItem('candidate', JSON.stringify(e.candidate))
        }
      }
      _pc.onconnectionstatechange = (e) => {
        console.log(e)
      }
      _pc.ontrack = (e) => {
        remoteVideo.current.srcObject = e.streams[0]
      }

      pc.current = _pc
    }
  }, [checked])

  async function createOffer() {
    try {
      const offer = await pc.current?.createOffer()
      localStorage.setItem('offer', JSON.stringify(offer) as any)
      await pc.current?.setLocalDescription(offer)
      console.log(offer)
    } catch (error) {
      console.log(error)
    }
  }

  async function createAnswer() {
    try {
      const offer = await pc.current?.createAnswer()
      localStorage.setItem('offer', JSON.stringify(offer) as any)
      await pc.current?.setLocalDescription(offer)
      console.log(offer)
    } catch (error) {
      console.log(error)
    }
  }

  function setRemoteDescription() {
    const offer = JSON.parse(localStorage.getItem('offer') as any)
    console.log(offer)
    pc.current?.setRemoteDescription(new RTCSessionDescription(offer))
  }

  async function addIceCandidate() {
    try {
      const candidate = JSON.parse(localStorage.getItem('candidate') as any)
      console.log('Adding candidate...', candidate)
      pc.current?.addIceCandidate(new RTCIceCandidate(candidate))
    } catch (error) {
      console.log(error)
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
            <video autoPlay ref={localVideo} className={classes.video} />
            <video
              id="video"
              autoPlay
              ref={remoteVideo}
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
