export function Card({ children, className = '' }) {
  return <section className={`card ${className}`.trim()}>{children}</section>;
}
