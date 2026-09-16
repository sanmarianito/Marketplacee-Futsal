/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { AppProvider, useApp } from "./context/AppContext.js";
import { Navbar } from "./components/Navbar.js";
import { CourtBookingView } from "./components/CourtBookingView.js";
import { MarketplaceView } from "./components/MarketplaceView.js";
import { UserDashboard } from "./components/UserDashboard.js";
import { VendorDashboard } from "./components/VendorDashboard.js";
import { AdminAnalyticsView } from "./components/AdminAnalyticsView.js";
import { PushNotificationToast } from "./components/PushNotificationToast.js";
import { NotificationCenterModal } from "./components/NotificationCenterModal.js";
import { Trophy, ShieldCheck, Heart, Radio } from "lucide-react";

function MainContent() {
  const [activeTab, setActiveTab] = useState<string>("courts");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const { currentUser, isConnectedLive, platformConfig } = useApp();

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-neutral-950">
      
      {/* Real-time Push Notification Toast popup */}
      <PushNotificationToast onOpenNotifications={() => setIsNotificationsOpen(true)} />

      {/* Notification Center Modal */}
      <NotificationCenterModal 
        isOpen={isNotificationsOpen} 
        onClose={() => setIsNotificationsOpen(false)} 
      />

      {/* Main Top Header Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === "courts" && (
          <CourtBookingView onNavigateToDashboard={() => setActiveTab("dashboard")} />
        )}

        {activeTab === "marketplace" && (
          <MarketplaceView 
            isCartOpen={isCartOpen} 
            setIsCartOpen={setIsCartOpen}
            onNavigateToDashboard={() => setActiveTab("dashboard")} 
          />
        )}

        {activeTab === "dashboard" && (
          <div>
            {currentUser.role === "customer" && (
              <UserDashboard 
                onNavigateToCourts={() => setActiveTab("courts")}
                onNavigateToStore={() => setActiveTab("marketplace")}
              />
            )}
            {currentUser.role === "vendor" && <VendorDashboard />}
            {currentUser.role === "admin" && <AdminAnalyticsView />}
          </div>
        )}

        {activeTab === "analytics" && <AdminAnalyticsView />}
      </main>

      {/* Global Footer */}
      <footer className="w-full bg-neutral-900 border-t border-neutral-800/80 py-8 px-4 sm:px-6 lg:px-8 text-xs text-neutral-400 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Trophy className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-white font-serif">FutHub</span>
            <span>— Plataforma & Marketplace de Futsal y Fútbol</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px]">
            <span className="flex items-center gap-1 text-emerald-400 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              Comisión Transparente: {(platformConfig.commissionRateBookings * 100).toFixed(0)}% canchas / {(platformConfig.commissionRateProducts * 100).toFixed(0)}% tienda
            </span>
            <span className="text-neutral-600">•</span>
            <span className="flex items-center gap-1 font-mono">
              <Radio className="w-3 h-3 text-emerald-400" />
              {isConnectedLive ? "Conexión SSE en tiempo real activa" : "Modo desconectado"}
            </span>
            <span className="text-neutral-600">•</span>
            <span>Notificaciones Push y Ofertas con Gemini IA</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}

