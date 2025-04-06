import { Activity } from 'lucide-react'

export default function LoadingScreen(){
  return (
    <div className="fixed inset-0 w-full h-full flex items-center justify-center bg-gray-100">
      <div className="text-xl flex items-center">
        <Activity className="animate-spin h-8 w-8 mr-2 text-blue-600" />
        Loading...
      </div>
    </div>
  )
}