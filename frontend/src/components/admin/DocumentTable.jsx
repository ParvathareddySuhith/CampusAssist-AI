import React from "react";
import { FaTrashAlt, FaFilePdf, FaExternalLinkAlt } from "react-icons/fa";
import DocumentStatusBadge from "./DocumentStatusBadge";

function DocumentTable({ documents, onDeleteClick }) {
  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-neutral-800 bg-neutral-950/40 backdrop-blur-md">
      <table className="w-full text-left border-collapse text-sm text-neutral-300">
        <thead>
          <tr className="border-b border-neutral-850 bg-neutral-900/30 text-neutral-400 font-semibold select-none">
            <th className="p-4 text-xs uppercase tracking-wider">Filename</th>
            <th className="p-4 text-xs uppercase tracking-wider">Department</th>
            <th className="p-4 text-xs uppercase tracking-wider">Subject</th>
            <th className="p-4 text-xs uppercase tracking-wider">Semester</th>
            <th className="p-4 text-xs uppercase tracking-wider">Uploaded On</th>
            <th className="p-4 text-xs uppercase tracking-wider">Status</th>
            <th className="p-4 text-xs uppercase tracking-wider text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-900">
          {documents.map((doc) => {
            const displayName = doc.filename || doc.original_filename || "Unnamed Document";
            const fileStatus = doc.status || "READY"; // Fallback to ready
            
            return (
              <tr 
                key={doc.public_id} 
                className="hover:bg-neutral-900/30 transition-colors duration-150 group"
              >
                <td className="p-4">
                  <div className="flex items-center space-x-3 min-w-0">
                    <FaFilePdf className="w-5 h-5 text-rose-500/80 flex-shrink-0" />
                    <div className="min-w-0">
                      {doc.url ? (
                        <a 
                          href={doc.url}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="font-semibold text-neutral-200 hover:text-violet-400 transition-colors flex items-center space-x-1.5 truncate cursor-pointer"
                        >
                          <span className="truncate max-w-[200px] md:max-w-xs">{displayName}</span>
                          <FaExternalLinkAlt className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </a>
                      ) : (
                        <span className="font-semibold text-neutral-400 truncate max-w-[200px] md:max-w-xs">{displayName}</span>
                      )}
                      {doc.size && (
                        <p className="text-[10px] text-neutral-500">
                          {(doc.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="p-4 text-xs font-medium text-neutral-300">
                  <span className="bg-neutral-900/60 px-2 py-1 border border-neutral-800 rounded font-semibold text-neutral-400">
                    {doc.department || "CSE"}
                  </span>
                </td>
                <td className="p-4 text-xs font-semibold text-neutral-200 truncate max-w-[150px]">
                  {doc.subject || "General"}
                </td>
                <td className="p-4 text-xs text-neutral-400 font-semibold">
                  {doc.semester ? `Semester ${doc.semester}` : "All"}
                </td>
                <td className="p-4 text-xs text-neutral-400 font-medium">
                  {formatDate(doc.created_at)}
                </td>
                <td className="p-4">
                  <DocumentStatusBadge status={fileStatus} />
                </td>
                <td className="p-4 text-right">
                  <button
                    type="button"
                    onClick={() => onDeleteClick(doc)}
                    className="p-2 text-neutral-500 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 border border-transparent hover:border-rose-500/10 transition-all duration-200 cursor-pointer inline-flex items-center justify-center"
                    title="Delete Document"
                  >
                    <FaTrashAlt className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default DocumentTable;
