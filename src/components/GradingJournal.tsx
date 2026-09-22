import React, { useState } from 'react';
import { StudentRecord, Language, SubjectItem, GradeType, AttendanceType, AIProviderConfig } from '../types';
import { ARMENIAN_SUBJECTS } from '../data/armenianCurriculum';
import {
  Award,
  Sparkles,
  Download,
  AlertTriangle,
  CheckCircle,
  Clock,
  UserX,
  TrendingUp,
  FileSpreadsheet,
  Plus,
  Filter,
} from 'lucide-react';

interface GradingJournalProps {
  students: StudentRecord[];
  onUpdateStudents: (updated: StudentRecord[]) => void;
  lang: Language;
  aiConfig: AIProviderConfig;
}

export const GradingJournal: React.FC<GradingJournalProps> = ({
  students,
  onUpdateStudents,
  lang,
  aiConfig,
}) => {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('algebra');
  const [selectedClassGrade, setSelectedClassGrade] = useState<string>('9-րդ Ա');
  const [activeDateKey, setActiveDateKey] = useState<string>('2026-09-22');
  const [filterQuery, setFilterQuery] = useState('');
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [newGradeScore, setNewGradeScore] = useState<number>(8);
  const [newGradeType, setNewGradeType] = useState<GradeType>('oral');
  const [newGradeTopic, setNewGradeTopic] = useState<string>('');

  const currentSubject = ARMENIAN_SUBJECTS.find((s) => s.id === selectedSubjectId) || ARMENIAN_SUBJECTS[2];

  // Calculated Stats
  const allScores: number[] = [];
  students.forEach((s) => {
    Object.values(s.grades).forEach((g) => {
      if (g.score) allScores.push(g.score);
    });
  });

  const avgGrade = allScores.length > 0 ? (allScores.reduce((a, b) => a + b, 0) / allScores.length).toFixed(1) : '0';
  const highAchievers = allScores.filter((sc) => sc >= 9).length;
  const passingGrades = allScores.filter((sc) => sc >= 4).length;
  const failingGrades = allScores.filter((sc) => sc < 4).length;
  const qualityRate = allScores.length > 0 ? Math.round((allScores.filter((sc) => sc >= 7).length / allScores.length) * 100) : 0;
  const progressRate = allScores.length > 0 ? Math.round((passingGrades / allScores.length) * 100) : 0;

  // Grade color helper for Armenian 10-point scale
  const getGradeBadge = (score: number) => {
    if (score >= 9) {
      return 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold';
    } else if (score >= 7) {
      return 'bg-blue-100 text-blue-800 border-blue-300 font-bold';
    } else if (score >= 4) {
      return 'bg-amber-100 text-amber-900 border-amber-300 font-medium';
    } else {
      return 'bg-red-100 text-red-900 border-red-300 font-bold';
    }
  };

  const handleUpdateGrade = (studentId: string, score: number, type: GradeType, topic: string) => {
    const updated = students.map((stud) => {
      if (stud.id === studentId) {
        return {
          ...stud,
          grades: {
            ...stud.grades,
            [activeDateKey]: {
              score,
              type,
              topic: topic || (lang === 'hy' ? 'Ընթացիկ ստուգում' : 'Current assessment'),
            },
          },
        };
      }
      return stud;
    });
    onUpdateStudents(updated);
    setEditingStudentId(null);
  };

  const handleToggleAttendance = (studentId: string, status: AttendanceType) => {
    const updated = students.map((stud) => {
      if (stud.id === studentId) {
        return {
          ...stud,
          attendance: {
            ...stud.attendance,
            [activeDateKey]: status,
          },
        };
      }
      return stud;
    });
    onUpdateStudents(updated);
  };

  // Run AI grading & pedagogical analysis
  const handleRunAiAnalysis = async () => {
    setIsAnalyzing(true);
    setAiAnalysis(null);
    try {
      const prompt = `Խնդրում եմ վերլուծել ${selectedClassGrade} դասարանի «${currentSubject.nameHy}» առարկայի ընթացիկ գնահատականները (Հայաստանի 10-բալանոց սանդղակ):
Աշակերտների միջին միավորը՝ ${avgGrade} (Որակի ցուցանիշը՝ ${qualityRate}%, Առաջադիմությունը՝ ${progressRate}%):
Անբավարար (<4) գնահատականների քանակը՝ ${failingGrades}, Գերազանց (9-10)՝ ${highAchievers}:
Խնդրում եմ տալ.
1. Գնահատականների բաշխվածության մանկավարժական գնահատական (ՀՊՉ չափորոշիչներին համապատասխան):
2. Առաջարկություններ ցածր առաջադիմություն ունեցող աշակերտների հետ անհատականացված (տարբերակված) աշխատանքի համար:
3. Խորհուրդ առաջիկա թեմատիկ գրավոր աշխատանքի նախապատրաստման վերաբերյալ:`;

      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: 'grade_analysis',
          provider: aiConfig.activeProvider,
          customApiKey: aiConfig.activeProvider === 'openai' ? aiConfig.openaiKey : aiConfig.firebirdKey,
          customBaseUrl: aiConfig.activeProvider === 'firebird' ? aiConfig.firebirdBaseUrl : undefined,
          customModel: aiConfig.activeProvider === 'openai' ? aiConfig.openaiModel : aiConfig.firebirdModel,
          prompt,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setAiAnalysis(data.result);
      } else {
        setAiAnalysis(
          data.error || (lang === 'hy' ? 'Վերլուծության սխալ:' : 'Analysis could not be completed.')
        );
      }
    } catch (err: any) {
      setAiAnalysis(`Սխալ: ${err.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Export CSV
  const handleExportCsv = () => {
    const headers = ['Հ/Հ', 'Աշակերտի Անուն Ազգանուն', 'Դասարան', 'Ներկայություն', 'Գնահատական', 'Տիպ', 'Ծնողի Հեռախոս'];
    const rows = students.map((s) => [
      s.rollNo,
      s.fullNameHy,
      s.classGrade,
      s.attendance[activeDateKey] === 'present' ? 'Ներկա' : s.attendance[activeDateKey] || 'Ներկա',
      s.grades[activeDateKey]?.score || '-',
      s.grades[activeDateKey]?.type || '-',
      s.parentPhone,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `MoESCS_Gradebook_${selectedClassGrade}_${activeDateKey}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredStudents = students.filter(
    (s) =>
      s.fullNameHy.toLowerCase().includes(filterQuery.toLowerCase()) ||
      s.fullNameEn.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Filter and Actions Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Subject Dropdown */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              {lang === 'hy' ? 'Առարկա' : 'Subject'}
            </label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            >
              {ARMENIAN_SUBJECTS.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {lang === 'hy' ? sub.nameHy : sub.nameEn} ({sub.code})
                </option>
              ))}
            </select>
          </div>

          {/* Class Dropdown */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              {lang === 'hy' ? 'Դասարան' : 'Class Grade'}
            </label>
            <select
              value={selectedClassGrade}
              onChange={(e) => setSelectedClassGrade(e.target.value)}
              className="text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            >
              <option value="9-րդ Ա">9-րդ «Ա» (Հիմնական)</option>
              <option value="9-րդ Բ">9-րդ «Բ» (Հիմնական)</option>
              <option value="10-րդ Ա">10-րդ «Ա» (Ավագ հոսք)</option>
              <option value="11-րդ Ա">11-րդ «Ա» (Ֆիզմաթ)</option>
            </select>
          </div>

          {/* Date Picker */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              {lang === 'hy' ? 'Ամսաթիվ' : 'Date'}
            </label>
            <input
              type="date"
              value={activeDateKey}
              onChange={(e) => setActiveDateKey(e.target.value)}
              className="text-xs font-medium bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Right action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            id="run-ai-grade-analysis-btn"
            onClick={handleRunAiAnalysis}
            disabled={isAnalyzing}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-lg text-xs font-semibold hover:from-blue-700 hover:to-indigo-700 shadow-2xs transition-all disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span>
              {isAnalyzing
                ? lang === 'hy'
                  ? 'Վերլուծվում է...'
                  : 'Analyzing...'
                : lang === 'hy'
                ? 'AI Գնահատման Վերլուծություն'
                : 'AI Pedagogical Insight'}
            </span>
          </button>

          <button
            id="export-csv-gradebook-btn"
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300 rounded-lg text-xs font-semibold transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{lang === 'hy' ? 'Արտահանել EMIS (CSV)' : 'Export EMIS (CSV)'}</span>
          </button>
        </div>
      </div>

      {/* Classroom Statistical Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
            {lang === 'hy' ? 'Դասարանի Միջինը' : 'Class Average GPA'}
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1 flex items-baseline gap-1">
            <span>{avgGrade}</span>
            <span className="text-xs text-slate-400 font-normal">/ 10 միավոր</span>
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>{lang === 'hy' ? 'ՀՊՉ ստանդարտին համապատասխան' : 'State Standard Compliant'}</span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
            {lang === 'hy' ? 'Որակի Ցուցանիշ (7-10)' : 'Quality Rate (7-10)'}
          </div>
          <div className="text-2xl font-black text-blue-700 mt-1">{qualityRate}%</div>
          <div className="text-[11px] text-slate-500 mt-1">
            {allScores.filter((sc) => sc >= 7).length} {lang === 'hy' ? 'լավ և գերազանց' : 'good & excellent'}
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
            {lang === 'hy' ? 'Առաջադիմություն (≥4)' : 'Pass Rate (≥4)'}
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-1">{progressRate}%</div>
          <div className="text-[11px] text-slate-500 mt-1">
            {failingGrades === 0
              ? lang === 'hy'
                ? 'Անբավարար չկա'
                : 'Zero failing scores'
              : `${failingGrades} ${lang === 'hy' ? 'անբավարար' : 'failing'}`}
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
            {lang === 'hy' ? 'Գերազանցիկներ (9-10)' : 'High Achievers (9-10)'}
          </div>
          <div className="text-2xl font-black text-indigo-700 mt-1">{highAchievers}</div>
          <div className="text-[11px] text-slate-500 mt-1">
            {lang === 'hy' ? 'Օլիմպիադայի թեկնածուներ' : 'Olympiad Candidates'}
          </div>
        </div>
      </div>

      {/* AI Pedagogical Insight Card */}
      {aiAnalysis && (
        <div className="bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>
                {lang === 'hy'
                  ? 'AI Մանկավարժական Եզրակացություն և Առաջարկություններ'
                  : 'AI Pedagogical Summary & Recommendations'}
              </span>
            </div>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-blue-200/60 text-blue-900 rounded font-semibold">
              {aiConfig.activeProvider}
            </span>
          </div>
          <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-line bg-white/70 p-3 rounded-lg border border-blue-100">
            {aiAnalysis}
          </div>
        </div>
      )}

      {/* Electronic Gradebook Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-slate-600" />
            <h3 className="text-sm font-bold text-slate-900">
              {lang === 'hy'
                ? `Էլեկտրոնային Մատյան • ${selectedClassGrade} • ${currentSubject.nameHy}`
                : `Electronic Gradebook • ${selectedClassGrade} • ${currentSubject.nameEn}`}
            </h3>
            <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-medium">
              {students.length} {lang === 'hy' ? 'աշակերտ' : 'students'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                type="text"
                placeholder={lang === 'hy' ? 'Որոնել աշակերտ...' : 'Search student...'}
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                className="text-xs px-2.5 py-1 bg-white border border-slate-300 rounded-md pl-7 focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
              />
              <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2" />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3 w-10 text-center font-bold">№</th>
                <th className="py-2.5 px-3 font-bold">{lang === 'hy' ? 'Աշակերտի Ա.Ա.' : 'Student Name'}</th>
                <th className="py-2.5 px-3 w-36 font-bold">{lang === 'hy' ? 'Հաճախելիություն' : 'Attendance'}</th>
                <th className="py-2.5 px-3 w-28 font-bold text-center">
                  {lang === 'hy' ? 'Գնահատական (1-10)' : 'Grade (1-10)'}
                </th>
                <th className="py-2.5 px-3 w-32 font-bold">{lang === 'hy' ? 'Տիպ / Թեմա' : 'Type / Topic'}</th>
                <th className="py-2.5 px-3 font-bold">{lang === 'hy' ? 'Նախորդ Գնահատականներ' : 'Grade History'}</th>
                <th className="py-2.5 px-3 w-24 text-right font-bold">{lang === 'hy' ? 'Գործողություն' : 'Action'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredStudents.map((student) => {
                const currentGrade = student.grades[activeDateKey];
                const currentAttendance = student.attendance[activeDateKey] || 'present';

                return (
                  <tr key={student.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Roll No */}
                    <td className="py-2.5 px-3 text-center text-slate-500 font-mono font-medium">
                      {student.rollNo}
                    </td>

                    {/* Name */}
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-slate-900">
                        {lang === 'hy' ? student.fullNameHy : student.fullNameEn}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {student.parentName} ({student.parentPhone})
                      </div>
                    </td>

                    {/* Attendance Selector */}
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleToggleAttendance(student.id, 'present')}
                          className={`px-1.5 py-0.5 rounded text-[11px] font-bold transition-colors ${
                            currentAttendance === 'present'
                              ? 'bg-emerald-600 text-white shadow-2xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                          title="Ներկա"
                        >
                          Ն
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleAttendance(student.id, 'absent_unexcused')}
                          className={`px-1.5 py-0.5 rounded text-[11px] font-bold transition-colors ${
                            currentAttendance === 'absent_unexcused'
                              ? 'bg-red-600 text-white shadow-2xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                          title="Անհարգելի Բացակա"
                        >
                          Բ
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleAttendance(student.id, 'absent_excused')}
                          className={`px-1.5 py-0.5 rounded text-[11px] font-bold transition-colors ${
                            currentAttendance === 'absent_excused'
                              ? 'bg-amber-600 text-white shadow-2xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                          title="Հարգելի Բացակա"
                        >
                          Հ/Բ
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleAttendance(student.id, 'late')}
                          className={`px-1.5 py-0.5 rounded text-[11px] font-bold transition-colors ${
                            currentAttendance === 'late'
                              ? 'bg-indigo-600 text-white shadow-2xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                          title="Ուշացած"
                        >
                          ՈՒ
                        </button>
                      </div>
                    </td>

                    {/* Current Grade */}
                    <td className="py-2.5 px-3 text-center">
                      {currentGrade ? (
                        <span
                          className={`inline-flex items-center justify-center w-8 h-8 rounded-lg border text-sm ${getGradeBadge(
                            currentGrade.score
                          )}`}
                        >
                          {currentGrade.score}
                        </span>
                      ) : (
                        <span className="text-slate-300 font-mono text-sm">—</span>
                      )}
                    </td>

                    {/* Grade Type / Topic */}
                    <td className="py-2.5 px-3">
                      {currentGrade ? (
                        <div>
                          <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                            {currentGrade.type === 'thematic'
                              ? 'Թեմատիկ'
                              : currentGrade.type === 'formative'
                              ? 'Ձևավորող'
                              : currentGrade.type === 'practical'
                              ? 'Գործնական'
                              : 'Բանավոր'}
                          </span>
                          <p className="text-[11px] text-slate-500 truncate max-w-[140px]" title={currentGrade.topic}>
                            {currentGrade.topic}
                          </p>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px] italic">
                          {lang === 'hy' ? 'Գնահատված չէ' : 'Not graded'}
                        </span>
                      )}
                    </td>

                    {/* Past grades strip */}
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {Object.entries(student.grades).map(([dt, gr]) => (
                          <span
                            key={dt}
                            className={`w-6 h-6 rounded flex items-center justify-center text-[11px] border font-bold ${getGradeBadge(
                              gr.score
                            )}`}
                            title={`${dt}: ${gr.score} (${gr.type}) - ${gr.topic || ''}`}
                          >
                            {gr.score}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Action */}
                    <td className="py-2.5 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingStudentId(student.id);
                          setNewGradeScore(currentGrade?.score || 8);
                          setNewGradeType(currentGrade?.type || 'oral');
                          setNewGradeTopic(currentGrade?.topic || '');
                        }}
                        className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded text-xs font-semibold transition-colors"
                      >
                        {currentGrade ? (lang === 'hy' ? 'Փոխել' : 'Edit') : lang === 'hy' ? '+ Գնահատել' : '+ Grade'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grade Entry Dialog Modal */}
      {editingStudentId && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full border border-slate-200 p-5">
            <h4 className="text-base font-bold text-slate-900 mb-1">
              {lang === 'hy' ? 'Գնահատականի Գրանցում' : 'Record Student Grade'}
            </h4>
            <p className="text-xs text-slate-500 mb-4">
              {students.find((s) => s.id === editingStudentId)?.fullNameHy} • {selectedClassGrade} • {activeDateKey}
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {lang === 'hy' ? 'Գնահատական (ՀՀ 10-բալանոց սանդղակ)' : 'Score (RA 10-Point Scale)'}
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setNewGradeScore(num)}
                      className={`h-9 rounded-lg font-bold text-sm border transition-all ${
                        newGradeScore === num
                          ? 'bg-blue-600 text-white border-blue-700 shadow-xs scale-105'
                          : `${getGradeBadge(num)} hover:brightness-95`
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
                <div className="text-[11px] text-slate-500 mt-1.5 flex items-center justify-between">
                  <span>1-3: Անբավարար</span>
                  <span>4-6: Բավարար</span>
                  <span>7-8: Լավ</span>
                  <span>9-10: Գերազանց</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {lang === 'hy' ? 'Գնահատման Տիպ' : 'Assessment Type'}
                </label>
                <select
                  value={newGradeType}
                  onChange={(e) => setNewGradeType(e.target.value as GradeType)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                >
                  <option value="oral">Բանավոր հարցում (Oral check)</option>
                  <option value="thematic">Թեմատիկ գրավոր աշխատանք (Thematic written)</option>
                  <option value="practical">Գործնական / Լաբորատոր աշխատանք (Practical work)</option>
                  <option value="formative">Ձևավորող գնահատում (Formative)</option>
                  <option value="summative">Կիսամյակային ամփոփիչ (Summative)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {lang === 'hy' ? 'Թեմա / ՀՊՉ Չափորոշիչ' : 'Topic / State Standard Ref'}
                </label>
                <input
                  type="text"
                  value={newGradeTopic}
                  onChange={(e) => setNewGradeTopic(e.target.value)}
                  placeholder={lang === 'hy' ? 'Օրինակ՝ Քառակուսային եռանդամ' : 'e.g. Quadratic equations'}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={() => setEditingStudentId(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 rounded-md"
              >
                {lang === 'hy' ? 'Չեղարկել' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={() => handleUpdateGrade(editingStudentId, newGradeScore, newGradeType, newGradeTopic)}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-xs transition-colors"
              >
                {lang === 'hy' ? 'Պահպանել մատյանում' : 'Save to Gradebook'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
