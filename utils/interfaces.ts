import { AxiosError, AxiosRequestConfig } from 'axios'

export interface DefaultLayoutProps {
  children: React.ReactNode
  thread: React.ReactNode | undefined
}
export interface MessageLayoutProps {
  type: 'channel' | 'conversation'
  messagesLoading: boolean
}

export interface HuddleProps {
  userId: string
  popupWindow: boolean
  setPopupWindow: React.Dispatch<React.SetStateAction<boolean>>
}
export interface MessageListProps {
  userId: string
  isThread?: boolean
  messages?: Message[] | Thread[]
}
export interface MessageProps {
  messagesLoading?: boolean
  isLoading?: boolean
  type?: 'channel' | 'conversation'
  isThread?: boolean
  open?: () => void
}

interface AxiosErrorData {
  data?: {
    name?: string
  }
}
interface AxiosSuccessData {
  data?: {
    data?: any
  }
}
export type ApiError = AxiosError<AxiosErrorData>
export type ApiSuccess = AxiosRequestConfig<AxiosSuccessData>

export interface Conversation {
  _id: string
  name: string
  collaborators: User[]
  description: string
  isSelf: boolean
  organisation: Organisation
  createdBy: string
  hasNotOpen: User[] & string[]
  isConversation: boolean
  isChannel: boolean
  isOnline: boolean
  createdAt: Date
  updatedAt: Date
}

export interface User {
  _id: string
  username?: string
  email?: string
  role?: string
  phone?: string
  isOnline?: boolean
}

export interface Organisation {
  _id: string
  owner: User
  name: string
  hobbies: string[]
  coWorkers: User[]
  generateJoinLink: () => string
  joinLink: string
  url: string
}

export interface Channel {
  _id: string
  name: string
  collaborators: User[]
  title: string
  description: string
  organisation: Organisation
  hasNotOpen: User[] & string[]
  isChannel: boolean
  isSelf: boolean
  isConversation: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Data {
  _id: string
  owner: User
  coWorkers: User[]
  createdAt: string
  updatedAt: string
  name: string
  joinLink: string
  url: string
  conversations: Conversation[]
  channels: Channel[]
  profile: User
}

export interface Message {
  _id: string
  content?: string
  sender?: User
  channel: string
  organisation: string
  collaborators: User[]
  threadReplies: User[]
  isBookmarked: boolean
  isSelf: boolean
  hasRead: boolean
  type?: string
  reactions?: {
    _id: string
    emoji: string
    reactedToBy: User[]
  }[]
  createdAt: string
  updatedAt: string
  threadLastReplyDate?: string
  threadRepliesCount?: number
}

export interface Thread {
  _id: string
  sender: User
  content: string
  message: string
  isBookmarked: boolean
  hasRead: boolean
  reactions?: {
    _id: string
    emoji: string
    reactedToBy: User[]
  }[]
  type?: string
  createdAt: string
  updatedAt: string
}
