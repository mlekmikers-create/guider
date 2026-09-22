import React, { useState } from 'react';
import { LessonPlan, Language, AIProviderConfig } from '../types';
import { ARMENIAN_SUBJECTS, HPCH_COMPETENCIES } from '../data/armenianCurriculum';
import {
  Sparkles,
  BookOpen,
  Calendar,
  Clock,
  Printer,
  CheckCircle2,
  ListOrdered,
  Plus,
  ChevronDown,
  ChevronUp,
  Layers,
  FileCheck,
} from 'lucide-react';

interface LessonPlannerProps {
  plans: LessonPlan[];
  onSavePlan: (newPlan: LessonPlan) => void;
  lang: Language;
  aiConfig: AIProviderConfig;
}

export const LessonPlanner: React.FC<LessonPlannerProps> = ({
  plans,
  onSavePlan,
  lang,
  aiConfig,
}) => {
  const [selectedPlanId, setSelectedPlanId] = useState<string>(plans[0]?.id || '');
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New Lesson Plan State
  const [newTopic, setNewTopic] = useState('');
  const [newSubjectId, setNewSubjectId] = useState('algebra');
  const [newGradeLevel, setNewGradeLevel] = useState('9-րդ դասարան');
  const [newCurriculumCode, setNewCurriculumCode] = useState('ՀՊՉ-Մ9.3');
  const [selectedCompetencies, setSelectedCompetencies] = useState<string[]>([
    'Մաթեմատիկական և գիտատեխնիկական կարողունակություն',
    'Սովորել սովորելու կարողունակություն',
  ]);

  const activePlan = plans.find((p) => p.id === selectedPlanId) || plans[0];

  const handleToggleCompetency = (compText: string) => {
    if (selectedCompetencies.includes(compText)) {
      setSelectedCompetencies(selectedCompetencies.filter((c) => c !== compText));
    } else {
      setSelectedCompetencies([...selectedCompetencies, compText]);
    }
  };

  const handleGenerateAiPlan = async () => {
    if (!newTopic.trim()) return;
    setIsAiGenerating(true);
    try {
      const subjectObj = ARMENIAN_SUBJECTS.find((s) => s.id === newSubjectId);
      const prompt = `Կազմել Հայաստանի Հանրապետության Հանրակրթության պետական չափորոշչին (ՀՊՉ) համապատասխան օրինակելի դասի պլան:
Առարկա: ${subjectObj?.nameHy}
Դասարան: ${newGradeLevel}
Թեմա: ${newTopic}
Չափորոշչային կոդ: ${newCurriculumCode}
Թիրախային կարողունակություններ: ${selectedCompetencies.join(', ')}

Պահանջվում է խստորեն հետևել ԽԻԿ (Խթանում, Իմաստի ընկալում, Կշռադատում) 45-րոպեանոց դասի կառուցվածքին.
1. Դասի նպատակները և վերջնարդյունքները (ՀՊՉ համաձայն):
2. Խթանման փուլ (5-7 րոպե, մեթոդ, ուսուցչի գործողություն, աշակերտի գործողություն):
3. Իմաստի ընկալման փուլ (25-30 րոպե, ակտիվ ուսուցման մեթոդ, խմբային կամ հետազոտական աշխատանք):
4. Կշռադատման փուլ (8-10 րոպե, ելքի քարտեր, ինքնագնահատում):
5. Տարբերակված ուսուցում (հիմնական մակարդակ, բարձր մակարդակ, աջակցության կարիք ունեցողներ):
6. Ձևավորող գնահատման չափանիշներ և տնային հանձնարարություն:

Պատասխանեք պաշտոնական, գրագետ հայերենով:`;

      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: 'lesson_plan',
          provider: aiConfig.activeProvider,
          customApiKey: aiConfig.activeProvider === 'openai' ? aiConfig.openaiKey : aiConfig.firebirdKey,
          customBaseUrl: aiConfig.activeProvider === 'firebird' ? aiConfig.firebirdBaseUrl : undefined,
          customModel: aiConfig.activeProvider === 'openai' ? aiConfig.openaiModel : aiConfig.firebirdModel,
          prompt,
        }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        const generatedText: string = data.result || '';

        // Construct structured plan from AI generation
        const newLesson: LessonPlan = {
          id: `plan-${Date.now()}`,
          title: newTopic,
          subjectId: newSubjectId,
          gradeLevel: newGradeLevel,
          durationMinutes: 45,
          date: new Date().toISOString().split('T')[0],
          curriculumCode: newCurriculumCode,
          competencies: selectedCompetencies,
          learningOutcomes: [
            'Սովորողը կհասկանա տեսական հիմնադրույթները և կիրառի դրանք գործնական առաջադրանքներում:',
            'Կկարողանա վերլուծել և հիմնավորել սեփական լուծումները:',
          ],
          phases: {
            evocation: {
              durationMinutes: 7,
              method: '«Մտագրոհ» և Հենակետային հարցում',
              description: 'Նախնական գիտելիքների ակտիվացում թեմայի վերաբերյալ:',
              teacherAction: 'Ուղղորդող հարցերի միջոցով բացահայտում է հիմնական հասկացությունները:',
              studentAction: 'Մասնակցում են քննարկմանը, ձևակերպում են վարկածներ:',
            },
            realization: {
              durationMinutes: 28,
              method: 'Հետազոտական համագործակցային ուսուցում',
              description: generatedText.slice(0, 300) + '...',
              teacherAction: 'Կազմակերպում է աշխատանքը փոքր խմբերով, ապահովում հետադարձ կապ:',
              studentAction: 'Կատարում են առաջադրանքները, փոխանակվում գաղափարներով:',
            },
            reflection: {
              durationMinutes: 10,
              method: '«Ելքի քարտեր» և Ամփոփիչ հարցաշար',
              description: 'Յուրացման մակարդակի ստուգում ինքնուրույն կարճ առաջադրանքով:',
              teacherAction: 'Գնահատում է արդյունքները, տալիս կառուցողական կարծիք:',
              studentAction: 'Լրացնում են ելքի քարտերը, կատարում ինքնագնահատում:',
            },
          },
          differentiation: {
            basic: 'Տիպային առաջադրանքների կատարում ըստ ալգորիթմի:',
            advanced: 'Ոչ ստանդարտ իրավիճակների և խնդիրների լուծում:',
            supportNeed: 'Ուղեցույց-քարտեր և անհատական խորհրդատվություն:',
          },
          assessmentCriteria: '10-բալանոց սանդղակով ձևավորող գնահատում (ճշգրտություն, տրամաբանություն, ինքնուրույնություն):',
          materials: ['Հաստատված դասագիրք', 'ՏՀՏ գործիքներ', 'Աշխատանքային թերթիկներ'],
          homework: 'Ամրապնդող վարժություններ դասագրքից, ստեղծագործական առաջադրանք:',
          status: 'approved',
          aiProviderUsed: `${aiConfig.activeProvider.toUpperCase()} AI Շարժիչ`,
        };

        onSavePlan(newLesson);
        setSelectedPlanId(newLesson.id);
        setShowCreateModal(false);
        setNewTopic('');
      } else {
        alert(data.error || 'AI generation failed');
      }
    } catch (err: any) {
      alert(`Սխալ: ${err.message}`);
    } finally {
      setIsAiGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner and Creation Action */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">
              {lang === 'hy'
                ? 'ՀՊՉ Օրինակելի Դասապլանավորման Մոդուլ'
                : 'National Curriculum Lesson Planning Engine'}
            </h2>
            <span className="text-[11px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-semibold">
              ԽԻԿ մեթոդ (45 րոպե)
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {lang === 'hy'
              ? 'Համապատասխանեցված ՀՀ ԿԳՄՍՆ հանրակրթության նոր չափորոշչին և վերջնարդյունքներին'
              : 'Strictly compliant with Republic of Armenia MoESCS national curriculum competencies & outcomes'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="open-create-plan-modal-btn"
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{lang === 'hy' ? 'Կազմել Նոր Դասապլան' : 'Create New Lesson Plan'}</span>
          </button>

          <button
            id="print-lesson-plan-btn"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300 rounded-lg text-xs font-semibold transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{lang === 'hy' ? 'Տպել Տեղեկանքը' : 'Print Plan'}</span>
          </button>
        </div>
      </div>

      {/* Main Split: Left list of plans, Right preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Plan selector */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {lang === 'hy' ? 'Պահպանված Դասապլաններ' : 'Saved Lesson Plans'} ({plans.length})
          </div>

          <div className="space-y-2">
            {plans.map((plan) => {
              const isSelected = plan.id === selectedPlanId;
              const sub = ARMENIAN_SUBJECTS.find((s) => s.id === plan.subjectId);
              return (
                <button
                  key={plan.id}
                  onClick={() => setSelectedPlanId(plan.id)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-blue-50/80 border-blue-400 ring-2 ring-blue-500/20 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 text-[11px] text-slate-500 mb-1">
                    <span className="font-semibold text-blue-700">{sub?.nameHy || plan.subjectId}</span>
                    <span>{plan.gradeLevel}</span>
                  </div>
                  <h3 className="font-bold text-xs text-slate-900 line-clamp-2 leading-snug">{plan.title}</h3>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-400">
                    <span className="font-mono">{plan.curriculumCode}</span>
                    <span className="text-emerald-700 font-medium">Հաստատված</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right 2 columns: Active Lesson Plan Detail Sheet */}
        <div className="lg:col-span-2">
          {activePlan ? (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-6 print:border-none print:shadow-none">
              {/* Header Box */}
              <div className="border-b border-slate-200 pb-4">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-mono text-xs font-semibold">
                    {activePlan.curriculumCode}
                  </span>
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {activePlan.date} • {activePlan.durationMinutes} րոպե
                  </span>
                </div>

                <h1 className="text-lg font-black text-slate-900 tracking-tight leading-snug">
                  {activePlan.title}
                </h1>

                <div className="text-xs text-slate-600 mt-2 flex flex-wrap items-center gap-4">
                  <div>
                    <span className="text-slate-400 font-medium">Առարկա՝ </span>
                    <span className="font-semibold text-slate-800">
                      {ARMENIAN_SUBJECTS.find((s) => s.id === activePlan.subjectId)?.nameHy || activePlan.subjectId}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Դասարան՝ </span>
                    <span className="font-semibold text-slate-800">{activePlan.gradeLevel}</span>
                  </div>
                  {activePlan.aiProviderUsed && (
                    <div className="text-purple-700 font-medium bg-purple-50 px-2 py-0.5 rounded border border-purple-200 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      <span>{activePlan.aiProviderUsed}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* State Standard Competencies */}
              <div>
                <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-blue-600" />
                  <span>ՀՊՉ Հիմնական Կարողունակություններ</span>
                </h2>
                <div className="flex flex-wrap gap-1.5">
                  {activePlan.competencies.map((comp, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-md text-xs font-medium border border-slate-200"
                    >
                      {comp}
                    </span>
                  ))}
                </div>
              </div>

              {/* Learning Outcomes */}
              <div>
                <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4 text-emerald-600" />
                  <span>Ակնկալվող Վերջնարդյունքներ (Outcomes)</span>
                </h2>
                <ul className="space-y-1.5 text-xs text-slate-700 list-disc list-inside bg-slate-50 p-3 rounded-lg border border-slate-200">
                  {activePlan.learningOutcomes.map((outcome, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {outcome}
                    </li>
                  ))}
                </ul>
              </div>

              {/* 3-Phase Structure (ԽԻԿ) */}
              <div>
                <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <ListOrdered className="w-4 h-4 text-indigo-600" />
                  <span>Դասի Ընթացքը Ըստ ԽԻԿ Համակարգի (45 րոպե)</span>
                </h2>

                <div className="space-y-3">
                  {/* Evocation */}
                  <div className="border border-amber-200 bg-amber-50/40 rounded-lg p-3.5">
                    <div className="flex items-center justify-between text-xs font-bold text-amber-900 mb-1.5">
                      <span>1. Խթանման փուլ (Evocation) • {activePlan.phases.evocation.durationMinutes} րոպե</span>
                      <span className="text-[11px] font-medium bg-amber-200/60 px-2 py-0.5 rounded text-amber-900">
                        Մեթոդ՝ {activePlan.phases.evocation.method}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed mb-2">
                      {activePlan.phases.evocation.description}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-2 border-t border-amber-200/60">
                      <div>
                        <span className="font-semibold text-slate-600">Ուսուցչի գործողություն՝ </span>
                        <span className="text-slate-700">{activePlan.phases.evocation.teacherAction}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-slate-600">Աշակերտի գործողություն՝ </span>
                        <span className="text-slate-700">{activePlan.phases.evocation.studentAction}</span>
                      </div>
                    </div>
                  </div>

                  {/* Realization */}
                  <div className="border border-blue-200 bg-blue-50/40 rounded-lg p-3.5">
                    <div className="flex items-center justify-between text-xs font-bold text-blue-900 mb-1.5">
                      <span>2. Իմաստի ընկալման փուլ (Realization) • {activePlan.phases.realization.durationMinutes} րոպե</span>
                      <span className="text-[11px] font-medium bg-blue-200/60 px-2 py-0.5 rounded text-blue-900">
                        Մեթոդ՝ {activePlan.phases.realization.method}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed mb-2">
                      {activePlan.phases.realization.description}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-2 border-t border-blue-200/60">
                      <div>
                        <span className="font-semibold text-slate-600">Ուսուցչի գործողություն՝ </span>
                        <span className="text-slate-700">{activePlan.phases.realization.teacherAction}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-slate-600">Աշակերտի գործողություն՝ </span>
                        <span className="text-slate-700">{activePlan.phases.realization.studentAction}</span>
                      </div>
                    </div>
                  </div>

                  {/* Reflection */}
                  <div className="border border-emerald-200 bg-emerald-50/40 rounded-lg p-3.5">
                    <div className="flex items-center justify-between text-xs font-bold text-emerald-900 mb-1.5">
                      <span>3. Կշռադատման փուլ (Reflection) • {activePlan.phases.reflection.durationMinutes} րոպե</span>
                      <span className="text-[11px] font-medium bg-emerald-200/60 px-2 py-0.5 rounded text-emerald-900">
                        Մեթոդ՝ {activePlan.phases.reflection.method}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed mb-2">
                      {activePlan.phases.reflection.description}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-2 border-t border-emerald-200/60">
                      <div>
                        <span className="font-semibold text-slate-600">Ուսուցչի գործողություն՝ </span>
                        <span className="text-slate-700">{activePlan.phases.reflection.teacherAction}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-slate-600">Աշակերտի գործողություն՝ </span>
                        <span className="text-slate-700">{activePlan.phases.reflection.studentAction}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Differentiation & Homework */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200">
                <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-xs">
                  <h3 className="font-bold text-slate-800 mb-1.5">Տարբերակված Ուսուցում</h3>
                  <div className="space-y-1 text-[11px] text-slate-600">
                    <p>
                      <strong className="text-slate-700">Բազային՝</strong> {activePlan.differentiation.basic}
                    </p>
                    <p>
                      <strong className="text-slate-700">Խորացված՝</strong> {activePlan.differentiation.advanced}
                    </p>
                    <p>
                      <strong className="text-slate-700">Աջակցություն՝</strong> {activePlan.differentiation.supportNeed}
                    </p>
                  </div>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-xs">
                  <h3 className="font-bold text-slate-800 mb-1.5">Տնային Առաջադրանք և Նյութեր</h3>
                  <p className="text-[11px] text-slate-700 mb-2">
                    <strong className="text-slate-800">Առաջադրանք՝</strong> {activePlan.homework}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {activePlan.materials.map((mat, i) => (
                      <span key={i} className="text-[10px] bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-600">
                        {mat}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400">
              {lang === 'hy' ? 'Ընտրեք դասապլան ցանկից' : 'Select a lesson plan from the left list'}
            </div>
          )}
        </div>
      </div>

      {/* Modal for Creating / AI-Generating Lesson Plan */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-300" />
                <h3 className="font-bold text-base">
                  {lang === 'hy' ? 'Կազմել Դասապլան (AI Աջակցությամբ)' : 'Generate AI Lesson Plan (RA Standard)'}
                </h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {lang === 'hy' ? 'Առարկա' : 'Subject'}
                  </label>
                  <select
                    value={newSubjectId}
                    onChange={(e) => setNewSubjectId(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  >
                    {ARMENIAN_SUBJECTS.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.nameHy}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {lang === 'hy' ? 'Դասարան' : 'Grade'}
                  </label>
                  <select
                    value={newGradeLevel}
                    onChange={(e) => setNewGradeLevel(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  >
                    <option value="7-րդ դասարան">7-րդ դասարան</option>
                    <option value="8-րդ դասարան">8-րդ դասարան</option>
                    <option value="9-րդ դասարան">9-րդ դասարան</option>
                    <option value="10-րդ դասարան">10-րդ դասարան</option>
                    <option value="11-րդ դասարան">11-րդ դասարան</option>
                    <option value="12-րդ դասարան">12-րդ դասարան</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {lang === 'hy' ? 'ՀՊՉ Կոդ' : 'State Standard Code'}
                  </label>
                  <input
                    type="text"
                    value={newCurriculumCode}
                    onChange={(e) => setNewCurriculumCode(e.target.value)}
                    placeholder="ՀՊՉ-Մ9.3"
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {lang === 'hy' ? 'Դասի Թեման' : 'Lesson Topic Title'}
                </label>
                <input
                  type="text"
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  placeholder={lang === 'hy' ? 'Օրինակ՝ Եռանկյունների նմանության երկրորդ հայտանիշը' : 'e.g. Triangle similarity theorem'}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              {/* State Competencies Checkboxes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  {lang === 'hy' ? 'ՀՊՉ Կարողունակություններ (ընտրեք թիրախները)' : 'Key State Standard Competencies'}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 bg-slate-50 rounded-lg border border-slate-200">
                  {HPCH_COMPETENCIES.map((comp) => {
                    const checked = selectedCompetencies.includes(comp.hy);
                    return (
                      <button
                        type="button"
                        key={comp.id}
                        onClick={() => handleToggleCompetency(comp.hy)}
                        className={`text-left p-2 rounded text-xs transition-colors flex items-start gap-2 border ${
                          checked
                            ? 'bg-blue-100/70 text-blue-900 border-blue-300 font-semibold'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <span className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[10px] shrink-0 mt-0.5 border ${checked ? 'bg-blue-600 text-white border-blue-600' : 'border-slate-400'}`}>
                          {checked ? '✓' : ''}
                        </span>
                        <span>{lang === 'hy' ? comp.hy : comp.en}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active AI provider banner */}
              <div className="text-xs bg-slate-100 p-3 rounded-lg border border-slate-200 flex items-center justify-between">
                <span className="text-slate-600">
                  AI Շարժիչ՝ <strong className="text-slate-900">{aiConfig.activeProvider.toUpperCase()}</strong>
                </span>
                <span className="text-[11px] text-blue-600 font-medium">ՀՊՉ 2026 ստանդարտ</span>
              </div>
            </div>

            <div className="px-6 py-3 bg-slate-100 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 rounded-md"
              >
                {lang === 'hy' ? 'Չեղարկել' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleGenerateAiPlan}
                disabled={isAiGenerating || !newTopic.trim()}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-xs transition-colors disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                <span>
                  {isAiGenerating
                    ? lang === 'hy'
                      ? 'AI-ն գեներացնում է ՀՊՉ պլանը...'
                      : 'Generating RA Lesson Plan...'
                    : lang === 'hy'
                    ? 'Գեներացնել AI-ով'
                    : 'Generate with AI'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
