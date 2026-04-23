import { useRef, useState } from 'react';
import emailjs from '@emailjs/browser';
import { useCalculation } from '../context/CalculationContext';
import { fmt } from '../data/utils';
import { BtnPrimary, BtnOutline } from './UI';

// ─── EMAILJS CONFIG — replace with your keys from emailjs.com ────────────────
const EMAILJS_SERVICE_ID  = 'service_a3l9m7j';
const EMAILJS_TEMPLATE_ID = 'template_057p884';
const EMAILJS_PUBLIC_KEY  = 'e5-6HebUrA6Nc4xRQ';
const PRODUCTION_EMAIL    = 'Info@ontheroofky.net';

// ─── APP UI COMPONENTS (dark theme, screen only) ─────────────────────────────

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

// ─── PDF DOCUMENT (white, print-ready, hidden on screen) ─────────────────────

function PDFDocument({ state, roofingTotal, sidingTotal, fasciaTotal, gutterTotal, grandTotal }) {
  const { project, roofing, siding, gutter, payment, fascia, soffit } = state;
  const deposit   = parseFloat(payment.depositAmount) || 0;
  const remaining = Math.max(0, grandTotal - deposit);
  const tierLabels = { standard: 'Standard .40mm', designer: 'Designer .42mm', premium: 'Premium .44mm' };
  const payLabels  = { card: 'Credit / Debit Card', ach: 'ACH / Bank Transfer', cash: 'Cash / Check' };

  const hasRoofing = roofingTotal.total > 0;
  const hasSiding  = sidingTotal.total > 0;
  const hasFascia  = fasciaTotal > 0;
  const hasGutter  = gutterTotal > 0;

  // All inline styles — guarantees print fidelity regardless of Tailwind purging
  const s = {
    page:        { fontFamily: "'Inter', Arial, sans-serif", color: '#111', background: '#fff', padding: '36px 44px', fontSize: '12px', lineHeight: 1.5 },
    logo:        { fontFamily: "'Rajdhani', Arial, sans-serif", fontSize: '22px', fontWeight: 700, color: '#15803d', letterSpacing: '2px', textTransform: 'uppercase' },
    logoSub:     { fontSize: '10px', color: '#6b7280', letterSpacing: '1px', textTransform: 'uppercase', marginTop: '2px' },
    headerRight: { textAlign: 'right', fontSize: '11px', color: '#6b7280' },
    divider:     { borderTop: '2px solid #15803d', margin: '14px 0' },
    thinDiv:     { borderTop: '1px solid #e5e7eb', margin: '10px 0' },
    secHead:     { fontFamily: "'Rajdhani', Arial, sans-serif", fontSize: '12px', fontWeight: 700, color: '#15803d', textTransform: 'uppercase', letterSpacing: '1.5px', background: '#f0fdf4', padding: '5px 10px', borderLeft: '3px solid #15803d', marginBottom: '6px', marginTop: '14px' },
    row:         { display: 'flex', justifyContent: 'space-between', padding: '3px 2px', borderBottom: '1px solid #f3f4f6', fontSize: '11.5px' },
    rowLabel:    { color: '#6b7280' },
    rowValue:    { color: '#111', fontWeight: 500 },
    totalRow:    { display: 'flex', justifyContent: 'space-between', padding: '6px 2px', borderTop: '2px solid #15803d', marginTop: '4px', fontSize: '13px', fontWeight: 700, color: '#15803d' },
    grandBox:    { background: '#f0fdf4', border: '2px solid #15803d', borderRadius: '6px', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '14px 0' },
    grandLabel:  { fontFamily: "'Rajdhani', Arial, sans-serif", fontSize: '14px', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '2px' },
    grandValue:  { fontFamily: "'Rajdhani', Arial, sans-serif", fontSize: '30px', fontWeight: 700, color: '#15803d' },
    sigBox:      { border: '1px solid #d1d5db', borderRadius: '4px', padding: '12px', flex: 1 },
    sigLabel:    { fontSize: '10px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '28px' },
    sigLine:     { borderBottom: '1px dashed #d1d5db', marginBottom: '4px' },
    sigSub:      { fontSize: '9px', color: '#d1d5db' },
    footer:      { marginTop: '28px', paddingTop: '10px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#9ca3af' },
  };

  const Row = ({ label, value }) => (
    <div style={s.row}>
      <span style={s.rowLabel}>{label}</span>
      <span style={s.rowValue}>{value}</span>
    </div>
  );

  const TotalRow = ({ label, value }) => (
    <div style={s.totalRow}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );

  return (
    <div style={s.page}>

      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={s.logo}>ON THE ROOF CONTRACTING</div>
          <div style={s.logoSub}>Serving Central Kentucky · Licensed &amp; Insured</div>
        </div>
        <div style={s.headerRight}>
          <div style={{ fontWeight: 700, color: '#111', fontSize: '15px', marginBottom: '4px', letterSpacing: '1px' }}>WORK ORDER</div>
          <div>Date: {project.date || new Date().toLocaleDateString()}</div>
          <div>Rep: {project.repName || '—'}</div>
          <div style={{ marginTop: '6px', color: '#15803d', fontWeight: 600 }}>(859) 699-8721</div>
          <div style={{ color: '#15803d' }}>info@ontheroofky.com</div>
          <div style={{ marginTop: '2px' }}>Mon–Fri 9:00AM – 6:30PM</div>
        </div>
      </div>

      <div style={s.divider} />

      {/* CUSTOMER + PAYMENT */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div>
          <div style={{ fontSize: '10px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '6px' }}>Bill To</div>
          <div style={{ fontWeight: 700, fontSize: '14px' }}>{project.customerName || '—'}</div>
          <div style={{ color: '#6b7280', marginTop: '2px' }}>{project.propertyAddress || '—'}</div>
          {project.phone && <div style={{ color: '#6b7280' }}>{project.phone}</div>}
          {project.email && <div style={{ color: '#6b7280' }}>{project.email}</div>}
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '10px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '6px' }}>Payment</div>
          <div><span style={{ color: '#6b7280' }}>Method: </span>{payLabels[payment.method] || '—'}</div>
          <div><span style={{ color: '#6b7280' }}>Deposit Collected: </span><strong>{fmt(deposit)}</strong></div>
          <div style={{ marginTop: '4px' }}><span style={{ color: '#6b7280' }}>Balance Due: </span><strong style={{ color: '#15803d', fontSize: '14px' }}>{fmt(remaining)}</strong></div>
        </div>
      </div>

      {project.notes && (
        <div style={{ marginTop: '10px', padding: '6px 10px', background: '#fefce8', border: '1px solid #fde68a', borderRadius: '4px', fontSize: '11px' }}>
          <strong>Notes: </strong>{project.notes}
        </div>
      )}

      {/* GRAND TOTAL */}
      <div style={s.grandBox}>
        <div>
          <div style={s.grandLabel}>Grand Total</div>
          <div style={{ fontSize: '11px', color: '#6b7280' }}>All trades combined</div>
        </div>
        <div style={s.grandValue}>{fmt(grandTotal)}</div>
      </div>

      {/* ROOFING */}
      {hasRoofing && (
        <>
          <div style={s.secHead}>Roofing Scope</div>
          {roofing.brand   && <Row label="Shingle Brand" value={roofing.brand} />}
          {roofing.type    && <Row label="Product Type"  value={roofing.type} />}
          {roofing.color   && <Row label="Color"         value={roofing.color} />}
          {roofing.squares && <Row label="Roof Squares"  value={`${roofing.squares} SQ`} />}
          <Row label="Base Price (Standard System)" value={fmt(roofingTotal.base)} />
          {Object.entries(roofing.autoAddons)
            .filter(([, a]) => a.enabled)
            .map(([key, a]) => {
              const labels = { twoStory: 'Two Story Surcharge', pitch712: '7/12–9/12 Pitch', pitch1012: '10/12–12/12 Pitch', extraLayer: 'Extra Layer Tear-Off' };
              const sq  = parseFloat(roofing.squares) || 0;
              const qty = a.qtyOverride !== '' && a.qtyOverride !== undefined ? parseFloat(a.qtyOverride) || 0 : sq;
              return <Row key={key} label={labels[key]} value={fmt(qty * (parseFloat(a.rate) || 0))} />;
            })}
          {roofing.lineItems
            .filter(i => parseFloat(i.qty) > 0)
            .map(item => (
              <Row key={item.id}
                label={`${item.label} — ${item.qty} ${item.unit}${item.color ? ` (${item.color})` : ''}`}
                value={fmt(item.rate * item.qty)}
              />
            ))}
          <TotalRow label="Roofing Total" value={fmt(roofingTotal.total)} />
        </>
      )}

      {/* SIDING + SOFFIT */}
      {hasSiding && (
        <>
          <div style={s.secHead}>Siding + Soffit Scope</div>
          {siding.brand  && <Row label="Brand"        value={siding.brand} />}
          {siding.size   && <Row label="Size/Profile" value={siding.size} />}
          {siding.color  && <Row label="Color"        value={siding.color} />}
          <Row label="Tier" value={tierLabels[siding.selectedTier]} />
          {siding.squares && <Row label="Siding Squares" value={`${siding.squares} SQ`} />}
          {parseFloat(siding.tearOffSQ) > 0 && (
            <Row label="Tear-Off" value={`${siding.tearOffSQ} SQ @ ${fmt(siding.tearOffRate)}/SQ`} />
          )}
          {[...siding.lineItems, ...soffit.lineItems]
            .filter(i => parseFloat(i.qty) > 0)
            .map(item => (
              <Row key={item.id}
                label={`${item.label} — ${item.qty} ${item.unit}${item.color ? ` (${item.color})` : ''}`}
                value={fmt(item.rate * item.qty)}
              />
            ))}
          <TotalRow label="Siding + Soffit Total" value={fmt(sidingTotal.total)} />
        </>
      )}

      {/* FASCIA + GUTTER */}
      {(hasFascia || hasGutter) && (
        <>
          <div style={s.secHead}>Fascia + Gutter Scope</div>
          {gutter.type  && <Row label="Gutter Type"  value={gutter.type} />}
          {gutter.color && <Row label="Gutter Color" value={gutter.color} />}
          {fascia.lineItems
            .filter(i => parseFloat(i.qty) > 0)
            .map(item => (
              <Row key={item.id}
                label={`${item.label} — ${item.qty} ${item.unit}${item.color ? ` (${item.color})` : ''}`}
                value={fmt(item.rate * item.qty)}
              />
            ))}
          {hasFascia && <Row label="Fascia Subtotal" value={fmt(fasciaTotal)} />}
          {gutter.lineItems
            .filter(i => parseFloat(i.qty) > 0)
            .map(item => (
              <Row key={item.id}
                label={`${item.label} — ${item.qty} ${item.unit}${item.color ? ` (${item.color})` : ''}`}
                value={fmt(item.rate * item.qty)}
              />
            ))}
          <TotalRow label="Fascia + Gutter Total" value={fmt(fasciaTotal + gutterTotal)} />
        </>
      )}

      <div style={s.thinDiv} />

      {/* PAYMENT SUMMARY */}
      <div style={s.secHead}>Payment Summary</div>
      <Row label="Payment Method"    value={payLabels[payment.method] || '—'} />
      <Row label="Deposit Received"  value={fmt(deposit)} />
      <Row label="Remaining Balance" value={fmt(remaining)} />
      <TotalRow label="GRAND TOTAL"  value={fmt(grandTotal)} />

      {/* SIGNATURES */}
      <div style={{ display: 'flex', gap: '16px', marginTop: '28px' }}>
        <div style={s.sigBox}>
          <div style={s.sigLabel}>Customer Signature</div>
          <div style={s.sigLine} />
          <div style={s.sigSub}>Signature &amp; Date</div>
        </div>
        <div style={s.sigBox}>
          <div style={s.sigLabel}>OTRC Representative</div>
          <div style={s.sigLine} />
          <div style={s.sigSub}>Signature &amp; Date</div>
        </div>
      </div>

      {/* FOOTER */}
      <div style={s.footer}>
        <div>On The Roof Contracting · (859) 699-8721 · info@ontheroofky.com</div>
        <div>Mon–Fri 9:00 AM – 6:30 PM · Serving Central Kentucky</div>
      </div>

    </div>
  );
}

// ─── MAIN WORK ORDER PAGE ─────────────────────────────────────────────────────

export default function WorkOrderPage() {
  const { state, roofingTotal, sidingTotal, fasciaTotal, gutterTotal, grandTotal } = useCalculation();
  const { project, roofing, siding, gutter, payment } = state;
  const deposit    = parseFloat(payment.depositAmount) || 0;
  const tierLabels = { standard: 'Standard .40mm', designer: 'Designer .42mm', premium: 'Premium .44mm' };
  const payLabels  = { card: 'Credit / Debit Card', ach: 'ACH / Bank Transfer', cash: 'Cash / Check' };

  const hasRoofing = roofingTotal.total > 0;
  const hasSiding  = sidingTotal.total > 0;
  const hasFascia  = fasciaTotal > 0;
  const hasGutter  = gutterTotal > 0;

  const [emailing, setEmailing]   = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailErr, setEmailErr]   = useState('');

  const buildEmailBody = () => {
    const lines = [
      'WORK ORDER — ON THE ROOF CONTRACTING',
      '======================================',
      `Customer:  ${project.customerName || '—'}`,
      `Address:   ${project.propertyAddress || '—'}`,
      `Date:      ${project.date || '—'}`,
      `Rep:       ${project.repName || '—'}`,
      `Phone:     ${project.phone || '—'}`,
      '',
    ];
    if (hasRoofing) {
      lines.push('ROOFING SCOPE', '─────────────');
      if (roofing.brand)   lines.push(`Brand:   ${roofing.brand}`);
      if (roofing.type)    lines.push(`Type:    ${roofing.type}`);
      if (roofing.color)   lines.push(`Color:   ${roofing.color}`);
      if (roofing.squares) lines.push(`Squares: ${roofing.squares} SQ`);
      lines.push(`Base: ${fmt(roofingTotal.base)}`);
      roofing.lineItems.filter(i => parseFloat(i.qty) > 0).forEach(item => {
        lines.push(`  + ${item.label} (${item.qty} ${item.unit})${item.color ? ` — ${item.color}` : ''}: ${fmt(item.rate * item.qty)}`);
      });
      lines.push(`ROOFING TOTAL: ${fmt(roofingTotal.total)}`, '');
    }
    if (hasSiding) {
      lines.push('SIDING + SOFFIT SCOPE', '─────────────────────');
      if (siding.brand)  lines.push(`Brand: ${siding.brand}`);
      if (siding.size)   lines.push(`Size:  ${siding.size}`);
      if (siding.color)  lines.push(`Color: ${siding.color}`);
      lines.push(`Tier: ${tierLabels[siding.selectedTier]}`);
      if (siding.squares) lines.push(`Squares: ${siding.squares} SQ`);
      [...state.siding.lineItems, ...state.soffit.lineItems]
        .filter(i => parseFloat(i.qty) > 0)
        .forEach(item => {
          lines.push(`  + ${item.label} (${item.qty} ${item.unit})${item.color ? ` — ${item.color}` : ''}: ${fmt(item.rate * item.qty)}`);
        });
      lines.push(`SIDING + SOFFIT TOTAL: ${fmt(sidingTotal.total)}`, '');
    }
    if (hasFascia || hasGutter) {
      lines.push('FASCIA + GUTTER SCOPE', '─────────────────────');
      if (gutter.type)  lines.push(`Gutter Type:  ${gutter.type}`);
      if (gutter.color) lines.push(`Gutter Color: ${gutter.color}`);
      state.fascia.lineItems.filter(i => parseFloat(i.qty) > 0).forEach(item => {
        lines.push(`  ${item.label} (${item.qty} ${item.unit})${item.color ? ` — ${item.color}` : ''}: ${fmt(item.rate * item.qty)}`);
      });
      state.gutter.lineItems.filter(i => parseFloat(i.qty) > 0).forEach(item => {
        lines.push(`  ${item.label} (${item.qty} ${item.unit})${item.color ? ` — ${item.color}` : ''}: ${fmt(item.rate * item.qty)}`);
      });
      lines.push(`FASCIA + GUTTER TOTAL: ${fmt(fasciaTotal + gutterTotal)}`, '');
    }
    lines.push(
      'PAYMENT SUMMARY', '───────────────',
      `Method:    ${payLabels[payment.method] || '—'}`,
      `Deposit:   ${fmt(deposit)}`,
      `Balance:   ${fmt(Math.max(0, grandTotal - deposit))}`,
      `GRAND TOTAL: ${fmt(grandTotal)}`,
    );
    return lines.join('\n');
  };

  const handleEmail = async () => {
    setEmailing(true);
    setEmailErr('');
    setEmailSent(false);
    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          to_email:      PRODUCTION_EMAIL,
          customer_name: project.customerName || 'Unknown Customer',
          address:       project.propertyAddress || '—',
          rep_name:      project.repName || '—',
          grand_total:   fmt(grandTotal),
          work_order:    buildEmailBody(),
          reply_to:      project.email || PRODUCTION_EMAIL,
        },
        EMAILJS_PUBLIC_KEY,
      );
      setEmailSent(true);
    } catch (err) {
      setEmailErr('Email failed: ' + (err?.text || err?.message || 'Unknown error. Check EmailJS keys.'));
    } finally {
      setEmailing(false);
    }
  };

  return (
    <div>

      {/* ── HIDDEN PDF — shows only when printing ── */}
      <div className="print-only">
        <PDFDocument
          state={state}
          roofingTotal={roofingTotal}
          sidingTotal={sidingTotal}
          fasciaTotal={fasciaTotal}
          gutterTotal={gutterTotal}
          grandTotal={grandTotal}
        />
      </div>

      {/* ── SCREEN UI — hidden when printing ── */}
      <div className="no-print">

        {/* Action bar */}
        <div className="flex items-center justify-between px-5 py-3 bg-gradient-to-r from-green-400/15 to-green-400/5 border border-green-400 rounded-lg mb-3">
          <div>
            <div className="font-['Rajdhani'] text-[16px] font-bold text-gray-200 uppercase tracking-widest">Work Order</div>
            <div className="text-[11px] text-gray-500 mt-0.5">Auto-built · ready to print or email to production</div>
          </div>
          <div className="flex gap-2">
            <BtnOutline onClick={() => window.print()}>Print / Save PDF</BtnOutline>
            <BtnPrimary onClick={handleEmail} disabled={emailing}>
              {emailing ? 'Sending...' : 'Email to Production'}
            </BtnPrimary>
          </div>
        </div>

        {emailSent && (
          <div className="mb-3 p-2.5 bg-green-400/10 border border-green-400/30 rounded-md text-[12px] text-green-400">
            ✓ Work order emailed to production at {PRODUCTION_EMAIL}
          </div>
        )}
        {emailErr && (
          <div className="mb-3 p-2.5 bg-red-900/20 border border-red-700/30 rounded-md text-[12px] text-red-400">
            {emailErr}
          </div>
        )}

        {/* Customer */}
        <WOSection title="Customer & Project">
          <WORow label="Customer" value={project.customerName || '—'} />
          <WORow label="Address"  value={project.propertyAddress || '—'} />
          <WORow label="Date"     value={project.date || '—'} />
          <WORow label="Rep"      value={project.repName || '—'} />
          <WORow label="Phone"    value={project.phone || '—'} />
          <WORow label="Email"    value={project.email || '—'} />
          {project.notes && <WORow label="Notes" value={project.notes} />}
        </WOSection>

        {hasRoofing && (
          <WOSection title="Roofing Scope">
            {roofing.brand   && <WORow label="Brand"   value={roofing.brand} />}
            {roofing.type    && <WORow label="Type"    value={roofing.type} />}
            {roofing.color   && <WORow label="Color"   value={roofing.color} />}
            {roofing.squares && <WORow label="Squares" value={`${roofing.squares} SQ`} />}
            <WORow label="Base Price" value={fmt(roofingTotal.base)} />
            {Object.entries(roofing.autoAddons).filter(([, a]) => a.enabled).map(([key, a]) => {
              const labels = { twoStory: 'Two Story', pitch712: '7/12–9/12 Pitch', pitch1012: '10/12–12/12 Pitch', extraLayer: 'Extra Layer Tear-Off' };
              const sq  = parseFloat(roofing.squares) || 0;
              const qty = a.qtyOverride !== '' && a.qtyOverride !== undefined ? parseFloat(a.qtyOverride) || 0 : sq;
              return <WORow key={key} label={`+ ${labels[key]}`} value={fmt(qty * (parseFloat(a.rate) || 0))} />;
            })}
            {roofing.lineItems.filter(i => parseFloat(i.qty) > 0).map(item => (
              <WORow key={item.id}
                label={`+ ${item.label} (${item.qty} ${item.unit})${item.color ? ` — ${item.color}` : ''}`}
                value={fmt(item.rate * item.qty)}
              />
            ))}
            <WORow label="Roofing Total" value={fmt(roofingTotal.total)} isTotal />
          </WOSection>
        )}

        {hasSiding && (
          <WOSection title="Siding + Soffit Scope">
            {siding.brand  && <WORow label="Brand"  value={siding.brand} />}
            {siding.size   && <WORow label="Size"   value={siding.size} />}
            {siding.color  && <WORow label="Color"  value={siding.color} />}
            <WORow label="Tier"    value={tierLabels[siding.selectedTier]} />
            {siding.squares && <WORow label="Squares" value={`${siding.squares} SQ`} />}
            {parseFloat(siding.tearOffSQ) > 0 && (
              <WORow label="Tear-Off" value={`${siding.tearOffSQ} SQ @ ${fmt(siding.tearOffRate)}/SQ`} />
            )}
            {[...state.siding.lineItems, ...state.soffit.lineItems]
              .filter(i => parseFloat(i.qty) > 0)
              .map(item => (
                <WORow key={item.id}
                  label={`+ ${item.label} (${item.qty} ${item.unit})${item.color ? ` — ${item.color}` : ''}`}
                  value={fmt(item.rate * item.qty)}
                />
              ))}
            <WORow label="Siding + Soffit Total" value={fmt(sidingTotal.total)} isTotal />
          </WOSection>
        )}

        {(hasFascia || hasGutter) && (
          <WOSection title="Fascia + Gutter Scope">
            {gutter.type  && <WORow label="Gutter Type"  value={gutter.type} />}
            {gutter.color && <WORow label="Gutter Color" value={gutter.color} />}
            {state.fascia.lineItems.filter(i => parseFloat(i.qty) > 0).map(item => (
              <WORow key={item.id}
                label={`${item.label} (${item.qty} ${item.unit})${item.color ? ` — ${item.color}` : ''}`}
                value={fmt(item.rate * item.qty)}
              />
            ))}
            {hasFascia && <WORow label="Fascia Subtotal" value={fmt(fasciaTotal)} />}
            {state.gutter.lineItems.filter(i => parseFloat(i.qty) > 0).map(item => (
              <WORow key={item.id}
                label={`${item.label} (${item.qty} ${item.unit})${item.color ? ` — ${item.color}` : ''}`}
                value={fmt(item.rate * item.qty)}
              />
            ))}
            {hasGutter && <WORow label="Gutter Total" value={fmt(gutterTotal)} isTotal />}
          </WOSection>
        )}

        <WOSection title="Payment Summary">
          <WORow label="Method"            value={payLabels[payment.method] || '—'} />
          <WORow label="Deposit"           value={fmt(deposit)} />
          <WORow label="Remaining Balance" value={fmt(Math.max(0, grandTotal - deposit))} />
          <WORow label="Grand Total"       value={fmt(grandTotal)} isTotal />
        </WOSection>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="bg-[#161616] border border-green-900/20 rounded-md p-3">
            <div className="text-[11px] text-gray-500 uppercase tracking-wider mb-1">Customer Signature</div>
            <div className="border-b border-dashed border-green-900/30 mt-8 mb-1" />
            <div className="text-[10px] text-gray-600">Signature / Date</div>
          </div>
          <div className="bg-[#161616] border border-green-900/20 rounded-md p-3">
            <div className="text-[11px] text-gray-500 uppercase tracking-wider mb-1">OTRC Representative</div>
            <div className="border-b border-dashed border-green-900/30 mt-8 mb-1" />
            <div className="text-[10px] text-gray-600">Signature / Date</div>
          </div>
        </div>

      </div>
    </div>
  );
}
