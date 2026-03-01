
import React from 'react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] text-brand-900 animate-fadeIn">
      <div className="relative mb-10">
        <div className="w-24 h-24 border-8 border-brand-100 border-t-brand-600 rounded-full animate-spin"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-brand-50 rounded-full flex items-center justify-center">
           <div className="w-3 h-3 bg-brand-600 rounded-full animate-ping"></div>
        </div>
      </div>
      <h2 className="text-3xl font-black mb-4 uppercase tracking-widest">Đang khởi tạo đề thi</h2>
      <p className="text-brand-600 font-medium text-lg text-center max-w-md leading-relaxed px-6">
        Gemini AI đang tổng hợp kiến thức và soạn thảo các câu hỏi Toán học tối ưu dành riêng cho bạn.
      </p>
      <div className="mt-8 flex gap-2">
        <div className="w-3 h-3 bg-brand-200 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-3 h-3 bg-brand-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-3 h-3 bg-brand-600 rounded-full animate-bounce"></div>
      </div>
    </div>
  );
};

export default LoadingScreen;
