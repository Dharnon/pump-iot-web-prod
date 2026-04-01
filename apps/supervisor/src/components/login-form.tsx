"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  LayoutDashboard,
  MonitorSmartphone,
  ShieldCheck,
  Waves,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { LanguageSelector } from "@/components/language-selector";
import { login } from "@/lib/api";
import { useLanguage } from "@/lib/language-context";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const errorParam = searchParams.get("error");

    if (errorParam === "session_expired") {
      setError("Tu sesion ha expirado. Por favor, inicia sesion nuevamente.");
    } else if (errorParam === "validation_failed") {
      setError("Error de validacion de sesion. Por favor, inicia sesion nuevamente.");
    }
  }, [searchParams]);

  const applySession = (
    token: string,
    user: { username: string; role: string },
  ) => {
    const maxAge = 8 * 60 * 60;

    document.cookie = `token=${token}; path=/; max-age=${maxAge}; SameSite=Strict${
      window.location.protocol === "https:" ? "; Secure" : ""
    }`;
    document.cookie = "use_mock_data=; path=/; max-age=0; SameSite=Strict";
    localStorage.removeItem("USE_MOCK_DATA");
    localStorage.setItem("user", JSON.stringify(user));
    router.push("/supervisor");
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await login(username, password);

      if (response.success) {
        applySession(response.token, response.user);
        return;
      }

      setError("Credenciales invalidas. Usa: admin / admin123");
    } catch {
      setError("Credenciales invalidas. Usa: admin / admin123");
    } finally {
      setLoading(false);
    }
  };

  const handleMockLogin = () => {
    document.cookie = "token=mock-token; path=/; max-age=3600; SameSite=Strict";
    document.cookie = "use_mock_data=true; path=/; max-age=3600; SameSite=Strict";
    localStorage.setItem("USE_MOCK_DATA", "true");
    localStorage.setItem(
      "user",
      JSON.stringify({ username: "mock_admin", role: "admin" }),
    );
    router.push("/supervisor");
  };

  const handleSupervisorAccess = () => {
    const hasToken = document.cookie.includes("token=");
    const useMock =
      document.cookie.includes("use_mock_data=true") ||
      localStorage.getItem("USE_MOCK_DATA") === "true";

    if (hasToken || useMock) {
      router.push("/supervisor");
      return;
    }

    setError("Inicia sesion o usa el modo mock para acceder al supervisor.");
  };

  return (
    <div className={cn("relative flex flex-col gap-6", className)} {...props}>
      <div className="absolute right-0 top-0 z-10">
        <LanguageSelector />
      </div>

      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form onSubmit={handleSubmit} className="p-6 md:p-8">
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="flex size-12 items-center justify-center rounded-2xl border border-border/70 bg-muted/60 shadow-sm">
                  <ShieldCheck className="size-5 text-primary" />
                </div>
                <h1 className="text-2xl font-bold">{t("login.title")}</h1>
                <p className="text-balance text-muted-foreground">
                  {t("login.subtitle")}
                </p>
              </div>

              <Field>
                <FieldLabel htmlFor="username">{t("login.username")}</FieldLabel>
                <Input
                  id="username"
                  type="text"
                  placeholder="admin"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  autoComplete="username"
                  required
                />
              </Field>

              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">{t("login.password")}</FieldLabel>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="********"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  required
                />
              </Field>

              {error ? (
                <div
                  role="alert"
                  className="rounded-xl border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm text-destructive"
                >
                  {error}
                </div>
              ) : null}

              <Field>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? t("login.loading") : t("login.submit")}
                  {!loading ? <ArrowRight data-icon="inline-end" /> : null}
                </Button>
              </Field>

              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                Quick access
              </FieldSeparator>

              <Field className="grid grid-cols-3 gap-4">
                <Button variant="outline" type="button" onClick={handleMockLogin}>
                  <CheckCircle2 />
                  <span className="sr-only">Mock mode</span>
                </Button>
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => router.push("/operator/")}
                >
                  <MonitorSmartphone />
                  <span className="sr-only">Operator</span>
                </Button>
                <Button
                  variant="outline"
                  type="button"
                  onClick={handleSupervisorAccess}
                >
                  <LayoutDashboard />
                  <span className="sr-only">Supervisor</span>
                </Button>
              </Field>

              <FieldDescription className="text-center">
                {t("footer.version")}
              </FieldDescription>
            </FieldGroup>
          </form>

          <div className="relative hidden overflow-hidden bg-muted md:block">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.12),_transparent_35%),linear-gradient(180deg,#111827_0%,#05070c_100%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(96,165,250,0.16),transparent_35%,rgba(14,165,233,0.08),transparent_75%)]" />
            <div className="absolute -right-20 top-10 size-60 rounded-full bg-cyan-500/15 blur-3xl" />
            <div className="absolute -left-16 bottom-0 size-64 rounded-full bg-sky-500/15 blur-3xl" />

            <div className="relative flex h-full flex-col justify-between p-8 text-white">
              <div className="space-y-6">
                <Image
                  src="/flowserve-logo.png"
                  alt="Flowserve"
                  width={180}
                  height={54}
                  className="h-10 w-auto brightness-0 invert"
                  priority
                />

                <div className="max-w-md space-y-4">
                  <p className="text-sm uppercase tracking-[0.3em] text-cyan-200/80">
                    Connected operations
                  </p>
                  <h2 className="text-4xl font-semibold tracking-tight">
                    Supervisor shell con acceso rapido al banco de pruebas.
                  </h2>
                  <p className="text-sm leading-6 text-white/75">
                    Mantiene autenticacion real, modo mock y acceso directo a las
                    vistas principales del supervisor.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-white/12 bg-white/6 p-4 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-cyan-400/15 text-cyan-200">
                    <Waves className="size-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Live test data</p>
                    <p className="text-xs text-white/65">
                      Protocolos, importaciones y estado del banco en un mismo shell.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <FieldDescription className="px-6 text-center">
        Usa credenciales reales o modo mock para entrar al supervisor.
      </FieldDescription>
    </div>
  );
}
