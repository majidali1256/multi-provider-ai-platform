"use client";

import React, { useState } from "react";
import { 
  Terminal, 
  Send, 
  Settings2, 
  Activity, 
  Cpu, 
  Zap,
  BarChart3,
  DollarSign
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from "recharts";

type ModelType = "OpenAI" | "Claude" | "Gemini";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const METRICS_DATA = [
  { model: "GPT-4o", latency: 240, cost: 0.015, quality: 92 },
  { model: "Claude 3.5 Sonnet", latency: 180, cost: 0.012, quality: 95 },
  { model: "Gemini 1.5 Pro", latency: 310, cost: 0.010, quality: 89 },
];

const HISTORICAL_LATENCY = [
  { time: "10:00", openai: 240, claude: 185, gemini: 300 },
  { time: "10:05", openai: 235, claude: 180, gemini: 310 },
  { time: "10:10", openai: 250, claude: 175, gemini: 315 },
  { time: "10:15", openai: 245, claude: 190, gemini: 290 },
  { time: "10:20", openai: 240, claude: 180, gemini: 310 },
];

export default function MultiProviderDashboard() {
  const [prompt, setPrompt] = useState("");
  const [activeTab, setActiveTab] = useState<"chat" | "metrics">("chat");
  const [isGenerating, setIsGenerating] = useState(false);

  // Mock chat state
  const [chats, setChats] = useState<{ [key in ModelType]: ChatMessage[] }>({
    OpenAI: [{ role: "assistant", content: "OpenAI: Ready for input." }],
    Claude: [{ role: "assistant", content: "Claude: Waiting for prompt." }],
    Gemini: [{ role: "assistant", content: "Gemini: Initialized and ready." }]
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsGenerating(true);
    const userMsg: ChatMessage = { role: "user", content: prompt };
    
    setChats(prev => ({
      OpenAI: [...prev.OpenAI, userMsg],
      Claude: [...prev.Claude, userMsg],
      Gemini: [...prev.Gemini, userMsg]
    }));

    try {
      const response = await fetch("http://127.0.0.1:8004/api/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error("Failed to benchmark prompt. Check API key and backend.");
      }

      const data = await response.json();
      
      // Map responses back to specific models
      const getProviderText = (providerName: string) => {
        const res = data.results.find((r: any) => r.provider.includes(providerName));
        return res ? `${res.output_text}\n\nLatency: ${res.latency_ms}ms | Cost: $${res.estimated_cost_usd}` : "No response";
      };

      setChats(prev => ({
        OpenAI: [...prev.OpenAI, { role: "assistant", content: getProviderText("OpenAI") }],
        Claude: [...prev.Claude, { role: "assistant", content: getProviderText("Claude") }],
        Gemini: [...prev.Gemini, { role: "assistant", content: getProviderText("Gemini") }]
      }));
      setPrompt("");
    } catch (error: any) {
      console.error(error);
      alert(`Error comparing models: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-body selection:bg-accent selection:text-background">
      
      {/* Top Navbar */}
      <header className="border-b border-border bg-surface-bright/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-accent flex items-center justify-center">
              <Cpu className="w-5 h-5 text-background" />
            </div>
            <h1 className="text-lg font-display font-semibold tracking-wide">Multi-Provider AI Platform</h1>
          </div>
          
          <div className="flex items-center gap-2 bg-surface p-1 rounded-lg border border-border">
            <button 
              onClick={() => setActiveTab("chat")}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === "chat" ? "bg-accent text-background" : "text-on-surface hover:text-accent"}`}
            >
              <div className="flex items-center gap-2"><Terminal className="w-4 h-4" /> Compare</div>
            </button>
            <button 
              onClick={() => setActiveTab("metrics")}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === "metrics" ? "bg-accent text-background" : "text-on-surface hover:text-accent"}`}
            >
              <div className="flex items-center gap-2"><Activity className="w-4 h-4" /> Metrics</div>
            </button>
          </div>
          
          <div>
            <button className="p-2 text-on-surface-variant hover:text-accent transition-colors">
              <Settings2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden">
        {activeTab === "chat" ? (
          <div className="flex-1 flex flex-col h-[calc(100vh-64px)]">
            {/* Split View */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-1 p-1 bg-border overflow-hidden">
              {(["OpenAI", "Claude", "Gemini"] as ModelType[]).map((model) => (
                <div key={model} className="bg-background flex flex-col h-full overflow-hidden">
                  <div className="p-3 border-b border-border bg-surface flex items-center justify-between">
                    <span className="font-semibold text-sm tracking-wide">{model}</span>
                    <span className="text-xs text-on-surface-variant font-mono">vLatest</span>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {chats[model].map((msg, i) => (
                      <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[85%] rounded-lg p-3 text-sm leading-relaxed ${msg.role === "user" ? "bg-surface-bright border border-border" : "bg-transparent"}`}>
                          {msg.role === "assistant" && <div className="text-xs text-accent mb-1 font-mono uppercase tracking-wider">{model}</div>}
                          <div className="whitespace-pre-wrap font-mono text-sm">{msg.content}</div>
                        </div>
                      </div>
                    ))}
                    {isGenerating && (
                      <div className="animate-pulse flex gap-1 items-center h-6 text-accent">
                        <div className="w-1.5 h-1.5 rounded-full bg-accent"></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-accent animation-delay-200"></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-accent animation-delay-400"></div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Unified Input */}
            <div className="p-4 bg-surface border-t border-border">
              <form onSubmit={handleSend} className="max-w-4xl mx-auto relative">
                <textarea 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Enter a prompt to test across all models..."
                  className="input pr-12 min-h-[80px] font-mono text-sm resize-y"
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e); } }}
                />
                <button 
                  type="submit" 
                  disabled={isGenerating || !prompt.trim()}
                  className="absolute bottom-3 right-3 p-2 bg-accent text-background rounded-md disabled:opacity-50 hover:bg-green-500 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* Metrics Dashboard */
          <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 bg-background">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="bento-card">
                <div className="flex items-center gap-3 mb-4 text-on-surface-variant">
                  <Zap className="w-5 h-5 text-accent" />
                  <h3 className="font-semibold tracking-wide">Avg Latency</h3>
                </div>
                <div className="text-3xl font-display font-bold">243<span className="text-lg text-on-surface-variant font-normal">ms</span></div>
              </div>
              
              <div className="bento-card">
                <div className="flex items-center gap-3 mb-4 text-on-surface-variant">
                  <DollarSign className="w-5 h-5 text-accent" />
                  <h3 className="font-semibold tracking-wide">Avg Cost / 1K</h3>
                </div>
                <div className="text-3xl font-display font-bold">$0.012</div>
              </div>

              <div className="bento-card">
                <div className="flex items-center gap-3 mb-4 text-on-surface-variant">
                  <BarChart3 className="w-5 h-5 text-accent" />
                  <h3 className="font-semibold tracking-wide">Quality Index</h3>
                </div>
                <div className="text-3xl font-display font-bold">92.0<span className="text-lg text-on-surface-variant font-normal">/100</span></div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Bar Chart: Quality Comparison */}
              <div className="bento-card col-span-1">
                <h3 className="font-semibold tracking-wide text-on-surface-variant mb-6">Model Quality Score</h3>
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={METRICS_DATA}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#272F42" vertical={false} />
                      <XAxis dataKey="model" stroke="#475569" fontSize={12} tickLine={false} />
                      <YAxis stroke="#475569" fontSize={12} tickLine={false} axisLine={false} domain={[80, 100]} />
                      <Tooltip 
                        cursor={{fill: '#1E293B'}} 
                        contentStyle={{backgroundColor: '#0F172A', borderColor: '#475569', color: '#F8FAFC'}} 
                      />
                      <Bar dataKey="quality" fill="var(--color-accent)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Line Chart: Latency over time */}
              <div className="bento-card col-span-1">
                <h3 className="font-semibold tracking-wide text-on-surface-variant mb-6">Latency (ms) - Last Hour</h3>
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={HISTORICAL_LATENCY}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#272F42" vertical={false} />
                      <XAxis dataKey="time" stroke="#475569" fontSize={12} tickLine={false} />
                      <YAxis stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{backgroundColor: '#0F172A', borderColor: '#475569', color: '#F8FAFC'}} 
                      />
                      <Line type="monotone" dataKey="openai" stroke="#3b82f6" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="claude" stroke="#a855f7" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="gemini" stroke="var(--color-accent)" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex gap-4 mt-4 justify-center text-xs text-on-surface-variant">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span> OpenAI</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500"></span> Claude</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[var(--color-accent)]"></span> Gemini</span>
                </div>
              </div>
            </div>

            {/* Detailed Table */}
            <div className="bento-card overflow-x-auto">
              <h3 className="font-semibold tracking-wide text-on-surface-variant mb-6">Detailed Specifications</h3>
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase text-on-surface-variant bg-surface border-b border-border">
                  <tr>
                    <th className="px-4 py-3 font-medium">Model</th>
                    <th className="px-4 py-3 font-medium">Avg Latency (ms)</th>
                    <th className="px-4 py-3 font-medium">Cost / 1K Tokens</th>
                    <th className="px-4 py-3 font-medium">Context Window</th>
                    <th className="px-4 py-3 font-medium">Quality Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr className="hover:bg-surface/50 transition-colors">
                    <td className="px-4 py-4 font-semibold">GPT-4o</td>
                    <td className="px-4 py-4 font-mono">240</td>
                    <td className="px-4 py-4 font-mono">$0.015</td>
                    <td className="px-4 py-4">128K</td>
                    <td className="px-4 py-4 font-mono text-accent">92.0</td>
                  </tr>
                  <tr className="hover:bg-surface/50 transition-colors">
                    <td className="px-4 py-4 font-semibold">Claude 3.5 Sonnet</td>
                    <td className="px-4 py-4 font-mono">180</td>
                    <td className="px-4 py-4 font-mono">$0.012</td>
                    <td className="px-4 py-4">200K</td>
                    <td className="px-4 py-4 font-mono text-accent">95.0</td>
                  </tr>
                  <tr className="hover:bg-surface/50 transition-colors">
                    <td className="px-4 py-4 font-semibold">Gemini 1.5 Pro</td>
                    <td className="px-4 py-4 font-mono">310</td>
                    <td className="px-4 py-4 font-mono">$0.010</td>
                    <td className="px-4 py-4">1M / 2M</td>
                    <td className="px-4 py-4 font-mono text-accent">89.0</td>
                  </tr>
                </tbody>
              </table>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}
