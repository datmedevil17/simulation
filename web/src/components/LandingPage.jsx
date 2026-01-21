import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Button } from './ui/button';
import { WalletModal } from './WalletModal';
import titleImg from '/title.png';

export function LandingPage({ onEnter, simCity }) {
  const { connected } = useWallet();
  const { cityAccount, initializeCity, isLoading } = simCity || {};
  const [showModal, setShowModal] = useState(false);

  // Auto-close modal if connected, or handle next steps?
  // User logic: "CTA -> Modal -> Connect".
  // If connected, we show "Enter City" or "Initialize".

  const handleStartBuilding = () => {
    if (connected) {
       // If already connected, do the action directly
       handleAction();
    } else {
       setShowModal(true);
    }
  };

  const handleAction = async () => {
    if (!cityAccount) {
      try {
        await initializeCity();
      } catch (error) {
        console.error("Failed:", error);
      }
    } else {
      onEnter();
    }
  };

  return (
    <div className="fixed inset-0 w-full h-full bg-[#0B1220] overflow-y-auto text-white font-['Inter'] selection:bg-cyan-500/30">
      <div className="relative min-h-screen flex flex-col">
          
        {/* Ambient Gradients - Fixed */}
        <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
           <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#06b6d4] opacity-[0.05] blur-[120px] rounded-full animate-pulse" />
           <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#7c3aed] opacity-[0.05] blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
           <div className="absolute inset-0 bg-[url('/grid.png')] opacity-[0.03]" />
        </div>

        {/* HERO SECTION */}
        <section className="relative w-full max-w-7xl mx-auto px-6 pt-12 pb-20 flex flex-col items-center justify-center min-h-[85vh]">
          
          <div className="w-full max-w-4xl mx-auto text-center space-y-8 animate-fade-in-up">
            {/* Title Image */}
            <div className="relative w-full max-w-2xl mx-auto transform hover:scale-[1.01] transition-transform duration-500">
              <div className="absolute inset-0 bg-blue-500/20 blur-[60px] opacity-40 animate-pulse" />
              <img src={titleImg} alt="Solana SimCity" className="relative w-full h-auto drop-shadow-2xl animate-float" />
            </div>

            {/* Value Prop */}
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold font-['Space_Grotesk'] leading-tight tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-blue-200">
                A blockchain-powered city builder<br/>where every decision is on-chain.
              </h1>
              <p className="text-lg md:text-xl text-blue-200/60 max-w-2xl mx-auto font-light">
                Instant gameplay using Solana + Ephemeral Rollups. Build, Delegate, Dominate.
              </p>
            </div>

            {/* Primary CTA */}
            <div className="pt-4">
                {connected && cityAccount ? (
                    <Button 
                       onClick={handleAction}
                       className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white text-xl font-bold px-12 py-8 rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:shadow-[0_0_50px_rgba(16,185,129,0.6)] transform hover:-translate-y-1 transition-all duration-300"
                    >
                       ENTER METROPOLIS ▶
                    </Button>
                ) : connected && !cityAccount ? (
                    <Button 
                       onClick={handleAction}
                       disabled={isLoading}
                       className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xl font-bold px-12 py-8 rounded-2xl shadow-[0_0_30px_rgba(6,182,212,0.4)] hover:shadow-[0_0_50px_rgba(6,182,212,0.6)] transform hover:-translate-y-1 transition-all duration-300"
                    >
                       {isLoading ? 'INITIALIZING...' : 'INITIALIZE CITY 🏗️'}
                    </Button>
                ) : (
                    <Button 
                        onClick={() => setShowModal(true)}
                        className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xl font-bold px-12 py-8 rounded-2xl shadow-[0_0_30px_rgba(6,182,212,0.4)] hover:shadow-[0_0_50px_rgba(6,182,212,0.6)] transform hover:-translate-y-1 transition-all duration-300 group"
                    >
                        START BUILDING <span className="ml-2 group-hover:translate-x-1 transition-transform">▶</span>
                    </Button>
                )}
                
                <p className="mt-4 text-sm text-blue-300/40 font-mono">
                  {connected ? '● Wallet Connected' : '🚀 Play on Devnet • No Gas Fees'}
                </p>
            </div>
          </div>
        </section>

   

      </div>

      <WalletModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
}

