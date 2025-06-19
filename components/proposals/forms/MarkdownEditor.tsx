// components/proposals/forms/MarkdownEditor.tsx
'use client'

import React, { useState } from 'react';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export default function MarkdownEditor({ value, onChange, error }: MarkdownEditorProps) {
  const [isPreview, setIsPreview] = useState(false);
  
  // Calculate word count
  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;
  
  // Toggle between edit and preview modes
  const togglePreview = () => {
    setIsPreview(!isPreview);
  };
  
  // Render markdown (simple version)
  const renderMarkdown = () => {
    // This is a simple rendering - in a real app, you'd use a markdown parser
    return value.split('\n').map((line, i) => {
      if (line.startsWith('## ')) {
        return <h3 key={i} style={{ fontSize: '18px', fontWeight: 'bold', marginTop: '16px', marginBottom: '8px' }}>{line.replace('## ', '')}</h3>;
      } else if (line.startsWith('- ')) {
        return <li key={i} style={{ marginLeft: '20px' }}>{line.replace('- ', '')}</li>;
      } else if (line === '') {
        return <br key={i} />;
      } else {
        return <p key={i} style={{ marginBottom: '12px' }}>{line}</p>;
      }
    });
  };
  
  return (
    <div className="markdown-editor">
      {/* Toolbar */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        marginBottom: '8px' 
      }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            onClick={togglePreview}
            style={{
              padding: '6px 12px',
              backgroundColor: isPreview ? '#D9D9D9' : '#000000',
              color: isPreview ? '#000000' : 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            {isPreview ? 'Edit' : 'Preview'}
          </button>
        </div>
        
        <span style={{ 
          fontSize: '14px',
          color: wordCount > 200 ? '#B3211E' : '#6c757d'
        }}>
          {wordCount} / 200 words
        </span>
      </div>
      
      {/* Editor or Preview */}
      <div style={{ 
        border: error ? '1px solid #B3211E' : '1px solid #D9D9D9', 
        borderRadius: '4px',
        overflow: 'hidden'
      }}>
        {!isPreview ? (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Start typing your proposal details here..."
            style={{
              width: '100%',
              minHeight: '300px',
              resize: 'vertical',
              border: 'none',
              padding: '16px',
              fontSize: '16px',
              lineHeight: '1.6',
              fontFamily: 'var(--font-body)'
            }}
          />
        ) : (
          <div style={{ 
            padding: '16px', 
            minHeight: '300px',
            fontSize: '16px',
            lineHeight: '1.6',
            backgroundColor: '#f8f9fa'
          }}>
            {value ? renderMarkdown() : (
              <p style={{ color: '#6c757d', fontStyle: 'italic' }}>
                Preview will appear here...
              </p>
            )}
          </div>
        )}
      </div>
      
      {/* Error Message */}
      {error && (
        <span style={{ 
          color: '#B3211E', 
          fontSize: '14px', 
          display: 'block', 
          marginTop: '4px' 
        }}>
          {error}
        </span>
      )}
      
      {/* Markdown Tips */}
      <div style={{ 
        marginTop: '12px', 
        padding: '12px', 
        backgroundColor: '#f8f9fa', 
        borderRadius: '4px',
        fontSize: '14px'
      }}>
        <p style={{ fontWeight: '500', marginBottom: '8px' }}>Markdown Tips:</p>
        <ul style={{ 
          margin: 0, 
          paddingLeft: '20px',
          color: '#6c757d' 
        }}>
          <li>Use ## for headings</li>
          <li>Use - for bullet points</li>
          <li>Leave a blank line between paragraphs</li>
        </ul>
      </div>
    </div>
  );
}