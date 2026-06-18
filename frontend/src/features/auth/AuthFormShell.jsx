import { Card } from '../../components/ui/Card';
import { ErrorMessage } from '../../components/ui/ErrorMessage';

export function AuthFormShell({ title, subtitle, error, children, footer }) {
  return (
    <div className="center-shell">
      <Card className="auth-card">
        <p className="page-eyebrow">Acceso</p>
        <h1>{title}</h1>
        <p className="page-description">{subtitle}</p>
        <ErrorMessage message={error} />
        {children}
        {footer}
      </Card>
    </div>
  );
}
