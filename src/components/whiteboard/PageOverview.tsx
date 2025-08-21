import React, { useState } from 'react';
import { Grid, X } from 'lucide-react';
import { WhiteboardPage } from '../../types/whiteboard';
import { PageThumbnail } from './PageThumbnail';

interface PageOverviewProps {
  pages: WhiteboardPage[];
  currentPageId: string;
  onPageSelect: (pageId: string) => void;
  onClose: () => void;
  onAddPage: () => void;
  onDeletePage: (pageId: string) => void;
  onDuplicatePage?: (pageId: string) => void;
}

/**
 * Composant pour afficher une vue d'ensemble de toutes les pages
 */
export const PageOverview: React.FC<PageOverviewProps> = ({
  pages,
  currentPageId,
  onPageSelect,
  onClose,
  onAddPage,
  onDeletePage,
  onDuplicatePage
}) => {
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);

  const handlePageClick = (pageId: string) => {
    onPageSelect(pageId);
    onClose();
  };

  const handlePageRightClick = (e: React.MouseEvent, pageId: string) => {
    e.preventDefault();
    setSelectedPageId(selectedPageId === pageId ? null : pageId);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Grid size={20} />
            <h2 className="text-lg font-semibold text-gray-900">Vue d'ensemble des pages</h2>
            <span className="text-sm text-gray-500">({pages.length} pages)</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Grid des pages */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {pages.map((page) => (
              <div key={page.id} className="relative group">
                <PageThumbnail
                  page={page}
                  isActive={page.id === currentPageId}
                  onClick={() => handlePageClick(page.id)}
                  width={150}
                  height={100}
                />
                
                {/* Menu contextuel */}
                {selectedPageId === page.id && (
                  <div className="absolute top-2 right-2 bg-white rounded-lg shadow-lg border border-gray-200 p-2 z-10">
                    <div className="flex flex-col space-y-1">
                      {onDuplicatePage && (
                        <button
                          onClick={() => {
                            onDuplicatePage(page.id);
                            setSelectedPageId(null);
                          }}
                          className="px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded text-left"
                        >
                          Dupliquer
                        </button>
                      )}
                      {pages.length > 1 && (
                        <button
                          onClick={() => {
                            if (confirm(`Supprimer "${page.name}" ?`)) {
                              onDeletePage(page.id);
                              setSelectedPageId(null);
                            }
                          }}
                          className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded text-left"
                        >
                          Supprimer
                        </button>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Bouton menu (visible au hover) */}
                <button
                  onClick={(e) => handlePageRightClick(e, page.id)}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-white rounded-full p-1 shadow-md transition-opacity"
                >
                  <Grid size={12} />
                </button>
              </div>
            ))}
            
            {/* Bouton pour ajouter une nouvelle page */}
            <div
              onClick={onAddPage}
              className="border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-all"
              style={{ width: 150, height: 100 }}
            >
              <div className="text-center text-gray-500">
                <div className="text-2xl mb-1">+</div>
                <div className="text-xs">Nouvelle page</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Cliquez sur une page pour la sélectionner
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
