import React from 'react'

export function Logo({ className = "w-8 h-8", ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      fill="none"
      className={className}
      {...props}
    >
      {/* Mentor Figure (Taller, left, leaning/reaching right) */}
      <circle cx="17" cy="13" r="4.5" fill="currentColor" />
      <path
        d="M9 28.5C9 23.8 12.8 20 17.5 20C19.5 20 21.3 20.7 22.8 21.9C23.6 22.5 24.3 23.3 24.8 24.2C25.3 25.1 24.9 26.3 23.9 26.8C22.9 27.3 21.7 26.9 21.2 25.9C20.4 24.4 18.7 23.5 17.5 23.5C14.7 23.5 12.5 25.7 12.5 28.5C12.5 28.9 12.1 29.3 11.7 29.3C10.2 29.3 9 29.0 9 28.5Z"
        fill="currentColor"
      />
      {/* Reaching connection path */}
      <path
        d="M21 21.5C24 21.5 27.5 23.8 29.5 26.5"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      {/* Student Figure (Smaller, right, looking/reaching left) */}
      <circle cx="33" cy="19" r="3.5" fill="currentColor" />
      <path
        d="M28 32.5C28 29.5 30.2 27 33 27C35.8 27 38 29.5 38 32.5C38 32.9 37.6 33.3 37.2 33.3H28.8C28.4 33.3 28 32.9 28 32.5Z"
        fill="currentColor"
      />
    </svg>
  )
}
