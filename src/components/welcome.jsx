import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom'
import wel from './images/welcome.png'

export function Welcome(){
    const navigate = useNavigate()
return(
    <>
    <div className='h-screen overflow-hidden bg-gray-200'>

<div className='flex flex-col justify-center items-center h-full w-full'>
    <h1 className='font-bold text-4xl'>WeatherPulse</h1>
    <p className='text-xl'>Discover accurate weather forecast with style</p>
    <img src={wel} className="h-auto  w-1/2"/>
    <button onClick={()=> navigate('/Home')} className='p-2 bg-blue-400 w-4/5 mt-9 text-white font-bold rounded-md'>Explore</button>
</div>
        </div>
        </>
)

}