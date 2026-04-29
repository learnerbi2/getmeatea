
"use client"
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import SearchCreators from './SearchCreators'

const Navbar = () => {
    const { data: session } = useSession()  
    return (
        <nav className="sticky flex z-[9999] justify-between items-center bg-black text-white p-4">
            {/* Logo */}
           <h1><Link href="/"><img src="/coffee-break.gif" alt="Logo" className="h-8 w-8 mr-2 inline-block"/>GET ME A TEA</Link></h1>
           

            {/* Search — fans search creators by username */}
            {/* <div className="mx-4 flex-1 max-w-sm">
                <SearchCreators />
            </div> */}

            {/* Auth Buttons */}
            <div className="flex items-center gap-2 whitespace-nowrap">
              <SearchCreators />
                {session ? (
                    <>
                        <Link
                            href="/Dashboard"
                            className="text-gray-300 hover:text-white text-sm px-3 py-1.5 rounded-lg hover:bg-gray-800 transition"
                        >
                            Dashboard
                        </Link>
                        {/* ✅ Show creator profile link if username set */}
                        {(session.user?.username) && (
                            <Link
                                href={`/${session.user.username}`}
                                className="text-gray-300 hover:text-white text-sm px-3 py-1.5 rounded-lg hover:bg-gray-800 transition"
                            >
                                My Page
                            </Link>
                        )}
                        <button
                            onClick={() => signOut({ callbackUrl: '/' })}
                            className="text-white w-26 bg-linear-to-r from-purple-500 to-pink-500 hover:bg-linear-to-l focus:ring-4 focus:outline-none focus:ring-purple-200 dark:focus:ring-purple-800 font-medium rounded-base text-sm px-4 py-2.5 text-center leading-5 rounded-2xl"
                        >
                            Sign Out
                        </button>
                    </>
                ) : (
                    <>
                        {/* Fan login → goes to home */}
                        <Link
                            href="/fanlogin">
                          <button type="button" className="text-white bg-linear-to-r from-purple-500 w-29 to-pink-500 hover:bg-linear-to-l focus:ring-4 focus:outline-none focus:ring-purple-200 dark:focus:ring-purple-800 font-medium rounded-3xl text-sm px-4 py-2.5 text-center leading-5 ">Login</button>
                        </Link>
                        {/* Creator login → goes to dashboard */}
                        <Link
                            href="/login">
                          <button type="button" className="text-white bg-linear-to-r from-purple-500 w-29 to-pink-500 hover:bg-linear-to-l focus:ring-4 focus:outline-none focus:ring-purple-200 dark:focus:ring-purple-800 font-medium rounded-3xl text-sm px-4 py-2.5 text-center leading-5 ">New Creator</button>
                        </Link>
                    </>
                )}
            </div>
        </nav>
    )
}

export default Navbar