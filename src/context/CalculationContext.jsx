import { createContext, useContext, useReducer, useCallback } from 'react';
import { DEFAULT_PRICING } from '../data/defaultPrice';

const CalculationContext = createContext(null);

const initialState = {
  // Project info
  project: {
    customerName: '',
    propertyAddress: '',
    date: new Date().toISOString().split('T')[0],
    repName: '',
    phone: '',
    email: '',
    notes: '',
    approvalDate: '',
  },

  // Roofing
  roofing: {
    brand: '',
    type: '',
    color: '',
    squares: '',
    baseRatePerSQ: DEFAULT_PRICING.roofing.baseRatePerSQ,
    autoAddons: {
      twoStory:   { enabled: false, rate: DEFAULT_PRICING.roofing.twoStoryRate,   qtyOverride: '' },
      pitch712:   { enabled: false, rate: DEFAULT_PRICING.roofing.pitch712Rate,   qtyOverride: '' },
      pitch1012:  { enabled: false, rate: DEFAULT_PRICING.roofing.pitch1012Rate,  qtyOverride: '' },
      extraLayer: { enabled: false, rate: DEFAULT_PRICING.roofing.extraLayerRate, qtyOverride: '' },
    },
    lineItems: DEFAULT_PRICING.roofing.lineItems.map((item) => ({
      ...item,
      qty: '',
      color: '',
    })),
    accessories: DEFAULT_PRICING.roofing.accessories.map((acc) => ({
      ...acc,
      qty:   '',
      color: '',
      size:  '',
      type:  '',
    })),
  },

  // Siding
  siding: {
    brand: '',
    size: '',
    color: '',
    squares: '',
    selectedTier: 'standard',
    tiers: DEFAULT_PRICING.siding.tiers,
    tearOffSQ: '',
    tearOffRate: DEFAULT_PRICING.siding.tearOffRate,
    lineItems: DEFAULT_PRICING.siding.lineItems.map((item) => ({
      ...item,
      qty: '',
      color: '',
    })),
  },

  // Soffit
  soffit: {
    lineItems: DEFAULT_PRICING.soffit.lineItems.map((item) => ({
      ...item,
      qty: '',
      color: '',
    })),
  },

  // Fascia
  fascia: {
    lineItems: DEFAULT_PRICING.fascia.lineItems.map((item) => ({
      ...item,
      qty: '',
      color: '',
    })),
  },

  // Gutter
  gutter: {
    type: '5K Seamless Aluminum',
    color: '',
    lineItems: DEFAULT_PRICING.gutter.lineItems.map((item) => ({
      ...item,
      qty: '',
      color: '',
    })),
  },

  // Payment
  payment: {
    method: 'card',
    depositAmount: '',
  },
};

function reducer(state, action) {
  switch (action.type) {
    case 'UPDATE_PROJECT':
      return { ...state, project: { ...state.project, ...action.payload } };

    case 'UPDATE_ROOFING':
      return { ...state, roofing: { ...state.roofing, ...action.payload } };

    case 'UPDATE_ROOFING_AUTO_ADDON': {
      const { key, field, value } = action.payload;
      return {
        ...state,
        roofing: {
          ...state.roofing,
          autoAddons: {
            ...state.roofing.autoAddons,
            [key]: { ...state.roofing.autoAddons[key], [field]: value },
          },
        },
      };
    }

    case 'UPDATE_ROOFING_LINE_ITEM': {
      const items = state.roofing.lineItems.map((item, i) =>
        i === action.payload.index
          ? { ...item, [action.payload.field]: action.payload.value }
          : item
      );
      return { ...state, roofing: { ...state.roofing, lineItems: items } };
    }

    case 'UPDATE_ROOFING_ACCESSORY': {
      const items = state.roofing.accessories.map((acc, i) =>
        i === action.payload.index
          ? { ...acc, [action.payload.field]: action.payload.value }
          : acc
      );
      return { ...state, roofing: { ...state.roofing, accessories: items } };
    }

    case 'UPDATE_SIDING':
      return { ...state, siding: { ...state.siding, ...action.payload } };

    case 'UPDATE_SIDING_TIER': {
      const tiers = state.siding.tiers.map((t) =>
        t.id === action.payload.id ? { ...t, price: action.payload.price } : t
      );
      return { ...state, siding: { ...state.siding, tiers } };
    }

    case 'UPDATE_SIDING_LINE_ITEM': {
      const items = state.siding.lineItems.map((item, i) =>
        i === action.payload.index
          ? { ...item, [action.payload.field]: action.payload.value }
          : item
      );
      return { ...state, siding: { ...state.siding, lineItems: items } };
    }

    case 'UPDATE_SOFFIT_LINE_ITEM': {
      const items = state.soffit.lineItems.map((item, i) =>
        i === action.payload.index
          ? { ...item, [action.payload.field]: action.payload.value }
          : item
      );
      return { ...state, soffit: { ...state.soffit, lineItems: items } };
    }

    case 'UPDATE_FASCIA':
      return { ...state, fascia: { ...state.fascia, ...action.payload } };

    case 'UPDATE_FASCIA_LINE_ITEM': {
      const items = state.fascia.lineItems.map((item, i) =>
        i === action.payload.index
          ? { ...item, [action.payload.field]: action.payload.value }
          : item
      );
      return { ...state, fascia: { ...state.fascia, lineItems: items } };
    }

    case 'UPDATE_GUTTER':
      return { ...state, gutter: { ...state.gutter, ...action.payload } };

    case 'UPDATE_GUTTER_LINE_ITEM': {
      const items = state.gutter.lineItems.map((item, i) =>
        i === action.payload.index
          ? { ...item, [action.payload.field]: action.payload.value }
          : item
      );
      return { ...state, gutter: { ...state.gutter, lineItems: items } };
    }

    case 'UPDATE_PAYMENT':
      return { ...state, payment: { ...state.payment, ...action.payload } };

    case 'LOAD_PRICING': {
      const p = action.payload;
      return {
        ...state,
        roofing: {
          ...state.roofing,
          baseRatePerSQ: p.roofing?.baseRatePerSQ ?? state.roofing.baseRatePerSQ,
          autoAddons: p.roofing?.autoAddons
            ? {
                twoStory: { ...state.roofing.autoAddons.twoStory, rate: p.roofing.autoAddons.twoStory },
                pitch712: { ...state.roofing.autoAddons.pitch712, rate: p.roofing.autoAddons.pitch712 },
                pitch1012: { ...state.roofing.autoAddons.pitch1012, rate: p.roofing.autoAddons.pitch1012 },
                extraLayer: { ...state.roofing.autoAddons.extraLayer, rate: p.roofing.autoAddons.extraLayer },
              }
            : state.roofing.autoAddons,
          lineItems: state.roofing.lineItems.map((item) => {
            const saved = p.roofing?.lineItems?.find((x) => x.id === item.id);
            return saved ? { ...item, rate: saved.rate } : item;
          }),
        },
        siding: {
          ...state.siding,
          tiers: p.siding?.tiers
            ? state.siding.tiers.map((t) => {
                const saved = p.siding.tiers.find((x) => x.id === t.id);
                return saved ? { ...t, price: saved.price } : t;
              })
            : state.siding.tiers,
          tearOffRate: p.siding?.tearOffRate ?? state.siding.tearOffRate,
          lineItems: state.siding.lineItems.map((item) => {
            const saved = p.siding?.lineItems?.find((x) => x.id === item.id);
            return saved ? { ...item, rate: saved.rate } : item;
          }),
        },
        soffit: {
          ...state.soffit,
          lineItems: state.soffit.lineItems.map((item) => {
            const saved = p.soffit?.lineItems?.find((x) => x.id === item.id);
            return saved ? { ...item, rate: saved.rate } : item;
          }),
        },
        fascia: {
          ...state.fascia,
          lineItems: state.fascia.lineItems.map((item) => {
            const saved = p.fascia?.lineItems?.find((x) => x.id === item.id);
            return saved ? { ...item, rate: saved.rate } : item;
          }),
        },
        gutter: {
          ...state.gutter,
          lineItems: state.gutter.lineItems.map((item) => {
            const saved = p.gutter?.lineItems?.find((x) => x.id === item.id);
            return saved ? { ...item, rate: saved.rate } : item;
          }),
        },
      };
    }

    case 'RESET':
      return initialState;

    default:
      return state;
  }
}

// ─── SELECTORS ───────────────────────────────────────────────────────────────

export function selectRoofingTotal(state) {
  const sq = parseFloat(state.roofing.squares) || 0;
  const base = sq * (parseFloat(state.roofing.baseRatePerSQ) || 0);
  const auto = Object.values(state.roofing.autoAddons).reduce((sum, a) => {
    if (!a.enabled) return sum;
    const effectiveQty = a.qtyOverride !== '' && a.qtyOverride !== undefined
      ? parseFloat(a.qtyOverride) || 0
      : sq;
    return sum + effectiveQty * (parseFloat(a.rate) || 0);
  }, 0);
  const lines = state.roofing.lineItems.reduce((sum, item) => {
    return sum + (parseFloat(item.qty) || 0) * (parseFloat(item.rate) || 0);
  }, 0);
  return { base, addons: auto + lines, total: base + auto + lines };
}

export function selectSidingTotal(state) {
  const sq = parseFloat(state.siding.squares) || 0;
  const tier = state.siding.tiers.find((t) => t.id === state.siding.selectedTier);
  const base = sq * (parseFloat(tier?.price) || 0);
  const tearOff =
    (parseFloat(state.siding.tearOffSQ) || 0) * (parseFloat(state.siding.tearOffRate) || 0);
  const sidLines = state.siding.lineItems.reduce(
    (sum, item) => sum + (parseFloat(item.qty) || 0) * (parseFloat(item.rate) || 0),
    0
  );
  const sofLines = state.soffit.lineItems.reduce(
    (sum, item) => sum + (parseFloat(item.qty) || 0) * (parseFloat(item.rate) || 0),
    0
  );
  return { base, materials: tearOff + sidLines + sofLines, total: base + tearOff + sidLines + sofLines };
}

export function selectFasciaTotal(state) {
  return state.fascia.lineItems.reduce(
    (sum, item) => sum + (parseFloat(item.qty) || 0) * (parseFloat(item.rate) || 0),
    0
  );
}

export function selectGutterTotal(state) {
  return state.gutter.lineItems.reduce(
    (sum, item) => sum + (parseFloat(item.qty) || 0) * (parseFloat(item.rate) || 0),
    0
  );
}

export function selectGrandTotal(state) {
  return (
    selectRoofingTotal(state).total +
    selectSidingTotal(state).total +
    selectFasciaTotal(state) +
    selectGutterTotal(state)
  );
}

// ─── PROVIDER ────────────────────────────────────────────────────────────────

export function CalculationProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const updateProject = useCallback((payload) => dispatch({ type: 'UPDATE_PROJECT', payload }), []);
  const updateRoofing = useCallback((payload) => dispatch({ type: 'UPDATE_ROOFING', payload }), []);
  const updateRoofingAutoAddon = useCallback((key, field, value) =>
    dispatch({ type: 'UPDATE_ROOFING_AUTO_ADDON', payload: { key, field, value } }), []);
  const updateRoofingLineItem = useCallback((index, field, value) =>
    dispatch({ type: 'UPDATE_ROOFING_LINE_ITEM', payload: { index, field, value } }), []);
  const updateRoofingAccessory = useCallback((index, field, value) =>
    dispatch({ type: 'UPDATE_ROOFING_ACCESSORY', payload: { index, field, value } }), []);
  const updateSiding = useCallback((payload) => dispatch({ type: 'UPDATE_SIDING', payload }), []);
  const updateSidingTier = useCallback((id, price) =>
    dispatch({ type: 'UPDATE_SIDING_TIER', payload: { id, price } }), []);
  const updateSidingLineItem = useCallback((index, field, value) =>
    dispatch({ type: 'UPDATE_SIDING_LINE_ITEM', payload: { index, field, value } }), []);
  const updateSoffitLineItem = useCallback((index, field, value) =>
    dispatch({ type: 'UPDATE_SOFFIT_LINE_ITEM', payload: { index, field, value } }), []);
  const updateFascia = useCallback((payload) => dispatch({ type: 'UPDATE_FASCIA', payload }), []);
  const updateFasciaLineItem = useCallback((index, field, value) =>
    dispatch({ type: 'UPDATE_FASCIA_LINE_ITEM', payload: { index, field, value } }), []);
  const updateGutter = useCallback((payload) => dispatch({ type: 'UPDATE_GUTTER', payload }), []);
  const updateGutterLineItem = useCallback((index, field, value) =>
    dispatch({ type: 'UPDATE_GUTTER_LINE_ITEM', payload: { index, field, value } }), []);
  const updatePayment = useCallback((payload) => dispatch({ type: 'UPDATE_PAYMENT', payload }), []);
  const loadPricing = useCallback((payload) => dispatch({ type: 'LOAD_PRICING', payload }), []);
  const reset = useCallback(() => dispatch({ type: 'RESET' }), []);

  return (
    <CalculationContext.Provider
      value={{
        state,
        updateProject,
        updateRoofing,
        updateRoofingAutoAddon,
        updateRoofingLineItem,
        updateRoofingAccessory,
        updateSiding,
        updateSidingTier,
        updateSidingLineItem,
        updateSoffitLineItem,
        updateFascia,
        updateFasciaLineItem,
        updateGutter,
        updateGutterLineItem,
        updatePayment,
        loadPricing,
        reset,
        // selectors
        roofingTotal: selectRoofingTotal(state),
        sidingTotal: selectSidingTotal(state),
        fasciaTotal: selectFasciaTotal(state),
        gutterTotal: selectGutterTotal(state),
        grandTotal: selectGrandTotal(state),
      }}
    >
      {children}
    </CalculationContext.Provider>
  );
}

export function useCalculation() {
  const ctx = useContext(CalculationContext);
  if (!ctx) throw new Error('useCalculation must be used within CalculationProvider');
  return ctx;
}
