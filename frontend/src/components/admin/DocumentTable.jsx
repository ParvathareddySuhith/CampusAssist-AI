import React from 'react';
import { FaFilePdf, FaExternalLinkAlt } from 'react-icons/fa';
import DocumentStatusBadge from './DocumentStatusBadge';

function DocumentTable({ documents }) {
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
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
          <tr className="border-b border-neutral-800 bg-neutral-900/30 text-neutral-400 font-semibold select-none">
            <th className="p-4 text-xs uppercase tracking-wider">Filename</th>
            <th className="p-4 text-xs uppercase tracking-wider">Department</th>
            <th className="p-4 text-xs uppercase tracking-wider">Uploaded By</th>
            <th className="p-4 text-xs uppercase tracking-wider">Uploaded At</th>
            <th className="p-4 text-xs uppercase tracking-wider">Status</th>
            <th className="p-4 text-xs uppercase tracking-wider text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-900">
          {documents.length === 0 ? (
            <tr>
              <td colSpan="6" className="p-8 text-center text-sm text-neutral-500 font-semibold select-none">
                No documents found matching the criteria.
              </td>
            </tr>
          ) : (
            documents.map((doc) => {
              const displayName = doc.filename || 'Unnamed Document';
              const fileStatus = doc.status || 'READY';
              
              return (
                <tr 
                  key={doc.id || doc.public_id} 
                  className="hover:bg-neutral-900/35 transition-colors duration-150 group"
                >
                  <td className="p-4">
                    <div className="flex items-center space-x-3 min-w-0">
                      <FaFilePdf className="w-5 h-5 text-rose-500/80 flex-shrink-0" />
                      <div className="min-w-0">
                        <span className="font-semibold text-neutral-200 truncate max-w-[200px] md:max-w-xs block">
                          {displayName}
                        </span>
                        {doc.size && (
                          <p className="text-[10px] text-neutral-500 select-none">
                            {doc.size}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-xs font-medium text-neutral-300 select-none">
                    <span className="bg-neutral-900/60 px-2 py-1 border border-neutral-800 rounded font-semibold text-neutral-400">
                      {doc.department || 'CSE'}
                    </span>
                  </td>
                  <td className="p-4 text-xs font-semibold text-neutral-400 select-none">
                    {doc.uploaded_by || 'admin'}
                  </td>
                  <td className="p-4 text-xs text-neutral-400 font-medium select-none">
                    {formatDate(doc.uploaded_at)}
                  </td>
                  <td className="p-4 select-none">
                    <DocumentStatusBadge status={fileStatus} />
                  </td>
                  <td className="p-4 text-right">
                    {doc.url ? (
                      <a 
                        href={doc.url}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-violet-400 hover:text-violet-300 font-semibold text-xs transition-colors inline-flex items-center space-x-1 cursor-pointer select-none"
                      >
                        <span>View</span>
                        <FaExternalLinkAlt className="w-2.5 h-2.5" />
                      </a>
                    ) : (
                      <span className="text-xs text-neutral-500 font-semibold select-none">N/A</span>
                    )}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

export default DocumentTable;
