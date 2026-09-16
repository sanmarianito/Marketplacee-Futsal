import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext.js";
import { 
  TrendingUp, 
  DollarSign, 
  PieChart, 
  Users, 
  Sparkles, 
  RefreshCw, 
  Clock, 
  Award, 
  Target, 
  ArrowUpRight, 
  Flame, 
  Lightbulb,
  CheckCircle2
} from "lucide-react";

export const AdminAnalyticsView: React.FC = () => {
  const { analyticsData, refreshAnalytics, platformConfig, triggerPushNotification } = useApp();

  const [aiTrends, setAiTrends] = useState<any>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [customFocus, setCustomFocus] = useState("Oportunidades de crecimiento en Futsal y optimización de tarifas");
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastSent, setBroadcastSent] = useState(false);

  const fetchAiTrends = async () => {
    setIsLoadingAi(true);
    try {
      const res = await fetch("/api/ai/market-trends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customFocus })
      });
      const data = await res.json();
      setAiTrends(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingAi(false);
    }
  };

  useEffect(() => {
    fetchAiTrends();
  }, []);

  const summary = analyticsData?.summary || {
    totalBookings: 12,
    totalOrders: 6,
    futsalRatio: 64,
    futbolRatio: 36,
    totalBookingRevenue: 1250000,
    totalBookingCommission: 100000,
    totalProductRevenue: 890000,
    totalProductCommission: 54000,
    netTotalPlatformRevenue: 154000
  };

  const handleSendPlatformBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) return;
    setIsBroadcasting(true);
    await triggerPushNotification({
      title: "📢 Notificación General de Plataforma",
      body: broadcastMessage,
      type: "oferta_personalizada",
      userId: "all",
      promoCode: "FUTMARKET-APP",
      discountBadge: "PROMO GENERAL"
    });
    setIsBroadcasting(false);
    setBroadcastSent(true);
    setBroadcastMessage("");
    setTimeout(() => setBroadcastSent(false), 3000);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Header Banner */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xl">
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 text-purple-300 text-xs font-bold uppercase tracking-wider mb-2">
              <TrendingUp className="w-4 h-4" />
              Inteligencia de Negocios & Comisiones
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Adquisición de Datos Valiosos & <span className="text-emerald-400">Tendencias del Mercado</span>
            </h1>
            <p className="text-xs sm:text-sm text-neutral-300 mt-1.5 leading-relaxed">
              Monitoreo del cobro de comisiones de plataforma ({(platformConfig.commissionRateBookings * 100).toFixed(0)}% canchas, {(platformConfig.commissionRateProducts * 100).toFixed(0)}% tienda), métricas de consumo entre Futsal vs Fútbol y optimización estratégica asistida por Gemini IA.
            </p>
          </div>

          <button
            onClick={() => {
              refreshAnalytics();
              fetchAiTrends();
            }}
            className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold flex items-center gap-2 border border-neutral-700 transition self-start md:self-auto shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Actualizar Datos
          </button>
        </div>
      </div>

      {/* KPI Cards: Platform Commission Performance */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-2">
          <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center justify-between">
            <span>Comisiones Totales</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-400">
            ${summary.netTotalPlatformRevenue.toLocaleString()}{" "}
            <span className="text-xs font-normal text-neutral-400">COP</span>
          </div>
          <div className="text-[11px] text-neutral-400">
            Ingreso neto recaudado por FutMarket Colombia
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-2">
          <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center justify-between">
            <span>Comisión Canchas ({(platformConfig.commissionRateBookings * 100).toFixed(0)}%)</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">
            ${summary.totalBookingCommission.toLocaleString()} COP
          </div>
          <div className="text-[11px] text-emerald-400 font-semibold">
            Sobre ${summary.totalBookingRevenue.toLocaleString()} COP en reservas
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-2">
          <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center justify-between">
            <span>Comisión Tienda ({(platformConfig.commissionRateProducts * 100).toFixed(0)}%)</span>
            <PieChart className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">
            ${summary.totalProductCommission.toLocaleString()} COP
          </div>
          <div className="text-[11px] text-blue-400 font-semibold">
            Sobre ${summary.totalProductRevenue.toLocaleString()} COP en productos
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-2">
          <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center justify-between">
            <span>Preferencia de Disciplina</span>
            <Flame className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-extrabold text-white flex items-center gap-2">
            <span className="text-emerald-400">{summary.futsalRatio}%</span>
            <span className="text-xs font-normal text-neutral-500">vs</span>
            <span className="text-blue-400">{summary.futbolRatio}%</span>
          </div>
          <div className="text-[11px] text-neutral-400">
            Futsal Parquet lidera la demanda
          </div>
        </div>

      </div>

      {/* Deep Market Insights & Preference Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Market Trends Card: Futsal vs Football Demand */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <PieChart className="w-4 h-4 text-emerald-400" />
              Comportamiento de la Demanda: Futsal vs Fútbol
            </h3>
            <span className="text-xs text-neutral-400 font-mono">Dato en Tiempo Real</span>
          </div>

          <p className="text-xs text-neutral-300 leading-relaxed">
            Las canchas de <strong>Futsal con suelo de parquet amortiguado</strong> y balones de medio pique presentan una tasa de ocupación del <strong>{summary.futsalRatio}%</strong>, superando al fútbol 5 tradicional en días de semana por su alta intensidad y protección articular.
          </p>

          {/* Progress Bar Visualizer */}
          <div className="space-y-2 pt-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-emerald-400">Futsal (Parquet / Indoor): {summary.futsalRatio}%</span>
              <span className="text-blue-400">Fútbol (Sintético / Campo 7 y 11): {summary.futbolRatio}%</span>
            </div>
            <div className="w-full h-3 rounded-full bg-neutral-950 overflow-hidden flex">
              <div style={{ width: `${summary.futsalRatio}%` }} className="bg-emerald-500 h-full transition-all duration-500" />
              <div style={{ width: `${summary.futbolRatio}%` }} className="bg-blue-500 h-full transition-all duration-500" />
            </div>
          </div>

          {/* Key Preference Metrics */}
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-neutral-800 text-xs">
            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800/80">
              <div className="text-[10px] text-neutral-400 uppercase font-bold">Horario de Mayor Ocupación:</div>
              <div className="text-white font-bold mt-1 text-sm">20:00 a 22:00 hs (94%)</div>
              <div className="text-[10px] text-emerald-400 mt-0.5">Franja ideal para tarifa dinámica</div>
            </div>

            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800/80">
              <div className="text-[10px] text-neutral-400 uppercase font-bold">Calzado Más Vendido:</div>
              <div className="text-white font-bold mt-1 text-sm">Suela Caramelo / Indoor</div>
              <div className="text-[10px] text-emerald-400 mt-0.5">58% de ventas en calzado</div>
            </div>
          </div>
        </div>

        {/* AI Strategic Intelligence Engine Card */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              Estrategia de Mercado Asistida por Gemini IA
            </h3>
            <button
              id="btn-reanalyze-market-ai"
              disabled={isLoadingAi}
              onClick={fetchAiTrends}
              className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition"
              title="Volver a analizar"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingAi ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Custom query prompt for the AI */}
          <div className="flex gap-2">
            <input
              type="text"
              value={customFocus}
              onChange={(e) => setCustomFocus(e.target.value)}
              placeholder="Enfoque de análisis..."
              className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500"
            />
            <button
              onClick={fetchAiTrends}
              disabled={isLoadingAi}
              className="px-3 py-1.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-neutral-950 font-bold text-xs shrink-0 transition"
            >
              Analizar
            </button>
          </div>

          {/* AI Trends Output */}
          {aiTrends && (
            <div className="space-y-3 pt-1">
              {aiTrends.trends?.map((t: any, idx: number) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800/80 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <h5 className="font-bold text-white">{t.title}</h5>
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-purple-500/20 text-purple-300">
                      {t.badge || "Oportunidad"}
                    </span>
                  </div>
                  <p className="text-neutral-300 text-[11px] leading-relaxed">{t.insight}</p>
                  <div className="pt-1.5 flex items-center justify-between text-[11px] border-t border-neutral-900">
                    <span className="text-emerald-400 font-semibold">💡 {t.strategy}</span>
                    <span className="text-neutral-500 font-mono text-[10px]">{t.impact}</span>
                  </div>
                </div>
              ))}

              {aiTrends.strategicSummary && (
                <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-[11px] text-purple-200 leading-relaxed">
                  <strong>Resumen Ejecutivo:</strong> {aiTrends.strategicSummary}
                </div>
              )}
            </div>
          )}
        </div>

      </div>

      {/* Broadcast Push Notification Tool for Platform Admin */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8">
        <div className="max-w-2xl">
          <span className="text-xs font-bold uppercase text-emerald-400 tracking-wider">
            Marketing Push Masivo
          </span>
          <h3 className="text-lg font-extrabold text-white mt-1">
            Emitir Notificación Push a Todos los Usuarios del Ecosistema
          </h3>
          <p className="text-xs text-neutral-400 mt-1">
            Envía avisos de torneos, descuentos de comisiones por apertura de temporada o recordatorios para reservar canchas anticipadamente.
          </p>
        </div>

        <form onSubmit={handleSendPlatformBroadcast} className="mt-4 flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            required
            placeholder="Ej: ¡Nuevo torneo de Futsal relámpago este viernes! Reserva tu cancha con 20% OFF."
            value={broadcastMessage}
            onChange={(e) => setBroadcastMessage(e.target.value)}
            className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
          />
          <button
            type="submit"
            disabled={isBroadcasting}
            className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs flex items-center justify-center gap-1.5 transition shrink-0"
          >
            {isBroadcasting ? "Emitiendo..." : "Enviar Push Masivo"}
          </button>
        </form>

        {broadcastSent && (
          <div className="mt-3 text-xs text-emerald-400 font-semibold flex items-center gap-1.5 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4" />
            Notificación push transmitida en tiempo real a todos los clientes y complejos conectados.
          </div>
        )}
      </div>

    </div>
  );
};
