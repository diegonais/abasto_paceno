import { Card } from '../../components/ui/Card';
import { ErrorMessage } from '../../components/ui/ErrorMessage';

export function AuthFormShell({
  eyebrow = 'Acceso',
  title,
  subtitle,
  error,
  children,
  footer,
  asideTitle,
  asideDescription,
  highlights = [],
}) {
  return (
    <section className="auth-spotlight-shell">
      <div className="auth-spotlight-frame">
        <div className="auth-spotlight-copy">
          <p className="page-eyebrow">{eyebrow}</p>
          <img
            className="auth-spotlight-logo"
            src="/abasto-paceno.png"
            alt="Abasto Paceno"
          />
          <h1>{asideTitle ?? title}</h1>
          <p className="page-description auth-spotlight-description">
            {asideDescription ?? subtitle}
          </p>

          {highlights.length ? (
            <div className="auth-feature-list">
              {highlights.map((highlight) => (
                <article className="auth-feature-item" key={highlight.title}>
                  <strong>{highlight.title}</strong>
                  <p>{highlight.description}</p>
                </article>
              ))}
            </div>
          ) : null}
        </div>

        <Card className="auth-card auth-card-spotlight">
          <p className="page-eyebrow">{eyebrow}</p>
          <h2>{title}</h2>
          <p className="page-description">{subtitle}</p>
          <ErrorMessage message={error} />
          {children}
          {footer}
        </Card>
      </div>
    </section>
  );
}
