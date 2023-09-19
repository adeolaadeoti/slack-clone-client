import axios from 'axios'

// const apiBase = 'http://localhost:3000/api/v1'

const axiosInterceptorInstance = axios.create({
  // baseURL: apiBase,
  baseURL: process.env.NEXT_PUBLIC_API,
})

// Request interceptor
axiosInterceptorInstance.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('access-token') as string
    if (accessToken) {
      if (config.headers) config.headers.Authorization = `Bearer ${accessToken}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

export default axiosInterceptorInstance
