
import React, { useState, useCallback, useEffect } from 'react';
import { summarizeText } from './services/geminiService';
import { Button } from './components/Button';
import { Icon, IconName } from './components/Icon';
import { Spinner } from './components/Spinner';

const App: React.FC = () => {
  const [inputText, setInputText] = useState<string>('');
  const [summary, setSummary] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [apiKeyMissing, setApiKeyMissing] = useState<boolean>(false);
  const [copyNotification, setCopyNotification] = useState<string | null>(null);

  useEffect(() => {
    if (!process.env.API_KEY) {
      setApiKeyMissing(true);
      setError("Gemini API key is missing. Please set the API_KEY environment variable.");
    }
  }, []);

  const handleSummarize = useCallback(async () => {
    if (apiKeyMissing) return;
    if (!inputText.trim()) {
      setError("Please enter some text to summarize.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setSummary('');
    try {
      const result = await summarizeText(inputText);
      setSummary(result);
    } catch (e: any) {
      console.error("Summarization error:", e);
      setError(e.message || "Failed to summarize text. Check console for details.");
    } finally {
      setIsLoading(false);
    }
  }, [inputText, apiKeyMissing]);

  const handleClear = () => {
    setInputText('');
    setSummary('');
    setError(null);
    setCopyNotification(null);
  };

  const showCopyNotification = (message: string) => {
    setCopyNotification(message);
    setTimeout(() => {
      setCopyNotification(null);
    }, 2000);
  };

  const copyToClipboard = async (text: string, type: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      showCopyNotification(`${type} copied to clipboard!`);
    } catch (err) {
      console.error('Failed to copy text: ', err);
      showCopyNotification(`Failed to copy ${type}.`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-8 bg-slate-900">
      <header className="mb-6 md:mb-8 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-sky-400 flex items-center justify-center space-x-3">
          <Icon name={IconName.Sparkles} className="w-10 h-10 text-amber-400" />
          <span>QuickJot AI</span>
        </h1>
        <p className="text-slate-400 mt-2 text-sm md:text-base">Jot down notes and get AI-powered summaries instantly.</p>
      </header>

      {apiKeyMissing && (
        <div className="mb-4 p-4 bg-red-800 border border-red-700 text-red-200 rounded-lg flex items-center space-x-2">
          <Icon name={IconName.Warning} className="w-6 h-6" />
          <p><strong>Configuration Error:</strong> Gemini API key (API_KEY) is not set. AI features will not work.</p>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-900 border border-red-700 text-red-300 rounded-md text-sm flex items-center space-x-2">
          <Icon name={IconName.Warning} className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {copyNotification && (
        <div className="fixed top-5 right-5 bg-green-600 text-white py-2 px-4 rounded-md shadow-lg transition-opacity duration-300 z-50">
          {copyNotification}
        </div>
      )}

      <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {/* Input Section */}
        <div className="bg-slate-800 p-4 md:p-6 rounded-xl shadow-2xl flex flex-col border border-slate-700">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-semibold text-sky-400">Your Note</h2>
            <Button onClick={handleClear} variant="secondary" size="sm" disabled={isLoading}>
              <Icon name={IconName.Trash} className="w-4 h-4 mr-1.5" />
              Clear
            </Button>
          </div>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Start typing your thoughts here..."
            className="flex-grow w-full p-3 bg-slate-900 text-slate-200 border border-slate-700 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors duration-200 resize-none text-sm"
            rows={15}
            disabled={isLoading}
          />
          <div className="mt-4 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <Button 
              onClick={handleSummarize} 
              disabled={isLoading || apiKeyMissing || !inputText.trim()} 
              className="w-full sm:w-auto"
            >
              {isLoading ? (
                <Spinner />
              ) : (
                <Icon name={IconName.Sparkles} className="w-5 h-5 mr-2 text-amber-300" />
              )}
              Summarize with AI
            </Button>
            <Button 
              onClick={() => copyToClipboard(inputText, "Note")} 
              variant="outline" 
              disabled={isLoading || !inputText.trim()}
              className="w-full sm:w-auto"
            >
              <Icon name={IconName.Clipboard} className="w-4 h-4 mr-1.5" />
              Copy Note
            </Button>
          </div>
        </div>

        {/* Summary Section */}
        <div className="bg-slate-800 p-4 md:p-6 rounded-xl shadow-2xl flex flex-col border border-slate-700">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-semibold text-sky-400">AI Summary</h2>
            {summary && !isLoading && (
               <Button 
                onClick={() => copyToClipboard(summary, "Summary")} 
                variant="outline" 
                size="sm"
              >
                <Icon name={IconName.Clipboard} className="w-4 h-4 mr-1.5" />
                Copy Summary
              </Button>
            )}
          </div>
          {isLoading && !summary ? (
             <div className="flex-grow flex items-center justify-center text-slate-400">
                <Spinner size="lg"/> 
                <span className="ml-3">Generating summary...</span>
            </div>
          ) : summary ? (
            <div className="flex-grow p-3 bg-slate-900 border border-slate-700 rounded-md overflow-y-auto text-slate-200 text-sm whitespace-pre-wrap">
              {summary}
            </div>
          ) : (
            <div className="flex-grow flex items-center justify-center text-slate-500 italic p-3 bg-slate-900 border border-slate-700 rounded-md">
              {apiKeyMissing ? "AI features disabled." : error ? "Summary could not be generated." : "Summary will appear here..."}
            </div>
          )}
        </div>
      </div>
      <footer className="text-center mt-8 text-xs text-slate-500">
        <p>Powered by Gemini API. &copy; {new Date().getFullYear()} QuickJot AI.</p>
      </footer>
    </div>
  );
};

export default App;
