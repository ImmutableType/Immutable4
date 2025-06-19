// app/publisher/page.tsx
'use client'
import { useState } from 'react'

export default function PublisherPage() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  const handlePublish = () => {
    // Publishing logic would go here
    alert('Publishing functionality will be implemented in a future update.')
  }

  return (
    <>
      <h1 className="text-2xl font-bold mb-6">Create New Article</h1>
      
      <div className="space-y-4">
        <div>
          <label className="block mb-2 font-medium">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Enter article title"
          />
        </div>
        
        <div>
          <label className="block mb-2 font-medium">Content (Markdown)</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-2 border rounded h-64"
            placeholder="Write your article using Markdown..."
          />
        </div>
        
        <button
          onClick={handlePublish}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Publish Article
        </button>
      </div>
    </>
  )
}