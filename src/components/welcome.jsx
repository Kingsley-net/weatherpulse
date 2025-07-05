import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom'
import wel from './images/welcome.png'

export function Welcome(){
    const navigate = useNavigate()
return(
    <>
    <div className='h-screen w-full overflow-hidden transparent backdrop-blur-3xl'>

<div className='flex flex-col justify-center items-center h-full w-full'>
    <h1 className='font-bold text-4xl'>WeatherPulse</h1>
    <p className='text-xl text-center'>Discover accurate weather forecast</p>
  <button onClick={()=> navigate('/Home')} className='p-2 bg-gradient-to-r bg-blue-400 w-4/5 mt-9 text-white font-bold rounded-md'>Explore</button>
</div>
        </div>
        </>
)

}
