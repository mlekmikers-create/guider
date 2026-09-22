import React, { useState } from 'react';
import { AIProviderConfig, AIProviderId, Language } from '../types';
import { X, CheckCircle2, AlertCircle, Sparkles, Server, Key, Cpu, HelpCircle, RefreshCw } from 'lucide-react';

interface AIConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AIProviderConfig;
  onSaveConfig: (cfg: AIProviderConfig) => void;
  lang: Language;
}

export const AIConfigModal: React.FC<AIConfigModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  lang,
}) => {
  const [activeProvider, setActiveProvider] = useState<AIProviderId>(config.activeProvider);
  const [openaiKey, setOpenaiKey] = useState(config.openaiKey || '');
  const [openaiModel, setOpenaiModel] = useState(config.openaiModel || 'gpt-4o-mini');
  const [firebirdBaseUrl, setFirebirdBaseUrl] = useState(config.firebirdBaseUrl || 'https://api.firebird.ai/v1');
  const [firebirdKey, setFirebirdKey] = useState(config.firebirdKey || '');
  const [firebirdModel, setFirebirdModel] = useState(config.firebirdModel || 'firebird-edu-v1');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const response = await fetch('/api/ai/test-provider', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: activeProvider,
          customApiKey: activeProvider === 'openai' ? openaiKey : firebirdKey,
          customBaseUrl: activeProvider === 'firebird' ? firebirdBaseUrl : undefined,
          customModel: activeProvider === 'openai' ? openaiModel : firebirdModel,
        }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setTestResult({
          success: true,
          message: data.message || (lang === 'hy' ? 'Կապը հաջողությամբ ստուգված է:' : 'Connection test successful.'),
        });
      } else {
        setTestResult({
          success: false,
          message: data.error || (lang === 'hy' ? 'Կապի սխալ: Ստուգեք բանալին կամ հասցեն:' : 'Connection failed. Check key or endpoint.'),
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Network error testing AI endpoint',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    onSaveConfig({
      activeProvider,
      openaiKey,
      openaiModel,
      firebirdBaseUrl,
      firebirdKey,
      firebirdModel,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">
                {lang === 'hy' ? 'AI Շարժիչների Կարգավորում' : 'AI Engine & Model Gateway'}
              </h3>
              <p className="text-xs text-slate-300">
                {lang === 'hy'
                  ? 'ChatGPT (OpenAI), Firebird AI և Gemini ինտեգրում հայկական դպրոցների համար'
                  : 'ChatGPT (OpenAI), Firebird AI, and Gemini integrations for Armenian schools'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Provider Selection Cards */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              {lang === 'hy' ? 'Ընտրեք ակտիվ AI շարժիչը' : 'Select Active AI Provider'}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Gemini Card */}
              <button
                type="button"
                onClick={() => {
                  setActiveProvider('gemini');
                  setTestResult(null);
                }}
                className={`p-3 rounded-lg border text-left transition-all relative ${
                  activeProvider === 'gemini'
                    ? 'border-blue-600 bg-blue-50/70 shadow-xs ring-2 ring-blue-500/20'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-sm text-slate-900">Google Gemini</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-semibold">
                    Կառուցված
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  {lang === 'hy'
                    ? 'Gemini 3.8 Flash (Արագ, սերվերային կառավարում)'
                    : 'Gemini 3.8 Flash (High-speed server managed)'}
                </p>
              </button>

              {/* OpenAI / ChatGPT Card */}
              <button
                type="button"
                onClick={() => {
                  setActiveProvider('openai');
                  setTestResult(null);
                }}
                className={`p-3 rounded-lg border text-left transition-all relative ${
                  activeProvider === 'openai'
                    ? 'border-emerald-600 bg-emerald-50/70 shadow-xs ring-2 ring-emerald-500/20'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-sm text-slate-900">ChatGPT / OpenAI</span>
                  <Cpu className="w-4 h-4 text-emerald-600" />
                </div>
                <p className="text-xs text-slate-500">
                  {lang === 'hy'
                    ? 'GPT-4o, GPT-4o-mini (OpenAI API բանալիով)'
                    : 'GPT-4o / GPT-4o-mini with direct API key'}
                </p>
              </button>

              {/* Firebird Card */}
              <button
                type="button"
                onClick={() => {
                  setActiveProvider('firebird');
                  setTestResult(null);
                }}
                className={`p-3 rounded-lg border text-left transition-all relative ${
                  activeProvider === 'firebird'
                    ? 'border-amber-600 bg-amber-50/70 shadow-xs ring-2 ring-amber-500/20'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-sm text-slate-900">Firebird AI</span>
                  <Server className="w-4 h-4 text-amber-600" />
                </div>
                <p className="text-xs text-slate-500">
                  {lang === 'hy'
                    ? 'Fyrbird / Կրթական custom API պորտ'
                    : 'Firebird / Custom Educational LLM endpoint'}
                </p>
              </button>
            </div>
          </div>

          {/* Configuration Fields depending on selected provider */}
          {activeProvider === 'gemini' && (
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs text-slate-600 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-slate-800 text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>
                  {lang === 'hy'
                    ? 'Gemini 3.8 Flash պատրաստ է աշխատանքի'
                    : 'Gemini 3.8 Flash Ready for Armenian Education Standard'}
                </span>
              </div>
              <p>
                {lang === 'hy'
                  ? 'Այս շարժիչն արդեն ինտեգրված է սերվերային մակարդակում: Այն տիրապետում է ՀՀ ԿԳՄՍՆ ՀՊՉ չափորոշիչներին, ԽԻԿ մեթոդաբանությանը և հայերեն մանկավարժական տերմինաբանությանը:'
                  : 'Pre-configured on the secure Express backend. Fully instructed with Republic of Armenia MoESCS state curriculum standards, ERR pedagogical methodology, and Armenian pedagogical etiquette.'}
              </p>
            </div>
          )}

          {activeProvider === 'openai' && (
            <div className="bg-emerald-50/50 p-4 rounded-lg border border-emerald-200 space-y-3">
              <div className="flex items-center gap-2 font-semibold text-emerald-950 text-sm">
                <Key className="w-4 h-4 text-emerald-700" />
                <span>{lang === 'hy' ? 'OpenAI / ChatGPT Կոնֆիգուրացիա' : 'OpenAI / ChatGPT Configuration'}</span>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  OpenAI API Key (sk-...)
                </label>
                <input
                  type="password"
                  value={openaiKey}
                  onChange={(e) => setOpenaiKey(e.target.value)}
                  placeholder="sk-proj-..."
                  className="w-full text-xs font-mono px-3 py-2 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  {lang === 'hy'
                    ? 'Եթե դաշտը դատարկ է, կօգտագործվի սերվերի OPENAI_API_KEY միջավայրի փոփոխականը:'
                    : 'If left blank, the server-side OPENAI_API_KEY environment variable will be used.'}
                </p>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  {lang === 'hy' ? 'Մոդել' : 'Model'}
                </label>
                <select
                  value={openaiModel}
                  onChange={(e) => setOpenaiModel(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  <option value="gpt-4o-mini">gpt-4o-mini (Արագ և արդյունավետ / Fast & Cost-effective)</option>
                  <option value="gpt-4o">gpt-4o (Խորացված մտածողություն / Advanced Reasoning)</option>
                </select>
              </div>
            </div>
          )}

          {activeProvider === 'firebird' && (
            <div className="bg-amber-50/50 p-4 rounded-lg border border-amber-200 space-y-3">
              <div className="flex items-center gap-2 font-semibold text-amber-950 text-sm">
                <Server className="w-4 h-4 text-amber-700" />
                <span>{lang === 'hy' ? 'Firebird / Custom LLM Կարգավորում' : 'Firebird / Custom LLM Gateway'}</span>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  API Base Endpoint
                </label>
                <input
                  type="text"
                  value={firebirdBaseUrl}
                  onChange={(e) => setFirebirdBaseUrl(e.target.value)}
                  placeholder="https://api.firebird.ai/v1 or http://localhost:11434/v1"
                  className="w-full text-xs font-mono px-3 py-2 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    API Key / Token
                  </label>
                  <input
                    type="password"
                    value={firebirdKey}
                    onChange={(e) => setFirebirdKey(e.target.value)}
                    placeholder="Bearer token or custom key"
                    className="w-full text-xs font-mono px-3 py-2 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Model Identifier
                  </label>
                  <input
                    type="text"
                    value={firebirdModel}
                    onChange={(e) => setFirebirdModel(e.target.value)}
                    placeholder="firebird-edu-v1"
                    className="w-full text-xs font-mono px-3 py-2 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Test Status Banner */}
          {testResult && (
            <div
              className={`p-3 rounded-lg text-xs flex items-start gap-2 ${
                testResult.success
                  ? 'bg-emerald-50 text-emerald-900 border border-emerald-300'
                  : 'bg-red-50 text-red-900 border border-red-300'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              )}
              <div className="break-all">{testResult.message}</div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={isTesting}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors disabled:opacity-50 shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
            <span>
              {isTesting
                ? lang === 'hy'
                  ? 'Ստուգվում է...'
                  : 'Testing...'
                : lang === 'hy'
                ? 'Ստուգել կապը'
                : 'Test Connection'}
            </span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-md transition-colors"
            >
              {lang === 'hy' ? 'Չեղարկել' : 'Cancel'}
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-xs transition-colors"
            >
              {lang === 'hy' ? 'Պահպանել կարգավորումները' : 'Save AI Configuration'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
