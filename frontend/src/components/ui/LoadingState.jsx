export function LoadingState({ label = 'Cargando...', fullPage = false }) {
  return (
    <div className={`loading-state${fullPage ? ' full-page' : ''}`}>
      <div className="spinner" />
      <p>{label}</p>
    </div>
  );
}
