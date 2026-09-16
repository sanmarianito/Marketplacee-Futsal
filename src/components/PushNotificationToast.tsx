import React from "react";
import { useApp } from "../context/AppContext.js";
import { Bell, X, Sparkles, Calendar, Package, Tag, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export const PushNotificationToast: React.FC<{ onNavigate?: (tab: string) => void }> = ({ onNavigate }) => {
  const { activeNotification, dismissActiveNotification } = useApp();

  if (!activeNotification) return null;

  const getIcon = () => {
    switch (activeNotification.type) {
      case "reserva_confirmada":
        return <Calendar className="w-5 h-5 text-emerald-400" />;
      case "pedido_actualizado":
        return <Package className="w-5 h-5 text-blue-400" />;
      case "oferta_personalizada":
        return <Sparkles className="w-5 h-5 text-amber-400" />;
      default:
        return <Bell className="w-5 h-5 text-emerald-400" />;
    }
  };

  const handleClickAction = () => {
    if (activeNotification.type === "reserva_confirmada") {
      onNavigate?.("dashboard");
    } else if (activeNotification.type === "pedido_actualizado") {
      onNavigate?.("dashboard");
    } else if (activeNotification.type === "oferta_personalizada") {
      onNavigate?.("marketplace");
    }
    dismissActiveNotification();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.9 }}
        transition={{ duration: 0.25 }}
        id="push-notification-toast"
        className="fixed top-4 right-4 z-50 max-w-md w-full bg-neutral-900/95 border border-emerald-500/40 rounded-2xl p-4 shadow-2xl backdrop-blur-xl shadow-emerald-950/40 text-neutral-100"
      >
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-neutral-800/80 border border-neutral-700/60 shrink-0">
            {getIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Notificación Push
              </span>
              <button
                id="btn-close-push-toast"
                onClick={dismissActiveNotification}
                className="text-neutral-400 hover:text-neutral-200 p-1 rounded-lg hover:bg-neutral-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <h4 className="text-sm font-bold text-white mt-1 leading-snug">
              {activeNotification.title}
            </h4>
            <p className="text-xs text-neutral-300 mt-1 line-clamp-2 leading-relaxed">
              {activeNotification.body}
            </p>

            {activeNotification.promoCode && (
              <div className="mt-2.5 flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold">
                  <Tag className="w-3.5 h-3.5" />
                  {activeNotification.promoCode}
                </span>
                {activeNotification.discountBadge && (
                  <span className="text-xs px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-semibold">
                    {activeNotification.discountBadge}
                  </span>
                )}
              </div>
            )}

            <div className="mt-3 flex items-center justify-end gap-2 pt-2 border-t border-neutral-800">
              <button
                id="btn-action-push-toast"
                onClick={handleClickAction}
                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition"
              >
                Ver en mi panel
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
