export function Input({ label, error, className = '', ...props }) {
  return (
    <label className={`field ${className}`.trim()}>
      {label ? <span className="field-label">{label}</span> : null}
      <input className={`field-control${error ? ' has-error' : ''}`} {...props} />
      {error ? <small className="field-error">{error}</small> : null}
    </label>
  );
}
