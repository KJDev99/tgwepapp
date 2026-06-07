// Brand logo that swaps with the color theme.
// Light theme -> dark logo, dark theme -> white logo (always high contrast).
export default function Logo({ size = 88, className = '' }) {
  return (
    <span
      className={`inline-block shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <img
        src="/darklogo.svg"
        alt="Логотип"
        draggable={false}
        className="w-full h-full object-contain block dark:hidden"
      />
      <img
        src="/whitelogo.svg"
        alt="Логотип"
        draggable={false}
        className="w-full h-full object-contain hidden dark:block"
      />
    </span>
  )
}
