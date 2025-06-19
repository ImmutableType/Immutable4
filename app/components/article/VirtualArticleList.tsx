'use client'
import { Article } from '../../lib/blockchain/types';

interface VirtualArticleListProps {
  articles: Article[];
  onSelectArticle: (article: Article) => void;
}

export function VirtualArticleList({ articles, onSelectArticle }: VirtualArticleListProps) {
  return (
    <div className="space-y-4 py-4">
      {articles.map((article) => (
        <div 
          key={article.id} 
          className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors cursor-pointer overflow-hidden"
          onClick={() => onSelectArticle(article)}
        >
          <h3 className="text-md font-semibold text-gray-900 mb-2 break-words">
            {article.title}
          </h3>
          
          <div className="flex items-center space-x-2 text-xs text-gray-500 mb-2">
            <span>{article.author.slice(0, 6)}...{article.author.slice(-4)}</span>
            <span>•</span>
            <span>{article.timestamp > 0 
              ? new Date(article.timestamp * 1000).toLocaleDateString() 
              : 'Unknown date'}</span>
          </div>
          
          {article.preview && (
            <p className="text-sm text-gray-600 leading-relaxed break-words line-clamp-2">
              {article.preview}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}