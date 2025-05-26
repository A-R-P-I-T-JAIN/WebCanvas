
import React from 'react';
import { Brain, Sparkles, ChevronRight } from 'lucide-react';

const Nav = () => {

  return (
    <div className="w-full flex justify-center items-center z-50 relative">
      <div className="w-[90vw] sm:w-[80vw] md:w-[70vw] lg:w-[60vw] absolute top-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl flex items-center justify-between px-6 py-3 shadow-xl shadow-black/20">
        
        {/* Logo Section */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-teal-400 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center relative overflow-hidden">
            <Brain className="text-white z-10" size={20} />
            <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-purple-600 opacity-80"></div>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-purple-400 to-pink-400">
              Doodle
            </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-500">
              Sense
            </span>
          </h1>
        </div>

        {/* Navigation Actions */}
        
      </div>
    </div>
  );
};

export default Nav;