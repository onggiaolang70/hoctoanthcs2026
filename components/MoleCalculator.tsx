
import React from 'react';
import { Calculator, ArrowRightLeft } from 'lucide-react';

const MoleCalculator: React.FC = () => {
  const [mass, setMass] = React.useState('');
  const [molarMass, setMolarMass] = React.useState('');
  const [moles, setMoles] = React.useState('');
  const [volume, setVolume] = React.useState('');

  const calculateFromMass = () => {
    const m = parseFloat(mass);
    const M = parseFloat(molarMass);
    if (!isNaN(m) && !isNaN(M) && M !== 0) {
      const n = m / M;
      setMoles(n.toFixed(4));
      setVolume((n * 22.4).toFixed(4));
    }
  };

  const calculateFromMoles = () => {
    const n = parseFloat(moles);
    const M = parseFloat(molarMass);
    if (!isNaN(n) && !isNaN(M)) {
      setMass((n * M).toFixed(4));
      setVolume((n * 22.4).toFixed(4));
    }
  };

  const clear = () => {
    setMass('');
    setMoles('');
    setVolume('');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fadeIn">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-slate-800">Máy Tính Hóa Học</h2>
        <p className="text-slate-500 mt-2">Chuyển đổi giữa Khối lượng, Số mol và Thể tích khí (đkc).</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-100 space-y-4">
          <div className="flex items-center gap-2 mb-4 text-indigo-600">
            <Calculator size={24} />
            <h3 className="font-bold text-lg">Thông số đầu vào</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Khối lượng mol (M - g/mol)</label>
              <input
                type="number"
                value={molarMass}
                onChange={(e) => setMolarMass(e.target.value)}
                placeholder="Ví dụ: 56 (Sắt)"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>
            
            <div className="relative flex items-center gap-4">
              <div className="flex-1">
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Khối lượng (m - gam)</label>
                <input
                  type="number"
                  value={mass}
                  onChange={(e) => setMass(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
              <button 
                onClick={calculateFromMass}
                className="mt-5 p-3 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200 transition-colors"
              >
                <ArrowRightLeft size={20} />
              </button>
            </div>

            <div className="relative flex items-center gap-4">
              <div className="flex-1">
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Số mol (n - mol)</label>
                <input
                  type="number"
                  value={moles}
                  onChange={(e) => setMoles(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
              <button 
                onClick={calculateFromMoles}
                className="mt-5 p-3 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200 transition-colors"
              >
                <ArrowRightLeft size={20} />
              </button>
            </div>
          </div>

          <button 
            onClick={clear}
            className="w-full py-2 text-slate-400 font-medium hover:text-slate-600 transition-colors"
          >
            Xóa trắng
          </button>
        </div>

        <div className="bg-indigo-900 text-white p-8 rounded-2xl shadow-xl flex flex-col justify-center space-y-8">
          <div>
            <span className="text-indigo-300 text-sm font-bold uppercase tracking-widest">Kết quả tính toán</span>
            <div className="mt-6 space-y-6">
              <div>
                <span className="text-indigo-400 text-xs font-bold block mb-1">SỐ MOL</span>
                <p className="text-4xl font-black text-white">{moles || '0.0000'} <span className="text-xl font-normal opacity-50">mol</span></p>
              </div>
              <div>
                <span className="text-indigo-400 text-xs font-bold block mb-1">KHỐI LƯỢNG</span>
                <p className="text-4xl font-black text-white">{mass || '0.0000'} <span className="text-xl font-normal opacity-50">gam</span></p>
              </div>
              <div>
                <span className="text-indigo-400 text-xs font-bold block mb-1">THỂ TÍCH KHÍ (ĐKC)</span>
                <p className="text-4xl font-black text-white">{volume || '0.0000'} <span className="text-xl font-normal opacity-50">Lít</span></p>
              </div>
            </div>
          </div>
          
          <div className="pt-6 border-t border-indigo-800">
            <p className="text-xs text-indigo-400 leading-relaxed italic">
              Công thức áp dụng:<br/>
              n = m / M | V = n * 22.4 (ở đkc 0°C, 1 atm)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoleCalculator;
