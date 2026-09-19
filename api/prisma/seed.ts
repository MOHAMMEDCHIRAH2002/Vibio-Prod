import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'dates-sweets' },
      update: {},
      create: {
        slug: 'dates-sweets',
        name: 'Dates & Sweet Treats',
        description: 'Premium Medjool dates and artisan sweet confections from across the Arab world.',
        image: 'https://images.unsplash.com/photo-1567894340315-735d7c361db0?w=800',
        sortOrder: 0,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'chocolates' },
      update: {},
      create: {
        slug: 'chocolates',
        name: 'Gourmet Chocolates',
        description: 'Handcrafted chocolates using the finest cacao, infused with exotic flavors.',
        image: 'https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=800',
        sortOrder: 1,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'coffee-tea' },
      update: {},
      create: {
        slug: 'coffee-tea',
        name: 'Coffee & Tea',
        description: 'Single-origin coffees and rare teas sourced from legendary growing regions.',
        image: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800',
        sortOrder: 2,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'herbal-infusions' },
      update: {},
      create: {
        slug: 'herbal-infusions',
        name: 'Herbal Infusions',
        description: 'Botanical blends sourced from organic gardens, crafted for wellness and ritual.',
        image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800',
        sortOrder: 3,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'natural-beauty' },
      update: {},
      create: {
        slug: 'natural-beauty',
        name: 'Natural Beauty',
        description: 'Luxurious skincare and beauty rituals rooted in ancient botanical traditions.',
        image: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=800',
        sortOrder: 4,
      },
    }),
  ]);

  const [datesCat, chocolateCat, coffeeCat, herbalCat, beautyCat] = categories;

  // Tags
  const tags = await Promise.all([
    'bestseller', 'organic', 'gift-ready', 'vegan', 'premium',
    'limited-edition', 'new-arrival', 'sugar-free', 'artisan',
  ].map((name) =>
    prisma.tag.upsert({
      where: { slug: name },
      update: {},
      create: { name, slug: name },
    }),
  ));

  const tagMap = Object.fromEntries(tags.map((t) => [t.slug, t]));

  // Products
  const products = [
    {
      slug: 'medjool-gold-collection',
      name: 'Medjool Gold Collection',
      shortDesc: 'The pinnacle of date luxury — sun-ripened Medjool dates from the Jordan Valley.',
      description: 'Sourced from select groves in the fertile Jordan Valley, our Medjool Gold Collection represents the finest expression of nature\'s candy. Each date is hand-picked at peak ripeness, gently dried, and nestled in our signature luxury box. Rich, caramel-like sweetness with a melt-in-your-mouth texture that speaks of ancient tradition and modern refinement.',
      categoryId: datesCat.id,
      basePrice: 149,
      comparePrice: 199,
      images: [
        'https://images.unsplash.com/photo-1589621316382-008455b857cd?w=800',
        'https://images.unsplash.com/photo-1567894340315-735d7c361db0?w=800',
        'https://images.unsplash.com/photo-1571493378840-cd29db428cb4?w=800',
      ],
      isFeatured: true,
      tagSlugs: ['bestseller', 'premium', 'gift-ready'],
      variants: [
        { name: 'Weight', value: '250g', price: 149, stock: 50, sku: 'MGC-250' },
        { name: 'Weight', value: '500g', price: 259, stock: 40, sku: 'MGC-500' },
        { name: 'Weight', value: '1kg', price: 449, stock: 25, sku: 'MGC-1KG' },
      ],
    },
    {
      slug: 'dark-chocolate-dates',
      name: 'Dark Chocolate Dates',
      shortDesc: 'Exquisite Medjool dates enrobed in 72% single-origin dark chocolate.',
      description: 'A marriage of two ancient luxuries: our premium Medjool dates lovingly enrobed in smooth 72% single-origin dark chocolate from Ecuador. Available in three artisan fillings — the purity of the original, the crunch of toasted Sicilian almonds, or the verdant bite of Bronte pistachios. Each piece is hand-dipped and individually wrapped.',
      categoryId: datesCat.id,
      basePrice: 189,
      comparePrice: 229,
      images: [
        'https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=800',
        'https://images.unsplash.com/photo-1548907040-4bea42859852?w=800',
      ],
      isFeatured: true,
      tagSlugs: ['bestseller', 'gift-ready', 'artisan'],
      variants: [
        { name: 'Filling', value: 'Original', price: 189, stock: 35, sku: 'DCD-ORG' },
        { name: 'Filling', value: 'Almond', price: 199, stock: 30, sku: 'DCD-ALM' },
        { name: 'Filling', value: 'Pistachio', price: 219, stock: 20, sku: 'DCD-PST' },
      ],
    },
    {
      slug: 'atlas-mountain-coffee',
      name: 'Atlas Mountain Coffee',
      shortDesc: 'Rare single-origin coffee from the high-altitude slopes of the Atlas Mountains.',
      description: 'Grown at 1,800 metres above sea level in the misty peaks of Morocco\'s Atlas Mountains, these rare arabica beans develop extraordinary complexity. Notes of dark cherry, orange zest, and bittersweet chocolate emerge from a slow roast that honours the terroir. A cup that transports you to mountain dawn, every morning.',
      categoryId: coffeeCat.id,
      basePrice: 179,
      comparePrice: 219,
      images: [
        'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800',
        'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800',
      ],
      isFeatured: true,
      tagSlugs: ['premium', 'organic', 'new-arrival'],
      variants: [
        { name: 'Format', value: 'Ground (250g)', price: 179, stock: 45, sku: 'AMC-GND' },
        { name: 'Format', value: 'Whole Bean (250g)', price: 179, stock: 40, sku: 'AMC-WHL' },
        { name: 'Format', value: 'Pods ×16', price: 149, stock: 55, sku: 'AMC-POD' },
      ],
    },
    {
      slug: 'rose-hibiscus-infusion',
      name: 'Rose Hibiscus Infusion',
      shortDesc: 'A floral harmony of dried rose petals and crimson hibiscus from Egyptian gardens.',
      description: 'Steep into a world of blooming gardens with this exquisite blend of sun-dried rose petals and vibrant hibiscus flowers, hand-harvested from organic gardens along the Nile Delta. Naturally caffeine-free, it unfolds a deep ruby hue with a delicate tartness balanced by the romance of roses. Serve warm or over ice.',
      categoryId: herbalCat.id,
      basePrice: 99,
      images: [
        'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800',
        'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800',
      ],
      isFeatured: true,
      tagSlugs: ['organic', 'vegan', 'gift-ready'],
      variants: [
        { name: 'Size', value: '20 bags', price: 99, stock: 60, sku: 'RHI-20B' },
        { name: 'Size', value: '50 bags', price: 199, stock: 45, sku: 'RHI-50B' },
        { name: 'Size', value: 'Loose 100g', price: 149, stock: 30, sku: 'RHI-LOS' },
      ],
    },
    {
      slug: 'argan-glow-serum',
      name: 'Argan Glow Serum',
      shortDesc: 'Cold-pressed argan oil from Berber cooperatives, bottled for radiant skin.',
      description: 'Harvested by women-led Berber cooperatives in the UNESCO-protected Arganeraie forest of Morocco, our cold-pressed argan oil retains its full spectrum of vitamin E, ferulic acid, and rare squalene. A few drops are all you need for visibly luminous, deeply nourished skin. Certified organic, cruelty-free, and vegan.',
      categoryId: beautyCat.id,
      basePrice: 299,
      comparePrice: 349,
      images: [
        'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=800',
        'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800',
      ],
      isFeatured: true,
      tagSlugs: ['organic', 'vegan', 'premium', 'bestseller'],
      variants: [
        { name: 'Size', value: '30ml', price: 299, stock: 30, sku: 'AGS-30ML' },
        { name: 'Size', value: '50ml', price: 449, stock: 20, sku: 'AGS-50ML' },
      ],
    },
    {
      slug: 'saffron-mint-elixir',
      name: 'Saffron Mint Elixir',
      shortDesc: 'Precious Iranian saffron threads woven with Moroccan fresh mint.',
      description: 'A golden elixir born from the union of Iran\'s prized "red gold" saffron and Morocco\'s invigorating Nana mint. Each sachet contains a generous pinch of premium saffron threads alongside whole dried mint leaves. The result: a golden, aromatic infusion with a warming depth that has been treasured across millennia.',
      categoryId: herbalCat.id,
      basePrice: 249,
      images: [
        'https://images.unsplash.com/photo-1527863280617-15596f92e5c8?w=800',
      ],
      isFeatured: true,
      tagSlugs: ['premium', 'limited-edition', 'gift-ready'],
      variants: [
        { name: 'Size', value: '15 sachets', price: 249, stock: 20, sku: 'SME-15S' },
        { name: 'Size', value: '30 sachets', price: 449, stock: 15, sku: 'SME-30S' },
      ],
    },
    {
      slug: 'truffle-honey-pralines',
      name: 'Truffle Honey Pralines',
      shortDesc: 'Belgian milk chocolate pralines filled with Moroccan wildflower honey ganache.',
      description: 'A collection of twelve exquisite pralines, each crafted from silky Belgian milk chocolate and filled with a ganache of raw Moroccan wildflower honey and fresh cream. Presented in a hand-tied signature box, these are the ultimate confectionary gift — celebrating the art of sweetness in its purest form.',
      categoryId: chocolateCat.id,
      basePrice: 329,
      comparePrice: 389,
      images: [
        'https://images.unsplash.com/photo-1548907040-4bea42859852?w=800',
        'https://images.unsplash.com/photo-1606312619070-d48b5c1aed63?w=800',
      ],
      isFeatured: false,
      tagSlugs: ['gift-ready', 'artisan', 'premium'],
      variants: [
        { name: 'Box Size', value: '12 pieces', price: 329, stock: 25, sku: 'THP-12' },
        { name: 'Box Size', value: '24 pieces', price: 599, stock: 18, sku: 'THP-24' },
      ],
    },
    {
      slug: 'damascus-rose-water',
      name: 'Damascus Rose Water',
      shortDesc: 'Pure rose water steam-distilled from Damascus rose petals at dawn.',
      description: 'Distilled at first light from hand-picked Damascus rose petals in the Beklaa Valley, this ethereally fragrant rose water is a cornerstone of Middle Eastern beauty rituals. Use as a facial mist, toner, or add to your bath ritual for a sensory experience that has stood the test of centuries.',
      categoryId: beautyCat.id,
      basePrice: 149,
      images: [
        'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800',
      ],
      isFeatured: false,
      tagSlugs: ['organic', 'vegan', 'new-arrival'],
      variants: [
        { name: 'Size', value: '100ml', price: 149, stock: 40, sku: 'DRW-100' },
        { name: 'Size', value: '250ml', price: 299, stock: 25, sku: 'DRW-250' },
      ],
    },
    {
      slug: 'black-seed-honey',
      name: 'Black Seed & Sidr Honey',
      shortDesc: 'Raw Yemeni Sidr honey blended with ethically harvested black seed oil.',
      description: 'Revered across centuries of traditional medicine, this extraordinary blend unites the legendary Sidr honey from Yemen\'s Hadhramaut region — the rarest honey in the world — with cold-pressed black seed (Nigella sativa) oil. A potent wellness elixir that tastes as luxurious as it performs.',
      categoryId: datesCat.id,
      basePrice: 399,
      comparePrice: 449,
      images: [
        'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=800',
      ],
      isFeatured: false,
      tagSlugs: ['premium', 'organic', 'bestseller'],
      variants: [
        { name: 'Size', value: '250g', price: 399, stock: 20, sku: 'BSH-250' },
        { name: 'Size', value: '500g', price: 699, stock: 12, sku: 'BSH-500' },
      ],
    },
    {
      slug: 'mint-green-tea-blend',
      name: 'Moroccan Mint Green Tea',
      shortDesc: 'Authentic gunpowder green tea with whole Nana mint leaves.',
      description: 'The cornerstone of Moroccan hospitality, our blend pairs premium Chinese gunpowder green tea pellets with generously portioned Moroccan Nana mint, dried at their aromatic peak. Prepare in a traditional pot and pour from height to create the characteristic frothy head. Each sip is a welcome.',
      categoryId: coffeeCat.id,
      basePrice: 79,
      images: [
        'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800',
      ],
      isFeatured: false,
      tagSlugs: ['organic', 'vegan', 'bestseller'],
      variants: [
        { name: 'Size', value: '100g', price: 79, stock: 70, sku: 'MMT-100' },
        { name: 'Size', value: '250g', price: 159, stock: 55, sku: 'MMT-250' },
        { name: 'Size', value: '500g', price: 279, stock: 30, sku: 'MMT-500' },
      ],
    },
  ];

  for (const p of products) {
    const { tagSlugs, variants, ...productData } = p;
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        ...productData,
        tags: {
          connect: tagSlugs.map((slug) => ({ slug })),
        },
        variants: { create: variants },
      },
    });
    process.stdout.write(`  ✓ ${p.name}\n`);
  }

  // Users
  const adminHash = await bcrypt.hash('Admin123!', 12);
  const customerHash = await bcrypt.hash('Test123!', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@vibio.com' },
    update: {},
    create: {
      email: 'admin@vibio.com',
      name: 'Admin User',
      passwordHash: adminHash,
      role: 'ADMIN',
      emailVerified: new Date(),
    },
  });

  const sarah = await prisma.user.upsert({
    where: { email: 'sarah@example.com' },
    update: {},
    create: {
      email: 'sarah@example.com',
      name: 'Sarah Beaumont',
      passwordHash: customerHash,
      phone: '+212612345678',
      emailVerified: new Date(),
    },
  });

  const ahmed = await prisma.user.upsert({
    where: { email: 'ahmed@example.com' },
    update: {},
    create: {
      email: 'ahmed@example.com',
      name: 'Ahmed El Fassi',
      passwordHash: customerHash,
      phone: '+212698765432',
      emailVerified: new Date(),
    },
  });

  // Sample orders for sarah
  const firstProduct = await prisma.product.findFirst({
    include: { variants: true },
  });

  if (firstProduct && firstProduct.variants.length > 0) {
    await prisma.order.create({
      data: {
        orderNumber: 'ORD-2024-001',
        userId: sarah.id,
        status: 'DELIVERED',
        paymentStatus: 'PAID',
        paymentMethod: 'card',
        shippingAddress: {
          fullName: 'Sarah Beaumont',
          phone: '+212612345678',
          line1: '15 Rue des Jardins',
          city: 'Marrakech',
          country: 'Morocco',
        },
        subtotal: 149,
        shippingCost: 0,
        discount: 0,
        total: 149,
        items: {
          create: [{
            productId: firstProduct.id,
            variantId: firstProduct.variants[0].id,
            name: firstProduct.name,
            variantName: `${firstProduct.variants[0].name}: ${firstProduct.variants[0].value}`,
            price: 149,
            quantity: 1,
            image: firstProduct.images[0] || null,
          }],
        },
      },
    });
  }

  // Banners
  await prisma.banner.createMany({
    data: [
      {
        title: 'Nature\'s Finest, Crafted for You',
        subtitle: 'Discover our new spring collection of premium dates and artisan chocolates',
        imageDesktop: 'https://images.unsplash.com/photo-1567894340315-735d7c361db0?w=1920',
        imageMobile: 'https://images.unsplash.com/photo-1567894340315-735d7c361db0?w=800',
        ctaText: 'Shop Collection',
        ctaLink: '/shop',
        sortOrder: 0,
        isActive: true,
      },
      {
        title: 'The Art of Gifting',
        subtitle: 'Curated luxury gift boxes for every occasion',
        imageDesktop: 'https://images.unsplash.com/photo-1548907040-4bea42859852?w=1920',
        imageMobile: 'https://images.unsplash.com/photo-1548907040-4bea42859852?w=800',
        ctaText: 'Explore Gift Boxes',
        ctaLink: '/gifts',
        sortOrder: 1,
        isActive: true,
      },
    ],
    skipDuplicates: true,
  });

  // Blog posts
  await prisma.blogPost.createMany({
    data: [
      {
        slug: 'art-of-moroccan-tea-ceremony',
        title: 'The Art of the Moroccan Tea Ceremony',
        excerpt: 'More than a drink — a ritual of welcome, hospitality, and living slowly.',
        content: `The three glasses of Moroccan mint tea aren't just refreshment — they are philosophy poured into glass. The first glass is "bitter as death," the second is "strong as life," the third is "sweet as love." Each pour from height, each cascade of golden-green liquid, each breath of mint steam is a meditation on the value of presence.\n\nFor generations, the preparation of Moroccan tea has been an art passed from hand to hand. The ceremony begins with rinsing the teapot with a small amount of hot water, which is then poured out. Gunpowder green tea goes in first, followed by a wash of hot water that is immediately discarded — this removes any bitterness and opens the leaves. Then comes the water, heated but not boiling, the generosity of fresh Nana mint, and a tower of sugar cones broken by hand.`,
        coverImage: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=1200',
        authorId: admin.id,
        status: 'PUBLISHED',
        publishedAt: new Date('2024-01-15'),
        metaTitle: 'The Art of the Moroccan Tea Ceremony | Vibio Journal',
        metaDesc: 'Discover the philosophy and ritual behind Morocco\'s most celebrated tradition.',
      },
      {
        slug: 'medjool-dates-complete-guide',
        title: 'Medjool Dates: The Complete Guide',
        excerpt: 'Why these sun-kissed jewels deserve their "King of Dates" crown.',
        content: `Called the "King of Dates" for good reason, Medjool dates are the aristocrats of the date world — larger, softer, and richer than any other variety. But what makes them so extraordinary, and how do you choose the finest ones?\n\nMedjool dates grow on Phoenix dactylifera palms in semi-arid regions where temperatures soar and rainfall is scarce. This stress, paradoxically, is what concentrates their sugars and develops their characteristic caramel complexity. The finest specimens come from the Jordan Valley, Palestine, Morocco\'s Tafilalet oasis, and California\'s Coachella Valley.`,
        coverImage: 'https://images.unsplash.com/photo-1589621316382-008455b857cd?w=1200',
        authorId: admin.id,
        status: 'PUBLISHED',
        publishedAt: new Date('2024-02-01'),
        metaTitle: 'Medjool Dates: The Complete Guide | Vibio Journal',
        metaDesc: 'Everything you need to know about selecting, storing, and enjoying premium Medjool dates.',
      },
    ],
    skipDuplicates: true,
  });

  console.log('\n✅ Seed complete!');
  console.log('   admin@vibio.com / Admin123!');
  console.log('   sarah@example.com / Test123!');
  console.log('   ahmed@example.com / Test123!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
