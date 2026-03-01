
import React from 'react';
import { AppSection } from '../types';
import { 
  Home, 
  TableProperties, 
  FlaskConical, 
  Calculator, 
  MessageCircle, 
  GraduationCap,
  Menu,
  X
} from 'lucide-react';

interface LayoutProps {
  currentSection: AppSection;
  setSection: (section: AppSection) => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ currentSection, setSection, children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  const navItems = [
    { id: AppSection.Home, label: 'Trang chủ', icon: Home },
    { id: AppSection.PeriodicTable, label: 'Bảng tuần hoàn', icon: TableProperties },
    { id: AppSection.EquationBalancer, label: 'Cân bằng phương trình', icon: FlaskConical },
    { id: AppSection.MoleCalculator, label: 'Tính toán Mol', icon: Calculator },
    { id: AppSection.AITutor, label: 'Trợ lý AI', icon: MessageCircle },
    { id: AppSection.PracticeQuiz, label: 'Luyện tập Quiz', icon: GraduationCap },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-4 bg-indigo-700 text-white shadow-md">
        <div className="flex items-center gap-2 font-bold text-lg">
          <FlaskConical size={24} />
          <span>Hóa Học THPT</span>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          {isSidebarOpen ? <X /> : <Menu />}
        </button>
      </header>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-indigo-900 text-white transition-transform transform 
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:relative md:translate-x-0 flex flex-col
      `}>
        <div className="hidden md:flex items-center gap-3 p-6 border-b border-indigo-800">
          <FlaskConical size={32} className="text-indigo-400" />
          <h1 className="font-bold text-xl tracking-tight">Hóa Học THPT</h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 mt-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setSection(item.id);
                setIsSidebarOpen(false);
              }}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                ${currentSection === item.id 
                  ? 'bg-indigo-700 text-white shadow-inner' 
                  : 'hover:bg-indigo-800 text-indigo-100'}
              `}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
        
        <div className="p-6 border-t border-indigo-800">
          <p className="text-xs text-indigo-400 text-center uppercase tracking-widest font-semibold">
            Made for Chemistry
          </p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
