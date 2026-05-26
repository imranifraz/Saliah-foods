import { AuthOrDivider } from "./AuthOrDivider";
import { SocialAuthButtons } from "./SocialAuthButtons";
import { authSectionLabelClass } from "./authFormStyles";

export function AuthSplitLayout({ mode, onSocialSuccess, children }) {
  const isRegister = mode === "register";
  const emailLabel = isRegister ? "Register with email" : "Email sign-in";

  if (isRegister) {
    return (
      <div className="auth-split auth-split--register mt-5 flex flex-col gap-6 md:mt-6 md:gap-7">
        <section aria-labelledby="auth-social-heading">
          <SocialAuthButtons
            mode={mode}
            onSuccess={onSocialSuccess}
            headingId="auth-social-heading"
            buttonLayout="row"
          />
        </section>

        <AuthOrDivider orientation="horizontal" className="py-1" />

        <section className="w-full">
          <p className={`${authSectionLabelClass} mb-4`}>{emailLabel}</p>
          {children}
        </section>
      </div>
    );
  }

  return (
    <div className="auth-split mt-5 md:mt-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:gap-0">
        <section
          className="auth-split__social w-full md:w-[46%] md:shrink-0"
          aria-labelledby="auth-social-heading"
        >
          <SocialAuthButtons mode={mode} onSuccess={onSocialSuccess} headingId="auth-social-heading" />
        </section>

        <AuthOrDivider />

        <section className="auth-split__email min-w-0 w-full flex-1 md:pt-0">
          <p className={`${authSectionLabelClass} mb-3`}>{emailLabel}</p>
          {children}
        </section>
      </div>
    </div>
  );
}
