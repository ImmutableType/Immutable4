// app/components/ui/PublisherSidebar.tsx
'use client'

interface PublisherSidebarProps {
  className?: string
}

export function PublisherSidebar({ className }: PublisherSidebarProps) {
  return (
    <aside className={className}>
      <h2 className="font-bold text-xl mb-4">Publishing Tools</h2>
      <div className="space-y-2">
        <p>Draft Count: 0</p>
        <p>Published Articles: 0</p>
      </div>
      
      <div className="mt-4">
        <h3 className="font-semibold mb-2">Tips:</h3>
        <ul className="text-sm space-y-2">
          <li>Use markdown for formatting</li>
          <li>Add images to enhance your content</li>
          <li>Keep titles under 60 characters</li>
        </ul>
      </div>
    </aside>
  )
}