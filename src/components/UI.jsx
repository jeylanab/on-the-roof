
import { fmt } from '../data/utils';

// ─── FIELD INPUT ─────────────────────────────────────────────────────────────

export function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] text-gray-500 uppercase tracking-wider font-medium">{label}</label>
      {children}
    </div>
  );
}

export function Input({ className = '', ...props }) {
  return (
    <input
      className={`bg-[#161616] border border-green-900/30 rounded-md text-gray-200 px-3 py-1.5 text-[13px] outline-none focus:border-green-400 transition-colors w-full ${className}`}
      {...props}
    />
  );
}

export function ReadonlyInput({ value, className = '' }) {
  return (
    <input
      readOnly
      value={value}
      className={`bg-[#0f0f0f] border border-green-900/20 rounded-md text-green-400 font-semibold px-3 py-1.5 text-[13px] outline-none w-full ${className}`}
    />
  );
}

export function Select({ children, className = '', ...props }) {
  return (
    <select
      className={`bg-[#161616] border border-green-900/30 rounded-md text-gray-200 px-3 py-1.5 text-[13px] outline-none focus:border-green-400 transition-colors w-full ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}

// ─── CARD ─────────────────────────────────────────────────────────────────────

export function Card({ children, className = '' }) {
  return (
    <div className={`bg-[#111] border border-green-900/20 rounded-lg p-4 mb-3 ${className}`}>
      {children}
    </div>
  );
}

export function CardTitle({ children }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="w-[3px] h-4 bg-green-400 rounded-sm" />
      <h2 className="font-['Rajdhani'] text-[15px] font-bold text-green-400 uppercase tracking-widest">
        {children}
      </h2>
    </div>
  );
}

// ─── SECTION SUBTITLE ─────────────────────────────────────────────────────────

export function SectionSub({ children }) {
  return (
    <p className="text-[11px] text-gray-500 uppercase tracking-wider font-medium mt-3 mb-2 pb-1 border-b border-green-900/20">
      {children}
    </p>
  );
}

// ─── LINE ITEM COLUMN HEADERS ─────────────────────────────────────────────────

// showColor adds a Color column between Qty and Total
export function AddonColHeaders({ showColor = false }) {
  const cols = showColor
    ? ['Item', 'Rate', 'Qty', 'Color', 'Total']
    : ['Item', 'Rate', 'Qty', 'Total'];
  const template = showColor ? '3fr 80px 70px 100px 80px' : '3fr 90px 80px 90px';
  return (
    <div className="grid gap-1.5 px-2 mb-1" style={{ gridTemplateColumns: template }}>
      {cols.map((c, i) => (
        <span key={i} className={`text-[10px] text-gray-600 uppercase tracking-wider ${i === 0 ? 'text-left' : 'text-right'}`}>
          {c}
        </span>
      ))}
    </div>
  );
}

// ─── ADDON ROW ────────────────────────────────────────────────────────────────

// showColor=true adds a text color input between qty and total (for production notes)
export function AddonRow({ label, unit, rate, qty, color, total, onRateChange, onQtyChange, onColorChange, showColor = false }) {
  const template = showColor ? '3fr 80px 70px 100px 80px' : '3fr 90px 80px 90px';
  return (
    <div className="grid gap-1.5 items-center px-2 py-1.5 bg-[#161616] border border-green-900/10 rounded-md mb-1" style={{ gridTemplateColumns: template }}>
      <span className="text-[12px] text-gray-300">
        {label} <span className="text-gray-600 text-[10px]">({unit})</span>
      </span>
  <span className="text-[12px] text-gray-500 text-right pr-1">
  ${Number(rate).toFixed(2)}
</span>
      <input
        type="number"
        value={qty}
        placeholder="0"
        onChange={(e) => onQtyChange(e.target.value)}
        className="bg-[#1c1c1c] border border-green-900/20 rounded text-gray-200 px-2 py-1 text-[12px] outline-none text-right focus:border-green-400 w-full"
      />
      {showColor && (
        <input
          type="text"
          value={color || ''}
          placeholder="Color..."
          onChange={(e) => onColorChange && onColorChange(e.target.value)}
          className="bg-[#1c1c1c] border border-green-900/20 rounded text-gray-300 px-2 py-1 text-[11px] outline-none focus:border-green-400 w-full placeholder:text-gray-700"
        />
      )}
      <span className="text-[12px] text-green-400 font-semibold text-right">{fmt(total)}</span>
    </div>
  );
}

// ─── TOTALS BAR ───────────────────────────────────────────────────────────────

export function TotalsBar({ items }) {
  return (
    <div className="bg-green-400/5 border border-green-400/25 rounded-lg px-4 py-3 grid gap-2.5" style={{ gridTemplateColumns: `repeat(${items.length}, 1fr)` }}>
      {items.map(({ label, value }) => (
        <div key={label} className="text-center">
          <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5">{label}</div>
          <div className="font-['Rajdhani'] text-xl font-bold text-green-400">{fmt(value)}</div>
        </div>
      ))}
    </div>
  );
}

// ─── BUTTONS ─────────────────────────────────────────────────────────────────

export function BtnPrimary({ children, onClick, className = '', disabled = false }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`bg-green-400 text-black border-none rounded-md px-5 py-2.5 font-['Rajdhani'] text-[14px] font-bold uppercase tracking-wider cursor-pointer hover:bg-green-300 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {children}
    </button>
  );
}

export function BtnOutline({ children, onClick, className = '' }) {
  return (
    <button
      onClick={onClick}
      className={`bg-transparent text-green-400 border border-green-400/40 rounded-md px-5 py-2.5 font-['Rajdhani'] text-[14px] font-bold uppercase tracking-wider cursor-pointer hover:bg-green-400/10 active:scale-95 transition-all ${className}`}
    >
      {children}
    </button>
  );
}
