import { AuthOrDivider } from "./AuthOrDivider";
import { SocialAuthButtons } from "./SocialAuthButtons";
import { authSectionLabelClass } from "./authFormStyles";

export function AuthSplitLayout({ mode, onSocialSuccess, children }) {
  const isRegister = mode === "register";
  const emailLabel = isRegister ? "Register with email" : "Email sign-in";

  if (isRegister) {
    return (
      <div className="auth-split mt-5 md:mt-6">
        <div className="flex flex-col gap-4">
          <section className="w-full" aria-labelledby="auth-social-heading">
            <SocialAuthButtons
              mode={mode}
              onSuccess={onSocialSuccess}
              headingId="auth-social-heading"
              buttonLayout="row"
            />
          </section>

          <AuthOrDivider orientation="horizontal" className="py-0" />

          <section className="w-full">
            <p className={`${authSectionLabelClass} mb-3`}>{emailLabel}</p>
            {children}
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-split mt-5 md:mt-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:gap-0">
        <section
          className="auth-split__social flex w-full flex-col items-center justify-center text-center md:w-[46%] md:shrink-0 md:pr-1 lg:pr-2"
          aria-labelledby="auth-social-heading"
        >
          <SocialAuthButtons
            mode={mode}
            onSuccess={onSocialSuccess}
            headingId="auth-social-heading"
            buttonLayout="column"
            className="mx-auto w-full max-w-[17.5rem] sm:max-w-[19rem] md:mx-0 md:max-w-none"
          />
        </section>

        <AuthOrDivider />

        <section className="auth-split__email min-w-0 w-full flex-1 md:pl-1 lg:pl-2">
          <p className={`${authSectionLabelClass} mb-3 md:mb-4`}>{emailLabel}</p>
          {children}
        </section>
      </div>
    </div>
  );
}
