import React, { useState } from "react";
import SpotlightCard from "./ui/SpotlightCard";
import { generateStudyContent } from "../services/studyService";
import { FaCopy, FaCheck, FaBookOpen, FaQuestionCircle, FaListUl, FaLightbulb, FaExchangeAlt } from "react-icons/fa";

function StudyAssistantPage() {
  const [activeTool, setActiveTool] = useState("quiz");
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("Medium");
  const [questionCount, setQuestionCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [result, setResult] = useState(null);
  
  // Interactive UI States
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [flippedCards, setFlippedCards] = useState({});
  const [copied, setCopied] = useState(false);

  const tools = [
    { id: "quiz", name: "Generate Quiz", icon: "📝" },
    { id: "flashcard", name: "Flashcards", icon: "📇" },
    { id: "summarizer", name: "Notes Summarizer", icon: "📖" },
    { id: "important_questions", name: "Important Questions", icon: "❓" },
    { id: "explain", name: "Explain Topic", icon: "💡" }
  ];

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!topic.trim()) {
      setErrorMsg("Please enter a study topic.");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setResult(null);
    setSelectedAnswers({});
    setFlippedCards({});
    setCopied(false);

    try {
      const data = await generateStudyContent({
        tool: activeTool,
        topic: topic.trim(),
        difficulty,
        question_count: parseInt(questionCount)
      });
      setResult(data);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.error || "Failed to generate study content. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleCard = (index) => {
    setFlippedCards(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleSelectOption = (qIndex, option) => {
    if (selectedAnswers[qIndex] !== undefined) return; // Answer locked once selected
    setSelectedAnswers(prev => ({
      ...prev,
      [qIndex]: option
    }));
  };

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-3xl font-extrabold tracking-tight">Study Assistant</h2>
        <p className="text-neutral-450 text-base">
          Accelerate your learning using custom quizzes, interactive flashcards, summaries, and exam guides.
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
              setErrorMsg("");
            }}
            className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer flex items-center space-x-2 border ${
              activeTool === tool.id
                ? "bg-violet-600/10 text-violet-400 border-violet-500/40"
                : "bg-neutral-950 border-neutral-900 text-neutral-400 hover:text-white hover:border-neutral-800"
            }`}
          >
            <span>{tool.icon}</span>
            <span>{tool.name}</span>
          </button>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Side: Parameters Input */}
        <SpotlightCard
          className="p-6 bg-neutral-900/40 border border-neutral-900 rounded-xl space-y-6 lg:col-span-1"
          spotlightColor="rgba(139, 92, 246, 0.1)"
        >
          <h3 className="text-lg font-bold text-white border-b border-neutral-900 pb-3 flex items-center space-x-2">
            <span>⚙️</span>
            <span>Parameters</span>
          </h3>

          <form onSubmit={handleGenerate} className="space-y-4">
            {/* Topic Input */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-neutral-300">Topic / Subject</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Recursion in Java, SQL Joins"
                className="w-full bg-neutral-950/60 border border-neutral-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500/80 transition-colors shadow-inner"
                required
              />
            </div>

            {/* Quiz Fields */}
            {activeTool === "quiz" && (
              <>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-neutral-300">Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500/80 transition-colors cursor-pointer"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-neutral-300">Number of Questions</label>
                  <select
                    value={questionCount}
                    onChange={(e) => setQuestionCount(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500/80 transition-colors cursor-pointer"
                  >
                    <option value="5">5 Questions</option>
                    <option value="10">10 Questions</option>
                    <option value="15">15 Questions</option>
                  </select>
                </div>
              </>
            )}

            {errorMsg && (
              <p className="text-rose-400 text-xs font-semibold">{errorMsg}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-violet-600 hover:bg-violet-750 text-white font-semibold rounded-lg text-sm shadow-md hover:shadow-violet-500/10 transition-all cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Generating...</span>
                </>
              ) : (
                <span>Generate Content</span>
              )}
            </button>
          </form>
        </SpotlightCard>

        {/* Right Side: Output Results */}
        <div className="lg:col-span-2 space-y-4">
          {loading && (
            <div className="flex flex-col items-center justify-center p-12 bg-neutral-900/20 border border-neutral-900 rounded-xl min-h-[300px] space-y-3">
              <div className="w-8 h-8 border-3 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-neutral-450 text-sm animate-pulse">Running pure LLM generation...</p>
            </div>
          )}

          {!loading && !result && (
            <div className="flex flex-col items-center justify-center p-12 bg-neutral-900/20 border border-neutral-900 rounded-xl min-h-[300px] text-center space-y-4">
              <span className="text-4xl">🎯</span>
              <div className="space-y-1">
                <h4 className="text-md font-bold text-neutral-300">Ready to Generate</h4>
                <p className="text-neutral-500 text-sm max-w-sm">
                  Enter a topic and generate tailored learning resources.
                </p>
              </div>
            </div>
          )}

          {!loading && result && (
            <div className="space-y-6">
              {/* Toolbar */}
              <div className="flex justify-between items-center bg-neutral-950/60 p-3 rounded-lg border border-neutral-900">
                <span className="text-xs font-semibold uppercase tracking-wider text-violet-400">
                  Output: {tools.find(t => t.id === activeTool)?.name}
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

              {/* 1. QUIZ OUTPUT */}
              {activeTool === "quiz" && result.quiz && (
                <div className="space-y-6">
                  {result.quiz.map((q, qIndex) => {
                    const selected = selectedAnswers[qIndex];
                    return (
                      <SpotlightCard
                        key={qIndex}
                        className="p-6 bg-neutral-900/30 border border-neutral-900 rounded-xl space-y-4"
                        spotlightColor="rgba(59, 130, 246, 0.08)"
                      >
                        <div className="flex items-start space-x-3">
                          <span className="text-xs font-bold px-2 py-0.5 bg-violet-600/20 text-violet-400 border border-violet-500/20 rounded">
                            Q{qIndex + 1}
                          </span>
                          <p className="text-sm font-bold text-white leading-relaxed">{q.question}</p>
                        </div>

                        {/* Options */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-8">
                          {q.options.map((opt, optIndex) => {
                            const isCorrectOpt = opt.startsWith(q.correct_answer) || opt.trim().toLowerCase() === q.correct_answer.trim().toLowerCase();
                            const isSelected = selected === opt;
                            
                            let optStyle = "bg-neutral-950 hover:bg-neutral-900 border-neutral-850 text-neutral-300";
                            if (selected !== undefined) {
                              if (isCorrectOpt) {
                                optStyle = "bg-emerald-950/30 border-emerald-500/40 text-emerald-400 font-semibold";
                              } else if (isSelected) {
                                optStyle = "bg-rose-950/30 border-rose-500/40 text-rose-400 font-semibold";
                              } else {
                                optStyle = "bg-neutral-950 border-neutral-900 text-neutral-500 opacity-60";
                              }
                            }

                            return (
                              <button
                                key={optIndex}
                                onClick={() => handleSelectOption(qIndex, opt)}
                                disabled={selected !== undefined}
                                className={`w-full text-left p-3 rounded-lg border text-xs transition-all flex items-center justify-between ${optStyle} ${
                                  selected === undefined ? "cursor-pointer" : "cursor-default"
                                }`}
                              >
                                <span>{opt}</span>
                                {selected !== undefined && isCorrectOpt && <FaCheck className="text-emerald-400 w-3 h-3 ml-2" />}
                              </button>
                            );
                          })}
                        </div>

                        {/* Explanation panel */}
                        {selected !== undefined && (
                          <div className="mt-4 pl-8 border-l-2 border-violet-500/40 space-y-1.5 text-xs text-neutral-450 leading-relaxed bg-neutral-950/30 p-3 rounded-r-lg">
                            <p className="font-bold text-white">
                              {selected.startsWith(q.correct_answer) || selected.trim().toLowerCase() === q.correct_answer.trim().toLowerCase()
                                ? "🎉 Correct!"
                                : "❌ Incorrect."}
                            </p>
                            <p>{q.explanation}</p>
                          </div>
                        )}
                      </SpotlightCard>
                    );
                  })}
                </div>
              )}

              {/* 2. FLASHCARD OUTPUT */}
              {activeTool === "flashcard" && result.flashcards && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {result.flashcards.map((card, idx) => {
                    const isFlipped = flippedCards[idx];
                    return (
                      <div
                        key={idx}
                        onClick={() => toggleCard(idx)}
                        className="h-44 rounded-xl border border-neutral-900 bg-neutral-900/30 hover:border-violet-500/30 transition-all duration-300 cursor-pointer flex flex-col justify-between p-5 relative shadow-lg"
                      >
                        <div className="flex justify-between items-center border-b border-neutral-900 pb-2">
                          <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-bold">
                            Card #{idx + 1}
                          </span>
                          <span className="text-[10px] text-violet-400 flex items-center space-x-1">
                            <FaExchangeAlt className="w-2.5 h-2.5" />
                            <span>{isFlipped ? "Show Q" : "Show A"}</span>
                          </span>
                        </div>

                        <div className="flex-1 flex items-center justify-center text-center py-4">
                          <p className="text-sm font-semibold leading-relaxed text-white">
                            {isFlipped ? card.answer : card.question}
                          </p>
                        </div>

                        <div className="text-center text-[10px] text-neutral-500 font-semibold italic border-t border-neutral-950 pt-2">
                          {isFlipped ? "Showing Answer" : "Click to Flip"}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* 3. NOTES SUMMARIZER OUTPUT */}
              {activeTool === "summarizer" && (
                <SpotlightCard
                  className="p-8 bg-neutral-900/30 border border-neutral-900 rounded-xl space-y-6"
                  spotlightColor="rgba(16, 185, 129, 0.08)"
                >
                  {/* Summary Section */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-bold text-white border-b border-neutral-900 pb-2.5 flex items-center space-x-2">
                      <FaBookOpen className="text-emerald-400 w-4 h-4" />
                      <span>Summary</span>
                    </h3>
                    <p className="text-sm text-neutral-300 leading-relaxed bg-neutral-950/40 p-4 rounded-lg border border-neutral-900">
                      {result.summary}
                    </p>
                  </div>

                  {/* Key Points */}
                  <div className="space-y-3 pt-2">
                    <h3 className="text-lg font-bold text-white border-b border-neutral-900 pb-2.5 flex items-center space-x-2">
                      <FaListUl className="text-emerald-400 w-4 h-4" />
                      <span>Key Takeaways</span>
                    </h3>
                    <ul className="space-y-2.5 pl-2">
                      {result.key_points && result.key_points.map((pt, index) => (
                        <li key={index} className="flex items-start space-x-3 text-sm text-neutral-400 leading-relaxed">
                          <span className="text-emerald-500 mt-1.5">•</span>
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </SpotlightCard>
              )}

              {/* 4. IMPORTANT QUESTIONS OUTPUT */}
              {activeTool === "important_questions" && (
                <div className="grid grid-cols-1 gap-6">
                  {/* 2 Mark Questions */}
                  <SpotlightCard
                    className="p-6 bg-neutral-900/30 border border-neutral-900 rounded-xl space-y-3"
                    spotlightColor="rgba(59, 130, 246, 0.08)"
                  >
                    <h4 className="text-md font-bold text-white border-b border-neutral-900 pb-2 flex items-center justify-between">
                      <span>📝 Short Answer Questions</span>
                      <span className="text-xs px-2.5 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full font-bold">
                        2 Marks
                      </span>
                    </h4>
                    <ul className="space-y-2 pl-2">
                      {result.two_marks && result.two_marks.map((q, idx) => (
                        <li key={idx} className="text-xs text-neutral-400 leading-relaxed flex items-start space-x-2">
                          <span className="text-blue-500 font-bold">{idx + 1}.</span>
                          <span>{typeof q === 'object' ? q.question : q}</span>
                        </li>
                      ))}
                    </ul>
                  </SpotlightCard>

                  {/* 5 Mark Questions */}
                  <SpotlightCard
                    className="p-6 bg-neutral-900/30 border border-neutral-900 rounded-xl space-y-3"
                    spotlightColor="rgba(139, 92, 246, 0.08)"
                  >
                    <h4 className="text-md font-bold text-white border-b border-neutral-900 pb-2 flex items-center justify-between">
                      <span>📝 Medium Essay Questions</span>
                      <span className="text-xs px-2.5 py-0.5 bg-violet-500/10 text-violet-400 border border-violet-500/20 rounded-full font-bold">
                        5 Marks
                      </span>
                    </h4>
                    <ul className="space-y-2 pl-2">
                      {result.five_marks && result.five_marks.map((q, idx) => (
                        <li key={idx} className="text-xs text-neutral-400 leading-relaxed flex items-start space-x-2">
                          <span className="text-violet-500 font-bold">{idx + 1}.</span>
                          <span>{typeof q === 'object' ? q.question : q}</span>
                        </li>
                      ))}
                    </ul>
                  </SpotlightCard>

                  {/* 10 Mark Questions */}
                  <SpotlightCard
                    className="p-6 bg-neutral-900/30 border border-neutral-900 rounded-xl space-y-3"
                    spotlightColor="rgba(16, 185, 129, 0.08)"
                  >
                    <h4 className="text-md font-bold text-white border-b border-neutral-900 pb-2 flex items-center justify-between">
                      <span>📝 Long Essay Questions</span>
                      <span className="text-xs px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full font-bold">
                        10 Marks
                      </span>
                    </h4>
                    <ul className="space-y-2 pl-2">
                      {result.ten_marks && result.ten_marks.map((q, idx) => (
                        <li key={idx} className="text-xs text-neutral-400 leading-relaxed flex items-start space-x-2">
                          <span className="text-emerald-500 font-bold">{idx + 1}.</span>
                          <span>{typeof q === 'object' ? q.question : q}</span>
                        </li>
                      ))}
                    </ul>
                  </SpotlightCard>
                </div>
              )}

              {/* 5. EXPLAIN TOPIC OUTPUT */}
              {activeTool === "explain" && (
                <div className="space-y-6">
                  {/* Simple Explanation */}
                  <SpotlightCard
                    className="p-6 bg-neutral-900/30 border border-neutral-900 rounded-xl space-y-3.5"
                    spotlightColor="rgba(139, 92, 246, 0.08)"
                  >
                    <h3 className="text-md font-bold text-white flex items-center space-x-2 border-b border-neutral-900 pb-2.5">
                      <FaBookOpen className="text-violet-400" />
                      <span>Intuitive Explanation</span>
                    </h3>
                    <p className="text-sm text-neutral-300 leading-relaxed">
                      {result.explanation}
                    </p>
                  </SpotlightCard>

                  {/* Real-world Example */}
                  <SpotlightCard
                    className="p-6 bg-neutral-900/30 border border-neutral-900 rounded-xl space-y-3.5"
                    spotlightColor="rgba(16, 185, 129, 0.08)"
                  >
                    <h3 className="text-md font-bold text-white flex items-center space-x-2 border-b border-neutral-900 pb-2.5">
                      <FaLightbulb className="text-emerald-400" />
                      <span>Real-World Metaphor</span>
                    </h3>
                    <p className="text-sm text-neutral-300 leading-relaxed italic bg-neutral-950/40 p-4 rounded-lg border border-neutral-900">
                      {result.example}
                    </p>
                  </SpotlightCard>

                  {/* Interview Tips */}
                  <SpotlightCard
                    className="p-6 bg-neutral-900/30 border border-neutral-900 rounded-xl space-y-3.5"
                    spotlightColor="rgba(59, 130, 246, 0.08)"
                  >
                    <h3 className="text-md font-bold text-white flex items-center space-x-2 border-b border-neutral-900 pb-2.5">
                      <FaQuestionCircle className="text-blue-400" />
                      <span>Interview & Placement Tips</span>
                    </h3>
                    <ul className="space-y-2.5 pl-2">
                      {result.interview_tips && result.interview_tips.map((tip, idx) => (
                        <li key={idx} className="text-sm text-neutral-450 leading-relaxed flex items-start space-x-2">
                          <span className="text-blue-400 font-bold">•</span>
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

export default StudyAssistantPage;
