// Sample catalog data for لوکسا (Luxa) store.
// Images live in /public/images and are referenced via absolute "/images/..." paths.

export type View =
  | "home"
  | "plp"
  | "pdp"
  | "cart"
  | "checkout"
  | "auth"
  | "dashboard"
  | "admin"
  | "payment-result";

export interface ColorOption {
  name: string; // Persian name
  hex: string;
}

export interface ProductVariant {
  color: ColorOption;
  sizes: { label: string; inStock: boolean }[];
}

export interface Product {
  id: string;
  name: string;
  nameEn: string;
  brand: string;
  sku: string;
  category: "women" | "men" | "kids";
  subcategory: string;
  price: number; // toman
  originalPrice?: number; // when discounted
  image: string;
  hoverImage: string;
  colors: ColorOption[];
  sizes: string[];
  outOfStockSizes?: string[];
  rating: number;
  reviewCount: number;
  description: string;
  specs: { label: string; value: string }[];
  isNew?: boolean;
  isBestseller?: boolean;
  isSpecial?: boolean; // شگفت‌انگیز
}

export interface Category {
  id: string;
  title: string;
  slug: string;
  image: string;
  parent?: string;
}

export interface Brand {
  id: string;
  name: string;
  nameEn: string;
  logoText: string; // text-based logo
}

export const COLORS: Record<string, ColorOption> = {
  black: { name: "مشکی", hex: "#1a1a1a" },
  charcoal: { name: "سرمه‌ای", hex: "#2b2f3a" },
  beige: { name: "بژ", hex: "#d8c4a0" },
  cream: { name: "کرم", hex: "#f3ece1" },
  white: { name: "سفید", hex: "#ffffff" },
  brown: { name: "قهوه‌ای", hex: "#6b4423" },
  tan: { name: "طلایی", hex: "#c19a6b" },
  red: { name: "قرمز", hex: "#c0392b" },
  gray: { name: "خاکستری", hex: "#8a8a8a" },
  denim: { name: "جلگه‌ای", hex: "#4a6b8a" },
  pink: { name: "سرخابی", hex: "#e8b4c8" },
  gold: { name: "طلایی", hex: "#d4af37" },
};

export const ALL_SIZES_CLOTHES = ["XS", "S", "M", "L", "XL", "XXL"];
export const ALL_SIZES_SHOES = ["38", "39", "40", "41", "42", "43", "44"];

export const CATEGORIES: Category[] = [
  { id: "women-cloth", title: "لباس زنانه", slug: "women-cloth", image: "/images/cat-coat.png", parent: "women" },
  { id: "women-shoes", title: "کفش زنانه", slug: "women-shoes", image: "/images/cat-sneakers.png", parent: "women" },
  { id: "women-bag", title: "کیف زنانه", slug: "women-bag", image: "/images/cat-bag.png", parent: "women" },
  { id: "women-accessory", title: "اکسسوری زنانه", slug: "women-accessory", image: "/images/cat-watch.png", parent: "women" },
  { id: "women-jewelry", title: "زیورآلات", slug: "women-jewelry", image: "/images/cat-jewelry.png", parent: "women" },
  { id: "men-cloth", title: "لباس مردانه", slug: "men-cloth", image: "/images/cat-coat.png", parent: "men" },
  { id: "men-shoes", title: "کفش مردانه", slug: "men-shoes", image: "/images/p-mshoes.png", parent: "men" },
  { id: "men-bag", title: "کیف مردانه", slug: "men-bag", image: "/images/p-mwallet.png", parent: "men" },
  { id: "men-accessory", title: "اکسسوری مردانه", slug: "men-accessory", image: "/images/p-belt.png", parent: "men" },
  { id: "kids-girl", title: "دخترانه", slug: "kids-girl", image: "/images/p-kdress.png", parent: "kids" },
];

export const QUICK_CATEGORIES: Category[] = [
  { id: "qc1", title: "مانتو و پالتو", slug: "women-cloth", image: "/images/cat-coat.png" },
  { id: "qc2", title: "کتانی و اسپرت", slug: "women-shoes", image: "/images/cat-sneakers.png" },
  { id: "qc3", title: "ساعت", slug: "women-accessory", image: "/images/cat-watch.png" },
  { id: "qc4", title: "لباس ورزشی", slug: "men-cloth", image: "/images/cat-sport.png" },
  { id: "qc5", title: "کیف دستی", slug: "women-bag", image: "/images/cat-bag.png" },
  { id: "qc6", title: "زیورآلات", slug: "women-jewelry", image: "/images/cat-jewelry.png" },
];

export const BRANDS: Brand[] = [
  { id: "b1", name: "آریانا", nameEn: "ARIANA", logoText: "ARIANA" },
  { id: "b2", name: "نیوفیشن", nameEn: "NEUFASHION", logoText: "NEU" },
  { id: "b3", name: "لوکسا پریمیوم", nameEn: "LUXA PREMIUM", logoText: "LUXA" },
  { id: "b4", name: "کلاسیک‌هوم", nameEn: "CLASSIC HOME", logoText: "CLASSIC" },
  { id: "b5", name: "مودرن استایل", nameEn: "MODERN STYLE", logoText: "MODERN" },
  { id: "b6", name: "اوربیت", nameEn: "ORBIT", logoText: "ORBIT" },
  { id: "b7", name: "وینتیج", nameEn: "VINTAGE", logoText: "VINTAGE" },
  { id: "b8", name: "اتلیه", nameEn: "ATELIER", logoText: "ATELIER" },
];

export const PRODUCTS: Product[] = [
  {
    id: "p1",
    name: "پالتو پشمی زنانه مدل بژ",
    nameEn: "Women's Beige Wool Trench Coat",
    brand: "آریانا",
    sku: "LX-WC-1001",
    category: "women",
    subcategory: "women-cloth",
    price: 2890000,
    originalPrice: 3890000,
    image: "/images/p-wcoat.png",
    hoverImage: "/images/cat-coat.png",
    colors: [COLORS.beige, COLORS.charcoal, COLORS.cream],
    sizes: ALL_SIZES_CLOTHES,
    outOfStockSizes: ["XS"],
    rating: 4.8,
    reviewCount: 124,
    description:
      "پالتوی پشمی زنانه با طراحی مینیمال و دوخت دقیق، از پارچه پشم مرغوب با آستر حریری. مناسب برای فصل پاییز و زمستان، با قد استاندارد و یقه انگلیسی.",
    specs: [
      { label: "جنس پارچه", value: "پشم مرغوب ۸۰٪ + ویسکوز ۲۰٪" },
      { label: "نوع یقه", value: "یقه انگلیسی" },
      { label: "قد لباس", value: "۱۰۵ سانتی‌متر" },
      { label: "شستشو", value: "خشک‌شویی" },
      { label: "اتوکشی", value: "دمای متوسط" },
      { label: "آستر", value: "حریر نرم" },
    ],
    isNew: true,
    isBestseller: true,
  },
  {
    id: "p2",
    name: "میدی بلک پارچه حریر زنانه",
    nameEn: "Women's Black Silk Midi Dress",
    brand: "لوکسا پریمیوم",
    sku: "LX-WD-2002",
    category: "women",
    subcategory: "women-cloth",
    price: 1490000,
    image: "/images/p-wdress.png",
    hoverImage: "/images/cat-coat.png",
    colors: [COLORS.black, COLORS.red, COLORS.denim],
    sizes: ALL_SIZES_CLOTHES,
    rating: 4.6,
    reviewCount: 87,
    description:
      "میدی‌پیراهن حریر با برش مدرن و افتادگی زیبا، مناسب مجالس و قرارهای رسمی. پارچه ضدچروک با حس نرم و لوکس.",
    specs: [
      { label: "جنس پارچه", value: "حریر مصنوعی" },
      { label: "نوع یقه", value: "V شکل" },
      { label: "قد لباس", value: "۱۲۰ سانتی‌متر" },
      { label: "شستشو", value: "دستی / ۳۰ درجه" },
      { label: "اتوکشی", value: "دمای پایین" },
      { label: "آستر", value: "بدون آستر" },
    ],
    isSpecial: true,
  },
  {
    id: "p3",
    name: "بلوز حریر زنانه مدل سفید",
    nameEn: "Women's White Silk Blouse",
    brand: "مودرن استایل",
    sku: "LX-WB-3003",
    category: "women",
    subcategory: "women-cloth",
    price: 890000,
    originalPrice: 1190000,
    image: "/images/p-wblouse.png",
    hoverImage: "/images/cat-coat.png",
    colors: [COLORS.white, COLORS.cream, COLORS.pink],
    sizes: ALL_SIZES_CLOTHES,
    rating: 4.4,
    reviewCount: 56,
    description:
      "بلوز حریر با طراحی شیک و آستین ساییده، مناسب ست کردن با شلوار رسمی یا دامن. پارچه تنفس‌پذیر و نرم.",
    specs: [
      { label: "جنس پارچه", value: "حریر ۱۰۰٪" },
      { label: "نوع یقه", value: "گرد" },
      { label: "قد لباس", value: "۶۲ سانتی‌متر" },
      { label: "شستشو", value: "دستی" },
      { label: "اتوکشی", value: "دمای پایین" },
      { label: "آستر", value: "ندارد" },
    ],
    isBestseller: true,
  },
  {
    id: "p4",
    name: "کفش پاشنه‌دار زنانه چرم طبیعی",
    nameEn: "Women's Beige Suede Heels",
    brand: "آریانا",
    sku: "LX-WS-4004",
    category: "women",
    subcategory: "women-shoes",
    price: 1690000,
    image: "/images/p-wheels.png",
    hoverImage: "/images/cat-sneakers.png",
    colors: [COLORS.beige, COLORS.black, COLORS.red],
    sizes: ALL_SIZES_SHOES,
    outOfStockSizes: ["38", "44"],
    rating: 4.5,
    reviewCount: 41,
    description:
      "کفش پاشنه‌دار با چرم طبیعی و پاشنه ۷ سانت، مناسب مجالس و محل کار. کفی نرم و ضدلغزش.",
    specs: [
      { label: "جنس رویه", value: "چرم طبیعی" },
      { label: "ارتفاع پاشنه", value: "۷ سانتی‌متر" },
      { label: "نوع کفی", value: "ژله‌ای نرم" },
      { label: "بیرونی", value: "پلی‌اورتان ضدلغزش" },
      { label: "ساخت", value: "ایران" },
    ],
  },
  {
    id: "p5",
    name: "کتانی اسپرت چرم زنانه سفید",
    nameEn: "Women's White Leather Sneakers",
    brand: "اوربیت",
    sku: "LX-WS-5005",
    category: "women",
    subcategory: "women-shoes",
    price: 1290000,
    originalPrice: 1790000,
    image: "/images/p-sneaker-w.png",
    hoverImage: "/images/cat-sneakers.png",
    colors: [COLORS.white, COLORS.beige],
    sizes: ALL_SIZES_SHOES,
    rating: 4.7,
    reviewCount: 203,
    description:
      "کتانی اسپرت چرمی با طراحی مینیمال، سبک و راحت برای استفاده روزمره. کفی آناتومیک و رویه چرم طبیعی.",
    specs: [
      { label: "جنس رویه", value: "چرم طبیعی" },
      { label: "نوع کفی", value: "آناتومیک حافظه‌دار" },
      { label: "بیرونی", value: "لاستیک سبک" },
      { label: "وزن", value: "۲۸۰ گرم" },
      { label: "ساخت", value: "ایران" },
    ],
    isSpecial: true,
    isBestseller: true,
  },
  {
    id: "p6",
    name: "کیف دستی چرم زنانه مدل تان",
    nameEn: "Women's Tan Leather Handbag",
    brand: "وینتیج",
    sku: "LX-WG-6006",
    category: "women",
    subcategory: "women-bag",
    price: 1890000,
    image: "/images/p-handbag.png",
    hoverImage: "/images/cat-bag.png",
    colors: [COLORS.tan, COLORS.black, COLORS.brown],
    sizes: ["ONE"],
    rating: 4.9,
    reviewCount: 156,
    description:
      "کیف دستی چرمی با طراحی کلاسیک و فضای داخلی جادار، مناسب استفاده روزمره و رسمی. چرم طبیعی با دوخت تقویت‌شده.",
    specs: [
      { label: "جنس", value: "چرم طبیعی" },
      { label: "ابعاد", value: "۲۸×۲۰×۱۲ سانتی‌متر" },
      { label: "بند", value: "قابل تنظیم چرمی" },
      { label: "جیب‌ها", value: "۳ جیب داخلی + ۱ زیپ‌دار" },
      { label: "ساخت", value: "ایران" },
    ],
    isBestseller: true,
  },
  {
    id: "p7",
    name: "ساعت مچی لوکس چرمی طلایی",
    nameEn: "Luxury Gold Leather Strap Watch",
    brand: "اتلیه",
    sku: "LX-AC-7007",
    category: "women",
    subcategory: "women-accessory",
    price: 2390000,
    originalPrice: 2990000,
    image: "/images/p-watch-gold.png",
    hoverImage: "/images/cat-watch.png",
    colors: [COLORS.gold, COLORS.brown],
    sizes: ["ONE"],
    rating: 4.8,
    reviewCount: 98,
    description:
      "ساعت مچی لوکس با قاب طلایی و بند چرمی، طراحی مینیمال و شیک. ضدآب تا ۳ ATM و شیشه معدنی ضدخش.",
    specs: [
      { label: "نوع حرکت", value: "کوارتز" },
      { label: "جنس قاب", value: "استیل رنگ طلایی" },
      { label: "جنس بند", value: "چرم طبیعی" },
      { label: "شیشه", value: "معدنی ضدخش" },
      { label: "ضدآب", value: "تا ۳ ATM" },
    ],
    isSpecial: true,
  },
  {
    id: "p8",
    name: "گوشواره حلقه‌ای طلایی",
    nameEn: "Gold Hoop Earrings",
    brand: "لوکسا پریمیوم",
    sku: "LX-JW-8008",
    category: "women",
    subcategory: "women-jewelry",
    price: 690000,
    originalPrice: 890000,
    image: "/images/p-earrings.png",
    hoverImage: "/images/cat-jewelry.png",
    colors: [COLORS.gold],
    sizes: ["ONE"],
    rating: 4.6,
    reviewCount: 67,
    description:
      "گوشواره حلقه‌ای طلایی با طراحی مینیمال، مناسب استفاده روزمره و رسمی. بدون نیکل و ضدحساسیت.",
    specs: [
      { label: "جنس", value: "طلای ۱۸ عیار روکش" },
      { label: "قطر", value: "۳ سانتی‌متر" },
      { label: "بست", value: "ایمنی هنگینگ" },
      { label: "ضدحساسیت", value: "بله" },
    ],
    isSpecial: true,
  },
  {
    id: "p9",
    name: "پیراهن مردانه کتان سفید",
    nameEn: "Men's White Cotton Dress Shirt",
    brand: "کلاسیک‌هوم",
    sku: "LX-MC-9009",
    category: "men",
    subcategory: "men-cloth",
    price: 990000,
    image: "/images/p-mshirt.png",
    hoverImage: "/images/cat-coat.png",
    colors: [COLORS.white, COLORS.cream, COLORS.denim],
    sizes: ALL_SIZES_CLOTHES,
    rating: 4.5,
    reviewCount: 78,
    description:
      "پیراهن مردانه کتان با دوخت دقیق و یقه رسمی، مناسب محل کار و قرارهای رسمی. پارچه ضدچروک و تنفس‌پذیر.",
    specs: [
      { label: "جنس پارچه", value: "کتان ۱۰۰٪" },
      { label: "نوع یقه", value: "یقه کلاسیک" },
      { label: "قد", value: "۷۸ سانتی‌متر" },
      { label: "شستشو", value: "۳۰ درجه / ماشین" },
      { label: "اتوکشی", value: "دمای متوسط" },
      { label: "آستر", value: "ندارد" },
    ],
    isNew: true,
  },
  {
    id: "p10",
    name: "ژاکت جین مردانه مدل تیره",
    nameEn: "Men's Dark Denim Jacket",
    brand: "نیوفیشن",
    sku: "LX-MC-1010",
    category: "men",
    subcategory: "men-cloth",
    price: 1390000,
    originalPrice: 1790000,
    image: "/images/p-mjacket.png",
    hoverImage: "/images/cat-coat.png",
    colors: [COLORS.denim, COLORS.black],
    sizes: ALL_SIZES_CLOTHES,
    outOfStockSizes: ["S"],
    rating: 4.4,
    reviewCount: 45,
    description:
      "ژاکت جین مردانه با پارچه جین نرم و برش مدرن، مناسب استایل کژوال. جیب‌های کاربردی و دوخت تقویت‌شده.",
    specs: [
      { label: "جنس پارچه", value: "جین ۹۸٪ + الاستن ۲٪" },
      { label: "نوع یقه", value: "یقه چرخانی" },
      { label: "قد", value: "۶۸ سانتی‌متر" },
      { label: "شستشو", value: "دست‌شویی / سرد" },
      { label: "اتوکشی", value: "دمای پایین" },
    ],
    isSpecial: true,
  },
  {
    id: "p11",
    name: "کفش رسمی مردانه چرم قهوه‌ای",
    nameEn: "Men's Brown Leather Oxford Shoes",
    brand: "کلاسیک‌هوم",
    sku: "LX-MS-1111",
    category: "men",
    subcategory: "men-shoes",
    price: 1890000,
    image: "/images/p-mshoes.png",
    hoverImage: "/images/cat-sneakers.png",
    colors: [COLORS.brown, COLORS.black],
    sizes: ALL_SIZES_SHOES,
    outOfStockSizes: ["39"],
    rating: 4.7,
    reviewCount: 112,
    description:
      "کفش رسمی مردانه آکسفورد با چرم طبیعی و دوخت دستی، مناسب مجالس و محل کار. کفی چرمی و بیرونی چوب‌پنبه‌ای.",
    specs: [
      { label: "جنس رویه", value: "چرم طبیعی" },
      { label: "نوع دوخت", value: "دستی Goodyear" },
      { label: "نوع کفی", value: "چرمی" },
      { label: "بیرونی", value: "چوب‌پنبه + لاستیک" },
      { label: "ساخت", value: "ایران" },
    ],
    isBestseller: true,
  },
  {
    id: "p12",
    name: "کتانی اسپرت مردانه چرمی",
    nameEn: "Men's White Leather Sneakers",
    brand: "اوربیت",
    sku: "LX-MS-1212",
    category: "men",
    subcategory: "men-shoes",
    price: 1490000,
    originalPrice: 1990000,
    image: "/images/p-sneaker-w.png",
    hoverImage: "/images/cat-sneakers.png",
    colors: [COLORS.white, COLORS.gray],
    sizes: ALL_SIZES_SHOES,
    rating: 4.6,
    reviewCount: 134,
    description:
      "کتانی اسپرت مردانه با رویه چرمی و طراحی مینیمال، سبک و راحت برای استفاده روزانه.",
    specs: [
      { label: "جنس رویه", value: "چرم طبیعی" },
      { label: "نوع کفی", value: "آناتومیک" },
      { label: "بیرونی", value: "TPR سبک" },
      { label: "وزن", value: "۳۲۰ گرم" },
      { label: "ساخت", value: "ایران" },
    ],
    isSpecial: true,
  },
  {
    id: "p13",
    name: "کیف پول مردانه چرم قهوه‌ای",
    nameEn: "Men's Brown Leather Bifold Wallet",
    brand: "وینتیج",
    sku: "LX-MB-1313",
    category: "men",
    subcategory: "men-bag",
    price: 590000,
    image: "/images/p-mwallet.png",
    hoverImage: "/images/cat-bag.png",
    colors: [COLORS.brown, COLORS.black],
    sizes: ["ONE"],
    rating: 4.8,
    reviewCount: 89,
    description:
      "کیف پول مردانه دوخم با چرم طبیعی، دارای ۸ جای کارت و جیب زیپ‌دار. طراحی شیک و جمع‌وجور.",
    specs: [
      { label: "جنس", value: "چرم طبیعی" },
      { label: "نوع", value: "دوخم (Bifold)" },
      { label: "ابعاد", value: "۱۱×۹ سانتی‌متر" },
      { label: "جای کارت", value: "۸ عدد" },
      { label: "ساخت", value: "ایران" },
    ],
  },
  {
    id: "p14",
    name: "کمربند چرمی مردانه مشکی",
    nameEn: "Men's Black Leather Belt",
    brand: "کلاسیک‌هوم",
    sku: "LX-AC-1414",
    category: "men",
    subcategory: "men-accessory",
    price: 390000,
    originalPrice: 490000,
    image: "/images/p-belt.png",
    hoverImage: "/images/cat-watch.png",
    colors: [COLORS.black, COLORS.brown],
    sizes: ["85", "90", "95", "100", "105"],
    rating: 4.5,
    reviewCount: 54,
    description:
      "کمربند چرمی مردانه با سگک استیل ضدزنگ، چرم طبیعی مرغوب و دوخت تقویت‌شده. قابل تنظیم در چند سایز.",
    specs: [
      { label: "جنس", value: "چرم طبیعی" },
      { label: "سگک", value: "استیل ضدزنگ" },
      { label: "عرض", value: "۳.۵ سانتی‌متر" },
      { label: "ساخت", value: "ایران" },
    ],
    isSpecial: true,
  },
  {
    id: "p15",
    name: "ساعت مچی مردانه چرمی کلاسیک",
    nameEn: "Men's Classic Leather Strap Watch",
    brand: "اتلیه",
    sku: "LX-AC-1515",
    category: "men",
    subcategory: "men-accessory",
    price: 1990000,
    image: "/images/p-watch-gold.png",
    hoverImage: "/images/cat-watch.png",
    colors: [COLORS.gold, COLORS.charcoal],
    sizes: ["ONE"],
    rating: 4.7,
    reviewCount: 76,
    description:
      "ساعت مچی مردانه کلاسیک با قاب طلایی و بند چرمی، طراحی شیک و رسمی. ضدآب و شیشه معدنی ضدخش.",
    specs: [
      { label: "نوع حرکت", value: "کوارتز" },
      { label: "جنس قاب", value: "استیل طلایی" },
      { label: "جنس بند", value: "چرم طبیعی" },
      { label: "شیشه", value: "معدنی ضدخش" },
      { label: "ضدآب", value: "تا ۳ ATM" },
    ],
    isBestseller: true,
  },
  {
    id: "p16",
    name: "پیراهن دخترانه طرح گل",
    nameEn: "Girls' Floral Summer Dress",
    brand: "نیوفیشن",
    sku: "LX-KG-1616",
    category: "kids",
    subcategory: "kids-girl",
    price: 590000,
    originalPrice: 790000,
    image: "/images/p-kdress.png",
    hoverImage: "/images/cat-coat.png",
    colors: [COLORS.pink, COLORS.cream],
    sizes: ["100", "110", "120", "130", "140"],
    rating: 4.6,
    reviewCount: 33,
    description:
      "پیراهن دخترانه طرح گل با پارچه نرم و تنفس‌پذیر، مناسب فصل بهار و تابستان. راحت و شیک.",
    specs: [
      { label: "جنس پارچه", value: "نخ پنبه ۱۰۰٪" },
      { label: "نوع یقه", value: "گرد" },
      { label: "قد", value: "بسته به سایز" },
      { label: "شستشو", value: "۳۰ درجه / ماشین" },
    ],
    isSpecial: true,
  },
];

export function formatToman(n: number): string {
  return n.toLocaleString("fa-IR");
}

export function toFaDigits(s: string | number): string {
  const fa = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return String(s).replace(/[0-9]/g, (d) => fa[+d]);
}

export function discountPercent(p: Product): number | null {
  if (!p.originalPrice || p.originalPrice <= p.price) return null;
  return Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100);
}

export function getProductById(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}

export function productsByCategory(slug: string): Product[] {
  if (slug === "sale") return PRODUCTS.filter((p) => p.isSpecial || p.originalPrice);
  if (slug === "women" || slug === "men" || slug === "kids")
    return PRODUCTS.filter((p) => p.category === slug);
  return PRODUCTS.filter((p) => p.subcategory === slug);
}

export const ALL_BRAND_NAMES = Array.from(
  new Set(PRODUCTS.map((p) => p.brand)),
);

export const ALL_COLORS = Array.from(
  new Map(PRODUCTS.flatMap((p) => p.colors).map((c) => [c.name, c])).values(),
);

export const ALL_SIZES = Array.from(
  new Set(PRODUCTS.flatMap((p) => p.sizes)),
);
