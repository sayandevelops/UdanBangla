
import React, { useState } from 'react';
import { X, Check, Crown, Zap, Shield, Loader2, Star } from 'lucide-react';
import { SubscriptionTier } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose }) => {
  const { upgradeSubscription, currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionTier>('PRO');

  if (!isOpen) return null;

  const handleSubscribe = async (tier: SubscriptionTier) => {
    setLoading(true);
    try {
      // Simulate Payment Gateway Interaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      await upgradeSubscription(tier);
      onClose();
    } catch (error) {
      console.error("Subscription failed", error);
    } finally {
      setLoading(false);
    }
  };

  const currentTier = currentUser?.subscriptionTier || 'FREE';

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-slide-up flex flex-col md:flex-row max-h-[90vh] md:max-h-none overflow-y-auto md:overflow-visible">
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors z-10"
        >
          <X size={20} className="text-slate-600" />
        </button>

        {/* Left Side - Value Prop */}
        <div className="w-full md:w-2/5 bg-slate-900 text-white p-8 flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-4">Invest in your <br/><span className="text-primary-400">Future</span></h2>
            <p className="text-slate-300 mb-8">Unlock the full potential of Udan Bangla with our premium plans tailored for serious aspirants.</p>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary-500/20 rounded-lg text-primary-400"><Crown size={20} /></div>
                <div>
                  <h4 className="font-bold">Unlimited Mock Tests</h4>
                  <p className="text-xs text-slate-400">Practice without limits on all subjects.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400"><Zap size={20} /></div>
                <div>
                  <h4 className="font-bold">AI Performance Analysis</h4>
                  <p className="text-xs text-slate-400">Get detailed insights on your weak areas.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400"><Shield size={20} /></div>
                <div>
                  <h4 className="font-bold">WBJEE Special Access</h4>
                  <p className="text-xs text-slate-400">Unlock engineering entrance specific content.</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Background decoration */}
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-primary-600 rounded-full blur-3xl opacity-20"></div>
          <div className="absolute top-10 -left-10 w-40 h-40 bg-purple-600 rounded-full blur-3xl opacity-20"></div>
        </div>

        {/* Right Side - Plans */}
        <div className="w-full md:w-3/5 p-8 bg-slate-50">
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-slate-900">Choose your plan</h3>
            <p className="text-sm text-slate-500">Cancel anytime. No hidden fees.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Pro Plan */}
            <div 
              onClick={() => setSelectedPlan('PRO')}
              className={`relative cursor-pointer rounded-2xl p-6 border-2 transition-all ${selectedPlan === 'PRO' ? 'border-primary-600 bg-white shadow-lg scale-[1.02]' : 'border-slate-200 bg-white hover:border-primary-300'}`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-bold text-slate-900 text-lg">Pro</h4>
                  <p className="text-xs text-slate-500">Monthly</p>
                </div>
                {selectedPlan === 'PRO' && <div className="text-primary-600"><CheckCircle size={24} /></div>}
              </div>
              <div className="mb-4">
                <span className="text-3xl font-bold text-slate-900">₹499</span>
                <span className="text-slate-500 text-sm">/mo</span>
              </div>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2 text-sm text-slate-600"><Check size={14} className="text-green-500"/> Unlimited Class 11 & 12 Mocks</li>
                <li className="flex items-center gap-2 text-sm text-slate-600"><Check size={14} className="text-green-500"/> Detailed Solutions</li>
                <li className="flex items-center gap-2 text-sm text-slate-400"><X size={14} /> WBJEE Advanced Packs</li>
              </ul>
              {currentTier === 'PRO' ? (
                <button disabled className="w-full py-2 bg-slate-100 text-slate-500 font-bold rounded-xl cursor-not-allowed">Current Plan</button>
              ) : (
                <button 
                  onClick={(e) => { e.stopPropagation(); handleSubscribe('PRO'); }}
                  disabled={loading}
                  className={`w-full py-2 font-bold rounded-xl transition-colors ${selectedPlan === 'PRO' ? 'bg-primary-600 text-white hover:bg-primary-700' : 'bg-slate-100 text-slate-900 hover:bg-slate-200'}`}
                >
                  {loading && selectedPlan === 'PRO' ? <Loader2 className="animate-spin mx-auto" /> : 'Select Pro'}
                </button>
              )}
            </div>

            {/* Elite Plan */}
            <div 
              onClick={() => setSelectedPlan('ELITE')}
              className={`relative cursor-pointer rounded-2xl p-6 border-2 transition-all ${selectedPlan === 'ELITE' ? 'border-amber-500 bg-white shadow-lg scale-[1.02]' : 'border-slate-200 bg-white hover:border-amber-300'}`}
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                <Star size={10} fill="currentColor" /> Best Value
              </div>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-bold text-slate-900 text-lg">Elite</h4>
                  <p className="text-xs text-slate-500">Yearly</p>
                </div>
                {selectedPlan === 'ELITE' && <div className="text-amber-500"><CheckCircle size={24} /></div>}
              </div>
              <div className="mb-4">
                <span className="text-3xl font-bold text-slate-900">₹999</span>
                <span className="text-slate-500 text-sm">/yr</span>
              </div>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2 text-sm text-slate-600"><Check size={14} className="text-green-500"/> All Pro Features</li>
                <li className="flex items-center gap-2 text-sm text-slate-600"><Check size={14} className="text-green-500"/> WBJEE Elite Mocks</li>
                <li className="flex items-center gap-2 text-sm text-slate-600"><Check size={14} className="text-green-500"/> Priority Support</li>
              </ul>
              {currentTier === 'ELITE' ? (
                <button disabled className="w-full py-2 bg-slate-100 text-slate-500 font-bold rounded-xl cursor-not-allowed">Current Plan</button>
              ) : (
                 <button 
                  onClick={(e) => { e.stopPropagation(); handleSubscribe('ELITE'); }}
                  disabled={loading}
                  className={`w-full py-2 font-bold rounded-xl transition-colors ${selectedPlan === 'ELITE' ? 'bg-amber-500 text-white hover:bg-amber-600' : 'bg-slate-100 text-slate-900 hover:bg-slate-200'}`}
                >
                  {loading && selectedPlan === 'ELITE' ? <Loader2 className="animate-spin mx-auto" /> : 'Select Elite'}
                </button>
              )}
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-xs text-slate-400">
              Secure payment processing. By subscribing you agree to our Terms of Service.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const CheckCircle = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
  </svg>
);
