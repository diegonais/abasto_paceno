export function PageHeader({ title, actions }) {
  return (
    <div className="page-header">
      <div>
        <h1>{title}</h1>
      </div>
      {actions ? <div className="page-actions">{actions}</div> : null}
    </div>
  );
}
