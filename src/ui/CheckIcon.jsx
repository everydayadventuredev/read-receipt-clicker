export default function CheckIcon({ size = 16, color = 'var(--purple)' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6L9.1 16 6 12.5"/>
      <path d="M22 6L13.1 16 12 14.5" opacity=".5"/>
    </svg>
  );
}
