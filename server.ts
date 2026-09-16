import express, { Request, Response } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { 
  Court, 
  Booking, 
  Product, 
  Order, 
  PushNotification, 
  UserProfile, 
  PlatformConfig 
} from "./src/types.js";

dotenv.config();

const PORT = 3000;
const app = express();
app.use(express.json());

// Lazy Gemini API client
let genAI: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!genAI && process.env.GEMINI_API_KEY) {
    genAI = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return genAI;
}

// SSE Clients for real-time live sync
const sseClients = new Set<Response>();

function broadcastSSE(event: string, data: any) {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  sseClients.forEach(client => {
    try {
      client.write(payload);
    } catch {
      sseClients.delete(client);
    }
  });
}

// Platform commission configuration
const platformConfig: PlatformConfig = {
  commissionRateBookings: 0.08, // 8% por reserva de cancha
  commissionRateProducts: 0.06, // 6% por venta de producto
  totalPlatformRevenue: 154000,
  totalBookingsVolume: 1250000,
  totalProductsVolume: 890000,
};

// Seed Users (Entorno Colombiano)
const users: UserProfile[] = [
  {
    id: "user-player-1",
    name: "Juan David Morales",
    email: "juandavid.futbol@email.com",
    phone: "+57 312 458-9021",
    role: "customer",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    preferences: {
      primarySport: "futsal",
      favoritePosition: "Pivot",
      preferredDays: ["Jueves", "Viernes", "Sábado"],
      preferredHours: ["20:00 - 21:00", "21:00 - 22:00"],
      shoeSize: "41",
      clothingSize: "M",
      favoriteBrand: "Golty",
      notificationsEnabled: true
    }
  },
  {
    id: "user-vendor-1",
    name: "Complejo Deportivo El Campín",
    email: "contacto@elcampin.com.co",
    phone: "+57 320 894-3310",
    role: "vendor",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    complexName: "Complejo Deportivo El Campín",
    businessName: "El Campín Sports S.A.S.",
    preferences: {
      primarySport: "ambos",
      favoritePosition: "Mediocampista",
      preferredDays: ["Todos"],
      preferredHours: ["18:00 - 23:00"],
      shoeSize: "42",
      clothingSize: "L",
      favoriteBrand: "Nike",
      notificationsEnabled: true
    }
  },
  {
    id: "user-admin-1",
    name: "Director de Operaciones Colombia",
    email: "admin@futhub.co",
    phone: "+57 300 700-1122",
    role: "admin",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    preferences: {
      primarySport: "ambos",
      favoritePosition: "Arquero",
      preferredDays: ["Viernes"],
      preferredHours: ["21:00 - 22:00"],
      shoeSize: "41",
      clothingSize: "M",
      favoriteBrand: "Adidas",
      notificationsEnabled: true
    }
  }
];

// Seed Courts (Colombia: Bogotá, Medellín, Cali - Precios en COP)
let courts: Court[] = [
  {
    id: "court-1",
    name: "Coliseo Principal Futsal Parquet FIFA",
    complexName: "Arena Futsal Chicó",
    location: "Chicó Norte, Bogotá D.C.",
    sportType: "futsal",
    surface: "parquet",
    pricePerHour: 130000,
    image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&auto=format&fit=crop&q=80",
    amenities: ["Piso de parquet amortiguado reglamentario", "Iluminación LED alta definición", "Vestuarios con duchas con agua caliente", "Tablero electrónico FIFA", "Parqueadero cubierto vigilado", "Cafetería deportiva & hidratación"],
    rating: 4.9,
    reviewsCount: 84,
    availableHours: ["16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00"],
    ownerId: "user-vendor-1",
    ownerName: "Complejo Deportivo El Campín"
  },
  {
    id: "court-2",
    name: "Cancha Futsal & Microfútbol Techada 40x20",
    complexName: "Complejo Deportivo El Campín",
    location: "Teusaquillo / Salitre, Bogotá D.C.",
    sportType: "futsal",
    surface: "sintetico_indoor",
    pricePerHour: 110000,
    image: "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=800&auto=format&fit=crop&q=80",
    amenities: ["Grama sintética monofilamento certificada", "Estructura techada bioclimática", "Balones oficiales Golty Futsal Pro incluidos", "Graderías para 150 personas", "Zona de hidratación y tercer tiempo"],
    rating: 4.8,
    reviewsCount: 62,
    availableHours: ["15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00"],
    ownerId: "user-vendor-1",
    ownerName: "Complejo Deportivo El Campín"
  },
  {
    id: "court-3",
    name: "Cancha Fútbol 5 Sintética Premium Pro",
    complexName: "Canchas El Poblado Club",
    location: "El Poblado, Medellín, Antioquia",
    sportType: "futbol5",
    surface: "sintetico_outdoor",
    pricePerHour: 95000,
    image: "https://images.unsplash.com/photo-1556056504-5c7696c4c28d?w=800&auto=format&fit=crop&q=80",
    amenities: ["Grama de última generación con caucho ecológico", "Iluminación nocturna profesional", "Petos numerados incluidos", "Vigilancia y parqueadero privado", "Zona BBQ y bar deportivo"],
    rating: 4.7,
    reviewsCount: 95,
    availableHours: ["17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00"],
    ownerId: "user-vendor-1",
    ownerName: "Complejo Deportivo El Campín"
  },
  {
    id: "court-4",
    name: "Cancha Fútbol 7 Híbrida & Sintética",
    complexName: "Coliseo Deportivo Laureles",
    location: "Laureles - Estadio, Medellín",
    sportType: "futbol7",
    surface: "sintetico_outdoor",
    pricePerHour: 180000,
    image: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=80",
    amenities: ["Medidas oficiales F7 reglamentarias", "Cámaras para transmisión y repetición de goles", "Vestuario para árbitros", "Tribuna techada", "Parqueadero para 60 vehículos"],
    rating: 4.9,
    reviewsCount: 110,
    availableHours: ["18:00", "19:00", "20:00", "21:00", "22:00"],
    ownerId: "user-vendor-1",
    ownerName: "Complejo Deportivo El Campín"
  },
  {
    id: "court-5",
    name: "Estadio Fútbol 11 Grama Natural Profesional",
    complexName: "Sede Deportiva La 10 - Cali",
    location: "Ciudad Jardín, Cali, Valle del Cauca",
    sportType: "futbol11",
    surface: "cesped_natural",
    pricePerHour: 340000,
    image: "https://images.unsplash.com/photo-1459865264687-595d652de67e?w=800&auto=format&fit=crop&q=80",
    amenities: ["Grama natural Bermuda con drenaje subterráneo", "Bancos técnicos reglamentarios", "Cabina de transmisión y sonido", "Camerinos profesionales con duchas y hielo", "Servicio médico de urgencia en sitio"],
    rating: 4.9,
    reviewsCount: 78,
    availableHours: ["10:00", "12:00", "15:00", "17:00", "19:00", "21:00"],
    ownerId: "user-vendor-1",
    ownerName: "Complejo Deportivo El Campín"
  }
];

// Seed Bookings
const today = new Date().toISOString().split("T")[0];
let bookings: Booking[] = [
  {
    id: "booking-101",
    courtId: "court-1",
    courtName: "Coliseo Principal Futsal Parquet FIFA",
    complexName: "Arena Futsal Chicó",
    sportType: "futsal",
    surface: "parquet",
    date: today,
    timeSlot: "20:00 - 21:00",
    durationHours: 1,
    customerId: "user-player-1",
    customerName: "Juan David Morales",
    customerEmail: "juandavid.futbol@email.com",
    customerPhone: "+57 312 458-9021",
    courtPrice: 130000,
    platformCommission: 10400,
    vendorPayout: 119600,
    totalPaid: 130000,
    status: "confirmada",
    paymentMethod: "pse",
    notes: "Torneo relámpago de microfútbol y futsal entre amigos",
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    qrCode: "FUT-RES-101-PARQUET"
  },
  {
    id: "booking-102",
    courtId: "court-3",
    courtName: "Cancha Fútbol 5 Sintética Premium Pro",
    complexName: "Canchas El Poblado Club",
    sportType: "futbol5",
    surface: "sintetico_outdoor",
    date: today,
    timeSlot: "22:00 - 23:00",
    durationHours: 1,
    customerId: "user-guest-2",
    customerName: "Andrés Gómez",
    customerEmail: "andres.gomez@futbol.com",
    customerPhone: "+57 310 987-6543",
    courtPrice: 95000,
    platformCommission: 7600,
    vendorPayout: 87400,
    totalPaid: 95000,
    status: "confirmada",
    paymentMethod: "nequi_daviplata",
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    qrCode: "FUT-RES-102-SINTETICO"
  }
];

// Seed Products (Valores COP y marcas icónicas colombianas como Golty)
let products: Product[] = [
  {
    id: "prod-1",
    name: "Zapatillas Futsal Joma Top Flex Rebound Piel Natural",
    description: "El calzado insignia para Futsal mundial. Piel natural de máxima flexibilidad con suela de caucho caramelo non-marking que garantiza tracción insuperable en parquet y coliseos cerrados.",
    price: 349000,
    originalPrice: 389000,
    category: "calzado",
    sportCategory: "futsal",
    brand: "Joma",
    sizes: ["39", "40", "41", "42", "43", "44"],
    stock: 14,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80",
    rating: 4.9,
    reviewsCount: 142,
    vendorId: "user-vendor-1",
    vendorName: "Tienda Oficial El Campín",
    isTrending: true,
    tags: ["futsal", "microfutbol", "suela caramelo", "parquet", "cuero"]
  },
  {
    id: "prod-2",
    name: "Balón Oficial Golty Origen / Futsal FIFA Quality Pro (Bajo Rebote)",
    description: "Balón oficial con tecnología de rebote controlado (medio pique) reglamentario en Colombia. Construcción termosellada CMI Plus con cámara de butilo rellena para precisión en duelos rápidos.",
    price: 145000,
    originalPrice: 165000,
    category: "balones",
    sportCategory: "futsal",
    brand: "Golty",
    sizes: ["N° 4 (Oficial Futsal)"],
    stock: 28,
    image: "https://images.unsplash.com/photo-1614632537423-1e6c2e7e0aab?w=600&auto=format&fit=crop&q=80",
    rating: 4.9,
    reviewsCount: 89,
    vendorId: "user-vendor-1",
    vendorName: "Tienda Oficial El Campín",
    isTrending: true,
    tags: ["futsal", "microfutbol", "golty", "medio pique", "fifa"]
  },
  {
    id: "prod-3",
    name: "Guayos de Fútbol Césped Sintético Nike Mercurial Vapor Pro TF",
    description: "Tapones de goma multidireccionales ideales para canchas de fútbol 5 y fútbol 7 de césped artificial en Colombia. Empeine microtexturado para control milimétrico a alta velocidad.",
    price: 420000,
    originalPrice: 470000,
    category: "calzado",
    sportCategory: "futbol",
    brand: "Nike",
    sizes: ["40", "41", "42", "42.5", "43", "44"],
    stock: 9,
    image: "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=600&auto=format&fit=crop&q=80",
    rating: 4.8,
    reviewsCount: 116,
    vendorId: "user-vendor-1",
    vendorName: "Tienda Oficial El Campín",
    isTrending: true,
    tags: ["futbol", "guayos", "turf", "sintetico"]
  },
  {
    id: "prod-4",
    name: "Guantes de Portero Pro Grip Látex Alemán Futsal & Fútbol 5",
    description: "Corte negativo híbrido con látex alemán Contact Grip de 4mm. Palma reforzada anti-abrasión para soportar la fricción en suelos duros y canchas sintéticas.",
    price: 185000,
    originalPrice: 210000,
    category: "guantes",
    sportCategory: "ambos",
    brand: "Reusch",
    sizes: ["8", "9", "10", "11"],
    stock: 12,
    image: "https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=600&auto=format&fit=crop&q=80",
    rating: 4.9,
    reviewsCount: 67,
    vendorId: "user-vendor-1",
    vendorName: "Tienda Oficial El Campín",
    tags: ["arquero", "portero", "guantes", "latex"]
  },
  {
    id: "prod-5",
    name: "Espinilleras Fibra de Carbono Ultralivianas con Mangas Compresivas",
    description: "Diseñadas para máxima protección sin pérdida de agilidad. Estructura anatómica con espuma EVA absorbe impactos frontales en choques de alta intensidad en partidos cerrados.",
    price: 78000,
    originalPrice: 95000,
    category: "canilleras",
    sportCategory: "ambos",
    brand: "Adidas",
    sizes: ["S", "M", "L"],
    stock: 35,
    image: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=600&auto=format&fit=crop&q=80",
    rating: 4.7,
    reviewsCount: 54,
    vendorId: "user-vendor-1",
    vendorName: "Tienda Oficial El Campín",
    tags: ["canilleras", "espinilleras", "proteccion"]
  },
  {
    id: "prod-6",
    name: "Pizarra Táctica Magnética Doble Cara Futsal & Fútbol 11",
    description: "Herramienta esencial para directores técnicos y capitanes. Cara A con cancha completa de futsal 40x20 y Cara B con cancha de fútbol campo. Incluye 24 fichas magnéticas y rotulador borrable.",
    price: 85000,
    category: "accesorios",
    sportCategory: "ambos",
    brand: "TacticsPro",
    sizes: ["Única (35x20cm)"],
    stock: 19,
    image: "https://images.unsplash.com/photo-1551958219-acbc608c6377?w=600&auto=format&fit=crop&q=80",
    rating: 4.9,
    reviewsCount: 43,
    vendorId: "user-vendor-1",
    vendorName: "Tienda Oficial El Campín",
    isTrending: false,
    tags: ["pizarra", "tactica", "futsal", "director tecnico"]
  },
  {
    id: "prod-7",
    name: "Medias Antideslizantes Grip Socks Pro para Fútbol y Futsal",
    description: "Almohadillas de silicona hexagonales en la base que evitan el deslizamiento del pie dentro del guayo o zapatilla, eliminando ampollas y aumentando la potencia en arranques.",
    price: 38000,
    originalPrice: 46000,
    category: "accesorios",
    sportCategory: "ambos",
    brand: "TruGrip",
    sizes: ["38-41", "42-45"],
    stock: 60,
    image: "https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=600&auto=format&fit=crop&q=80",
    rating: 4.8,
    reviewsCount: 198,
    vendorId: "user-vendor-1",
    vendorName: "Tienda Oficial El Campín",
    isTrending: true,
    tags: ["medias", "antideslizantes", "grip socks"]
  },
  {
    id: "prod-8",
    name: "Camiseta Oficial de Futsal Dry-Fit Transpirable Colombia Pro",
    description: "Tejido jacquard elástico ultra liviano con paneles de ventilación lateral. Diseñada para partidos de alta intensidad bajo techo o clima cálido.",
    price: 95000,
    category: "indumentaria",
    sportCategory: "futsal",
    brand: "Golty",
    sizes: ["S", "M", "L", "XL"],
    stock: 22,
    image: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=600&auto=format&fit=crop&q=80",
    rating: 4.6,
    reviewsCount: 38,
    vendorId: "user-vendor-1",
    vendorName: "Tienda Oficial El Campín",
    tags: ["camiseta", "futsal", "indumentaria", "colombia"]
  }
];

// Seed Orders
let orders: Order[] = [
  {
    id: "ord-201",
    customerId: "user-player-1",
    customerName: "Juan David Morales",
    customerEmail: "juandavid.futbol@email.com",
    customerPhone: "+57 312 458-9021",
    deliveryType: "retiro_en_cancha",
    items: [
      {
        productId: "prod-1",
        productName: "Zapatillas Futsal Joma Top Flex Rebound Piel Natural",
        price: 349000,
        quantity: 1,
        selectedSize: "41",
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80",
        vendorId: "user-vendor-1"
      },
      {
        productId: "prod-7",
        productName: "Medias Antideslizantes Grip Socks Pro para Fútbol y Futsal",
        price: 38000,
        quantity: 2,
        selectedSize: "38-41",
        image: "https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=600&auto=format&fit=crop&q=80",
        vendorId: "user-vendor-1"
      }
    ],
    subtotal: 425000,
    platformCommission: 25500,
    shippingFee: 0,
    total: 425000,
    status: "listo_para_retiro",
    paymentMethod: "pse",
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
  }
];

// Seed Notifications
let notifications: PushNotification[] = [
  {
    id: "notif-1",
    userId: "user-player-1",
    title: "¡Turno de Cancha Confirmado! ⚽",
    body: "Tu reserva en 'Coliseo Principal Futsal Parquet FIFA' para hoy a las 20:00 hs está asegurada. Tu código QR de acceso ya está listo en tu panel.",
    type: "reserva_confirmada",
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    read: false,
    actionUrl: "/canchas"
  },
  {
    id: "notif-2",
    userId: "user-player-1",
    title: "Oferta Exclusiva para tu Posición (Pivot) ⚡",
    body: "Como juegas habitualmente los jueves Futsal, tienes 20% OFF en balones Golty reglamentarios y $15.000 COP en tu próxima reserva de cancha.",
    type: "oferta_personalizada",
    timestamp: new Date(Date.now() - 3600000 * 6).toISOString(),
    read: false,
    promoCode: "FUTSAL-COL-20",
    discountBadge: "20% OFF"
  },
  {
    id: "notif-3",
    userId: "user-player-1",
    title: "Tu pedido está listo para retirar en la cancha 🛍️",
    body: "Tu pedido #ord-201 (Zapatillas Joma Top Flex y Medias Grip) te espera en la recepción del Complejo Deportivo El Campín.",
    type: "pedido_actualizado",
    timestamp: new Date(Date.now() - 3600000 * 18).toISOString(),
    read: true,
    actionUrl: "/pedidos"
  }
];

// ==========================================
// API ROUTES
// ==========================================

// SSE Endpoint
app.get("/api/events", (req: Request, res: Response) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  sseClients.add(res);

  // Send initial ping
  res.write(`event: connected\ndata: {"status":"live"}\n\n`);

  req.on("close", () => {
    sseClients.delete(res);
  });
});

// Users
app.get("/api/users", (req: Request, res: Response) => {
  res.json({ users });
});

app.patch("/api/users/:id/preferences", (req: Request, res: Response) => {
  const { id } = req.params;
  const user = users.find(u => u.id === id);
  if (!user) {
    res.status(404).json({ error: "Usuario no encontrado" });
    return;
  }
  user.preferences = { ...user.preferences, ...req.body };
  broadcastSSE("user_updated", user);
  res.json({ success: true, user });
});

// Courts
app.get("/api/courts", (req: Request, res: Response) => {
  res.json({ courts });
});

// Bookings
app.get("/api/bookings", (req: Request, res: Response) => {
  const { customerId, ownerId } = req.query;
  let filtered = bookings;
  if (customerId) {
    filtered = filtered.filter(b => b.customerId === customerId);
  }
  if (ownerId) {
    // find courts owned by this vendor
    const vendorCourts = courts.filter(c => c.ownerId === ownerId).map(c => c.id);
    filtered = filtered.filter(b => vendorCourts.includes(b.courtId));
  }
  res.json({ bookings: filtered });
});

app.post("/api/bookings", (req: Request, res: Response) => {
  const {
    courtId,
    date,
    timeSlot,
    customerId,
    customerName,
    customerEmail,
    customerPhone,
    paymentMethod,
    notes
  } = req.body;

  const court = courts.find(c => c.id === courtId);
  if (!court) {
    res.status(404).json({ error: "Cancha no encontrada" });
    return;
  }

  // Check collision for the same court on the same date and time slot
  const collision = bookings.find(
    b => b.courtId === courtId && b.date === date && b.timeSlot === timeSlot && b.status !== "cancelada"
  );
  if (collision) {
    res.status(409).json({ error: `El turno ${timeSlot} para el día ${date} ya se encuentra reservado.` });
    return;
  }

  const courtPrice = court.pricePerHour;
  const platformCommission = Math.round(courtPrice * platformConfig.commissionRateBookings);
  const vendorPayout = courtPrice - platformCommission;

  const newBooking: Booking = {
    id: `booking-${Date.now()}`,
    courtId,
    courtName: court.name,
    complexName: court.complexName,
    sportType: court.sportType,
    surface: court.surface,
    date,
    timeSlot,
    durationHours: 1,
    customerId: customerId || "user-player-1",
    customerName: customerName || "Juan David Morales",
    customerEmail: customerEmail || "juandavid.futbol@email.com",
    customerPhone: customerPhone || "+57 312 458-9021",
    courtPrice,
    platformCommission,
    vendorPayout,
    totalPaid: courtPrice,
    status: "confirmada",
    paymentMethod: paymentMethod || "pse",
    notes,
    createdAt: new Date().toISOString(),
    qrCode: `FUT-QR-${court.sportType.toUpperCase()}-${Date.now().toString().slice(-6)}`
  };

  bookings.unshift(newBooking);

  // Update platform stats
  platformConfig.totalBookingsVolume += courtPrice;
  platformConfig.totalPlatformRevenue += platformCommission;

  // Create push notification for customer
  const pushNotification: PushNotification = {
    id: `notif-${Date.now()}`,
    userId: newBooking.customerId,
    title: "¡Reserva Confirmada al Instante! 🏟️",
    body: `Tu turno en ${court.name} para el ${date} a las ${timeSlot} está confirmado. Total abonado: $${courtPrice.toLocaleString()} COP. Comisión de servicio: $${platformCommission.toLocaleString()} COP.`,
    type: "reserva_confirmada",
    timestamp: new Date().toISOString(),
    read: false,
    actionUrl: "/canchas"
  };
  notifications.unshift(pushNotification);

  // Notify via SSE
  broadcastSSE("booking_created", { booking: newBooking, notification: pushNotification });

  res.status(201).json({ success: true, booking: newBooking, notification: pushNotification });
});

app.patch("/api/bookings/:id/status", (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const booking = bookings.find(b => b.id === id);
  if (!booking) {
    res.status(404).json({ error: "Reserva no encontrada" });
    return;
  }

  booking.status = status;

  // Push notification about status update
  const notif: PushNotification = {
    id: `notif-${Date.now()}`,
    userId: booking.customerId,
    title: `Estado de Turno Actualizado: ${status.toUpperCase()}`,
    body: `Tu turno para ${booking.courtName} (${booking.date} ${booking.timeSlot}) ahora figura como: ${status}.`,
    type: "recordatorio_turno",
    timestamp: new Date().toISOString(),
    read: false,
    actionUrl: "/canchas"
  };
  notifications.unshift(notif);

  broadcastSSE("booking_updated", { booking, notification: notif });
  res.json({ success: true, booking });
});

// Products
app.get("/api/products", (req: Request, res: Response) => {
  res.json({ products });
});

app.post("/api/products", (req: Request, res: Response) => {
  const {
    name,
    description,
    price,
    category,
    sportCategory,
    brand,
    sizes,
    stock,
    image,
    vendorId,
    vendorName
  } = req.body;

  if (!name || !price || !category) {
    res.status(400).json({ error: "Datos del producto incompletos" });
    return;
  }

  const newProduct: Product = {
    id: `prod-${Date.now()}`,
    name,
    description: description || "Artículo deportivo para fútbol y futsal.",
    price: Number(price),
    category,
    sportCategory: sportCategory || "futsal",
    brand: brand || "Generico",
    sizes: sizes && sizes.length ? sizes : ["Única"],
    stock: Number(stock) || 10,
    image: image || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80",
    rating: 5.0,
    reviewsCount: 1,
    vendorId: vendorId || "user-vendor-1",
    vendorName: vendorName || "Complejo El Golazo",
    tags: [sportCategory, category]
  };

  products.unshift(newProduct);
  broadcastSSE("product_created", newProduct);
  res.status(201).json({ success: true, product: newProduct });
});

app.patch("/api/products/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  const product = products.find(p => p.id === id);
  if (!product) {
    res.status(404).json({ error: "Producto no encontrado" });
    return;
  }

  Object.assign(product, req.body);
  broadcastSSE("product_updated", product);
  res.json({ success: true, product });
});

// Orders
app.get("/api/orders", (req: Request, res: Response) => {
  res.json({ orders });
});

app.post("/api/orders", (req: Request, res: Response) => {
  const {
    customerId,
    customerName,
    customerEmail,
    customerPhone,
    deliveryType,
    deliveryAddress,
    items,
    paymentMethod
  } = req.body;

  if (!items || !items.length) {
    res.status(400).json({ error: "El carrito está vacío" });
    return;
  }

  let subtotal = 0;
  for (const item of items) {
    subtotal += item.price * item.quantity;
    // Decrement stock
    const prod = products.find(p => p.id === item.productId);
    if (prod) {
      prod.stock = Math.max(0, prod.stock - item.quantity);
    }
  }

  const shippingFee = deliveryType === "envio_domicilio" ? 12000 : 0;
  const platformCommission = Math.round(subtotal * platformConfig.commissionRateProducts);
  const total = subtotal + shippingFee;

  const newOrder: Order = {
    id: `ord-${Date.now().toString().slice(-5)}`,
    customerId: customerId || "user-player-1",
    customerName: customerName || "Juan David Morales",
    customerEmail: customerEmail || "juandavid.futbol@email.com",
    customerPhone: customerPhone || "+57 312 458-9021",
    deliveryType: deliveryType || "retiro_en_cancha",
    deliveryAddress,
    items,
    subtotal,
    platformCommission,
    shippingFee,
    total,
    status: "pendiente",
    paymentMethod: paymentMethod || "pse",
    createdAt: new Date().toISOString()
  };

  orders.unshift(newOrder);

  // Update platform stats
  platformConfig.totalProductsVolume += subtotal;
  platformConfig.totalPlatformRevenue += platformCommission;

  // Push notification
  const notif: PushNotification = {
    id: `notif-${Date.now()}`,
    userId: newOrder.customerId,
    title: "¡Pedido Confirmado con Éxito! 📦",
    body: `Tu compra #${newOrder.id} por $${total.toLocaleString()} fue procesada. ${deliveryType === 'retiro_en_cancha' ? 'Podrás retirarlo al terminar tu turno en la cancha.' : 'En breve se despachará a tu domicilio.'}`,
    type: "pedido_actualizado",
    timestamp: new Date().toISOString(),
    read: false,
    actionUrl: "/pedidos"
  };
  notifications.unshift(notif);

  broadcastSSE("order_created", { order: newOrder, notification: notif });
  res.status(201).json({ success: true, order: newOrder, notification: notif });
});

app.patch("/api/orders/:id/status", (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const order = orders.find(o => o.id === id);
  if (!order) {
    res.status(404).json({ error: "Pedido no encontrado" });
    return;
  }

  order.status = status;

  const notif: PushNotification = {
    id: `notif-${Date.now()}`,
    userId: order.customerId,
    title: `Estado de Pedido Actualizado: ${status.replace('_', ' ').toUpperCase()}`,
    body: `El pedido #${order.id} ha cambiado de estado a: ${status}.`,
    type: "pedido_actualizado",
    timestamp: new Date().toISOString(),
    read: false,
    actionUrl: "/pedidos"
  };
  notifications.unshift(notif);

  broadcastSSE("order_updated", { order, notification: notif });
  res.json({ success: true, order });
});

// Notifications
app.get("/api/notifications", (req: Request, res: Response) => {
  const { userId } = req.query;
  let list = notifications;
  if (userId) {
    list = list.filter(n => n.userId === userId || n.userId === "all");
  }
  res.json({ notifications: list });
});

app.post("/api/notifications/read-all", (req: Request, res: Response) => {
  const { userId } = req.body;
  notifications.forEach(n => {
    if (!userId || n.userId === userId) {
      n.read = true;
    }
  });
  res.json({ success: true });
});

app.post("/api/notifications/send", (req: Request, res: Response) => {
  const { userId, title, body, type, promoCode, discountBadge } = req.body;
  const newNotif: PushNotification = {
    id: `notif-${Date.now()}`,
    userId: userId || "user-player-1",
    title: title || "Notificación de Fútbol y Futsal",
    body: body || "Novedad en el marketplace y sistema de canchas.",
    type: type || "oferta_personalizada",
    timestamp: new Date().toISOString(),
    read: false,
    promoCode,
    discountBadge
  };
  notifications.unshift(newNotif);
  broadcastSSE("notification_created", newNotif);
  res.status(201).json({ success: true, notification: newNotif });
});

// Analytics & Commission stats
app.get("/api/analytics", (req: Request, res: Response) => {
  // Compute analytics
  const totalBookings = bookings.length;
  const totalOrders = orders.length;

  const futsalBookings = bookings.filter(b => b.sportType === "futsal").length;
  const futbolBookings = bookings.filter(b => b.sportType !== "futsal").length;

  const totalBookingRevenue = bookings.reduce((sum, b) => sum + (b.status !== "cancelada" ? b.courtPrice : 0), 0);
  const totalBookingCommission = bookings.reduce((sum, b) => sum + (b.status !== "cancelada" ? b.platformCommission : 0), 0);

  const totalProductRevenue = orders.reduce((sum, o) => sum + o.subtotal, 0);
  const totalProductCommission = orders.reduce((sum, o) => sum + o.platformCommission, 0);

  // Peak hours calculation
  const hourCounts: Record<string, number> = {};
  bookings.forEach(b => {
    const startHour = b.timeSlot.split(" - ")[0] || "20:00";
    hourCounts[startHour] = (hourCounts[startHour] || 0) + 1;
  });

  // Top products
  const productSales: Record<string, { name: string; units: number; revenue: number }> = {};
  orders.forEach(o => {
    o.items.forEach(it => {
      if (!productSales[it.productId]) {
        productSales[it.productId] = { name: it.productName, units: 0, revenue: 0 };
      }
      productSales[it.productId].units += it.quantity;
      productSales[it.productId].revenue += it.price * it.quantity;
    });
  });

  res.json({
    platformConfig,
    summary: {
      totalBookings,
      totalOrders,
      futsalRatio: totalBookings ? Math.round((futsalBookings / totalBookings) * 100) : 55,
      futbolRatio: totalBookings ? Math.round((futbolBookings / totalBookings) * 100) : 45,
      totalBookingRevenue,
      totalBookingCommission,
      totalProductRevenue,
      totalProductCommission,
      netTotalPlatformRevenue: totalBookingCommission + totalProductCommission,
      hourCounts,
      topProducts: Object.values(productSales)
    }
  });
});

// ==========================================
// GEMINI AI INTEGRATIONS (SERVER-SIDE ONLY)
// ==========================================

// 1. AI Market Trends & Business Intelligence
app.post("/api/ai/market-trends", async (req: Request, res: Response) => {
  try {
    const ai = getGeminiClient();
    const { customFocus } = req.body;

    const sampleMarketStats = {
      futsalVsFutbolBookings: { futsal: "64%", futbol: "36%" },
      peakHours: "20:00 - 22:00 (Ocupación 96%)",
      topSellingCategories: ["Zapatillas Futsal Suela Caramelo", "Balones Golty Medio Pique", "Medias Antideslizantes Grip"],
      averageTicketProducts: "$185,000 COP",
      averageCourtPrice: "$120,000 COP / hora",
      platformCommissionEarned: `$${platformConfig.totalPlatformRevenue.toLocaleString()} COP`,
      currentTrends: "Auge en reservas de Futsal parquet y microfútbol en Bogotá y Medellín, alta demanda de balones Golty reglamentarios y zapatillas Joma Top Flex."
    };

    if (!ai) {
      // Fallback response with structured intelligence if API key not present yet
      res.json({
        trends: [
          {
            title: "Fiebre por Futsal y Microfútbol en Canchas Techadas",
            badge: "Tendencia #1",
            insight: "El 64% de las reservas en ciudades principales (Bogotá, Medellín, Cali) se concentran en canchas de Futsal parquet y sintético cubierto, con demanda récord de 19:00 a 22:00 hs.",
            strategy: "Implementar precios dinámicos (+15% en franja nocturna pico) y combos que incluyan alquiler de balones Golty de medio pique.",
            impact: "+26% en comisiones estimadas de plataforma"
          },
          {
            title: "Calzado Específico: Suela Caramelo y Guayos Sintéticos",
            badge: "Alta Conversión",
            insight: "El calzado con suela non-marking para Futsal y guayos para sintética representan el 62% de las compras deportivas en el marketplace.",
            strategy: "Vincular la confirmación del turno con una notificación push del 15% de descuento en calzado y medias grip.",
            impact: "Aumento de ticket promedio en $45.000 COP"
          },
          {
            title: "Pagos Digitales Inmediatos (PSE y Nequi/Daviplata)",
            badge: "Monetización Ágil",
            insight: "Más del 85% de los usuarios colombianos abonan mediante PSE o billeteras digitales para asegurar el turno al instante.",
            strategy: "Mantener liquidación bancaria automática para complejos deportivos con retención de comisión transparente del 8%.",
            impact: "+18% en velocidad de conversión"
          }
        ],
        strategicSummary: "El mercado colombiano muestra un arraigo sobresaliente por el fútbol de salón (futsal/microfútbol) y fútbol 5 en días laborales. La retención de comisión del 8% en canchas y 6% en marketplace ofrece un modelo de negocio altamente rentable con excelente adopción de pagos PSE y Nequi."
      });
      return;
    }

    const prompt = `Actúa como el Director de Inteligencia de Negocios y Analítica de Mercados Deportivos de un Marketplace de Fútbol, Futsal y Reserva de Canchas.
    Analiza las métricas actuales del mercado:
    ${JSON.stringify(sampleMarketStats)}
    Enfoque solicitado: ${customFocus || "Tendencias generales de mercado, optimización de comisiones de plataforma y preferencias de consumo de los jugadores de fútbol y futsal"}.

    Genera un análisis profesional en español en formato JSON con la siguiente estructura:
    {
      "trends": [
        {
          "title": "Nombre de la tendencia clave",
          "badge": "Etiqueta corta (ej. 'Alta Demanda', 'Oportunidad')",
          "insight": "Explicación del comportamiento de los usuarios y datos del mercado",
          "strategy": "Acción estratégica recomendada para maximizar ingresos y comisiones",
          "impact": "Métrica proyectada de beneficio"
        }
      ],
      "strategicSummary": "Párrafo conciso con la visión general del mercado actual, recomendaciones de comisiones y cómo captar más clientes."
    }
    Devuelve estrictamente el JSON sin formato Markdown adicional.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json(parsed);
  } catch (error: any) {
    console.error("Error en AI Market Trends:", error);
    res.status(500).json({ error: "Error al generar análisis con IA", details: error.message });
  }
});

// 2. AI Personalized Offers & Push Notifications Generator
app.post("/api/ai/personalized-offers", async (req: Request, res: Response) => {
  try {
    const ai = getGeminiClient();
    const { userId } = req.body;
    const user = users.find(u => u.id === (userId || "user-player-1")) || users[0];
    const userBookings = bookings.filter(b => b.customerId === user.id);
    const userOrders = orders.filter(o => o.customerId === user.id);

    if (!ai) {
      // High-quality personalized fallback
      const generatedOffer = {
        title: `¡Promo Especial para tu Futsal de los ${user.preferences.preferredDays[0] || 'Jueves'}! ⚽`,
        body: `Hola ${user.name}, sabemos que juegas como ${user.preferences.favoritePosition}. Te obsequiamos 20% OFF en zapatillas ${user.preferences.favoriteBrand} talla ${user.preferences.shoeSize} y $15.000 COP de descuento en tu próximo turno.`,
        promoCode: "FUTSAL-COL-20",
        discountBadge: "20% OFF",
        targetProduct: "Zapatillas Futsal Joma Top Flex Rebound",
        targetCourt: "Coliseo Principal Futsal Parquet FIFA",
        reasoning: "El usuario reserva habitualmente canchas de parquet en horario nocturno y prefiere equipamiento para control de balón en coliseo."
      };
      res.json({ offer: generatedOffer });
      return;
    }

    const prompt = `Eres el motor de personalización y marketing con Inteligencia Artificial de una plataforma deportiva de fútbol y futsal.
    Analiza el perfil y hábitos del usuario:
    - Nombre: ${user.name}
    - Deporte preferido: ${user.preferences.primarySport}
    - Posición: ${user.preferences.favoritePosition}
    - Días habituales: ${user.preferences.preferredDays.join(", ")}
    - Horarios preferidos: ${user.preferences.preferredHours.join(", ")}
    - Talle de calzado: ${user.preferences.shoeSize}
    - Marca favorita: ${user.preferences.favoriteBrand}
    - Historial de reservas recientes: ${userBookings.length} turnos
    - Historial de pedidos: ${userOrders.length} compras

    Genera una oferta push hiperpersonalizada y tentadora para incentivar una nueva reserva de cancha o compra de accesorios en formato JSON:
    {
      "title": "Título corto y llamativo para notificación push móvil (con emoji)",
      "body": "Texto persuasivo de 2 frases mencionando su posición o día preferido de juego",
      "promoCode": "CÓDIGO-DESCUENTO-UNICO",
      "discountBadge": "ej. 25% OFF o 2x1",
      "targetProduct": "Nombre de producto recomendado",
      "targetCourt": "Nombre o tipo de cancha sugerida",
      "reasoning": "Breve justificación de por qué esta oferta encaja con su historial"
    }
    Devuelve estrictamente el JSON sin formato Markdown adicional.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json({ offer: parsed });
  } catch (error: any) {
    console.error("Error en AI Personalized Offers:", error);
    res.status(500).json({ error: "Error al generar oferta personalizada", details: error.message });
  }
});

// Vite middleware & production fallback
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Futbol & Futsal Marketplace] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
