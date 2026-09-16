import React, { useState } from "react";
import { useApp } from "../context/AppContext.js";
import { 
  Calendar, 
  Package, 
  Settings, 
  Sparkles, 
  QrCode, 
  Check, 
  Clock, 
  MapPin, 
  Tag, 
  XCircle, 
  CheckCircle2, 
  RefreshCw,
  BellRing
} from "lucide-react";

export const UserDashboard: React.FC<{ onNavigateToCourts?: () => void; onNavigateToStore?: () => void }> = ({
  onNavigateToCourts,
  onNavigateToStore
}) => {
  const { 
    currentUser, 
    bookings, 
    orders, 
    cancelBooking, 
    updateUserPreferences,
    triggerPushNotification 
  } = useApp();

  const [activeTab, setActiveTab] = useState<"turnos" | "pedidos" | "preferencias" | "ofertas_ia">("turnos");
  const [selectedQrBooking, setSelectedQrBooking] = useState<string | null>(null);

  // User preferences form state
  const [prefSport, setPrefSport] = useState(currentUser.preferences.primarySport);
  const [prefPosition, setPrefPosition] = useState(currentUser.preferences.favoritePosition);
  const [prefShoeSize, setPrefShoeSize] = useState(currentUser.preferences.shoeSize);
  const [prefBrand, setPrefBrand] = useState(currentUser.preferences.favoriteBrand);
  const [isSavingPrefs, setIsSavingPrefs] = useState(false);
  const [prefsSaved, setPrefsSaved] = useState(false);

  // AI Personalized Offer state
  const [aiOffer, setAiOffer] = useState<any>(null);
  const [isLoadingAiOffer, setIsLoadingAiOffer] = useState(false);

  const userBookings = bookings.filter(b => b.customerId === currentUser.id);
  const userOrders = orders.filter(o => o.customerId === currentUser.id);

  const handleSavePreferences = async () => {
    setIsSavingPrefs(true);
    await updateUserPreferences({
      primarySport: prefSport,
      favoritePosition: prefPosition,
      shoeSize: prefShoeSize,
      favoriteBrand: prefBrand
    });
    setIsSavingPrefs(false);
    setPrefsSaved(true);
    setTimeout(() => setPrefsSaved(false), 2500);
  };

  const handleGenerateAiOffer = async () => {
    setIsLoadingAiOffer(true);
    try {
      const res = await fetch("/api/ai/personalized-offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser.id })
      });
      const data = await res.json();
      if (data.offer) {
        setAiOffer(data.offer);
        // Also trigger push notification for real-time feel
        await triggerPushNotification({
          title: data.offer.title,
          body: data.offer.body,
          type: "oferta_personalizada",
          promoCode: data.offer.promoCode,
          discountBadge: data.offer.discountBadge
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingAiOffer(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Dashboard User Profile Banner */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center gap-4">
          <img 
            src={currentUser.avatar} 
            alt={currentUser.name}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500 shadow-md"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                {currentUser.name}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Jugador Activo
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              {currentUser.email} • {currentUser.phone}
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px] text-neutral-300">
              <span className="px-2 py-0.5 rounded-md bg-neutral-950 border border-neutral-800">
                ⚽ Deporte: <strong className="text-emerald-400 uppercase">{currentUser.preferences.primarySport}</strong>
              </span>
              <span className="px-2 py-0.5 rounded-md bg-neutral-950 border border-neutral-800">
                🏃 Posición: <strong className="text-white">{currentUser.preferences.favoritePosition}</strong>
              </span>
              <span className="px-2 py-0.5 rounded-md bg-neutral-950 border border-neutral-800">
                👟 Talla: <strong className="text-white">{currentUser.preferences.shoeSize}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Quick AI Offer CTA */}
        <button
          id="btn-get-ai-offer"
          onClick={() => {
            setActiveTab("ofertas_ia");
            handleGenerateAiOffer();
          }}
          className="px-4 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition self-stretch md:self-auto justify-center"
        >
          <Sparkles className="w-4 h-4 fill-neutral-950" />
          <span>Generar Oferta Personalizada con IA</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-800 pb-3 overflow-x-auto">
        <button
          id="tab-user-turnos"
          onClick={() => setActiveTab("turnos")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === "turnos"
              ? "bg-emerald-500 text-neutral-950 shadow"
              : "bg-neutral-900 text-neutral-400 hover:text-white"
          }`}
        >
          <Calendar className="w-4 h-4" />
          Mis Turnos de Canchas ({userBookings.length})
        </button>
        <button
          id="tab-user-pedidos"
          onClick={() => setActiveTab("pedidos")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === "pedidos"
              ? "bg-emerald-500 text-neutral-950 shadow"
              : "bg-neutral-900 text-neutral-400 hover:text-white"
          }`}
        >
          <Package className="w-4 h-4" />
          Mis Pedidos de Tienda ({userOrders.length})
        </button>
        <button
          id="tab-user-preferencias"
          onClick={() => setActiveTab("preferencias")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === "preferencias"
              ? "bg-emerald-500 text-neutral-950 shadow"
              : "bg-neutral-900 text-neutral-400 hover:text-white"
          }`}
        >
          <Settings className="w-4 h-4" />
          Mis Preferencias Deportivas
        </button>
        <button
          id="tab-user-ofertas-ia"
          onClick={() => setActiveTab("ofertas_ia")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === "ofertas_ia"
              ? "bg-amber-500 text-neutral-950 shadow"
              : "bg-neutral-900 text-amber-400 hover:text-amber-300"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Ofertas IA & Push
        </button>
      </div>

      {/* Tab Content: Turnos */}
      {activeTab === "turnos" && (
        <div className="space-y-4">
          {userBookings.length === 0 ? (
            <div className="text-center py-16 bg-neutral-900/50 rounded-3xl border border-neutral-800 p-6">
              <Calendar className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white">No tienes turnos reservados</h3>
              <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
                Explora las canchas de Futsal parquet y fútbol para reservar tu próximo partido con confirmación instantánea.
              </p>
              <button
                onClick={onNavigateToCourts}
                className="mt-4 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold rounded-xl text-xs transition"
              >
                Explorar y Reservar Cancha
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userBookings.map(b => (
                <div 
                  key={b.id}
                  className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 flex flex-col justify-between space-y-4 hover:border-neutral-700 transition"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        b.status === "confirmada" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-neutral-800 text-neutral-400"
                      }`}>
                        {b.status.toUpperCase()}
                      </span>
                      <h4 className="text-base font-bold text-white mt-1.5 leading-snug">
                        {b.courtName}
                      </h4>
                      <p className="text-xs text-neutral-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        {b.complexName}
                      </p>
                    </div>

                    <button
                      onClick={() => setSelectedQrBooking(b.id)}
                      className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-emerald-500 text-emerald-400 hover:text-emerald-300 transition shrink-0"
                      title="Ver Código QR de Turno"
                    >
                      <QrCode className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Booking details card */}
                  <div className="bg-neutral-950 border border-neutral-800/80 rounded-2xl p-3 text-xs space-y-1.5 text-neutral-300">
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Fecha del partido:</span>
                      <strong className="text-white">{b.date}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Horario reservado:</span>
                      <strong className="text-emerald-400">{b.timeSlot}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Total abonado:</span>
                      <span>${b.courtPrice.toLocaleString()} COP (Comisión ${b.platformCommission.toLocaleString()} COP)</span>
                    </div>
                    {b.notes && (
                      <div className="pt-1 text-[11px] text-neutral-400 border-t border-neutral-900">
                        Notas: {b.notes}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-neutral-800">
                    <span className="text-[10px] font-mono text-neutral-500">
                      ID: #{b.id.slice(-6)}
                    </span>
                    {b.status === "confirmada" && (
                      <button
                        onClick={() => cancelBooking(b.id)}
                        className="text-xs text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1 transition"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Cancelar Reserva
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Pedidos */}
      {activeTab === "pedidos" && (
        <div className="space-y-4">
          {userOrders.length === 0 ? (
            <div className="text-center py-16 bg-neutral-900/50 rounded-3xl border border-neutral-800 p-6">
              <Package className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white">No tienes pedidos en curso</h3>
              <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
                Explora el marketplace para conseguir calzado de futsal, balones oficiales o medias antideslizantes.
              </p>
              <button
                onClick={onNavigateToStore}
                className="mt-4 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold rounded-xl text-xs transition"
              >
                Ir a la Tienda Deportiva
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {userOrders.map(o => (
                <div 
                  key={o.id}
                  className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 hover:border-neutral-700 transition space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-extrabold text-white">Pedido #{o.id}</span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-blue-500/20 text-blue-400 border border-blue-500/30">
                          {o.status.replace("_", " ").toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-400 mt-0.5">
                        {new Date(o.createdAt).toLocaleDateString()} • Modalidad: {o.deliveryType === 'retiro_en_cancha' ? 'Retiro en Cancha (Gratis)' : 'Envío a Domicilio'}
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="text-base font-extrabold text-emerald-400">
                        ${o.total.toLocaleString()} COP
                      </div>
                      <div className="text-[10px] text-neutral-500">
                        Comisión servicio: ${o.platformCommission.toLocaleString()} COP
                      </div>
                    </div>
                  </div>

                  {/* Items list */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-neutral-800">
                    {o.items.map((it, idx) => (
                      <div key={idx} className="flex items-center gap-2.5 bg-neutral-950 p-2.5 rounded-xl border border-neutral-800/60">
                        <img src={it.image} alt={it.productName} className="w-10 h-10 object-cover rounded-lg shrink-0" />
                        <div className="min-w-0 flex-1">
                          <h5 className="text-xs font-semibold text-white truncate">{it.productName}</h5>
                          <div className="text-[11px] text-neutral-400">
                            {it.quantity}x ${it.price.toLocaleString()} COP {it.selectedSize ? `(Talla ${it.selectedSize})` : ''}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Preferencias Deportivas */}
      {activeTab === "preferencias" && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-white">Preferencias Deportivas del Usuario</h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Esta información permite a la plataforma sugerir canchas en tus horarios habituales y ofrecerte descuentos personalizados en el calzado de tu talle.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            
            {/* Primary Sport */}
            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                Deporte Principal:
              </label>
              <select
                value={prefSport}
                onChange={(e) => setPrefSport(e.target.value as any)}
                className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-emerald-500"
              >
                <option value="futsal">Futsal (Parquet y Cancha Techada)</option>
                <option value="futbol">Fútbol (Sintético / Campo 7 y 11)</option>
                <option value="ambos">Ambos por igual</option>
              </select>
            </div>

            {/* Position */}
            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                Posición Habitual en Cancha:
              </label>
              <select
                value={prefPosition}
                onChange={(e) => setPrefPosition(e.target.value as any)}
                className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-emerald-500"
              >
                <option value="Pivot">Pivot (Futsal)</option>
                <option value="Ala">Ala (Futsal)</option>
                <option value="Cierre">Cierre (Futsal)</option>
                <option value="Arquero">Arquero / Guardameta</option>
                <option value="Delantero">Delantero (Fútbol)</option>
                <option value="Mediocampista">Mediocampista</option>
                <option value="Defensor">Defensor Central / Lateral</option>
              </select>
            </div>

            {/* Shoe size */}
            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                Talla de Calzado Deportivo:
              </label>
              <input
                type="text"
                value={prefShoeSize}
                onChange={(e) => setPrefShoeSize(e.target.value)}
                placeholder="Ej: 41, 42, 43"
                className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Favorite brand */}
            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                Marca de Preferencia:
              </label>
              <input
                type="text"
                value={prefBrand}
                onChange={(e) => setPrefBrand(e.target.value)}
                placeholder="Ej: Joma, Munich, Nike, Adidas"
                className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

          </div>

          <div className="flex items-center justify-between pt-4 border-t border-neutral-800">
            <span className="text-xs text-neutral-400">
              {prefsSaved ? (
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  Preferencias guardadas con éxito
                </span>
              ) : (
                "Datos actualizados en tiempo real."
              )}
            </span>
            <button
              id="btn-save-preferences"
              disabled={isSavingPrefs}
              onClick={handleSavePreferences}
              className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs flex items-center gap-1.5 transition"
            >
              <Check className="w-4 h-4" />
              Guardar Preferencias
            </button>
          </div>
        </div>
      )}

      {/* Tab Content: Ofertas Personalizadas IA */}
      {activeTab === "ofertas_ia" && (
        <div className="space-y-6">
          <div className="bg-neutral-900 border border-amber-500/30 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 text-xs font-bold uppercase tracking-wider mb-2">
                  <Sparkles className="w-4 h-4" />
                  Motor de Personalización con Gemini IA
                </span>
                <h3 className="text-xl font-extrabold text-white">
                  Ofertas y Cupones Basados en tu Historial Deportivo
                </h3>
                <p className="text-xs text-neutral-300 mt-1 max-w-xl">
                  Gemini analiza tu posición de juego ({currentUser.preferences.favoritePosition}), días preferidos ({currentUser.preferences.preferredDays.join(", ")}) y reservas pasadas para generar promociones exclusivas con notificación push.
                </p>
              </div>

              <button
                id="btn-refresh-ai-offer"
                disabled={isLoadingAiOffer}
                onClick={handleGenerateAiOffer}
                className="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition shrink-0 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isLoadingAiOffer ? 'animate-spin' : ''}`} />
                <span>{isLoadingAiOffer ? 'Generando Oferta...' : 'Generar Nueva Oferta'}</span>
              </button>
            </div>

            {/* Render AI generated offer */}
            {aiOffer && (
              <div className="mt-6 p-5 rounded-2xl bg-neutral-950 border border-amber-500/40 space-y-3 animate-fadeIn">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-lg bg-amber-500 text-neutral-950 text-xs font-extrabold uppercase">
                      {aiOffer.discountBadge || "OFERTA EXCLUSIVA"}
                    </span>
                    <span className="text-xs font-mono text-amber-300 font-bold px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30">
                      Cupón: {aiOffer.promoCode}
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                    <BellRing className="w-3.5 h-3.5" />
                    Enviado por Push
                  </span>
                </div>

                <h4 className="text-base font-extrabold text-white">
                  {aiOffer.title}
                </h4>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  {aiOffer.body}
                </p>

                <div className="pt-2 border-t border-neutral-900 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {aiOffer.targetProduct && (
                    <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800">
                      <span className="text-[10px] text-neutral-500 uppercase font-bold">Artículo Recomendado:</span>
                      <div className="text-white font-semibold mt-0.5">{aiOffer.targetProduct}</div>
                    </div>
                  )}
                  {aiOffer.targetCourt && (
                    <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800">
                      <span className="text-[10px] text-neutral-500 uppercase font-bold">Cancha Sugerida:</span>
                      <div className="text-white font-semibold mt-0.5">{aiOffer.targetCourt}</div>
                    </div>
                  )}
                </div>

                {aiOffer.reasoning && (
                  <div className="text-[11px] text-neutral-400 italic">
                    💡 Por qué recibiste esto: {aiOffer.reasoning}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* QR Code Pass Modal */}
      {selectedQrBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold uppercase text-emerald-400 tracking-wider">
                Pase Digital de Acceso
              </span>
              <button
                onClick={() => setSelectedQrBooking(null)}
                className="text-neutral-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div className="bg-white p-4 rounded-2xl w-44 h-44 mx-auto flex items-center justify-center shadow-lg">
              <QrCode className="w-36 h-36 text-neutral-950" />
            </div>

            <div className="text-xs font-mono text-neutral-400">
              Pase #{selectedQrBooking}
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed">
              Muestra este código en la garita de ingreso o recepción del complejo para habilitar las luces de la cancha.
            </p>

            <button
              onClick={() => setSelectedQrBooking(null)}
              className="w-full py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-bold transition"
            >
              Cerrar Pase
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
