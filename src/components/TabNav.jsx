import { useState, useRef, useEffect } from 'react';

const TABS = [
  { label: 'Roofing',         index: 0 },
  { label: 'Siding / Soffit', index: 1 },
  { label: 'Fascia / Gutter', index: 2 },
  { label: 'Summary',         index: 3 },
  { label: 'Work Order',      index: 4 },
  { label: 'Admin',           index: 5 },
];

const ADMIN_PASSWORD = 'otrc2024';

function AdminModal({ onSuccess, onClose }) {
  const [value, setValue] = useState('');
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);
  const [show,  setShow]  = useState(false);
  const inputRef          = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleSubmit = () => {
    if (value === ADMIN_PASSWORD) {
      onSuccess();
    } else {
      setError(true);
      setShake(true);
      setValue('');
      setTimeout(() => setShake(false), 500);
      inputRef.current?.focus();
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter')  handleSubmit();
    if (e.key === 'Escape') onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ animation: shake ? 'shake 0.4s ease' : undefined }}
        className="relative bg-[#111] border border-green-900/30 rounded-xl p-7 w-[340px] shadow-2xl"
      >
        {/* Lock icon */}
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 rounded-full bg-green-400/10 border border-green-900/30 flex items-center justify-center">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-5">
          <div className="font-['Rajdhani'] text-[18px] font-bold text-green-400 uppercase tracking-widest">
            Admin Access
          </div>
          <div className="text-[12px] text-gray-500 mt-1">
            Enter your password to continue
          </div>
        </div>

        {/* Input */}
        <div className="relative">
          <input
            ref={inputRef}
            type={show ? 'text' : 'password'}
            value={value}
            onChange={(e) => { setValue(e.target.value); setError(false); }}
            onKeyDown={handleKey}
            placeholder="Password"
            className={`w-full bg-[#161616] rounded-lg px-4 py-3 text-[14px] text-gray-200 outline-none border transition-all pr-11
              ${error
                ? 'border-red-500 placeholder:text-red-900'
                : 'border-green-900/30 focus:border-green-400 placeholder:text-gray-700'
              }`}
          />
          <button
            type="button"
            onClick={() => setShow(s => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400 transition-colors"
          >
            {show ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            )}
          </button>
        </div>

        {/* Error */}
        <div className={`text-[11px] text-red-400 mt-2 text-center transition-opacity duration-200 ${error ? 'opacity-100' : 'opacity-0'}`}>
          Incorrect password. Try again.
        </div>

        {/* Buttons */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg border border-green-900/20 text-gray-500 text-[13px] font-['Rajdhani'] font-semibold uppercase tracking-wider hover:text-gray-300 hover:border-green-900/40 transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 py-2.5 rounded-lg bg-green-400 text-black text-[13px] font-['Rajdhani'] font-semibold uppercase tracking-wider hover:bg-green-300 active:scale-95 transition-all cursor-pointer"
          >
            Unlock
          </button>
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          20%      { transform: translateX(-8px); }
          40%      { transform: translateX(8px); }
          60%      { transform: translateX(-5px); }
          80%      { transform: translateX(5px); }
        }
      `}</style>
    </div>
  );
}

export default function TabNav({ activeTab, onTabChange }) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      {showModal && (
        <AdminModal
          onSuccess={() => { setShowModal(false); onTabChange(5); }}
          onClose={() => setShowModal(false)}
        />
      )}

      <div className="flex gap-1 mb-3">
        {TABS.map(({ label, index }) => (
          <button
            key={index}
            onClick={() => index === 5 ? setShowModal(true) : onTabChange(index)}
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
    </>
  );
}
