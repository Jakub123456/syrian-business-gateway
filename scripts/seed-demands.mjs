// Seed a few sample importers + import requests so the public directory isn't empty.
// Idempotent: removes the seed accounts first (cascade clears their requests), then recreates.
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();
const hash = await bcrypt.hash("password123", 10);

const importers = [
  {
    email: "buyer@globalfoods.example",
    nameEn: "Global Foods Ltd.",
    nameAr: "غلوبال فودز",
    countryIso2: "DE",
    requests: [
      { title: "Bulk extra-virgin olive oil, 2 containers/month", category: "FOOD_BEVERAGE", quantity: "2 x 20ft / month", targetCountryIso2: "DE", description: "Seeking cold-pressed EVOO for EU retail. ISO 22000 / HACCP and EU organic certification required. Bottled and bulk both considered." },
      { title: "Organic za'atar & dried herb blends", category: "FOOD_BEVERAGE", quantity: "5 tons / quarter", targetCountryIso2: "DE", description: "Cleaned and graded za'atar, sumac and aniseed for a German wholesaler. Need phytosanitary certificate and MRL compliance." },
    ],
  },
  {
    email: "sourcing@levant-naturals.example",
    nameEn: "Levant Naturals",
    nameAr: "ليفانت ناتشورالز",
    countryIso2: "FR",
    requests: [
      { title: "Damascus rosewater & rose essential oil", category: "COSMETICS_PERSONAL_CARE", quantity: "1,000 L rosewater + 5 kg oil", targetCountryIso2: "FR", description: "Premium Damascus rose derivatives for French cosmetics brand. Organic certification and full traceability needed." },
      { title: "Traditional laurel Aleppo soap, private label", category: "COSMETICS_PERSONAL_CARE", quantity: "20,000 bars", targetCountryIso2: "FR", description: "Hand-cut, aged laurel-and-olive Aleppo soap for private-label retail. Looking for consistent laurel oil percentage." },
    ],
  },
  {
    email: "procurement@gulftrading.example",
    nameEn: "Gulf Trading Co.",
    nameAr: "شركة الخليج للتجارة",
    countryIso2: "AE",
    requests: [
      { title: "Cotton home textiles — towels & table linens", category: "TEXTILES_APPAREL", quantity: "1 container", targetCountryIso2: "AE", description: "Woven cotton bath towels and table linens for UAE hospitality sector. OEKO-TEX preferred." },
      { title: "Mother-of-pearl inlay handicrafts (closed sample)", category: "CRAFTS_ARTISANAL", quantity: "500 pieces", targetCountryIso2: "AE", description: "This request has been fulfilled — kept as a closed example.", status: "CLOSED" },
    ],
  },
];

for (const imp of importers) {
  await db.user.deleteMany({ where: { email: imp.email } });
  await db.user.create({
    data: {
      email: imp.email,
      passwordHash: hash,
      role: "IMPORTER",
      locale: "en",
      company: {
        create: {
          type: "IMPORTER",
          nameEn: imp.nameEn,
          nameAr: imp.nameAr,
          email: imp.email,
          countryIso2: imp.countryIso2,
          verification: "VERIFIED",
          importer: { create: { industries: "[]", categoriesOfInterest: "[]" } },
          demandRequests: {
            create: imp.requests.map((r) => ({
              title: r.title,
              category: r.category,
              description: r.description,
              quantity: r.quantity,
              targetCountryIso2: r.targetCountryIso2,
              status: r.status ?? "OPEN",
            })),
          },
        },
      },
    },
  });
}

const open = await db.demandRequest.count({ where: { status: "OPEN" } });
const total = await db.demandRequest.count();
console.log(`Seeded import requests — open: ${open}, total: ${total}`);
await db.$disconnect();
