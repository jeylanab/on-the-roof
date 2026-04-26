import { useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import emailjs from '@emailjs/browser';
import { useCalculation } from '../context/CalculationContext';
import { fmt } from '../data/utils';
import { BtnPrimary, BtnOutline } from './UI';

// ─── EMAILJS CONFIG ───────────────────────────────────────────────────────────
const EMAILJS_SERVICE_ID  = 'service_a3l9m7j';
const EMAILJS_TEMPLATE_ID = 'template_057p884';
const EMAILJS_PUBLIC_KEY  = 'e5-6HebUrA6Nc4xRQ';
const PRODUCTION_EMAIL    = 'Info@ontheroofky.net';

// ─── SCREEN UI COMPONENTS ─────────────────────────────────────────────────────

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

// ─── SIGNATURE PAD COMPONENT ──────────────────────────────────────────────────

function SignaturePad({ label, sigRef, onClear, onSigned, signed }) {
  return (
    <div className="bg-[#161616] border border-green-900/20 rounded-lg p-3">
      {/* Label */}
      <div className="flex items-center justify-between mb-2">
        <div className="text-[11px] text-gray-500 uppercase tracking-wider font-medium">{label}</div>
        <button
          onClick={onClear}
          className="text-[10px] text-gray-600 hover:text-red-400 border border-green-900/20 hover:border-red-900/30 rounded px-2 py-0.5 transition-colors"
        >
          Clear
        </button>
      </div>

      {/* Canvas area */}
      <div
        className={`rounded-md border-2 transition-colors overflow-hidden ${
          signed ? 'border-green-400/40' : 'border-dashed border-green-900/30'
        }`}
        style={{ background: '#0f0f0f', touchAction: 'none' }}
      >
        <SignatureCanvas
          ref={sigRef}
          penColor="#39ff14"
          backgroundColor="transparent"
          onEnd={onSigned}
          canvasProps={{
            width: 380,
            height: 120,
            style: { width: '100%', height: '120px', display: 'block' },
          }}
        />
      </div>

      {/* Status */}
      <div className="mt-1.5 flex items-center gap-1.5">
        {signed ? (
          <>
            <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
            <span className="text-[10px] text-green-400">Signed</span>
          </>
        ) : (
          <>
            <div className="w-1.5 h-1.5 rounded-full bg-gray-600" />
            <span className="text-[10px] text-gray-600">Sign above with finger or stylus</span>
          </>
        )}
      </div>
    </div>
  );
}

// ─── PDF DOCUMENT (white, print-ready) ────────────────────────────────────────

function PDFDocument({ state, roofingTotal, sidingTotal, fasciaTotal, gutterTotal, grandTotal, customerSig, repSig }) {
  const { project, roofing, siding, gutter, payment, fascia, soffit } = state;
  const deposit    = parseFloat(payment.depositAmount) || 0;
  const remaining  = Math.max(0, grandTotal - deposit);
  const tierLabels = { standard: 'Standard .40mm', designer: 'Designer .42mm', premium: 'Premium .44mm' };
  const payLabels  = { card: 'Credit / Debit Card', ach: 'ACH / Bank Transfer', cash: 'Cash / Check' };

  const hasRoofing = roofingTotal.total > 0;
  const hasSiding  = sidingTotal.total > 0;
  const hasFascia  = fasciaTotal > 0;
  const hasGutter  = gutterTotal > 0;

  const s = {
    page:       { fontFamily: "'Inter', Arial, sans-serif", color: '#111', background: '#fff', padding: '36px 44px', fontSize: '12px', lineHeight: 1.5 },
    logo:       { fontFamily: "'Rajdhani', Arial, sans-serif", fontSize: '22px', fontWeight: 700, color: '#15803d', letterSpacing: '2px', textTransform: 'uppercase' },
    logoSub:    { fontSize: '10px', color: '#6b7280', letterSpacing: '1px', textTransform: 'uppercase', marginTop: '2px' },
    headerRight:{ textAlign: 'right', fontSize: '11px', color: '#6b7280' },
    divider:    { borderTop: '2px solid #15803d', margin: '14px 0' },
    thinDiv:    { borderTop: '1px solid #e5e7eb', margin: '10px 0' },
    secHead:    { fontFamily: "'Rajdhani', Arial, sans-serif", fontSize: '12px', fontWeight: 700, color: '#15803d', textTransform: 'uppercase', letterSpacing: '1.5px', background: '#f0fdf4', padding: '5px 10px', borderLeft: '3px solid #15803d', marginBottom: '6px', marginTop: '14px' },
    row:        { display: 'flex', justifyContent: 'space-between', padding: '3px 2px', borderBottom: '1px solid #f3f4f6', fontSize: '11.5px' },
    rowLabel:   { color: '#6b7280' },
    rowValue:   { color: '#111', fontWeight: 500 },
    totalRow:   { display: 'flex', justifyContent: 'space-between', padding: '6px 2px', borderTop: '2px solid #15803d', marginTop: '4px', fontSize: '13px', fontWeight: 700, color: '#15803d' },
    grandBox:   { background: '#f0fdf4', border: '2px solid #15803d', borderRadius: '6px', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '14px 0' },
    grandLabel: { fontFamily: "'Rajdhani', Arial, sans-serif", fontSize: '14px', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '2px' },
    grandValue: { fontFamily: "'Rajdhani', Arial, sans-serif", fontSize: '30px', fontWeight: 700, color: '#15803d' },
    // Signature boxes for PDF — show actual signature image if captured
    sigBox:     { border: '1px solid #d1d5db', borderRadius: '4px', padding: '10px 12px', flex: 1 },
    sigLabel:   { fontSize: '10px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '4px' },
    sigImg:     { width: '100%', height: '60px', objectFit: 'contain', display: 'block', background: '#f9fafb', borderRadius: '3px' },
    sigLine:    { borderBottom: '1px dashed #d1d5db', marginTop: '56px', marginBottom: '4px' },
    sigSub:     { fontSize: '9px', color: '#d1d5db' },
    footer:     { marginTop: '24px', paddingTop: '10px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#9ca3af' },
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
          <div><span style={{ color: '#6b7280' }}>Deposit: </span><strong>{fmt(deposit)}</strong></div>
          <div><span style={{ color: '#6b7280' }}>Balance Due: </span><strong style={{ color: '#15803d' }}>{fmt(remaining)}</strong></div>
        </div>
      </div>

      {project.notes && (
        <div style={{ marginTop: '8px', padding: '6px 10px', background: '#fefce8', border: '1px solid #fde68a', borderRadius: '4px', fontSize: '11px' }}>
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
          <Row label="Base Price" value={fmt(roofingTotal.base)} />
          {Object.entries(roofing.autoAddons).filter(([, a]) => a.enabled).map(([key, a]) => {
            const labels = { twoStory: 'Two Story', pitch712: '7/12–9/12 Pitch', pitch1012: '10/12–12/12 Pitch', extraLayer: 'Extra Layer Tear-Off' };
            const sq  = parseFloat(roofing.squares) || 0;
            const qty = a.qtyOverride !== '' && a.qtyOverride !== undefined ? parseFloat(a.qtyOverride) || 0 : sq;
            return <Row key={key} label={labels[key]} value={fmt(qty * (parseFloat(a.rate) || 0))} />;
          })}
          {roofing.lineItems.filter(i => parseFloat(i.qty) > 0).map(item => (
            <Row key={item.id} label={`${item.label} — ${item.qty} ${item.unit}${item.color ? ` (${item.color})` : ''}`} value={fmt(item.rate * item.qty)} />
          ))}
          {/* Accessories */}
          {roofing.accessories?.some(a => parseFloat(a.qty) > 0) && (
            <div style={{ marginTop: '8px' }}>
              <div style={{ fontSize: '10px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Accessories (included in SQ price)</div>
              {roofing.accessories.filter(a => parseFloat(a.qty) > 0).map(acc => (
                <Row key={acc.id} label={`${acc.label}${acc.color ? ` · ${acc.color}` : ''}${acc.size ? ` · ${acc.size}` : ''}${acc.type ? ` · ${acc.type}` : ''}`} value={`qty: ${acc.qty}`} />
              ))}
            </div>
          )}
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
          {siding.squares && <Row label="Squares" value={`${siding.squares} SQ`} />}
          {parseFloat(siding.tearOffSQ) > 0 && <Row label="Tear-Off" value={`${siding.tearOffSQ} SQ @ ${fmt(siding.tearOffRate)}/SQ`} />}
          {[...siding.lineItems, ...soffit.lineItems].filter(i => parseFloat(i.qty) > 0).map(item => (
            <Row key={item.id} label={`${item.label} — ${item.qty} ${item.unit}${item.color ? ` (${item.color})` : ''}`} value={fmt(item.rate * item.qty)} />
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
          {fascia.lineItems.filter(i => parseFloat(i.qty) > 0).map(item => (
            <Row key={item.id} label={`${item.label} — ${item.qty} ${item.unit}${item.color ? ` (${item.color})` : ''}`} value={fmt(item.rate * item.qty)} />
          ))}
          {hasFascia && <Row label="Fascia Subtotal" value={fmt(fasciaTotal)} />}
          {gutter.lineItems.filter(i => parseFloat(i.qty) > 0).map(item => (
            <Row key={item.id} label={`${item.label} — ${item.qty} ${item.unit}${item.color ? ` (${item.color})` : ''}`} value={fmt(item.rate * item.qty)} />
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

      {/* SIGNATURES — embedded as images if captured */}
      <div style={{ display: 'flex', gap: '16px', marginTop: '24px' }}>
        <div style={s.sigBox}>
          <div style={s.sigLabel}>Customer Signature</div>
          {customerSig
            ? <img src={customerSig} alt="Customer signature" style={s.sigImg} />
            : <div style={s.sigLine} />
          }
          <div style={s.sigSub}>{project.customerName || 'Customer'} · {project.date || ''}</div>
        </div>
        <div style={s.sigBox}>
          <div style={s.sigLabel}>OTRC Representative</div>
          {repSig
            ? <img src={repSig} alt="Rep signature" style={s.sigImg} />
            : <div style={s.sigLine} />
          }
          <div style={s.sigSub}>{project.repName || 'Representative'} · {project.date || ''}</div>
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

  // Signature refs
  const customerSigRef = useRef(null);
  const repSigRef      = useRef(null);

  // Signature state — track if each pad has been signed
  const [customerSigned, setCustomerSigned] = useState(false);
  const [repSigned,      setRepSigned]      = useState(false);

  // Captured base64 signature images (set when printing/emailing)
  const [customerSigImg, setCustomerSigImg] = useState('');
  const [repSigImg,      setRepSigImg]      = useState('');

  const [emailing,  setEmailing]  = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailErr,  setEmailErr]  = useState('');

  // Capture signatures as PNG data URLs before print/email
  const captureSignatures = () => {
    const custSig = customerSigRef.current && !customerSigRef.current.isEmpty()
      ? customerSigRef.current.getTrimmedCanvas().toDataURL('image/png')
      : '';
    const repSig  = repSigRef.current && !repSigRef.current.isEmpty()
      ? repSigRef.current.getTrimmedCanvas().toDataURL('image/png')
      : '';
    setCustomerSigImg(custSig);
    setRepSigImg(repSig);
    return { custSig, repSig };
  };

  const handlePrint = () => {
    captureSignatures();
    // Small delay so state updates before print dialog
    setTimeout(() => window.print(), 150);
  };

  const buildEmailBody = () => {
    const lines = [
      'WORK ORDER — ON THE ROOF CONTRACTING',
      '======================================',
      `Customer:  ${project.customerName || '—'}`,
      `Address:   ${project.propertyAddress || '—'}`,
      `Date:      ${project.date || '—'}`,
      `Rep:       ${project.repName || '—'}`,
      `Phone:     ${project.phone || '—'}`,
      `Signatures: Customer ${customerSigned ? '✓ Signed' : '— Not signed'} | Rep ${repSigned ? '✓ Signed' : '— Not signed'}`,
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
      const filledAcc = roofing.accessories?.filter(a => parseFloat(a.qty) > 0) || [];
      if (filledAcc.length) {
        lines.push('  Accessories:');
        filledAcc.forEach(a => lines.push(`    • ${a.label}: qty ${a.qty}${a.color ? `, ${a.color}` : ''}${a.size ? `, ${a.size}` : ''}${a.type ? `, ${a.type}` : ''}`));
      }
      lines.push(`ROOFING TOTAL: ${fmt(roofingTotal.total)}`, '');
    }
    if (hasSiding) {
      lines.push('SIDING + SOFFIT SCOPE', '─────────────────────');
      if (siding.brand)  lines.push(`Brand: ${siding.brand}`);
      if (siding.size)   lines.push(`Size:  ${siding.size}`);
      if (siding.color)  lines.push(`Color: ${siding.color}`);
      lines.push(`Tier: ${tierLabels[siding.selectedTier]}`);
      if (siding.squares) lines.push(`Squares: ${siding.squares} SQ`);
      [...state.siding.lineItems, ...state.soffit.lineItems].filter(i => parseFloat(i.qty) > 0).forEach(item => {
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
      `Method:  ${payLabels[payment.method] || '—'}`,
      `Deposit: ${fmt(deposit)}`,
      `Balance: ${fmt(Math.max(0, grandTotal - deposit))}`,
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
      setEmailErr('Email failed: ' + (err?.text || err?.message || 'Unknown error.'));
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
          customerSig={customerSigImg}
          repSig={repSigImg}
        />
      </div>

      {/* ── SCREEN UI — hidden when printing ── */}
      <div className="no-print">

        {/* Action bar */}
        <div className="flex items-center justify-between px-5 py-3 bg-gradient-to-r from-green-400/15 to-green-400/5 border border-green-400 rounded-lg mb-3">
          <div>
            <div className="font-['Rajdhani'] text-[16px] font-bold text-gray-200 uppercase tracking-widest">Work Order</div>
            <div className="text-[11px] text-gray-500 mt-0.5">Auto-built · collect signatures then print or email</div>
          </div>
          <div className="flex gap-2">
            <BtnOutline onClick={handlePrint}>Print / Save PDF</BtnOutline>
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
              <WORow key={item.id} label={`+ ${item.label} (${item.qty} ${item.unit})${item.color ? ` — ${item.color}` : ''}`} value={fmt(item.rate * item.qty)} />
            ))}
            {roofing.accessories?.some(a => parseFloat(a.qty) > 0) && (
              <div className="mt-2 pt-2 border-t border-green-900/10">
                <div className="text-[10px] text-gray-600 uppercase tracking-wider mb-1">Accessories (incl. in SQ price)</div>
                {roofing.accessories.filter(a => parseFloat(a.qty) > 0).map(acc => (
                  <div key={acc.id} className="flex justify-between py-0.5 text-[11px]">
                    <span className="text-gray-500">{acc.label}{acc.qty ? ` · qty ${acc.qty}` : ''}{acc.color ? ` · ${acc.color}` : ''}{acc.size ? ` · ${acc.size}` : ''}{acc.type ? ` · ${acc.type}` : ''}</span>
                    <span className="text-gray-600 text-[10px]">incl.</span>
                  </div>
                ))}
              </div>
            )}
            <WORow label="Roofing Total" value={fmt(roofingTotal.total)} isTotal />
          </WOSection>
        )}

        {hasSiding && (
          <WOSection title="Siding + Soffit Scope">
            {siding.brand  && <WORow label="Brand"  value={siding.brand} />}
            {siding.size   && <WORow label="Size"   value={siding.size} />}
            {siding.color  && <WORow label="Color"  value={siding.color} />}
            <WORow label="Tier" value={tierLabels[siding.selectedTier]} />
            {siding.squares && <WORow label="Squares" value={`${siding.squares} SQ`} />}
            {parseFloat(siding.tearOffSQ) > 0 && <WORow label="Tear-Off" value={`${siding.tearOffSQ} SQ @ ${fmt(siding.tearOffRate)}/SQ`} />}
            {[...state.siding.lineItems, ...state.soffit.lineItems].filter(i => parseFloat(i.qty) > 0).map(item => (
              <WORow key={item.id} label={`+ ${item.label} (${item.qty} ${item.unit})${item.color ? ` — ${item.color}` : ''}`} value={fmt(item.rate * item.qty)} />
            ))}
            <WORow label="Siding + Soffit Total" value={fmt(sidingTotal.total)} isTotal />
          </WOSection>
        )}

        {(hasFascia || hasGutter) && (
          <WOSection title="Fascia + Gutter Scope">
            {gutter.type  && <WORow label="Gutter Type"  value={gutter.type} />}
            {gutter.color && <WORow label="Gutter Color" value={gutter.color} />}
            {state.fascia.lineItems.filter(i => parseFloat(i.qty) > 0).map(item => (
              <WORow key={item.id} label={`${item.label} (${item.qty} ${item.unit})${item.color ? ` — ${item.color}` : ''}`} value={fmt(item.rate * item.qty)} />
            ))}
            {hasFascia && <WORow label="Fascia Subtotal" value={fmt(fasciaTotal)} />}
            {state.gutter.lineItems.filter(i => parseFloat(i.qty) > 0).map(item => (
              <WORow key={item.id} label={`${item.label} (${item.qty} ${item.unit})${item.color ? ` — ${item.color}` : ''}`} value={fmt(item.rate * item.qty)} />
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

        {/* ── SIGNATURE SECTION ── */}
        <div className="mt-2 mb-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-[3px] h-4 bg-green-400 rounded-sm" />
            <h2 className="font-['Rajdhani'] text-[15px] font-bold text-green-400 uppercase tracking-widest">Signatures</h2>
          </div>
          <p className="text-[11px] text-gray-500 mb-3">
            Have the customer and sales rep sign below. Signatures are captured into the printed PDF.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <SignaturePad
            label="Customer Signature"
            sigRef={customerSigRef}
            signed={customerSigned}
            onSigned={() => setCustomerSigned(true)}
            onClear={() => {
              customerSigRef.current?.clear();
              setCustomerSigned(false);
              setCustomerSigImg('');
            }}
          />
          <SignaturePad
            label="OTRC Representative"
            sigRef={repSigRef}
            signed={repSigned}
            onSigned={() => setRepSigned(true)}
            onClear={() => {
              repSigRef.current?.clear();
              setRepSigned(false);
              setRepSigImg('');
            }}
          />
        </div>

        {/* Signed status bar */}
        <div className="mt-2 flex gap-3">
          {[
            { label: 'Customer', signed: customerSigned },
            { label: 'Rep',      signed: repSigned },
          ].map(({ label, signed }) => (
            <div key={label} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-[11px] ${signed ? 'bg-green-400/10 border-green-900/30 text-green-400' : 'bg-[#161616] border-green-900/15 text-gray-600'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${signed ? 'bg-green-400' : 'bg-gray-700'}`} />
              {label}: {signed ? 'Signed ✓' : 'Pending'}
            </div>
          ))}
          <div className="text-[10px] text-gray-600 self-center ml-auto">
            {customerSigned && repSigned ? 'Both signed — ready to print' : 'Sign above then print or email'}
          </div>
        </div>

        {/* Wire up onChange to detect signing */}
        <div style={{ display: 'none' }}>
          {/* We poll signature state via onEnd callbacks on the canvas */}
        </div>

      </div>
    </div>
  );
}
