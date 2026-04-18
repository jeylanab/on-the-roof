import { useCalculation } from '../context/CalculationContext';
import { fmt } from '../data/utils';
import { BtnPrimary, BtnOutline } from './UI';

function WOSection({ title, children }) {
  return (
    <div className="bg-[#161616] border border-green-900/20 rounded-md p-3 mb-2">
      <div className="font-['Rajdhani'] text-[13px] font-bold text-green-400 uppercase tracking-wider mb-2">{title}</div>
      {children}
    </div>
  );
}

function WORow({ label, value, isTotal = false }) {
  return (
    <div className={`flex justify-between py-1 border-b border-green-900/10 last:border-b-0 text-[12px] ${isTotal ? 'pt-2' : ''}`}>
      <span className={isTotal ? 'text-green-400 font-semibold' : 'text-gray-500'}>{label}</span>
      <span className={isTotal ? 'font-["Rajdhani"] text-[15px] font-bold text-green-400' : 'text-gray-200 font-medium'}>{value}</span>
    </div>
  );
}

export default function WorkOrderPage() {
  const {
    state,
    roofingTotal, sidingTotal, fasciaTotal, gutterTotal, grandTotal,
  } = useCalculation();

  const { project, roofing, siding, gutter, payment } = state;
  const deposit = parseFloat(payment.depositAmount) || 0;
  const tierLabels = { standard: 'Standard .40mm', designer: 'Designer .42mm', premium: 'Premium .44mm' };
  const payLabels = { card: 'Credit / Debit Card', ach: 'ACH / Bank Transfer', cash: 'Cash / Check' };

  const hasRoofing = roofingTotal.total > 0;
  const hasSiding = sidingTotal.total > 0;
  const hasFascia = fasciaTotal > 0;
  const hasGutter = gutterTotal > 0;

  const handleEmail = () => alert('Email integration: wire up Firebase Cloud Functions + SendGrid in production.');
  const handlePrint = () => window.print();

  return (
    <div>
      {/* Header Banner */}
      <div className="flex items-center justify-between px-5 py-3 bg-gradient-to-r from-green-400/15 to-green-400/5 border border-green-400 rounded-lg mb-3">
        <div>
          <div className="font-['Rajdhani'] text-[16px] font-bold text-gray-200 uppercase tracking-widest">Work Order</div>
          <div className="text-[11px] text-gray-500 mt-0.5">Auto-built from inputs — ready to send to production</div>
        </div>
        <div className="flex gap-2">
          <BtnOutline onClick={handlePrint}>Print / Save PDF</BtnOutline>
          <BtnPrimary onClick={handleEmail}>Email to Production</BtnPrimary>
        </div>
      </div>

      {/* Customer & Project */}
      <WOSection title="Customer & Project">
        <WORow label="Customer" value={project.customerName || '—'} />
        <WORow label="Address" value={project.propertyAddress || '—'} />
        <WORow label="Date" value={project.date || '—'} />
        <WORow label="Sales Rep" value={project.repName || '—'} />
        <WORow label="Phone" value={project.phone || '—'} />
        <WORow label="Email" value={project.email || '—'} />
        {project.notes && <WORow label="Notes" value={project.notes} />}
      </WOSection>

      {/* Roofing */}
      {hasRoofing && (
        <WOSection title="Roofing Scope">
          {roofing.brand && <WORow label="Shingle Brand" value={roofing.brand} />}
          {roofing.type && <WORow label="Product Type" value={roofing.type} />}
          {roofing.color && <WORow label="Color" value={roofing.color} />}
          {roofing.squares && <WORow label="Squares" value={`${roofing.squares} SQ`} />}
          <WORow label="Base Price" value={fmt(roofingTotal.base)} />
          {roofingTotal.addons > 0 && <WORow label="Add-Ons" value={fmt(roofingTotal.addons)} />}

          {/* Active auto addons */}
          {Object.entries(roofing.autoAddons)
            .filter(([, a]) => a.enabled)
            .map(([key, a]) => {
              const labels = { twoStory: 'Two Story', pitch712: '7/12–9/12 Pitch', pitch1012: '10/12–12/12 Pitch', extraLayer: 'Extra Layer Tear-Off' };
              const sq = parseFloat(roofing.squares) || 0;
              return <WORow key={key} label={`  + ${labels[key]}`} value={fmt(sq * (parseFloat(a.rate) || 0))} />;
            })}

          {/* Active line items */}
          {roofing.lineItems
            .filter((item) => parseFloat(item.qty) > 0)
            .map((item) => (
              <WORow key={item.id} label={`  + ${item.label} (${item.qty} ${item.unit})`} value={fmt(item.rate * item.qty)} />
            ))}
          <WORow label="Roofing Total" value={fmt(roofingTotal.total)} isTotal />
        </WOSection>
      )}

      {/* Siding + Soffit */}
      {hasSiding && (
        <WOSection title="Siding + Soffit Scope">
          {siding.brand && <WORow label="Brand" value={siding.brand} />}
          {siding.size && <WORow label="Size / Profile" value={siding.size} />}
          {siding.color && <WORow label="Color" value={siding.color} />}
          <WORow label="Tier" value={tierLabels[siding.selectedTier]} />
          {siding.squares && <WORow label="Squares" value={`${siding.squares} SQ`} />}
          {parseFloat(siding.tearOffSQ) > 0 && (
            <WORow label="Tear-Off" value={`${siding.tearOffSQ} SQ @ ${fmt(siding.tearOffRate)}`} />
          )}
          {[...state.siding.lineItems, ...state.soffit.lineItems]
            .filter((item) => parseFloat(item.qty) > 0)
            .map((item) => (
              <WORow key={item.id} label={`  + ${item.label} (${item.qty} ${item.unit})`} value={fmt(item.rate * item.qty)} />
            ))}
          <WORow label="Siding + Soffit Total" value={fmt(sidingTotal.total)} isTotal />
        </WOSection>
      )}

      {/* Fascia + Gutter */}
      {(hasFascia || hasGutter) && (
        <WOSection title="Fascia + Gutter Scope">
          {gutter.type && <WORow label="Gutter Type" value={gutter.type} />}
          {gutter.color && <WORow label="Gutter Color" value={gutter.color} />}
          {state.fascia.lineItems
            .filter((item) => parseFloat(item.qty) > 0)
            .map((item) => (
              <WORow key={item.id} label={`  ${item.label} (${item.qty} ${item.unit})`} value={fmt(item.rate * item.qty)} />
            ))}
          {hasFascia && <WORow label="Fascia Total" value={fmt(fasciaTotal)} />}
          {state.gutter.lineItems
            .filter((item) => parseFloat(item.qty) > 0)
            .map((item) => (
              <WORow key={item.id} label={`  ${item.label} (${item.qty} ${item.unit})`} value={fmt(item.rate * item.qty)} />
            ))}
          {hasGutter && <WORow label="Gutter Total" value={fmt(gutterTotal)} isTotal />}
        </WOSection>
      )}

      {/* Payment Summary */}
      <WOSection title="Payment Summary">
        <WORow label="Payment Method" value={payLabels[payment.method] || '—'} />
        <WORow label="Deposit" value={fmt(deposit)} />
        <WORow label="Remaining Balance" value={fmt(Math.max(0, grandTotal - deposit))} />
        <WORow label="Grand Total" value={fmt(grandTotal)} isTotal />
      </WOSection>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="bg-[#161616] border border-green-900/20 rounded-md p-3">
          <div className="text-[11px] text-gray-500 uppercase tracking-wider mb-1">Customer Signature</div>
          <div className="border-b border-dashed border-green-900/30 mt-6 mb-1" />
          <div className="text-[10px] text-gray-600">Signature / Date</div>
        </div>
        <div className="bg-[#161616] border border-green-900/20 rounded-md p-3">
          <div className="text-[11px] text-gray-500 uppercase tracking-wider mb-1">OTRC Representative</div>
          <div className="border-b border-dashed border-green-900/30 mt-6 mb-1" />
          <div className="text-[10px] text-gray-600">Rep Signature / Date</div>
        </div>
      </div>
    </div>
  );
}