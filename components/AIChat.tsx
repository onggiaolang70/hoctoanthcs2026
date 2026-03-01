
import React from 'react';
import { getChemistryExplanation } from '../services/geminiService';
import { ChatMessage } from '../types';
import { Send, User, Bot, Loader2, RefreshCcw } from 'lucide-react';

const AIChat: React.FC = () => {
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [input, setInput] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await getChemistryExplanation(input);
      const botMsg: ChatMessage = { role: 'model', text: response };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: 'Xin lỗi, tớ đang gặp chút rắc rối kỹ thuật. Thử lại sau nhé!' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-200px)] flex flex-col bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden animate-fadeIn">
      {/* Chat Header */}
      <div className="p-4 bg-indigo-600 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-400 flex items-center justify-center">
            <Bot size={24} />
          </div>
          <div>
            <h3 className="font-bold">Trợ Lý Hóa Học Pro</h3>
            <p className="text-xs text-indigo-200">Sẵn sàng giải đáp mọi thắc mắc của bạn</p>
          </div>
        </div>
        <button 
          onClick={() => setMessages([])} 
          className="p-2 hover:bg-indigo-500 rounded-lg transition-colors"
          title="Xóa cuộc hội thoại"
        >
          <RefreshCcw size={20} />
        </button>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50"
      >
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4 text-center px-8">
            <Bot size={64} className="opacity-20" />
            <p className="text-lg">Chào bạn! Mình là trợ lý AI chuyên về Hóa học.<br/>Hãy đặt câu hỏi bất kỳ về chương trình THPT nhé.</p>
            <div className="flex flex-wrap justify-center gap-2">
              {['Axit sunfuric có tính chất gì?', 'Tại sao đồng dẫn điện tốt?', 'Cấu hình electron của Fe'].map(q => (
                <button 
                  key={q}
                  onClick={() => setInput(q)}
                  className="px-4 py-2 bg-white border border-slate-200 rounded-full text-sm text-indigo-600 hover:border-indigo-300 transition-all shadow-sm"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div 
            key={i} 
            className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`
              flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
              ${msg.role === 'user' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-600'}
            `}>
              {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
            </div>
            <div className={`
              max-w-[80%] p-4 rounded-2xl shadow-sm text-sm leading-relaxed
              ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'}
            `}>
              {msg.text}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600">
              <Bot size={20} />
            </div>
            <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm flex items-center gap-3">
              <Loader2 className="animate-spin text-indigo-600" size={18} />
              <span className="text-sm text-slate-500 italic">Đang suy nghĩ...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-100">
        <div className="flex gap-3 relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Nhập câu hỏi của bạn tại đây..."
            className="flex-1 px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-indigo-500 outline-none transition-all resize-none max-h-32 min-h-[50px]"
            rows={1}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="flex-shrink-0 w-12 h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:bg-indigo-700 disabled:bg-slate-300 transition-all shadow-md active:scale-95"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
