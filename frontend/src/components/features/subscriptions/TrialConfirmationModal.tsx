"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  IconCalendar,
  IconCheck,
  IconClock,
  IconCrown,
  IconInfoCircle,
  IconLoader2,
  IconX,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface TrialConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isLoading?: boolean;
}

const TRIAL_FEATURES = [
  "Unlimited AI Projects/Systems",
  "AI Vulnerability Assessment",
  "Automated Bias & Fairness Testing (Manual/API/Dataset)",
  "Compliance Readiness Controls (CRC)",
  "Enhanced Reporting & Analytics",
  "Advanced Exportable Reports (PDF/Excel)",
  "Teams and Collaboration",
];

export function TrialConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}: TrialConfirmationModalProps) {
  const expirationDateString = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date.toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isLoading && onClose()}>
      <DialogContent className="max-w-md p-0 overflow-hidden border-0 bg-transparent shadow-2xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.24, ease: "easeOut" }}
          className="bg-card text-card-foreground rounded-3xl overflow-hidden border border-border/80 flex flex-col relative"
        >
          {/* Close Button */}
          {!isLoading && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors z-50"
            >
              <IconX className="w-5 h-5" />
            </button>
          )}

          {/* Premium Gradient Header */}
          <div className="bg-linear-to-r from-primary/15 via-primary/5 to-transparent px-6 pt-8 pb-5 border-b border-border/40 relative">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0">
                <IconCrown className="w-6 h-6 text-primary animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                  7-Day Free Trial
                </span>
                <DialogTitle className="text-xl font-extrabold mt-1 text-foreground">
                  Confirm Trial Activation
                </DialogTitle>
              </div>
            </div>
          </div>

          {/* Body Content */}
          <div className="p-6 flex-1 overflow-y-auto max-h-[60vh] space-y-6">
            {/* Quick Summary Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-muted/40 border border-border/50 rounded-xl p-3 flex items-start gap-2.5">
                <IconClock className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <span className="text-[10px] text-muted-foreground block font-semibold uppercase">Duration</span>
                  <span className="text-sm font-bold text-foreground">7 Days Free</span>
                </div>
              </div>
              <div className="bg-muted/40 border border-border/50 rounded-xl p-3 flex items-start gap-2.5">
                <IconCalendar className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <span className="text-[10px] text-muted-foreground block font-semibold uppercase">Expires On</span>
                  <span className="text-xs font-bold text-foreground truncate block" title={expirationDateString}>
                    {expirationDateString.split(", ").slice(1).join(", ")}
                  </span>
                </div>
              </div>
            </div>

            {/* Features List */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                What's Included (BLOOM Tier)
              </h4>
              <ul className="space-y-2.5">
                {TRIAL_FEATURES.map((feature, i) => (
                  <motion.li
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 + 0.1 }}
                    key={i}
                    className="flex items-start gap-2.5 text-xs text-foreground/90 font-medium"
                  >
                    <div className="w-4 h-4 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center shrink-0 text-emerald-500 mt-0.5">
                      <IconCheck className="w-3 h-3 stroke-[3]" />
                    </div>
                    <span>{feature}</span>
                  </motion.li>
                ))}
              </ul>
            </div>

            {/* Info Notice Box */}
            <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4 flex items-start gap-3">
              <IconInfoCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div className="text-xs text-muted-foreground leading-relaxed">
                <span className="font-bold text-foreground block mb-0.5">No Credit Card Required</span>
                Your trial will automatically transition back to the free tier at the end of the 7-day period unless you choose to upgrade. No accidental charges will occur.
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="p-6 border-t border-border/50 bg-muted/20 flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="h-10 rounded-xl text-xs font-semibold"
            >
              Cancel
            </Button>
            <Button
              onClick={onConfirm}
              disabled={isLoading}
              className="h-10 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isLoading ? (
                <>
                  <IconLoader2 className="w-4 h-4 animate-spin mr-2" />
                  Activating Trial...
                </>
              ) : (
                "Activate Free Trial"
              )}
            </Button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
