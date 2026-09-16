export type SportCategory = 'futsal' | 'futbol' | 'ambos';
export type CourtSportType = 'futsal' | 'futbol5' | 'futbol7' | 'futbol11';
export type SurfaceType = 'parquet' | 'sintetico_indoor' | 'sintetico_outdoor' | 'cesped_natural';
export type ProductCategory = 'calzado' | 'balones' | 'indumentaria' | 'guantes' | 'canilleras' | 'accesorios';

export interface Court {
  id: string;
  name: string;
  complexName: string;
  location: string;
  sportType: CourtSportType;
  surface: SurfaceType;
  pricePerHour: number;
  image: string;
  amenities: string[];
  rating: number;
  reviewsCount: number;
  availableHours: string[]; // e.g., ["14:00", "15:00", "16:00", ...]
  ownerId: string;
  ownerName: string;
}

export interface Booking {
  id: string;
  courtId: string;
  courtName: string;
  complexName: string;
  sportType: CourtSportType;
  surface: SurfaceType;
  date: string; // YYYY-MM-DD
  timeSlot: string; // e.g. "20:00 - 21:00"
  durationHours: number;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  courtPrice: number;
  platformCommission: number;
  vendorPayout: number;
  totalPaid: number;
  status: 'confirmada' | 'en_curso' | 'completada' | 'cancelada';
  paymentMethod: 'tarjeta' | 'pse' | 'nequi_daviplata' | 'transferencia' | 'efectivo_en_cancha' | 'mercado_pago';
  notes?: string;
  createdAt: string;
  qrCode: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: ProductCategory;
  sportCategory: SportCategory;
  brand: string;
  sizes: string[];
  stock: number;
  image: string;
  rating: number;
  reviewsCount: number;
  vendorId: string;
  vendorName: string;
  isTrending?: boolean;
  tags: string[];
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  selectedSize?: string;
  image: string;
  vendorId: string;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryType: 'envio_domicilio' | 'retiro_en_cancha';
  deliveryAddress?: string;
  items: OrderItem[];
  subtotal: number;
  platformCommission: number;
  shippingFee: number;
  total: number;
  status: 'pendiente' | 'preparando' | 'en_camino' | 'listo_para_retiro' | 'entregado';
  paymentMethod: 'tarjeta' | 'pse' | 'nequi_daviplata' | 'transferencia' | 'mercado_pago';
  createdAt: string;
}

export interface UserPreferences {
  primarySport: 'futsal' | 'futbol' | 'ambos';
  favoritePosition: 'Pivot' | 'Ala' | 'Cierre' | 'Arquero' | 'Delantero' | 'Mediocampista' | 'Defensor';
  preferredDays: string[];
  preferredHours: string[];
  shoeSize: string;
  clothingSize: string;
  favoriteBrand: string;
  notificationsEnabled: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'customer' | 'vendor' | 'admin';
  avatar: string;
  complexName?: string;
  businessName?: string;
  preferences: UserPreferences;
}

export interface PushNotification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: 'reserva_confirmada' | 'pedido_actualizado' | 'oferta_personalizada' | 'tendencia_mercado' | 'recordatorio_turno';
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  promoCode?: string;
  discountBadge?: string;
}

export interface MarketTrend {
  id: string;
  metric: string;
  value: string;
  change: string;
  direction: 'up' | 'down' | 'neutral';
  insight: string;
  category: 'futsal' | 'futbol' | 'horarios' | 'comisiones' | 'calzado';
}

export interface PlatformConfig {
  commissionRateBookings: number; // e.g. 0.08 (8%)
  commissionRateProducts: number; // e.g. 0.06 (6%)
  totalPlatformRevenue: number;
  totalBookingsVolume: number;
  totalProductsVolume: number;
}
