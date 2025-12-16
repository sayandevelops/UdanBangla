
import React, { useState } from 'react';
import { X, Shield, Lock } from 'lucide-react';
import RazorpayPayment from './RazorpayPayment'; // Assuming RazorpayPayment is in the same directory

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, onPaymentSuccess }) => {
  const [paymentFailed, setPaymentFailed] = useState(false);

  if (!isOpen) return null;

  const handlePaymentFailure = () => {
    setPaymentFailed(true);
    // Maybe show an error message to the user.
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-slide-up">
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors z-10"
        >
          <X size={20} className="text-slate-600" />
        </button>

        <div className="p-8 text-center">
          <div className="mb-4 inline-flex items-center justify-center rounded-full bg-primary-100 p-4 text-primary-600">
            <Lock size={40} />
          </div>
          
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Unlock Mock Tests</h2>
          <p className="text-slate-500 mb-6">Get unlimited access to all mock tests with a one-time payment.</p>

          <div className="bg-slate-50 rounded-2xl p-6 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-slate-600 font-semibold">One-Time Payment</p>
                <p className="text-xs text-slate-400">Lifetime Access</p>
              </div>
              <p className="text-3xl font-bold text-slate-900">₹99</p>
            </div>
          </div>
          
          {paymentFailed && (
            <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-sm">
              Payment failed. Please try again.
            </div>
          )}

          <RazorpayPayment
            amount={99}
            onPaymentSuccess={onPaymentSuccess}
            onPaymentFailure={handlePaymentFailure}
          />

          <div className="mt-6 flex items-center justify-center text-xs text-slate-400">
            <Shield size={14} className="mr-2" />
            <span>Secure payment powered by Razorpay</span>
          </div>
        </div>
      </div>
    </div>
  );
};
