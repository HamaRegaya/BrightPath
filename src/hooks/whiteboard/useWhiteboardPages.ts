import { useState, useCallback } from 'react';
import { WhiteboardPage } from '../../types/whiteboard';
import { Stroke, AIAssistancePoint } from '../../context/DrawingContext';

interface UseWhiteboardPagesReturn {
  pages: WhiteboardPage[];
  currentPageId: string;
  getCurrentPage: () => WhiteboardPage | undefined;
  addPage: () => string; // Retourne l'ID de la nouvelle page
  deletePage: (pageId: string) => void;
  renamePage: (pageId: string, newName: string) => void;
  changePage: (pageId: string) => void;
  updateCurrentPageData: (strokes: Stroke[], aiPoints: AIAssistancePoint[]) => void;
  duplicatePage: (pageId: string) => void;
  saveCurrentPageData: (strokes: Stroke[], aiPoints: AIAssistancePoint[]) => void;
}

/**
 * Hook pour gérer les pages multiples du whiteboard
 */
export const useWhiteboardPages = (): UseWhiteboardPagesReturn => {
  const [pages, setPages] = useState<WhiteboardPage[]>([
    {
      id: 'page-1',
      name: 'Page 1',
      strokes: [],
      aiAssistancePoints: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]);
  
  const [currentPageId, setCurrentPageId] = useState<string>('page-1');

  // Obtenir la page actuelle
  const getCurrentPage = useCallback((): WhiteboardPage | undefined => {
    return pages.find(page => page.id === currentPageId);
  }, [pages, currentPageId]);

  // Ajouter une nouvelle page
  const addPage = useCallback((): string => {
    const newPageNumber = pages.length + 1;
    const newPage: WhiteboardPage = {
      id: `page-${Date.now()}`,
      name: `Page ${newPageNumber}`,
      strokes: [],
      aiAssistancePoints: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    setPages(prev => [...prev, newPage]);
    // Changer vers la nouvelle page
    setCurrentPageId(newPage.id);
    
    return newPage.id; // Retourner l'ID de la nouvelle page
  }, [pages.length]);

  // Supprimer une page
  const deletePage = useCallback((pageId: string) => {
    if (pages.length <= 1) {
      alert('Vous devez avoir au moins une page.');
      return;
    }

    setPages(prev => {
      const newPages = prev.filter(page => page.id !== pageId);
      
      // Si la page supprimée était la page actuelle, basculer vers la première page
      if (pageId === currentPageId && newPages.length > 0) {
        setCurrentPageId(newPages[0].id);
      }
      
      return newPages;
    });
  }, [pages.length, currentPageId]);

  // Renommer une page
  const renamePage = useCallback((pageId: string, newName: string) => {
    setPages(prev => prev.map(page => 
      page.id === pageId 
        ? { ...page, name: newName, updatedAt: new Date() }
        : page
    ));
  }, []);

  // Changer de page
  const changePage = useCallback((pageId: string) => {
    if (pages.some(page => page.id === pageId)) {
      setCurrentPageId(pageId);
    }
  }, [pages]);

  // Mettre à jour les données de la page actuelle
  const updateCurrentPageData = useCallback((strokes: Stroke[], aiPoints: AIAssistancePoint[]) => {
    setPages(prev => prev.map(page => 
      page.id === currentPageId 
        ? { ...page, strokes, aiAssistancePoints: aiPoints, updatedAt: new Date() }
        : page
    ));
  }, [currentPageId]);

  // Sauvegarder les données de la page actuelle avant de changer de page
  const saveCurrentPageData = useCallback((strokes: Stroke[], aiPoints: AIAssistancePoint[]) => {
    updateCurrentPageData(strokes, aiPoints);
  }, [updateCurrentPageData]);

  // Dupliquer une page
  const duplicatePage = useCallback((pageId: string) => {
    const pageToDuplicate = pages.find(page => page.id === pageId);
    if (!pageToDuplicate) return;

    const newPage: WhiteboardPage = {
      id: `page-${Date.now()}`,
      name: `${pageToDuplicate.name} (Copie)`,
      strokes: [...pageToDuplicate.strokes],
      aiAssistancePoints: [...pageToDuplicate.aiAssistancePoints],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setPages(prev => [...prev, newPage]);
    setCurrentPageId(newPage.id);
  }, [pages]);

  return {
    pages,
    currentPageId,
    getCurrentPage,
    addPage,
    deletePage,
    renamePage,
    changePage,
    updateCurrentPageData,
    duplicatePage,
    saveCurrentPageData
  };
};
