import React, { useState } from "react";
import { useApp } from "../context/AppContext.js";
import { Court, CourtSportType, SurfaceType } from "../types.js";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Star, 
  ShieldCheck, 
  Check, 
  AlertCircle, 
  QrCode, 
  ArrowRight,
  Filter,
  CheckCircle2,
  X
} from "lucide-react";

export const CourtBookingView: React.FC<{ onNavigateToDashboard?: () => void }> = ({ onNavigateToDashboard }) => {
  const { courts, bookings, createBooking, platformConfig, currentUser } = useApp();

  const todayStr = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [sportFilter, setSportFilter] = useState<"all" | CourtSportType>("all");
  const [surfaceFilter, setSurfaceFilter] = useState<"all" | SurfaceType>("all");

  // Booking modal state
  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [teamNotes, setTeamNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"tarjeta" | "pse" | "nequi_daviplata" | "transferencia" | "efectivo_en_cancha">("pse");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedBookingId, setConfirmedBookingId] = useState<string | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);

  // Filtered courts
  const filteredCourts = courts.filter(court => {
    if (sportFilter !== "all" && court.sportType !== sportFilter) return false;
    if (surfaceFilter !== "all" && court.surface !== surfaceFilter) return false;
    return true;
  });

  // Check if slot is taken on selectedDate
  const isSlotBooked = (courtId: string, slotTime: string) => {
    return bookings.some(
      b => b.courtId === courtId && b.date === selectedDate && b.timeSlot.startsWith(slotTime) && b.status !== "cancelada"
    );
  };

  const handleOpenBookingModal = (court: Court, slot: string) => {
    setSelectedCourt(court);
    setSelectedSlot(slot);
    setBookingError(null);
    setConfirmedBookingId(null);
  };

  const handleConfirmReservation = async () => {
    if (!selectedCourt || !selectedSlot) return;

    setIsSubmitting(true);
    setBookingError(null);

    const slotLabel = `${selectedSlot} - ${parseInt(selectedSlot.split(":")[0]) + 1}:00`;

    const res = await createBooking({
      courtId: selectedCourt.id,
      date: selectedDate,
      timeSlot: slotLabel,
      paymentMethod,
      notes: teamNotes
    });

    setIsSubmitting(false);

    if (res.success && res.booking) {
      setConfirmedBookingId(res.booking.id);
    } else {
      setBookingError(res.error || "No se pudo completar la reserva.");
    }
  };

  const formatSportLabel = (type: CourtSportType) => {
    switch (type) {
      case "futsal": return "Futsal 40x20";
      case "futbol5": return "Fútbol 5";
      case "futbol7": return "Fútbol 7";
      case "futbol11": return "Fútbol 11 Profesional";
    }
  };

  const formatSurfaceLabel = (surface: SurfaceType) => {
    switch (surface) {
      case "parquet": return "Parquet Amortiguado FIFA";
      case "sintetico_indoor": return "Césped Sintético Techado";
      case "sintetico_outdoor": return "Césped Sintético Al Aire Libre";
      case "cesped_natural": return "Césped Natural";
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Hero / Filter Section */}
      <div className="bg-neutral-900 border border-neutral-800/80 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xl">
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-3">
            <ShieldCheck className="w-4 h-4" />
            Reservas en Tiempo Real & Seguro de Turno
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Reserva Canchas de <span className="text-emerald-400">Futsal y Fútbol</span>
          </h1>
          <p className="text-neutral-300 text-sm sm:text-base mt-2 max-w-2xl leading-relaxed">
            Pistas de parquet oficial, canchas sintéticas techadas y fútbol campo. 
            Confirmación instantánea mediante notificación push, código QR de acceso y comisión transparente del {(platformConfig.commissionRateBookings * 100).toFixed(0)}%.
          </p>
        </div>

        {/* Filters Row */}
        <div className="mt-6 pt-6 border-t border-neutral-800 grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          {/* Date Picker */}
          <div>
            <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              Fecha del Partido
            </label>
            <input
              type="date"
              value={selectedDate}
              min={todayStr}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          {/* Sport Filter */}
          <div>
            <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-emerald-400" />
              Disciplina
            </label>
            <select
              value={sportFilter}
              onChange={(e) => setSportFilter(e.target.value as any)}
              className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium focus:outline-none focus:border-emerald-500 transition"
            >
              <option value="all">Todas las disciplinas</option>
              <option value="futsal">Futsal (Parquet / Indoor)</option>
              <option value="futbol5">Fútbol 5</option>
              <option value="futbol7">Fútbol 7</option>
              <option value="futbol11">Fútbol 11</option>
            </select>
          </div>

          {/* Surface Filter */}
          <div>
            <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">
              Tipo de Superficie
            </label>
            <select
              value={surfaceFilter}
              onChange={(e) => setSurfaceFilter(e.target.value as any)}
              className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium focus:outline-none focus:border-emerald-500 transition"
            >
              <option value="all">Cualquier superficie</option>
              <option value="parquet">Parquet (Oficial Futsal)</option>
              <option value="sintetico_indoor">Sintético Techado</option>
              <option value="sintetico_outdoor">Sintético Exterior</option>
              <option value="cesped_natural">Césped Natural</option>
            </select>
          </div>

        </div>
      </div>

      {/* Courts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredCourts.length === 0 ? (
          <div className="col-span-2 text-center py-16 bg-neutral-900/50 rounded-3xl border border-neutral-800">
            <p className="text-neutral-400 text-sm">No hay canchas que coincidan con los filtros seleccionados.</p>
          </div>
        ) : (
          filteredCourts.map(court => (
            <div 
              key={court.id}
              className="bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden hover:border-neutral-700 transition flex flex-col group shadow-lg"
            >
              {/* Image & Badges */}
              <div className="relative h-52 overflow-hidden">
                <img 
                  src={court.image} 
                  alt={court.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent" />
                
                {/* Top Badges */}
                <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-500 text-neutral-950 uppercase tracking-wide">
                    {formatSportLabel(court.sportType)}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-neutral-900/90 text-neutral-200 backdrop-blur-md border border-neutral-700">
                    {formatSurfaceLabel(court.surface)}
                  </span>
                </div>

                {/* Rating */}
                <div className="absolute top-4 right-4 px-2.5 py-1 rounded-xl bg-neutral-950/80 backdrop-blur-md text-amber-300 text-xs font-bold flex items-center gap-1 border border-neutral-800">
                  <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                  <span>{court.rating}</span>
                  <span className="text-neutral-400 text-[10px]">({court.reviewsCount})</span>
                </div>

                {/* Bottom title & complex */}
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-lg font-bold text-white tracking-tight">
                    {court.name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-neutral-300 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{court.location} • {court.complexName}</span>
                  </div>
                </div>
              </div>

              {/* Body & Amenities */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                
                {/* Amenities pills */}
                <div className="flex flex-wrap gap-1.5">
                  {court.amenities.slice(0, 4).map((amenity, idx) => (
                    <span 
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-neutral-950 text-neutral-300 text-[11px] font-medium border border-neutral-800"
                    >
                      {amenity}
                    </span>
                  ))}
                  {court.amenities.length > 4 && (
                    <span className="px-2 py-1 rounded-lg bg-neutral-950 text-neutral-400 text-[11px] border border-neutral-800">
                      +{court.amenities.length - 4} más
                    </span>
                  )}
                </div>

                {/* Pricing info */}
                <div className="pt-3 border-t border-neutral-800 flex items-center justify-between">
                  <div>
                    <div className="text-xs text-neutral-400">Tarifa por hora</div>
                    <div className="text-xl font-extrabold text-white">
                      ${court.pricePerHour.toLocaleString()}{" "}
                      <span className="text-xs font-normal text-neutral-400">COP</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      Comisión {(platformConfig.commissionRateBookings * 100).toFixed(0)}% (${Math.round(court.pricePerHour * platformConfig.commissionRateBookings).toLocaleString()} COP)
                    </div>
                    <div className="text-[10px] text-neutral-500">Incluye seguro y confirmación inmediata</div>
                  </div>
                </div>

                {/* Available Hours Grid for selectedDate */}
                <div>
                  <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span>Turnos disponibles ({selectedDate})</span>
                    <span className="text-[10px] text-neutral-500 font-normal">Toca un horario para reservar</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {court.availableHours.map(hour => {
                      const booked = isSlotBooked(court.id, hour);
                      return (
                        <button
                          key={hour}
                          disabled={booked}
                          onClick={() => handleOpenBookingModal(court, hour)}
                          className={`py-2 px-1 rounded-xl text-xs font-bold text-center border transition ${
                            booked
                              ? "bg-neutral-950/60 border-neutral-800 text-neutral-600 cursor-not-allowed line-through"
                              : "bg-neutral-800 hover:bg-emerald-500 hover:text-neutral-950 hover:border-emerald-500 border-neutral-700 text-neutral-200"
                          }`}
                        >
                          {hour} hs
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>
            </div>
          ))
        )}
      </div>

      {/* Booking Checkout Modal */}
      {selectedCourt && selectedSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative overflow-hidden">
            
            {/* Close Button */}
            <button
              onClick={() => {
                setSelectedCourt(null);
                setSelectedSlot(null);
                setConfirmedBookingId(null);
              }}
              className="absolute top-5 right-5 text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            {!confirmedBookingId ? (
              <>
                {/* Modal Title */}
                <div className="mb-5">
                  <span className="text-xs font-bold uppercase text-emerald-400 tracking-wider">
                    Confirmación de Turno en Tiempo Real
                  </span>
                  <h3 className="text-xl font-extrabold text-white mt-0.5">
                    {selectedCourt.name}
                  </h3>
                  <p className="text-xs text-neutral-400 mt-1">
                    {selectedCourt.complexName} • {selectedCourt.location}
                  </p>
                </div>

                {/* Summary Card */}
                <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-4 space-y-2.5 text-xs text-neutral-300 mb-5">
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Fecha del partido:</span>
                    <strong className="text-white">{selectedDate}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Horario del turno:</span>
                    <strong className="text-emerald-400">{selectedSlot} hs (1 hora)</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Deporte / Superficie:</span>
                    <span className="text-white">{formatSportLabel(selectedCourt.sportType)} ({formatSurfaceLabel(selectedCourt.surface)})</span>
                  </div>
                  
                  {/* Fee Breakdown */}
                  <div className="pt-2.5 border-t border-neutral-800/80 space-y-1.5">
                    <div className="flex justify-between text-neutral-400">
                      <span>Alquiler de cancha:</span>
                      <span>${selectedCourt.pricePerHour.toLocaleString()} COP</span>
                    </div>
                    <div className="flex justify-between text-neutral-400">
                      <span>Comisión de plataforma ({(platformConfig.commissionRateBookings * 100).toFixed(0)}%):</span>
                      <span className="text-emerald-400">${Math.round(selectedCourt.pricePerHour * platformConfig.commissionRateBookings).toLocaleString()} COP</span>
                    </div>
                    <div className="flex justify-between text-sm font-extrabold text-white pt-1 border-t border-neutral-800">
                      <span>Total a abonar:</span>
                      <span className="text-emerald-400">${selectedCourt.pricePerHour.toLocaleString()} COP</span>
                    </div>
                  </div>
                </div>

                {/* Team notes input */}
                <div className="space-y-3 mb-5">
                  <div>
                    <label className="block text-xs font-bold text-neutral-300 mb-1">
                      Nombre de tu equipo / Notas (opcional):
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Los Cracks FC - Necesitamos petos y balón Golty"
                      value={teamNotes}
                      onChange={(e) => setTeamNotes(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  {/* Payment method selector */}
                  <div>
                    <label className="block text-xs font-bold text-neutral-300 mb-1">
                      Método de Pago (Colombia):
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("pse")}
                        className={`p-2.5 rounded-xl border text-xs font-medium text-left transition ${
                          paymentMethod === "pse" ? "bg-emerald-500/15 border-emerald-500 text-emerald-300" : "bg-neutral-950 border-neutral-800 text-neutral-400"
                        }`}
                      >
                        <div className="font-bold">PSE (Débito en Línea)</div>
                        <div className="text-[10px] text-neutral-500">Bancolombia, Davivienda, etc.</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod("nequi_daviplata")}
                        className={`p-2.5 rounded-xl border text-xs font-medium text-left transition ${
                          paymentMethod === "nequi_daviplata" ? "bg-emerald-500/15 border-emerald-500 text-emerald-300" : "bg-neutral-950 border-neutral-800 text-neutral-400"
                        }`}
                      >
                        <div className="font-bold">Nequi / Daviplata</div>
                        <div className="text-[10px] text-neutral-500">Transferencia móvil inmediata</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod("tarjeta")}
                        className={`p-2.5 rounded-xl border text-xs font-medium text-left transition ${
                          paymentMethod === "tarjeta" ? "bg-emerald-500/15 border-emerald-500 text-emerald-300" : "bg-neutral-950 border-neutral-800 text-neutral-400"
                        }`}
                      >
                        <div className="font-bold">Tarjeta de Crédito</div>
                        <div className="text-[10px] text-neutral-500">Visa / Mastercard / Amex</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod("efectivo_en_cancha")}
                        className={`p-2.5 rounded-xl border text-xs font-medium text-left transition ${
                          paymentMethod === "efectivo_en_cancha" ? "bg-emerald-500/15 border-emerald-500 text-emerald-300" : "bg-neutral-950 border-neutral-800 text-neutral-400"
                        }`}
                      >
                        <div className="font-bold">Efectivo en Cancha</div>
                        <div className="text-[10px] text-neutral-500">Pago antes de iniciar el partido</div>
                      </button>
                    </div>
                  </div>
                </div>

                {bookingError && (
                  <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{bookingError}</span>
                  </div>
                )}

                {/* Confirm Action Button */}
                <button
                  id="btn-confirm-court-booking"
                  disabled={isSubmitting}
                  onClick={handleConfirmReservation}
                  className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Procesando reserva...</span>
                  ) : (
                    <>
                      <span>Confirmar Reserva y Emitir Pase QR</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </>
            ) : (
              /* Success / QR Ticket View */
              <div className="text-center py-4 space-y-4 animate-fadeIn">
                <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-xl font-extrabold text-white">¡Reserva Confirmada!</h4>
                  <p className="text-xs text-neutral-300 mt-1 max-w-sm mx-auto">
                    Hemos enviado una notificación push con la confirmación. Tu cancha está reservada en tiempo real.
                  </p>
                </div>

                {/* QR Code Pass Box */}
                <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 max-w-xs mx-auto text-center space-y-2">
                  <div className="bg-white p-3 rounded-xl w-32 h-32 mx-auto flex items-center justify-center shadow">
                    <QrCode className="w-24 h-24 text-neutral-950" />
                  </div>
                  <div className="text-[10px] font-mono text-neutral-400">
                    ID Pase: #{confirmedBookingId}
                  </div>
                  <div className="text-xs font-bold text-emerald-400">
                    Presenta este código al ingresar al complejo
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-center gap-3">
                  <button
                    onClick={() => {
                      setSelectedCourt(null);
                      setSelectedSlot(null);
                      setConfirmedBookingId(null);
                      onNavigateToDashboard?.();
                    }}
                    className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs flex items-center gap-2 transition"
                  >
                    Ver en Mi Panel de Turnos
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
