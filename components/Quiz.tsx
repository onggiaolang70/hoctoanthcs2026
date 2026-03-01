
import React from 'react';
import { generateQuiz } from '../services/geminiService';
import { Question } from '../types';
import { Brain, ArrowRight, CheckCircle, XCircle, Loader2, Trophy } from 'lucide-react';

const Quiz: React.FC = () => {
  const [grade, setGrade] = React.useState('10');
  const [topic, setTopic] = React.useState('Nguyên tử');
  const [questions, setQuestions] = React.useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [score, setScore] = React.useState(0);
  const [showResult, setShowResult] = React.useState(false);
  const [selectedOption, setSelectedOption] = React.useState<number | null>(null);
  const [isAnswered, setIsAnswered] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const startQuiz = async () => {
    setIsLoading(true);
    try {
      const data = await generateQuiz(grade, topic);
      setQuestions(data);
      setCurrentIndex(0);
      setScore(0);
      setShowResult(false);
      setSelectedOption(null);
      setIsAnswered(false);
    } catch (error) {
      alert('Không thể tải quiz. Hãy thử lại sau!');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswer = (index: number) => {
    if (isAnswered) return;
    setSelectedOption(index);
    setIsAnswered(true);
    // Fix: Using correctAnswerIndex instead of correctAnswer
    if (index === questions[currentIndex].correctAnswerIndex) {
      setScore(prev => prev + 1);
    }
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setShowResult(true);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-pulse">
        <Loader2 size={64} className="animate-spin text-indigo-500 mb-4" />
        <h3 className="text-xl font-bold text-slate-700">AI đang biên soạn đề thi cho bạn...</h3>
      </div>
    );
  }

  if (showResult) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-3xl shadow-2xl p-10 text-center space-y-6 animate-bounceIn">
        <div className="w-24 h-24 bg-yellow-100 text-yellow-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <Trophy size={48} />
        </div>
        <div>
          <h2 className="text-3xl font-black text-slate-800">Kết Quả</h2>
          <p className="text-slate-500">Bạn đã hoàn thành bài luyện tập chủ đề {topic}</p>
        </div>
        <div className="text-6xl font-black text-indigo-600">
          {score} / {questions.length}
        </div>
        <p className="text-slate-600 italic">
          {score === questions.length ? "Xuất sắc! Bạn là bậc thầy hóa học rồi đấy." : "Cố gắng lên nhé! Luyện tập nhiều sẽ giỏi thôi."}
        </p>
        <button 
          onClick={() => setQuestions([])}
          className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
        >
          Làm chủ đề khác
        </button>
      </div>
    );
  }

  if (questions.length > 0) {
    const q = questions[currentIndex];
    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
        <div className="flex items-center justify-between">
          <span className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-bold">
            Câu {currentIndex + 1} / {questions.length}
          </span>
          <div className="flex gap-1">
            {questions.map((_, i) => (
              <div 
                key={i} 
                className={`w-2 h-2 rounded-full ${i <= currentIndex ? 'bg-indigo-500' : 'bg-slate-200'}`} 
              />
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
          <h3 className="text-xl font-bold text-slate-800 mb-8 leading-relaxed">
            {/* Fix: Using questionText instead of question */}
            {q.questionText}
          </h3>

          <div className="space-y-4">
            {q.options?.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswer(idx)}
                disabled={isAnswered}
                className={`
                  w-full p-5 rounded-2xl border-2 text-left transition-all flex items-center justify-between group
                  ${!isAnswered ? 'border-slate-100 hover:border-indigo-400 hover:bg-indigo-50' : ''}
                  ${isAnswered && idx === q.correctAnswerIndex ? 'bg-green-50 border-green-500 text-green-800' : ''}
                  ${isAnswered && selectedOption === idx && idx !== q.correctAnswerIndex ? 'bg-red-50 border-red-500 text-red-800' : ''}
                  ${isAnswered && idx !== q.correctAnswerIndex && selectedOption !== idx ? 'opacity-40 grayscale border-slate-100' : ''}
                `}
              >
                <span className="font-medium text-lg">{opt}</span>
                {isAnswered && idx === q.correctAnswerIndex && <CheckCircle className="text-green-500" />}
                {isAnswered && selectedOption === idx && idx !== q.correctAnswerIndex && <XCircle className="text-red-500" />}
              </button>
            ))}
          </div>

          {isAnswered && (
            <div className="mt-8 p-6 bg-slate-50 rounded-2xl border border-slate-100 animate-slideUp">
              <h4 className="font-bold text-slate-800 mb-2">Giải thích:</h4>
              <p className="text-slate-600 text-sm leading-relaxed">{q.explanation}</p>
              <button 
                onClick={nextQuestion}
                className="mt-6 w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                {currentIndex === questions.length - 1 ? 'Xem kết quả' : 'Câu tiếp theo'}
                <ArrowRight size={20} />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fadeIn">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-slate-800">Luyện Tập Trắc Nghiệm</h2>
        <p className="text-slate-500 mt-2">Chọn khối lớp và chủ đề để AI tạo đề thi dành riêng cho bạn.</p>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-2xl border border-slate-100 space-y-8">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-slate-400 uppercase mb-2">Khối lớp</label>
            <div className="grid grid-cols-3 gap-2">
              {['10', '11', '12'].map(g => (
                <button
                  key={g}
                  onClick={() => setGrade(g)}
                  className={`py-3 rounded-xl font-bold transition-all ${grade === g ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-400 uppercase mb-2">Chủ đề</label>
            <select 
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full py-3 px-4 bg-slate-100 rounded-xl font-bold text-slate-600 outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option>Nguyên tử</option>
              <option>Bảng tuần hoàn</option>
              <option>Liên kết hóa học</option>
              <option>Phản ứng Oxi hóa - Khử</option>
              <option>Kim loại</option>
              <option>Phi kim</option>
              <option>Hữu cơ cơ bản</option>
            </select>
          </div>
        </div>

        <div className="p-6 bg-indigo-50 rounded-2xl border-2 border-dashed border-indigo-200 text-center">
          <Brain size={48} className="mx-auto text-indigo-400 mb-3" />
          <h4 className="font-bold text-indigo-800">Sẵn sàng thử thách chưa?</h4>
          <p className="text-indigo-600/70 text-sm mb-6">AI sẽ dựa vào chương trình chuẩn để tạo đề.</p>
          <button 
            onClick={startQuiz}
            className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-3"
          >
            Bắt đầu làm bài
          </button>
        </div>
      </div>
    </div>
  );
};

export default Quiz;
