import {useState, useEffect} from 'react';

export function UseMobile(){

    const [isMobile, setMobile] = useState(window.innerWidth <= 768)
    useEffect(()=>{
        const checkMobile = ()=>{
            const mobile = window.innerWidth <=768;
            
            setMobile(mobile);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile)
        return ()=> window.addEventListener('resize', checkMobile)
    },[])
    return isMobile;
}