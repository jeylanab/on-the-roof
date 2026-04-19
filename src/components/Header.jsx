import logo from "../assets/logo.png";

export default function Header() {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 sm:px-6 py-3 bg-[#0f0f0f] border border-green-900/20 rounded-xl mb-4 shadow-md gap-2">
      
      {/* Left Section */}
      <div className="flex items-center gap-3">
        
        {/* Bigger Responsive Logo */}
     <img
  src={logo}
  alt="OTRC Logo"
  className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 object-contain"
/>

        {/* Text */}
        <div>
          <div className="font-['Rajdhani'] text-base sm:text-lg md:text-xl font-bold text-green-400 tracking-widest uppercase leading-tight">
            OTRC
          </div>

          <div className="text-[10px] sm:text-[11px] text-gray-500 tracking-widest uppercase mt-0.5">
            Sales Bid Calculator — Field Edition
          </div>
        </div>
      </div>

      {/* Right Section (Date) */}
      <div className="text-left sm:text-right text-[10px] sm:text-[11px] text-gray-400">
        {today}
      </div>
    </div>
  );
}