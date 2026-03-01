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
    <div className="max-w-xl mx-auto bg-slate-900/50 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-slate-800">
      <div className="text-center mb-10">
        <div className="bg-gradient-to-br from-orange-400 to-orange-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 rotate-3 shadow-lg shadow-orange-500/20">
          <BookOpen className="text-white w-10 h-10" />
        </div>
        
        {/* Tiêu đề Gradient */}
        <h1 className="text-5xl md:text-6xl font-[900] tracking-tighter leading-none uppercase italic">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#fb923c] via-white to-orange-400">
            HỌC TOÁN THCS
          </span>
          <br />
          <span className="text-white">SIÊU TỐC</span>
        </h1>
        
        <p className="text-slate-400 mt-6 font-medium uppercase tracking-[0.2em] text-xs">Hệ thống ôn luyện thông minh</p>
        
        <div className="mt-4 py-1.5 px-6 bg-slate-800/50 rounded-full inline-block border border-slate-700">
          <p className="text-orange-400 text-sm font-black uppercase tracking-widest">GV Biên Soạn: VĂN HÀ</p>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-bold text-slate-400 mb-3 uppercase tracking-wider">Khối Lớp</label>
          <div className="grid grid-cols-4 gap-3">
            {Object.values(Grade).map((g) => (
              <button
                key={g}
                onClick={() => setConfig({ ...config, grade: g })}
                className={`py-3 rounded-xl border-2 font-black transition-all ${
                  config.grade === g 
                  ? 'bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-500/30 scale-105' 
                  : 'bg-slate-800/50 text-slate-500 border-slate-700 hover:border-slate-500 hover:text-slate-300'
                }`}
              >
                Lớp {g}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-400 mb-3 uppercase tracking-wider">Chủ đề bài học</label>
          <input
            type="text"
            value={config.topic}
            onChange={(e) => setConfig({ ...config, topic: e.target.value })}
            placeholder="Ví dụ: Phương trình bậc hai..."
            className="w-full px-5 py-4 bg-slate-800/50 border-2 border-slate-700 rounded-xl text-white placeholder:text-slate-600 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all font-medium"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-slate-400 mb-3 uppercase tracking-wider">Độ khó</label>
            <select
              value={config.difficulty}
              onChange={(e) => setConfig({ ...config, difficulty: e.target.value as Difficulty })}
              className="w-full px-5 py-4 bg-slate-800/50 border-2 border-slate-700 rounded-xl text-white focus:border-orange-500 outline-none font-medium appearance-none"
            >
              {Object.values(Difficulty).map(d => <option key={d} value={d} className="bg-slate-900">{d}</option>)}
            </select>
          </div>
          <div>
             <label className="block text-sm font-bold text-slate-400 mb-3 uppercase tracking-wider">Loại câu hỏi</label>
             <select
                value={config.questionType}
                onChange={(e) => setConfig({ ...config, questionType: e.target.value as any })}
                className="w-full px-5 py-4 bg-slate-800/50 border-2 border-slate-700 rounded-xl text-white focus:border-orange-500 outline-none font-medium appearance-none"
             >
               <option value="MIXED" className="bg-slate-900">Ngẫu nhiên</option>
               <option value={QuestionType.MULTIPLE_CHOICE} className="bg-slate-900">Trắc nghiệm</option>
               <option value={QuestionType.TRUE_FALSE} className="bg-slate-900">Đúng/Sai</option>
             </select>
          </div>
        </div>

        <button
          onClick={handleStartQuiz}
          disabled={!config.topic.trim()}
          className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-5 rounded-2xl font-black text-xl hover:from-orange-400 hover:to-orange-500 transition-all active:scale-[0.98] shadow-xl shadow-orange-500/20 mt-4 uppercase tracking-widest"
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
                  ? 'border-orange-500 bg-orange-500/10 shadow-lg shadow-orange-500/5' 
                  : 'border-slate-800 bg-slate-800/30 hover:border-slate-600 hover:bg-slate-800/50'
                }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-5 border-2 font-black text-xl transition-all shrink-0
                ${isSelected ? 'bg-orange-500 text-white border-orange-500 shadow-md' : 'bg-slate-800 text-slate-500 border-slate-700 group-hover:text-slate-300 group-hover:border-slate-500'}`}>
                {labels[idx]}
              </div>
              <div className="text-slate-200 flex-1 font-medium">
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
      <div className="bg-slate-900/50 rounded-2xl border-2 border-slate-800 overflow-hidden">
        <div className="grid grid-cols-12 bg-slate-800/50 p-4 font-black text-slate-500 border-b border-slate-800 uppercase text-xs tracking-widest">
          <div className="col-span-8 pl-4">Các mệnh đề</div>
          <div className="col-span-2 text-center">Đúng</div>
          <div className="col-span-2 text-center">Sai</div>
        </div>
        {q.propositions?.map((prop, idx) => (
           <div key={idx} className={`grid grid-cols-12 p-5 items-center border-b border-slate-800 last:border-0 transition-colors ${idx % 2 === 0 ? 'bg-transparent' : 'bg-slate-800/20'}`}>
             <div className="col-span-8 flex items-start pr-4">
                <span className="font-black mr-3 bg-slate-700 text-slate-300 rounded-lg px-2 text-sm h-7 flex items-center shrink-0 uppercase">{labels[idx]}</span>
                <MathRenderer content={prop} className="text-slate-200 text-lg font-medium" />
             </div>
             
             <div className="col-span-2 flex justify-center">
                <button
                  onClick={() => handleTFSelect(idx, true)}
                  className={`w-12 h-12 rounded-xl flex items-center justify-center border-2 transition-all
                    ${currentAns[idx] === true 
                      ? 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/20' 
                      : 'border-slate-700 bg-slate-800 text-slate-600 hover:border-slate-500 hover:text-slate-400'}`}
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
                      : 'border-slate-700 bg-slate-800 text-slate-600 hover:border-slate-500 hover:text-slate-400'}`}
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
        <div className="bg-slate-900/80 backdrop-blur-md p-5 rounded-2xl shadow-xl mb-8 flex justify-between items-center sticky top-6 z-10 border border-slate-800">
           <div className="flex items-center gap-6">
             <div className="flex flex-col">
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Thời gian</span>
               <span className="text-2xl font-mono text-orange-500 font-black">{formatTime(elapsedTime)}</span>
             </div>
             <div className="h-10 w-px bg-slate-800"></div>
             <span className="text-xs font-black text-slate-400 uppercase tracking-widest hidden md:block">
               {currentQ.type === QuestionType.TRUE_FALSE ? 'Kiểm tra Đúng/Sai' : 'Trắc nghiệm'}
             </span>
           </div>
           <span className="text-lg font-black text-white bg-slate-800 px-4 py-2 rounded-xl border border-slate-700">
             CÂU {quizState.currentQuestionIndex + 1} / {quizState.questions.length}
           </span>
        </div>

        <div className="w-full bg-slate-800 rounded-full h-3 mb-8 overflow-hidden border border-slate-700">
          <div className="bg-orange-500 h-full rounded-full transition-all duration-500 ease-out" style={{ width: `${progress}%` }}></div>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-sm p-10 rounded-[2.5rem] shadow-2xl mb-10 border border-slate-800">
           <div className="mb-8">
              <span className="bg-orange-500/10 text-orange-500 text-xs font-black px-4 py-2 rounded-xl mr-4 align-middle inline-block mb-3 uppercase tracking-widest border border-orange-500/20">
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
            className="flex items-center px-8 py-4 rounded-2xl font-bold text-slate-400 bg-slate-900 border-2 border-slate-800 hover:bg-slate-800 disabled:opacity-20 transition-all"
          >
            <ChevronLeft className="w-6 h-6 mr-2" /> Quay lại
          </button>

          {isLast ? (
            <button
              onClick={() => finishQuiz('normal')}
              className="flex items-center px-12 py-5 rounded-2xl font-black text-xl text-white bg-orange-600 shadow-2xl shadow-orange-500/20 hover:bg-orange-500 hover:-translate-y-1 transition-all uppercase tracking-widest"
            >
              Nộp bài <CheckCircle className="w-6 h-6 ml-3" />
            </button>
          ) : (
             <button
              onClick={handleNextQuestion}
              className="flex items-center px-10 py-4 rounded-2xl font-bold text-white bg-orange-600 hover:bg-orange-500 transition-all shadow-lg shadow-orange-500/20"
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
      <div className="max-w-4xl mx-auto bg-slate-900 rounded-[3rem] shadow-2xl overflow-hidden border border-slate-800 animate-slideUp">
        {quizState.submissionReason === 'cheat' && (
           <div className="bg-red-600 text-white p-5 flex items-center justify-center gap-4">
             <AlertOctagon className="w-10 h-10 animate-bounce" />
             <div className="text-center">
               <h3 className="font-black text-xl uppercase tracking-widest">PHÁT HIỆN GIAN LẬN!</h3>
             </div>
           </div>
        )}
        <div className="bg-gradient-to-br from-slate-800 to-slate-950 p-12 text-center text-white relative overflow-hidden border-b border-slate-800">
          <div className="relative z-10">
            <div className="inline-flex items-center justify-center w-32 h-32 bg-white/5 backdrop-blur-md rounded-full mb-6 border-4 border-white/10">
               <Award className={`w-16 h-16 ${isPerfect ? 'text-orange-400' : 'text-white'}`} />
            </div>
            <div className="text-8xl font-black mb-4 drop-shadow-lg bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-500">
                {quizState.score}<span className="text-3xl opacity-40">/10</span>
            </div>
            <p className="text-xl font-bold opacity-60 uppercase tracking-[0.3em]">Kết quả ôn luyện</p>
          </div>
        </div>

        <div className="p-10 space-y-10">
           <button onClick={resetApp} className="w-full py-6 bg-orange-600 text-white rounded-[2rem] font-black text-xl hover:bg-orange-500 flex items-center justify-center gap-3 shadow-2xl shadow-orange-500/20 transition-all active:scale-95 uppercase tracking-widest">
             <RefreshCw className="w-6 h-6"/> Ôn luyện chủ đề mới
           </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#020617] py-16 px-4 sm:px-8 font-sans selection:bg-orange-500/30">
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-500 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600 rounded-full blur-[120px]"></div>
      </div>
      
      <div className="relative z-0">
        {view === 'setup' && renderSetup()}
        {view === 'loading' && <LoadingScreen />}
        {view === 'quiz' && renderQuiz()}
        {view === 'summary' && renderSummary()}
      </div>

      <footer className="mt-12 text-center relative z-0">
        <p className="text-slate-600 font-medium text-xs uppercase tracking-[0.3em]">
          Biên soạn bởi <span className="text-orange-500/80 font-black">GV VĂN HÀ</span> © 2026
        </p>
      </footer>
    </div>
  );
};

export default App;