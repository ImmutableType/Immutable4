// components/modals/AboutModal.tsx
'use client'

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AboutModal({ isOpen, onClose }: AboutModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl p-6 w-[600px] max-h-[80vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">About</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="prose prose-lg max-w-none space-y-4">
          <p>
            ImmutableType reinvents journalism for the digital age—a decentralized publishing platform where truth finds permanent refuge on the blockchain.
          </p>
          
          <p>
            We empower local journalists to create unalterable records of their work, free from the shadow of censorship, corporate influence, or algorithmic manipulation. Once published, these journalistic artifacts remain accessible forever—immutable testimonies to our times.
          </p>
          
          <p>
            Just as Gutenberg's press democratized knowledge in the 15th century, ImmutableType stands as the guardian of information integrity in an era of deepfakes, propaganda, and vanishing press freedoms. We offer certainty when facts themselves seem negotiable.
          </p>
          
          <p>
            No editors can be pressured. No servers can be seized. No articles can be silently amended.
          </p>
          
          <p>
            In a world where history is increasingly written in erasable ink, we provide something revolutionary: journalism etched in digital stone.
          </p>
          
          <p className="font-bold">
            Truth, preserved. Forever.
          </p>
        </div>
      </div>
    </div>
  );
}