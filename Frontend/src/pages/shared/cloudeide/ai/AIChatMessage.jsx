import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const AIChatMessage = ({ content }) => {
  return (
    <div className="prose dark:prose-invert max-w-none text-white dark:text-gray-100 leading-relaxed">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : 'text';
            const codeString = String(children).replace(/\n$/, '');

            return !inline ? (
              <CodeBlock language={language} codeString={codeString} {...props} />
            ) : (
              <code
                className="bg-gray-100 dark:bg-gray-800 text-red-500 dark:text-red-400 px-1.5 py-0.5 rounded text-sm font-mono"
                {...props}
              >
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

// Copy button state handle karne ke liye sub-component
const CodeBlock = ({ language, codeString }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(codeString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-4 rounded-lg overflow-hidden shadow-md border border-gray-700">
      {/* Code Box Header */}
      <div className="bg-gray-800 text-gray-300 px-4 py-1.5 text-xs font-mono flex justify-between items-center border-b border-gray-700">
        <span className="uppercase font-semibold">{language}</span>
        <button
          onClick={handleCopy}
          className="hover:text-white text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded transition-all"
        >
          {copied ? '✓ Copied!' : 'Copy code'}
        </button>
      </div>

      {/* Syntax Highlighted Code */}
      <SyntaxHighlighter
        language={language}
        style={vscDarkPlus}
        customStyle={{
          margin: 0,
          padding: '1rem',
          borderRadius: '0 0 8px 8px',
          fontSize: '0.875rem',
        }}
      >
        {codeString}
      </SyntaxHighlighter>
    </div>
  );
};

export default AIChatMessage;