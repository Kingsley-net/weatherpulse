import { useEffect, useState } from 'react'

function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setIsVisible(true)
    })
  }, [])

  const handleInstall = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      deferredPrompt.userChoice.then(() => {
        setDeferredPrompt(null)
        setIsVisible(false)
      })
    }
  }

  if (!isVisible) return null

  return (
   <div className='flex w-full justify-center'> <div className='fixed bottom-4 absolute bg-blue-600  w-4/5 h-32 flex flex-col justify-center items-center rounded-md'><div><p className='font-bold text-center text-white '>You can install this app and add to your home screen</p></div><div className='flex justify-between'><button className='bg-blue-700 text-white px-4 py-2 rounded-xl shadow-lg'>Cancel</button><button
      onClick={handleInstall}
      className="right-4 bg-blue-700 text-white px-4 py-2 rounded-xl shadow-lg"
    >Install
    </button></div></div></div>
  )
}

export default InstallButton
