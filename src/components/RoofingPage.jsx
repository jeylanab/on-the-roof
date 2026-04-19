import { useCalculation } from '../context/CalculationContext';
import { fmt, lineTotal } from '../data/utils';
import {
  Card, CardTitle, SectionSub, Field, Input, ReadonlyInput,
  AddonColHeaders, AddonRow, TotalsBar,
} from './UI';

// ─── PROJECT INFO ─────────────────────────────────────────────────────────────

function ProjectInfo() {
  const { state, updateProject } = useCalculation();
  const p = state.project;
  const set = (field) => (e) => updateProject({ [field]: e.target.value });

  return (
    <Card>
      <CardTitle>Project Info</CardTitle>
      <div className="grid grid-cols-3 gap-2.5 mb-2.5">
        <Field label="Customer Name">
          <Input value={p.customerName} onChange={set('customerName')} placeholder="Full name" />
        </Field>
        <Field label="Property Address">
          <Input value={p.propertyAddress} onChange={set('propertyAddress')} placeholder="Street address" />
        </Field>
        <Field label="Date">
          <Input type="date" value={p.date} onChange={set('date')} />
        </Field>
      </div>
      <div className="grid grid-cols-4 gap-2.5">
        <Field label="Sales Rep">
          <Input value={p.repName} onChange={set('repName')} placeholder="Rep name" />
        </Field>
        <Field label="Phone">
          <Input value={p.phone} onChange={set('phone')} placeholder="(000) 000-0000" />
        </Field>
        <Field label="Email">
          <Input type="email" value={p.email} onChange={set('email')} placeholder="email@example.com" />
        </Field>
        <Field label="Notes">
          <Input value={p.notes} onChange={set('notes')} placeholder="Special conditions..." />
        </Field>
      </div>
    </Card>
  );
}

// ─── ROOFING SYSTEM ──────────────────────────────────────────────────────────

function RoofingSystem() {
  const { state, updateRoofing, updateRoofingAutoAddon, roofingTotal } = useCalculation();
  const r = state.roofing;
  const set = (field) => (e) => updateRoofing({ [field]: e.target.value });

  const AUTO_ADDONS = [
    { key: 'twoStory',  label: 'Two Story' },
    { key: 'pitch712',  label: '7/12 – 9/12 Pitch' },
    { key: 'pitch1012', label: '10/12 – 12/12 Pitch' },
    { key: 'extraLayer',label: 'Additional Layer Tear-Off' },
  ];

  return (
    <Card>
      <CardTitle>Roofing System</CardTitle>
      <div className="grid grid-cols-4 gap-2.5 mb-3">
        <Field label="Shingle Brand">
          <Input value={r.brand} onChange={set('brand')} placeholder="e.g. GAF, Owens Corning" />
        </Field>
        <Field label="Product Type">
          <Input value={r.type} onChange={set('type')} placeholder="e.g. Timberline HDZ" />
        </Field>
        <Field label="Color">
          <Input value={r.color} onChange={set('color')} placeholder="e.g. Charcoal" />
        </Field>
        <Field label="Roof Squares">
          <Input type="number" value={r.squares} onChange={set('squares')} placeholder="0" min="0" step="0.1" />
        </Field>
      </div>
      <div className="grid grid-cols-3 gap-2.5 mb-3">
        <Field label="Base Rate / SQ ($)">
          <Input type="number" value={r.baseRatePerSQ} onChange={set('baseRatePerSQ')} />
        </Field>
        <Field label="Base Price">
          <ReadonlyInput value={fmt(roofingTotal.base)} />
        </Field>
        <Field label="Standard System Includes">
          <Input
            readOnly
            value="Tear-off, shingles, ridge, ice/water 400sqft, underlayment, drip edge, 1 chimney, 40LF wall flash"
            className="text-[10px] text-gray-500 cursor-default"
          />
        </Field>
      </div>

      <SectionSub>Auto Add-Ons (uses roof squares as quantity — or type to override)</SectionSub>
      <div
        className="grid gap-1.5 px-2 mb-1"
        style={{ gridTemplateColumns: '2fr 80px 90px 90px 30px' }}
      >
        {['Item', 'Rate/SQ', 'Qty (sqft)', 'Total', 'Use'].map((h, i) => (
          <span key={i} className={`text-[10px] text-gray-600 uppercase tracking-wider ${i === 0 ? 'text-left' : 'text-center'}`}>{h}</span>
        ))}
      </div>
      {AUTO_ADDONS.map(({ key, label }) => {
        const a = r.autoAddons[key];
        const sq = parseFloat(r.squares) || 0;
        // Use typed qty override if provided, otherwise fall back to roof squares
        const effectiveQty = a.qtyOverride !== '' && a.qtyOverride !== undefined
          ? parseFloat(a.qtyOverride) || 0
          : sq;
        const tot = a.enabled ? effectiveQty * (parseFloat(a.rate) || 0) : 0;
        return (
          <div
            key={key}
            className="grid gap-1.5 items-center px-2 py-1.5 bg-[#161616] border border-green-900/10 rounded-md mb-1"
            style={{ gridTemplateColumns: '2fr 80px 90px 90px 30px' }}
          >
            <span className="text-[12px] text-gray-300">{label}</span>
            <input
              type="number"
              value={a.rate}
              onChange={(e) => updateRoofingAutoAddon(key, 'rate', e.target.value)}
              className="bg-[#1c1c1c] border border-green-900/20 rounded text-gray-200 px-2 py-1 text-[12px] outline-none text-right focus:border-green-400 w-full"
            />
            <input
              type="number"
              value={a.qtyOverride ?? ''}
              placeholder={sq > 0 ? String(sq) : 'auto'}
              onChange={(e) => updateRoofingAutoAddon(key, 'qtyOverride', e.target.value)}
              className="bg-[#1c1c1c] border border-green-900/20 rounded text-gray-400 px-2 py-1 text-[12px] outline-none text-right focus:border-green-400 w-full placeholder:text-gray-600"
            />
            <span className="text-[12px] text-green-400 font-semibold text-right">{fmt(tot)}</span>
            <div className="flex items-center justify-center">
              <input
                type="checkbox"
                checked={a.enabled}
                onChange={(e) => updateRoofingAutoAddon(key, 'enabled', e.target.checked)}
                className="w-3.5 h-3.5 accent-green-400 cursor-pointer"
              />
            </div>
          </div>
        );
      })}
    </Card>
  );
}

// ─── ROOFING LINE ITEMS ───────────────────────────────────────────────────────

function RoofingLineItems() {
  const { state, updateRoofingLineItem } = useCalculation();
  const items = state.roofing.lineItems;

  return (
    <Card>
      <CardTitle>Line Item Add-Ons</CardTitle>
      <AddonColHeaders showColor />
      {items.map((item, i) => (
        <AddonRow
          key={item.id}
          label={item.label}
          unit={item.unit}
          rate={item.rate}
          qty={item.qty}
          color={item.color}
          total={lineTotal(item.rate, item.qty)}
          showColor
          onRateChange={(v) => updateRoofingLineItem(i, 'rate', v)}
          onQtyChange={(v) => updateRoofingLineItem(i, 'qty', v)}
          onColorChange={(v) => updateRoofingLineItem(i, 'color', v)}
        />
      ))}
    </Card>
  );
}

// ─── ROOFING PAGE ─────────────────────────────────────────────────────────────

export default function RoofingPage() {
  const { roofingTotal } = useCalculation();

  return (
    <div>
      <ProjectInfo />
      <RoofingSystem />
      <RoofingLineItems />
      <TotalsBar items={[
        { label: 'Base Price', value: roofingTotal.base },
        { label: 'Add-Ons', value: roofingTotal.addons },
        { label: 'Roofing Total', value: roofingTotal.total },
      ]} />
    </div>
  );
}
