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
            <h3 className="text-lg font-bold text-white">Delete Document</h3>
            <p className="text-xs text-neutral-400">Confirm file removal from index</p>
          </div>
        </div>

        <div className="text-sm text-neutral-300 leading-relaxed bg-neutral-950/40 p-4 border border-neutral-950 rounded-lg">
          Are you sure you want to delete <span className="font-bold text-white">"{documentName}"</span>? This action is permanent and cannot be undone.
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
