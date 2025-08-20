import React from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

interface MathTextProps {
  text: string;
  position: { x: number; y: number };
  maxWidth: number;
  className?: string;
}

interface ParsedContent {
  type: 'text' | 'inline-math' | 'block-math';
  content: string;
}

const MathText: React.FC<MathTextProps> = ({ text, position, maxWidth, className = '' }) => {
  const parseText = (text: string): ParsedContent[] => {
    const parts: ParsedContent[] = [];
    let currentIndex = 0;

    // Pattern to match LaTeX math expressions
    // \(...\) for inline math, \[...\] for block math, $$...$$ for block math, $...$ for inline math
    const mathPattern = /(\\\[.*?\\\]|\\\(.*?\\\)|\$\$.*?\$\$|\$.*?\$)/gs;
    
    let match;
    while ((match = mathPattern.exec(text)) !== null) {
      // Add text before math expression
      if (match.index > currentIndex) {
        const textBefore = text.slice(currentIndex, match.index);
        if (textBefore.trim()) {
          parts.push({ type: 'text', content: textBefore });
        }
      }

      // Add math expression
      const mathContent = match[1];
      let cleanMath = mathContent;
      let mathType: 'inline-math' | 'block-math' = 'inline-math';

      if (mathContent.startsWith('\\[') && mathContent.endsWith('\\]')) {
        cleanMath = mathContent.slice(2, -2);
        mathType = 'block-math';
      } else if (mathContent.startsWith('\\(') && mathContent.endsWith('\\)')) {
        cleanMath = mathContent.slice(2, -2);
        mathType = 'inline-math';
      } else if (mathContent.startsWith('$$') && mathContent.endsWith('$$')) {
        cleanMath = mathContent.slice(2, -2);
        mathType = 'block-math';
      } else if (mathContent.startsWith('$') && mathContent.endsWith('$')) {
        cleanMath = mathContent.slice(1, -1);
        mathType = 'inline-math';
      }

      parts.push({ type: mathType, content: cleanMath });
      currentIndex = match.index + mathContent.length;
    }

    // Add remaining text
    if (currentIndex < text.length) {
      const remainingText = text.slice(currentIndex);
      if (remainingText.trim()) {
        parts.push({ type: 'text', content: remainingText });
      }
    }

    // If no math was found, return the original text
    if (parts.length === 0) {
      parts.push({ type: 'text', content: text });
    }

    return parts;
  };

  const renderContent = (parts: ParsedContent[]) => {
    return parts.map((part, index) => {
      switch (part.type) {
        case 'inline-math':
          try {
            return <InlineMath key={index} math={part.content} />;
          } catch (error) {
            console.error('KaTeX rendering error:', error);
            return <span key={index} className="text-red-500 bg-red-50 px-1 rounded">Math Error: {part.content}</span>;
          }
        case 'block-math':
          try {
            return (
              <div key={index} className="my-2">
                <BlockMath math={part.content} />
              </div>
            );
          } catch (error) {
            console.error('KaTeX rendering error:', error);
            return <div key={index} className="text-red-500 bg-red-50 px-2 py-1 rounded my-2">Math Error: {part.content}</div>;
          }
        case 'text':
        default:
          return <span key={index}>{part.content}</span>;
      }
    });
  };

  const parsedContent = parseText(text);

  return (
    <div
      className={`bg-blue-50 border border-blue-200 rounded-lg p-3 shadow-lg font-medium text-sm leading-relaxed ${className} ${position.x === 0 && position.y === 0 ? 'relative' : 'absolute z-10'}`}
      style={{
        ...(position.x === 0 && position.y === 0 ? {} : {
          left: `${position.x}px`,
          top: `${position.y}px`,
        }),
        maxWidth: `${maxWidth}px`,
        fontFamily: '"Urbanist", sans-serif',
        color: '#2563EB',
        wordWrap: 'break-word',
        whiteSpace: 'pre-wrap'
      }}
    >
      {renderContent(parsedContent)}
    </div>
  );
};

export default MathText;
