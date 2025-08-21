import React, { useState, useEffect, useCallback } from 'react';
import { Grid } from 'lucide-react';
import { useDrawing } from '../context/DrawingContext';
import { useWhiteboardPages } from '../hooks/whiteboard';
import { PageNavigation, PageOverview } from './whiteboard/index';
import Whiteboard from './Whiteboard';

/**
 * Composant conteneur pour gérer les pages multiples du whiteboard
 */
const MultiPageWhiteboard: React.FC = () => {
  const {
    strokes,
    aiAssistancePoints,
    clear,
    loadPageData,
    getCurrentPageData
  } = useDrawing();
  
  const {
    pages,
    currentPageId,
    addPage,
    deletePage,
    renamePage,
    changePage,
    duplicatePage,
    saveCurrentPageData
  } = useWhiteboardPages();

  const [showPageOverview, setShowPageOverview] = useState(false);
  const [isChangingPage, setIsChangingPage] = useState(false);
  const [lastSavedPageId, setLastSavedPageId] = useState<string | null>(null);

  // Sauvegarder automatiquement les données quand les strokes ou AI points changent
  useEffect(() => {
    if (!isChangingPage && currentPageId && lastSavedPageId !== currentPageId) {
      const { strokes: currentStrokes, aiPoints } = getCurrentPageData();
      // Ne sauvegarder que si la page a du contenu OU si c'est pas la première fois qu'on la charge
      if (currentStrokes.length > 0 || aiPoints.length > 0 || lastSavedPageId !== null) {
        saveCurrentPageData(currentStrokes, aiPoints);
      }
      setLastSavedPageId(currentPageId);
    }
  }, [strokes, aiAssistancePoints, isChangingPage, currentPageId, getCurrentPageData, saveCurrentPageData, lastSavedPageId]);

  const handlePageChange = useCallback(async (pageId: string) => {
    if (pageId === currentPageId) return;

    setIsChangingPage(true);
    
    // Sauvegarder les données de la page actuelle
    const { strokes: currentStrokes, aiPoints } = getCurrentPageData();
    saveCurrentPageData(currentStrokes, aiPoints);
    
    // Changer vers la nouvelle page
    changePage(pageId);
    
    // Charger les données de la nouvelle page
    const newPage = pages.find(p => p.id === pageId);
    if (newPage) {
      loadPageData(newPage.strokes, newPage.aiAssistancePoints);
    }
    
    setIsChangingPage(false);
  }, [currentPageId, getCurrentPageData, saveCurrentPageData, changePage, pages, loadPageData]);

  const handleAddPage = () => {
    // Sauvegarder d'abord les données de la page actuelle
    if (strokes.length > 0 || aiAssistancePoints.length > 0) {
      const { strokes: currentStrokes, aiPoints } = getCurrentPageData();
      saveCurrentPageData(currentStrokes, aiPoints);
    }
    
    // Créer la nouvelle page qui sera automatiquement sélectionnée
    const newPageId = addPage();
    
    // Vider immédiatement le canvas pour la nouvelle page
    setIsChangingPage(true);
    loadPageData([], []); // Charger une page vide
    setLastSavedPageId(newPageId);
    setIsChangingPage(false);
  };

  const handleDeletePage = (pageId: string) => {
    // Vider le canvas avant de supprimer si c'est la page actuelle
    if (pageId === currentPageId) {
      clear();
    }
    deletePage(pageId);
  };

  const handleDuplicatePage = (pageId: string) => {
    duplicatePage(pageId);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Bouton pour ouvrir la vue d'ensemble */}
      <div className="absolute top-4 right-4 z-30">
        <button
          onClick={() => setShowPageOverview(true)}
          className="p-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all hover:bg-gray-50"
          title="Vue d'ensemble des pages"
        >
          <Grid size={16} />
        </button>
      </div>

  {/* Whiteboard principal - prend toute la hauteur disponible moins la navigation */}
  <div className="flex-1 min-h-0 flex">
        <Whiteboard />
      </div>

      {/* Navigation des pages - hauteur fixe */}
  <div className="flex-shrink-0">
        <PageNavigation
          pages={pages}
          currentPageId={currentPageId}
          onPageChange={handlePageChange}
          onAddPage={handleAddPage}
          onDeletePage={handleDeletePage}
          onRenamePage={renamePage}
        />
      </div>

      {/* Vue d'ensemble des pages (modal) */}
      {showPageOverview && (
        <PageOverview
          pages={pages}
          currentPageId={currentPageId}
          onPageSelect={handlePageChange}
          onClose={() => setShowPageOverview(false)}
          onAddPage={handleAddPage}
          onDeletePage={handleDeletePage}
          onDuplicatePage={handleDuplicatePage}
        />
      )}
    </div>
  );
};

export default MultiPageWhiteboard;
