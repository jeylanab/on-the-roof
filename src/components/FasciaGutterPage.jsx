import { useCalculation } from '../context/CalculationContext';
import { lineTotal } from '../data/utils';
import {
  Card, CardTitle, Field, Input, Select,
  AddonColHeaders, AddonRow, TotalsBar,
} from './UI';

// ─── FASCIA SYSTEM ────────────────────────────────────────────────────────────

function FasciaSystem() {
  const { state, updateFasciaLineItem } = useCalculation();
  const items = state.fascia.lineItems;

  return (
    <Card>
      <CardTitle>Fascia Metal System</CardTitle>
      <AddonColHeaders />
      {items.map((item, i) => (
        <AddonRow
          key={item.id}
          label={item.label}
          unit={item.unit}
          rate={item.rate}
          qty={item.qty}
          total={lineTotal(item.rate, item.qty)}
          onRateChange={(v) => updateFasciaLineItem(i, 'rate', v)}
          onQtyChange={(v) => updateFasciaLineItem(i, 'qty', v)}
        />
      ))}
    </Card>
  );
}

// ─── GUTTER SYSTEM ────────────────────────────────────────────────────────────

function GutterSystem() {
  const { state, updateGutter, updateGutterLineItem } = useCalculation();
  const g = state.gutter;
  const set = (field) => (e) => updateGutter({ [field]: e.target.value });

  return (
    <Card>
      <CardTitle>Gutter System</CardTitle>
      <div className="grid grid-cols-3 gap-2.5 mb-3">
        <Field label="Gutter Type">
          <Select value={g.type} onChange={set('type')}>
            <option>5K Seamless Aluminum</option>
            <option>6K Seamless Aluminum</option>
            <option>Copper</option>
            <option>Steel</option>
          </Select>
        </Field>
        <Field label="Color">
          <Input value={g.color} onChange={set('color')} placeholder="e.g. White, Brown" />
        </Field>
        <div />
      </div>
      <AddonColHeaders />
      {g.lineItems.map((item, i) => (
        <AddonRow
          key={item.id}
          label={item.label}
          unit={item.unit}
          rate={item.rate}
          qty={item.qty}
          total={lineTotal(item.rate, item.qty)}
          onRateChange={(v) => updateGutterLineItem(i, 'rate', v)}
          onQtyChange={(v) => updateGutterLineItem(i, 'qty', v)}
        />
      ))}
    </Card>
  );
}

// ─── FASCIA GUTTER PAGE ───────────────────────────────────────────────────────

export default function FasciaGutterPage() {
  const { fasciaTotal, gutterTotal } = useCalculation();

  return (
    <div>
      <FasciaSystem />
      <GutterSystem />
      <TotalsBar items={[
        { label: 'Fascia Total', value: fasciaTotal },
        { label: 'Gutter Total', value: gutterTotal },
        { label: 'Fascia + Gutter Total', value: fasciaTotal + gutterTotal },
      ]} />
    </div>
  );
}