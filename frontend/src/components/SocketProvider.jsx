import { createContext, useContext, useEffect, useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { io } from 'socket.io-client'
import { BACKEND_URL } from '@/constants.js'

const SocketContext = createContext(null);

export const SocketProvider = ({children}) => {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0()
  const [socket, setSocket] = useState(null)

  useEffect(() => {
    if(!isAuthenticated) return;

    async function createSocket(){
      try{
        const token = await getAccessTokenSilently()
        const newSocket = io(BACKEND_URL, {
          //autoConnect: false,
          extraHeaders: {
            Authorization: `Bearer ${token}`
          }
        })
        setSocket(newSocket)
        console.log('Created a new socket')
      }catch(e){
        console.error('Error: ',e)
      }
    }

    createSocket()

    return () => {
      if(socket) socket.disconnect()
    }
  },[isAuthenticated, getAccessTokenSilently])

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  )
}

export const useSocket = () => useContext(SocketContext)
