// components/SearchCreators.jsx
"use client"
import { useState, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { searchCreators } from "@/actions/useractions"

const SearchCreators = () => {
    const [query, setQuery]             = useState("")
    const [results, setResults]         = useState([])
    const [loading, setLoading]         = useState(false)
    const [showResults, setShowResults] = useState(false)
    const router     = useRouter()
    const inputRef   = useRef(null)
    const dropdownRef = useRef(null)

    // ✅ Search handler
    const handleSearch = useCallback(async (value) => {
        setQuery(value)

        if (!value.trim()) {
            setResults([])
            setShowResults(false)
            return
        }

        setLoading(true)
        try {
            const data = await searchCreators(value)
            console.log("Search results:", data) // 🔍 debug
            setResults(data || [])
            setShowResults(true)
        } catch (err) {
            console.error("Search error:", err)
            setResults([])
        } finally {
            setLoading(false)
        }
    }, [])

    // ✅ Fixed handleSelect — use window.location for reliability
    const handleSelect = (username) => {
        if (!username) {
            console.error("Username is undefined!")
            return
        }

        console.log("Navigating to:", `/${username}`) // 🔍 debug

        // ✅ Clear state first
        setQuery("")
        setResults([])
        setShowResults(false)

        // ✅ Use window.location instead of router.push
        // more reliable for dynamic routes
        window.location.href = `/${username}`
    }

    // ✅ Handle clicks outside to close dropdown
    const handleBlur = (e) => {
        // ✅ Check if click was inside dropdown
        if (dropdownRef.current?.contains(e.relatedTarget)) {
            return // don't close if clicking inside dropdown
        }
        // ✅ Longer timeout to allow click to register
        setTimeout(() => setShowResults(false), 300)
    }

    return (
        <div className="relative w-52 max-w-md">

            {/* Search Input */}
            <div className="relative">
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => handleSearch(e.target.value)}
                    onFocus={() => results.length > 0 && setShowResults(true)}
                    onBlur={handleBlur}
                    placeholder="Search creators..."
                    className="w-full px-4 py-2 pl-10 rounded-full bg-gray-800 border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />

                {/* Search Icon */}
                <svg
                    className="absolute left-3 top-2.5 w-4 h-4 text-gray-500"
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>

                {/* Loading Spinner */}
                {loading && (
                    <div className="absolute right-3 top-2.5">
                        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                )}
            </div>

            {/* Results Dropdown */}
            {showResults && (
                <div
                    ref={dropdownRef}
                    // ✅ tabIndex allows the div to receive focus
                    // preventing onBlur from firing on click
                    tabIndex={-1}
                    className="absolute top-full mt-2 w-64 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden"
                >
                    {results.length === 0 ? (
                        <div className="p-4 text-gray-500 text-sm text-center">
                            No creators found for &quot;{query}&quot;
                        </div>
                    ) : (
                        <ul>
                            {results.map((creator) => (
                                <li
                                    key={creator._id}
                                    // ✅ Use onMouseDown instead of onClick
                                    // fires BEFORE onBlur so dropdown stays open
                                    onMouseDown={(e) => {
                                        e.preventDefault() // prevent input blur
                                        handleSelect(creator.username)
                                    }}
                                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-800 cursor-pointer transition"
                                >
                                    {/* Profile Picture */}
                                    <img
                                        src={creator.profilepic || "/avatar.gif"}
                                        alt={creator.username || "creator"}
                                        className="w-9 h-9 rounded-full object-cover border border-gray-600 flex-shrink-0"
                                        onError={(e) => e.target.src = "/avatar.gif"}
                                    />

                                    {/* Name + Username */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white text-sm font-medium truncate">
                                            {creator.name || creator.username}
                                        </p>
                                        <p className="text-gray-400 text-xs truncate">
                                            @{creator.username}
                                            {creator.creatorType && (
                                                <span className="ml-1 text-blue-400">
                                                    · {creator.creatorType}
                                                </span>
                                            )}
                                        </p>
                                    </div>

                                    {/* Arrow */}
                                    <svg
                                        className="w-4 h-4 text-gray-600 flex-shrink-0"
                                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round"
                                            strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </li>
                            ))}
                        </ul>
                    )}

                    {/* ✅ Bottom hint */}
                    {results.length > 0 && (
                        <div className="px-4 py-2 border-t border-gray-800">
                            <p className="text-gray-600 text-xs text-center">
                                {results.length} creator{results.length > 1 ? "s" : ""} found
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default SearchCreators