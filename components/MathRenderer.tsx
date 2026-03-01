import React, { useEffect, useRef } from 'react';

interface MathRendererProps {
  content: string;
  className?: string;
}

declare global {
  interface Window {
    MathJax: {
      typesetPromise: (elements?: HTMLElement[]) => Promise<void>;
    };
  }
}

const MathRenderer: React.FC<MathRendererProps> = ({ content, className = '' }) => {
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (containerRef.current && window.MathJax) {
      // Aggressively sanitize to force inline mode
      const inlineContent = (content || '')
        .replace(/\n/g, ' ')
        // Replace display math delimiters with inline
        .replace(/\$\$/g, '$')
        .replace(/\\\[/g, '$')
        .replace(/\\\]/g, '$');

      containerRef.current.innerHTML = inlineContent;
      
      window.MathJax.typesetPromise([containerRef.current])
        .catch((err) => console.error('MathJax typeset failed:', err));
    }
  }, [content]);

  // Use style={{ display: 'inline' }} to override any CSS classes that might set it to block
  return (
    <span 
      ref={containerRef} 
      className={`math-content ${className}`}
      style={{ display: 'inline', wordBreak: 'break-word' }}
    />
  );
};

export default MathRenderer;