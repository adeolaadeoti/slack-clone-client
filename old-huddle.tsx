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
import React from 'react'
import { BiMicrophone, BiVideo } from 'react-icons/bi'
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

  const [checked, setChecked] = React.useState(false)
  const localVideoRef = React.useRef<any>()
  const remoteVideoRef = React.useRef<any>()
  const targetUserIdRef = React.useRef<string | null>(null) // Store the target user's ID here
  const pcRef = React.useRef<RTCPeerConnection>()

  async function setupWebRTC() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: true,
      })
      localVideoRef.current.srcObject = stream

      const pc = new RTCPeerConnection(config)

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          // Send ICE candidate to the other peer via Socket.io
          socket.emit('ice-candidate', {
            candidate: event.candidate,
            targetUserId: userId,
          })
        }
      }

      pc.onconnectionstatechange = (e) => {
        console.log('Connection state:', pc.connectionState)
      }

      pc.ontrack = (event) => {
        if (remoteVideoRef.current)
          remoteVideoRef.current.srcObject = event.streams[0]
      }

      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream)
      })

      pcRef.current = pc

      // Emit the "join-room" event when a user joins the room
      socket.emit('join-room', { roomId: selected?._id, userId })
      // Listen for the "join-room" event to trigger a call when another user joins
      socket.on('join-room', ({ roomId, otherUserId }: any) => {
        console.log(`User ${otherUserId} joined room ${roomId}`)
        initiateCall(otherUserId)
      })

      // Event listener for receiving SDP offers from other users
      socket.on('offer', (offer: any) => {
        handleOffer(offer)
      })

      // Event listener for receiving SDP answers from other users
      socket.on('answer', (answer: any) => {
        handleAnswer(answer)
      })

      // Event listener for receiving ICE candidates from other users
      socket.on('ice-candidate', (candidate: any) => {
        handleIceCandidate(candidate)
      })
    } catch (error) {
      console.log('Error setting up WebRTC:', error)
    }
  }

  React.useEffect(() => {
    if (checked) {
      setupWebRTC()
      return () => {
        // Clean up resources (close the peer connection, stop media streams, etc.)
        if (pcRef.current) {
          pcRef.current.close()
        }
      }
    }

    return () => {
      socket.off('join-room')
      socket.off('offer')
      socket.off('answer')
      socket.off('ice-candidate')
    }
  }, [checked])

  // Function to send an SDP offer to another user
  function sendOffer(offer: any, targetUserId: string) {
    if (targetUserIdRef.current) {
      console.log('offer was sent', offer)
      // Send the offer to the target user via Socket.io
      socket.emit('offer', offer, targetUserId)
    }
  }

  // Function to send an SDP answer to another user
  function sendAnswer(answer: any) {
    console.log('answer was sent', answer)
    // Send the answer to the other user via Socket.io
    socket.emit('answer', answer)
  }

  // Function to initiate a call
  async function initiateCall(targetUserId: string) {
    try {
      targetUserIdRef.current = targetUserId

      // Create an SDP offer
      const offer = await pcRef.current?.createOffer()
      await pcRef.current?.setLocalDescription(offer)

      const localDescription = pcRef.current?.localDescription
      if (localDescription) {
        // Send the offer along with the targetUserId
        sendOffer(localDescription, targetUserId)
      } else {
        console.log('Local description is null')
      }
    } catch (error) {
      console.log('Error creating and sending offer:', error)
    }
  }

  // Function to handle an incoming SDP offer
  async function handleOffer(offer: any) {
    try {
      // Process the offer
      await pcRef.current?.setRemoteDescription(offer)
      // Create an answer
      const answer = await pcRef.current?.createAnswer()
      // Set the local description
      await pcRef.current?.setLocalDescription(answer)
      // Send the answer
      sendAnswer(pcRef.current?.localDescription)
    } catch (error) {
      console.error('Error handling offer:', error)
    }
  }

  // Function to handle an incoming SDP answer
  function handleAnswer(answer: any) {
    // Set the remote description with the received answer
    console.log('answer set as remote description')
    pcRef.current?.setRemoteDescription(answer)
  }

  // Function to handle an incoming ICE candidate
  function handleIceCandidate(candidate: any) {
    // Add the received ICE candidate to the peer connection
    candidate = new RTCIceCandidate(candidate)
    console.log('Received ICE candidate:', candidate)
    // Add the received ICE candidate to the peer connection
    pcRef.current?.addIceCandidate(candidate).catch((error: any) => {
      console.error('Error adding ICE candidate:', error)
    })
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
            <video
              autoPlay
              playsInline
              ref={localVideoRef}
              className={classes.video}
            />
            <video
              id="video"
              autoPlay
              playsInline
              ref={remoteVideoRef}
              className={classes.video}
            />
          </Flex>
          <Flex gap="sm" align="center">
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
