import React, { useState, useEffect } from 'react';
import {
  UserRole,
  Language,
  AIProviderConfig,
  StudentRecord,
  LessonPlan,
  ParentCommunicationMessage,
  TeacherMetric,
} from './types';
import {
  INITIAL_STUDENTS,
  INITIAL_LESSON_PLANS,
  INITIAL_PARENT_MESSAGES,
  NATIONAL_INSPECTION_TEACHERS,
  NATIONAL_EDUCATION_STATS,
} from './data/armenianCurriculum';
import { Header } from './components/Header';
import { GradingJournal } from './components/GradingJournal';
import { LessonPlanner } from './components/LessonPlanner';
import { ParentCommunication } from './components/ParentCommunication';
import { GovernmentInspectorate } from './components/GovernmentInspectorate';
import { AIConfigModal } from './components/AIConfigModal';
import { CheckCircle2, Shield, Info, Sparkles } from 'lucide-react';

export default function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>('teacher');
  const [activeView, setActiveView] = useState<
    'grading' | 'planning' | 'communication' | 'inspector_overview' | 'inspector_teachers'
  >('grading');
  const [lang, setLang] = useState<Language>('hy');

  // AI Provider Configuration (default Gemini, supports OpenAI/ChatGPT and Firebird)
  const [aiConfig, setAiConfig] = useState<AIProviderConfig>(() => {
    const saved = localStorage.getItem('armenia_edu_ai_config');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return {
      activeProvider: 'gemini',
      openaiModel: 'gpt-4o-mini',
      firebirdBaseUrl: 'https://api.firebird.ai/v1',
      firebirdModel: 'firebird-edu-v1',
    };
  });

  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  // Students in Teacher's Class (local persistence)
  const [students, setStudents] = useState<StudentRecord[]>(() => {
    const saved = localStorage.getItem('armenia_edu_students');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return INITIAL_STUDENTS;
  });

  // Lesson Plans (local persistence)
  const [plans, setPlans] = useState<LessonPlan[]>(() => {
    const saved = localStorage.getItem('armenia_edu_plans');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return INITIAL_LESSON_PLANS;
  });

  // Parent Notices (local persistence)
  const [parentMessages, setParentMessages] = useState<ParentCommunicationMessage[]>(() => {
    const saved = localStorage.getItem('armenia_edu_messages');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return INITIAL_PARENT_MESSAGES;
  });

  // Government Inspectorate Teachers Registry
  const [inspectionTeachers, setInspectionTeachers] = useState<TeacherMetric[]>(() => {
    const saved = localStorage.getItem('armenia_edu_inspect_teachers');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return NATIONAL_INSPECTION_TEACHERS;
  });

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('armenia_edu_ai_config', JSON.stringify(aiConfig));
  }, [aiConfig]);

  useEffect(() => {
    localStorage.setItem('armenia_edu_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('armenia_edu_plans', JSON.stringify(plans));
  }, [plans]);

  useEffect(() => {
    localStorage.setItem('armenia_edu_messages', JSON.stringify(parentMessages));
  }, [parentMessages]);

  useEffect(() => {
    localStorage.setItem('armenia_edu_inspect_teachers', JSON.stringify(inspectionTeachers));
  }, [inspectionTeachers]);

  const handleSaveAiConfig = (cfg: AIProviderConfig) => {
    setAiConfig(cfg);
  };

  const handleSaveLessonPlan = (newPlan: LessonPlan) => {
    setPlans([newPlan, ...plans]);
  };

  const handleSendParentMessage = (newMsg: ParentCommunicationMessage) => {
    setParentMessages([newMsg, ...parentMessages]);
  };

  const handleUpdateTeacherMetric = (updated: TeacherMetric) => {
    setInspectionTeachers(inspectionTeachers.map((t) => (t.id === updated.id ? updated : t)));
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans antialiased selection:bg-blue-600 selection:text-white">
      {/* Top Ministry Header */}
      <Header
        currentRole={currentRole}
        setCurrentRole={setCurrentRole}
        activeView={activeView}
        setActiveView={setActiveView}
        lang={lang}
        setLang={setLang}
        activeAiProvider={aiConfig.activeProvider}
        onOpenAiConfig={() => setIsAiModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeView === 'grading' && (
          <GradingJournal
            students={students}
            onUpdateStudents={setStudents}
            lang={lang}
            aiConfig={aiConfig}
          />
        )}

        {activeView === 'planning' && (
          <LessonPlanner
            plans={plans}
            onSavePlan={handleSaveLessonPlan}
            lang={lang}
            aiConfig={aiConfig}
          />
        )}

        {activeView === 'communication' && (
          <ParentCommunication
            messages={parentMessages}
            students={students}
            onSendMessage={handleSendParentMessage}
            lang={lang}
            aiConfig={aiConfig}
          />
        )}

        {(activeView === 'inspector_overview' || activeView === 'inspector_teachers') && (
          <GovernmentInspectorate
            stats={NATIONAL_EDUCATION_STATS}
            teachers={inspectionTeachers}
            onUpdateTeacher={handleUpdateTeacherMetric}
            lang={lang}
          />
        )}
      </main>

      {/* Footer State Designation */}
      <footer className="bg-white border-t border-slate-200 mt-auto py-4 text-slate-500 text-xs print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></div>
            <span>
              {lang === 'hy'
                ? 'ՀՀ ԿԳՄՍՆ Պետական Էլեկտրոնային Կրթական Համակարգ • Ապահով Կապ'
                : 'RA MoESCS National Electronic Educational System • Secure Connection'}
            </span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span>ՀՊՉ 2026 (Հանրակրթության պետական չափորոշիչ)</span>
            <span>•</span>
            <span className="flex items-center gap-1 text-slate-600">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              AI Gateway: {aiConfig.activeProvider.toUpperCase()}
            </span>
          </div>
        </div>
      </footer>

      {/* AI Configuration Modal */}
      <AIConfigModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        config={aiConfig}
        onSaveConfig={handleSaveAiConfig}
        lang={lang}
      />
    </div>
  );
}
