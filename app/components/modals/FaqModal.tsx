// components/modals/FaqModal.tsx
'use client'

interface FaqModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FaqModal({ isOpen, onClose }: FaqModalProps) {
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
          <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="prose prose-lg max-w-none space-y-6">
          <div>
            <h3 className="font-bold text-lg mb-1">What is decentralized journalism?</h3>
            <p>Journalism freed from corporate control and censorship. Content published directly to the blockchain remains permanently accessible and unalterable.</p>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-1">What is blockchain?</h3>
            <p>An immutable digital ledger shared across computer networks. It records information in a way that makes it impossible to change or hack.</p>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-1">What is a Web3 wallet?</h3>
            <p>Your digital identity and secure key to the decentralized web. It allows you to interact with blockchain applications without intermediaries.</p>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-1">How big is this problem?</h3>
            <p>70 million Americans live in news deserts without local reporting. Corporate consolidation has centralized media control while free speech faces legislative threats.</p>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-1">How much does it cost?</h3>
            <p>Just $1.49 per year for our base subscription. True information independence at a revolutionary price.</p>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-1">May I advertise?</h3>
            <p>No. We've eliminated advertising to preserve editorial integrity. Your subscription funds honest journalism.</p>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-1">Is it safe?</h3>
            <p>Blockchain technology is secure and transparent by design. As with the early internet, basic digital literacy protects users.</p>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-1">Is it illegal?</h3>
            <p>Publishing on blockchain is protected speech under the First Amendment. We're extending constitutional rights to the digital frontier.</p>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-1">How do I become a journalist on ImmutableType?</h3>
            <p>We're methodically expanding our journalist network. Contact us directly to join the information revolution.</p>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-1">How do I subscribe?</h3>
            <p>Connect your Web3 wallet to access our platform. Subscription tokens will be announced soon—enjoy ungated access until then.</p>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-1">May I tip the journalists?</h3>
            <p>Yes, direct blockchain tipping is coming soon. Support quality journalism with direct creator payments.</p>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-1">Are there paywalls?</h3>
            <p>No paywalls—information wants to be free. Advanced tools require subscriptions, but reading is open to anyone with a Web3 wallet.</p>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-1">Do you collect my data?</h3>
            <p>We collect nothing. Your personal data remains your own—a revolutionary stance in today's surveillance economy.</p>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-1">What is ImmutableType?</h3>
            <p>A technology platform, not a publisher or editor. We build tools that empower people to communicate freely without intermediaries.</p>
          </div>
        </div>
      </div>
    </div>
  );
}