import { notFound, redirect } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getSession } from "@/lib/auth/session";
import { SignInForm } from "@/components/auth/sign-in-form";

export default async function SignInPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  if (await getSession()) redirect(`/${locale}/dashboard`);
  const dict = await getDictionary(locale as Locale);
  const s = dict.signin;

  return (
    <div className="container-page max-w-md py-16">
      <h1 className="text-2xl font-bold text-brand-900">{s.title}</h1>
      <p className="mt-2 text-sm text-muted">{s.subtitle}</p>
      <SignInForm locale={locale as Locale} dict={dict} />
    </div>
  );
}
