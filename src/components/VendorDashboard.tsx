import React, { useState } from "react";
import { useApp } from "../context/AppContext.js";
import { 
  Calendar, 
  Package, 
  DollarSign, 
  Plus, 
  Check, 
  Clock, 
  Building2, 
  TrendingUp, 
  AlertCircle,
  Truck,
  Store,
  ArrowUpRight,
  ShieldAlert
} from "lucide-react";
import { ProductCategory, SportCategory } from "../types.js";

export const VendorDashboard: React.FC = () => {
  const { 
    currentUser, 
    courts, 
    bookings, 
    products, 
    orders, 
    updateBookingStatus, 
    updateOrderStatus, 
    addProduct, 
    updateProductStock,
    platformConfig 
  } = useApp();

  const [vendorTab, setVendorTab] = useState<"agenda" | "productos" | "pedidos" | "finanzas">("agenda");
  
  // New Product Modal state
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [prodName, setProdName] = useState("");
  const [prodDesc, setProdDesc] = useState("");
  const [prodPrice, setProdPrice] = useState("");
  const [prodCategory, setProdCategory] = useState<ProductCategory>("calzado");
  const [prodSport, setProdSport] = useState<SportCategory>("futsal");
  const [prodBrand, setProdBrand] = useState("");
  const [prodSizes, setProdSizes] = useState("40, 41, 42, 43");
  const [prodStock, setProdStock] = useState("12");
  const [prodImage, setProdImage] = useState("");
  const [isSavingProduct, setIsSavingProduct] = useState(false);

  // Financial calculations
  const vendorCourts = courts.filter(c => c.ownerId === currentUser.id);
  const vendorBookings = bookings.filter(b => vendorCourts.some(vc => vc.id === b.courtId));
  
  const grossBookingsRevenue = vendorBookings.reduce((sum, b) => sum + (b.status !== "cancelada" ? b.courtPrice : 0), 0);
  const bookingCommissionFees = vendorBookings.reduce((sum, b) => sum + (b.status !== "cancelada" ? b.platformCommission : 0), 0);
  const netBookingsPayout = grossBookingsRevenue - bookingCommissionFees;

  const grossProductsRevenue = orders.reduce((sum, o) => sum + o.subtotal, 0);
  const productCommissionFees = orders.reduce((sum, o) => sum + o.platformCommission, 0);
  const netProductsPayout = grossProductsRevenue - productCommissionFees;

  const totalNetPayout = netBookingsPayout + netProductsPayout;

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName || !prodPrice) return;

    setIsSavingProduct(true);
    await addProduct({
      name: prodName,
      description: prodDesc || "Artículo deportivo de alta gama para fútbol y futsal.",
      price: Number(prodPrice),
      category: prodCategory,
      sportCategory: prodSport,
      brand: prodBrand || "Marca Oficial",
      sizes: prodSizes.split(",").map(s => s.trim()).filter(Boolean),
      stock: Number(prodStock) || 10,
      image: prodImage || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80"
    });

    setIsSavingProduct(false);
    setIsAddProductOpen(false);
    // Reset form
    setProdName("");
    setProdDesc("");
    setProdPrice("");
    setProdBrand("");
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Vendor Header */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0">
            <Building2 className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                {currentUser.complexName || currentUser.name}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                Complejo Deportivo & Vendedor
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              {currentUser.email} • {currentUser.phone} • {vendorCourts.length} Canchas asociadas
            </p>
          </div>
        </div>

        {/* Quick New Product CTA */}
        <button
          id="btn-open-add-product"
          onClick={() => setIsAddProductOpen(true)}
          className="px-4 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition self-stretch md:self-auto justify-center"
        >
          <Plus className="w-4 h-4" />
          <span>Publicar Artículo en Marketplace</span>
        </button>
      </div>

      {/* Metric Cards Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-1 shadow">
          <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center justify-between">
            <span>Turnos Reservados</span>
            <Calendar className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">
            {vendorBookings.length}
          </div>
          <div className="text-[11px] text-emerald-400 font-medium">
            Ocupación pico: 19:00 a 22:00 hs
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-1 shadow">
          <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center justify-between">
            <span>Ventas de Artículos</span>
            <Package className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">
            {orders.length}
          </div>
          <div className="text-[11px] text-neutral-400 font-medium">
            {products.length} productos en catálogo
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-1 shadow">
          <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center justify-between">
            <span>Neto a Cobrar</span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-400">
            ${totalNetPayout.toLocaleString()} COP
          </div>
          <div className="text-[11px] text-neutral-500">
            Comisión plataforma deducida
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-800 pb-3 overflow-x-auto">
        <button
          id="tab-vendor-agenda"
          onClick={() => setVendorTab("agenda")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            vendorTab === "agenda"
              ? "bg-amber-500 text-neutral-950 shadow"
              : "bg-neutral-900 text-neutral-400 hover:text-white"
          }`}
        >
          <Calendar className="w-4 h-4" />
          Agenda de Canchas & Turnos ({vendorBookings.length})
        </button>

        <button
          id="tab-vendor-productos"
          onClick={() => setVendorTab("productos")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            vendorTab === "productos"
              ? "bg-amber-500 text-neutral-950 shadow"
              : "bg-neutral-900 text-neutral-400 hover:text-white"
          }`}
        >
          <Package className="w-4 h-4" />
          Inventario de Tienda ({products.length})
        </button>

        <button
          id="tab-vendor-pedidos"
          onClick={() => setVendorTab("pedidos")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            vendorTab === "pedidos"
              ? "bg-amber-500 text-neutral-950 shadow"
              : "bg-neutral-900 text-neutral-400 hover:text-white"
          }`}
        >
          <Store className="w-4 h-4" />
          Pedidos de Clientes ({orders.length})
        </button>

        <button
          id="tab-vendor-finanzas"
          onClick={() => setVendorTab("finanzas")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            vendorTab === "finanzas"
              ? "bg-amber-500 text-neutral-950 shadow"
              : "bg-neutral-900 text-neutral-400 hover:text-white"
          }`}
        >
          <DollarSign className="w-4 h-4" />
          Balance & Comisiones
        </button>
      </div>

      {/* Tab Content: Agenda */}
      {vendorTab === "agenda" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Turnos Reservados en tus Canchas</h3>
            <span className="text-xs text-neutral-400">Actualización en tiempo real vía SSE</span>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-neutral-300">
                <thead className="bg-neutral-950 text-neutral-400 font-bold uppercase tracking-wider text-[10px] border-b border-neutral-800">
                  <tr>
                    <th className="p-4">Cancha</th>
                    <th className="p-4">Fecha & Horario</th>
                    <th className="p-4">Cliente / Jugador</th>
                    <th className="p-4">Tarifa / Comisión</th>
                    <th className="p-4">Estado</th>
                    <th className="p-4 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60">
                  {vendorBookings.map(b => (
                    <tr key={b.id} className="hover:bg-neutral-800/40 transition">
                      <td className="p-4 font-bold text-white">
                        {b.courtName}
                        <div className="text-[10px] font-mono text-neutral-500">#{b.id.slice(-6)}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-semibold text-white">{b.date}</div>
                        <div className="text-[11px] text-emerald-400">{b.timeSlot}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-white font-medium">{b.customerName}</div>
                        <div className="text-[10px] text-neutral-400">{b.customerPhone}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-white font-bold">${b.courtPrice.toLocaleString()} COP</div>
                        <div className="text-[10px] text-emerald-400">
                          Neto a cobrar: ${(b.vendorPayout).toLocaleString()} COP
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          b.status === "confirmada" ? "bg-emerald-500/20 text-emerald-400" :
                          b.status === "en_curso" ? "bg-amber-500/20 text-amber-400" :
                          b.status === "completada" ? "bg-blue-500/20 text-blue-400" : "bg-neutral-800 text-neutral-500"
                        }`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-1.5">
                        {b.status === "confirmada" && (
                          <button
                            onClick={() => updateBookingStatus(b.id, "en_curso")}
                            className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold rounded-lg text-[11px] transition"
                          >
                            En Cancha
                          </button>
                        )}
                        {b.status === "en_curso" && (
                          <button
                            onClick={() => updateBookingStatus(b.id, "completada")}
                            className="px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold rounded-lg text-[11px] transition"
                          >
                            Finalizar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: Productos */}
      {vendorTab === "productos" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Inventario de Productos & Accesorios</h3>
              <p className="text-xs text-neutral-400">Modifica precios y stock en tiempo real</p>
            </div>
            <button
              onClick={() => setIsAddProductOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs flex items-center gap-1.5 transition"
            >
              <Plus className="w-4 h-4" />
              Nuevo Artículo
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map(p => (
              <div key={p.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 flex gap-3 items-center">
                <img src={p.image} alt={p.name} className="w-16 h-16 object-cover rounded-xl shrink-0" />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-white truncate">{p.name}</h4>
                  <div className="text-xs text-emerald-400 font-extrabold mt-0.5">${p.price.toLocaleString()} COP</div>
                  <div className="text-[10px] text-neutral-400 mt-1 flex items-center justify-between">
                    <span>Stock: <strong className="text-white">{p.stock} unid.</strong></span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updateProductStock(p.id, Math.max(0, p.stock - 1))}
                        className="w-5 h-5 rounded bg-neutral-800 hover:bg-neutral-700 text-white flex items-center justify-center font-bold"
                      >
                        -
                      </button>
                      <button
                        onClick={() => updateProductStock(p.id, p.stock + 1)}
                        className="w-5 h-5 rounded bg-neutral-800 hover:bg-neutral-700 text-white flex items-center justify-center font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Content: Pedidos */}
      {vendorTab === "pedidos" && (
        <div className="space-y-4">
          <h3 className="text-base font-bold text-white">Pedidos para Retiro o Entrega</h3>
          <div className="space-y-3">
            {orders.map(o => (
              <div key={o.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">Pedido #{o.id}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                      o.status === "entregado" ? "bg-emerald-500/20 text-emerald-400" : "bg-blue-500/20 text-blue-400"
                    }`}>
                      {o.status.replace("_", " ")}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Cliente: <strong className="text-white">{o.customerName}</strong> ({o.customerPhone})
                  </p>
                  <div className="text-[11px] text-neutral-400 mt-1">
                    {o.items.map(i => `${i.quantity}x ${i.productName}`).join(", ")}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {o.status !== "listo_para_retiro" && o.status !== "entregado" && (
                    <button
                      onClick={() => updateOrderStatus(o.id, "listo_para_retiro")}
                      className="px-3 py-1.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-neutral-950 font-bold text-xs transition"
                    >
                      Listo para Retiro
                    </button>
                  )}
                  {o.status !== "entregado" && (
                    <button
                      onClick={() => updateOrderStatus(o.id, "entregado")}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs transition"
                    >
                      Marcar Entregado
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Content: Finanzas */}
      {vendorTab === "finanzas" && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-white">Liquidación Financiera & Comisiones</h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Desglose transparente del cobro de comisiones de plataforma por reserva de canchas y venta de indumentaria.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Bookings split */}
            <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-5 space-y-3">
              <span className="text-xs font-bold uppercase text-emerald-400 tracking-wider">
                Canchas & Turnos
              </span>
              <div className="space-y-1.5 text-xs text-neutral-300">
                <div className="flex justify-between">
                  <span>Facturación Bruta:</span>
                  <strong className="text-white">${grossBookingsRevenue.toLocaleString()} COP</strong>
                </div>
                <div className="flex justify-between text-neutral-400">
                  <span>Comisión Plataforma ({(platformConfig.commissionRateBookings * 100).toFixed(0)}%):</span>
                  <span className="text-rose-400">-${bookingCommissionFees.toLocaleString()} COP</span>
                </div>
                <div className="pt-2 border-t border-neutral-800 flex justify-between text-sm font-extrabold text-emerald-400">
                  <span>Neto Turnos:</span>
                  <span>${netBookingsPayout.toLocaleString()} COP</span>
                </div>
              </div>
            </div>

            {/* Products split */}
            <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-5 space-y-3">
              <span className="text-xs font-bold uppercase text-blue-400 tracking-wider">
                Ventas de Tienda
              </span>
              <div className="space-y-1.5 text-xs text-neutral-300">
                <div className="flex justify-between">
                  <span>Facturación Bruta:</span>
                  <strong className="text-white">${grossProductsRevenue.toLocaleString()} COP</strong>
                </div>
                <div className="flex justify-between text-neutral-400">
                  <span>Comisión Plataforma ({(platformConfig.commissionRateProducts * 100).toFixed(0)}%):</span>
                  <span className="text-rose-400">-${productCommissionFees.toLocaleString()} COP</span>
                </div>
                <div className="pt-2 border-t border-neutral-800 flex justify-between text-sm font-extrabold text-emerald-400">
                  <span>Neto Artículos:</span>
                  <span>${netProductsPayout.toLocaleString()} COP</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-5 bg-neutral-950 rounded-2xl border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs text-neutral-400">Saldo Disponible para Transferir:</div>
              <div className="text-2xl font-extrabold text-white mt-0.5">
                ${totalNetPayout.toLocaleString()} <span className="text-xs font-normal text-neutral-400">COP</span>
              </div>
            </div>
            <button
              onClick={() => alert("Solicitud de liquidación enviada al banco del complejo (Bancolombia/Davivienda).")}
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition"
            >
              <ArrowUpRight className="w-4 h-4" />
              Solicitar Liquidación Inmediata
            </button>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {isAddProductOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Publicar Artículo Deportivo</h3>
              <button onClick={() => setIsAddProductOpen(false)} className="text-neutral-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">Nombre del Producto:</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Balón Futsal Golty Oficial Medio Pique"
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-xl px-3 py-2 text-xs focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1">Precio ($ COP):</label>
                  <input
                    type="number"
                    required
                    placeholder="Ej: 145000"
                    value={prodPrice}
                    onChange={(e) => setProdPrice(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-xl px-3 py-2 text-xs focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1">Stock Disponible:</label>
                  <input
                    type="number"
                    value={prodStock}
                    onChange={(e) => setProdStock(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-xl px-3 py-2 text-xs focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1">Categoría:</label>
                  <select
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value as any)}
                    className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-xl px-3 py-2 text-xs"
                  >
                    <option value="calzado">Calzado (Zapatillas / Guayos)</option>
                    <option value="balones">Balones & Medio Pique</option>
                    <option value="guantes">Guantes de Portero</option>
                    <option value="canilleras">Canilleras</option>
                    <option value="accesorios">Accesorios & Medias Grip</option>
                    <option value="indumentaria">Indumentaria</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1">Disciplina:</label>
                  <select
                    value={prodSport}
                    onChange={(e) => setProdSport(e.target.value as any)}
                    className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-xl px-3 py-2 text-xs"
                  >
                    <option value="futsal">Futsal / Salón</option>
                    <option value="futbol">Fútbol Césped</option>
                    <option value="ambos">Ambos</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1">Marca:</label>
                  <input
                    type="text"
                    placeholder="Ej: Golty, Joma, Nike"
                    value={prodBrand}
                    onChange={(e) => setProdBrand(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-xl px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1">Tallas (separadas por coma):</label>
                  <input
                    type="text"
                    value={prodSizes}
                    onChange={(e) => setProdSizes(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-xl px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">URL Imagen (opcional):</label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={prodImage}
                  onChange={(e) => setProdImage(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={isSavingProduct}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs rounded-xl transition mt-2"
              >
                {isSavingProduct ? "Guardando..." : "Publicar Artículo en Marketplace"}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
