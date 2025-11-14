import React, { useState, useCallback, useMemo } from 'react';
import { MODAL_CONTENT } from '../constants/seo';

type ModalType = 'about' | 'contact' | 'guide' | 'privacy' | 'terms' | 'dmca';

const Starfield: React.FC = () => {
    const createStars = (count: number, size: string, speed: string, opacity: string) => {
        return Array.from({ length: count }).map((_, i) => {
            const style: React.CSSProperties = {
                '--star-x': `${Math.random() * 100}%`,
                '--star-y': `${Math.random() * 100}%`,
                '--star-size': size,
                '--animation-delay': `${Math.random() * -parseInt(speed, 10)}s`,
                '--animation-duration': speed,
                opacity: opacity,
            };
            return (
                <div
                    key={i}
                    className="absolute bg-white rounded-full animate-[twinkle_var(--animation-duration)_infinite]"
                    style={{
                        ...style,
                        width: 'var(--star-size)',
                        height: 'var(--star-size)',
                        left: 'var(--star-x)',
                        top: 'var(--star-y)',
                        animationDelay: 'var(--animation-delay)',
                    }}
                ></div>
            );
        });
    };

    const stars1 = useMemo(() => createStars(100, '1px', '15s', '0.7'), []);
    const stars2 = useMemo(() => createStars(50, '2px', '20s', '0.8'), []);
    const stars3 = useMemo(() => createStars(25, '3px', '25s', '1.0'), []);

    return (
        <div className="fixed top-0 left-0 w-full h-full -z-10 bg-gradient-to-br from-[#0c0a1a] via-[#1b132d] to-[#0e1a35] overflow-hidden">
            <style>
                {`
                @keyframes twinkle {
                    0% { transform: scale(0.8); opacity: 0.5; }
                    50% { transform: scale(1.2); opacity: 1; }
                    100% { transform: scale(0.8); opacity: 0.5; }
                }
                `}
            </style>
            <div>{stars1}</div>
            <div>{stars2}</div>
            <div>{stars3}</div>
        </div>
    );
};

const Modal: React.FC<{ content: { title: string; body: React.ReactNode }; onClose: () => void }> = ({ content, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 animate-fadeIn" onClick={onClose}>
            <div className="bg-[#1a1a3a] border border-purple-500/50 rounded-xl shadow-2xl shadow-purple-500/20 w-full max-w-2xl max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="sticky top-0 bg-[#1a1a3a]/80 backdrop-blur-sm flex justify-between items-center p-4 border-b border-purple-400/30 z-10">
                    <h2 className="text-2xl font-bold text-white">{content.title}</h2>
                    <button onClick={onClose} className="text-gray-300 hover:text-white text-3xl transition-transform duration-300 hover:rotate-90">&times;</button>
                </div>
                <div className="p-6 text-gray-300 space-y-4 prose prose-invert max-w-none">
                    {content.body}
                </div>
            </div>
            <style>
                {`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
                `}
            </style>
        </div>
    );
};


const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeModal, setActiveModal] = useState<ModalType | null>(null);

  const openModal = useCallback((modal: ModalType) => {
    setActiveModal(modal);
  }, []);

  const closeModal = useCallback(() => {
    setActiveModal(null);
  }, []);

  const modalLinks: { label: string; modal: ModalType }[] = [
    { label: 'About', modal: 'about' },
    { label: 'Guide', modal: 'guide' },
    { label: 'Contact', modal: 'contact' },
    { label: 'Privacy Policy', modal: 'privacy' },
    { label: 'Terms of Service', modal: 'terms' },
    { label: 'DMCA', modal: 'dmca' },
  ];

  return (
    <div className="relative min-h-screen text-white font-sans">
      <Starfield />
      <header className="py-4 px-4 sm:px-8 border-b border-purple-500/30 sticky top-0 bg-[#0c0a1a]/80 backdrop-blur-sm z-20">
        <nav className="container mx-auto flex justify-center items-center">
          <ul className="flex flex-wrap justify-center gap-x-4 gap-y-2 sm:gap-x-6">
            {modalLinks.map(({ label, modal }) => (
              <li key={modal}>
                <button onClick={() => openModal(modal)} className="text-gray-300 hover:text-purple-400 transition-colors duration-300 text-sm sm:text-base">
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </header>
      
      <main className="relative z-10">
        {children}
      </main>

      <footer className="py-6 px-4 text-center border-t border-purple-500/30 mt-16">
        <div className="container mx-auto text-gray-400 text-sm">
          <p className="mb-2">
            <a href="https://github.com/hsinidev" target="_blank" rel="noopener noreferrer" className="font-bold text-[#FFD700] hover:underline">
              Powered by HSINI MOHAMED
            </a>
          </p>
          <p>
            Contact: <a href="mailto:hsini.web@gmail.com" className="hover:underline">hsini.web@gmail.com</a> | 
            Visit: <a href="https://doodax.com" target="_blank" rel="noopener noreferrer" className="hover:underline">doodax.com</a>
          </p>
        </div>
      </footer>

      {activeModal && <Modal content={MODAL_CONTENT[activeModal]} onClose={closeModal} />}
    </div>
  );
};

export default Layout;