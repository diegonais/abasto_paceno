import { Card } from '../../components/ui/Card';
import { ErrorMessage } from '../../components/ui/ErrorMessage';

export function AuthFormShell({
  title,
  error,
  children,
  footer,
  asideTitle,
}) {
  return (
    <section className="auth-spotlight-shell">
      <div className="auth-spotlight-frame">
        <div className="auth-spotlight-copy">
          <img
            className="auth-spotlight-logo"
            src="/abasto-paceno.png"
            alt="Abasto Paceno"
          />
          <h1>{asideTitle ?? title}</h1>
        </div>

        <Card className="auth-card auth-card-spotlight">
          <h2>{title}</h2>
          <ErrorMessage message={error} />
          {children}
          {footer}
        </Card>
      </div>
    </section>
  );
}
