import { useCalculation } from '../context/CalculationContext';
import { fmt, lineTotal } from '../data/utils';
import {
  Card, CardTitle, SectionSub, Field, Input, ReadonlyInput,
  AddonColHeaders, AddonRow, TotalsBar,
} from './UI';

// ─── TIER SELECTOR ────────────────────────────────────────────────────────────

function TierSelector() {
  const { state, updateSiding, updateSidingTier } = useCalculation();
  const { selectedTier, tiers } = state.siding;

  return (
    <>
      <SectionSub>Select Siding Tier</SectionSub>
      <div className="grid grid-cols-3 gap-2 mb-3">
        {tiers.map((tier) => (
          <div
            key={tier.id}
            onClick={() => updateSiding({ selectedTier: tier.id })}
            className={`p-2.5 rounded-md border cursor-pointer text-center transition-all
              ${selectedTier === tier.id
                ? 'bg-green-400/10 border-green-400'
                : 'bg-[#161616] border-green-900/20 hover:border-green-900/40'
              }`}
          >
            <div className={`font-['Rajdhani'] text-[13px] font-bold uppercase tracking-wider ${selectedTier === tier.id ? 'text-green-400' : 'text-gray-300'}`}>
              {tier.label}
            </div>
            <div className="text-[10px] text-gray-500 my-0.5">{tier.spec}</div>
            <input
              type="number"
              value={tier.price}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => updateSidingTier(tier.id, e.target.value)}
              className="bg-[#1c1c1c] border border-green-900/20 rounded text-green-400 px-2 py-0.5 text-[13px] w-20 text-center  outline-none focus:border-green-400 mt-1"
            />
            <div className="text-[9px] text-gray-600 mt-0.5">$ per square</div>
          </div>
        ))}
      </div>
    </>
  );
}

// ─── SIDING SYSTEM ────────────────────────────────────────────────────────────

function SidingSystem() {
  const { state, updateSiding, updateSidingLineItem, sidingTotal } = useCalculation();
  const s = state.siding;
  const set = (field) => (e) => updateSiding({ [field]: e.target.value });

  return (
    <Card>
      <CardTitle>Siding System</CardTitle>
      <div className="grid grid-cols-3 gap-2.5 mb-3">
        <Field label="Brand">
          <Input value={s.brand} onChange={set('brand')} placeholder="e.g. CertainTeed, James Hardie" />
        </Field>
        <Field label="Size / Profile">
          <Input value={s.size} onChange={set('size')} placeholder='e.g. 4.5" Dutch Lap' />
        </Field>
        <Field label="Color">
          <Input value={s.color} onChange={set('color')} placeholder="e.g. Wicker" />
        </Field>
      </div>

      <TierSelector />

      <div className="grid grid-cols-4 gap-2.5 mb-3">
        <Field label="Siding Squares">
          <Input type="number" value={s.squares} onChange={set('squares')} placeholder="0" />
        </Field>
        <Field label="Base Price">
          <ReadonlyInput value={fmt(sidingTotal.base)} />
        </Field>
        <Field label="Tear-Off (SQ)">
          <Input type="number" value={s.tearOffSQ} onChange={set('tearOffSQ')} placeholder="0" />
        </Field>
        <Field label="Tear-Off Rate / SQ ($)">
          <Input type="number" value={s.tearOffRate} onChange={set('tearOffRate')} />
        </Field>
      </div>

      <SectionSub>Siding Materials</SectionSub>
      <AddonColHeaders showColor />
      {s.lineItems.map((item, i) => (
        <AddonRow
          key={item.id}
          label={item.label}
          unit={item.unit}
          rate={item.rate}
          qty={item.qty}
          color={item.color}
          total={lineTotal(item.rate, item.qty)}
          showColor
          onRateChange={(v) => updateSidingLineItem(i, 'rate', v)}
          onQtyChange={(v) => updateSidingLineItem(i, 'qty', v)}
          onColorChange={(v) => updateSidingLineItem(i, 'color', v)}
        />
      ))}
    </Card>
  );
}

// ─── SOFFIT SYSTEM ────────────────────────────────────────────────────────────

function SoffitSystem() {
  const { state, updateSoffitLineItem } = useCalculation();
  const items = state.soffit.lineItems;

  return (
    <Card>
      <CardTitle>Soffit System</CardTitle>
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
          onRateChange={(v) => updateSoffitLineItem(i, 'rate', v)}
          onQtyChange={(v) => updateSoffitLineItem(i, 'qty', v)}
          onColorChange={(v) => updateSoffitLineItem(i, 'color', v)}
        />
      ))}
    </Card>
  );
}

// ─── SIDING PAGE ──────────────────────────────────────────────────────────────

export default function SidingPage() {
  const { sidingTotal } = useCalculation();

  return (
    <div>
      <SidingSystem />
      <SoffitSystem />
      <TotalsBar items={[
        { label: 'Siding Base', value: sidingTotal.base },
        { label: 'Materials + Soffit', value: sidingTotal.materials },
        { label: 'Siding + Soffit Total', value: sidingTotal.total },
      ]} />
    </div>
  );
}
