const TABS = [
  { label: 'Roofing', index: 0 },
  { label: 'Siding / Soffit', index: 1 },
  { label: 'Fascia / Gutter', index: 2 },
  { label: 'Summary', index: 3 },
  { label: 'Work Order', index: 4 },
  { label: 'Admin', index: 5 },
];

export default function TabNav({ activeTab, onTabChange }) {
  return (
    <div className="flex gap-1 mb-3">
      {TABS.map(({ label, index }) => (
        <button
          key={index}
          onClick={() => onTabChange(index)}
          className={`flex-1 py-2 px-1 rounded-md font-['Rajdhani'] text-[13px] font-semibold uppercase tracking-wider border transition-all cursor-pointer
            ${activeTab === index
              ? 'bg-green-400/10 border-green-400 text-green-400'
              : 'bg-[#111] border-green-900/20 text-gray-500 hover:border-green-900/40 hover:text-gray-300'
            }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}