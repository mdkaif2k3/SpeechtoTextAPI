import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="h-screen bg-blue-500 text-white flex font-serif justify-center items-center text-4xl">
      Speech To Text App
    </div>
  )
}

export default App
