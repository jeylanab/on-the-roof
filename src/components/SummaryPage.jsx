import { useCalculation } from '../context/CalculationContext';
import { fmt } from '../data/utils';
import { Card, CardTitle, SectionSub, Field, Input, BtnPrimary, BtnOutline } from './UI';
import { saveBid } from '../firebase/service';
import { useState } from 'react';

// ─── STRIPE CONFIG ───────────────────────────────────────────────────────────
// 1. Go to dashboard.stripe.com → Payment Links → Create Link
// 2. Set price to $1 (you'll override the amount via URL param)
// 3. Paste your payment link base URL below
const STRIPE_PAYMENT_LINK = 'https://buy.stripe.com/14A00jeIm8r76Puf9zebu00';

const PAY_METHODS = [
  {
    id: 'card',
    label: 'Credit / Debit Card',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
      </svg>
    ),
    desc: 'Visa, Mastercard, Amex',
  },
  {
    id: 'ach',
    label: 'ACH / Bank Transfer',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 9 12 2 21 9"/><path d="M9 22V12h6v10M3 22h18"/>
      </svg>
    ),
    desc: 'Direct bank transfer',
  },
  {
    id: 'cash',
    label: 'Cash / Check',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 1 0 0 7h5a3.5 3.5 0 1 0 0 7H6"/>
      </svg>
    ),
    desc: 'Collect on site',
  },
];

// ─── STRIPE PAYMENT MODAL ─────────────────────────────────────────────────────

function StripeModal({ amount, customerName, onClose }) {
  const [collecting, setCollecting] = useState('deposit');
  const depositSuggestion = Math.round(amount * 0.5);

  const openStripe = (chargeAmount) => {
    // Opens Stripe payment link in new tab
    // Stripe Payment Links support ?prefilled_amount= in cents
    const cents = Math.round(chargeAmount * 100);
    const name  = encodeURIComponent(customerName || 'Customer');
    const url   = `${STRIPE_PAYMENT_LINK}?prefilled_amount=${cents}&prefilled_email=&client_reference_id=${name}`;
    window.open(url, '_blank');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-[#111] border border-green-900/30 rounded-2xl p-7 w-[400px] shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <div className="font-['Rajdhani'] text-[18px] font-bold text-green-400 uppercase tracking-widest">Collect Payment</div>
            <div className="text-[11px] text-gray-500 mt-0.5">Powered by Stripe — secure &amp; instant</div>
          </div>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-400 transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Total display */}
        <div className="bg-green-400/5 border border-green-900/20 rounded-xl px-5 py-4 mb-5 text-center">
          <div className="text-[11px] text-gray-500 uppercase tracking-wider mb-1">Project Total</div>
          <div className="font-['Rajdhani'] text-[36px] font-bold text-green-400">{fmt(amount)}</div>
          {customerName && <div className="text-[12px] text-gray-400 mt-1">{customerName}</div>}
        </div>

        {/* What to collect */}
        <div className="text-[11px] text-gray-500 uppercase tracking-wider mb-2">Charge Amount</div>
        <div className="grid grid-cols-2 gap-2 mb-4">
          {[
            { id: 'deposit', label: '50% Deposit', amount: depositSuggestion },
            { id: 'full',    label: 'Full Payment', amount: amount },
          ].map((opt) => (
            <div
              key={opt.id}
              onClick={() => setCollecting(opt.id)}
              className={`p-3 rounded-lg border cursor-pointer text-center transition-all
                ${collecting === opt.id
                  ? 'bg-green-400/10 border-green-400'
                  : 'bg-[#161616] border-green-900/20 hover:border-green-900/40'
                }`}
            >
              <div className={`text-[11px] font-semibold uppercase tracking-wider ${collecting === opt.id ? 'text-green-400' : 'text-gray-400'}`}>
                {opt.label}
              </div>
              <div className={`font-['Rajdhani'] text-[18px] font-bold mt-0.5 ${collecting === opt.id ? 'text-green-400' : 'text-gray-300'}`}>
                {fmt(opt.amount)}
              </div>
            </div>
          ))}
        </div>

        {/* Payment method chips */}
        <div className="text-[11px] text-gray-500 uppercase tracking-wider mb-2">Accepts</div>
        <div className="flex gap-2 mb-5">
          {['Visa', 'Mastercard', 'Amex', 'ACH'].map((brand) => (
            <span key={brand} className="px-2.5 py-1 bg-[#161616] border border-green-900/20 rounded text-[10px] text-gray-400 font-medium">
              {brand}
            </span>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={() => openStripe(collecting === 'deposit' ? depositSuggestion : amount)}
          className="w-full py-3.5 bg-green-400 text-black font-['Rajdhani'] text-[15px] font-bold uppercase tracking-widest rounded-xl hover:bg-green-300 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
          </svg>
          Open Stripe Checkout
        </button>

        <div className="mt-3 text-center text-[10px] text-gray-600">
          Opens secure Stripe page · Customer pays on tablet or their phone
        </div>
      </div>
    </div>
  );
}

// ─── SUMMARY PAGE ─────────────────────────────────────────────────────────────

export default function SummaryPage({ onGoToWorkOrder }) {
  const {
    state, updatePayment,
    roofingTotal, sidingTotal, fasciaTotal, gutterTotal, grandTotal,
  } = useCalculation();
  const { payment, project } = state;

  const [saving,      setSaving]      = useState(false);
  const [savedId,     setSavedId]     = useState(null);
  const [saveError,   setSaveError]   = useState('');
  const [showStripe,  setShowStripe]  = useState(false);

  const deposit   = parseFloat(payment.depositAmount) || 0;
  const remaining = Math.max(0, grandTotal - deposit);

  const handleSave = async () => {
    setSaving(true);
    setSaveError('');
    try {
      const id = await saveBid({
        project: state.project,
        roofing: state.roofing,
        siding:  state.siding,
        soffit:  state.soffit,
        fascia:  state.fascia,
        gutter:  state.gutter,
        payment: state.payment,
        totals: {
          roofing: roofingTotal.total,
          siding:  sidingTotal.total,
          fascia:  fasciaTotal,
          gutter:  gutterTotal,
          grand:   grandTotal,
        },
      });
      setSavedId(id);
    } catch (err) {
      setSaveError('Error saving: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {showStripe && (
        <StripeModal
          amount={grandTotal}
          customerName={project.customerName}
          onClose={() => setShowStripe(false)}
        />
      )}

      {/* Grand Total Banner */}
      <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-green-400/15 to-green-400/5 border border-green-400 rounded-xl mb-3">
        <div>
          <div className="font-['Rajdhani'] text-[14px] font-bold text-gray-200 uppercase tracking-widest">Grand Total</div>
          <div className="text-[11px] text-gray-500 mt-0.5">
            All trades combined{' '}
            <span className="bg-green-400/10 border border-green-900/30 text-green-400 text-[10px] px-2 py-0.5 rounded-full">SYNCED</span>
          </div>
        </div>
        <div className="font-['Rajdhani'] text-[36px] font-bold text-green-400">{fmt(grandTotal)}</div>
      </div>

      {/* Trade Breakdown */}
      <div className="grid grid-cols-4 gap-2.5 mb-3">
        {[
          { label: 'Roofing',        value: roofingTotal.total },
          { label: 'Siding / Soffit',value: sidingTotal.total },
          { label: 'Fascia',         value: fasciaTotal },
          { label: 'Gutters',        value: gutterTotal },
        ].map(({ label, value }) => (
          <div key={label} className="bg-[#111] border border-green-900/20 rounded-lg p-3 text-center">
            <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">{label}</div>
            <div className="font-['Rajdhani'] text-[22px] font-bold text-green-400">{fmt(value)}</div>
          </div>
        ))}
      </div>

      {/* Payment Method */}
      <Card>
        <CardTitle>Payment & Deposit</CardTitle>
        <SectionSub>Payment Method</SectionSub>
        <div className="grid grid-cols-3 gap-2 mb-4">
          {PAY_METHODS.map(({ id, label, icon, desc }) => (
            <div
              key={id}
              onClick={() => updatePayment({ method: id })}
              className={`p-3 rounded-lg border cursor-pointer transition-all
                ${payment.method === id
                  ? 'bg-green-400/10 border-green-400'
                  : 'bg-[#161616] border-green-900/20 hover:border-green-900/40'
                }`}
            >
              <div className={`mb-2 ${payment.method === id ? 'text-green-400' : 'text-gray-500'}`}>{icon}</div>
              <div className={`text-[12px] font-semibold ${payment.method === id ? 'text-green-400' : 'text-gray-300'}`}>{label}</div>
              <div className="text-[10px] text-gray-600 mt-0.5">{desc}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-2.5 mb-3">
          <Field label="Deposit Amount ($)">
            <Input
              type="number"
              value={payment.depositAmount}
              onChange={(e) => updatePayment({ depositAmount: e.target.value })}
              placeholder="0"
            />
          </Field>
          <Field label="Remaining Balance">
            <input
              readOnly
              value={fmt(remaining)}
              className="bg-[#0f0f0f] border border-green-900/20 rounded-md text-green-400 font-semibold px-3 py-1.5 text-[13px] outline-none w-full"
            />
          </Field>
          <Field label="Approval Date">
            <Input
              type="date"
              value={project.approvalDate || ''}
              onChange={(e) => updatePayment({ approvalDate: e.target.value })}
            />
          </Field>
        </div>

        {/* Collect Payment CTA — only shows for card/ach */}
        {payment.method !== 'cash' && grandTotal > 0 && (
          <button
            onClick={() => setShowStripe(true)}
            className="w-full py-3 bg-green-400 text-black font-['Rajdhani'] text-[14px] font-bold uppercase tracking-widest rounded-lg hover:bg-green-300 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
            </svg>
            Collect Payment via Stripe
          </button>
        )}

        {payment.method === 'cash' && (
          <div className="p-3 bg-[#161616] border border-green-900/20 rounded-lg text-[12px] text-gray-500 text-center">
            Cash / Check — collect on site and note deposit amount above
          </div>
        )}
      </Card>

      {/* Save feedback */}
      {savedId && (
        <div className="mb-3 p-2.5 bg-green-400/10 border border-green-400/30 rounded-md text-[12px] text-green-400">
          ✓ Bid saved to Firebase — ID: <span className="font-mono">{savedId}</span>
        </div>
      )}
      {saveError && (
        <div className="mb-3 p-2.5 bg-red-900/20 border border-red-700/30 rounded-md text-[12px] text-red-400">
          {saveError}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-2 mt-1">
        <BtnPrimary onClick={onGoToWorkOrder}>Generate Work Order →</BtnPrimary>
      </div>
    </div>
  );
}
