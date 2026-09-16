import React, { useState } from "react";
import { useApp } from "../context/AppContext.js";
import { 
  Bell, 
  X, 
  CheckCheck, 
  Calendar, 
  Package, 
  Sparkles, 
  ShieldCheck, 
  Send, 
  Tag, 
  Volume2 
} from "lucide-react";

export const NotificationCenterModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { 
    notifications, 
    currentUser, 
    markNotificationsAsRead, 
    triggerPushNotification 
  } = useApp();

  const [nativePermState, setNativePermState] = useState<NotificationPermission>(
    typeof window !== "undefined" && "Notification" in window ? Notification.permission : "default"
  );
  const [testType, setTestType] = useState<"reserva_confirmada" | "oferta_personalizada" | "pedido_actualizado">("oferta_personalizada");
  const [testTitle, setTestTitle] = useState("¡Turno con 15% OFF en Cancha Techada! ⚽");
  const [testBody, setTestBody] = useState("Tu equipo suele jugar Futsal los jueves. Aprovecha descuento exclusivo por tiempo limitado.");

  if (!isOpen) return null;

  const handleRequestNativePermission = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      setNativePermState(permission);
      if (permission === "granted") {
        new Notification("¡Notificaciones Push Activadas! ⚽", {
          body: "Recibirás confirmaciones instantáneas de tus canchas y ofertas de equipamiento deportivo.",
          icon: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=100&auto=format&fit=crop&q=80"
        });
      }
    }
  };

  const handleSendTestPush = async () => {
    await triggerPushNotification({
      title: testTitle,
      body: testBody,
      type: testType,
      promoCode: testType === "oferta_personalizada" ? "CRACK-FUTSAL-15" : undefined,
      discountBadge: testType === "oferta_personalizada" ? "15% OFF" : undefined
    });
  };

  const userNotifs = notifications.filter(n => n.userId === currentUser.id || n.userId === "all");

  return (
    <div id="modal-notification-center" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Centro de Notificaciones Push</h3>
              <p className="text-xs text-neutral-400">Confirmaciones de reservas y promociones en tiempo real</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              id="btn-mark-all-read"
              onClick={markNotificationsAsRead}
              className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-300 hover:text-white flex items-center gap-1.5 transition"
            >
              <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
              Marcar leídas
            </button>
            <button
              id="btn-close-notif-modal"
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Native Push Banner */}
        <div className="px-5 py-3.5 bg-neutral-950/60 border-b border-neutral-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-neutral-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Push en Navegador:{" "}
              <strong className={nativePermState === "granted" ? "text-emerald-400" : "text-amber-400"}>
                {nativePermState === "granted" ? "Habilitado" : "Pendiente"}
              </strong>
            </span>
          </div>
          {nativePermState !== "granted" && (
            <button
              id="btn-enable-native-push"
              onClick={handleRequestNativePermission}
              className="px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs flex items-center gap-1 transition"
            >
              <Volume2 className="w-3.5 h-3.5" />
              Activar Push
            </button>
          )}
        </div>

        {/* List of Notifications */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {userNotifs.length === 0 ? (
            <div className="text-center py-12 text-neutral-500">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No tienes notificaciones pendientes.</p>
            </div>
          ) : (
            userNotifs.map(notif => (
              <div
                key={notif.id}
                className={`p-4 rounded-2xl border transition ${
                  notif.read
                    ? "bg-neutral-950/40 border-neutral-800/60 text-neutral-400"
                    : "bg-neutral-800/60 border-emerald-500/30 text-neutral-200"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-neutral-800 shrink-0 mt-0.5">
                    {notif.type === "reserva_confirmada" ? (
                      <Calendar className="w-4 h-4 text-emerald-400" />
                    ) : notif.type === "pedido_actualizado" ? (
                      <Package className="w-4 h-4 text-blue-400" />
                    ) : (
                      <Sparkles className="w-4 h-4 text-amber-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-sm font-bold text-white">{notif.title}</h4>
                      <span className="text-[10px] text-neutral-500 font-mono">
                        {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-300 mt-1 leading-relaxed">{notif.body}</p>
                    {notif.promoCode && (
                      <div className="mt-2 flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono text-xs font-bold flex items-center gap-1">
                          <Tag className="w-3 h-3" />
                          {notif.promoCode}
                        </span>
                        {notif.discountBadge && (
                          <span className="text-xs text-emerald-400 font-semibold">{notif.discountBadge}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Live Push Simulator Box */}
        <div className="p-4 bg-neutral-950 border-t border-neutral-800">
          <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Simulador de Push en Tiempo Real</span>
            <span className="text-emerald-400 font-normal">Prueba inmediata</span>
          </div>
          <div className="grid grid-cols-3 gap-2 mb-2">
            <button
              onClick={() => {
                setTestType("oferta_personalizada");
                setTestTitle("¡Descuento Futsal para este Jueves! ⚡");
                setTestBody("Por tu historial en canchas de parquet, tienes 20% OFF en turnos nocturnos.");
              }}
              className={`p-1.5 rounded-lg text-[11px] font-medium border text-center transition ${
                testType === "oferta_personalizada" ? "bg-amber-500/20 border-amber-500/40 text-amber-300" : "bg-neutral-900 border-neutral-800 text-neutral-400"
              }`}
            >
              Oferta Personalizada
            </button>
            <button
              onClick={() => {
                setTestType("reserva_confirmada");
                setTestTitle("¡Cancha Confirmada con Código QR! 🏟️");
                setTestBody("Turno asignado en Complejo El Golazo para hoy a las 21:00 hs.");
              }}
              className={`p-1.5 rounded-lg text-[11px] font-medium border text-center transition ${
                testType === "reserva_confirmada" ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300" : "bg-neutral-900 border-neutral-800 text-neutral-400"
              }`}
            >
              Confirmar Turno
            </button>
            <button
              onClick={() => {
                setTestType("pedido_actualizado");
                setTestTitle("¡Accesorios Listos para tu Partido! 🛍️");
                setTestBody("Tus canilleras y medias antideslizantes ya están en el buffet del predio.");
              }}
              className={`p-1.5 rounded-lg text-[11px] font-medium border text-center transition ${
                testType === "pedido_actualizado" ? "bg-blue-500/20 border-blue-500/40 text-blue-300" : "bg-neutral-900 border-neutral-800 text-neutral-400"
              }`}
            >
              Estado de Pedido
            </button>
          </div>
          <button
            id="btn-trigger-test-push"
            onClick={handleSendTestPush}
            className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
          >
            <Send className="w-3.5 h-3.5" />
            Disparar Notificación Push de Prueba
          </button>
        </div>
      </div>
    </div>
  );
};
