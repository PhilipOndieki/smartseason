import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

export default function Landing() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="relative h-screen overflow-hidden">
      {/* Background image */}
      <img
        className="absolute inset-0 w-full h-full object-cover"
        src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1920&q=80"
        alt="Farm field"
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Navbar */}
      <nav
        className={`absolute top-0 left-0 right-0 z-10 h-14 flex items-center px-8 transition-all duration-200 ${
          scrolled ? 'bg-white border-b border-gray-100' : 'bg-transparent'
        }`}
      >
        <span
          className={`font-medium text-base mr-auto ${
            scrolled ? 'text-green-800' : 'text-white'
          }`}
        >
          SmartSeason
        </span>
        <div className="flex items-center gap-6">
          <Link
            to="/login"
            className={`text-sm ${
              scrolled ? 'text-gray-600 hover:text-gray-900' : 'text-white/80 hover:text-white'
            }`}
          >
            Login
          </Link>
          <Link
            to="/register"
            className={`text-sm px-4 py-2 rounded border transition-colors ${
              scrolled
                ? 'border-green-800 text-green-800 hover:bg-green-800 hover:text-white'
                : 'border-white text-white hover:bg-white hover:text-green-800'
            }`}
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-6 text-center">
        <h1 className="text-white text-4xl md:text-5xl font-semibold max-w-xl leading-relaxed mb-8">
          Monitor Every Field. Act Before It&apos;s Too Late.
        </h1>
        <Link
          to="/login"
          className="text-white border border-white px-8 py-3 rounded text-sm hover:bg-white hover:text-green-800 transition-colors"
        >
          Get Started
        </Link>
      </div>
    </div>
  )
}
