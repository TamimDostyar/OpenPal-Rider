export function AuthRoutePath() {
  return (
    <svg viewBox="0 0 320 160" className="w-full max-w-[280px]" aria-hidden>
      <path
        d="M12 132 C 90 132, 90 40, 160 40 S 260 132, 308 132"
        fill="none"
        stroke="rgba(245,245,247,0.16)"
        strokeWidth="2"
        strokeDasharray="1 10"
        strokeLinecap="round"
      />
      <circle cx="12" cy="132" r="6" fill="rgb(var(--c-cream))" />
      <circle cx="12" cy="132" r="10" fill="none" stroke="rgba(245,245,247,0.35)" strokeWidth="1.5" />
      <circle cx="308" cy="132" r="6" fill="rgb(var(--c-coral))" />
      <circle cx="308" cy="132" r="10" fill="none" stroke="rgba(220,38,38,0.4)" strokeWidth="1.5" />

      <circle r="4" fill="rgb(var(--c-coral))">
        <animateMotion
          dur="4s"
          repeatCount="indefinite"
          path="M12 132 C 90 132, 90 40, 160 40 S 260 132, 308 132"
        />
      </circle>
    </svg>
  );
}
