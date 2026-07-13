import React, { useState, useEffect } from "react";
import { FaSyncAlt, FaExclamationTriangle, FaFolderOpen, FaCheckCircle, FaDatabase } from "react-icons/fa";
import DocumentUploadCard from "../../components/admin/DocumentUploadCard";
import DocumentTable from "../../components/admin/DocumentTable";
import DeleteDocumentDialog from "../../components/admin/DeleteDocumentDialog";
import SpotlightCard from "../../components/ui/SpotlightCard";
import * as docService from "../../services/adminDocumentService";

function AdminDocumentManagement() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Rebuild state
  const [rebuilding, setRebuilding] = useState(false);
  const [rebuildStatus, setRebuildStatus] = useState("");

  // Deletion Modal state
  const [selectedDocForDelete, setSelectedDocForDelete] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await docService.getDocuments();
      setDocuments(data.pdfs || []);
    } catch (err) {
      console.error("Failed to load documents:", err);
      setError("Unable to fetch documents from database.");
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSuccess = (newPdf) => {
    if (newPdf) {
      setDocuments((prev) => [newPdf, ...prev]);
    } else {
      // Reload everything to get updated states
      loadDocuments();
    }
  };

  const handleDeleteClick = (doc) => {
    setSelectedDocForDelete(doc);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedDocForDelete) return;

    const docId = selectedDocForDelete.public_id;
    const previousDocs = [...documents];

    // Close modal immediately
    setIsDeleteModalOpen(false);

    // Optimistic Deletion
    setDocuments((prev) => prev.filter((d) => d.public_id !== docId));

    try {
      await docService.deleteDocument(docId);
      setSelectedDocForDelete(null);
    } catch (err) {
      console.error("Failed to delete document:", err);
      // Rollback to previous state
      setDocuments(previousDocs);
      alert(`Deletion failed: ${err.response?.data?.error || "Connection error"}`);
    }
  };

  const handleGlobalRebuild = async () => {
    setRebuilding(true);
    setRebuildStatus("Rebuilding vector indexes...");
    try {
      await docService.rebuildKnowledgeBase();
      setRebuildStatus("Knowledge base rebuilt successfully!");
      // Briefly show success status then clear
      setTimeout(() => {
        setRebuildStatus("");
        setRebuilding(false);
        loadDocuments(); // Refresh table states
      }, 2000);
    } catch (err) {
      console.error("Rebuild embeddings failed:", err);
      setRebuildStatus("Rebuild failed. Please check backend logs.");
      setTimeout(() => {
        setRebuildStatus("");
        setRebuilding(false);
      }, 3000);
    }
  };

  // Stats for the Summary Ribbon
  const totalDocuments = documents.length;
  const uniqueDepartments = [...new Set(documents.map(d => d.department).filter(Boolean))].length;
  const indexStatus = rebuilding ? "INDEXING" : "READY";

  return (
    <div className="max-w-7xl mx-auto space-y-8 text-white relative">
      {/* Top Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 pb-2">
        <div className="space-y-1">
          <h2 className="text-3xl font-extrabold tracking-tight">Document Management</h2>
          <p className="text-xs text-neutral-400">Ingest curriculum materials and rebuild RAG database queries.</p>
        </div>
        <div className="flex items-center space-x-3">
          {rebuildStatus && (
            <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 animate-pulse text-violet-400 flex items-center space-x-2">
              <span>{rebuildStatus}</span>
            </span>
          )}
          <button
            type="button"
            disabled={rebuilding || loading}
            onClick={handleGlobalRebuild}
            className="px-4 py-2 bg-neutral-900 hover:bg-neutral-850 text-white border border-neutral-800 rounded-lg text-sm font-bold flex items-center space-x-2 transition-all cursor-pointer disabled:opacity-40"
          >
            <FaSyncAlt className={`w-3.5 h-3.5 ${rebuilding ? "animate-spin text-violet-400" : ""}`} />
            <span>Rebuild Knowledge Base</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Upload Sidebar (1/3) & Data list (2/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Upload Card Column */}
        <div className="lg:col-span-1">
          <DocumentUploadCard onUploadSuccess={handleUploadSuccess} />
        </div>

        {/* Document Table & Summary Column */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Summary Ribbon panel */}
          <div className="grid grid-cols-3 gap-4 bg-neutral-950/40 p-4 border border-neutral-900 rounded-xl select-none">
            <div className="flex items-center space-x-3.5">
              <div className="w-9 h-9 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 flex-shrink-0">
                <FaFolderOpen className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Total Files</p>
                <p className="text-base font-extrabold text-white">{totalDocuments}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3.5">
              <div className="w-9 h-9 rounded-lg bg-fuchsia-500/10 border border-fuchsia-500/20 flex items-center justify-center text-fuchsia-400 flex-shrink-0">
                <FaDatabase className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Departments</p>
                <p className="text-base font-extrabold text-white">{uniqueDepartments}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3.5">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                indexStatus === "INDEXING" 
                  ? "bg-amber-500/10 border-amber-500/20 text-amber-400" 
                  : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              }`}>
                <FaSyncAlt className={`w-4 h-4 ${indexStatus === "INDEXING" ? "animate-spin" : ""}`} />
              </div>
              <div>
                <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Vector Store</p>
                <p className={`text-xs font-black uppercase ${
                  indexStatus === "INDEXING" ? "text-amber-400" : "text-emerald-400"
                }`}>{indexStatus}</p>
              </div>
            </div>
          </div>

          {/* Table Area */}
          {loading ? (
            <div className="space-y-4 border border-neutral-900 bg-neutral-950/20 rounded-xl p-6">
              <div className="flex justify-between border-b border-neutral-850 pb-4">
                <div className="w-24 h-4 bg-neutral-800 rounded animate-pulse" />
                <div className="w-20 h-4 bg-neutral-800 rounded animate-pulse" />
                <div className="w-16 h-4 bg-neutral-800 rounded animate-pulse" />
              </div>
              {Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="flex justify-between py-3">
                  <div className="w-1/3 h-5 bg-neutral-900 rounded animate-pulse" />
                  <div className="w-20 h-5 bg-neutral-900 rounded animate-pulse" />
                  <div className="w-12 h-5 bg-neutral-900 rounded animate-pulse" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="p-8 border border-rose-500/20 bg-rose-500/5 text-center space-y-4 rounded-xl">
              <FaExclamationTriangle className="w-10 h-10 text-rose-400 mx-auto" />
              <div className="space-y-1">
                <p className="text-sm font-semibold">{error}</p>
                <p className="text-xs text-neutral-500">Ensure the backend API service is active.</p>
              </div>
              <button
                type="button"
                onClick={loadDocuments}
                className="px-4 py-2 border border-rose-500/30 text-rose-450 hover:bg-rose-500/10 text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                Retry Fetching
              </button>
            </div>
          ) : documents.length === 0 ? (
            <div className="p-12 border border-neutral-900 bg-neutral-950/30 text-center space-y-4 rounded-xl">
              <FaFolderOpen className="w-12 h-12 text-neutral-600 mx-auto" />
              <div className="space-y-1 max-w-sm mx-auto">
                <p className="text-sm font-semibold text-white">No documents uploaded yet.</p>
                <p className="text-xs text-neutral-500">Upload your first university syllabus or lecture notes to initialize the vector database.</p>
              </div>
            </div>
          ) : (
            <DocumentTable 
              documents={documents} 
              onDeleteClick={handleDeleteClick} 
            />
          )}
        </div>
      </div>

      {/* Delete Dialog Modal */}
      <DeleteDocumentDialog
        isOpen={isDeleteModalOpen}
        documentName={selectedDocForDelete?.filename || selectedDocForDelete?.original_filename || ""}
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
      />
    </div>
  );
}

export default AdminDocumentManagement;
