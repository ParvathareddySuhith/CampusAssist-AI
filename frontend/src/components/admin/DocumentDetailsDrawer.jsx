import React, { useState, useEffect } from 'react';
import { FaTimes, FaSyncAlt, FaTrashAlt, FaFolder, FaDatabase, FaLayerGroup } from 'react-icons/fa';
import * as docService from '../../services/adminDocumentService';
import DocumentStatusBadge from './DocumentStatusBadge';

/**
 * Details drawer sidebar showing file, storage metadata, and index options
 */
function DocumentDetailsDrawer({ isOpen, docId, onClose, onDeleteClick, onRetrySuccess }) {
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [retryPending, setRetryPending] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    if (!isOpen || !docId) return;

    const fetchDetails = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await docService.getAdminDocument(docId);
        setDoc(data);
      } catch (err) {
        console.error('Failed to fetch doc details:', err);
        setError('Failed to load document details.');
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [isOpen, docId]);

  const handleRetryIndex = async () => {
    if (!doc || retryPending) return;
    try {
      setRetryPending(true);
      const res = await docService.retryAdminDocumentIndex(doc.id);
      if (res.success) {
        setDoc((prev) => ({ ...prev, status: res.status }));
        setToastMessage('Indexing restarted.');
        if (onRetrySuccess) onRetrySuccess();
        setTimeout(() => setToastMessage(''), 3000);
      } else {
        alert(res.error || 'Failed to retry indexing.');
      }
    } catch (err) {
      console.error(err);
      alert('Error retrying index.');
    } finally {
      setRetryPending(false);
    }
  };

  if (!isOpen) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      return d.toLocaleString();
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs transition-opacity"
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-neutral-900 border-l border-neutral-800 shadow-2xl flex flex-col text-white transform transition-transform duration-300">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-neutral-800 select-none">
          <div>
            <h3 className="text-lg font-bold">Document Details</h3>
            <p className="text-xs text-neutral-400">Inspect metadata and indexing parameters</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-all cursor-pointer"
          >
            <FaTimes className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 select-none">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <div className="w-8 h-8 rounded-full border-2 border-violet-500/20 border-t-violet-500 animate-spin" />
              <span className="text-sm text-neutral-500 font-semibold">Loading details...</span>
            </div>
          ) : error ? (
            <div className="text-center text-sm text-rose-400 py-12 font-semibold">
              {error}
            </div>
          ) : doc ? (
            <>
              {/* Toast banner inside drawer */}
              {toastMessage && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-lg text-xs font-semibold text-center animate-fade-in">
                  {toastMessage}
                </div>
              )}

              {/* Document Section */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center space-x-1.5">
                  <FaFolder className="text-violet-400" />
                  <span>Document</span>
                </h4>
                <div className="bg-neutral-950/40 p-4 border border-neutral-950 rounded-xl space-y-3.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-400 font-medium">Filename</span>
                    <span className="font-semibold text-right max-w-[200px] truncate">{doc.filename}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400 font-medium">Department</span>
                    <span className="font-semibold">{doc.department}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-400 font-medium">Status</span>
                    <DocumentStatusBadge status={doc.status} />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400 font-medium">Uploaded</span>
                    <span className="font-semibold text-right">{formatDate(doc.uploaded_at)}</span>
                  </div>
                </div>
              </div>

              {/* Storage Section */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center space-x-1.5">
                  <FaDatabase className="text-amber-400" />
                  <span>Storage</span>
                </h4>
                <div className="bg-neutral-950/40 p-4 border border-neutral-950 rounded-xl space-y-3.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-400 font-medium">File Size</span>
                    <span className="font-semibold">{doc.size}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400 font-medium">Public ID</span>
                    <span className="font-semibold font-mono text-xs max-w-[180px] truncate text-neutral-200" title={doc.public_id}>
                      {doc.public_id}
                    </span>
                  </div>
                </div>
              </div>

              {/* Index Section */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center space-x-1.5">
                  <FaLayerGroup className="text-emerald-400" />
                  <span>Index</span>
                </h4>
                <div className="bg-neutral-950/40 p-4 border border-neutral-950 rounded-xl space-y-3.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-400 font-medium">Chunk Count</span>
                    <span className="font-semibold">{doc.chunks}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400 font-medium">Embedding Model</span>
                    <span className="font-semibold text-right text-xs max-w-[180px] truncate text-neutral-200" title={doc.embedding_model}>
                      {doc.embedding_model}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400 font-medium">Last Indexed</span>
                    <span className="font-semibold text-right">{formatDate(doc.last_indexed_at)}</span>
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-neutral-800 bg-neutral-950/20 flex flex-col space-y-3 select-none">
          <div className="flex space-x-3">
            <button
              type="button"
              disabled={!doc || retryPending || doc.status === 'INDEXING'}
              onClick={handleRetryIndex}
              className="flex-1 py-2.5 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 disabled:hover:bg-neutral-800 border border-neutral-750 text-neutral-200 font-bold rounded-lg text-sm transition-all duration-200 flex items-center justify-center space-x-2 cursor-pointer"
            >
              <FaSyncAlt className={`w-3.5 h-3.5 ${retryPending ? 'animate-spin' : ''}`} />
              <span>Retry Index</span>
            </button>
            <button
              type="button"
              disabled={!doc || retryPending}
              onClick={() => onDeleteClick(doc)}
              className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white font-bold rounded-lg text-sm transition-all duration-200 flex items-center justify-center space-x-2 cursor-pointer shadow-md hover:shadow-rose-600/10"
            >
              <FaTrashAlt className="w-3.5 h-3.5" />
              <span>Delete Document</span>
            </button>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 border border-neutral-800 hover:bg-neutral-800 text-neutral-400 hover:text-white font-semibold rounded-lg text-sm transition-all duration-200 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </>
  );
}

export default DocumentDetailsDrawer;
