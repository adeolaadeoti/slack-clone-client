import axios from 'axios'

const apiBase = 'http://localhost:3000/api/v1'

export default axios.create({
  baseURL: apiBase,
  headers: {
    // Authorization: `Bearer ${localStorage.getItem('access_token')}`,
  },
})
