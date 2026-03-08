import { PrismaClient, ProductType, ProductQuality } from "@prisma/client";

const prisma = new PrismaClient();

// Device data: [name, basePrice]
const devices: [string, number][] = [
  // Motorola
  ["Motorola E5 / G6 Play", 17500],
  ["Motorola E6 Plus", 16750],
  ["Motorola E6 Play", 17334],
  ["Motorola E6i / E6s", 20125],
  ["Motorola E7 / E7i Power", 19500],
  ["Motorola E7", 21625],
  ["Motorola E7 Plus / G9 Play", 20600],
  ["Motorola E13", 20700],
  ["Motorola E20", 22100],
  ["Motorola E22 / E22i", 21750],
  ["Motorola E32", 24000],
  ["Motorola G22", 20215],
  ["Motorola E40 / E30", 21000],
  ["Motorola One Hyper", 19500],
  ["Motorola One Fusion", 19000],
  ["Motorola G6 Plus", 23000],
  ["Motorola G7 Play", 16834],
  ["Motorola G7 / G7 Plus", 19500],
  ["Motorola G7 Power", 17000],
  ["Motorola G8", 24000],
  ["Motorola G8 Plus", 20500],
  ["Motorola G8 Play / One Macro", 16000],
  ["Motorola G8 Power", 23000],
  ["Motorola G8 Power Lite", 20667],
  ["Motorola G9 Plus", 24334],
  ["Motorola G9 Power", 22000],
  ["Motorola G04 / G04s / G24 / G24 Power / E14", 22056],
  ["Motorola G05 / E15 / G15", 24250],
  ["Motorola G10 / G20 / G30", 19563],
  ["Motorola G13 / G23 / G34 / G45 / G53", 22417],
  ["Motorola G14 / G54", 25929],
  ["Motorola G31 / G41 / G71", 52750],
  ["Motorola G32", 31000],
  ["Motorola G35", 28500],
  ["Motorola G42", 38250],
  ["Motorola G50 5G", 30000],
  ["Motorola G52 / G72 / G82 / Edge 30", 77834],
  ["Motorola G60s / G51 / G60 / G40", 28429],
  ["Motorola G75 5G / G Power", 33334],
  ["Motorola G84", 68700],
  ["Motorola G200", 41334],
  ["Motorola Edge Original", 131000],
  ["Motorola Edge 20 Lite / Edge 20 Fusion", 78000],
  ["Motorola Edge 20 Pro / 30 Pro", 63667],
  ["Motorola Edge 30 Neo", 101667],
  ["Motorola Edge 30 Fusion", 108250],
  ["Motorola Edge 40 / 40 Neo", 93667],
  ["Motorola Edge 40 Pro", 153000],
  ["Motorola Edge 50 / 50 Pro", 88667],
  ["Motorola Edge 50 Fusion / G85", 90000],
  ["Motorola Edge 50 Ultra", 134000],
  ["Motorola Edge 50 Neo", 107000],
  // iPhone
  ["iPhone 6 / 6s / 6 Plus / 6s Plus", 17800],
  ["iPhone 7", 19250],
  ["iPhone 7 Plus", 25000],
  ["iPhone 8 / SE (2020)", 20500],
  ["iPhone 8 Plus", 25667],
  ["iPhone X", 43667],
  ["iPhone Xr", 37667],
  ["iPhone Xs", 58334],
  ["iPhone Xs Max", 49667],
  ["iPhone 11", 39400],
  ["iPhone 11 Pro", 60000],
  ["iPhone 11 Pro Max", 81600],
  ["iPhone 12 Mini", 112000],
  ["iPhone 12 / 12 Pro", 68715],
  ["iPhone 12 Pro Max", 116800],
  ["iPhone 13", 105143],
  ["iPhone 13 Mini", 133667],
  ["iPhone 13 Pro", 116572],
  ["iPhone 13 Pro Max", 127572],
  ["iPhone 14", 95400],
  ["iPhone 14 Plus", 124500],
  ["iPhone 14 Pro", 229750],
  ["iPhone 14 Pro Max", 349000],
  ["iPhone 15", 135500],
  ["iPhone 15 Pro", 274750],
  ["iPhone 15 Plus", 129000],
  ["iPhone 15 Pro Max", 351000],
  ["iPhone 16", 253667],
  ["iPhone 16 Pro", 591000],
  ["iPhone 16 Pro Max", 762000],
  ["iPhone 16 Plus", 417500],
  ["iPhone 16E", 135000],
  // Xiaomi / Poco / Redmi / Realme
  ["Xiaomi Note 7", 18500],
  ["Xiaomi Note 8", 22500],
  ["Xiaomi Note 8 Pro", 28500],
  ["Xiaomi Note 9 / Redmi 10 4G", 20334],
  ["Xiaomi Note 9s / 9 Pro", 25750],
  ["Xiaomi Note 9T", 25000],
  ["Xiaomi Note 10 4G / Note 10s", 47000],
  ["Xiaomi Note 10 Pro / 11 Pro / 12 Pro / X4 Pro 4G", 60000],
  ["Xiaomi Note 10 5G / Poco M3 Pro 5G", 24500],
  ["Xiaomi Note 11 / 11s / 12s / M4 Pro 4G", 52834],
  ["Xiaomi Note 11 T / 11 5G / M4 Pro 5G", 30000],
  ["Xiaomi Note 12 4G / 5G", 43000],
  ["Xiaomi Note 12 Pro 5G / Pro Plus / Poco X5 Pro", 56000],
  ["Xiaomi Note 13 4G / Redmi 14", 83400],
  ["Xiaomi Note 13 5G", 46800],
  ["Xiaomi Note 13 Pro 4G / M6 Pro 4G", 62750],
  ["Xiaomi Note 13 Pro 5G / Poco X6 5G", 42667],
  ["Xiaomi Note 14 5G / Poco M7 Pro", 82334],
  ["Xiaomi Note 14 Pro 5G / 14 Pro Plus / Poco X7 / 13 Pro Plus", 74417],
  ["Xiaomi Redmi A1 / A2 / Poco C50", 22834],
  ["Xiaomi Redmi A3 / Poco C61", 27500],
  ["Xiaomi Redmi A3 Pro / 14C / Poco C71 / Poco C75", 30000],
  ["Xiaomi Redmi A5 / Poco C71 5G", 32000],
  ["Xiaomi Redmi 8 / 8A", 18000],
  ["Xiaomi Redmi 9 / M2", 27667],
  ["Xiaomi Redmi 9T / Poco M3", 28000],
  ["Xiaomi Redmi 9A / 9C / 10A", 20500],
  ["Xiaomi Redmi 10 / 11 4G", 29000],
  ["Xiaomi Redmi 10c / Poco C40", 21334],
  ["Xiaomi Redmi 12 / 13 4G / Poco M6 Pro 5G", 28000],
  ["Xiaomi Redmi 12C / Poco C55", 18500],
  ["Xiaomi Redmi 13C / C65 / M6 5G", 23167],
  ["Xiaomi Redmi 14T / 14T Pro / K70 Ultra", 70000],
  ["Xiaomi Mi 8 Lite", 23000],
  ["Xiaomi Mi 9 SE", 31000],
  ["Xiaomi Mi 9T / 9T Pro", 52667],
  ["Xiaomi Mi 11 T / 11 T Pro", 73000],
  ["Xiaomi Poco X3 / X3 Pro", 45000],
  ["Xiaomi Poco X3 GT / Note 10 Pro 5G", 28000],
  ["Xiaomi Poco X6 Pro / F6 / Turbo 3 / K70E", 80000],
  ["Xiaomi Poco X7 Pro", 145000],
  ["Realme 50 / Note 50 / C51 / C53", 35000],
  ["Realme C35", 29000],
  ["Realme C61 / C60", 27000],
  ["Realme C75", 30000],
  // TCL / Alcatel
  ["TCL 20Y / 20E / 3H / 5H / 3L", 21500],
  ["TCL L10 / 10 Lite / 10 Plus", 25000],
  ["TCL 10SE / C7 / 3X-5X", 20000],
  ["TCL 20B", 23000],
  ["TCL 20SE", 22000],
  ["TCL 30SE / 30E / 305 / 206 / 3H Plus / 5H Plus", 24334],
  ["TCL 30 / 30 Plus / 30 5G", 64000],
  ["TCL 403 / T431a", 30000],
  ["TCL 405 / 408", 28500],
  ["TCL 501", 37000],
  ["TCL 503", 28000],
  ["TCL 505 / 509", 34667],
  ["TCL 40SE", 23000],
  ["TCL 40 Nxtpaper", 30000],
  ["TCL 50 Pro", 31000],
  ["TCL L9s / 1V", 27500],
  ["Alcatel 1s (2020 / 2021)", 23000],
  ["Alcatel 1 Ultra", 20000],
  // ZTE / Nubia
  ["ZTE V30 Vita", 30000],
  ["ZTE V40 Design", 30000],
  ["ZTE V50 Design", 31000],
  ["ZTE V53 Plus Vita / A53", 27000],
  ["ZTE V60 Smart-Design", 25500],
  ["ZTE V60 Axon Blade", 33000],
  ["ZTE Blade A31 / A31 Plus", 25000],
  ["ZTE Blade A34 / A54 / Hot 30i", 26334],
  ["ZTE Blade A35 / A55 5G", 38000],
  ["ZTE Blade A51 / A71 / Blade V30", 25250],
  ["ZTE Blade A52", 33000],
  ["ZTE Blade A72 / V40 Vita / V40 Smart", 25000],
  ["ZTE Blade A73 / V50 Smart", 27500],
  ["ZTE Blade A75 / Focus / Music", 30625],
  ["ZTE Focus Pro / Nubia Neo 2 5G", 49000],
  ["ZTE Nubia Neo 5G", 27000],
  // Tecno Spark / Infinix
  ["Tecno Go 2022", 18000],
  ["Tecno Go 2023 / 10 / 10c / Pop 7", 30500],
  ["Tecno Go 2024", 24500],
  ["Tecno 20 / 20C / Hot 40i / Smart 8", 26000],
  ["Tecno 30c / Go 1 / Hot 50i / Smart 9", 33000],
  ["Tecno 30 Pro / Hot 50 Pro / Spark 30 Pro", 79000],
  ["Tecno 10 Pro / 20 Pro / Hot 30 / Hot 40 / Pova 5", 30334],
  ["Tecno Pova 6", 49500],
  ["Infinix 50 4G", 39000],
  ["Infinix Hot 50", 36000],
  ["Infinix GT 20 Pro / Note 40", 180000],
  // LG
  ["LG K22 / K22 Plus", 21000],
  ["LG K40", 28000],
  ["LG K40s", 19500],
  ["LG K41", 23000],
  ["LG K41s", 26000],
  ["LG K42 / K52 / K62", 23000],
  ["LG K50 / Q60", 24000],
  ["LG K50s", 23000],
  ["LG K51", 23000],
  ["LG K51s", 24000],
  ["LG K61", 21000],
  ["LG K71", 49500],
];

async function main() {
  console.log("Start production seeding...");

  // Get existing admin user
  const empresaAdmin = await prisma.user.findUnique({
    where: { username: "admin" },
  });

  if (!empresaAdmin) {
    console.error("Admin user not found. Run 'pnpm seed' first.");
    process.exit(1);
  }

  console.log(`Using admin user: ${empresaAdmin.username}`);

  // Create all devices
  console.log(`Creating ${devices.length} devices...`);

  let created = 0;
  let updated = 0;

  for (const [name, basePrice] of devices) {
    const cost = basePrice * 2;        // cost = price + 100%
    const cash = cost * 2;             // cash = cost + 100%
    const credit = cash * 1.4;         // credit = cash + 40%

    const existingProduct = await prisma.producto.findFirst({
      where: { name },
    });

    if (existingProduct) {
      await prisma.producto.update({
        where: { id: existingProduct.id },
        data: {
          cost,
          cash,
          credit,
        },
      });
      updated++;
    } else {
      await prisma.producto.create({
        data: {
          name,
          type: ProductType.MODULO,
          quality: ProductQuality.OLED,
          available: true,
          cost,
          cash,
          credit,
          companyId: empresaAdmin.id,
        },
      });
      created++;
    }
  }

  console.log(`Seeding finished. Created: ${created}, Updated: ${updated}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
