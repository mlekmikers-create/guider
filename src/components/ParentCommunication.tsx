import React, { useState } from 'react';
import { ParentCommunicationMessage, StudentRecord, Language, AIProviderConfig } from '../types';
import {
  MessageSquare,
  Sparkles,
  Send,
  Copy,
  Check,
  Phone,
  Clock,
  User,
  Plus,
  Filter,
  CheckCircle2,
  AlertCircle,
  Share2,
} from 'lucide-react';

interface ParentCommunicationProps {
  messages: ParentCommunicationMessage[];
  students: StudentRecord[];
  onSendMessage: (msg: ParentCommunicationMessage) => void;
  lang: Language;
  aiConfig: AIProviderConfig;
}

export const ParentCommunication: React.FC<ParentCommunicationProps> = ({
  messages,
  students,
  onSendMessage,
  lang,
  aiConfig,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');
  const [messageChannel, setMessageChannel] = useState<'viber' | 'telegram' | 'sms' | 'emis_notification'>('viber');
  const [messageCategory, setMessageCategory] = useState<'progress' | 'attendance_alert' | 'thematic_notice' | 'commendation' | 'meeting_invite'>('commendation');
  const [customPrompt, setCustomPrompt] = useState('');
  const [draftArmenian, setDraftArmenian] = useState('');
  const [draftEnglish, setDraftEnglish] = useState('');
  const [draftTitle, setDraftTitle] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showComposeModal, setShowComposeModal] = useState(false);

  const activeStudent = students.find((s) => s.id === selectedStudentId) || students[0];

  const handleGenerateAiMessage = async () => {
    if (!activeStudent) return;
    setIsGenerating(true);
    try {
      const recentGrades = Object.entries(activeStudent.grades)
        .map(([dt, g]) => `${dt}: ${g.score}/10 (${g.type})`)
        .join(', ');

      const prompt = `Կազմել հարգալից, մանկավարժորեն գրագետ և բարեկիրթ ծանուցում աշակերտի ծնողի համար:
Աշակերտ: ${activeStudent.fullNameHy} (9-րդ Ա դասարան)
Ծնող: ${activeStudent.parentName}
Հաղորդակցման կատեգորիա: ${messageCategory}
Կապի միջոց: ${messageChannel.toUpperCase()} (Viber/Telegram/SMS)
Վերջին գնահատականներ՝ ${recentGrades || 'ընթացիկ ուսումնական փուլ'}
Լրացուցիչ նշումներ կամ ուսուցչի ցանկություն՝ ${customPrompt || 'ընդհանուր տեղեկացում'}

Պահանջվում է.
1. Գրել հայերենով՝ հարգալից ողջույնով («Հարգելի տիկին/պարոն...»), հակիրճ, հստակ և կառուցողական:
2. Տրամադրել նաև անգլերեն թարգմանություն:
3. Նամակը հարմարեցնել Viber/Telegram դպրոցական խմբի կամ անձնական նամակի ձևաչափին:`;

      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: 'parent_message',
          provider: aiConfig.activeProvider,
          customApiKey: aiConfig.activeProvider === 'openai' ? aiConfig.openaiKey : aiConfig.firebirdKey,
          customBaseUrl: aiConfig.activeProvider === 'firebird' ? aiConfig.firebirdBaseUrl : undefined,
          customModel: aiConfig.activeProvider === 'openai' ? aiConfig.openaiModel : aiConfig.firebirdModel,
          prompt,
        }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        const text: string = data.result || '';
        // Extract or default
        setDraftTitle(
          messageCategory === 'commendation'
            ? 'Շնորհակալական նամակ բարձր առաջադիմության համար'
            : messageCategory === 'attendance_alert'
            ? 'Ծանուցում բացակայությունների մասին'
            : 'Տեղեկատվական հաղորդագրություն ուսուցչից'
        );
        setDraftArmenian(text);
        setDraftEnglish('Official notification regarding student academic participation.');
      } else {
        alert(data.error || 'AI generation failed');
      }
    } catch (err: any) {
      alert(`Սխալ: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendDraft = () => {
    if (!draftArmenian || !activeStudent) return;
    const newMsg: ParentCommunicationMessage = {
      id: `msg-${Date.now()}`,
      studentId: activeStudent.id,
      studentName: activeStudent.fullNameHy,
      parentName: activeStudent.parentName,
      parentPhone: activeStudent.parentPhone,
      category: messageCategory,
      channel: messageChannel,
      title: draftTitle || 'Ծանուցում',
      bodyArmenian: draftArmenian,
      bodyEnglish: draftEnglish,
      sentAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      status: 'sent',
    };
    onSendMessage(newMsg);
    setShowComposeModal(false);
    setDraftArmenian('');
    setDraftEnglish('');
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredMessages = messages.filter((m) => {
    if (selectedCategory === 'all') return true;
    return m.category === selectedCategory;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner and Actions */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">
              {lang === 'hy'
                ? 'Ծնողական Հաղորդակցության Կենտրոն'
                : 'Parent Communication & School Notices'}
            </h2>
            <span className="text-[11px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-semibold">
              Viber • Telegram • SMS
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {lang === 'hy'
              ? 'Անհատականացված և խմբային բարեկիրթ ծանուցումներ աշակերտների առաջադիմության և կարգապահության մասին'
              : 'Personalized polite notices regarding grades, attendance, and school meetings'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="open-parent-compose-btn"
            onClick={() => setShowComposeModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{lang === 'hy' ? 'Կազմել Նոր Ծանուցում' : 'Compose Notice'}</span>
          </button>
        </div>
      </div>

      {/* Categories Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
            selectedCategory === 'all'
              ? 'bg-slate-900 text-white shadow-2xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          {lang === 'hy' ? 'Բոլոր հաղորդագրությունները' : 'All Messages'} ({messages.length})
        </button>
        <button
          onClick={() => setSelectedCategory('commendation')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
            selectedCategory === 'commendation'
              ? 'bg-emerald-700 text-white shadow-2xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          {lang === 'hy' ? 'Գովասանագիր & Խրախուսում' : 'Commendations'}
        </button>
        <button
          onClick={() => setSelectedCategory('attendance_alert')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
            selectedCategory === 'attendance_alert'
              ? 'bg-amber-700 text-white shadow-2xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          {lang === 'hy' ? 'Բացակայության նախազգուշացում' : 'Attendance Alerts'}
        </button>
        <button
          onClick={() => setSelectedCategory('thematic_notice')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
            selectedCategory === 'thematic_notice'
              ? 'bg-blue-700 text-white shadow-2xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          {lang === 'hy' ? 'Թեմատիկ գրավորի ամփոփում' : 'Exam Digests'}
        </button>
      </div>

      {/* Messages List */}
      <div className="space-y-3">
        {filteredMessages.map((msg) => (
          <div
            key={msg.id}
            className="bg-white rounded-xl border border-slate-200 shadow-2xs p-4 hover:border-slate-300 transition-all"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                    msg.category === 'commendation'
                      ? 'bg-emerald-100 text-emerald-800'
                      : msg.category === 'attendance_alert'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {msg.category === 'commendation'
                    ? 'Գովասանք'
                    : msg.category === 'attendance_alert'
                    ? 'Բացակայություն'
                    : 'Թեմատիկ'}
                </span>

                <span className="text-xs font-bold text-slate-900">{msg.title}</span>
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {msg.sentAt}
                </span>
                <span className="font-semibold text-slate-700 uppercase text-[10px] bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  {msg.channel}
                </span>
              </div>
            </div>

            <div className="text-xs text-slate-600 flex flex-wrap items-center gap-4 mb-3">
              <div className="flex items-center gap-1 font-medium text-slate-800">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Աշակերտ՝ {msg.studentName}</span>
              </div>
              <div className="flex items-center gap-1 text-slate-600">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  Ծնող՝ {msg.parentName} ({msg.parentPhone})
                </span>
              </div>
            </div>

            {/* Message Body */}
            <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-xs text-slate-800 leading-relaxed whitespace-pre-line font-sans mb-3">
              {msg.bodyArmenian}
            </div>

            {/* Actions: Copy for Viber, Resend */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Ուղարկված է</span>
              </span>

              <button
                type="button"
                onClick={() => handleCopyText(msg.id, msg.bodyArmenian)}
                className="flex items-center gap-1 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-medium transition-colors"
              >
                {copiedId === msg.id ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Պատճենված է Viber/Telegram-ի համար</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Պատճենել (Viber / Telegram)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Compose Modal */}
      {showComposeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-300" />
                <h3 className="font-bold text-base">
                  {lang === 'hy' ? 'Կազմել Ծնողական Ծանուցում (AI Օգնական)' : 'Compose Parent Notice with AI'}
                </h3>
              </div>
              <button
                onClick={() => setShowComposeModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {lang === 'hy' ? 'Աշակերտ' : 'Student'}
                  </label>
                  <select
                    value={selectedStudentId}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  >
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.fullNameHy}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {lang === 'hy' ? 'Կատեգորիա' : 'Category'}
                  </label>
                  <select
                    value={messageCategory}
                    onChange={(e) => setMessageCategory(e.target.value as any)}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  >
                    <option value="commendation">Գովասանագիր & Խրախուսում</option>
                    <option value="attendance_alert">Բացակայության նախազգուշացում</option>
                    <option value="thematic_notice">Թեմատիկ գրավորի արդյունք</option>
                    <option value="meeting_invite">Ծնողական ժողովի հրավեր</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {lang === 'hy' ? 'Կապի ալիք' : 'Channel'}
                  </label>
                  <select
                    value={messageChannel}
                    onChange={(e) => setMessageChannel(e.target.value as any)}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  >
                    <option value="viber">Viber Խումբ / Չատ</option>
                    <option value="telegram">Telegram</option>
                    <option value="sms">SMS</option>
                    <option value="emis_notification">e-EMIS Պաշտոնական</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {lang === 'hy' ? 'Լրացուցիչ նշումներ AI-ի համար (ըստ ցանկության)' : 'Special Instructions for AI'}
                </label>
                <input
                  type="text"
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder={lang === 'hy' ? 'Օրինակ՝ շեշտել երկրաչափության առաջընթացը և խրախուսել մասնակցությունը օլիմպիադային' : 'e.g. emphasize improvement in geometry'}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleGenerateAiMessage}
                  disabled={isGenerating}
                  className="flex items-center gap-1.5 px-4 py-2 bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-lg text-xs font-semibold hover:from-blue-700 hover:to-indigo-700 shadow-xs transition-all disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                  <span>
                    {isGenerating
                      ? lang === 'hy'
                        ? 'AI-ն ստեղծում է նամակը...'
                        : 'Drafting message...'
                      : lang === 'hy'
                      ? 'Գեներացնել Մանկավարժական Նամակ'
                      : 'Generate Teacher Letter'}
                  </span>
                </button>
              </div>

              {/* Draft Box */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {lang === 'hy' ? 'Հաղորդագրության տեքստ (Հայերեն)' : 'Message Text (Armenian)'}
                </label>
                <textarea
                  rows={5}
                  value={draftArmenian}
                  onChange={(e) => setDraftArmenian(e.target.value)}
                  placeholder={lang === 'hy' ? 'Սեղմեք «Գեներացնել» կամ գրեք ձեռքով...' : 'Click generate or enter manual text...'}
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden leading-relaxed"
                />
              </div>
            </div>

            <div className="px-6 py-3 bg-slate-100 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowComposeModal(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 rounded-md"
              >
                {lang === 'hy' ? 'Չեղարկել' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleSendDraft}
                disabled={!draftArmenian.trim()}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-xs transition-colors disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{lang === 'hy' ? 'Գրանցել և Ուղարկել Ծնողին' : 'Register & Send to Parent'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
