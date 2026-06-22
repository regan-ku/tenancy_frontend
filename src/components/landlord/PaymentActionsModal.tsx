"use client";

import React, { useState } from "react";
import { paymentsApi, TenantLedgerItem } from "@/api/payments.api";

interface PaymentActionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  action: "stk" | "reminder";
  tenant: TenantLedgerItem;
}

export default function PaymentActionsModal({
  isOpen,
  onClose,
  action,
  tenant,
}: PaymentActionsModalProps) {
  const [phone, setPhone] = useState(tenant.tenant_phone);
  const [amount, setAmount] = useState(tenant.balance.toString());
  const [reminderMessage, setReminderMessage] = useState(
    `Dear ${tenant.tenant_name}, this is a gentle reminder that your rent of KES ${tenant.balance} for ${tenant.unit_code} is overdue. Please make the payment at your earliest convenience. Thank you.`,
  );

  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  if (!isOpen) return null;

  const handleSTKPush = async () => {
    setIsProcessing(true);
    setStatusMessage("Sending STK Push to M-Pesa...");
    try {
      const res = await paymentsApi.requestSTKPush(
        tenant.id,
        parseFloat(amount),
        phone,
      );
      setStatusMessage(
        `✅ Success! ${res.message} Check tenant's phone for the M-Pesa prompt.`,
      );
    } catch (error) {
      setStatusMessage("❌ Failed to initiate STK Push. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSendReminder = async (channel: "sms" | "whatsapp") => {
    setIsProcessing(true);
    setStatusMessage(`Sending reminder via ${channel.toUpperCase()}...`);
    try {
      await paymentsApi.sendPaymentReminder(
        tenant.id,
        channel,
        reminderMessage,
      );
      setStatusMessage(
        `✅ Reminder successfully sent via ${channel.toUpperCase()}!`,
      );
    } catch (error) {
      setStatusMessage(`❌ Failed to send ${channel.toUpperCase()}.`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-primary-dark">
              {action === "stk"
                ? "Request M-Pesa Payment"
                : "Send Payment Reminder"}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {tenant.tenant_name} • {tenant.unit_code}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* STK PUSH UI */}
          {action === "stk" && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Amount to Request (KES)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-lg font-bold focus:ring-2 focus:ring-primary outline-none"
                />
                <p className="text-xs text-slate-400 mt-1">
                  Outstanding Balance: KES {tenant.balance.toLocaleString()}
                </p>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  M-Pesa Phone Number
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                />
              </div>

              {statusMessage && (
                <div
                  className={`p-3 rounded-lg text-sm font-medium ${statusMessage.includes("✅") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}
                >
                  {statusMessage}
                </div>
              )}

              <button
                onClick={handleSTKPush}
                disabled={isProcessing}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl shadow-md transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>{" "}
                    Processing...
                  </>
                ) : (
                  <>📱 Send M-Pesa STK Push</>
                )}
              </button>
            </>
          )}

          {/* REMINDER UI */}
          {action === "reminder" && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Reminder Message
                </label>
                <textarea
                  rows={5}
                  value={reminderMessage}
                  onChange={(e) => setReminderMessage(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none resize-none"
                />
              </div>

              {statusMessage && (
                <div
                  className={`p-3 rounded-lg text-sm font-medium ${statusMessage.includes("✅") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}
                >
                  {statusMessage}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleSendReminder("sms")}
                  disabled={isProcessing}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-md transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    "💬"
                  )}{" "}
                  Send SMS
                </button>
                <button
                  onClick={() => handleSendReminder("whatsapp")}
                  disabled={isProcessing}
                  className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl shadow-md transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    "🟢"
                  )}{" "}
                  Send WhatsApp
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
