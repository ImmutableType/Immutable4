// app/components/article/ArticleModal.tsx
'use client'
import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { ArticleService } from '../../lib/blockchain/articleService'
import { ethers } from 'ethers'

interface Article {
  id: string
  title: string
  author: string
  timestamp: number
  contentHash: string
  preview?: string
}

interface ArticleModalProps {
  article: Article | null
  isOpen: boolean
  onClose: () => void
  provider: ethers.BrowserProvider | null
}

export function ArticleModal({ article, isOpen, onClose, provider }: ArticleModalProps) {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  useEffect(() => {
    const fetchArticleContent = async () => {
      if (!article || !provider) {
        return
      }
      
      setLoading(true)
      setError('')
      
      try {
        // In a real implementation, you would fetch the content from IPFS here
        // For now, we'll simulate loading with a timeout
        setTimeout(() => {
          setContent(`# ${article.title}\n\nThis is a sample article content. In a real application, this would be loaded from IPFS using the contentHash: ${article.contentHash}\n\n## Introduction\n\nThis is the introduction section of the article.\n\n## Main Content\n\nThis is the main content of the article. It contains multiple paragraphs and formatting.`)
          setLoading(false)
        }, 1000)
      } catch (err: any) {
        setError(`Failed to load article content: ${err.message}`)
        setLoading(false)
      }
    }

    if (isOpen && article) {
      fetchArticleContent()
    }
  }, [isOpen, article, provider])

  if (!isOpen || !article) return null

  return (
    <div style={{ width: '100%' }}>
      {loading ? (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          padding: '32px' 
        }}>
          <div style={{ 
            width: '32px', 
            height: '32px', 
            borderRadius: '50%', 
            border: '2px solid #e9ecef', 
            borderTopColor: '#4361ee',
            animation: 'spin 1s linear infinite'
          }}></div>
        </div>
      ) : error ? (
        <div style={{ 
          color: '#dc3545', 
          padding: '16px', 
          backgroundColor: '#f8d7da', 
          borderRadius: '4px' 
        }}>
          {error}
        </div>
      ) : (
        <div style={{ lineHeight: '1.6', fontSize: '16px' }}>
          <ReactMarkdown
            components={{
              p: ({node, ...props}) => <p style={{ marginBottom: '16px' }} {...props} />,
              h1: ({node, ...props}) => <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px' }} {...props} />,
              h2: ({node, ...props}) => <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }} {...props} />,
              ul: ({node, ...props}) => <ul style={{ listStyleType: 'disc', marginLeft: '16px', marginBottom: '16px' }} {...props} />,
              ol: ({node, ...props}) => <ol style={{ listStyleType: 'decimal', marginLeft: '16px', marginBottom: '16px' }} {...props} />,
              blockquote: ({node, ...props}) => <blockquote style={{ borderLeft: '4px solid #e9ecef', paddingLeft: '16px', fontStyle: 'italic', marginBottom: '16px' }} {...props} />,
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      )}
    </div>
  )
}