import { io } from 'socket.io-client'
import { BACKEND_URL } from '@/constants.js'

export const socket = io(BACKEND_URL)