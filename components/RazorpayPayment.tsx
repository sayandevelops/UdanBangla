
import React, { useState, useEffect } from 'react';
import { createRazorpayOrder, verifyPayment } from '../services/razorpayService';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface RazorpayPaymentProps {
  amount: number;
  onPaymentSuccess: () => void;
  onPaymentFailure: () => void;
}

const RazorpayPayment: React.FC<RazorpayPaymentProps> = ({ amount, onPaymentSuccess, onPaymentFailure }) => {
  const { currentUser, upgradeSubscription } = useAuth();
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);

    // Simulate a successful payment since we don't have a backend to create a real order.
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate network delay

    const dummyResponse = {
      razorpay_payment_id: 'sim_payment_id',
      razorpay_order_id: 'sim_order_id',
      razorpay_signature: 'sim_signature',
    };

    // Directly call the success path
    const isValid = await verifyPayment(dummyResponse.razorpay_payment_id, dummyResponse.razorpay_order_id, dummyResponse.razorpay_signature);
    if (isValid) {
      await upgradeSubscription('MOCK_TEST');
      onPaymentSuccess();
    } else {
      onPaymentFailure();
    }
    
    setLoading(false);
  };

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className="w-full py-3 px-6 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition-colors disabled:bg-slate-400"
    >
      {loading ? <Loader2 className="animate-spin mx-auto" /> : `Pay ₹${amount}`}
    </button>
  );
};

export default RazorpayPayment;
