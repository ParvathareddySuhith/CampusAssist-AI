import React from 'react';
import { FaTrashAlt, FaExclamationTriangle } from 'react-icons/fa';

function DeleteDocumentDialog({ isOpen, documentName, onConfirm, onCancel }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Background Overlay */}
      <div 
        onClick={onCancel}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300"
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-6 shadow-2xl z-10 text-white transform transition-all duration-300">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <FaExclamationTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Delete document?</h3>
            <p className="text-xs text-neutral-400">Permanently remove "{documentName}"</p>
          </div>
        </div>

        <div className="text-sm text-neutral-300 leading-relaxed bg-neutral-950/40 p-4 border border-neutral-950 rounded-lg space-y-2">
          <p>This permanently removes:</p>
          <ul className="list-none pl-1 space-y-1 font-semibold text-neutral-200">
            <li>• PDF</li>
            <li>• Vector embeddings</li>
            <li>• Metadata</li>
          </ul>
        </div>

        <div className="flex justify-end space-x-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-neutral-800 text-neutral-400 rounded-lg hover:bg-neutral-800 hover:text-white text-sm transition-all duration-200 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-sm transition-all duration-200 flex items-center space-x-2 cursor-pointer shadow-md hover:shadow-rose-600/10"
          >
            <FaTrashAlt className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteDocumentDialog;
