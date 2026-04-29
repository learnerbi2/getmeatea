import React from 'react'

function Footer() {
  return (
    <footer className="bg-black text-white py-4 ">
      <div className="container mx-auto text-center">
        <p>&copy; {new Date().getFullYear()} Get Me a Tea. All rights reserved.</p>
      </div>
    </footer>
  )
}

export default Footer