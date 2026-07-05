"use client";

import React, { useState } from 'react';
import { Mail, Lock, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    // Mimic callback / redirect to OAuth
    window.location.href = 'http://localhost:5000/auth/google';
  };

  return (
    <div className="min-h-screen bg-gray-950 flex w-full">
      {/* ── Left panel — branding ──────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col p-12 overflow-hidden border-r border-white/5">
        {/* Gradient mesh background */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-gray-950 to-gray-950" />
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] -translate-x-1/3 -translate-y-1/3 pointer-events-none" />

        {/* Logo — top */}
        <div className="relative flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Sparkles size={14} className="text-white" />
          </div>
          <span className="text-white font-bold text-base tracking-tight">MailAI</span>
        </div>

        {/* Center copy — vertically centered */}
        <div className="relative flex-1 flex flex-col justify-center space-y-8">
          <div className="space-y-4">
            <p className="text-indigo-400 text-xs font-semibold uppercase tracking-widest">AI Email Co-pilot</p>
            <h2 className="text-4xl font-bold text-white leading-[1.15] tracking-tight">
              Your inbox,<br />finally under control.
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              Draft replies, summarize long email threads, and classify urgency in real-time with Google Gemini.
            </p>
          </div>

          {/* Feature list */}
          <div className="space-y-3">
            {[
              { title: 'Gemini AI Summarizer', desc: 'Summarize long threads into 3 simple sentences.' },
              { title: 'One-Click Drafts', desc: 'Generate high-context replies in formal, casual, or urgent tones.' },
              { title: 'Smart Classification', desc: 'Auto-detect urgency and priority to focus on what matters.' }
            ].map((f, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-5 h-5 rounded-md bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-indigo-400 text-[10px]">✓</span>
                </div>
                <div>
                  <p className="text-white text-xs font-semibold">{f.title}</p>
                  <p className="text-gray-500 text-[11px] mt-0.5">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Stat row */}
          <div className="flex items-center gap-8 pt-4 border-t border-white/5">
            {[
              { value: 'Gemini Pro', label: 'AI Model' },
              { value: 'OAuth 2.0', label: 'Secure Access' },
              { value: 'Real-time', label: 'Gmail Sync' },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-white text-sm font-bold">{s.value}</p>
                <p className="text-gray-600 text-[11px] mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right panel — login form ───────────────────────────────── */}
      <div className="flex-1 flex flex-col px-6 py-12 relative justify-between">
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2 mb-10">
          <div className="w-7 h-7 rounded-xl bg-indigo-600 flex items-center justify-center">
            <Sparkles size={12} className="text-white" />
          </div>
          <span className="text-white font-bold text-sm">MailAI</span>
        </div>

        {/* Vertically centered form wrapper */}
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-[360px]">
            {/* Heading */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-white tracking-tight">Sign in</h1>
              <p className="text-gray-500 text-sm mt-1.5">
                Connect your account to get started.
              </p>
            </div>

            {/* Error */}
            {err && (
              <div className="flex items-start gap-2.5 p-3.5 mb-6 bg-red-500/8 border border-red-500/15 rounded-xl text-red-400 text-xs leading-relaxed">
                <AlertCircle size={13} className="shrink-0 mt-0.5" />
                <span>{err}</span>
              </div>
            )}

            {/* OAuth Login */}
            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-all duration-150 shadow-lg shadow-indigo-500/20 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign in with Google</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>

            {/* Legal */}
            <p className="text-center text-[11px] text-gray-700 mt-6 leading-relaxed">
              By connecting, you authorize access to your Gmail account. We process all request details securely.
            </p>
          </div>
        </div>

        <div className="text-center text-[10px] text-gray-700">
          MailAI · Powered by Gemini · Google Cloud Sandbox
        </div>
      </div>
    </div>
  );
}
