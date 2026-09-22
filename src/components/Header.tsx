import React from 'react';
import { UserRole, Language, AIProviderId } from '../types';
import {
  GraduationCap,
  ShieldCheck,
  Cpu,
  Globe2,
  BookOpen,
  CalendarCheck,
  MessageSquareShare,
  Sliders,
  Sparkles,
} from 'lucide-react';

interface HeaderProps {
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  activeView: 'grading' | 'planning' | 'communication' | 'inspector_overview' | 'inspector_teachers';
  setActiveView: (view: 'grading' | 'planning' | 'communication' | 'inspector_overview' | 'inspector_teachers') => void;
  lang: Language;
  setLang: (lang: Language) => void;
  activeAiProvider: AIProviderId;
  onOpenAiConfig: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  setCurrentRole,
  activeView,
  setActiveView,
  lang,
  setLang,
  activeAiProvider,
  onOpenAiConfig,
}) => {
  const isInspector = currentRole === 'inspector';

  return (
    <header id="main-header" className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      {/* Top Ministry Banner */}
      <div className="bg-slate-900 text-slate-100 text-xs px-4 py-1.5 flex flex-wrap items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          {/* Armenian Tricolor Badge */}
          <div className="flex h-3.5 w-6 rounded-xs overflow-hidden border border-slate-700 shrink-0">
            <div className="w-1/3 bg-[#D90012]"></div>
            <div className="w-1/3 bg-[#0033A0]"></div>
            <div className="w-1/3 bg-[#F2A800]"></div>
          </div>
          <span className="font-semibold tracking-wide text-slate-200">
            {lang === 'hy'
              ? 'ՀՀ ԿՐԹՈՒԹՅԱՆ, ԳԻՏՈՒԹՅԱՆ, ՄՇԱԿՈՒՅԹԻ ԵՎ ՍՊՈՐՏԻ ՆԱԽԱՐԱՐՈՒԹՅՈՒՆ'
              : 'REPUBLIC OF ARMENIA MINISTRY OF EDUCATION, SCIENCE, CULTURE AND SPORT'}
          </span>
          <span className="hidden md:inline-block px-1.5 py-0.2 bg-amber-500/20 text-amber-300 rounded text-[10px] uppercase font-mono">
            Պետական Համակարգ v2.4 (ՀՊՉ)
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Role selector */}
          <div className="flex items-center bg-slate-800 rounded p-0.5 border border-slate-700">
            <button
              id="role-teacher-btn"
              onClick={() => {
                setCurrentRole('teacher');
                if (activeView.startsWith('inspector_')) {
                  setActiveView('grading');
                }
              }}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                currentRole === 'teacher'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {lang === 'hy' ? 'Ուսուցիչ' : 'Teacher'}
            </button>
            <button
              id="role-principal-btn"
              onClick={() => {
                setCurrentRole('principal');
              }}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                currentRole === 'principal'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {lang === 'hy' ? 'Տնօրեն / Ուսմասվար' : 'Principal'}
            </button>
            <button
              id="role-inspector-btn"
              onClick={() => {
                setCurrentRole('inspector');
                setActiveView('inspector_overview');
              }}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                currentRole === 'inspector'
                  ? 'bg-red-700 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {lang === 'hy' ? 'ՀՀ ԿԳՄՍՆ Տեսուչ' : 'MoESCS Inspector'}
            </button>
          </div>

          {/* Language Toggle */}
          <button
            id="lang-toggle-btn"
            onClick={() => setLang(lang === 'hy' ? 'en' : 'hy')}
            className="flex items-center gap-1 text-slate-300 hover:text-white bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700 text-[11px]"
            title="Լեզվի փոփոխություն / Change language"
          >
            <Globe2 className="w-3 h-3 text-slate-400" />
            <span className="font-semibold">{lang === 'hy' ? 'ՀԱՅ' : 'ENG'}</span>
          </button>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-linear-to-br from-blue-700 to-indigo-900 text-white flex items-center justify-center font-bold shadow-xs">
            {isInspector ? <ShieldCheck className="w-6 h-6 text-amber-300" /> : <GraduationCap className="w-6 h-6" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                {lang === 'hy' ? 'Հայաստանի Կրթական ՕՀ' : 'Armenia EduOS'}
              </h1>
              <span
                className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${
                  isInspector
                    ? 'bg-amber-50 text-amber-800 border-amber-300'
                    : 'bg-blue-50 text-blue-800 border-blue-200'
                }`}
              >
                {isInspector
                  ? lang === 'hy'
                    ? 'Պետական Վերահսկողություն և Տեսչություն'
                    : 'MoESCS State Inspectorate'
                  : lang === 'hy'
                  ? 'Ուսուցչի Աշխատատեղ (e-Emis Ready)'
                  : 'Teacher National Workspace'}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {isInspector
                ? lang === 'hy'
                  ? 'Հանրապետական չափորոշչային աուդիտ, գնահատման օբյեկտիվություն և որակի մոնիթորինգ'
                  : 'National standard audit, grading objectivity, and pedagogical quality verification'
                : lang === 'hy'
                ? 'Էլեկտրոնային մատյան (10 բալ), ՀՊՉ դասապլանավորում, ծնողական կապ և AI օգնական'
                : '10-point electronic grading, state lesson planning, parent notices & AI engine'}
            </p>
          </div>
        </div>

        {/* AI Gateway Status Pill */}
        <div className="flex items-center gap-2">
          <button
            id="ai-provider-settings-btn"
            onClick={onOpenAiConfig}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-md text-xs text-slate-700 transition-colors shadow-2xs group"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
            <div className="text-left leading-tight">
              <div className="text-[10px] uppercase font-semibold text-slate-400">AI Ինտեգրում</div>
              <div className="font-semibold text-slate-800 flex items-center gap-1">
                <span>
                  {activeAiProvider === 'gemini'
                    ? 'Gemini 3.8 Flash'
                    : activeAiProvider === 'openai'
                    ? 'ChatGPT / OpenAI'
                    : activeAiProvider === 'firebird'
                    ? 'Firebird AI Engine'
                    : 'Custom LLM API'}
                </span>
                <Sliders className="w-3 h-3 text-slate-400 group-hover:text-slate-600" />
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-100">
        <nav className="flex space-x-1 sm:space-x-4 py-2 overflow-x-auto">
          {!isInspector ? (
            <>
              <button
                id="tab-grading-btn"
                onClick={() => setActiveView('grading')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${
                  activeView === 'grading'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>{lang === 'hy' ? 'Էլեկտրոնային Մատյան (10 բալ)' : 'Grading Journal (10-pts)'}</span>
              </button>

              <button
                id="tab-planning-btn"
                onClick={() => setActiveView('planning')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${
                  activeView === 'planning'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <CalendarCheck className="w-4 h-4" />
                <span>{lang === 'hy' ? 'Դասապլանավորում (ՀՊՉ / ԽԻԿ)' : 'Lesson Planning (State Std)'}</span>
              </button>

              <button
                id="tab-communication-btn"
                onClick={() => setActiveView('communication')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${
                  activeView === 'communication'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <MessageSquareShare className="w-4 h-4" />
                <span>{lang === 'hy' ? 'Ծնողական Կապ (Viber / SMS)' : 'Parent Communication'}</span>
              </button>
            </>
          ) : (
            <>
              <button
                id="tab-inspector-overview-btn"
                onClick={() => setActiveView('inspector_overview')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${
                  activeView === 'inspector_overview'
                    ? 'bg-red-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{lang === 'hy' ? 'Հանրապետական & Մարզային Վահանակ' : 'National & Regional Dashboard'}</span>
              </button>

              <button
                id="tab-inspector-teachers-btn"
                onClick={() => setActiveView('inspector_teachers')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${
                  activeView === 'inspector_teachers'
                    ? 'bg-red-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Cpu className="w-4 h-4" />
                <span>{lang === 'hy' ? 'Ուսուցիչների Աուդիտ & Գնահատման Օբյեկտիվություն' : 'Teacher Audit & Grade Inflation Check'}</span>
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};
