// End-to-end smoke test for the auth stack against the real SQLite DB.
// Mirrors registerExporter's DB writes, then mints a session JWT the same way
// lib/auth/session.ts does, and prints the cookie so we can drive the server.
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";

const db = new PrismaClient();
const email = "smoke@nour.example";
const secret = process.env.AUTH_SECRET;
if (!secret) throw new Error("AUTH_SECRET missing");

await db.user.deleteMany({ where: { email } });

const user = await db.user.create({
  data: {
    email,
    passwordHash: await bcrypt.hash("password123", 10),
    role: "EXPORTER",
    locale: "en",
    company: {
      create: {
        type: "EXPORTER",
        nameEn: "Smoke Olive Oil Co.",
        nameAr: "شركة الدخان لزيت الزيتون",
        email,
        countryIso2: "SY",
        descriptionEn: "Smoke-test exporter profile.",
        products: { create: [{ nameEn: "Olive oil", category: "FOOD_BEVERAGE" }] },
        exporter: {
          create: {
            governorate: "IDLIB",
            sectors: JSON.stringify(["FOOD_BEVERAGE", "AGRICULTURE"]),
            exportStage: "EXPORT_READY",
            certifications: JSON.stringify(["ISO 22000", "Organic"]),
            targetMarkets: JSON.stringify(["DE", "AE"]),
            currentMarkets: JSON.stringify([]),
            hasExportLicense: true,
          },
        },
      },
    },
  },
});

const token = await new SignJWT({ uid: user.id, email: user.email, role: "EXPORTER" })
  .setProtectedHeader({ alg: "HS256" })
  .setIssuedAt()
  .setExpirationTime("7d")
  .sign(new TextEncoder().encode(secret));

const loaded = await db.company.findUnique({
  where: { ownerId: user.id },
  include: { exporter: true, products: true },
});

console.log("USER_ID=" + user.id);
console.log("COMPANY=" + loaded.nameEn);
console.log("SECTORS=" + loaded.exporter.sectors);
console.log("PRODUCTS=" + loaded.products.length);
console.log("PASSWORD_OK=" + (await bcrypt.compare("password123", user.passwordHash)));
console.log("COOKIE=sbg_session=" + token);

await db.$disconnect();
