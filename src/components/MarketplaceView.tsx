import React, { useState } from "react";
import { useApp } from "../context/AppContext.js";
import { Product, ProductCategory, SportCategory } from "../types.js";
import { 
  ShoppingBag, 
  Search, 
  Star, 
  Plus, 
  Check, 
  Tag, 
  Sparkles, 
  Truck, 
  Store,
  Filter,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  X
} from "lucide-react";

interface MarketplaceViewProps {
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  onNavigateToDashboard?: () => void;
}

export const MarketplaceView: React.FC<MarketplaceViewProps> = ({ 
  isCartOpen, 
  setIsCartOpen,
  onNavigateToDashboard 
}) => {
  const { 
    products, 
    cart, 
    addToCart, 
    removeFromCart, 
    updateCartQuantity, 
    clearCart, 
    createOrder, 
    platformConfig 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"all" | ProductCategory>("all");
  const [sportFilter, setSportFilter] = useState<"all" | SportCategory>("all");
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});
  const [addedAnimationId, setAddedAnimationId] = useState<string | null>(null);

  // Cart Checkout state
  const [deliveryType, setDeliveryType] = useState<"retiro_en_cancha" | "envio_domicilio">("retiro_en_cancha");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [isOrdering, setIsOrdering] = useState(false);
  const [confirmedOrderId, setConfirmedOrderId] = useState<string | null>(null);

  // Filter products
  const filteredProducts = products.filter(product => {
    if (categoryFilter !== "all" && product.category !== categoryFilter) return false;
    if (sportFilter !== "all" && product.sportCategory !== sportFilter && product.sportCategory !== "ambos") return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = product.name.toLowerCase().includes(q);
      const matchBrand = product.brand.toLowerCase().includes(q);
      const matchDesc = product.description.toLowerCase().includes(q);
      if (!matchName && !matchBrand && !matchDesc) return false;
    }
    return true;
  });

  const handleSelectSize = (productId: string, size: string) => {
    setSelectedSizes(prev => ({ ...prev, [productId]: size }));
  };

  const handleAddToCart = (product: Product) => {
    const size = selectedSizes[product.id] || product.sizes[0] || "Única";
    addToCart(product, size);
    setAddedAnimationId(product.id);
    setTimeout(() => setAddedAnimationId(null), 1200);
  };

  // Cart calculations
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const platformFee = Math.round(subtotal * platformConfig.commissionRateProducts);
  const shippingFee = deliveryType === "envio_domicilio" ? 12000 : 0;
  const total = subtotal + shippingFee;

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsOrdering(true);

    const items = cart.map(i => ({
      productId: i.product.id,
      productName: i.product.name,
      price: i.product.price,
      quantity: i.quantity,
      selectedSize: i.selectedSize,
      image: i.product.image,
      vendorId: i.product.vendorId
    }));

    const res = await createOrder({
      deliveryType,
      deliveryAddress: deliveryType === "envio_domicilio" ? deliveryAddress : "Retiro en Recepción del Complejo Deportivo",
      items,
      paymentMethod: "pse"
    });

    setIsOrdering(false);
    if (res.success && res.order) {
      setConfirmedOrderId(res.order.id);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Marketplace Header */}
      <div className="bg-neutral-900 border border-neutral-800/80 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xl">
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-3">
            <ShoppingBag className="w-4 h-4" />
            Marketplace Oficial de Fútbol & Futsal
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Equipamiento, Calzado Especializado y <span className="text-emerald-400">Accesorios</span>
          </h1>
          <p className="text-neutral-300 text-sm sm:text-base mt-2 max-w-2xl leading-relaxed">
            Zapatillas con suela caramelo para parquet, balones reglamentarios de medio pique, botines para césped sintético, canilleras y pizarras tácticas. Retira directamente en tu complejo o recibe en tu domicilio.
          </p>
        </div>

        {/* Search & Sport Filters */}
        <div className="mt-6 pt-6 border-t border-neutral-800 flex flex-col md:flex-row gap-4 items-center justify-between">
          
          {/* Search bar */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar zapatillas, balones medio pique, marcas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-2xl pl-10 pr-4 py-2.5 text-xs sm:text-sm placeholder:text-neutral-600 focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          {/* Sport Discipline Filter Pills */}
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1">
            <button
              onClick={() => setSportFilter("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap border transition ${
                sportFilter === "all"
                  ? "bg-emerald-500 text-neutral-950 border-emerald-500"
                  : "bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white"
              }`}
            >
              Todos los Deportes
            </button>
            <button
              onClick={() => setSportFilter("futsal")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap border transition ${
                sportFilter === "futsal"
                  ? "bg-emerald-500 text-neutral-950 border-emerald-500"
                  : "bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white"
              }`}
            >
              ⚽ Futsal (Suela Caramelo / Parquet)
            </button>
            <button
              onClick={() => setSportFilter("futbol")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap border transition ${
                sportFilter === "futbol"
                  ? "bg-emerald-500 text-neutral-950 border-emerald-500"
                  : "bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white"
              }`}
            >
              🌱 Fútbol (Sintético / Campo)
            </button>
          </div>

        </div>

        {/* Categories Pills */}
        <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setCategoryFilter("all")}
            className={`px-3 py-1 rounded-lg font-medium transition ${
              categoryFilter === "all" ? "bg-neutral-800 text-white font-bold" : "text-neutral-500 hover:text-neutral-300"
            }`}
          >
            Todas las categorías
          </button>
          <button
            onClick={() => setCategoryFilter("calzado")}
            className={`px-3 py-1 rounded-lg font-medium transition ${
              categoryFilter === "calzado" ? "bg-neutral-800 text-white font-bold" : "text-neutral-500 hover:text-neutral-300"
            }`}
          >
            👟 Calzado Futsal / Fútbol
          </button>
          <button
            onClick={() => setCategoryFilter("balones")}
            className={`px-3 py-1 rounded-lg font-medium transition ${
              categoryFilter === "balones" ? "bg-neutral-800 text-white font-bold" : "text-neutral-500 hover:text-neutral-300"
            }`}
          >
            ⚽ Balones & Medio Pique
          </button>
          <button
            onClick={() => setCategoryFilter("guantes")}
            className={`px-3 py-1 rounded-lg font-medium transition ${
              categoryFilter === "guantes" ? "bg-neutral-800 text-white font-bold" : "text-neutral-500 hover:text-neutral-300"
            }`}
          >
            🧤 Guantes de Portero
          </button>
          <button
            onClick={() => setCategoryFilter("canilleras")}
            className={`px-3 py-1 rounded-lg font-medium transition ${
              categoryFilter === "canilleras" ? "bg-neutral-800 text-white font-bold" : "text-neutral-500 hover:text-neutral-300"
            }`}
          >
            🛡️ Canilleras
          </button>
          <button
            onClick={() => setCategoryFilter("accesorios")}
            className={`px-3 py-1 rounded-lg font-medium transition ${
              categoryFilter === "accesorios" ? "bg-neutral-800 text-white font-bold" : "text-neutral-500 hover:text-neutral-300"
            }`}
          >
            🧦 Medias Grip & Táctica
          </button>
          <button
            onClick={() => setCategoryFilter("indumentaria")}
            className={`px-3 py-1 rounded-lg font-medium transition ${
              categoryFilter === "indumentaria" ? "bg-neutral-800 text-white font-bold" : "text-neutral-500 hover:text-neutral-300"
            }`}
          >
            👕 Camisetas & Pecheras
          </button>
        </div>

      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.length === 0 ? (
          <div className="col-span-full text-center py-16 bg-neutral-900/50 rounded-3xl border border-neutral-800">
            <ShoppingBag className="w-10 h-10 text-neutral-600 mx-auto mb-2" />
            <p className="text-neutral-400 text-sm">No se encontraron artículos con los criterios actuales.</p>
          </div>
        ) : (
          filteredProducts.map(product => {
            const currentSize = selectedSizes[product.id] || product.sizes[0] || "Única";
            const isAdded = addedAnimationId === product.id;

            return (
              <div
                key={product.id}
                className="bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden hover:border-neutral-700 transition flex flex-col justify-between group shadow-lg"
              >
                <div>
                  {/* Image Container */}
                  <div className="relative h-48 bg-neutral-950 overflow-hidden">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/60 to-transparent" />
                    
                    {/* Tags / Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-neutral-900/90 text-emerald-400 border border-emerald-500/30 backdrop-blur-md">
                        {product.brand}
                      </span>
                      {product.isTrending && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-neutral-950 flex items-center gap-1 shadow">
                          <Sparkles className="w-2.5 h-2.5" />
                          Más Vendido
                        </span>
                      )}
                    </div>

                    <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-lg bg-neutral-950/80 backdrop-blur-md text-amber-300 text-[11px] font-bold flex items-center gap-1 border border-neutral-800">
                      <Star className="w-3 h-3 fill-amber-300 text-amber-300" />
                      <span>{product.rating}</span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-2.5">
                    <div className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider">
                      {product.sportCategory === "futsal" ? "Futsal / Salón" : product.sportCategory === "futbol" ? "Fútbol Campo" : "Fútbol & Futsal"}
                    </div>
                    <h3 className="text-sm font-bold text-white leading-snug line-clamp-2">
                      {product.name}
                    </h3>
                    <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>

                    {/* Size Selector */}
                    {product.sizes.length > 1 && (
                      <div className="pt-1">
                        <div className="text-[10px] text-neutral-400 mb-1 font-semibold">Talle / Medida:</div>
                        <div className="flex flex-wrap gap-1">
                          {product.sizes.map(size => (
                            <button
                              key={size}
                              onClick={() => handleSelectSize(product.id, size)}
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition ${
                                currentSize === size
                                  ? "bg-emerald-500 text-neutral-950 border-emerald-500"
                                  : "bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-neutral-700"
                              }`}
                            >
                              {size}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Price & Add to Cart */}
                <div className="p-4 pt-0">
                  <div className="pt-3 border-t border-neutral-800/80 flex items-center justify-between">
                    <div>
                      <div className="text-base font-extrabold text-white">
                        ${product.price.toLocaleString()}{" "}
                        <span className="text-[10px] text-neutral-400 font-normal">COP</span>
                      </div>
                      {product.originalPrice && (
                        <div className="text-[10px] text-neutral-500 line-through">
                          ${product.originalPrice.toLocaleString()} COP
                        </div>
                      )}
                    </div>

                    <button
                      id={`btn-add-cart-${product.id}`}
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stock === 0}
                      className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                        isAdded
                          ? "bg-emerald-600 text-white"
                          : product.stock === 0
                          ? "bg-neutral-800 text-neutral-500 cursor-not-allowed"
                          : "bg-emerald-500 hover:bg-emerald-400 text-neutral-950 shadow-md shadow-emerald-500/10"
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>¡Agregado!</span>
                        </>
                      ) : product.stock === 0 ? (
                        <span>Agotado</span>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Comprar</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Cart Drawer Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-neutral-900 border-l border-neutral-800 w-full max-w-md h-full flex flex-col shadow-2xl overflow-hidden animate-slideLeft">
            
            {/* Cart Header */}
            <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-extrabold text-white">Tu Carrito Deportivo</h3>
              </div>
              <button
                id="btn-close-cart"
                onClick={() => {
                  setIsCartOpen(false);
                  setConfirmedOrderId(null);
                }}
                className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!confirmedOrderId ? (
              <>
                {/* Cart Items List */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                  {cart.length === 0 ? (
                    <div className="text-center py-16 text-neutral-500 space-y-2">
                      <ShoppingBag className="w-10 h-10 mx-auto opacity-30" />
                      <p className="text-sm font-medium">Tu carrito está vacío.</p>
                      <p className="text-xs text-neutral-400">Descubre calzado para futsal, balones y accesorios.</p>
                    </div>
                  ) : (
                    cart.map(item => (
                      <div 
                        key={`${item.product.id}-${item.selectedSize}`}
                        className="flex items-center gap-3 p-3 rounded-2xl bg-neutral-950 border border-neutral-800/80"
                      >
                        <img 
                          src={item.product.image} 
                          alt={item.product.name}
                          className="w-14 h-14 object-cover rounded-xl shrink-0" 
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-white truncate">
                            {item.product.name}
                          </h4>
                          <div className="text-[11px] text-emerald-400 font-bold mt-0.5">
                            ${(item.product.price * item.quantity).toLocaleString()} ARS
                          </div>
                          <div className="text-[10px] text-neutral-400">
                            Talle: {item.selectedSize || "Único"}
                          </div>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-1.5 bg-neutral-900 border border-neutral-800 rounded-xl p-1 shrink-0">
                          <button
                            onClick={() => updateCartQuantity(item.product.id, item.quantity - 1, item.selectedSize)}
                            className="w-5 h-5 rounded-lg text-xs font-bold text-neutral-400 hover:text-white flex items-center justify-center hover:bg-neutral-800"
                          >
                            -
                          </button>
                          <span className="text-xs font-bold text-white w-4 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateCartQuantity(item.product.id, item.quantity + 1, item.selectedSize)}
                            className="w-5 h-5 rounded-lg text-xs font-bold text-neutral-400 hover:text-white flex items-center justify-center hover:bg-neutral-800"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Checkout & Delivery Selection Section */}
                {cart.length > 0 && (
                  <div className="p-5 bg-neutral-950 border-t border-neutral-800 space-y-4">
                    
                    {/* Delivery Mode Choice */}
                    <div>
                      <label className="block text-xs font-bold text-neutral-300 mb-2">
                        Modalidad de Entrega:
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => setDeliveryType("retiro_en_cancha")}
                          className={`p-2.5 rounded-xl border text-left text-xs transition ${
                            deliveryType === "retiro_en_cancha"
                              ? "bg-emerald-500/15 border-emerald-500 text-emerald-300"
                              : "bg-neutral-900 border-neutral-800 text-neutral-400"
                          }`}
                        >
                          <div className="font-bold flex items-center gap-1">
                            <Store className="w-3.5 h-3.5" />
                            Retiro en Cancha
                          </div>
                          <div className="text-[10px] text-emerald-400 font-semibold">Gratis (en tu partido)</div>
                        </button>

                        <button
                          onClick={() => setDeliveryType("envio_domicilio")}
                          className={`p-2.5 rounded-xl border text-left text-xs transition ${
                            deliveryType === "envio_domicilio"
                              ? "bg-emerald-500/15 border-emerald-500 text-emerald-300"
                              : "bg-neutral-900 border-neutral-800 text-neutral-400"
                          }`}
                        >
                          <div className="font-bold flex items-center gap-1">
                            <Truck className="w-3.5 h-3.5" />
                            Envío a Domicilio
                          </div>
                          <div className="text-[10px] text-neutral-400">+$12.000 COP (24-48 hs)</div>
                        </button>
                      </div>
                    </div>

                    {deliveryType === "envio_domicilio" && (
                      <div>
                        <label className="block text-xs font-bold text-neutral-300 mb-1">
                          Dirección de Envío (Colombia):
                        </label>
                        <input
                          type="text"
                          placeholder="Calle/Carrera, número, barrio, ciudad (Bogotá, Medellín, Cali...)"
                          value={deliveryAddress}
                          onChange={(e) => setDeliveryAddress(e.target.value)}
                          className="w-full bg-neutral-900 border border-neutral-800 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    )}

                    {/* Price Breakdown */}
                    <div className="space-y-1.5 text-xs text-neutral-300 border-t border-neutral-800 pt-3">
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Subtotal de artículos:</span>
                        <span>${subtotal.toLocaleString()} COP</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Comisión de plataforma ({(platformConfig.commissionRateProducts * 100).toFixed(0)}%):</span>
                        <span className="text-emerald-400">${platformFee.toLocaleString()} COP</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Costo de entrega:</span>
                        <span>{shippingFee === 0 ? "Gratis" : `$${shippingFee.toLocaleString()} COP`}</span>
                      </div>
                      <div className="flex justify-between text-base font-extrabold text-white pt-2 border-t border-neutral-800">
                        <span>Total:</span>
                        <span className="text-emerald-400">${total.toLocaleString()} COP</span>
                      </div>
                    </div>

                    {/* Checkout Button */}
                    <button
                      id="btn-confirm-checkout"
                      disabled={isOrdering || (deliveryType === "envio_domicilio" && !deliveryAddress.trim())}
                      onClick={handleCheckout}
                      className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition disabled:opacity-50"
                    >
                      {isOrdering ? (
                        <span>Procesando pedido...</span>
                      ) : (
                        <>
                          <span>Confirmar Compra</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>

                  </div>
                )}
              </>
            ) : (
              /* Order Confirmation Success View */
              <div className="p-8 text-center space-y-4 my-auto animate-fadeIn">
                <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div>
                  <h4 className="text-xl font-extrabold text-white">¡Compra Procesada!</h4>
                  <p className="text-xs text-neutral-300 mt-1 max-w-xs mx-auto">
                    Pedido #{confirmedOrderId} confirmado. Recibiste una notificación push con los detalles para retirar o recibir tus productos.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    setConfirmedOrderId(null);
                    onNavigateToDashboard?.();
                  }}
                  className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs inline-flex items-center gap-2 transition"
                >
                  Ver Pedido en Mi Panel
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
