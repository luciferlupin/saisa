const PRODUCTS = [
  {
    id: "saisa_aura_kurti",
    title: "Aura Minimalist Plain Kurti",
    price: 999,
    originalPrice: 1499,
    category: "Plain Kurtis",
    image: "assets/kurti_minimalist_alabaster.png",
    gallery: [
      "assets/kurti_minimalist_alabaster.png",
      "assets/kurti_solid_sage.png",
      "assets/kurti_indigo_print.png"
    ],
    description: "An elevated everyday straight kurta tailored from soft, breathable cotton-linen. Features clean structural lines, side slits, and a subtle keyhole neck for minimalist styling.",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [
      { name: "Warm Alabaster", hex: "#FAF9F6" },
      { name: "Earthy Sage", hex: "#8A9A86" },
      { name: "Charcoal", hex: "#2C3531" }
    ],
    details: [
      "60% Organic Cotton, 40% Flax Linen",
      "Breathable, lightweight daily fabric",
      "Handcrafted in local Indian handloom clusters",
      "Model is 5'7\" and is wearing a size S"
    ],
    inStock: true,
    rating: 4.8,
    reviewsCount: 36,
    badge: "BEST SELLER",
    reviews: [
      { name: "Anjali M.", rating: 5, date: "2026-05-10", text: "The fabric is incredibly soft and holds its shape beautifully after washing. Will buy in charcoal too!", verified: true },
      { name: "Pooja K.", rating: 4.5, date: "2026-05-18", text: "Elegant cut, pairs nicely with high-waisted linen trousers. Highly recommend.", verified: true },
      { name: "Riya S.", rating: 5, date: "2026-05-28", text: "A summer staple. Breathable cotton blend feels premium and looks very chic.", verified: true }
    ]
  },
  {
    id: "saisa_sage_kurta",
    title: "Serene Sage Linen Kurta",
    price: 1499,
    originalPrice: 1999,
    category: "Linen & Cotton",
    image: "assets/kurti_solid_sage.png",
    gallery: [
      "assets/kurti_solid_sage.png",
      "assets/kurti_minimalist_alabaster.png",
      "assets/kurti_indigo_print.png"
    ],
    description: "Spun from 100% premium European flax linen, this plain solid kurta provides a breezy and elegant look. Complete with deep side pockets and a classic V-neck.",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [
      { name: "Earthy Sage", hex: "#8A9A86" },
      { name: "Warm Alabaster", hex: "#FAF9F6" }
    ],
    details: [
      "100% European Flax Linen",
      "Side pockets and structured side slits",
      "Pre-shrunk for maximum comfort and durability",
      "Model is 5'8\" and is wearing a size S"
    ],
    inStock: true,
    rating: 4.9,
    reviewsCount: 22,
    badge: "NEW ARRIVAL",
    reviews: [
      { name: "Kritika G.", rating: 5, date: "2026-05-12", text: "Absolutely stunning kurta! The side pockets are a dream and the flax linen feels heavy and high-quality.", verified: true },
      { name: "Meera D.", rating: 4.8, date: "2026-05-24", text: "Love the clean collar neckline. Perfect length for styling with trousers or palazzos.", verified: true }
    ]
  },
  {
    id: "saisa_indigo_kurti",
    title: "Indigo Hand-Block Kurti",
    price: 1299,
    originalPrice: 1799,
    category: "Printed & Colorful",
    image: "assets/kurti_indigo_print.png",
    gallery: [
      "assets/kurti_indigo_print.png",
      "assets/kurti_ochre_silk.png",
      "assets/kurti_minimalist_alabaster.png"
    ],
    description: "A traditional cotton kurta dyed with natural organic indigo. Adorned with beautiful hand-stamped block prints crafted by local artisans in Rajasthan.",
    sizes: ["XS", "S", "M", "L"],
    colors: [
      { name: "Indigo Blue", hex: "#3F51B5" },
      { name: "Charcoal", hex: "#2C3531" }
    ],
    details: [
      "100% Organic Handspun Cotton",
      "Traditional Dabu block printing",
      "Eco-friendly natural indigo dye",
      "Model is 5'9\" and is wearing a size S"
    ],
    inStock: true,
    rating: 4.7,
    reviewsCount: 18,
    badge: "SELLING FAST",
    reviews: [
      { name: "Divya N.", rating: 5, date: "2026-05-15", text: "The indigo color is so rich and deep. Got so many compliments at office!", verified: true },
      { name: "Sonia P.", rating: 4, date: "2026-05-22", text: "Very comfortable block print design. Handcrafted feel is obvious.", verified: true }
    ]
  },
  {
    id: "saisa_khadi_short",
    title: "Terracotta Khadi Short Kurti",
    price: 899,
    originalPrice: 1299,
    category: "Short Kurtis",
    image: "assets/kurti_terracotta_short.png",
    gallery: [
      "assets/kurti_terracotta_short.png",
      "assets/kurti_minimalist_alabaster.png",
      "assets/kurti_solid_sage.png"
    ],
    description: "Designed for modern convenience, this short kurti is crafted from handspun cotton khadi. Perfect for hot summer days styled with linen trousers or denim.",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [
      { name: "Terracotta", hex: "#D2691E" },
      { name: "Beige Oatmeal", hex: "#EBE3D5" }
    ],
    details: [
      "100% Handspun Cotton Khadi",
      "Mid-thigh length with buttoned front slit",
      "Ultra-breathable texture",
      "Model is 5'7\" and is wearing a size S"
    ],
    inStock: true,
    rating: 4.6,
    reviewsCount: 14,
    badge: "ESSENTIAL",
    reviews: [
      { name: "Neha C.", rating: 4.5, date: "2026-05-08", text: "Very comfortable fit. The short kurta silhouette looks great with linen pants.", verified: true }
    ]
  },
  {
    id: "saisa_mulmul_pink",
    title: "Gulabi Flared Mulmul Kurti",
    price: 1699,
    originalPrice: 2299,
    category: "A-Line & Flared",
    image: "assets/kurti_pink_mulmul.png",
    gallery: [
      "assets/kurti_pink_mulmul.png",
      "assets/kurti_ochre_silk.png",
      "assets/kurti_indigo_print.png"
    ],
    description: "Feel weightless in this beautiful tiered A-line kurta spun from cloud-soft mulmul cotton. Featuring a delicate pink dye, it drapes in fluid pleats.",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [
      { name: "Gulabi Pink", hex: "#FF80AB" },
      { name: "Warm Alabaster", hex: "#FAF9F6" }
    ],
    details: [
      "100% Fine Mulmul Cotton",
      "Lightweight, semi-sheer layered styling",
      "Feminine A-line tiered silhouette",
      "Model is 5'9\" and is wearing a size S"
    ],
    inStock: true,
    rating: 4.8,
    reviewsCount: 19,
    badge: "BEST SELLER",
    reviews: [
      { name: "Tanya B.", rating: 5, date: "2026-05-02", text: "The fabric feels like air. Elegant and very comfortable for hot climates.", verified: true },
      { name: "Ishita M.", rating: 4.6, date: "2026-05-14", text: "Beautiful pink shade. Softest cotton I've ever felt.", verified: true }
    ]
  },
  {
    id: "saisa_ochre_kurta",
    title: "Ochre Cotton-Silk Kurta",
    price: 1899,
    originalPrice: 2499,
    category: "Printed & Colorful",
    image: "assets/kurti_ochre_silk.png",
    gallery: [
      "assets/kurti_ochre_silk.png",
      "assets/kurti_solid_sage.png",
      "assets/kurti_indigo_print.png"
    ],
    description: "A luxurious kurta woven from a rich cotton-silk blend in a warm ochre mustard hue. Features delicate gold zari stitching on the neck cuffs for high-agency styling.",
    sizes: ["XS", "S", "M", "L"],
    colors: [
      { name: "Ochre Mustard", hex: "#DAA520" },
      { name: "Earthy Sage", hex: "#8A9A86" }
    ],
    details: [
      "70% Organic Cotton, 30% Mulberry Silk",
      "Elegant silk sheen with natural cotton drape",
      "Intricate hand-stitched zari neck placket",
      "Dry clean only recommended"
    ],
    inStock: true,
    rating: 4.9,
    reviewsCount: 11,
    badge: "NEW ARRIVAL",
    reviews: [
      { name: "Aaradhya S.", rating: 5, date: "2026-05-20", text: "Absolutely gorgeous shade of yellow! Feels so luxurious and looks rich.", verified: true }
    ]
  },
  {
    id: "saisa_coord_pant",
    title: "Sage Minimal Kurta Co-ord Set",
    price: 2199,
    originalPrice: 2999,
    category: "Kurta Co-ords",
    image: "assets/kurti_solid_sage.png",
    gallery: [
      "assets/kurti_solid_sage.png",
      "assets/kurti_minimalist_alabaster.png"
    ],
    description: "A premium two-piece set consisting of a minimal straight linen kurta and matching high-waisted cigarette trousers. An effortless corporate or festive choice.",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [
      { name: "Earthy Sage", hex: "#8A9A86" },
      { name: "Charcoal", hex: "#2C3531" }
    ],
    details: [
      "80% Flax Linen, 20% Cotton Khadi",
      "Straight fit kurta with matching pencil trousers",
      "Clean hidden button placket",
      "Model is 5'7\" and wears size S"
    ],
    inStock: true,
    rating: 4.5,
    reviewsCount: 26,
    badge: "SELLING FAST",
    reviews: [
      { name: "Kajal P.", rating: 4.5, date: "2026-05-04", text: "Incredibly thick and not see-through at all! Essential basic.", verified: true }
    ]
  },
  {
    id: "saisa_kaftan_kurti",
    title: "Ivory Editorial Kaftan Kurti",
    price: 1599,
    originalPrice: 2199,
    category: "Plain Kurtis",
    image: "assets/kurti_minimalist_alabaster.png",
    gallery: [
      "assets/kurti_minimalist_alabaster.png",
      "assets/kurti_ochre_silk.png"
    ],
    description: "An oversized editorial kaftan kurta featuring relaxed kimono sleeves and an adjustable inner waist tie. Made from heavy washed flax linen.",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [
      { name: "Warm Alabaster", hex: "#FAF9F6" },
      { name: "Charcoal", hex: "#2C3531" }
    ],
    details: [
      "100% Organic Washed Linen",
      "Fully adjustable inner waist sash",
      "Flowy silhouette with kimono drape",
      "Ethically made in India"
    ],
    inStock: true,
    rating: 4.7,
    reviewsCount: 15,
    badge: "ESSENTIAL",
    reviews: [
      { name: "Shikha A.", rating: 5, date: "2026-05-11", text: "Flattering drape. Fits well across different body types because of the adjustable waist tie.", verified: true }
    ]
  },
  {
    id: "saisa_ajrakh_short",
    title: "Ajrakh Block-Print Short Kurta",
    price: 999,
    originalPrice: 1499,
    category: "Short Kurtis",
    image: "assets/kurti_indigo_print.png",
    gallery: [
      "assets/kurti_indigo_print.png",
      "assets/kurti_ochre_silk.png"
    ],
    description: "Traditional Ajrakh block printing styled on a contemporary short silhouette. Handcrafted with organic root dyes in deep madder red and natural charcoal.",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [
      { name: "Madder Red", hex: "#A35C50" },
      { name: "Charcoal", hex: "#2C3531" }
    ],
    details: [
      "100% Hand-spun Cotton",
      "Genuine Ajrakh woodblock stamps",
      "Organic vegetable dyes",
      "Delicate hand-wash only"
    ],
    inStock: true,
    rating: 4.6,
    reviewsCount: 12,
    badge: "LIMITED EDIT",
    reviews: [
      { name: "Rashmi V.", rating: 4.8, date: "2026-05-06", text: "Beautiful print! Looks so elegant layered over pants.", verified: true }
    ]
  },
  {
    id: "saisa_marigold_anarkali",
    title: "Marigold Flared Anarkali Kurta",
    price: 1999,
    originalPrice: 2799,
    category: "A-Line & Flared",
    image: "assets/kurti_ochre_silk.png",
    gallery: [
      "assets/kurti_ochre_silk.png",
      "assets/kurti_solid_sage.png"
    ],
    description: "Celebrate natural color in this majestic flared Anarkali kurta dyed in warm marigold yellow. Crafted from airy cotton cambric with beautiful geometric folds.",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [
      { name: "Marigold Yellow", hex: "#FFC107" },
      { name: "Warm Alabaster", hex: "#FAF9F6" }
    ],
    details: [
      "100% Cotton Cambric",
      "Flared panel Kalidaar construction",
      "Gold gota patti trims on border",
      "Breathable and skin-soft texture"
    ],
    inStock: true,
    rating: 4.8,
    reviewsCount: 9,
    badge: "MUST HAVE",
    reviews: [
      { name: "Sneha S.", rating: 5, date: "2026-05-09", text: "Feels like staying in a 5-star resort. The fabric is extremely soft.", verified: true }
    ]
  }
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = PRODUCTS;
} else {
  window.PRODUCTS = PRODUCTS;
}
