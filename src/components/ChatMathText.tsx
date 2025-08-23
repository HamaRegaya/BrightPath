import React from 'react';
import { InlineMath, BlockMath } from 'react-katex';
import ReactMarkdown from 'react-markdown';
import 'katex/dist/katex.min.css';

interface ChatMathTextProps {
  text: string;
  className?: string;
}

interface ParsedContent {
  type: 'math' | 'markdown';
  content: string;
  displayMode?: boolean;
}

const ChatMathText: React.FC<ChatMathTextProps> = ({ text, className = '' }) => {
  // Fonction pour parser le texte en séparant les expressions mathématiques du markdown
  const parseTextWithMath = (input: string): ParsedContent[] => {
    const result: ParsedContent[] = [];
    // Pattern pour capturer \[...\] (display) et \(...\) (inline)
    const mathPattern = /(\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\))/g;
    let lastIndex = 0;
    let match;
    
    while ((match = mathPattern.exec(input)) !== null) {
      // Ajouter le texte avant la math (markdown)
      if (match.index > lastIndex) {
        const textBefore = input.slice(lastIndex, match.index);
        if (textBefore.trim()) {
          result.push({ type: 'markdown', content: textBefore });
        }
      }
      
      // Ajouter l'expression mathématique
      const mathContent = match[1];
      let cleanMath = mathContent;
      let isDisplayMode = false;
      
      if (mathContent.startsWith('\\[') && mathContent.endsWith('\\]')) {
        cleanMath = mathContent.slice(2, -2);
        isDisplayMode = true;
      } else if (mathContent.startsWith('\\(') && mathContent.endsWith('\\)')) {
        cleanMath = mathContent.slice(2, -2);
        isDisplayMode = false;
      }
      
      result.push({ 
        type: 'math', 
        content: cleanMath,
        displayMode: isDisplayMode
      });
      
      lastIndex = match.index + match[0].length;
    }
    
    // Ajouter le texte restant
    if (lastIndex < input.length) {
      const remainingText = input.slice(lastIndex);
      if (remainingText.trim()) {
        result.push({ type: 'markdown', content: remainingText });
      }
    }
    
    // Si aucune math trouvée, traiter tout comme markdown
    if (result.length === 0) {
      result.push({ type: 'markdown', content: input });
    }
    
    return result;
  };

  const renderContent = (content: ParsedContent, index: number) => {
    if (content.type === 'math') {
      try {
        return content.displayMode ? (
          <BlockMath key={index} math={content.content} />
        ) : (
          <InlineMath key={index} math={content.content} />
        );
      } catch (error) {
        // Only log errors in development mode
        if (import.meta.env.DEV) {
          console.error('KaTeX rendering error:', error);
        }
        return (
          <span key={index} className="text-red-500 bg-red-50 px-1 rounded text-xs">
            Math Error: {content.content}
          </span>
        );
      }
    } else {
      // Rendu Markdown avec composants personnalisés
      return (
        <ReactMarkdown
          key={index}
          components={{
            // Personnaliser les paragraphes
            p: ({ children }) => <div>{children}</div>,
            
            // Personnaliser les liens
            a: ({ href, children }) => (
              <a href={href} className="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">
                {children}
              </a>
            ),
            
            // Personnaliser le texte en gras
            strong: ({ children }) => <strong className="font-bold text-gray-900">{children}</strong>,
            
            // Personnaliser le texte en italique
            em: ({ children }) => <em className="italic text-gray-800">{children}</em>,
            
            // Personnaliser les listes
            ul: ({ children }) => <ul className="list-disc list-inside ml-4 space-y-1">{children}</ul>,
            ol: ({ children }) => <ol className="list-decimal list-inside ml-4 space-y-1">{children}</ol>,
            li: ({ children }) => <li className="text-gray-700">{children}</li>,
            
            // Personnaliser les titres
            h1: ({ children }) => <h1 className="text-xl font-bold mt-4 mb-2 text-gray-900">{children}</h1>,
            h2: ({ children }) => <h2 className="text-lg font-semibold mt-3 mb-2 text-gray-800">{children}</h2>,
            h3: ({ children }) => <h3 className="text-md font-medium mt-2 mb-1 text-gray-700">{children}</h3>,
            
            // Personnaliser le rendu du code
            code: ({ node, className, children, ...props }: any) => {
              const inline = !className?.includes('language-');
              return inline ? 
                <code {...props} className="bg-gray-100 text-red-600 px-1 rounded text-sm font-mono">{children}</code> :
                <code {...props} className="block bg-gray-100 p-2 rounded text-sm font-mono overflow-x-auto">{children}</code>;
            },
            
            // Personnaliser les blocs de code
            pre: ({ children }) => (
              <pre className="bg-gray-100 p-3 rounded-lg overflow-x-auto my-2 text-sm">{children}</pre>
            ),
            
            // Personnaliser les citations
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-blue-200 pl-4 italic text-gray-600 my-2">
                {children}
              </blockquote>
            ),
          }}
        >
          {content.content}
        </ReactMarkdown>
      );
    }
  };

  const parsedContent = parseTextWithMath(text);

  return (
    <div className={className}>
      {parsedContent.map((content, index) => renderContent(content, index))}
    </div>
  );
};

export default ChatMathText;
