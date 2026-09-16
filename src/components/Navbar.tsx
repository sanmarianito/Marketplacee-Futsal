import React, { useState } from "react";
import { useApp } from "../context/AppContext.js";
import { 
  Trophy, 
  Calendar, 
  ShoppingBag, 
  LayoutDashboard, 
  TrendingUp, 
  Bell, 
  ShoppingCart, 
  UserCheck, 
  Building2, 
  ShieldCheck, 
  Radio 
} from "lucide-react";

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenCart: () => void;
  onOpenNotifications: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenCart,
  onOpenNotifications
}) => {
  const { 
    currentUser, 
    switchUserRole, 
    cart, 
    unreadNotifsCount, 
    isConnectedLive 
  } = useApp();

  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="sticky top-0 z-40 w-full bg-neutral-950/80 backdrop-blur-xl border-b border-neutral-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand Logo & Name */}
          <div 
            onClick={() => setActiveTab("courts")}
            className="flex items-center gap-3 cursor-pointer select-none group"
            id="brand-logo"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-neutral-950 group-hover:scale-105 transition">
              <Trophy className="w-5 h-5 fill-neutral-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-white font-serif">
                  FutHub
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold uppercase">
                  Futsal & Fútbol
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 -mt-0.5 hidden sm:block">
                Marketplace & Reservas en Tiempo Real
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-neutral-900/90 p-1 rounded-2xl border border-neutral-800">
            <button
              id="tab-nav-courts"
              onClick={() => setActiveTab("courts")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                activeTab === "courts"
                  ? "bg-emerald-500 text-neutral-950 shadow-md shadow-emerald-500/20"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-800/50"
              }`}
            >
              <Calendar className="w-4 h-4" />
              Canchas & Turnos
            </button>
            <button
              id="tab-nav-marketplace"
              onClick={() => setActiveTab("marketplace")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                activeTab === "marketplace"
                  ? "bg-emerald-500 text-neutral-950 shadow-md shadow-emerald-500/20"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-800/50"
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              Tienda Deportiva
            </button>
            <button
              id="tab-nav-dashboard"
              onClick={() => setActiveTab("dashboard")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                activeTab === "dashboard"
                  ? "bg-emerald-500 text-neutral-950 shadow-md shadow-emerald-500/20"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-800/50"
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Mi Panel ({currentUser.role === 'customer' ? 'Jugador' : currentUser.role === 'vendor' ? 'Vendedor' : 'Admin'})
            </button>
            <button
              id="tab-nav-analytics"
              onClick={() => setActiveTab("analytics")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                activeTab === "analytics"
                  ? "bg-emerald-500 text-neutral-950 shadow-md shadow-emerald-500/20"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-800/50"
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              Tendencias & Comisiones
            </button>
          </nav>

          {/* Right actions: Live sync status, Role switcher, Notifications, Cart */}
          <div className="flex items-center gap-2.5">
            
            {/* Live Indicator */}
            <div 
              title={isConnectedLive ? "Conectado en tiempo real por SSE" : "Reconectando..."}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-[11px] font-mono text-neutral-300"
            >
              <span className={`w-2 h-2 rounded-full ${isConnectedLive ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
              <Radio className="w-3 h-3 text-emerald-400" />
              <span>{isConnectedLive ? 'En Vivo' : 'Offline'}</span>
            </div>

            {/* Role Switcher Button & Dropdown */}
            <div className="relative">
              <button
                id="btn-role-switcher"
                onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-xs font-semibold text-neutral-200 transition"
              >
                {currentUser.role === "customer" && <UserCheck className="w-4 h-4 text-emerald-400" />}
                {currentUser.role === "vendor" && <Building2 className="w-4 h-4 text-amber-400" />}
                {currentUser.role === "admin" && <ShieldCheck className="w-4 h-4 text-purple-400" />}
                <span className="hidden sm:inline">
                  {currentUser.role === "customer" && "Jugador"}
                  {currentUser.role === "vendor" && "Vendedor/Cancha"}
                  {currentUser.role === "admin" && "Administrador"}
                </span>
              </button>

              {roleMenuOpen && (
                <div 
                  id="dropdown-role-selector"
                  className="absolute right-0 mt-2 w-64 bg-neutral-900 border border-neutral-800 rounded-2xl p-2 shadow-2xl z-50 animate-fadeIn"
                >
                  <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-neutral-500 tracking-wider">
                    Cambiar Modo de Usuario
                  </div>
                  <button
                    onClick={() => {
                      switchUserRole("customer");
                      setRoleMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center gap-2.5 transition ${
                      currentUser.role === "customer" ? "bg-emerald-500/10 text-emerald-300 font-bold" : "text-neutral-300 hover:bg-neutral-800"
                    }`}
                  >
                    <UserCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <div className="font-bold">Juan David Ospina (Jugador)</div>
                      <div className="text-[10px] text-neutral-400">Reserva canchas y compra artículos</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      switchUserRole("vendor");
                      setRoleMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center gap-2.5 transition ${
                      currentUser.role === "vendor" ? "bg-amber-500/10 text-amber-300 font-bold" : "text-neutral-300 hover:bg-neutral-800"
                    }`}
                  >
                    <Building2 className="w-4 h-4 text-amber-400 shrink-0" />
                    <div>
                      <div className="font-bold">Complejo Canchas El Campín (Vendedor)</div>
                      <div className="text-[10px] text-neutral-400">Gestiona turnos, ventas y comisiones</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      switchUserRole("admin");
                      setRoleMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center gap-2.5 transition ${
                      currentUser.role === "admin" ? "bg-purple-500/10 text-purple-300 font-bold" : "text-neutral-300 hover:bg-neutral-800"
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0" />
                    <div>
                      <div className="font-bold">Director de Plataforma</div>
                      <div className="text-[10px] text-neutral-400">Comisiones y analítica de tendencias IA</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Notification Bell Button */}
            <button
              id="btn-open-notifications"
              onClick={onOpenNotifications}
              className="relative p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white transition"
              title="Notificaciones Push y Ofertas"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifsCount > 0 && (
                <span className="absolute -top-1 -right-1 px-1.5 py-0.2 min-w-[18px] h-[18px] text-[10px] font-bold bg-emerald-500 text-neutral-950 rounded-full flex items-center justify-center animate-pulse">
                  {unreadNotifsCount}
                </span>
              )}
            </button>

            {/* Shopping Cart Button */}
            <button
              id="btn-open-cart"
              onClick={onOpenCart}
              className="relative flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-xs font-semibold text-neutral-200 transition"
              title="Carrito de compras"
            >
              <ShoppingCart className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Carrito</span>
              {totalCartItems > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold bg-emerald-500 text-neutral-950 rounded-full">
                  {totalCartItems}
                </span>
              )}
            </button>

          </div>
        </div>

        {/* Mobile Sub-Navigation */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-neutral-800/80 text-xs">
          <button
            onClick={() => setActiveTab("courts")}
            className={`px-2 py-1 rounded-lg ${activeTab === "courts" ? "text-emerald-400 font-bold" : "text-neutral-400"}`}
          >
            Canchas
          </button>
          <button
            onClick={() => setActiveTab("marketplace")}
            className={`px-2 py-1 rounded-lg ${activeTab === "marketplace" ? "text-emerald-400 font-bold" : "text-neutral-400"}`}
          >
            Tienda
          </button>
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`px-2 py-1 rounded-lg ${activeTab === "dashboard" ? "text-emerald-400 font-bold" : "text-neutral-400"}`}
          >
            Mi Panel
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`px-2 py-1 rounded-lg ${activeTab === "analytics" ? "text-emerald-400 font-bold" : "text-neutral-400"}`}
          >
            Tendencias
          </button>
        </div>

      </div>
    </header>
  );
};
