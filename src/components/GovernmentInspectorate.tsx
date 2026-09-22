import React, { useState } from 'react';
import { TeacherMetric, NationalEducationStats, MarzName, Language } from '../types';
import {
  ShieldAlert,
  ShieldCheck,
  Building2,
  Users,
  GraduationCap,
  TrendingUp,
  AlertTriangle,
  FileSpreadsheet,
  Download,
  Filter,
  CheckCircle,
  Eye,
  FileText,
  BadgeAlert,
  Award,
} from 'lucide-react';

interface GovernmentInspectorateProps {
  stats: NationalEducationStats;
  teachers: TeacherMetric[];
  onUpdateTeacher: (teacher: TeacherMetric) => void;
  lang: Language;
}

export const GovernmentInspectorate: React.FC<GovernmentInspectorateProps> = ({
  stats,
  teachers,
  onUpdateTeacher,
  lang,
}) => {
  const [selectedMarz, setSelectedMarz] = useState<string>('all');
  const [selectedRisk, setSelectedRisk] = useState<string>('all');
  const [activeTeacherDossier, setActiveTeacherDossier] = useState<TeacherMetric | null>(null);
  const [showCertificateModal, setShowCertificateModal] = useState(false);

  const filteredTeachers = teachers.filter((t) => {
    if (selectedMarz !== 'all' && t.marz !== selectedMarz) return false;
    if (selectedRisk !== 'all' && t.gradeInflationRisk !== selectedRisk) return false;
    return true;
  });

  const handlePrintCertificate = () => {
    window.print();
  };

  const handleMarkCompliant = (teacher: TeacherMetric) => {
    const updated: TeacherMetric = {
      ...teacher,
      stateInspectionStatus: 'compliant',
      gradeInflationRisk: 'low',
      inspectorNotes: 'ՀՀ ԿԳՄՍՆ տեսչական ստուգումն ավարտվել է: Գնահատականների համապատասխանությունը ՀՊՉ-ին հաստատված է:',
      lastInspectionDate: new Date().toISOString().split('T')[0],
    };
    onUpdateTeacher(updated);
    setActiveTeacherDossier(updated);
  };

  return (
    <div className="space-y-6">
      {/* State Insignia Top Banner */}
      <div className="bg-linear-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-xl p-6 shadow-md border border-slate-700">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-inner">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-amber-400 font-bold uppercase tracking-widest text-[11px]">
                  ՀՀ ԿԳՄՍՆ • Պետական Տեսչական Վարչություն
                </span>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded text-[10px] font-semibold">
                  ՕՊԵՐԱՏԻՎ ՄՈՆԻԹՈՐԻՆԳ 2026
                </span>
              </div>
              <h2 className="text-xl font-black tracking-tight text-white mt-1">
                {lang === 'hy'
                  ? 'Հանրապետական Կրթական Չափորոշիչների և Ուսուցիչների Աշխատանքի Որակի Վերահսկողություն'
                  : 'State Inspectorate: National Standard Compliance & Teacher Quality Audit'}
              </h2>
              <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
                {lang === 'hy'
                  ? 'Հայաստանի Հանրապետության 1354 դպրոցների էլեկտրոնային մատյանների, գնահատման օբյեկտիվության և ծրագրային նյութի կատարողականի իրական ժամանակում մոնիթորինգ'
                  : 'Real-time state auditing of syllabus completion, grading objectivity, and e-journal regularity across all Armenian public schools.'}
              </p>
            </div>
          </div>

          <button
            id="print-state-certificate-btn"
            onClick={() => setShowCertificateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold transition-all shadow-sm"
          >
            <FileText className="w-4 h-4" />
            <span>{lang === 'hy' ? 'Գեներացնել Պետական Տեղեկանք' : 'Official State Audit Report'}</span>
          </button>
        </div>

        {/* National Macro Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mt-6 pt-6 border-t border-slate-700/80">
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Դպրոցներ</div>
            <div className="text-lg font-bold text-white mt-0.5">{stats.totalSchools}</div>
            <div className="text-[10px] text-slate-400">11 մարզերում</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Ուսուցիչներ</div>
            <div className="text-lg font-bold text-white mt-0.5">{stats.totalTeachers.toLocaleString()}</div>
            <div className="text-[10px] text-emerald-400">76% ատեստավորված</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Աշակերտներ</div>
            <div className="text-lg font-bold text-white mt-0.5">{stats.totalStudents.toLocaleString()}</div>
            <div className="text-[10px] text-slate-400">1-12 դասարաններ</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">ՀՀ Միջին Գնահատական</div>
            <div className="text-lg font-bold text-amber-300 mt-0.5">{stats.nationalAverageGrade} / 10</div>
            <div className="text-[10px] text-slate-400">Բավարարից բարձր</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Ծրագրի Կատարողական</div>
            <div className="text-lg font-bold text-emerald-400 mt-0.5">{stats.syllabusProgressPct}%</div>
            <div className="text-[10px] text-emerald-400">Ըստ գրաֆիկի</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">ՀՊՉ Ներդրման Ինդեքս</div>
            <div className="text-lg font-bold text-indigo-300 mt-0.5">{stats.stateStandardImplementationPct}%</div>
            <div className="text-[10px] text-slate-400">Նոր չափորոշիչ</div>
          </div>
        </div>
      </div>

      {/* Marz Performance Map / Strip */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-slate-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              {lang === 'hy'
                ? 'Մարզային Կատարողականի և Տեսչական Անցողիկության Ցուցիչներ'
                : 'Marz-by-Marz Inspection & Syllabus Pass Rates'}
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">ՀՀ 10 մարզեր + Երևան</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2.5">
          {stats.marzPerformance.map((mp) => (
            <div
              key={mp.marz}
              onClick={() => setSelectedMarz(mp.marz)}
              className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
                selectedMarz === mp.marz
                  ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-500/20'
                  : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-bold text-slate-900 mb-1">
                <span>{mp.marz}</span>
                <span className="text-[10px] font-mono text-slate-500">{mp.schoolsCount} դպրոց</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-600">
                <span>Միջին՝ <strong>{mp.avgGrade}</strong></span>
                <span className="text-emerald-700 font-semibold">{mp.inspectionPassRate}%</span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1.5">
                <div
                  className="bg-blue-600 h-full rounded-full"
                  style={{ width: `${mp.syllabusPct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Teacher Inspection Registry Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/60">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              {lang === 'hy'
                ? 'Ուսուցիչների Աուդիտի Ռեգիստր • Գնահատականների Օբյեկտիվության Վերլուծություն'
                : 'Teacher Inspection Registry & Grade Inflation Analysis'}
            </h3>
            <p className="text-xs text-slate-500">
              {lang === 'hy'
                ? 'Ուսուցչի էլեկտրոնային մատյանի վարման, ծրագրի կատարման և գնահատականների շեղման ավտոմատ ստուգում'
                : 'Automated verification of teacher grading regularity, syllabus progress, and inflation risks'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Filter by Marz */}
            <select
              value={selectedMarz}
              onChange={(e) => setSelectedMarz(e.target.value)}
              className="text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg focus:outline-hidden"
            >
              <option value="all">Բոլոր Մարզերը (All Marzes)</option>
              {stats.marzPerformance.map((m) => (
                <option key={m.marz} value={m.marz}>
                  {m.marz}
                </option>
              ))}
            </select>

            {/* Filter by Risk */}
            <select
              value={selectedRisk}
              onChange={(e) => setSelectedRisk(e.target.value)}
              className="text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg focus:outline-hidden"
            >
              <option value="all">Բոլոր Ռիսկերը (All)</option>
              <option value="high">Ուռճացման Ռիսկ (High Inflation Risk)</option>
              <option value="low">Նորմալ Օբյեկտիվ (Compliant)</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3 font-bold">{lang === 'hy' ? 'Ուսուցիչ / Դպրոց' : 'Teacher / School'}</th>
                <th className="py-2.5 px-3 font-bold">{lang === 'hy' ? 'Մարզ / Առարկա' : 'Marz / Subject'}</th>
                <th className="py-2.5 px-3 font-bold">{lang === 'hy' ? 'Որակավորման Կարգ' : 'Qualification'}</th>
                <th className="py-2.5 px-3 font-bold text-center">{lang === 'hy' ? 'Ծրագրի Կատարում' : 'Syllabus %'}</th>
                <th className="py-2.5 px-3 font-bold text-center">{lang === 'hy' ? 'Միջին Բալ' : 'GPA'}</th>
                <th className="py-2.5 px-3 font-bold">{lang === 'hy' ? 'Գնահատման Օբյեկտիվություն' : 'Grade Objectivity'}</th>
                <th className="py-2.5 px-3 font-bold">{lang === 'hy' ? 'Տեսչական Կարգավիճակ' : 'Inspection Status'}</th>
                <th className="py-2.5 px-3 text-right font-bold">{lang === 'hy' ? 'Գործողություն' : 'Audit'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredTeachers.map((teacher) => {
                const isRisk = teacher.gradeInflationRisk === 'high';
                const isDistinguished = teacher.stateInspectionStatus === 'distinguished';

                return (
                  <tr key={teacher.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{teacher.fullName}</div>
                      <div className="text-[11px] text-slate-500">{teacher.schoolName}</div>
                    </td>

                    <td className="py-3 px-3">
                      <span className="font-semibold text-slate-700">{teacher.marz}</span>
                      <div className="text-[11px] text-slate-500">{teacher.subject}</div>
                    </td>

                    <td className="py-3 px-3">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                        {teacher.qualificationCategory}
                      </span>
                      <div className="text-[10px] text-slate-400 mt-0.5">{teacher.experienceYears} տարվա ստաժ</div>
                    </td>

                    <td className="py-3 px-3 text-center font-bold">
                      <div className="text-slate-900">{teacher.syllabusCompletionPct}%</div>
                      <div className="w-16 mx-auto bg-slate-200 h-1 rounded-full mt-1">
                        <div
                          className="bg-emerald-600 h-full rounded-full"
                          style={{ width: `${teacher.syllabusCompletionPct}%` }}
                        />
                      </div>
                    </td>

                    <td className="py-3 px-3 text-center">
                      <span className="font-black text-slate-900 text-sm">{teacher.averageClassGrade}</span>
                      <span className="text-[10px] text-slate-400 block">/ 10</span>
                    </td>

                    <td className="py-3 px-3">
                      {isRisk ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Ուռճացման ռիսկ (High)</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                          <CheckCircle className="w-3 h-3" />
                          <span>Օբյեկտիվ (Բալանսավորված)</span>
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3">
                      {isDistinguished ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-800 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                          <Award className="w-3 h-3 text-amber-500" />
                          <span>Օրինակելի Մանկավարժ</span>
                        </span>
                      ) : teacher.stateInspectionStatus === 'needs_audit' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-900 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                          <ShieldAlert className="w-3 h-3 text-amber-600" />
                          <span>Պահանջվում է Ստուգում</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                          Հաստատված է
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => setActiveTeacherDossier(teacher)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded text-xs font-semibold transition-colors inline-flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        <span>{lang === 'hy' ? 'Դոսյե' : 'Dossier'}</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Teacher Dossier Modal */}
      {activeTeacherDossier && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-amber-300" />
                <h3 className="font-bold text-base">
                  {lang === 'hy' ? 'Ուսուցչի Պետական Տեսչական Դոսյե' : 'State Pedagogical Dossier'}
                </h3>
              </div>
              <button
                onClick={() => setActiveTeacherDossier(null)}
                className="text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="border-b border-slate-200 pb-3">
                <h4 className="text-base font-bold text-slate-900">{activeTeacherDossier.fullName}</h4>
                <div className="text-slate-500 mt-0.5">
                  {activeTeacherDossier.schoolName} • {activeTeacherDossier.marz}
                </div>
                <div className="text-blue-700 font-semibold mt-1">
                  Առարկա՝ {activeTeacherDossier.subject} ({activeTeacherDossier.experienceYears} տարվա փորձ)
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block font-medium">Ծրագրի Կատարողական</span>
                  <span className="text-lg font-bold text-slate-900">
                    {activeTeacherDossier.syllabusCompletionPct}%
                  </span>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block font-medium">Դասարանների Միջին Բալ</span>
                  <span className="text-lg font-bold text-slate-900">
                    {activeTeacherDossier.averageClassGrade} / 10
                  </span>
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-700 block mb-1">Տեսչական Նշումներ և Եզրակացություն՝</span>
                <p className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-slate-700 leading-relaxed">
                  {activeTeacherDossier.inspectorNotes || 'Խախտումներ չեն հայտնաբերվել:'}
                </p>
              </div>

              {activeTeacherDossier.gradeInflationRisk === 'high' && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-900 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Ուռճացման Ռիսկի Պարզաբանում՝</strong> Գնահատականների շեղումը գերազանցում է նորմատիվային 15%-ը: Ուսուցչին հանձնարարվել է անցկացնել կրկնակի կույր թեմատիկ գրավոր:
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between">
              {activeTeacherDossier.gradeInflationRisk === 'high' ? (
                <button
                  type="button"
                  onClick={() => handleMarkCompliant(activeTeacherDossier)}
                  className="px-3.5 py-1.5 bg-emerald-600 text-white rounded-md text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-2xs"
                >
                  Հաստատել Որակավորումը (Վերականգնել)
                </button>
              ) : (
                <span className="text-slate-500 text-[11px]">Կարգավիճակը կայուն է</span>
              )}

              <button
                type="button"
                onClick={() => setActiveTeacherDossier(null)}
                className="px-4 py-1.5 bg-slate-800 text-white rounded-md text-xs font-semibold hover:bg-slate-900 transition-colors"
              >
                Փակել
              </button>
            </div>
          </div>
        </div>
      )}

      {/* State Certificate Printable Modal */}
      {showCertificateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between print:hidden">
              <span className="font-bold text-sm">Պաշտոնական Պետական Տեղեկանք (Print Ready)</span>
              <button
                onClick={() => setShowCertificateModal(false)}
                className="text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            {/* Certificate Formatted Content */}
            <div className="p-8 overflow-y-auto space-y-6 text-slate-900 font-serif leading-relaxed">
              <div className="text-center border-b-2 border-slate-900 pb-4">
                <div className="text-xs uppercase font-bold tracking-widest text-slate-600">
                  ՀԱՅԱՍՏԱՆԻ ՀԱՆՐԱՊԵՏՈՒԹՅԱՆ ԿՐԹՈՒԹՅԱՆ, ԳԻՏՈՒԹՅԱՆ, ՄՇԱԿՈՒՅԹԻ ԵՎ ՍՊՈՐՏԻ ՆԱԽԱՐԱՐՈՒԹՅՈՒՆ
                </div>
                <div className="text-sm font-bold mt-2">ՊԵՏԱԿԱՆ ՏԵՍՉԱԿԱՆ ԱՄՓՈՓԱԳԻՐ</div>
                <div className="text-xs text-slate-500 mt-1">
                  Գրանցման համար՝ ՀՀ-ԿԳՄՍՆ-2026/09-ԱՈՒԴԻՏ
                </div>
              </div>

              <div className="text-xs space-y-3 font-sans">
                <p>
                  Սույնով հաստատվում է, որ Հայաստանի Հանրապետության հանրակրթական ուսումնական հաստատություններում իրականացված էլեկտրոնային տեսչական աուդիտի արդյունքներով՝
                </p>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2">
                  <div className="flex justify-between">
                    <span>Ստուգված դպրոցների քանակը՝</span>
                    <strong>1,354 հաստատություն</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Հանրապետական միջին առաջադիմության միավորը՝</span>
                    <strong>7.34 / 10 (Բավարարից բարձր)</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Ծրագրային նյութի կատարողականի միջինը՝</span>
                    <strong>94.8% (Չափորոշիչներին համապատասխան)</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>ՀՊՉ վերջնարդյունքների ապահովվածությունը՝</span>
                    <strong>91.2%</strong>
                  </div>
                </div>
                <p>
                  Հանրակրթության պետական չափորոշչի (ՀՊՉ) ներդրման և գնահատման 10-բալանոց սանդղակի կիրառման վերահսկողությունն իրականացված է ամբողջ ծավալով:
                </p>
              </div>

              <div className="pt-8 border-t border-slate-300 flex justify-between items-end text-xs font-sans">
                <div>
                  <div className="text-slate-500">Ամսաթիվ՝ 22/09/2026թ.</div>
                  <div className="text-slate-500">ք. Երևան, Վ. Սարգսյան 3</div>
                </div>
                <div className="text-right">
                  <div className="font-bold">ՀՀ ԿԳՄՍՆ Գլխավոր Տեսուչ</div>
                  <div className="text-slate-400 italic mt-4">[ Էլեկտրոնային Թվային Ստորագրություն ]</div>
                </div>
              </div>
            </div>

            <div className="px-6 py-3 bg-slate-100 border-t border-slate-200 flex items-center justify-end gap-2 print:hidden">
              <button
                type="button"
                onClick={() => setShowCertificateModal(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 rounded-md"
              >
                Փակել
              </button>
              <button
                type="button"
                onClick={handlePrintCertificate}
                className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-xs transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Տպել Տեղեկանքը</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
