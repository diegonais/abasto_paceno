export function Textarea({ label, error, className = '', ...props }) {
  return (
    <label className={`field ${className}`.trim()}>
      {label ? <span className="field-label">{label}</span> : null}
      <textarea className={`field-control textarea${error ? ' has-error' : ''}`} {...props} />
      {error ? <small className="field-error">{error}</small> : null}
    </label>
  );
}
