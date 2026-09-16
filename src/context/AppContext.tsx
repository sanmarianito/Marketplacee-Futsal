import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { 
  Court, 
  Booking, 
  Product, 
  Order, 
  PushNotification, 
  UserProfile, 
  CartItem, 
  PlatformConfig 
} from "../types.js";

interface AppContextType {
  currentUser: UserProfile;
  setCurrentUser: (user: UserProfile) => void;
  users: UserProfile[];
  switchUserRole: (role: 'customer' | 'vendor' | 'admin') => void;
  courts: Court[];
  bookings: Booking[];
  products: Product[];
  orders: Order[];
  notifications: PushNotification[];
  unreadNotifsCount: number;
  cart: CartItem[];
  addToCart: (product: Product, selectedSize?: string) => void;
  removeFromCart: (productId: string, size?: string) => void;
  updateCartQuantity: (productId: string, quantity: number, size?: string) => void;
  clearCart: () => void;
  createBooking: (bookingData: Partial<Booking>) => Promise<{ success: boolean; booking?: Booking; error?: string }>;
  cancelBooking: (bookingId: string) => Promise<boolean>;
  updateBookingStatus: (bookingId: string, status: Booking['status']) => Promise<boolean>;
  createOrder: (orderData: any) => Promise<{ success: boolean; order?: Order; error?: string }>;
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<boolean>;
  addProduct: (productData: Partial<Product>) => Promise<boolean>;
  updateProductStock: (productId: string, newStock: number) => Promise<boolean>;
  updateUserPreferences: (preferences: any) => Promise<boolean>;
  markNotificationsAsRead: () => void;
  triggerPushNotification: (notifData: Partial<PushNotification>) => Promise<boolean>;
  activeNotification: PushNotification | null;
  dismissActiveNotification: () => void;
  platformConfig: PlatformConfig;
  analyticsData: any;
  refreshAnalytics: () => void;
  isConnectedLive: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile>({
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
  });

  const [courts, setCourts] = useState<Court[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [notifications, setNotifications] = useState<PushNotification[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeNotification, setActiveNotification] = useState<PushNotification | null>(null);
  const [isConnectedLive, setIsConnectedLive] = useState(false);
  const [platformConfig, setPlatformConfig] = useState<PlatformConfig>({
    commissionRateBookings: 0.08,
    commissionRateProducts: 0.06,
    totalPlatformRevenue: 154000,
    totalBookingsVolume: 1250000,
    totalProductsVolume: 890000,
  });
  const [analyticsData, setAnalyticsData] = useState<any>(null);

  // Play subtle sound for push notification
  const playNotificationSound = useCallback(() => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);
    } catch {
      // Audio context might be restricted before user interaction
    }
  }, []);

  const showPushPopup = useCallback((notif: PushNotification) => {
    setActiveNotification(notif);
    playNotificationSound();

    // Check Native Web Notification
    if ("Notification" in window && Notification.permission === "granted") {
      try {
        new Notification(notif.title, {
          body: notif.body,
          icon: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=100&auto=format&fit=crop&q=80"
        });
      } catch (err) {
        console.warn("Native notification error:", err);
      }
    }
  }, [playNotificationSound]);

  // Initial fetch
  const fetchAllData = useCallback(async () => {
    try {
      const [resUsers, resCourts, resBookings, resProducts, resOrders, resNotifs, resAnalytics] = await Promise.all([
        fetch("/api/users").then(r => r.json()),
        fetch("/api/courts").then(r => r.json()),
        fetch("/api/bookings").then(r => r.json()),
        fetch("/api/products").then(r => r.json()),
        fetch("/api/orders").then(r => r.json()),
        fetch("/api/notifications").then(r => r.json()),
        fetch("/api/analytics").then(r => r.json())
      ]);

      if (resUsers?.users) {
        setUsers(resUsers.users);
        const player = resUsers.users.find((u: UserProfile) => u.id === currentUser.id);
        if (player) setCurrentUser(player);
      }
      if (resCourts?.courts) setCourts(resCourts.courts);
      if (resBookings?.bookings) setBookings(resBookings.bookings);
      if (resProducts?.products) setProducts(resProducts.products);
      if (resOrders?.orders) setOrders(resOrders.orders);
      if (resNotifs?.notifications) setNotifications(resNotifs.notifications);
      if (resAnalytics) {
        setAnalyticsData(resAnalytics);
        if (resAnalytics.platformConfig) setPlatformConfig(resAnalytics.platformConfig);
      }
    } catch (err) {
      console.error("Error fetching initial data:", err);
    }
  }, [currentUser.id]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Real-time SSE Connection
  useEffect(() => {
    const eventSource = new EventSource("/api/events");

    eventSource.onopen = () => {
      setIsConnectedLive(true);
    };

    eventSource.addEventListener("connected", () => {
      setIsConnectedLive(true);
    });

    eventSource.addEventListener("booking_created", (event: any) => {
      const payload = JSON.parse(event.data);
      if (payload.booking) {
        setBookings(prev => [payload.booking, ...prev.filter(b => b.id !== payload.booking.id)]);
      }
      if (payload.notification) {
        setNotifications(prev => [payload.notification, ...prev]);
        showPushPopup(payload.notification);
      }
      fetchAllData();
    });

    eventSource.addEventListener("booking_updated", (event: any) => {
      const payload = JSON.parse(event.data);
      if (payload.booking) {
        setBookings(prev => prev.map(b => b.id === payload.booking.id ? payload.booking : b));
      }
      if (payload.notification) {
        setNotifications(prev => [payload.notification, ...prev]);
        showPushPopup(payload.notification);
      }
      fetchAllData();
    });

    eventSource.addEventListener("order_created", (event: any) => {
      const payload = JSON.parse(event.data);
      if (payload.order) {
        setOrders(prev => [payload.order, ...prev.filter(o => o.id !== payload.order.id)]);
      }
      if (payload.notification) {
        setNotifications(prev => [payload.notification, ...prev]);
        showPushPopup(payload.notification);
      }
      fetchAllData();
    });

    eventSource.addEventListener("order_updated", (event: any) => {
      const payload = JSON.parse(event.data);
      if (payload.order) {
        setOrders(prev => prev.map(o => o.id === payload.order.id ? payload.order : o));
      }
      if (payload.notification) {
        setNotifications(prev => [payload.notification, ...prev]);
        showPushPopup(payload.notification);
      }
      fetchAllData();
    });

    eventSource.addEventListener("product_created", (event: any) => {
      const newProd = JSON.parse(event.data);
      setProducts(prev => [newProd, ...prev]);
    });

    eventSource.addEventListener("product_updated", (event: any) => {
      const updatedProd = JSON.parse(event.data);
      setProducts(prev => prev.map(p => p.id === updatedProd.id ? updatedProd : p));
    });

    eventSource.addEventListener("notification_created", (event: any) => {
      const notif = JSON.parse(event.data);
      setNotifications(prev => [notif, ...prev]);
      showPushPopup(notif);
    });

    eventSource.onerror = () => {
      setIsConnectedLive(false);
    };

    return () => {
      eventSource.close();
    };
  }, [fetchAllData, showPushPopup]);

  const switchUserRole = (role: 'customer' | 'vendor' | 'admin') => {
    const targetUser = users.find(u => u.role === role);
    if (targetUser) {
      setCurrentUser(targetUser);
    }
  };

  // Cart operations
  const addToCart = (product: Product, selectedSize?: string) => {
    setCart(prev => {
      const existingIndex = prev.findIndex(
        item => item.product.id === product.id && item.selectedSize === selectedSize
      );
      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex].quantity += 1;
        return next;
      }
      return [...prev, { product, quantity: 1, selectedSize: selectedSize || product.sizes[0] || "Única" }];
    });
  };

  const removeFromCart = (productId: string, size?: string) => {
    setCart(prev => prev.filter(item => !(item.product.id === productId && (!size || item.selectedSize === size))));
  };

  const updateCartQuantity = (productId: string, quantity: number, size?: string) => {
    if (quantity <= 0) {
      removeFromCart(productId, size);
      return;
    }
    setCart(prev => prev.map(item => {
      if (item.product.id === productId && (!size || item.selectedSize === size)) {
        return { ...item, quantity };
      }
      return item;
    }));
  };

  const clearCart = () => setCart([]);

  // Create booking
  const createBooking = async (bookingData: Partial<Booking>) => {
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...bookingData,
          customerId: currentUser.id,
          customerName: currentUser.name,
          customerEmail: currentUser.email,
          customerPhone: currentUser.phone
        })
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || "No se pudo concretar la reserva" };
      }
      return { success: true, booking: data.booking };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const cancelBooking = async (bookingId: string) => {
    return updateBookingStatus(bookingId, "cancelada");
  };

  const updateBookingStatus = async (bookingId: string, status: Booking['status']) => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      return res.ok;
    } catch {
      return false;
    }
  };

  // Orders
  const createOrder = async (orderData: any) => {
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...orderData,
          customerId: currentUser.id,
          customerName: currentUser.name,
          customerEmail: currentUser.email,
          customerPhone: currentUser.phone
        })
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || "Error al procesar el pedido" };
      }
      clearCart();
      return { success: true, order: data.order };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      return res.ok;
    } catch {
      return false;
    }
  };

  // Products
  const addProduct = async (productData: Partial<Product>) => {
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...productData,
          vendorId: currentUser.id,
          vendorName: currentUser.complexName || currentUser.name
        })
      });
      return res.ok;
    } catch {
      return false;
    }
  };

  const updateProductStock = async (productId: string, newStock: number) => {
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock: newStock })
      });
      return res.ok;
    } catch {
      return false;
    }
  };

  // User preferences
  const updateUserPreferences = async (preferences: any) => {
    try {
      const res = await fetch(`/api/users/${currentUser.id}/preferences`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preferences)
      });
      if (res.ok) {
        setCurrentUser(prev => ({ ...prev, preferences: { ...prev.preferences, ...preferences } }));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  // Notifications
  const markNotificationsAsRead = async () => {
    try {
      await fetch("/api/notifications/read-all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser.id })
      });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const triggerPushNotification = async (notifData: Partial<PushNotification>) => {
    try {
      const res = await fetch("/api/notifications/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...notifData,
          userId: notifData.userId || currentUser.id
        })
      });
      return res.ok;
    } catch {
      return false;
    }
  };

  const dismissActiveNotification = () => {
    setActiveNotification(null);
  };

  const refreshAnalytics = () => {
    fetch("/api/analytics")
      .then(r => r.json())
      .then(data => {
        setAnalyticsData(data);
        if (data.platformConfig) setPlatformConfig(data.platformConfig);
      });
  };

  const unreadNotifsCount = notifications.filter(n => !n.read && (n.userId === currentUser.id || n.userId === "all")).length;

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        users,
        switchUserRole,
        courts,
        bookings,
        products,
        orders,
        notifications,
        unreadNotifsCount,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        createBooking,
        cancelBooking,
        updateBookingStatus,
        createOrder,
        updateOrderStatus,
        addProduct,
        updateProductStock,
        updateUserPreferences,
        markNotificationsAsRead,
        triggerPushNotification,
        activeNotification,
        dismissActiveNotification,
        platformConfig,
        analyticsData,
        refreshAnalytics,
        isConnectedLive
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
