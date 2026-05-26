import { useEffect, useRef, useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../../context/AuthContext";
import { parseGoogleCredential } from "../../data/auth";
import { authSectionLabelClass } from "./authFormStyles";

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? "";
const facebookAppId = import.meta.env.VITE_FACEBOOK_APP_ID ?? "";
const isDev = import.meta.env.DEV;

const socialBtnClass =
  "auth-social-btn relative flex w-full min-h-[3rem] items-center justify-center gap-2.5 rounded-lg border border-cream-200/95 bg-white px-4 py-3 font-body text-sm font-medium text-emerald-900 transition-[border-color,box-shadow,background-color] duration-150 hover:border-emerald-900/12 hover:bg-[#faf6f0] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-400/45 disabled:pointer-events-none disabled:opacity-55";

function SocialError({ message }) {
  if (!message) return null;
  return (
    <p
      className="mt-4 rounded-xl border border-red-200/75 bg-red-50/70 px-3.5 py-2.5 font-body text-[12px] leading-relaxed text-red-800/90"
      role="alert"
    >
      {message}
    </p>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-[1.125rem] w-[1.125rem] shrink-0" viewBox="0 0 24 24" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg className="h-[1.125rem] w-[1.125rem] shrink-0" viewBox="0 0 24 24" fill="#1877F2" aria-hidden>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.437H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.437C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function SocialButton({ icon, label, onClick, disabled }) {
  return (
    <button type="button" disabled={disabled} onClick={onClick} className={socialBtnClass}>
      {icon}
      <span>{label}</span>
    </button>
  );
}

function GoogleOAuthButton({ onSuccess, onError, disabled }) {
  const hostRef = useRef(null);
  const [hostWidth, setHostWidth] = useState(320);

  useEffect(() => {
    const node = hostRef.current;
    if (!node) return undefined;

    const update = () => setHostWidth(Math.max(280, Math.floor(node.offsetWidth)));
    update();

    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={hostRef} className="relative w-full">
      <div className={`${socialBtnClass} pointer-events-none`} aria-hidden>
        <GoogleIcon />
        <span>Continue with Google</span>
      </div>
      <div
        className="absolute inset-0 z-10 overflow-hidden opacity-[0.02]"
        aria-label="Continue with Google"
      >
        <div className="flex h-full w-full items-center justify-center [&>div]:!w-full [&>div]:!max-w-none">
          <GoogleLogin
            onSuccess={onSuccess}
            onError={onError}
            type="standard"
            theme="outline"
            size="large"
            shape="pill"
            text="continue_with"
            width={hostWidth}
            locale="en"
          />
        </div>
      </div>
      {disabled ? <div className="absolute inset-0 z-20 cursor-not-allowed rounded-xl bg-white/40" aria-hidden /> : null}
    </div>
  );
}

export function SocialAuthButtons({
  onSuccess,
  mode = "login",
  headingId = "auth-social-heading",
  buttonLayout = "column",
}) {
  const { loginWithSocial } = useAuth();
  const [error, setError] = useState("");
  const [fbReady, setFbReady] = useState(false);
  const [busy, setBusy] = useState(false);

  const socialHeading = mode === "register" ? "Quick registration" : "Sign in with";
  const buttonWrapClass =
    buttonLayout === "row"
      ? "mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2"
      : "mt-3 flex w-full flex-col gap-2.5";

  useEffect(() => {
    if (!facebookAppId || window.FB) {
      if (facebookAppId && window.FB) setFbReady(true);
      return undefined;
    }

    window.fbAsyncInit = () => {
      window.FB.init({
        appId: facebookAppId,
        cookie: true,
        xfbml: false,
        version: "v19.0",
      });
      setFbReady(true);
    };

    const script = document.createElement("script");
    script.src = "https://connect.facebook.net/en_US/sdk.js";
    script.async = true;
    script.defer = true;
    script.crossOrigin = "anonymous";
    document.body.appendChild(script);

    return () => script.remove();
  }, []);

  const finishSocial = async (provider, profile) => {
    setError("");
    setBusy(true);
    const result = await loginWithSocial({ provider, ...profile });
    setBusy(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    onSuccess();
  };

  const handleGoogleSuccess = (credentialResponse) => {
    try {
      const profile = parseGoogleCredential(credentialResponse.credential);
      finishSocial("google", profile);
    } catch {
      setError("We could not complete Google sign-in. Please try again.");
    }
  };

  const handleFacebookLogin = () => {
    if (!facebookAppId || !window.FB) {
      if (!isDev) {
        setError("Facebook sign-in is temporarily unavailable. Please use email sign-in.");
        return;
      }
      finishSocial("facebook", {
        fullName: "Facebook User",
        email: `facebook.demo.${Date.now()}@saliah.local`,
        phone: "",
        providerId: "demo-facebook",
      });
      return;
    }

    setBusy(true);
    window.FB.login(
      (response) => {
        if (!response.authResponse) {
          setBusy(false);
          setError("Facebook sign-in was cancelled.");
          return;
        }

        window.FB.api("/me", { fields: "name,email" }, (user) => {
          setBusy(false);
          if (!user?.email) {
            setError("Facebook did not share your email. Please use email sign-in instead.");
            return;
          }
          finishSocial("facebook", {
            fullName: user.name ?? "Facebook User",
            email: user.email,
            phone: "",
            providerId: user.id,
          });
        });
      },
      { scope: "public_profile,email" }
    );
  };

  const handleGoogleFallback = () => {
    if (!isDev) {
      setError("Google sign-in is temporarily unavailable. Please use email sign-in.");
      return;
    }
    finishSocial("google", {
      fullName: "Google User",
      email: `google.demo.${Date.now()}@saliah.local`,
      phone: "",
      providerId: "demo-google",
    });
  };

  return (
    <div className="w-full">
      <p id={headingId} className={authSectionLabelClass}>
        {socialHeading}
      </p>

      <div className={buttonWrapClass}>
        {googleClientId ? (
          <GoogleOAuthButton
            onSuccess={handleGoogleSuccess}
            onError={() => setError("We could not complete Google sign-in. Please try again.")}
            disabled={busy}
          />
        ) : (
          <SocialButton
            icon={<GoogleIcon />}
            label="Continue with Google"
            disabled={busy}
            onClick={handleGoogleFallback}
          />
        )}

        <SocialButton
          icon={<FacebookIcon />}
          label="Continue with Facebook"
          disabled={busy || (facebookAppId && !fbReady)}
          onClick={handleFacebookLogin}
        />
      </div>

      <SocialError message={error} />
    </div>
  );
}
