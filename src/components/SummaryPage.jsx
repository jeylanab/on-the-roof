import { useCalculation } from '../context/CalculationContext';
import { fmt } from '../data/utils';
import { Card, CardTitle, SectionSub, Field, Input, BtnPrimary, BtnOutline } from './UI';
import { saveBid } from '../firebase/service';
import { useState } from 'react';

const PAY_METHODS = [
  { id: 'card', label: 'Credit / Debit Card' },
  { id: 'ach',  label: 'ACH / Bank Transfer' },
  { id: 'cash', label: 'Cash / Check' },
];

const PAY_LABELS = { card: 'Credit / Debit Card', ach: 'ACH / Bank Transfer', cash: 'Cash / Check' };

export default function SummaryPage({ onGoToWorkOrder }) {
  const {
    state, updatePayment,
    roofingTotal, sidingTotal, fasciaTotal, gutterTotal, grandTotal,
  } = useCalculation();
  const { payment, project } = state;

  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState(null);

  const deposit = parseFloat(payment.depositAmount) || 0;
  const remaining = Math.max(0, grandTotal - deposit);

  const handleSave = async () => {
    setSaving(true);
    try {
      const id = await saveBid({
        project: state.project,
        roofing: state.roofing,
        siding: state.siding,
        soffit: state.soffit,
        fascia: state.fascia,
        gutter: state.gutter,
        payment: state.payment,
        totals: {
          roofing: roofingTotal.total,
          siding: sidingTotal.total,
          fascia: fasciaTotal,
          gutter: gutterTotal,
          grand: grandTotal,
        },
      });
      setSavedId(id);
    } catch (err) {
      alert('Error saving bid: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {/* Grand Total Banner */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-green-400/15 to-green-400/5 border border-green-400 rounded-lg mb-3">
        <div>
          <div className="font-['Rajdhani'] text-[14px] font-bold text-gray-200 uppercase tracking-widest">Grand Total</div>
          <div className="text-[11px] text-gray-500 mt-0.5">
            All trades combined <span className="bg-green-400/10 border border-green-900/30 text-green-400 text-[10px] px-2 py-0.5 rounded-full">SYNCED</span>
          </div>
        </div>
        <div className="font-['Rajdhani'] text-[34px] font-bold text-green-400">{fmt(grandTotal)}</div>
      </div>

      {/* Trade Breakdown */}
      <div className="grid grid-cols-4 gap-2.5 mb-3">
        {[
          { label: 'Roofing', value: roofingTotal.total },
          { label: 'Siding / Soffit', value: sidingTotal.total },
          { label: 'Fascia', value: fasciaTotal },
          { label: 'Gutters', value: gutterTotal },
        ].map(({ label, value }) => (
          <div key={label} className="bg-[#111] border border-green-900/20 rounded-lg p-3 text-center">
            <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">{label}</div>
            <div className="font-['Rajdhani'] text-[22px] font-bold text-green-400">{fmt(value)}</div>
          </div>
        ))}
      </div>

      {/* Payment */}
      <Card>
        <CardTitle>Payment & Deposit</CardTitle>
        <SectionSub>Payment Method</SectionSub>
        <div className="grid grid-cols-3 gap-2 mb-3">
          {PAY_METHODS.map(({ id, label }) => (
            <div
              key={id}
              onClick={() => updatePayment({ method: id })}
              className={`py-2 px-3 rounded-md border cursor-pointer text-center text-[12px] transition-all
                ${payment.method === id
                  ? 'bg-green-400/10 border-green-400 text-green-400'
                  : 'bg-[#161616] border-green-900/20 text-gray-500 hover:text-gray-300'
                }`}
            >
              {label}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          <Field label="Deposit Amount ($)">
            <Input
              type="number"
              value={payment.depositAmount}
              onChange={(e) => updatePayment({ depositAmount: e.target.value })}
              placeholder="0"
            />
          </Field>
          <Field label="Remaining Balance">
            <input readOnly value={fmt(remaining)} className="bg-[#0f0f0f] border border-green-900/20 rounded-md text-green-400 font-semibold px-3 py-1.5 text-[13px] outline-none w-full" />
          </Field>
          <Field label="Approval Date">
            <Input
              type="date"
              value={state.project.approvalDate}
              onChange={(e) => updatePayment({ approvalDate: e.target.value })}
            />
          </Field>
        </div>

        <div className="mt-3 p-2.5 bg-green-400/5 border border-green-900/20 rounded-md text-[11px] text-gray-500">
          <span className="text-green-400 font-semibold">Payment note: </span>
          Card/ACH processing via Stripe. Collect payment through Stripe terminal or hosted link.
          Selected method: <span className="text-gray-300">{PAY_LABELS[payment.method]}</span>
        </div>
      </Card>

      {savedId && (
        <div className="mb-3 p-2.5 bg-green-400/10 border border-green-400/30 rounded-md text-[12px] text-green-400">
          Bid saved to Firebase — ID: <span className="font-mono">{savedId}</span>
        </div>
      )}

      <div className="flex gap-2 mt-1">
        <BtnPrimary onClick={onGoToWorkOrder}>Generate Work Order →</BtnPrimary>
        <BtnOutline onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save to Firebase'}
        </BtnOutline>
        <BtnOutline onClick={() => alert('PDF export via jsPDF — wire up in production.')}>
          Export PDF
        </BtnOutline>
        <BtnOutline onClick={() => alert('Email via Firebase + SendGrid — wire up in production.')}>
          Email to Production
        </BtnOutline>
      </div>
    </div>
  );
}