import React, { useState } from "react";
import SpotlightCard from "./ui/SpotlightCard";
import { generatePlacementContent } from "../services/placementService";
import { FaCopy, FaCheck, FaBriefcase, FaGraduationCap, FaCode, FaBuilding, FaUserCheck, FaArrowRight, FaRedo } from "react-icons/fa";

function PlacementAssistantPage() {
  const [activeTool, setActiveTool] = useState("resume_review");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  // Inputs state
  const [resumeText, setResumeText] = useState("");
  const [techSubject, setTechSubject] = useState("DSA");
  const [targetRole, setTargetRole] = useState("Software Engineer");
  const [companyName, setCompanyName] = useState("Accenture");

  // Interview state
  const [activeQuestion, setActiveQuestion] = useState("");
  const [userAnswer, setUserAnswer] = useState("");
  const [interviewResult, setInterviewResult] = useState(null);

  const tools = [
    { id: "resume_review", name: "Resume Review", icon: "📄" },
    { id: "hr_interview", name: "Mock HR Interview", icon: "🗣️" },
    { id: "technical_interview", name: "Mock Tech Interview", icon: "💻" },
    { id: "roadmap", name: "Coding Roadmap", icon: "🗺️" },
    { id: "company_prep", name: "Company Prep", icon: "🏢" }
  ];

  const handleGenerate = async (e, customPayload = null) => {
    if (e) e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setResult(null);
    setCopied(false);

    let payload = customPayload;

    if (!payload) {
      if (activeTool === "resume_review") {
        if (!resumeText.trim()) {
          setErrorMsg("Please paste your resume text to begin analysis.");
          setLoading(false);
          return;
        }
        payload = { tool: "resume_review", resume_text: resumeText.trim() };
      } else if (activeTool === "roadmap") {
        payload = { tool: "roadmap", role: targetRole };
      } else if (activeTool === "company_prep") {
        if (!companyName.trim()) {
          setErrorMsg("Please enter a company name.");
          setLoading(false);
          return;
        }
        payload = { tool: "company_prep", company: companyName.trim() };
      }
    }

    try {
      const data = await generatePlacementContent(payload);
      setResult(data);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.error || "Failed to generate placement resources. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateInterviewQuestion = async () => {
    setLoading(true);
    setErrorMsg("");
    setActiveQuestion("");
    setUserAnswer("");
    setInterviewResult(null);
    setResult(null);

    const payload = {
      tool: activeTool,
      action: "generate",
      subject: activeTool === "technical_interview" ? techSubject : undefined
    };

    try {
      const data = await generatePlacementContent(payload);
      setActiveQuestion(data.question);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to generate interview question. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    if (!userAnswer.trim()) {
      setErrorMsg("Please write your answer before submitting.");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setInterviewResult(null);

    const payload = {
      tool: activeTool,
      action: "evaluate",
      question: activeQuestion,
      answer: userAnswer.trim(),
      subject: activeTool === "technical_interview" ? techSubject : undefined
    };

    try {
      const data = await generatePlacementContent(payload);
      setInterviewResult(data);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to evaluate answer. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result && !interviewResult) return;
    const content = result || interviewResult;
    navigator.clipboard.writeText(JSON.stringify(content, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-3xl font-extrabold tracking-tight">Placement Assistant</h2>
        <p className="text-neutral-450 text-base">
          Analyze resumes, run technical and behavioral mock interview runs, and build custom coding roadmaps.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2.5 border-b border-neutral-900 pb-4">
        {tools.map(tool => (
          <button
            key={tool.id}
            onClick={() => {
              setActiveTool(tool.id);
              setResult(null);
              setInterviewResult(null);
              setActiveQuestion("");
              setUserAnswer("");
              setErrorMsg("");
            }}
            className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer flex items-center space-x-2 border ${
              activeTool === tool.id
                ? "bg-emerald-600/10 text-emerald-400 border-emerald-500/40"
                : "bg-neutral-950 border-neutral-900 text-neutral-400 hover:text-white hover:border-neutral-800"
            }`}
          >
            <span>{tool.icon}</span>
            <span>{tool.name}</span>
          </button>
        ))}
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Input Sidebar */}
        <SpotlightCard
          className="p-6 bg-neutral-900/40 border border-neutral-900 rounded-xl space-y-6 lg:col-span-1"
          spotlightColor="rgba(16, 185, 129, 0.1)"
        >
          <h3 className="text-lg font-bold text-white border-b border-neutral-900 pb-3 flex items-center space-x-2">
            <span>⚙️</span>
            <span>Configurations</span>
          </h3>

          {/* Resume Review Parameters */}
          {activeTool === "resume_review" && (
            <form onSubmit={handleGenerate} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-neutral-300">Paste Resume Text</label>
                <textarea
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste your resume summary, experience, and skills here..."
                  rows={6}
                  className="w-full bg-neutral-950/60 border border-neutral-800 rounded-lg px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500/80 transition-colors shadow-inner resize-none"
                  required
                />
              </div>

              {errorMsg && <p className="text-rose-400 text-xs font-semibold">{errorMsg}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-sm shadow-md hover:shadow-emerald-500/10 transition-all cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {loading ? "Analyzing Resume..." : "Analyze Resume"}
              </button>
            </form>
          )}

          {/* HR Interview Parameters */}
          {activeTool === "hr_interview" && (
            <div className="space-y-4">
              <p className="text-xs text-neutral-450 leading-relaxed">
                Start a behavioral HR interview simulation. The AI will generate a prompt, accept your response, and evaluate your performance.
              </p>
              <button
                onClick={handleGenerateInterviewQuestion}
                disabled={loading}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-sm shadow-md transition-all cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {loading ? "Generating..." : "Generate HR Question"}
              </button>
            </div>
          )}

          {/* Technical Interview Parameters */}
          {activeTool === "technical_interview" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-neutral-300">Select Subject</label>
                <select
                  value={techSubject}
                  onChange={(e) => setTechSubject(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/80 transition-colors cursor-pointer"
                >
                  <option value="DSA">Data Structures & Algorithms</option>
                  <option value="Java">Java Programming</option>
                  <option value="Python">Python Programming</option>
                  <option value="DBMS">Database Systems (SQL)</option>
                  <option value="OS">Operating Systems</option>
                  <option value="CN">Computer Networks</option>
                  <option value="React">React Frontend</option>
                </select>
              </div>

              <button
                onClick={handleGenerateInterviewQuestion}
                disabled={loading}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-sm shadow-md transition-all cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {loading ? "Generating..." : "Generate Question"}
              </button>
            </div>
          )}

          {/* Coding Roadmap Parameters */}
          {activeTool === "roadmap" && (
            <form onSubmit={handleGenerate} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-neutral-300">Select Target Role</label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/80 transition-colors cursor-pointer"
                >
                  <option value="AI Engineer">AI / ML Engineer</option>
                  <option value="Software Engineer">Software Engineer (General)</option>
                  <option value="Full Stack Developer">Full Stack Developer</option>
                  <option value="Data Engineer">Data Engineer</option>
                </select>
              </div>

              {errorMsg && <p className="text-rose-400 text-xs font-semibold">{errorMsg}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-sm shadow-md transition-all cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {loading ? "Creating Roadmap..." : "Generate Roadmap"}
              </button>
            </form>
          )}

          {/* Company Prep Parameters */}
          {activeTool === "company_prep" && (
            <form onSubmit={handleGenerate} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-neutral-300">Enter Company Name</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Google, TCS, Amazon"
                  className="w-full bg-neutral-950/60 border border-neutral-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/80 transition-colors shadow-inner"
                  required
                />
              </div>

              {errorMsg && <p className="text-rose-400 text-xs font-semibold">{errorMsg}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-sm shadow-md transition-all cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {loading ? "Loading Prep Info..." : "Get Prep Strategy"}
              </button>
            </form>
          )}
        </SpotlightCard>

        {/* Right Output Panel */}
        <div className="lg:col-span-2 space-y-4">
          {loading && !activeQuestion && (
            <div className="flex flex-col items-center justify-center p-12 bg-neutral-900/20 border border-neutral-900 rounded-xl min-h-[300px] space-y-3">
              <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-neutral-450 text-sm animate-pulse">Running pure LLM generation...</p>
            </div>
          )}

          {!loading && !result && !activeQuestion && !interviewResult && (
            <div className="flex flex-col items-center justify-center p-12 bg-neutral-900/20 border border-neutral-900 rounded-xl min-h-[300px] text-center space-y-4">
              <span className="text-4xl">🚀</span>
              <div className="space-y-1">
                <h4 className="text-md font-bold text-neutral-300">Ready to Analyze</h4>
                <p className="text-neutral-500 text-sm max-w-sm">
                  Configure the placement assistant on the left sidebar panel to begin career review.
                </p>
              </div>
            </div>
          )}

          {/* Interactive Question Output (For HR/Tech Interviews) */}
          {activeQuestion && !interviewResult && (
            <form onSubmit={handleSubmitAnswer} className="space-y-6">
              <SpotlightCard
                className="p-6 bg-neutral-900/40 border border-neutral-900 rounded-xl space-y-4"
                spotlightColor="rgba(59, 130, 246, 0.08)"
              >
                <h4 className="text-sm font-bold text-emerald-400 border-b border-neutral-900 pb-2 flex items-center justify-between animate-pulse">
                  <span>Question Generated</span>
                  <span className="text-xs px-2 py-0.5 bg-neutral-950 border border-neutral-850 rounded">
                    Active Session
                  </span>
                </h4>
                <p className="text-sm font-semibold text-white leading-relaxed">{activeQuestion}</p>
              </SpotlightCard>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider">Your Answer</label>
                <textarea
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Type your detailed interview answer response here..."
                  rows={5}
                  className="w-full bg-neutral-950/60 border border-neutral-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/80 transition-colors shadow-inner resize-none"
                  required
                />
              </div>

              {errorMsg && <p className="text-rose-400 text-xs font-semibold">{errorMsg}</p>}

              <div className="flex space-x-3 justify-end border-t border-neutral-900 pt-4">
                <button
                  type="button"
                  onClick={handleGenerateInterviewQuestion}
                  disabled={loading}
                  className="px-4 py-2 bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-neutral-300 rounded-lg text-xs font-semibold flex items-center space-x-1 cursor-pointer transition-all"
                >
                  <FaRedo />
                  <span>Skip / Next</span>
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-md transition-all flex items-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Evaluating...</span>
                    </>
                  ) : (
                    <span>Submit Answer</span>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Interview Evaluation Output */}
          {interviewResult && (
            <div className="space-y-6">
              {/* Score bar */}
              <div className="flex justify-between items-center bg-neutral-950/60 p-4 rounded-lg border border-neutral-900">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">📊</span>
                  <div>
                    <p className="text-xs text-neutral-400 font-semibold">Evaluation Score</p>
                    <p className="text-lg font-black text-white">{interviewResult.score} / 10</p>
                  </div>
                </div>
                <button
                  onClick={handleGenerateInterviewQuestion}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs shadow-md transition-all cursor-pointer flex items-center space-x-1.5"
                >
                  <FaRedo />
                  <span>Next Question</span>
                </button>
              </div>

              {/* Feedback */}
              <SpotlightCard
                className="p-6 bg-neutral-900/30 border border-neutral-900 rounded-xl space-y-3"
                spotlightColor="rgba(59, 130, 246, 0.08)"
              >
                <h4 className="text-sm font-bold text-white border-b border-neutral-900 pb-2.5 flex items-center space-x-2">
                  <FaUserCheck className="text-blue-400 w-4 h-4" />
                  <span>Evaluator Feedback</span>
                </h4>
                <p className="text-xs text-neutral-300 leading-relaxed bg-neutral-950/40 p-4 rounded-lg border border-neutral-900">
                  {interviewResult.feedback}
                </p>
              </SpotlightCard>

              {/* Suggestions */}
              <SpotlightCard
                className="p-6 bg-neutral-900/30 border border-neutral-900 rounded-xl space-y-3"
                spotlightColor="rgba(16, 185, 129, 0.08)"
              >
                <h4 className="text-sm font-bold text-white border-b border-neutral-900 pb-2.5 flex items-center space-x-2">
                  <FaArrowRight className="text-emerald-400 w-3 h-3" />
                  <span>Key Suggestions for Improvement</span>
                </h4>
                <ul className="space-y-2 pl-2">
                  {interviewResult.suggestions && interviewResult.suggestions.map((s, idx) => (
                    <li key={idx} className="text-xs text-neutral-400 leading-relaxed flex items-start space-x-2">
                      <span className="text-emerald-500 font-bold">•</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </SpotlightCard>
            </div>
          )}

          {/* Standard Outputs (Resume Review, Roadmap, Company Prep) */}
          {!loading && result && (
            <div className="space-y-6">
              {/* Toolbar */}
              <div className="flex justify-between items-center bg-neutral-950/60 p-3 rounded-lg border border-neutral-900">
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                  Output Results
                </span>
                <button
                  onClick={handleCopy}
                  className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-neutral-300 hover:text-white rounded text-xs font-semibold flex items-center space-x-1.5 cursor-pointer transition-all"
                >
                  {copied ? (
                    <>
                      <FaCheck className="text-emerald-400" />
                      <span>Copied JSON!</span>
                    </>
                  ) : (
                    <>
                      <FaCopy />
                      <span>Copy JSON</span>
                    </>
                  )}
                </button>
              </div>

              {/* 1. RESUME REVIEW OUTPUT */}
              {activeTool === "resume_review" && (
                <div className="space-y-6">
                  {/* ATS Score Indicator */}
                  <div className="flex justify-between items-center bg-neutral-950/60 p-4 rounded-lg border border-neutral-900">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">📈</span>
                      <div>
                        <p className="text-xs text-neutral-400 font-semibold">ATS Compatibility Score</p>
                        <p className={`text-2xl font-black ${
                          result.ats_score >= 80 ? "text-emerald-400" : result.ats_score >= 60 ? "text-yellow-500" : "text-rose-500"
                        }`}>{result.ats_score}%</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Strengths */}
                    <SpotlightCard className="p-6 bg-neutral-900/30 border border-neutral-900 rounded-xl space-y-3" spotlightColor="rgba(16, 185, 129, 0.08)">
                      <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider border-b border-neutral-900 pb-2">Core Strengths</h4>
                      <ul className="space-y-1.5 pl-1">
                        {result.strengths && result.strengths.map((s, i) => (
                          <li key={i} className="text-xs text-neutral-450">• {s}</li>
                        ))}
                      </ul>
                    </SpotlightCard>

                    {/* Weaknesses */}
                    <SpotlightCard className="p-6 bg-neutral-900/30 border border-neutral-900 rounded-xl space-y-3" spotlightColor="rgba(244, 63, 94, 0.08)">
                      <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider border-b border-neutral-900 pb-2">Weaknesses / Gaps</h4>
                      <ul className="space-y-1.5 pl-1">
                        {result.weaknesses && result.weaknesses.map((w, i) => (
                          <li key={i} className="text-xs text-neutral-450">• {w}</li>
                        ))}
                      </ul>
                    </SpotlightCard>
                  </div>

                  {/* Missing Keywords tags */}
                  <SpotlightCard className="p-6 bg-neutral-900/30 border border-neutral-900 rounded-xl space-y-3.5" spotlightColor="rgba(59, 130, 246, 0.08)">
                    <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider border-b border-neutral-900 pb-2">Suggested Missing Keywords</h4>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {result.missing_keywords && result.missing_keywords.map((kw, i) => (
                        <span key={i} className="text-[10px] font-semibold px-2.5 py-1 bg-blue-950/40 text-blue-400 border border-blue-900/40 rounded-full">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </SpotlightCard>

                  {/* Improvement suggestions */}
                  <SpotlightCard className="p-6 bg-neutral-900/30 border border-neutral-900 rounded-xl space-y-3" spotlightColor="rgba(139, 92, 246, 0.08)">
                    <h4 className="text-xs font-bold text-violet-400 uppercase tracking-wider border-b border-neutral-900 pb-2">Suggestions for ATS Optimization</h4>
                    <ul className="space-y-2 pl-2">
                      {result.suggestions && result.suggestions.map((s, idx) => (
                        <li key={idx} className="text-xs text-neutral-400 leading-relaxed flex items-start space-x-2">
                          <span className="text-violet-500 font-bold">{idx + 1}.</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </SpotlightCard>
                </div>
              )}

              {/* 2. CODING ROADMAP OUTPUT */}
              {activeTool === "roadmap" && (
                <div className="space-y-6">
                  {/* Timeline */}
                  <div className="flex justify-between items-center bg-neutral-950/60 p-4 rounded-lg border border-neutral-900">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">⏱️</span>
                      <div>
                        <p className="text-xs text-neutral-400 font-semibold">Recommended Study Timeline</p>
                        <p className="text-lg font-bold text-white">{result.timeline}</p>
                      </div>
                    </div>
                  </div>

                  {/* Step by step phases */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider border-b border-neutral-900 pb-2">Learning Chapters</h4>
                    {result.roadmap && result.roadmap.map((phase, idx) => (
                      <SpotlightCard key={idx} className="p-5 bg-neutral-900/30 border border-neutral-900 rounded-xl space-y-3" spotlightColor="rgba(139, 92, 246, 0.08)">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold px-2 py-0.5 bg-violet-600/20 text-violet-400 border border-violet-500/20 rounded">
                            Phase {idx + 1}
                          </span>
                          <h5 className="text-sm font-bold text-white">{phase.phase}</h5>
                        </div>
                        <div className="flex flex-wrap gap-1.5 pl-10">
                          {phase.topics && phase.topics.map((t, idx2) => (
                            <span key={idx2} className="text-[10px] font-medium px-2 py-0.5 bg-neutral-950 border border-neutral-850 rounded text-neutral-400">
                              {t}
                            </span>
                          ))}
                        </div>
                      </SpotlightCard>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Resources */}
                    <SpotlightCard className="p-6 bg-neutral-900/30 border border-neutral-900 rounded-xl space-y-3" spotlightColor="rgba(16, 185, 129, 0.08)">
                      <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider border-b border-neutral-900 pb-2">Curated Resources</h4>
                      <ul className="space-y-1.5 pl-1">
                        {result.resources && result.resources.map((r, i) => (
                          <li key={i} className="text-xs text-neutral-450 flex items-start space-x-2">
                            <span className="text-emerald-500 mt-1">•</span>
                            <span>{r}</span>
                          </li>
                        ))}
                      </ul>
                    </SpotlightCard>

                    {/* Projects */}
                    <SpotlightCard className="p-6 bg-neutral-900/30 border border-neutral-900 rounded-xl space-y-3" spotlightColor="rgba(59, 130, 246, 0.08)">
                      <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider border-b border-neutral-900 pb-2">Recommended Capstone Projects</h4>
                      <ul className="space-y-1.5 pl-1">
                        {result.projects && result.projects.map((p, i) => (
                          <li key={i} className="text-xs text-neutral-450 flex items-start space-x-2">
                            <span className="text-blue-500 mt-1">•</span>
                            <span>{p}</span>
                          </li>
                        ))}
                      </ul>
                    </SpotlightCard>
                  </div>
                </div>
              )}

              {/* 3. COMPANY PREPARATION OUTPUT */}
              {activeTool === "company_prep" && (
                <div className="space-y-6">
                  {/* Hiring Rounds */}
                  <SpotlightCard className="p-6 bg-neutral-900/30 border border-neutral-900 rounded-xl space-y-3" spotlightColor="rgba(59, 130, 246, 0.08)">
                    <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider border-b border-neutral-900 pb-2">Hiring Rounds & Interview Process</h4>
                    <div className="flex flex-wrap gap-2 pt-2 items-center">
                      {result.rounds && result.rounds.map((round, idx) => (
                        <React.Fragment key={idx}>
                          <span className="text-xs font-semibold px-3 py-1.5 bg-neutral-950 border border-neutral-850 text-neutral-300 rounded-lg">
                            {idx + 1}. {round}
                          </span>
                          {idx < result.rounds.length - 1 && <span className="text-neutral-600 font-bold">➔</span>}
                        </React.Fragment>
                      ))}
                    </div>
                  </SpotlightCard>

                  {/* Frequently Asked Questions */}
                  <SpotlightCard className="p-6 bg-neutral-900/30 border border-neutral-900 rounded-xl space-y-3" spotlightColor="rgba(139, 92, 246, 0.08)">
                    <h4 className="text-xs font-bold text-violet-400 uppercase tracking-wider border-b border-neutral-900 pb-2">Frequent Questions / Core Focus Areas</h4>
                    <ul className="space-y-2 pl-2">
                      {result.faqs && result.faqs.map((q, idx) => (
                        <li key={idx} className="text-xs text-neutral-450 leading-relaxed flex items-start space-x-2">
                          <span className="text-violet-500 font-bold">{idx + 1}.</span>
                          <span>{q}</span>
                        </li>
                      ))}
                    </ul>
                  </SpotlightCard>

                  {/* Preparation Tips */}
                  <SpotlightCard className="p-6 bg-neutral-900/30 border border-neutral-900 rounded-xl space-y-3" spotlightColor="rgba(16, 185, 129, 0.08)">
                    <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider border-b border-neutral-900 pb-2">Preparation Tips & Strategies</h4>
                    <ul className="space-y-2 pl-2">
                      {result.tips && result.tips.map((tip, idx) => (
                        <li key={idx} className="text-xs text-neutral-400 leading-relaxed flex items-start space-x-2">
                          <span className="text-emerald-500 font-bold">•</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </SpotlightCard>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PlacementAssistantPage;
