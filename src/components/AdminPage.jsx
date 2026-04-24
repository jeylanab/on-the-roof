import { useState, useEffect } from 'react';
import { useCalculation } from '../context/CalculationContext';
import { savePricingConfig, getPricingConfig, getAllBids, deleteBid } from '../firebase/service';
import { fmt } from '../data/utils';
import { Card, CardTitle, SectionSub, BtnPrimary, BtnOutline } from './UI';

// ─── PRICING EDITOR ───────────────────────────────────────────────────────────

function PricingEditor() {
  const { state, loadPricing } = useCalculation();
  const [localPricing, setLocalPricing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    // Build local editable copy from current state
    setLocalPricing({
      roofing: {
        baseRatePerSQ: state.roofing.baseRatePerSQ,
        autoAddons: {
          twoStory: state.roofing.autoAddons.twoStory.rate,
          pitch712: state.roofing.autoAddons.pitch712.rate,
          pitch1012: state.roofing.autoAddons.pitch1012.rate,
          extraLayer: state.roofing.autoAddons.extraLayer.rate,
        },
        lineItems: state.roofing.lineItems.map((i) => ({ id: i.id, label: i.label, rate: i.rate })),
        accessories: state.roofing.accessories.map((a) => ({ id: a.id, label: a.label })),
      },
      siding: {
        tiers: state.siding.tiers.map((t) => ({ id: t.id, price: t.price })),
        tearOffRate: state.siding.tearOffRate,
        lineItems: state.siding.lineItems.map((i) => ({ id: i.id, label: i.label, rate: i.rate })),
      },
      soffit: {
        lineItems: state.soffit.lineItems.map((i) => ({ id: i.id, label: i.label, rate: i.rate })),
      },
      fascia: {
        lineItems: state.fascia.lineItems.map((i) => ({ id: i.id, label: i.label, rate: i.rate })),
      },
      gutter: {
        lineItems: state.gutter.lineItems.map((i) => ({ id: i.id, label: i.label, rate: i.rate })),
      },
    });
  }, []);

  const handleLoad = async () => {
    try {
      const config = await getPricingConfig();
      if (config) {
        loadPricing(config);
        setMsg('Pricing loaded from Firebase.');
      } else {
        setMsg('No saved pricing found in Firebase.');
      }
    } catch (err) {
      setMsg('Error: ' + err.message);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await savePricingConfig(localPricing);
      loadPricing(localPricing);
      setMsg('Pricing saved to Firebase and applied!');
    } catch (err) {
      setMsg('Error: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const setRate = (section, id, value) => {
    setLocalPricing((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        lineItems: prev[section].lineItems.map((item) =>
          item.id === id ? { ...item, rate: value } : item
        ),
      },
    }));
  };

  if (!localPricing) return <div className="text-gray-500 text-[13px]">Loading...</div>;

  const TIER_LABELS = { standard: 'Standard .40mm', designer: 'Designer .42mm', premium: 'Premium .44mm' };

  return (
    <Card>
      <CardTitle>Pricing Configuration</CardTitle>
      <div className="flex gap-2 mb-4">
        <BtnPrimary onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save to Firebase'}</BtnPrimary>
        <BtnOutline onClick={handleLoad}>Load from Firebase</BtnOutline>
      </div>
      {msg && (
        <div className="mb-3 p-2 bg-green-400/10 border border-green-400/30 rounded text-[12px] text-green-400">{msg}</div>
      )}

      <SectionSub>Roofing Base Rate</SectionSub>
      <div className="flex items-center gap-3 mb-2">
        <span className="text-[12px] text-gray-300 w-48">Base Rate / SQ ($)</span>
        <input
          type="number"
          value={localPricing.roofing.baseRatePerSQ}
          onChange={(e) => setLocalPricing((p) => ({ ...p, roofing: { ...p.roofing, baseRatePerSQ: e.target.value } }))}
          className="bg-[#1c1c1c] border border-green-900/20 rounded text-gray-200 px-2 py-1 text-[12px] w-24 text-right outline-none focus:border-green-400"
        />
      </div>

      <SectionSub>Auto Add-On Rates</SectionSub>
      {Object.entries(localPricing.roofing.autoAddons).map(([key, val]) => {
        const labels = { twoStory: 'Two Story', pitch712: '7/12–9/12 Pitch', pitch1012: '10/12–12/12 Pitch', extraLayer: 'Extra Layer Tear-Off' };
        return (
          <div key={key} className="flex items-center gap-3 mb-1.5">
            <span className="text-[12px] text-gray-300 w-48">{labels[key]}</span>
            <input
              type="number"
              value={val}
              onChange={(e) => setLocalPricing((p) => ({
                ...p,
                roofing: { ...p.roofing, autoAddons: { ...p.roofing.autoAddons, [key]: e.target.value } },
              }))}
              className="bg-[#1c1c1c] border border-green-900/20 rounded text-gray-200 px-2 py-1 text-[12px] w-24 text-right outline-none focus:border-green-400"
            />
          </div>
        );
      })}

      <SectionSub>Siding Tiers ($ / SQ)</SectionSub>
      {localPricing.siding.tiers.map((tier) => (
        <div key={tier.id} className="flex items-center gap-3 mb-1.5">
          <span className="text-[12px] text-gray-300 w-48">{TIER_LABELS[tier.id]}</span>
          <input
            type="number"
            value={tier.price}
            onChange={(e) => setLocalPricing((p) => ({
              ...p,
              siding: {
                ...p.siding,
                tiers: p.siding.tiers.map((t) => t.id === tier.id ? { ...t, price: e.target.value } : t),
              },
            }))}
            className="bg-[#1c1c1c] border border-green-900/20 rounded text-gray-200 px-2 py-1 text-[12px] w-24 text-right outline-none focus:border-green-400"
          />
        </div>
      ))}

      {[
        { section: 'roofing', label: 'Roofing Line Items' },
        { section: 'siding', label: 'Siding Line Items' },
        { section: 'soffit', label: 'Soffit Line Items' },
        { section: 'fascia', label: 'Fascia Line Items' },
        { section: 'gutter', label: 'Gutter Line Items' },
      ].map(({ section, label }) => (
        <div key={section}>
          <SectionSub>{label}</SectionSub>
          {localPricing[section].lineItems.map((item) => (
            <div key={item.id} className="flex items-center gap-3 mb-1">
              <span className="text-[11px] text-gray-400 flex-1">{item.label}</span>
              <input
                type="number"
                value={item.rate}
                onChange={(e) => setRate(section, item.id, e.target.value)}
                className="bg-[#1c1c1c] border border-green-900/20 rounded text-gray-200 px-2 py-1 text-[12px] w-24 text-right outline-none focus:border-green-400"
              />
            </div>
          ))}
        </div>
      ))}

      <SectionSub>Roofing Accessories — Labels (included in SQ price)</SectionSub>
      <p className="text-[10px] text-gray-600 mb-2">These are production tracking items. Edit labels to match what your team uses.</p>
      {localPricing.roofing.accessories.map((acc, i) => (
        <div key={acc.id} className="flex items-center gap-3 mb-1">
          <span className="text-[10px] text-gray-600 w-6">{i + 1}.</span>
          <input
            type="text"
            value={acc.label}
            onChange={(e) => setLocalPricing((p) => ({
              ...p,
              roofing: {
                ...p.roofing,
                accessories: p.roofing.accessories.map((a, idx) =>
                  idx === i ? { ...a, label: e.target.value } : a
                ),
              },
            }))}
            className="bg-[#1c1c1c] border border-green-900/20 rounded text-gray-200 px-2 py-1 text-[12px] flex-1 outline-none focus:border-green-400"
          />
        </div>
      ))}
    </Card>
  );
}

// ─── SAVED BIDS VIEWER ────────────────────────────────────────────────────────

function SavedBids() {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchBids = async () => {
    setLoading(true);
    try {
      const data = await getAllBids();
      setBids(data);
    } catch (err) {
      alert('Error loading bids: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this bid?')) return;
    await deleteBid(id);
    setBids((prev) => prev.filter((b) => b.id !== id));
  };

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <CardTitle>Saved Bids</CardTitle>
        <BtnOutline onClick={fetchBids}>{loading ? 'Loading...' : 'Load Bids'}</BtnOutline>
      </div>
      {bids.length === 0 ? (
        <div className="text-[13px] text-gray-500 text-center py-6">Click "Load Bids" to fetch from Firebase.</div>
      ) : (
        <div className="space-y-2">
          {bids.map((bid) => (
            <div key={bid.id} className="flex items-center justify-between p-2.5 bg-[#161616] border border-green-900/20 rounded-md">
              <div>
                <div className="text-[13px] text-gray-200 font-medium">{bid.project?.customerName || 'Unnamed'}</div>
                <div className="text-[11px] text-gray-500">{bid.project?.propertyAddress || '—'} · {bid.project?.date || ''}</div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-['Rajdhani'] text-[16px] font-bold text-green-400">{fmt(bid.totals?.grand || 0)}</span>
                <button
                  onClick={() => handleDelete(bid.id)}
                  className="text-[11px] text-red-400 hover:text-red-300 border border-red-900/30 rounded px-2 py-0.5 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

// ─── ADMIN PAGE ───────────────────────────────────────────────────────────────

export default function AdminPage() {
  return (
    <div>
      <div className="mb-3 p-3 bg-yellow-400/10 border border-yellow-400/30 rounded-lg text-[12px] text-yellow-300">
        <span className="font-bold">Admin Panel — </span>
        Changes to pricing are saved to Firebase and applied to all new bids immediately.
        Existing bids are not affected.
      </div>
      <PricingEditor />
      <SavedBids />
    </div>
  );
}
