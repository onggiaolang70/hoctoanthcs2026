import React, { useState, useEffect, useCallback, useRef } from 'react';
import { generateMathQuestions } from './services/geminiService';
import { Difficulty, Grade, Question, QuizConfig, QuizState, QuestionType, UserAnswer } from './types';
import MathRenderer from './components/MathRenderer';
import LoadingScreen from './components/LoadingScreen';
import { 
  BookOpen, 
  CheckCircle, 
  XCircle, 
  Award,
  RefreshCw,
  ChevronRight,
  ChevronLeft,
  AlertOctagon,
  CheckSquare
} from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<'setup' | 'loading' | 'quiz' | 'summary'>('setup');
  
  const [config, setConfig] = useState<QuizConfig>({
    grade: Grade.NINE,
    topic: 'Phương trình bậc hai',
    difficulty: Difficulty.MEDIUM,
    questionCount: 5,
    questionType: 'MIXED'
  });

  const [quizState, setQuizState] = useState<QuizState>({
    questions: [],
    userAnswers: [],
    currentQuestionIndex: 0,
    isComplete: false,
    score: 0,
    warnings: 0,
    startTime: 0,
    submissionReason: 'normal'
  });
  
  const timerRef = useRef<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  const handleStartQuiz = async () => {
    setView('loading');
    try {
      const questions = await generateMathQuestions(
        config.grade,
        config.topic,
        config.difficulty,
        config.questionCount,
        config.questionType
      );
      
      const initialAnswers = questions.map(q => {
        if (q.type === QuestionType.TRUE_FALSE) {
          return [undefined, undefined, undefined, undefined] as any;
        }
        return -1; 
      });

      setQuizState({
        questions,
        userAnswers: initialAnswers,
        currentQuestionIndex: 0,
        isComplete: false,
        score: 0,
        warnings: 0,
        startTime: Date.now(),
        submissionReason: 'normal'
      });
      setElapsedTime(0);
      setView('quiz');
    } catch (error) {
      alert("Có lỗi xảy ra khi tạo câu hỏi. Vui lòng thử lại.");
      setView('setup');
    }
  };

  const handleMCSelect = (optionIndex: number) => {
    if (quizState.isComplete) return;
    setQuizState(prev => {
      const newAnswers = [...prev.userAnswers];
      newAnswers[prev.currentQuestionIndex] = optionIndex;
      return { ...prev, userAnswers: newAnswers };
    });
  };

  const handleTFSelect = (propIndex: number, value: boolean) => {
    if (quizState.isComplete) return;
    setQuizState(prev => {
      const newAnswers = [...prev.userAnswers];
      const currentAns = newAnswers[prev.currentQuestionIndex] as boolean[] || [undefined, undefined, undefined, undefined];
      const updatedTF = [...currentAns];
      updatedTF[propIndex] = value;
      newAnswers[prev.currentQuestionIndex] = updatedTF;
      return { ...prev, userAnswers: newAnswers };
    });
  };

  const handleNextQuestion = () => {
    if (quizState.currentQuestionIndex < quizState.questions.length - 1) {
      setQuizState(prev => ({ ...prev, currentQuestionIndex: prev.currentQuestionIndex + 1 }));
    } else {
      finishQuiz('normal');
    }
  };

  const handlePrevQuestion = () => {
    if (quizState.currentQuestionIndex > 0) {
      setQuizState(prev => ({ ...prev, currentQuestionIndex: prev.currentQuestionIndex - 1 }));
    }
  };

  const finishQuiz = useCallback((reason: 'normal' | 'cheat' = 'normal') => {
    setQuizState(prev => {
      let totalPoints = 0;
      const maxPossiblePoints = prev.questions.length; 

      prev.questions.forEach((q, idx) => {
        const ans = prev.userAnswers[idx];
        if (q.type === QuestionType.MULTIPLE_CHOICE) {
          if (ans === q.correctAnswerIndex) {
            totalPoints += 1;
          }
        } else if (q.type === QuestionType.TRUE_FALSE) {
          const userTF = ans as boolean[];
          const correctTF = q.correctAnswersTF || [];
          let correctProps = 0;
          if (Array.isArray(userTF)) {
             userTF.forEach((val, i) => {
               if (val === correctTF[i]) correctProps++;
             });
          }
          totalPoints += (correctProps * 0.25);
        }
      });
      
      const finalScore = (totalPoints / maxPossiblePoints) * 10;

      return {
        ...prev,
        isComplete: true,
        score: parseFloat(finalScore.toFixed(2)),
        endTime: Date.now(),
        submissionReason: reason
      };
    });
    setView('summary');
  }, []);

  const resetApp = () => {
    setView('setup');
  };

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && view === 'quiz') {
        finishQuiz('cheat');
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [view, finishQuiz]);

  useEffect(() => {
    if (view === 'quiz' && !quizState.isComplete) {
      timerRef.current = window.setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) window.clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [view, quizState.isComplete]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const renderSetup = () => (
    <div className="max-w-xl mx-auto bg-[#1E6F63]/40 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/10">
      <div className="text-center mb-10">
        <div className="bg-[#2FD3A7]/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 rotate-3 shadow-lg border border-[#2FD3A7]/30">
          <BookOpen className="text-[#2FD3A7] w-8 h-8" />
        </div>
        
        {/* 1. Tiêu đề nhỏ lại trên 1 dòng & Bỏ chữ Trực tuyến */}
        <h1 className="text-3xl md:text-4xl font-[900] tracking-tighter leading-none uppercase italic text-white whitespace-nowrap overflow-hidden">
          HỌC TOÁN THCS
        </h1>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-bold text-white/70 mb-3 uppercase tracking-wider">Khối Lớp</label>
          <div className="grid grid-cols-4 gap-3">
            {Object.values(Grade).map((g) => (
              <button
                key={g}
                onClick={() => setConfig({ ...config, grade: g })}
                className={`py-3 rounded-xl border-2 font-black transition-all ${
                  config.grade === g 
                  ? 'bg-[#2FD3A7] text-[#176A5D] border-[#2FD3A7] shadow-lg shadow-[#2FD3A7]/20 scale-105' 
                  : 'bg-[#176A5D]/50 text-white border-white/10 hover:border-[#2FD3A7]/50'
                }`}
              >
                Lớp {g}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-white/70 mb-3 uppercase tracking-wider">Chủ đề bài học</label>
          <input
            type="text"
            value={config.topic}
            onChange={(e) => setConfig({ ...config, topic: e.target.value })}
            placeholder="Ví dụ: Phương trình bậc hai..."
            className="w-full px-5 py-4 bg-[#176A5D]/50 border-2 border-white/10 rounded-xl text-white placeholder:text-white/30 focus:border-[#2FD3A7] outline-none transition-all font-medium"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-white/70 mb-3 uppercase tracking-wider">Độ khó</label>
            <select
              value={config.difficulty}
              onChange={(e) => setConfig({ ...config, difficulty: e.target.value as Difficulty })}
              className="w-full px-5 py-4 bg-[#176A5D]/50 border-2 border-white/10 rounded-xl text-white focus:border-[#2FD3A7] outline-none font-medium appearance-none"
            >
              {Object.values(Difficulty).map(d => <option key={d} value={d} className="bg-[#176A5D]">{d}</option>)}
            </select>
          </div>
          <div>
             <label className="block text-sm font-bold text-white/70 mb-3 uppercase tracking-wider">Loại câu hỏi</label>
             <select
                value={config.questionType}
                onChange={(e) => setConfig({ ...config, questionType: e.target.value as any })}
                className="w-full px-5 py-4 bg-[#176A5D]/50 border-2 border-white/10 rounded-xl text-white focus:border-[#2FD3A7] outline-none font-medium appearance-none"
             >
               <option value="MIXED" className="bg-[#176A5D]">Ngẫu nhiên</option>
               <option value={QuestionType.MULTIPLE_CHOICE} className="bg-[#176A5D]">Trắc nghiệm</option>
               <option value={QuestionType.TRUE_FALSE} className="bg-[#176A5D]">Đúng/Sai</option>
             </select>
          </div>
        </div>

        <button
          onClick={handleStartQuiz}
          disabled={!config.topic.trim()}
          className="w-full bg-[#2FD3A7] text-[#176A5D] py-5 rounded-2xl font-black text-xl hover:bg-[#26b18c] transition-all active:scale-[0.98] shadow-xl shadow-[#2FD3A7]/20 mt-4 uppercase tracking-widest"
        >
          Bắt đầu ôn luyện
        </button>
      </div>
    </div>
  );

  const renderMCQuestion = (q: Question) => {
    const selected = quizState.userAnswers[quizState.currentQuestionIndex] as number;
    const labels = ['A', 'B', 'C', 'D'];
    
    return (
      <div className="space-y-4">
        {q.options?.map((option, idx) => {
          const isSelected = selected === idx;
          return (
            <button
              key={idx}
              onClick={() => handleMCSelect(idx)}
              className={`w-full text-left p-6 rounded-2xl border-2 transition-all duration-200 flex items-center group
                ${isSelected 
                  ? 'border-[#2FD3A7] bg-[#2FD3A7]/10 shadow-lg shadow-[#2FD3A7]/5' 
                  : 'border-white/10 bg-[#176A5D]/30 hover:border-white/30 hover:bg-[#176A5D]/50'
                }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-5 border-2 font-black text-xl transition-all shrink-0
                ${isSelected ? 'bg-[#2FD3A7] text-[#176A5D] border-[#2FD3A7] shadow-md' : 'bg-[#176A5D] text-white/40 border-white/10 group-hover:text-white group-hover:border-white/30'}`}>
                {labels[idx]}
              </div>
              <div className="text-white flex-1 font-medium">
                 <MathRenderer content={option} className="inline text-lg" />
              </div>
            </button>
          );
        })}
      </div>
    );
  };

  const renderTFQuestion = (q: Question) => {
    const currentAns = (quizState.userAnswers[quizState.currentQuestionIndex] as boolean[]) || [undefined, undefined, undefined, undefined];
    const labels = ['a', 'b', 'c', 'd'];

    return (
      <div className="bg-[#176A5D]/30 rounded-2xl border-2 border-white/10 overflow-hidden">
        <div className="grid grid-cols-12 bg-white/5 p-4 font-black text-white/40 border-b border-white/10 uppercase text-xs tracking-widest">
          <div className="col-span-8 pl-4">Các mệnh đề</div>
          <div className="col-span-2 text-center">Đúng</div>
          <div className="col-span-2 text-center">Sai</div>
        </div>
        {q.propositions?.map((prop, idx) => (
           <div key={idx} className={`grid grid-cols-12 p-5 items-center border-b border-white/10 last:border-0 transition-colors ${idx % 2 === 0 ? 'bg-transparent' : 'bg-white/5'}`}>
             <div className="col-span-8 flex items-start pr-4">
                <span className="font-black mr-3 bg-white/10 text-white/80 rounded-lg px-2 text-sm h-7 flex items-center shrink-0 uppercase">{labels[idx]}</span>
                <MathRenderer content={prop} className="text-white text-lg font-medium" />
             </div>
             
             <div className="col-span-2 flex justify-center">
                <button
                  onClick={() => handleTFSelect(idx, true)}
                  className={`w-12 h-12 rounded-xl flex items-center justify-center border-2 transition-all
                    ${currentAns[idx] === true 
                      ? 'bg-[#2FD3A7] border-[#2FD3A7] text-[#176A5D] shadow-lg shadow-[#2FD3A7]/20' 
                      : 'border-white/10 bg-[#176A5D] text-white/20 hover:border-[#2FD3A7]/50 hover:text-[#2FD3A7]'}`}
                >
                  <CheckSquare className="w-6 h-6" />
                </button>
             </div>
             
             <div className="col-span-2 flex justify-center">
               <button
                  onClick={() => handleTFSelect(idx, false)}
                  className={`w-12 h-12 rounded-xl flex items-center justify-center border-2 transition-all
                    ${currentAns[idx] === false 
                      ? 'bg-red-500 border-red-500 text-white shadow-lg shadow-red-500/20' 
                      : 'border-white/10 bg-[#176A5D] text-white/20 hover:border-red-500/50 hover:text-red-500'}`}
                >
                  <XCircle className="w-6 h-6" />
                </button>
             </div>
           </div>
        ))}
      </div>
    );
  };

  const renderQuiz = () => {
    const currentQ = quizState.questions[quizState.currentQuestionIndex];
    const isLast = quizState.currentQuestionIndex === quizState.questions.length - 1;
    
    const answeredCount = quizState.userAnswers.filter(a => {
        if (Array.isArray(a)) return a.some(v => v !== undefined);
        return a !== -1;
    }).length;
    const progress = (answeredCount / quizState.questions.length) * 100;

    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-[#176A5D]/80 backdrop-blur-md p-5 rounded-2xl shadow-xl mb-8 flex justify-between items-center sticky top-6 z-10 border border-white/10">
           <div className="flex items-center gap-6">
             <div className="flex flex-col">
               <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Thời gian</span>
               <span className="text-2xl font-mono text-[#2FD3A7] font-black">{formatTime(elapsedTime)}</span>
             </div>
             <div className="h-10 w-px bg-white/10"></div>
             <span className="text-xs font-black text-white/60 uppercase tracking-widest hidden md:block">
               {currentQ.type === QuestionType.TRUE_FALSE ? 'Kiểm tra Đúng/Sai' : 'Trắc nghiệm'}
             </span>
           </div>
           <span className="text-lg font-black text-white bg-[#1E6F63] px-4 py-2 rounded-xl border border-white/10 shadow-inner">
             CÂU {quizState.currentQuestionIndex + 1} / {quizState.questions.length}
           </span>
        </div>

        <div className="w-full bg-black/20 rounded-full h-3 mb-8 overflow-hidden border border-white/5 shadow-inner">
          <div className="bg-[#2FD3A7] h-full rounded-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(47,211,167,0.5)]" style={{ width: `${progress}%` }}></div>
        </div>

        <div className="bg-[#1E6F63]/30 backdrop-blur-sm p-10 rounded-[2.5rem] shadow-2xl mb-10 border border-white/10">
           <div className="mb-8">
              <span className="bg-[#2FD3A7]/10 text-[#2FD3A7] text-xs font-black px-4 py-2 rounded-xl mr-4 align-middle inline-block mb-3 uppercase tracking-widest border border-[#2FD3A7]/20 shadow-sm">
                Đề bài
              </span>
              <MathRenderer content={currentQ.questionText} className="text-2xl font-bold text-white leading-relaxed block" />
           </div>

           {currentQ.type === QuestionType.MULTIPLE_CHOICE 
             ? renderMCQuestion(currentQ) 
             : renderTFQuestion(currentQ)
           }
        </div>

        <div className="flex justify-between items-center gap-4">
          <button
            onClick={handlePrevQuestion}
            disabled={quizState.currentQuestionIndex === 0}
            className="flex items-center px-8 py-4 rounded-2xl font-bold text-white/40 bg-[#176A5D] border-2 border-white/10 hover:bg-[#1E6F63] disabled:opacity-20 transition-all hover:text-white"
          >
            <ChevronLeft className="w-6 h-6 mr-2" /> Quay lại
          </button>

          {isLast ? (
            <button
              onClick={() => finishQuiz('normal')}
              className="flex items-center px-12 py-5 rounded-2xl font-black text-xl text-[#176A5D] bg-[#2FD3A7] shadow-2xl shadow-[#2FD3A7]/20 hover:bg-[#26b18c] hover:-translate-y-1 transition-all uppercase tracking-widest"
            >
              Nộp bài <CheckCircle className="w-6 h-6 ml-3" />
            </button>
          ) : (
             <button
              onClick={handleNextQuestion}
              className="flex items-center px-10 py-4 rounded-2xl font-bold text-[#176A5D] bg-[#2FD3A7] hover:bg-[#26b18c] transition-all shadow-lg shadow-[#2FD3A7]/20"
            >
              Kế tiếp <ChevronRight className="w-6 h-6 ml-2" />
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderSummary = () => {
    const isPerfect = quizState.score === 10;
    return (
      <div className="max-w-4xl mx-auto bg-[#176A5D] rounded-[3rem] shadow-2xl overflow-hidden border border-white/10 animate-slideUp">
        {quizState.submissionReason === 'cheat' && (
           <div className="bg-red-600 text-white p-5 flex items-center justify-center gap-4">
             <AlertOctagon className="w-10 h-10 animate-bounce" />
             <div className="text-center">
               <h3 className="font-black text-xl uppercase tracking-widest">PHÁT HIỆN GIAN LẬN!</h3>
             </div>
           </div>
        )}
        <div className="bg-gradient-to-br from-[#1E6F63] to-[#176A5D] p-12 text-center text-white relative overflow-hidden border-b border-white/10 shadow-lg">
          <div className="relative z-10">
            <div className="inline-flex items-center justify-center w-32 h-32 bg-white/5 backdrop-blur-md rounded-full mb-6 border-4 border-white/10 shadow-xl">
               <Award className={`w-16 h-16 ${isPerfect ? 'text-[#2FD3A7]' : 'text-white'}`} />
            </div>
            <div className="text-8xl font-black mb-4 drop-shadow-lg bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40">
                {quizState.score}<span className="text-3xl opacity-30">/10</span>
            </div>
            <p className="text-xl font-bold opacity-60 uppercase tracking-[0.3em]">Kết quả ôn luyện</p>
          </div>
        </div>

        <div className="p-10 space-y-10 bg-black/5">
           <button onClick={resetApp} className="w-full py-6 bg-[#2FD3A7] text-[#176A5D] rounded-[2rem] font-black text-xl hover:bg-[#26b18c] flex items-center justify-center gap-3 shadow-2xl shadow-[#2FD3A7]/20 transition-all active:scale-95 uppercase tracking-widest">
             <RefreshCw className="w-6 h-6"/> Ôn luyện chủ đề mới
           </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#176A5D] relative font-sans selection:bg-[#2FD3A7]/30">
      {/* 2 & 3. Thông tin hệ sinh thái và giáo viên ở góc trên cùng bên trái */}
      <div className="absolute top-6 left-6 z-10 text-white/70 space-y-1 p-3 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#2FD3A7]">Hệ sinh thái giáo dục 4.0</p>
        <p className="text-[10px] font-medium uppercase tracking-[0.2em]">Giáo viên biên soạn: <span className="font-bold text-white">VĂN HÀ</span></p>
      </div>

      {/* Hiệu ứng ánh sáng nền */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-30">
        <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] bg-[#2FD3A7] rounded-full blur-[140px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-400 rounded-full blur-[120px]"></div>
      </div>
      
      <div className="relative z-0 pt-28 pb-16 px-4 sm:px-8">
        {view === 'setup' && renderSetup()}
        {view === 'loading' && <LoadingScreen />}
        {view === 'quiz' && renderQuiz()}
        {view === 'summary' && renderSummary()}
      </div>

      <footer className="pb-12 text-center relative z-0">
        <p className="text-white/40 font-medium text-xs uppercase tracking-[0.3em]">
          © 2026 Copyright by <span className="text-[#2FD3A7] font-black">GV VĂN HÀ</span>
        </p>
      </footer>
    </div>
  );
};

export default App;
