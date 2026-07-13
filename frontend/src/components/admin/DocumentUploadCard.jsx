import React, { useState, useRef } from "react";
import { FaCloudUploadAlt, FaFilePdf, FaTimes, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";
import SpotlightCard from "../ui/SpotlightCard";
import * as docService from "../../services/adminDocumentService";

function DocumentUploadCard({ onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  // Metadata states
  const [department, setDepartment] = useState("");
  const [semester, setSemester] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [subject, setSubject] = useState("");

  // Ingestion states: null, 'selected', 'uploading', 'processing', 'indexing', 'ready', 'failed'
  const [status, setStatus] = useState(null);
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");

  const departments = [
    { value: "CSE", label: "Computer Science & Engineering (CSE)" },
    { value: "ECE", label: "Electronics & Communication (ECE)" },
    { value: "EEE", label: "Electrical & Electronics (EEE)" },
    { value: "ME", label: "Mechanical Engineering (ME)" },
    { value: "CIVIL", label: "Civil Engineering (CE)" }
  ];

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile) => {
    setErrorMessage("");
    if (selectedFile.type !== "application/pdf") {
      setErrorMessage("Only PDF files are supported");
      setStatus("failed");
      return;
    }

    const maxSize = 25 * 1024 * 1024; // 25 MB
    if (selectedFile.size > maxSize) {
      setErrorMessage("File exceeds the maximum limit of 25MB");
      setStatus("failed");
      return;
    }

    setFile(selectedFile);
    setStatus("selected");
  };

  const handleRemoveFile = () => {
    setFile(null);
    setStatus(null);
    setProgress(0);
    setErrorMessage("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    if (!department || !semester || !academicYear || !subject.trim()) {
      setErrorMessage("Please complete all metadata fields");
      setStatus("failed");
      return;
    }

    // Format metadata wrapper
    const metadata = {
      department,
      semester: parseInt(semester, 10),
      academic_year: parseInt(academicYear, 10),
      subject: subject.trim()
    };

    setStatus("uploading");
    setProgress(0);
    setErrorMessage("");

    try {
      // 1. Upload stage (passes onUploadProgress callback)
      const data = await docService.uploadDocument(file, metadata, (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setProgress(percentCompleted);
        
        if (percentCompleted === 100) {
          setStatus("processing");
        }
      });

      // 2. Processing backend metadata
      setStatus("indexing");
      
      // Simulate indexing progress bar or resolve directly
      setTimeout(() => {
        setStatus("ready");
        // Clear inputs on success
        setFile(null);
        setDepartment("");
        setSemester("");
        setAcademicYear("");
        setSubject("");
        
        if (onUploadSuccess) {
          onUploadSuccess(data.pdf);
        }
      }, 1500);

    } catch (err) {
      console.error("Document upload failed:", err);
      const msg = err.response?.data?.error || "Upload failed. Please try again.";
      setErrorMessage(msg);
      setStatus("failed");
    }
  };

  const isWorking = status === "uploading" || status === "processing" || status === "indexing";

  return (
    <SpotlightCard className="border border-neutral-800 bg-neutral-900/60 backdrop-blur-xl" spotlightColor="rgba(139, 92, 246, 0.08)">
      <div className="space-y-6 text-white">
        <div>
          <h3 className="text-lg font-bold">Upload Knowledge Document</h3>
          <p className="text-xs text-neutral-400">Index university syllabus, notes or questions into RAG database</p>
        </div>

        <form onSubmit={handleUploadSubmit} className="space-y-5">
          {/* File drag drop area */}
          {!file ? (
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center space-y-3 cursor-pointer transition-all duration-200 ${
                dragActive 
                  ? "border-violet-500 bg-violet-500/10 text-white" 
                  : "border-neutral-800 hover:border-violet-500/40 text-neutral-400 hover:text-neutral-300"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="application/pdf"
                onChange={handleFileChange}
              />
              <FaCloudUploadAlt className="w-12 h-12 text-violet-500" />
              <div className="text-center">
                <p className="text-sm font-semibold">Drag & drop your PDF here, or <span className="text-violet-400 font-bold hover:underline">Browse</span></p>
                <p className="text-[10px] text-neutral-500 mt-1">PDF format up to 25MB</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 bg-neutral-950/60 border border-neutral-950 rounded-xl">
              <div className="flex items-center space-x-3 min-w-0">
                <FaFilePdf className="w-8 h-8 text-violet-400 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate max-w-[200px] md:max-w-xs">{file.name}</p>
                  <p className="text-[10px] text-neutral-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
              </div>
              {!isWorking && (
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="text-neutral-500 hover:text-white p-1 rounded-full hover:bg-neutral-850 transition-all cursor-pointer"
                >
                  <FaTimes className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          {/* Metadata Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Department</label>
              <select
                disabled={isWorking}
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-800 text-white bg-neutral-950 rounded-lg focus:outline-none focus:border-violet-500/80 transition-colors text-sm disabled:opacity-50 cursor-pointer"
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept.value} value={dept.value}>{dept.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Subject</label>
              <input
                disabled={isWorking}
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Computer Networks"
                className="w-full px-3 py-2 border border-neutral-800 placeholder-neutral-600 text-white bg-neutral-950 rounded-lg focus:outline-none focus:border-violet-500/80 transition-colors text-sm disabled:opacity-50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Academic Year</label>
              <select
                disabled={isWorking}
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-800 text-white bg-neutral-950 rounded-lg focus:outline-none focus:border-violet-500/80 transition-colors text-sm disabled:opacity-50 cursor-pointer"
              >
                <option value="">Select Year</option>
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Semester</label>
              <select
                disabled={isWorking}
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-800 text-white bg-neutral-950 rounded-lg focus:outline-none focus:border-violet-500/80 transition-colors text-sm disabled:opacity-50 cursor-pointer"
              >
                <option value="">Select Semester</option>
                {Array.from({ length: 8 }, (_, i) => i + 1).map((sem) => (
                  <option key={sem} value={sem}>Semester {sem}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Feedback states */}
          {errorMessage && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg text-xs font-semibold flex items-center space-x-2">
              <FaExclamationTriangle className="flex-shrink-0 w-3.5 h-3.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {status === "ready" && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-xs font-semibold flex items-center space-x-2">
              <FaCheckCircle className="flex-shrink-0 w-3.5 h-3.5" />
              <span>Document ingested and indexed successfully!</span>
            </div>
          )}

          {isWorking && (
            <div className="space-y-2 bg-neutral-950/60 p-4 border border-neutral-950 rounded-xl">
              <div className="flex justify-between text-xs font-semibold text-neutral-400">
                <span className="capitalize">
                  {status === "uploading" ? `Uploading file (${progress}%)` : status}
                </span>
                <span className="text-violet-400">Processing...</span>
              </div>
              <div className="w-full bg-neutral-900 rounded-full h-1.5 overflow-hidden">
                <div 
                  className={`h-1.5 bg-violet-600 transition-all duration-300 ${
                    status !== "uploading" ? "w-full animate-pulse" : ""
                  }`}
                  style={{ width: status === "uploading" ? `${progress}%` : "100%" }}
                />
              </div>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={isWorking || !file}
              className="w-full py-2.5 bg-violet-600 hover:bg-violet-750 text-white font-bold rounded-lg text-sm shadow-md hover:shadow-violet-500/10 transition-all cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span>Upload & Ingest Document</span>
            </button>
          </div>
        </form>
      </div>
    </SpotlightCard>
  );
}

export default DocumentUploadCard;
