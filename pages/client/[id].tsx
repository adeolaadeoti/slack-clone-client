import { useRouter } from 'next/router'
import React from 'react'
import DefaultLayout from '../../components/pages/default-layout'
import MessageLayout from '../../components/pages/message-layout'
import { useQuery } from '@tanstack/react-query'
import axios from '../../services/axios'
import { useAppContext } from '../../providers/app-provider'

export default function Client() {
  const router = useRouter()
  const { id } = router.query

  const { data } = useAppContext()
  const query = useQuery(['channel'], () => axios.get(`/channel/${id}`), {
    enabled: !!id,
  })

  React.useEffect(() => {
    if (id) {
      query.refetch()
    }
  }, [id])

  return (
    <DefaultLayout data={data}>
      <MessageLayout data={query?.data?.data?.data} />
    </DefaultLayout>
  )
}
