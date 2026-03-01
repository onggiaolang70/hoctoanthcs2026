
import React from 'react';
import { balanceEquation } from '../services/geminiService';
import { Send, Loader2, Sparkles } from 'lucide-react';

const EquationBalancer: React.FC = () => {
  const [input, setInput] = React.useState('');
  const [result, setResult] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  const handleBalance = async () => {
    if (!input.trim()) return;
    setIsLoading(true);
    try {
      const balanced = await balanceEquation(input);
      setResult(balanced);
    } catch (error) {
      setResult('Đã có lỗi xảy ra. Vui lòng kiểm tra lại phương trình.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fadeIn">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-slate-800">Cân Bằng Phương Trình</h2>
        <p className="text-slate-500 mt-2">Nhập các chất phản ứng và sản phẩm để AI cân bằng giúp bạn.</p>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 space-y-6">
        <div>
          <label className="block text-sm font-bold text-slate-500 uppercase mb-2">Nhập phương trình</label>
          <div className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ví dụ: Fe + O2 -> Fe2O3"
              className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all text-lg font-medium"
            />
            <button
              onClick={handleBalance}
              disabled={isLoading || !input}
              className="absolute right-2 top-2 bottom-2 px-6 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2 shadow-md"
            >
              {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
              <span className="hidden sm:inline">Cân bằng</span>
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-3 flex items-center gap-1">
            <Sparkles size={12} /> Dùng AI để đảm bảo tính chính xác cao nhất.
          </p>
        </div>

        {result && (
          <div className="p-6 bg-indigo-50 rounded-xl border border-indigo-100 animate-slideUp">
            <h4 className="text-indigo-800 font-bold mb-3 flex items-center gap-2">
              <Sparkles size={18} /> Kết quả AI:
            </h4>
            <div className="prose prose-indigo max-w-none text-indigo-900 whitespace-pre-wrap leading-relaxed">
              {result}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-100">
          <h5 className="font-bold text-slate-700 mb-1">Mẹo nhỏ 1</h5>
          <p className="text-sm text-slate-500">Viết hoa các chữ cái đầu của nguyên tố (Fe, O, H, Cl...).</p>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-100">
          <h5 className="font-bold text-slate-700 mb-1">Mẹo nhỏ 2</h5>
          <p className="text-sm text-slate-500">Sử dụng dấu "->" hoặc "=" để phân cách phản ứng và sản phẩm.</p>
        </div>
      </div>
    </div>
  );
};

export default EquationBalancer;
