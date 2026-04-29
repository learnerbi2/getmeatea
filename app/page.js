
import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
function Page() {
  return (
  <>
     <h1 className='text-4xl font-bold text-white flex justify-center items-center'>Buy Me A Tea<Image className="w-10 h-10 ml-2" src="/coffee-break.gif" alt="tea icon" width={40} height={40}/></h1>
     <p className='text-white'>GetMeATea is crowsourcing platform for creators to get support from their fans!</p>
      <p className="text-center md:text-left">
          A place where your fans can buy you a Tea. Unleash the power of your fans and get your projects funded.
        </p>
     <div className='flex gap-4'>
                <Link href={"/login"}>
      <button type="button" className="rounded-lg text-white bg-linear-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-base text-sm px-4 py-2.5 text-center leading-5 border-radius-50">Start Here</button>
    </Link>
     <Link href="/about">
    <button type="button" className="rounded-lg text-white bg-linear-to-r from-purple-500 to-pink-500 hover:bg-gradient-to-l focus:ring-4 focus:outline-none focus:ring-purple-200 dark:focus:ring-purple-800 font-medium rounded-base text-sm px-4 py-2.5 text-center leading-5">Know More</button>
     </Link>
     </div>

    <div className='w-full mt-16 bg-gray-800 h-1'></div>

     <div className='container mx-auto flex flex-col gap-8'>
         {/* heading */}
      <div className='text-center'>
       <h2 className='font-bold text-white text-2xl'>Your Fans can buy your Tea!</h2>
      </div>
      {/* facility */}
      <div className='flex justify-around'>
      <div className='text-black flex flex-col justify-center items-center gap-2 mt-4 transition-transform '>
      <Image className="bg-white rounded-full p-1.5 w-25 h-25" src="/customer-service.gif" alt='image' width={100} height={100}/>
       <span className='text-white font-bold'>Fans want to help</span>
       <p className='text-white text-center text-sm'>Your fans are available to support you</p>
     </div>
     <div className='text-black flex flex-col justify-center items-center gap-2 mt-4'>
    <Image className="bg-white rounded-full p-1.5 w-25 h-25" src="/rupee.gif" alt='image' width={100} height={100}/>
       <span className='text-white font-bold'>Fans want to contribute</span>
       <p className='text-white text-center text-sm'>Your fans are willing to contribute financially</p>
     </div>
     <div className='text-black flex flex-col justify-center items-center gap-2 mt-4'>
      <Image className="bg-white rounded-full p-1.5 w-25 h-25" src="/mentorship.gif" alt='image' width={100} height={100}/> 
       <span className='text-white font-bold'>Fans want to collaborate</span>
       <p className='text-white text-center text-sm'>Your fans are ready to collaborate with you</p>
     </div>
     </div>
     </div>
       <div className='w-full mt-16 bg-gray-800 h-1'></div>

       <iframe className='mt-6' width="460" height="250" src="https://www.youtube.com/embed/FO_UnN5wAG0?si=j1E1sTKDJeYq7YeU" title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen></iframe>
  </>
    
  )
}

export default Page