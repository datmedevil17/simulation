import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export function WalletModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      <div className="relative bg-[#111827] border border-white/10 rounded-2xl p-8 max-w-sm w-full shadow-2xl animate-fade-in-up">
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          ✕
        </button>

        <h3 className="text-2xl font-bold text-white mb-2 font-['Space_Grotesk']">Start Building</h3>
        <p className="text-gray-400 text-sm mb-6">Select a network to connect your wallet.</p>

        <div className="space-y-4">
          {/* Network Selection (Visual Only for now as we force Devnet) */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button className="flex flex-col items-center justify-center p-3 rounded-xl bg-blue-600/20 border border-blue-500/50 text-blue-400 font-medium">
              <span className="text-xl mb-1">⚡</span>
              Devnet
            </button>
            <button disabled className="flex flex-col items-center justify-center p-3 rounded-xl bg-gray-800/50 border border-white/5 text-gray-500 font-medium cursor-not-allowed opacity-50">
              <span className="text-xl mb-1">🔒</span>
              Mainnet
            </button>
          </div>

          <div className="space-y-3">
             <div className="flex items-center gap-2 text-xs text-green-400 bg-green-900/20 p-2 rounded border border-green-900/50">
                <span>✓</span> No gas fees (Devnet)
             </div>
             <div className="flex items-center gap-2 text-xs text-green-400 bg-green-900/20 p-2 rounded border border-green-900/50">
                <span>✓</span> No NFTs required
             </div>
          </div>

          <div className="pt-4">
            <WalletMultiButton className="!bg-[#512da8] hover:!bg-[#673ab7] !h-12 !w-full !justify-center !font-bold !rounded-xl transition-all shadow-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
