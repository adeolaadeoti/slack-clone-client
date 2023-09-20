import {
  ActionIcon,
  BackgroundImage,
  Flex,
  Skeleton,
  Stack,
  Switch,
  Text,
  Tooltip,
  createStyles,
} from '@mantine/core'
import React from 'react'
import {
  BiMicrophone,
  BiMicrophoneOff,
  BiVideo,
  BiVideoOff,
} from 'react-icons/bi'
import { FaRegWindowMaximize, FaRegWindowMinimize } from 'react-icons/fa'
import { LuScreenShare, LuScreenShareOff } from 'react-icons/lu'
import { TbHeadphones, TbHeadphonesOff } from 'react-icons/tb'
import { HuddleProps } from '../utils/interfaces'
import { useAppContext } from '../providers/app-provider'

type Style = {
  popupWindow: boolean
  checked: boolean
}
const useStyles = createStyles((theme, { popupWindow, checked }: Style) => ({
  huddle: {
    position: 'absolute',
    bottom: '0',
    ...(checked ? { height: '21rem' } : { height: '5.5rem' }),
    ...(popupWindow
      ? {
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          width: '70% !important',
          height: '69%',
          border: `1px solid ${theme.colors.dark[4]}`,

          transition:
            'left 0.3s ease, top 0.3s ease, transform 0.3s ease, width 0.3s ease, height 0.3s ease',
        }
      : {
          left: '0',
          top: 'unset',
          transform: 'unset',
          width: '100%',
          borderTop: `1px solid ${theme.colors.dark[4]}`,

          transition:
            'left 0.3s ease, top 0.3s ease, transform 0.3s ease, width 0.3s ease',
        }),
    zIndex: 10,
    padding: theme.spacing.md,
    borderRadius: '1rem',
    paddingTop: theme.spacing.md,
    backgroundColor: theme.colors.dark[7],

    video: {
      ...(popupWindow
        ? {
            height: '32.5rem',
            width: '45%',
            objectFit: 'cover',
            borderRadius: '1rem',
            border: `2px solid ${theme.colors.dark[3]}`,
            marginBlock: '10rem',
          }
        : {
            marginBlock: '2rem',
            height: '60px',
            borderRadius: '1rem',
            border: '1px solid #373a40',
          }),
    },
    '.bg-img': {
      // overflow: 'hidden',
      ...(popupWindow
        ? {
            borderRadius: '15px',
          }
        : {
            borderRadius: '5px',
          }),
    },
  },
}))

const config = {
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
}

interface ConnectedUsers {
  [userId: string]: boolean
}

export default function Huddle({
  userId,
  popupWindow,
  setPopupWindow,
}: HuddleProps) {
  const { selected, theme, socket } = useAppContext()
  const [checked, setChecked] = React.useState(false)
  const { classes } = useStyles({ popupWindow, checked })

  const [connectedUsers, setConnectedUsers] = React.useState<ConnectedUsers>({})
  const localVideoRef = React.useRef<HTMLVideoElement>(null)
  const localStream = React.useRef<MediaStream | null>(null)
  const pcRefs = React.useRef<Record<string, RTCPeerConnection>>({})

  const [videoEnabled, setVideoEnabled] = React.useState(true)
  const [audioEnabled, setAudioEnabled] = React.useState(false)

  const [screenSharing, setScreenSharing] = React.useState(false)

  const startScreenSharing = async () => {
    try {
      setScreenSharing(true)
    } catch (error) {
      console.log('Error starting screen sharing:', error)
    }
  }

  const stopScreenSharing = async () => {
    try {
      setScreenSharing(false)
    } catch (error) {
      console.log('Error starting screen sharing:', error)
    }
  }

  // Function to toggle user media video
  async function toggleVideo() {
    const tracks = localStream.current!.getVideoTracks()
    if (tracks.length > 0) {
      tracks[0].enabled = !videoEnabled
      setVideoEnabled(!videoEnabled)
    }
  }

  // Function to toggle user media audio
  const toggleAudio = async () => {
    try {
      setAudioEnabled(!audioEnabled)
    } catch (error) {
      console.log(error)
    }
  }

  // Function to set up a peer connection and resolve when done
  async function setupPeerConnection(user: string) {
    try {
      if (screenSharing) {
        localStream.current = await navigator.mediaDevices.getDisplayMedia({
          video: true,
        })
      } else {
        localStream.current = await navigator.mediaDevices.getUserMedia({
          audio: audioEnabled,
          video: true,
        })
      }
      localVideoRef.current!.srcObject = localStream.current

      const pc = new RTCPeerConnection(config)
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit('ice-candidate', {
            roomId: selected?._id,
            candidate: event.candidate,
            senderUserId: user,
          })
        }
      }

      pc.onconnectionstatechange = (e) => {
        console.log('Connection state:', pc.connectionState)
      }

      pc.ontrack = (event) => {
        removeVideo()
        const stream = event.streams[0]
        const newVideoElement = document.createElement('video')
        newVideoElement.autoplay = true
        newVideoElement.playsInline = true
        newVideoElement.srcObject = stream

        const videoContainer = document.querySelector('.video-container')

        if (videoContainer) {
          videoContainer.appendChild(newVideoElement)
        }
      }

      localStream.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStream.current as MediaStream)
      })

      pcRefs.current[user] = pc
    } catch (error) {}
  }

  async function setupWebRTC() {
    try {
      await setupPeerConnection(userId)
      // Emit the "join-room" event when the user starts the call
      socket.emit('join-room', { roomId: selected?._id, userId })
      // Listen for the "join-room" event to trigger a call when another user joins
      socket.on('join-room', ({ roomId, otherUserId }) => {
        console.log(`User ${otherUserId} joined room ${roomId}`)
        setConnectedUsers({ [otherUserId]: true })
      })

      // Event listener for receiving SDP offers from other users
      socket.on('offer', ({ offer, senderUserId }) => {
        handleOffer(offer, senderUserId)
      })

      // Event listener for receiving SDP answers from other users
      socket.on('answer', ({ answer, senderUserId }) => {
        handleAnswer(answer, senderUserId)
      })

      // Event listener for receiving ICE candidates from other users
      socket.on('ice-candidate', (candidate, senderUserId) => {
        handleIceCandidate(candidate, senderUserId)
      })

      // Listen for the "room-leave" event to remove the particular video
      socket.on('room-leave', async () => {
        removeVideo()
      })
    } catch (error) {
      console.log('Error setting up WebRTC:', error)
    }
  }

  React.useEffect(() => {
    if (checked) {
      setupWebRTC()
      return () => {
        // Clean up resources (close the peer connections, stop media streams, etc.)
        for (const user in pcRefs.current) {
          if (pcRefs.current[user]) {
            pcRefs.current[user].close()
          }
        }
      }
    }

    return () => {
      socket.off('join-room')
      socket.off('offer')
      socket.off('answer')
      socket.off('ice-candidate')
    }
  }, [checked, audioEnabled, screenSharing])

  React.useEffect(() => {
    async function setupPeerConnections() {
      for (const user in connectedUsers) {
        await setupPeerConnection(user)
        await initiateCall(user)
      }
    }
    if (connectedUsers) {
      setupPeerConnections()
    }
  }, [connectedUsers])

  function removeVideo() {
    // Get the .video-container element
    const videoContainer = document.querySelector('.video-container')

    if (videoContainer) {
      // Get all the video elements within the .video-container
      const videoElements = videoContainer.querySelectorAll('video')

      // Check if there are at least two video elements
      if (videoElements.length >= 2) {
        // Remove the second video element (index 1)
        const videoToRemove = videoElements[1]
        // Remove the video element from the DOM
        videoToRemove.remove()
      }
    }
  }

  async function handleHuddleRequest(e: React.ChangeEvent<HTMLInputElement>) {
    setChecked(e.currentTarget.checked)
    if (e.currentTarget.checked === false) {
      socket.emit('room-leave', { roomId: selected?._id, userId })
      setPopupWindow(false)

      let streams = await (
        localVideoRef?.current?.srcObject as MediaStream
      )?.getTracks()
      await streams.forEach((track) => track.stop())

      if (pcRefs.current[userId]) {
        pcRefs.current[userId].close()
      }
    }
  }

  // Function to send an SDP offer to another user
  function sendOffer(offer: RTCSessionDescriptionInit, targetUserId: string) {
    console.log('offer was sent', offer, targetUserId)
    socket.emit('offer', { offer, targetUserId })
  }

  // Function to send an SDP answer to another user
  function sendAnswer(answer: RTCSessionDescriptionInit, senderUserId: string) {
    console.log('answer was sent', answer, senderUserId)
    socket.emit('answer', { answer, senderUserId })
  }

  // Function to initiate a call
  async function initiateCall(user: string) {
    try {
      const offer = await pcRefs.current[user]?.createOffer({
        offerToReceiveVideo: !screenSharing, // Only offer video if not screen sharing
      })
      await pcRefs.current[user]?.setLocalDescription(offer)
      const localDescription = pcRefs.current[user]?.localDescription
      sendOffer(localDescription as RTCSessionDescriptionInit, user)
    } catch (error) {
      console.log('Error creating and sending offer:', error)
    }
  }

  // Function to handle an incoming SDP offer
  async function handleOffer(
    offer: RTCSessionDescriptionInit,
    senderUserId: string
  ) {
    try {
      await pcRefs.current[senderUserId].setRemoteDescription(offer)
      const answer = await pcRefs.current[senderUserId].createAnswer()
      await pcRefs.current[senderUserId].setLocalDescription(answer)
      sendAnswer(
        pcRefs.current[senderUserId]
          .localDescription as RTCSessionDescriptionInit,
        senderUserId
      )
    } catch (error) {
      console.log('Error handling offer:')
    }
  }

  async function handleAnswer(
    answer: RTCSessionDescriptionInit,
    senderUserId: string
  ) {
    try {
      const pc = pcRefs.current[senderUserId]
      await pc.setRemoteDescription(answer)
    } catch (error) {
      console.log('Error handling answer:', error)
    }
  }

  // Function to handle an incoming ICE candidate
  async function handleIceCandidate(
    candidate: RTCIceCandidateInit,
    senderUserId: string
  ) {
    candidate = new RTCIceCandidate(candidate)
    pcRefs.current[senderUserId]?.addIceCandidate(candidate).catch((error) => {
      console.log('Error adding ICE candidate:', error)
    })
    console.log('Received ICE candidate:', candidate, senderUserId)
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
            <Tooltip
              label={`${popupWindow ? 'Close' : 'Open'} mini window`}
              withArrow
              position="top"
            >
              <ActionIcon
                onClick={() => setPopupWindow(!popupWindow)}
                variant="default"
                size={40}
              >
                {popupWindow ? (
                  <FaRegWindowMinimize size="1.3rem" />
                ) : (
                  <FaRegWindowMaximize size="1.3rem" />
                )}
              </ActionIcon>
            </Tooltip>
          </Flex>
          <BackgroundImage src="/huddle.png" className="bg-img">
            <Flex
              align="center"
              justify="center"
              gap="sm"
              className="video-container"
            >
              <video autoPlay playsInline ref={localVideoRef} />
            </Flex>
          </BackgroundImage>
          <Flex gap="sm" align="center">
            <Tooltip
              label={`${!audioEnabled ? 'Unmute' : 'Mute'} mic`}
              withArrow
              position="top"
            >
              <ActionIcon onClick={toggleAudio} variant="default" size={40}>
                {!audioEnabled ? (
                  <BiMicrophoneOff size="1.7rem" />
                ) : (
                  <BiMicrophone size="1.7rem" />
                )}
              </ActionIcon>
            </Tooltip>
            <Tooltip
              label={`Turn ${videoEnabled ? 'off' : 'on'} video`}
              withArrow
              position="top"
            >
              <ActionIcon onClick={toggleVideo} variant="default" size={40}>
                {!videoEnabled ? (
                  <BiVideoOff size="2rem" />
                ) : (
                  <BiVideo size="2rem" />
                )}
              </ActionIcon>
            </Tooltip>

            <Tooltip
              label={`${screenSharing ? 'Stop' : 'Start'} Sharing screen`}
              withArrow
              position="top"
            >
              <ActionIcon
                onClick={screenSharing ? stopScreenSharing : startScreenSharing}
                variant="default"
                size={40}
              >
                {screenSharing ? (
                  <LuScreenShareOff size="1.6rem" />
                ) : (
                  <LuScreenShare size="1.6rem" />
                )}
              </ActionIcon>
            </Tooltip>

            <Switch
              ml="auto"
              checked={checked}
              onChange={(e) => handleHuddleRequest(e)}
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
