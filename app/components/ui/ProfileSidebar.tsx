// app/components/ui/ProfileSidebar.tsx
'use client'

interface ProfileSidebarProps {
  className?: string
}

export function ProfileSidebar({ className }: ProfileSidebarProps) {
  return (
    <aside className={className}>
      <h2 className="font-bold text-xl mb-4">About the Author</h2>
      <p className="mb-4 text-sm">
        This publisher is part of ImmutableType's network of verified journalists 
        committed to creating permanent, uncensored records of their work.
      </p>
      
      <div className="mt-4">
        <h3 className="font-semibold mb-2">Editorial Statement:</h3>
        <div className="bg-gray-50 p-3 rounded">
          <p className="text-sm italic">
            "My work focuses on investigating the intersection of technology and civil liberties. 
            I believe in transparent reporting that holds power to account."
          </p>
        </div>
      </div>
    </aside>
  )
}