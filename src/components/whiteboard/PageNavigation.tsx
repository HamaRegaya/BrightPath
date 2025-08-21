import React, { useState } from 'react';
import { Plus, X, Edit3, ChevronLeft, ChevronRight } from 'lucide-react';
import { PageNavigationProps } from '../../types/whiteboard';
import ConfirmModal from '../ui/ConfirmModal';

/**
 * Composant pour naviguer entre les pages du whiteboard
 */
export const PageNavigation: React.FC<PageNavigationProps> = ({
  pages,
  currentPageId,
  onPageChange,
  onAddPage,
  onDeletePage,
  onRenamePage
}) => {
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<{ id: string; name: string } | null>(null);

  const currentPageIndex = pages.findIndex(page => page.id === currentPageId);
  const canGoPrevious = currentPageIndex > 0;
  const canGoNext = currentPageIndex < pages.length - 1;

  const startEditing = (pageId: string, currentName: string) => {
    setEditingPageId(pageId);
    setEditingName(currentName);
  };

  const finishEditing = () => {
    if (editingPageId && editingName.trim()) {
      onRenamePage(editingPageId, editingName.trim());
    }
    setEditingPageId(null);
    setEditingName('');
  };

  const cancelEditing = () => {
    setEditingPageId(null);
    setEditingName('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      finishEditing();
    } else if (e.key === 'Escape') {
      cancelEditing();
    }
  };

  const goToPreviousPage = () => {
    if (canGoPrevious) {
      onPageChange(pages[currentPageIndex - 1].id);
    }
  };

  const goToNextPage = () => {
    if (canGoNext) {
      onPageChange(pages[currentPageIndex + 1].id);
    }
  };

  const requestDeletePage = (id: string, name: string) => {
    setPendingDelete({ id, name });
    setConfirmOpen(true);
  };

  return (
    <div className="bg-white border-t border-gray-200 px-4 py-2 flex items-center justify-between shadow-sm">
      {/* Navigation gauche/droite */}
      <div className="flex items-center space-x-2">
        <button
          onClick={goToPreviousPage}
          disabled={!canGoPrevious}
          className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Page précédente"
        >
          <ChevronLeft size={16} />
        </button>
        
        <span className="text-sm text-gray-500 min-w-0">
          {currentPageIndex + 1} / {pages.length}
        </span>
        
        <button
          onClick={goToNextPage}
          disabled={!canGoNext}
          className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Page suivante"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Onglets des pages */}
      <div className="flex items-center space-x-1 flex-1 mx-4 overflow-x-auto">
        {pages.map((page) => (
          <div
            key={page.id}
            className={`group relative flex items-center px-3 py-2 rounded-lg border transition-all cursor-pointer min-w-0 ${
              page.id === currentPageId
                ? 'bg-blue-50 border-blue-200 text-blue-700'
                : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
            }`}
            onClick={() => onPageChange(page.id)}
          >
            {editingPageId === page.id ? (
              <input
                type="text"
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                onBlur={finishEditing}
                onKeyDown={handleKeyPress}
                className="bg-transparent border-none outline-none text-sm font-medium w-20"
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span className="text-sm font-medium truncate max-w-24">
                {page.name}
              </span>
            )}
            
            {/* Actions de la page (visibles au hover) */}
            {page.id === currentPageId && editingPageId !== page.id && (
              <div className="flex items-center ml-2 space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    startEditing(page.id, page.name);
                  }}
                  className="p-1 hover:bg-blue-100 rounded transition-colors"
                  title="Renommer"
                >
                  <Edit3 size={12} />
                </button>
                
                {pages.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      requestDeletePage(page.id, page.name);
                    }}
                    className="p-1 hover:bg-red-100 text-red-500 rounded transition-colors"
                    title="Supprimer"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Bouton ajouter page */}
      <button
        onClick={onAddPage}
        className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        title="Ajouter une page"
      >
        <Plus size={16} />
        <span>Nouvelle page</span>
      </button>

      {/* Confirm delete modal */}
      <ConfirmModal
        open={confirmOpen}
        title="Delete page?"
        description={`Are you sure you want to delete "${pendingDelete?.name ?? ''}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        danger
        onConfirm={() => {
          if (pendingDelete) {
            onDeletePage(pendingDelete.id);
          }
          setConfirmOpen(false);
          setPendingDelete(null);
        }}
        onCancel={() => {
          setConfirmOpen(false);
          setPendingDelete(null);
        }}
      />
    </div>
  );
};
