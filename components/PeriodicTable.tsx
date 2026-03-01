
import React from 'react';
import { ELEMENTS, CATEGORY_COLORS } from '../constants';
import { Element } from '../types';
import { Info } from 'lucide-react';

const PeriodicTable: React.FC = () => {
  const [selectedElement, setSelectedElement] = React.useState<Element | null>(null);

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-800">Bảng Tuần Hoàn Các Nguyên Tố</h2>
        <p className="text-slate-500 mt-2">Khám phá thông tin chi tiết về các nguyên tố hóa học.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-8 gap-3">
        {ELEMENTS.map((el) => (
          <button
            key={el.number}
            onClick={() => setSelectedElement(el)}
            className={`
              p-3 border-2 rounded-xl transition-all hover:scale-105 flex flex-col items-center justify-center h-28
              ${CATEGORY_COLORS[el.category] || 'bg-white border-slate-200'}
              ${selectedElement?.number === el.number ? 'ring-4 ring-indigo-400 border-indigo-500 shadow-lg' : 'shadow-sm'}
            `}
          >
            <span className="text-xs font-bold opacity-60 self-start">{el.number}</span>
            <span className="text-2xl font-black">{el.symbol}</span>
            <span className="text-[10px] font-medium mt-1 truncate w-full text-center">{el.name}</span>
          </button>
        ))}
      </div>

      {selectedElement && (
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-slate-100 flex flex-col md:flex-row gap-8 animate-slideUp">
          <div className={`
            flex-shrink-0 w-32 h-32 md:w-48 md:h-48 rounded-2xl border-4 flex flex-col items-center justify-center
            ${CATEGORY_COLORS[selectedElement.category]}
          `}>
            <span className="text-xl font-bold opacity-70">{selectedElement.number}</span>
            <span className="text-6xl font-black">{selectedElement.symbol}</span>
            <span className="text-lg font-bold mt-2">{selectedElement.atomic_mass.toFixed(3)}</span>
          </div>

          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-3">
              <h3 className="text-3xl font-bold text-slate-800">{selectedElement.name}</h3>
              <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-sm font-semibold capitalize">
                {selectedElement.category}
              </span>
            </div>
            
            <p className="text-slate-600 leading-relaxed italic">
              {selectedElement.summary}
            </p>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase">Trạng thái (Phase)</span>
                <p className="font-semibold text-slate-700">{selectedElement.phase}</p>
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase">Khối lượng nguyên tử</span>
                <p className="font-semibold text-slate-700">{selectedElement.atomic_mass} u</p>
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase">Màu CPK</span>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded-full border border-slate-200" 
                    style={{ backgroundColor: `#${selectedElement.cpk_hex || 'cccccc'}` }}
                  />
                  <p className="font-semibold text-slate-700 uppercase">#{selectedElement.cpk_hex || 'N/A'}</p>
                </div>
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase">Bề ngoài</span>
                <p className="font-semibold text-slate-700">{selectedElement.appearance || 'Không xác định'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {!selectedElement && (
        <div className="flex flex-col items-center justify-center p-12 bg-slate-100 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400">
          <Info size={48} className="mb-4 opacity-50" />
          <p className="text-lg font-medium">Chọn một nguyên tố để xem chi tiết</p>
        </div>
      )}
    </div>
  );
};

export default PeriodicTable;
