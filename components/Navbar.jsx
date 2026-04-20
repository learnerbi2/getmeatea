
"use client"
import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react';
import { useSession, signOut, signIn } from 'next-auth/react';
function Navbar() {
const { data: session } = useSession();
 const [showdropdown, setShowdropdown] = useState(false)

console.log(session)
console.log(session?.user?.name)
  return (
    <nav className='sticky flex z-[9999] justify-between items-center bg-black text-white p-4'>
    <h1 className='text-2xl'><Link href="/"><Image src="/coffee-break.gif" alt="Logo" className="h-8 w-8 mr-2 inline-block" width={32} height={32}/>GET ME A TEA</Link></h1>
    <ul className='flex space-x-4'>
    
        {session && <>
  {/* Wrap button + dropdown in a relative container */}
  <div className="relative">
    <button
      onClick={() => setShowdropdown(!showdropdown)}
      onBlur={() => {
        setTimeout(() => {
          setShowdropdown(false)
        }, 1000)
      }}
      id="dropdownDefaultButton"
      className="text-white mx-2 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-2 py-2.5 text-center inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
      type="button"
    >
      {session.user.name}
      <svg className="w-2.5 h-2.5 ms-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4" />
      </svg>
    </button>

    <div
      id="dropdown"
      className={`${
        showdropdown ? "block" : "hidden"
      } absolute right-0 mt-2 z-[10000] bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700`}
    >
      <ul className="py-2 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="dropdownDefaultButton">
        <li>
          <Link href="/Dashboard" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">
            Dashboard
          </Link>
        </li>
        <li>
          <Link href={`/${session?.user?.name}`} className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">
            Your Page
          </Link>
        </li>
        <li>
          <button
            onClick={() => signOut()}
            className="w-full text-left block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
          >
            Sign out
          </button>
        </li>
      </ul>
    </div>
  </div>
</>}

      {session && <button type="button" onClick={() => signOut()} className="text-white w-26 bg-linear-to-r from-purple-500 to-pink-500 hover:bg-linear-to-l focus:ring-4 focus:outline-none focus:ring-purple-200 dark:focus:ring-purple-800 font-medium rounded-base 
      text-sm px-4 py-2.5 text-center leading-5 rounded-2xl">Sign Out</button>}
    <Link href="/login"><button type="button" className="text-white bg-linear-to-r from-purple-500 w-26 to-pink-500 hover:bg-linear-to-l focus:ring-4 focus:outline-none focus:ring-purple-200 dark:focus:ring-purple-800 font-medium rounded-base text-sm px-4 py-2.5 text-center leading-5 rounded-2xl">Login</button></Link>
    </ul> 
    </nav>
  )
}

export default Navbar