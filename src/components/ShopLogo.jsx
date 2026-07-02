// Inline vector fruit-basket mark used in both the header and the printable bill.
export default function ShopLogo({ className = 'w-14 h-14' }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      role="img"
      aria-label="P.R.E Fruits logo"
    >
      <circle cx="32" cy="32" r="31" fill="#166534" />
      <path
        d="M32 20c-6 0-11 5-11 12s5 15 11 15 11-8 11-15-5-12-11-12Z"
        fill="#22c55e"
      />
      <path
        d="M24 22c-4 0-8 4-8 9s4 11 8 11 7-6 7-11-3-9-7-9Z"
        fill="#4ade80"
        opacity="0.85"
      />
      <path
        d="M32 20c1-4 4-7 8-8"
        stroke="#a3e635"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="41" cy="11" r="3" fill="#4ade80" />
    </svg>
  )
}
