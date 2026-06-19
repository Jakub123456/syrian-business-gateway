import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import type { Industry } from "@/lib/taxonomy";
import { RequestsManager, type OwnRequest } from "@/components/requests/requests-manager";

export default async function DashboardRequestsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const session = await getSession();
  if (!session) redirect(`/${locale}/signin`);
  const dict = await getDictionary(locale as Locale);

  const back = (
    <Link href={`/${locale}/dashboard`} className="inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:underline">
      <span className="flip-rtl">←</span> {dict.dashboard.title}
    </Link>
  );

  if (session.role !== "IMPORTER") {
    return (
      <div className="container-page py-12">
        {back}
        <h1 className="mt-4 text-3xl font-bold text-brand-900">{dict.requestForm.manageTitle}</h1>
        <p className="mt-4 text-muted">{dict.requestForm.importersOnly}</p>
      </div>
    );
  }

  const company = await db.company.findUnique({
    where: { ownerId: session.uid },
    include: { demandRequests: { orderBy: { createdAt: "desc" } } },
  });

  const requests: OwnRequest[] = (company?.demandRequests ?? []).map((r) => ({
    id: r.id,
    title: r.title,
    category: r.category as Industry,
    quantity: r.quantity,
    targetCountryIso2: r.targetCountryIso2,
    status: r.status === "CLOSED" ? "CLOSED" : "OPEN",
    createdAt: r.createdAt.toISOString(),
  }));

  return (
    <div className="container-page py-12">
      {back}
      <h1 className="mt-4 text-3xl font-bold text-brand-900">{dict.requestForm.manageTitle}</h1>
      <p className="mt-3 max-w-2xl text-muted">{dict.requestForm.manageSubtitle}</p>
      <div className="mt-8">
        <RequestsManager locale={locale as Locale} dict={dict} requests={requests} />
      </div>
    </div>
  );
}
