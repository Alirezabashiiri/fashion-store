// Seed script for لوکسا (Luxa) Phase 2 backend.
// Run: bun run scripts/seed.ts
import { db } from "../src/lib/db";

const COLORS = [
  { name: "مشکی", hex: "#1a1a1a" },
  { name: "سرمه‌ای", hex: "#2b2f3a" },
  { name: "بژ", hex: "#d8c4a0" },
  { name: "کرم", hex: "#f3ece1" },
  { name: "سفید", hex: "#ffffff" },
  { name: "قهوه‌ای", hex: "#6b4423" },
  { name: "طلایی", hex: "#c19a6b" },
  { name: "قرمز", hex: "#c0392b" },
  { name: "خاکستری", hex: "#8a8a8a" },
  { name: "جلگه‌ای", hex: "#4a6b8a" },
  { name: "سرخابی", hex: "#e8b4c8" },
  { name: "طلایی روشن", hex: "#d4af37" },
];

interface SeedProduct {
  id: string;
  name: string;
  nameEn: string;
  brand: string;
  sku: string;
  categorySlug: string;
  price: number;
  oldPrice?: number;
  image: string;
  hoverImage: string;
  colors: { name: string; hex: string }[];
  sizes: string[];
  outOfStockSizes?: string[];
  rating: number;
  reviewCount: number;
  description: string;
  specs: string;
  isNew?: boolean;
  isBestseller?: boolean;
  isSpecial?: boolean;
}

const SEED_PRODUCTS: SeedProduct[] = [
  {
    id: "p1",
    name: "پالتو پشمی زنانه مدل بژ",
    nameEn: "Women's Beige Wool Trench Coat",
    brand: "آریانا",
    sku: "LX-WC-1001",
    categorySlug: "women-cloth",
    price: 2890000,
    oldPrice: 3890000,
    image: "/images/p-wcoat.png",
    hoverImage: "/images/cat-coat.png",
    colors: [COLORS[2], COLORS[1], COLORS[3]],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    outOfStockSizes: ["XS"],
    rating: 4.8,
    reviewCount: 124,
    description:
      "پالتوی پشمی زنانه با طراحی مینیمال و دوخت دقیق، از پارچه پشم مرغوب با آستر حریری. مناسب برای فصل پاییز و زمستان، با قد استاندارد و یقه انگلیسی.",
    specs: "جنس پارچه: پشم مرغوب ۸۰٪ + ویسکوز ۲۰٪ | نوع یقه: انگلیسی | قد: ۱۰۵ سانتی‌متر | شستشو: خشک‌شویی",
    isNew: true,
    isBestseller: true,
  },
  {
    id: "p2",
    name: "میدی بلک پارچه حریر زنانه",
    nameEn: "Women's Black Silk Midi Dress",
    brand: "لوکسا پریمیوم",
    sku: "LX-WD-2002",
    categorySlug: "women-cloth",
    price: 1490000,
    image: "/images/p-wdress.png",
    hoverImage: "/images/cat-coat.png",
    colors: [COLORS[0], COLORS[7], COLORS[9]],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    rating: 4.6,
    reviewCount: 87,
    description:
      "میدی‌پیراهن حریر با برش مدرن و افتادگی زیبا، مناسب مجالس و قرارهای رسمی. پارچه ضدچروک با حس نرم و لوکس.",
    specs: "جنس پارچه: حریر مصنوعی | نوع یقه: V شکل | قد: ۱۲۰ سانتی‌متر | شستشو: دستی ۳۰ درجه",
    isSpecial: true,
  },
  {
    id: "p3",
    name: "بلوز حریر زنانه مدل سفید",
    nameEn: "Women's White Silk Blouse",
    brand: "مودرن استایل",
    sku: "LX-WB-3003",
    categorySlug: "women-cloth",
    price: 890000,
    oldPrice: 1190000,
    image: "/images/p-wblouse.png",
    hoverImage: "/images/cat-coat.png",
    colors: [COLORS[4], COLORS[3], COLORS[10]],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    rating: 4.4,
    reviewCount: 56,
    description: "بلوز حریر با طراحی شیک و آستین ساییده، مناسب ست کردن با شلوار رسمی یا دامن. پارچه تنفس‌پذیر و نرم.",
    specs: "جنس پارچه: حریر ۱۰۰٪ | نوع یقه: گرد | قد: ۶۲ سانتی‌متر | شستشو: دستی",
    isBestseller: true,
  },
  {
    id: "p4",
    name: "کفش پاشنه‌دار زنانه چرم طبیعی",
    nameEn: "Women's Beige Suede Heels",
    brand: "آریانا",
    sku: "LX-WS-4004",
    categorySlug: "women-shoes",
    price: 1690000,
    image: "/images/p-wheels.png",
    hoverImage: "/images/cat-sneakers.png",
    colors: [COLORS[2], COLORS[0], COLORS[7]],
    sizes: ["38", "39", "40", "41", "42", "43", "44"],
    outOfStockSizes: ["38", "44"],
    rating: 4.5,
    reviewCount: 41,
    description: "کفش پاشنه‌دار با چرم طبیعی و پاشنه ۷ سانت، مناسب مجالس و محل کار. کفی نرم و ضدلغزش.",
    specs: "جنس رویه: چرم طبیعی | ارتفاع پاشنه: ۷ سانتی‌متر | کفی: ژله‌ای نرم | ساخت: ایران",
  },
  {
    id: "p5",
    name: "کتانی اسپرت چرم زنانه سفید",
    nameEn: "Women's White Leather Sneakers",
    brand: "اوربیت",
    sku: "LX-WS-5005",
    categorySlug: "women-shoes",
    price: 1290000,
    oldPrice: 1790000,
    image: "/images/p-sneaker-w.png",
    hoverImage: "/images/cat-sneakers.png",
    colors: [COLORS[4], COLORS[2]],
    sizes: ["38", "39", "40", "41", "42", "43", "44"],
    rating: 4.7,
    reviewCount: 203,
    description: "کتانی اسپرت چرمی با طراحی مینیمال، سبک و راحت برای استفاده روزمره. کفی آناتومیک و رویه چرم طبیعی.",
    specs: "جنس رویه: چرم طبیعی | کفی: آناتومیک حافظه‌دار | بیرونی: لاستیک سبک | وزن: ۲۸۰ گرم",
    isSpecial: true,
    isBestseller: true,
  },
  {
    id: "p6",
    name: "کیف دستی چرم زنانه مدل تان",
    nameEn: "Women's Tan Leather Handbag",
    brand: "وینتیج",
    sku: "LX-WG-6006",
    categorySlug: "women-bag",
    price: 1890000,
    image: "/images/p-handbag.png",
    hoverImage: "/images/cat-bag.png",
    colors: [COLORS[6], COLORS[0], COLORS[5]],
    sizes: ["ONE"],
    rating: 4.9,
    reviewCount: 156,
    description: "کیف دستی چرمی با طراحی کلاسیک و فضای داخلی جادار، مناسب استفاده روزمره و رسمی. چرم طبیعی با دوخت تقویت‌شده.",
    specs: "جنس: چرم طبیعی | ابعاد: ۲۸×۲۰×۱۲ | بند: قابل تنظیم چرمی | ۳ جیب داخلی + ۱ زیپ‌دار",
    isBestseller: true,
  },
  {
    id: "p7",
    name: "ساعت مچی لوکس چرمی طلایی",
    nameEn: "Luxury Gold Leather Strap Watch",
    brand: "اتلیه",
    sku: "LX-AC-7007",
    categorySlug: "women-accessory",
    price: 2390000,
    oldPrice: 2990000,
    image: "/images/p-watch-gold.png",
    hoverImage: "/images/cat-watch.png",
    colors: [COLORS[11], COLORS[5]],
    sizes: ["ONE"],
    rating: 4.8,
    reviewCount: 98,
    description: "ساعت مچی لوکس با قاب طلایی و بند چرمی، طراحی مینیمال و شیک. ضدآب تا ۳ ATM و شیشه معدنی ضدخش.",
    specs: "نوع حرکت: کوارتز | جنس قاب: استیل طلایی | بند: چرم طبیعی | شیشه: معدنی ضدخش | ضدآب: ۳ ATM",
    isSpecial: true,
  },
  {
    id: "p8",
    name: "گوشواره حلقه‌ای طلایی",
    nameEn: "Gold Hoop Earrings",
    brand: "لوکسا پریمیوم",
    sku: "LX-JW-8008",
    categorySlug: "women-jewelry",
    price: 690000,
    oldPrice: 890000,
    image: "/images/p-earrings.png",
    hoverImage: "/images/cat-jewelry.png",
    colors: [COLORS[11]],
    sizes: ["ONE"],
    rating: 4.6,
    reviewCount: 67,
    description: "گوشواره حلقه‌ای طلایی با طراحی مینیمال، مناسب استفاده روزمره و رسمی. بدون نیکل و ضدحساسیت.",
    specs: "جنس: طلای ۱۸ عیار روکش | قطر: ۳ سانتی‌متر | بست: ایمنی هنگینگ | ضدحساسیت: بله",
    isSpecial: true,
  },
  {
    id: "p9",
    name: "پیراهن مردانه کتان سفید",
    nameEn: "Men's White Cotton Dress Shirt",
    brand: "کلاسیک‌هوم",
    sku: "LX-MC-9009",
    categorySlug: "men-cloth",
    price: 990000,
    image: "/images/p-mshirt.png",
    hoverImage: "/images/cat-coat.png",
    colors: [COLORS[4], COLORS[3], COLORS[9]],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    rating: 4.5,
    reviewCount: 78,
    description: "پیراهن مردانه کتان با دوخت دقیق و یقه رسمی، مناسب محل کار و قرارهای رسمی. پارچه ضدچروک و تنفس‌پذیر.",
    specs: "جنس پارچه: کتان ۱۰۰٪ | نوع یقه: کلاسیک | قد: ۷۸ سانتی‌متر | شستشو: ۳۰ درجه ماشین",
    isNew: true,
  },
  {
    id: "p10",
    name: "ژاکت جین مردانه مدل تیره",
    nameEn: "Men's Dark Denim Jacket",
    brand: "نیوفیشن",
    sku: "LX-MC-1010",
    categorySlug: "men-cloth",
    price: 1390000,
    oldPrice: 1790000,
    image: "/images/p-mjacket.png",
    hoverImage: "/images/cat-coat.png",
    colors: [COLORS[9], COLORS[0]],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    outOfStockSizes: ["S"],
    rating: 4.4,
    reviewCount: 45,
    description: "ژاکت جین مردانه با پارچه جین نرم و برش مدرن، مناسب استایل کژوال. جیب‌های کاربردی و دوخت تقویت‌شده.",
    specs: "جنس پارچه: جین ۹۸٪ + الاستن ۲٪ | نوع یقه: چرخانی | قد: ۶۸ سانتی‌متر | شستشو: دست‌شویی سرد",
    isSpecial: true,
  },
  {
    id: "p11",
    name: "کفش رسمی مردانه چرم قهوه‌ای",
    nameEn: "Men's Brown Leather Oxford Shoes",
    brand: "کلاسیک‌هوم",
    sku: "LX-MS-1111",
    categorySlug: "men-shoes",
    price: 1890000,
    image: "/images/p-mshoes.png",
    hoverImage: "/images/cat-sneakers.png",
    colors: [COLORS[5], COLORS[0]],
    sizes: ["38", "39", "40", "41", "42", "43", "44"],
    outOfStockSizes: ["39"],
    rating: 4.7,
    reviewCount: 112,
    description: "کفش رسمی مردانه آکسفورد با چرم طبیعی و دوخت دستی، مناسب مجالس و محل کار. کفی چرمی و بیرونی چوب‌پنبه‌ای.",
    specs: "جنس رویه: چرم طبیعی | دوخت: دستی Goodyear | کفی: چرمی | بیرونی: چوب‌پنبه + لاستیک",
    isBestseller: true,
  },
  {
    id: "p12",
    name: "کتانی اسپرت مردانه چرمی",
    nameEn: "Men's White Leather Sneakers",
    brand: "اوربیت",
    sku: "LX-MS-1212",
    categorySlug: "men-shoes",
    price: 1490000,
    oldPrice: 1990000,
    image: "/images/p-sneaker-w.png",
    hoverImage: "/images/cat-sneakers.png",
    colors: [COLORS[4], COLORS[8]],
    sizes: ["38", "39", "40", "41", "42", "43", "44"],
    rating: 4.6,
    reviewCount: 134,
    description: "کتانی اسپرت مردانه با رویه چرمی و طراحی مینیمال، سبک و راحت برای استفاده روزانه.",
    specs: "جنس رویه: چرم طبیعی | کفی: آناتومیک | بیرونی: TPR سبک | وزن: ۳۲۰ گرم",
    isSpecial: true,
  },
  {
    id: "p13",
    name: "کیف پول مردانه چرم قهوه‌ای",
    nameEn: "Men's Brown Leather Bifold Wallet",
    brand: "وینتیج",
    sku: "LX-MB-1313",
    categorySlug: "men-bag",
    price: 590000,
    image: "/images/p-mwallet.png",
    hoverImage: "/images/cat-bag.png",
    colors: [COLORS[5], COLORS[0]],
    sizes: ["ONE"],
    rating: 4.8,
    reviewCount: 89,
    description: "کیف پول مردانه دوخم با چرم طبیعی، دارای ۸ جای کارت و جیب زیپ‌دار. طراحی شیک و جمع‌وجور.",
    specs: "جنس: چرم طبیعی | نوع: دوخم Bifold | ابعاد: ۱۱×۹ | جای کارت: ۸ عدد",
  },
  {
    id: "p14",
    name: "کمربند چرمی مردانه مشکی",
    nameEn: "Men's Black Leather Belt",
    brand: "کلاسیک‌هوم",
    sku: "LX-AC-1414",
    categorySlug: "men-accessory",
    price: 390000,
    oldPrice: 490000,
    image: "/images/p-belt.png",
    hoverImage: "/images/cat-watch.png",
    colors: [COLORS[0], COLORS[5]],
    sizes: ["85", "90", "95", "100", "105"],
    rating: 4.5,
    reviewCount: 54,
    description: "کمربند چرمی مردانه با سگک استیل ضدزنگ، چرم طبیعی مرغوب و دوخت تقویت‌شده. قابل تنظیم در چند سایز.",
    specs: "جنس: چرم طبیعی | سگک: استیل ضدزنگ | عرض: ۳.۵ سانتی‌متر",
    isSpecial: true,
  },
  {
    id: "p15",
    name: "ساعت مچی مردانه چرمی کلاسیک",
    nameEn: "Men's Classic Leather Strap Watch",
    brand: "اتلیه",
    sku: "LX-AC-1515",
    categorySlug: "men-accessory",
    price: 1990000,
    image: "/images/p-watch-gold.png",
    hoverImage: "/images/cat-watch.png",
    colors: [COLORS[11], COLORS[1]],
    sizes: ["ONE"],
    rating: 4.7,
    reviewCount: 76,
    description: "ساعت مچی مردانه کلاسیک با قاب طلایی و بند چرمی، طراحی شیک و رسمی. ضدآب و شیشه معدنی ضدخش.",
    specs: "نوع حرکت: کوارتز | جنس قاب: استیل طلایی | بند: چرم طبیعی | شیشه: معدنی ضدخش | ضدآب: ۳ ATM",
    isBestseller: true,
  },
  {
    id: "p16",
    name: "پیراهن دخترانه طرح گل",
    nameEn: "Girls' Floral Summer Dress",
    brand: "نیوفیشن",
    sku: "LX-KG-1616",
    categorySlug: "kids-girl",
    price: 590000,
    oldPrice: 790000,
    image: "/images/p-kdress.png",
    hoverImage: "/images/cat-coat.png",
    colors: [COLORS[10], COLORS[3]],
    sizes: ["100", "110", "120", "130", "140"],
    rating: 4.6,
    reviewCount: 33,
    description: "پیراهن دخترانه طرح گل با پارچه نرم و تنفس‌پذیر، مناسب فصل بهار و تابستان. راحت و شیک.",
    specs: "جنس پارچه: نخ پنبه ۱۰۰٪ | نوع یقه: گرد | شستشو: ۳۰ درجه ماشین",
    isSpecial: true,
  },
];

const CATEGORIES = [
  // top-level
  { title: "زنانه", slug: "women", image: "/images/cat-coat.png", parent: null },
  { title: "مردانه", slug: "men", image: "/images/cat-coat.png", parent: null },
  { title: "بچه‌گانه", slug: "kids", image: "/images/p-kdress.png", parent: null },
  // women sub
  { title: "لباس زنانه", slug: "women-cloth", image: "/images/cat-coat.png", parent: "women" },
  { title: "کفش زنانه", slug: "women-shoes", image: "/images/cat-sneakers.png", parent: "women" },
  { title: "کیف زنانه", slug: "women-bag", image: "/images/cat-bag.png", parent: "women" },
  { title: "اکسسوری زنانه", slug: "women-accessory", image: "/images/cat-watch.png", parent: "women" },
  { title: "زیورآلات", slug: "women-jewelry", image: "/images/cat-jewelry.png", parent: "women" },
  // men sub
  { title: "لباس مردانه", slug: "men-cloth", image: "/images/cat-coat.png", parent: "men" },
  { title: "کفش مردانه", slug: "men-shoes", image: "/images/p-mshoes.png", parent: "men" },
  { title: "کیف مردانه", slug: "men-bag", image: "/images/p-mwallet.png", parent: "men" },
  { title: "اکسسوری مردانه", slug: "men-accessory", image: "/images/p-belt.png", parent: "men" },
  // kids sub
  { title: "دخترانه", slug: "kids-girl", image: "/images/p-kdress.png", parent: "kids" },
];

const BRANDS = [
  { name: "آریانا", nameEn: "ARIANA", logoText: "ARIANA" },
  { name: "نیوفیشن", nameEn: "NEUFASHION", logoText: "NEU" },
  { name: "لوکسا پریمیوم", nameEn: "LUXA PREMIUM", logoText: "LUXA" },
  { name: "کلاسیک‌هوم", nameEn: "CLASSIC HOME", logoText: "CLASSIC" },
  { name: "مودرن استایل", nameEn: "MODERN STYLE", logoText: "MODERN" },
  { name: "اوربیت", nameEn: "ORBIT", logoText: "ORBIT" },
  { name: "وینتیج", nameEn: "VINTAGE", logoText: "VINTAGE" },
  { name: "اتلیه", nameEn: "ATELIER", logoText: "ATELIER" },
];

async function main() {
  console.log("🌱 Seeding Luxa database...");

  // Wipe (order matters due to FKs)
  await db.transaction.deleteMany();
  await db.orderItem.deleteMany();
  await db.order.deleteMany();
  await db.cartItem.deleteMany();
  await db.cart.deleteMany();
  await db.productVariant.deleteMany();
  await db.product.deleteMany();
  await db.brand.deleteMany();
  await db.category.deleteMany();
  await db.address.deleteMany();
  await db.session.deleteMany();
  await db.otpCode.deleteMany();
  await db.discountCode.deleteMany();
  await db.user.deleteMany();

  // Categories (with tree)
  const catMap = new Map<string, string>();
  for (const c of CATEGORIES) {
    const parentId = c.parent ? catMap.get(c.parent) ?? null : null;
    const created = await db.category.create({
      data: { title: c.title, slug: c.slug, image: c.image, parentId },
    });
    catMap.set(c.slug, created.id);
  }
  console.log(`  ✓ ${CATEGORIES.length} categories`);

  // Brands
  for (const b of BRANDS) {
    await db.brand.create({ data: b });
  }
  console.log(`  ✓ ${BRANDS.length} brands`);

  // Products + variants
  let variantCount = 0;
  for (const p of SEED_PRODUCTS) {
    const brand = await db.brand.findUnique({ where: { name: p.brand } });
    const categoryId = catMap.get(p.categorySlug) ?? null;
    const out = p.outOfStockSizes ?? [];

    const product = await db.product.create({
      data: {
        id: p.id,
        name: p.name,
        nameEn: p.nameEn,
        slug: p.id,
        sku: p.sku,
        brandId: brand?.id ?? null,
        categoryId,
        description: p.description,
        price: p.price,
        oldPrice: p.oldPrice ?? null,
        image: p.image,
        hoverImage: p.hoverImage,
        rating: p.rating,
        reviewCount: p.reviewCount,
        isNew: !!p.isNew,
        isBestseller: !!p.isBestseller,
        isSpecial: !!p.isSpecial,
        isActive: true,
      },
    });

    for (const color of p.colors) {
      for (const size of p.sizes) {
        const soldOut = out.includes(size);
        const stock = soldOut ? 0 : Math.floor(Math.random() * 12) + 3;
        await db.productVariant.create({
          data: {
            productId: product.id,
            colorName: color.name,
            colorHex: color.hex,
            size,
            stock,
            price: null,
          },
        });
        variantCount++;
      }
    }
  }
  console.log(`  ✓ ${SEED_PRODUCTS.length} products, ${variantCount} variants`);

  // Admin user + regular demo user
  await db.user.create({
    data: {
      phone: "09000000000",
      fullName: "مدیر لوکسا",
      firstName: "مدیر",
      lastName: "لوکسا",
      isStaff: true,
      isSuperuser: true,
    },
  });
  await db.user.create({
    data: {
      phone: "09120000000",
      fullName: "کاربر لوکسا",
      firstName: "کاربر",
      lastName: "لوکسا",
    },
  });
  console.log("  ✓ 2 users (admin + demo)");

  // Address for demo user
  const demoUser = await db.user.findUnique({ where: { phone: "09120000000" } });
  if (demoUser) {
    await db.address.create({
      data: {
        userId: demoUser.id,
        recipient: "کاربر لوکسا",
        phone: "09120000000",
        province: "تهران",
        city: "تهران",
        postal: "1234567890",
        detail: "خیابان ولیعصر، نرسیده به پارک‌وی، پلاک ۱۲۰، واحد ۳",
        isDefault: true,
      },
    });
    console.log("  ✓ demo address");
  }

  // Discount codes
  await db.discountCode.create({ data: { code: "LUXA10", type: "percent", value: 10, isActive: true } });
  await db.discountCode.create({ data: { code: "WELCOME15", type: "percent", value: 15, isActive: true } });
  await db.discountCode.create({ data: { code: "FEST20", type: "percent", value: 20, isActive: true } });
  await db.discountCode.create({ data: { code: "FLAT50", type: "fixed", value: 50000, isActive: true, minSubtotal: 500000 } });
  console.log("  ✓ 4 discount codes");

  // Demo orders
  if (demoUser) {
    const addr = await db.address.findFirst({ where: { userId: demoUser.id } });
    const o1 = await db.order.create({
      data: {
        code: "LX-10234",
        userId: demoUser.id,
        addressId: addr?.id,
        addressSnapshot: addr ? JSON.stringify({ recipient: addr.recipient, phone: addr.phone, province: addr.province, city: addr.city, detail: addr.detail, postal: addr.postal }) : null,
        subtotal: 4380000,
        shipping: 0,
        total: 4380000,
        status: "delivered",
        shippingMethod: "post",
        createdAt: new Date(Date.now() - 86400000 * 20),
      },
    });
    await db.transaction.create({
      data: { orderId: o1.id, authority: "DEMO-AUTH-1", refId: "100200300", amount: 4380000, status: "verified", gateway: "shaparak" },
    });

    const o2 = await db.order.create({
      data: {
        code: "LX-10501",
        userId: demoUser.id,
        addressId: addr?.id,
        addressSnapshot: addr ? JSON.stringify({ recipient: addr.recipient, phone: addr.phone, province: addr.province, city: addr.city, detail: addr.detail, postal: addr.postal }) : null,
        subtotal: 1890000,
        shipping: 0,
        total: 1890000,
        status: "shipped",
        shippingMethod: "post",
        trackingCode: "IR-777888",
        createdAt: new Date(Date.now() - 86400000 * 5),
      },
    });
    await db.transaction.create({
      data: { orderId: o2.id, authority: "DEMO-AUTH-2", refId: "100200301", amount: 1890000, status: "verified", gateway: "shaparak" },
    });
    console.log("  ✓ 2 demo orders");
  }

  console.log("✅ Seed complete!");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
