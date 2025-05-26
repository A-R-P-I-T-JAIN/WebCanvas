import { UserButton, useUser, SignInButton, SignUpButton } from '@clerk/clerk-react';
import React from 'react';
import { Brain, Sparkles, ChevronRight } from 'lucide-react';

const Nav = () => {
  const { isSignedIn } = useUser();

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
        <div className="flex items-center space-x-3">
          {isSignedIn ? (
            <div className="flex items-center space-x-4">
              {/* AI Features Badge */}
              <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 rounded-full">
                <Sparkles className="text-purple-400" size={14} />
                <span className="text-purple-300 text-xs font-medium">AI Powered</span>
              </div>
              
              {/* User Button with enhanced styling */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-purple-500 rounded-full blur-md opacity-30"></div>
                <div className="relative bg-white/10 backdrop-blur-sm border border-white/20 rounded-full p-1">
                  <UserButton 
                    appearance={{
                      elements: {
                        avatarBox: "w-8 h-8 rounded-full border-2 border-white/30"
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Sign In Button */}
              <SignInButton>
                <button className="group relative px-3 sm:px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl text-white hover:bg-white/10 transition-all duration-300 text-xs sm:text-sm font-medium overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative">Sign In</span>
                </button>
              </SignInButton>
              
              {/* Register Button */}
              <SignUpButton>
                <button className="group relative px-3 sm:px-4 py-2 bg-gradient-to-r from-teal-500 to-purple-500 text-white rounded-xl font-medium hover:from-teal-600 hover:to-purple-600 transition-all duration-300 shadow-lg shadow-purple-500/25 text-xs sm:text-sm overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative flex items-center space-x-1">
                    <span>Get Started</span>
                    <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform duration-300" />
                  </span>
                </button>
              </SignUpButton>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Nav;