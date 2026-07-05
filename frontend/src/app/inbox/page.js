"use client";

import React, { useState } from 'react';
import { 
  Sparkles, Mail, Send, ChevronRight, LogOut, Search, RefreshCw, 
  AlertCircle, Star, ArrowRight, CornerUpLeft, CheckCircle2, MessageSquare, Trash2
} from 'lucide-react';
import UrgencyBadge from '@/components/UrgencyBadge';

const MOCK_THREADS = [
  {
    id: 'thread-1',
    subject: 'Project Kickoff Meeting & Deliverables Schedule',
    from: 'Sarah Connor <sarah@skynet.io>',
    snippet: 'Hi team, let’s schedule our kickoff for next Monday. I need all engineering requirements doc by Friday evening so we can review before the call...',
    urgency: 'High',
    intent: 'Action Required',
    date: '10:42 AM',
    isRead: false,
    body: [
      { sender: 'Sarah Connor', time: '10:42 AM', content: 'Hi team, let’s schedule our kickoff for next Monday. I need all engineering requirements doc by Friday evening so we can review before the call. Let me know if you need templates.' }
    ]
  },
  {
    id: 'thread-2',
    subject: 'Bug report: OAuth redirect failing on mobile safari browsers',
    from: 'Devin Miller <devin.m@techops.org>',
    snippet: 'Hey team, users are reporting infinite loops during callback login. Attached screenshot of console logs. Urgently need feedback...',
    urgency: 'Critical',
    intent: 'Request',
    date: '9:15 AM',
    isRead: false,
    body: [
      { sender: 'Devin Miller', time: '9:15 AM', content: 'Hey team, users are reporting infinite loops during callback login. Attached screenshot of console logs. Urgently need feedback, we are losing signups.' }
    ]
  },
  {
    id: 'thread-3',
    subject: 'Weekly update: Performance dashboard is 10% faster!',
    from: 'Alex Vance <alex.v@infra-core.com>',
    snippet: 'Just deployed the database index improvements to production. Initial query benchmarks show response times cut by 150ms on average...',
    urgency: 'Low',
    intent: 'Update',
    date: 'Yesterday',
    isRead: true,
    body: [
      { sender: 'Alex Vance', time: 'Yesterday', content: 'Just deployed the database index improvements to production. Initial query benchmarks show response times cut by 150ms on average. Dashboard loading feels instantly snappy now.' }
    ]
  },
  {
    id: 'thread-4',
    subject: 'Feedback request: New dashboard wireframes design',
    from: 'Jessica Davis <jessica@pixelperfect.design>',
    snippet: 'Hello! I updated the draft based on our whiteboard session. Check out the Figma link and add comments directly. Let’s align soon...',
    urgency: 'Medium',
    intent: 'Question',
    date: 'Jul 3',
    isRead: true,
    body: [
      { sender: 'Jessica Davis', time: 'Jul 3', content: 'Hello! I updated the draft based on our whiteboard session. Check out the Figma link and add comments directly. Let’s align soon so I can start high fidelity designs.' }
    ]
  }
];

export default function InboxDashboard() {
  const [threads, setThreads] = useState(MOCK_THREADS);
  const [selectedId, setSelectedId] = useState('thread-1');
  const [search, setSearch] = useState('');
  const [activeTone, setActiveTone] = useState('formal');
  const [replyText, setReplyText] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [syncing, setSyncing] = useState(false);

  // AI Output cache
  const [summary, setSummary] = useState('Sarah is setting up a project kickoff meeting for next Monday. She needs all engineering requirement documents submitted by Friday. Template guides are available upon request.');
  const [drafts, setDrafts] = useState({
    formal: 'Dear Sarah,\n\nThank you for the update. I will prepare the engineering requirements documentation and ensure it is sent to you by Friday evening.\n\nBest regards,\nDemo User',
    casual: 'Hey Sarah,\n\nSounds good! I will get the requirements docs over to you by Friday afternoon before the kickoff. Let me know if you need anything else.\n\nCheers,\nDemo',
    urgent: 'Hi Sarah,\n\nGot it. I am prioritizing the requirements docs today and will make sure they are uploaded by Friday evening at the latest.\n\nThanks,\nDemo'
  });
  const [followups, setFollowups] = useState([
    'Submit engineering requirements document before Friday evening.',
    'Confirm availability for the Monday kickoff meeting.'
  ]);

  const selectedThread = threads.find(t => t.id === selectedId) || threads[0];

  const handleSelectThread = (thread) => {
    setSelectedId(thread.id);
    // Simulate changing AI panel content
    if (thread.id === 'thread-2') {
      setSummary('Devin reports a critical crash in the OAuth redirect flow on mobile Safari. The team needs to troubleshoot redirect loops immediately to resolve user signup blocks.');
      setDrafts({
        formal: 'Dear Devin,\n\nThank you for reporting this. I will look into the Mobile Safari OAuth redirect logs immediately and follow up with a fix shortly.\n\nSincerely,\nDemo User',
        casual: 'Hey Devin,\n\nThanks for flagging this. I am jumping on the mobile safari redirect loop bug right now. Will update you as soon as I push a patch.\n\nThanks,\nDemo',
        urgent: 'Hi Devin,\n\nUnderstood. Investigating this redirect loop immediately. I expect to have a hotfix deployed within the next hour.\n\nBest,\nDemo'
      });
      setFollowups([
        'Investigate mobile Safari console logs for OAuth redirect loop.',
        'Deploy authentication hotfix.'
      ]);
    } else if (thread.id === 'thread-1') {
      setSummary('Sarah is setting up a project kickoff meeting for next Monday. She needs all engineering requirement documents submitted by Friday. Template guides are available upon request.');
      setDrafts({
        formal: 'Dear Sarah,\n\nThank you for the update. I will prepare the engineering requirements documentation and ensure it is sent to you by Friday evening.\n\nBest regards,\nDemo User',
        casual: 'Hey Sarah,\n\nSounds good! I will get the requirements docs over to you by Friday afternoon before the kickoff. Let me know if you need anything else.\n\nCheers,\nDemo',
        urgent: 'Hi Sarah,\n\nGot it. I am prioritizing the requirements docs today and will make sure they are uploaded by Friday evening at the latest.\n\nThanks,\nDemo'
      });
      setFollowups([
        'Submit engineering requirements document before Friday evening.',
        'Confirm availability for the Monday kickoff meeting.'
      ]);
    }
  };

  const handleSync = () => {
    setSyncing(true);
    setTimeout(() => setSyncing(false), 1200);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* ── Top Navigation ── */}
      <nav className="sticky top-0 z-40 bg-gray-950/80 backdrop-blur-xl border-b border-white/5">
        <div className="w-full px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Sparkles size={12} className="text-white" />
              </div>
              <span className="font-bold text-white text-sm">MailAI</span>
            </div>
            {/* Search */}
            <div className="relative hidden md:block">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input 
                type="text" 
                placeholder="Search subject or sender..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="bg-white/5 border border-white/5 text-xs text-white rounded-lg pl-9 pr-4 py-1.5 w-64 outline-none focus:border-white/10 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={handleSync}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 text-xs text-gray-400 hover:text-white transition-colors"
            >
              <RefreshCw size={12} className={syncing ? 'animate-spin' : ''} /> Sync
            </button>
            <button 
              onClick={() => window.location.href = '/login'}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-gray-500 hover:text-red-400 text-xs transition-colors"
            >
              <LogOut size={12} /> Logout
            </button>
          </div>
        </div>
      </nav>

      {/* ── Dashboard Grid ── */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side: Threads List */}
        <div className="w-full md:w-[350px] lg:w-[400px] border-r border-white/5 flex flex-col shrink-0">
          <div className="p-4 border-b border-white/5 flex items-center justify-between">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Inbox Threads</h2>
            <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-full font-bold">
              {threads.filter(t => !t.isRead).length} New
            </span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-white/5">
            {threads
              .filter(t => t.subject.toLowerCase().includes(search.toLowerCase()) || t.from.toLowerCase().includes(search.toLowerCase()))
              .map(t => (
                <div 
                  key={t.id}
                  onClick={() => handleSelectThread(t)}
                  className={`p-4 cursor-pointer transition-all duration-150 relative ${
                    selectedId === t.id ? 'bg-white/5 border-l-2 border-indigo-500' : 'hover:bg-white/[0.02]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs truncate ${!t.isRead ? 'text-white font-bold' : 'text-gray-400'}`}>
                      {t.from.split(' <')[0]}
                    </span>
                    <span className="text-[10px] text-gray-600 font-medium shrink-0">{t.date}</span>
                  </div>
                  <h3 className={`text-xs truncate mb-1 ${!t.isRead ? 'text-white font-bold' : 'text-gray-300'}`}>
                    {t.subject}
                  </h3>
                  <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">
                    {t.snippet}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <UrgencyBadge urgency={t.urgency} />
                    <span className="text-[9px] text-gray-600 bg-white/5 px-2 py-0.5 rounded-md border border-white/5 font-semibold">
                      {t.intent}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Center: Thread Viewer & Reply */}
        <div className="flex-1 flex flex-col bg-gray-950 overflow-hidden">
          {selectedThread ? (
            <>
              {/* Thread header */}
              <div className="p-4 border-b border-white/5">
                <h1 className="text-sm font-bold text-white mb-1">{selectedThread.subject}</h1>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">{selectedThread.from}</span>
                  <div className="flex items-center gap-2">
                    <UrgencyBadge urgency={selectedThread.urgency} />
                    <span className="text-[10px] text-gray-500 font-bold bg-white/5 px-2 py-0.5 rounded-md">
                      {selectedThread.intent}
                    </span>
                  </div>
                </div>
              </div>

              {/* Thread Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {selectedThread.body.map((msg, i) => (
                  <div key={i} className="bg-gray-900 border border-white/5 rounded-2xl p-4 space-y-2">
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-xs font-bold text-indigo-400">{msg.sender}</span>
                      <span className="text-[10px] text-gray-600">{msg.time}</span>
                    </div>
                    <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-wrap">
                      {msg.content}
                    </p>
                  </div>
                ))}
              </div>

              {/* Reply Editor */}
              <div className="p-4 border-t border-white/5 space-y-3 bg-gray-900/40">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <CornerUpLeft size={12} /> Reply to {selectedThread.from.split(' <')[0]}
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Tone selectors */}
                    {['formal', 'casual', 'urgent'].map(t => (
                      <button
                        key={t}
                        onClick={() => {
                          setActiveTone(t);
                          setReplyText(drafts[t] || '');
                        }}
                        className={`px-2 py-0.5 rounded-md text-[10px] uppercase font-bold tracking-wider border transition-all ${
                          activeTone === t 
                            ? 'bg-indigo-600 border-indigo-500/50 text-white shadow-md' 
                            : 'bg-white/5 border-white/5 text-gray-400 hover:text-white'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <textarea
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  placeholder="Select a tone template or draft your reply here..."
                  className="w-full bg-gray-800/60 border border-white/5 text-white placeholder-gray-650 text-xs rounded-xl p-3 h-28 outline-none focus:border-white/10 transition-all resize-none"
                />

                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-gray-600">
                    Drafted with Gemini AI co-pilot
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setReplyText('')}
                      className="px-3 py-1.5 bg-gray-800 hover:bg-gray-750 text-gray-400 hover:text-white text-xs font-semibold rounded-xl transition-all"
                    >
                      Clear
                    </button>
                    <button
                      onClick={() => {
                        alert('Reply sent successfully!');
                        setReplyText('');
                      }}
                      className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-650 hover:bg-indigo-600 text-white text-xs font-semibold rounded-xl transition-all shadow-md shadow-indigo-500/10"
                    >
                      Send <Send size={11} />
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500 gap-2">
              <Mail size={24} />
              <span>Select an email thread to view details</span>
            </div>
          )}
        </div>

        {/* Right Side: AI Panel */}
        <div className="w-[300px] border-l border-white/5 bg-gray-900/20 hidden lg:flex flex-col overflow-y-auto">
          <div className="p-4 border-b border-white/5 flex items-center gap-1.5">
            <Sparkles size={14} className="text-indigo-400" />
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">AI Copilot Insights</h2>
          </div>

          <div className="p-4 space-y-5">
            {/* Urgency Alert banner */}
            {selectedThread && selectedThread.urgency === 'Critical' && (
              <div className="flex items-start gap-2.5 p-3 bg-red-950/20 border border-red-500/10 rounded-xl">
                <AlertCircle size={13} className="text-red-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-300 text-[11px] font-bold">Action Required Immediately</p>
                  <p className="text-red-400/70 text-[10px] mt-0.5">This thread involves signup issues and customer dropout.</p>
                </div>
              </div>
            )}

            {/* Summarizer */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" /> Thread Summary
              </h3>
              <div className="bg-gray-900 border border-white/5 rounded-xl p-3.5 text-xs text-gray-400 leading-relaxed">
                {summary || 'Loading summary...'}
              </div>
            </div>

            {/* Suggested actions */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Suggested Tasks
              </h3>
              <div className="bg-gray-900 border border-white/5 rounded-xl p-3.5 space-y-2.5 text-xs text-gray-400">
                {followups.map((act, i) => (
                  <div key={i} className="flex gap-2">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>{act}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tone selector preview drafts */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Insert Draft
              </h3>
              <div className="space-y-2">
                {['formal', 'casual', 'urgent'].map(t => (
                  <button
                    key={t}
                    onClick={() => {
                      setActiveTone(t);
                      setReplyText(drafts[t] || '');
                    }}
                    className="w-full text-left bg-gray-900 hover:bg-gray-850 border border-white/5 hover:border-white/10 rounded-xl p-3 transition-all space-y-1.5 group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider group-hover:text-indigo-400 transition-colors">
                        {t} tone
                      </span>
                      <ChevronRight size={10} className="text-gray-700" />
                    </div>
                    <p className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed">
                      {drafts[t]}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
