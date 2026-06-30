/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Product, Coupon, Address, AppNotification } from "./types";

export const SEED_COUPONS: Coupon[] = [
  {
    code: "NAYEL20",
    type: "percentage",
    value: 20,
    minSpend: 80,
    description: "Enjoy 20% off on exquisite home decor! Minimum purchase of $80.",
    expiry: "2026-12-31"
  },
  {
    code: "DECOR15",
    type: "fixed",
    value: 15,
    minSpend: 50,
    description: "Save a flat $15 on our artisanal collections over $50.",
    expiry: "2026-12-31"
  },
  {
    code: "FREESHIP",
    type: "percentage",
    value: 100,
    minSpend: 0,
    description: "Complimentary elite premium delivery, no minimum spend required.",
    expiry: "2026-12-31"
  },
  {
    code: "GEMINI50",
    type: "percentage",
    value: 50,
    minSpend: 200,
    description: "Exclusive AI Concierge Coupon! Enjoy 50% savings on purchases over $200.",
    expiry: "2026-09-30"
  }
];

export const SEED_ADDRESSES: Address[] = [
  {
    id: "addr_1",
    fullName: "Alex Rivera",
    phone: "+1 (555) 321-9876",
    streetAddress: "452 Pine Street, Apt 3B",
    city: "San Francisco",
    state: "CA",
    postalCode: "94104",
    isDefault: true
  },
  {
    id: "addr_2",
    fullName: "Alex Rivera (Office)",
    phone: "+1 (555) 789-0123",
    streetAddress: "100 Pine Street, 15th Floor",
    city: "San Francisco",
    state: "CA",
    postalCode: "94111",
    isDefault: false
  }
];

export const SEED_NOTIFICATIONS: AppNotification[] = [
  {
    id: "notif_1",
    title: "Welcome to Nayel Basket!",
    description: "Discover curated luxury furniture, hand-blown ambient lighting, and artisanal wall pieces. Explore your merchant panels to control your decor catalog.",
    type: "system",
    timestamp: "2026-06-29T10:00:00Z",
    read: false
  },
  {
    id: "notif_2",
    title: "Artisanal AI Stylist is Live ✨",
    description: "Consult our bespoke Gemini AI Concierge for tailored home decor pairings, moodboards, and interior spacing advice.",
    type: "ai",
    timestamp: "2026-06-29T11:30:00Z",
    read: false
  },
  {
    id: "notif_3",
    title: "Summer Solstice Promo Active 🏷️",
    description: "Apply coupon code NAYEL20 for 20% off all ceramic vases and lighting today.",
    type: "promo",
    timestamp: "2026-06-29T14:15:00Z",
    read: true
  }
];

export const SEED_PRODUCTS: Product[] = [
  {
    id: "prod_1",
    name: "Handcrafted Royal Brass Scented Candle Holder",
    brand: "Nayel Heritage",
    sku: "NB-RCH-BRS-01",
    description: "Meticulously cast in solid brass and hand-burnished by hereditary artisans, the Royal Brass Scented Candle Holder is a timeless piece of historical luxury. Designed to disperse a warm, textured ambient light, it features an intricate filigree framework that creates captivating shadow patterns. Accompanied by three hand-poured jasmine and organic beeswax candles.",
    price: 120,
    originalPrice: 160,
    category: "Luxury Accessories",
    image: "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=600&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1596436889106-be35e843f974?auto=format&fit=crop&w=600&q=80"
    ],
    rating: 4.9,
    reviewCount: 4,
    stock: 35,
    sellerId: "seller_nayel_heritage",
    sellerName: "Nayel Heritage Guild",
    features: [
      "Formed from 100% heavy solid brass with protective tarnish-resistant coating",
      "Hand-carved filigree patterns that cast immersive shadows",
      "Includes three luxury 40-hour hand-poured beeswax scented candles",
      "Elegant heavy felt base lining to safeguard delicate tabletops"
    ],
    reviews: [
      {
        id: "rev_1_1",
        userName: "Eleanor Pemberton",
        rating: 5,
        comment: "Absolutely breathtaking. The brass has a wonderful weight and the golden shadow shapes cast on my ceiling in the evening are incredibly serene. Absolute luxury.",
        date: "2026-06-15",
        verified: true,
        sentiment: "positive",
        likes: 14
      },
      {
        id: "rev_1_2",
        userName: "Deven R.",
        rating: 4,
        comment: "Outstanding craftsmanship. The included jasmine candles smell incredible, not overbearing but very sophisticated. The brass is heavy and premium.",
        date: "2026-06-20",
        verified: true,
        sentiment: "positive",
        likes: 7
      }
    ],
    qa: [
      {
        id: "qa_1_1",
        question: "Does it tarnish over time, or need constant polishing?",
        askedBy: "Julian M.",
        dateAsked: "2026-06-10",
        answer: "We treat the solid brass with a custom anti-tarnish micro-wax coating. It will maintain its warm, elegant golden luster with just a simple occasional dust-off with a dry cloth.",
        answeredBy: "Nayel Heritage Guild",
        dateAnswered: "2026-06-11"
      }
    ],
    tags: ["Candle Holder", "Brass", "Handcrafted", "Artisanal", "Decor"],
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-decorating-a-warm-living-room-41561-large.mp4",
    specifications: {
      "Material": "100% Solid Heavy Brass",
      "Dimensions": "12cm Base Diameter x 25cm Height",
      "Weight": "1.45 kg",
      "Finish": "Artisanal Hand-Burnished Gold Tint",
      "Origin": "Individually Handcrafted"
    },
    frequentlyBoughtTogetherIds: ["prod_2", "prod_6"]
  },
  {
    id: "prod_2",
    name: "Aurora Minimalist Ceramic Vase Trio",
    brand: "Atelier Nayel",
    sku: "NB-AMV-CRM-02",
    description: "Designed for modern living, the Aurora Minimalist Ceramic Vase Trio features three distinct, organically sculpted ceramic vessels finished in a rich, non-reflective matte chalk glaze. Their fluid curves and sophisticated neutral palette harmonize effortlessly with single botanical stems, pampas grass, or dried wildflower arrangements.",
    price: 95,
    originalPrice: 130,
    category: "Living Room",
    image: "https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&w=600&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1525956181089-227477525283?auto=format&fit=crop&w=600&q=80"
    ],
    rating: 4.8,
    reviewCount: 3,
    stock: 28,
    sellerId: "seller_atelier_nayel",
    sellerName: "Atelier Nayel Designs",
    features: [
      "Includes 3 distinct organically curved ceramic vessels",
      "Chalky matte protective glaze prevents dust and watermark residue",
      "Waterproof interior makes it suitable for fresh-cut botanicals",
      "Padded silicone underbase guarantees non-slip protection"
    ],
    reviews: [
      {
        id: "rev_2_1",
        userName: "Sophia Loren",
        rating: 5,
        comment: "Stunning minimalist additions to my mantel. The tactile texture is exquisite, like premium volcanic stone. They look highly artistic even when empty.",
        date: "2026-06-12",
        verified: true,
        sentiment: "positive",
        likes: 19
      }
    ],
    qa: [
      {
        id: "qa_2_1",
        question: "Are these water-tight for holding real water?",
        askedBy: "Sarah T.",
        dateAsked: "2026-06-18",
        answer: "Yes, the interior is finished with a durable glass-melt lining, making them 100% water-tight and safe for fresh floral displays.",
        answeredBy: "Atelier Nayel Designs",
        dateAnswered: "2026-06-19"
      }
    ],
    tags: ["Ceramic", "Vase", "Minimalist", "Home Decor", "Sculptural"],
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-sunlight-on-a-cozy-living-room-with-plants-41559-large.mp4",
    specifications: {
      "Material": "Kao-Lin Organic Premium Clay",
      "Vessel Heights": "Tall: 30cm, Medium: 22cm, Short: 15cm",
      "Total Weight": "2.1 kg (all three pieces)",
      "Glaze": "Chalky Matte Mineral Glaze"
    },
    frequentlyBoughtTogetherIds: ["prod_1", "prod_5"]
  },
  {
    id: "prod_3",
    name: "Atelier Woolen Boho Tassel Runner Rug",
    brand: "Nayel Weavers",
    sku: "NB-AWR-BHO-03",
    description: "Hand-loomed using premium organic New Zealand virgin wool, this exquisite runner rug blends cozy Bohemian aesthetics with high-performance durability. Displaying an organic cream background highlighted with subtle charcoal geometric patterns, it is detailed with gorgeous, heavy hand-tied braided tassels on both terminals.",
    price: 180,
    originalPrice: 240,
    category: "Living Room",
    image: "https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=600&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1576016770956-debb63d900fe?auto=format&fit=crop&w=600&q=80"
    ],
    rating: 4.7,
    reviewCount: 2,
    stock: 15,
    sellerId: "seller_nayel_weavers",
    sellerName: "Nayel Weavers Cooperative",
    features: [
      "Hand-loomed with premium 100% New Zealand virgin wool",
      "Plush 1.2-inch pile depth provides remarkable underfoot cushion",
      "Sustainably sourced, dye-free wool yarns promote safe air quality",
      "Chunky braided tassels hand-knotted by veteran craftspeople"
    ],
    reviews: [
      {
        id: "rev_3_1",
        userName: "Marc A.",
        rating: 5,
        comment: "This rug transformed our hallway! It's incredibly thick, warm, and does not shed like cheap wool carpets. The braided tassels are gorgeous.",
        date: "2026-06-25",
        verified: true,
        sentiment: "positive",
        likes: 11
      }
    ],
    qa: [
      {
        id: "qa_3_1",
        question: "Is this runner suitable for high-traffic zones like entries?",
        askedBy: "Julian M.",
        dateAsked: "2026-06-11",
        answer: "Yes, organic wool contains natural self-resilient lanolin oils which repel dirt and pressure. We do suggest using a premium non-slip rug pad underneath to prolong its life.",
        answeredBy: "Nayel Weavers Cooperative",
        dateAnswered: "2026-06-12"
      }
    ],
    tags: ["Rug", "Woolen", "Boho", "Runner", "Hand-loomed"],
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-decorating-a-warm-living-room-41561-large.mp4",
    specifications: {
      "Material": "100% Organic New Zealand Wool",
      "Dimensions": "80cm Width x 250cm Length",
      "Pile Depth": "30mm (1.2 inches)",
      "Origin": "Individually Loomed by Hand"
    },
    frequentlyBoughtTogetherIds: ["prod_4", "prod_5"]
  },
  {
    id: "prod_4",
    name: "Modern Nordic Solid Oak Coffee Table",
    brand: "Nayel Atelier",
    sku: "NB-MCT-OAK-04",
    description: "The epitome of high-end Scandinavian craftsmanship, this coffee table is sculpted entirely from certified sustainable European White Oak. It presents a fluid, organic contouring with floating lower rack spaces to shelf art books, completed with a hand-applied organic hardwax oil that accentuates the exquisite natural cathedral oak grains.",
    price: 450,
    originalPrice: 599,
    category: "Furniture",
    image: "https://images.unsplash.com/photo-1577140917170-285929fb55b7?auto=format&fit=crop&w=600&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1532372320572-cda25653a26d?auto=format&fit=crop&w=600&q=80"
    ],
    rating: 4.9,
    reviewCount: 3,
    stock: 10,
    sellerId: "seller_atelier_nayel",
    sellerName: "Atelier Nayel Designs",
    features: [
      "Formed from 100% FSC-Certified European White Oak",
      "Beautiful hand-rubbed organic protective oil seals wood gracefully",
      "Includes spacious suspended lower shelf for magazine storage",
      "Features soft, chamfered edge lines safe for pets and children"
    ],
    reviews: [
      {
        id: "rev_4_1",
        userName: "Julian S.",
        rating: 5,
        comment: "This table is an absolute masterpiece of woodworking. The grain is magnificent, it smells lovely of natural linseed oil, and feels incredibly sturdy. Packaging was flawless.",
        date: "2026-06-20",
        verified: true,
        sentiment: "positive",
        likes: 18
      }
    ],
    qa: [
      {
        id: "qa_4_1",
        question: "Is assembly required for this coffee table?",
        askedBy: "Toby W.",
        dateAsked: "2026-06-05",
        answer: "Minor assembly is required. You only need to attach the pre-machined oak legs to the table top using the premium heavy-duty brass bolts included. It takes less than 10 minutes.",
        answeredBy: "Atelier Nayel Designs",
        dateAnswered: "2026-06-06"
      }
    ],
    tags: ["Coffee Table", "Solid Oak", "Nordic", "Furniture", "Minimalist"],
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-sunlight-on-a-cozy-living-room-with-plants-41559-large.mp4",
    specifications: {
      "Material": "FSC-Certified Solid European White Oak",
      "Dimensions": "110cm Length x 60cm Width x 42cm Height",
      "Weight": "18.5 kg",
      "Assembly": "Extremely Easy (10 mins, tools included)"
    },
    frequentlyBoughtTogetherIds: ["prod_3", "prod_5"]
  },
  {
    id: "prod_5",
    name: "Luxe Velvet Emerald Tufted Accent Chair",
    brand: "Nayel Living",
    sku: "NB-LVC-EMR-05",
    description: "Indulge in absolute luxury with the Luxe Velvet Emerald Accent Chair. Wrapped in our proprietary ultra-dense silk-velvet yarn, this chair displays gorgeous deep chesterfield tufting and a highly supportive ergonomic curved frame. Set upon heavy, taper-turned solid steel legs electroplated in deep brushed antique brass.",
    price: 320,
    originalPrice: 420,
    category: "Furniture",
    image: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=600&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1580481072645-022f9a6dbf27?auto=format&fit=crop&w=600&q=80"
    ],
    rating: 4.8,
    reviewCount: 3,
    stock: 12,
    sellerId: "seller_nayel_living",
    sellerName: "Nayel Living Studio",
    features: [
      "Premium, stain-treated dense Italian silk-velvet upholstery",
      "Classic deep hand-folded diamond button tufting details",
      "Taper-turned steel support frame with anti-oxidized antique brass finish",
      "High-density memory foam core guarantees superb support"
    ],
    reviews: [
      {
        id: "rev_5_1",
        userName: "Elena R.",
        rating: 5,
        comment: "The crown jewel of my reading nook. The emerald color is so rich, reflecting ambient light beautifully. It feels extremely solid and provides deep comfortable support.",
        date: "2026-06-12",
        verified: true,
        sentiment: "positive",
        likes: 12
      }
    ],
    qa: [
      {
        id: "qa_5_1",
        question: "Is the velvet stain-resistant or hard to clean?",
        askedBy: "Megan L.",
        dateAsked: "2026-06-14",
        answer: "Our premium silk-velvet is pre-treated with water-repellent guard molecules. Spills sit on the velvet surface for several minutes and can be wiped away with an absorbent dry towel.",
        answeredBy: "Nayel Living Studio",
        dateAnswered: "2026-06-15"
      }
    ],
    tags: ["Accent Chair", "Velvet", "Emerald", "Luxury", "Furniture"],
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-decorating-a-warm-living-room-41561-large.mp4",
    specifications: {
      "Upholstery": "Artisanal Liquid-Guard Silk Velvet",
      "Dimensions": "78cm Width x 82cm Depth x 88cm Height",
      "Frame Weight Capacity": "160 kg",
      "Leg Finish": "Electroplated Antique Brass Steel"
    },
    frequentlyBoughtTogetherIds: ["prod_2", "prod_4"]
  },
  {
    id: "prod_6",
    name: "Celeste Hand-Blown Amber Glass Pendant Light",
    brand: "Nayel Glassworks",
    sku: "NB-CGP-AMB-06",
    description: "An elegant drop of luminescent art, the Celeste Pendant Light features a fluid, teardrop-shaped shade individually hand-blown by master glass artists. The amber-tinted organic glass filters light into a warm, calming golden honey hue, perfect for bringing intimate tranquility to dining islands or cozy lounge spaces.",
    price: 165,
    originalPrice: 195,
    category: "Lighting",
    image: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=600&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80"
    ],
    rating: 4.7,
    reviewCount: 2,
    stock: 22,
    sellerId: "seller_nayel_glassworks",
    sellerName: "Nayel Glassworks Lab",
    features: [
      "Individually hand-blown recycled borosilicate glass shade",
      "Includes a 1.5-meter luxury braided black fabric suspension cord",
      "Stately solid brushed brass ceiling canopy assembly kit",
      "Supports dimming controllers for adjustable golden ambience"
    ],
    reviews: [
      {
        id: "rev_6_1",
        userName: "Sylvie T.",
        rating: 5,
        comment: "Breathtaking glass quality. Each shade has microscopic hand-blown seed bubbles that look incredibly artisanal. The honey amber glow is very cozy.",
        date: "2026-06-10",
        verified: true,
        sentiment: "positive",
        likes: 9
      }
    ],
    qa: [
      {
        id: "qa_6_1",
        question: "Does it come with the bulb pictured?",
        askedBy: "Isla B.",
        dateAsked: "2026-06-12",
        answer: "Yes, we include a high-efficiency 4W dimmable vintage amber LED filament Edison bulb (2200K warm glow) with every purchase.",
        answeredBy: "Nayel Glassworks Lab",
        dateAnswered: "2026-06-13"
      }
    ],
    tags: ["Pendant Light", "Glass", "Amber", "Lighting", "Artisanal"],
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-sunlight-on-a-cozy-living-room-with-plants-41559-large.mp4",
    specifications: {
      "Material": "Mouth-Blown Borosilicate Soda Glass",
      "Shade Dimensions": "22cm Diameter x 32cm Height",
      "Cord Length": "150cm (Fully Adjustable)",
      "Bulb Socket": "Standard E26 / E27 (4W LED Included)"
    },
    frequentlyBoughtTogetherIds: ["prod_1", "prod_2"]
  }
];
