// components/ui/Navigation.tsx
import Link from 'next/link'

export function Navigation({ 
  className, 
  toggleNav,
  isOpen
}: { 
  className?: string;
  toggleNav: () => void;
  isOpen: boolean;
}) {
  return (
    <nav className={className}>
      <div className="flex justify-between items-center p-4 border-b border-gray-200">
        <h2 className="font-semibold text-lg">ImmutableType</h2>
        <button 
          onClick={toggleNav}
          className="md:hidden"
        >
          ✕
        </button>
      </div>
      
      <div className="p-4">
        <ul className="space-y-2">
          <li>
            <Link href="/reader" className="block p-2 rounded hover:bg-gray-100">
              Reader
            </Link>
          </li>
          <li>
            <Link href="/publisher" className="block p-2 rounded hover:bg-gray-100">
              Publisher
            </Link>
          </li>
          <li>
            <Link href="/profile" className="block p-2 rounded hover:bg-gray-100">
              Profile
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  )
}