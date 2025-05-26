import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Palette, Sparkles, Pen, Brain, Zap } from 'lucide-react';

const Enter = () => {
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [floatingElements, setFloatingElements] = useState([]);

  // Create floating particles effect
  useEffect(() => {
    const elements = [];
    for (let i = 0; i < 12; i++) {
      elements.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 15 + 5,
        delay: Math.random() * 3,
        duration: 2 + Math.random() * 3,
        opacity: Math.random() * 0.6 + 0.2
      });
    }
    setFloatingElements(elements);
  }, []);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const x = (e.clientX - centerX) / (rect.width / 2);
    const y = (e.clientY - centerY) / (rect.height / 2);
    setMousePosition({ x: x * 25, y: y * 25 });
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setMousePosition({ x: 0, y: 0 });
  };

  const handleEnterCanvas = () => {
    navigate("/playground");
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 flex flex-col justify-center items-center relative overflow-hidden">
      
      {/* Floating Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {floatingElements.map((element) => (
          <div
            key={element.id}
            className="absolute animate-pulse"
            style={{
              left: `${element.x}%`,
              top: `${element.y}%`,
              animationDelay: `${element.delay}s`,
              animationDuration: `${element.duration}s`,
              opacity: element.opacity
            }}
          >
            {element.id % 4 === 0 && (
              <div className={`w-2 h-8 bg-gradient-to-b from-teal-400 to-transparent rotate-12`}></div>
            )}
            {element.id % 4 === 1 && (
              <div className={`w-8 h-2 bg-gradient-to-r from-purple-400 to-transparent -rotate-12`}></div>
            )}
            {element.id % 4 === 2 && (
              <div className={`w-4 h-4 border-2 border-cyan-400 rounded-full`}></div>
            )}
            {element.id % 4 === 3 && (
              <Sparkles className="text-pink-400" size={element.size} />
            )}
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center mb-12 px-4">
        {/* AI Badge */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-purple-400/30 rounded-full">
            <Zap className="text-purple-400" size={16} />
            <span className="text-purple-300 text-sm font-medium">AI-Powered Canvas</span>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight">
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-purple-400 to-pink-400">
            Ready to Create
          </span>
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-500 -mt-2">
            Something Amazing?
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-12 leading-relaxed">
          Step into your creative workspace where 
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-purple-400 font-semibold"> AI meets artistry</span>
        </p>
      </div>

      {/* Interactive Canvas Entry Button */}
      <div
        className="relative group cursor-pointer mb-16"
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={handleMouseLeave}
        onClick={handleEnterCanvas}
      >
        {/* Outer Glow */}
        <div 
          className="absolute inset-0 bg-gradient-to-r from-teal-500 via-purple-500 to-pink-500 rounded-full blur-2xl opacity-40 group-hover:opacity-70 transition-all duration-500"
          style={{
            transform: `translate(${mousePosition.x * 0.3}px, ${mousePosition.y * 0.3}px) scale(${isHovering ? 1.2 : 1})`,
            transition: isHovering ? 'none' : 'transform 0.5s ease-out'
          }}
        ></div>
        
        {/* Main Button */}
        <div 
          className="relative w-72 h-72 sm:w-80 sm:h-80 md:w-96 md:h-96 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-md rounded-full flex flex-col items-center justify-center border border-white/20 group-hover:border-teal-400/50 transition-all duration-500 shadow-2xl"
          style={{
            transform: `translate(${mousePosition.x * 0.2}px, ${mousePosition.y * 0.2}px)`,
            transition: isHovering ? 'none' : 'transform 0.5s ease-out'
          }}
        >
          {/* Inner Content */}
          <div className="text-center relative z-10">
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-r from-teal-400 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Palette className="text-white" size={40} />
              </div>
            </div>
            
            {/* Title */}
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-teal-400 group-hover:to-purple-400 transition-all duration-300">
              Enter Canvas
            </h3>
            
            {/* Description */}
            <p className="text-gray-400 text-base sm:text-lg mb-6 px-6 leading-relaxed">
              Begin your creative journey with AI-powered tools
            </p>
            
            {/* Feature Pills */}
            <div className="flex flex-wrap justify-center gap-3 mb-4">
              <div className="flex items-center space-x-1 px-3 py-1.5 bg-teal-500/20 border border-teal-400/30 rounded-full">
                <Brain size={14} className="text-teal-400" />
                <span className="text-teal-300 text-xs font-medium">Smart AI</span>
              </div>
              <div className="flex items-center space-x-1 px-3 py-1.5 bg-purple-500/20 border border-purple-400/30 rounded-full">
                <Sparkles size={14} className="text-purple-400" />
                <span className="text-purple-300 text-xs font-medium">Auto Draw</span>
              </div>
              <div className="flex items-center space-x-1 px-3 py-1.5 bg-pink-500/20 border border-pink-400/30 rounded-full">
                <Pen size={14} className="text-pink-400" />
                <span className="text-pink-300 text-xs font-medium">Free Draw</span>
              </div>
            </div>
          </div>
          
          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-purple-500/10 to-pink-500/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          {/* Animated Ring */}
          <div className="absolute inset-0 rounded-full border-2 border-transparent group-hover:border-gradient-to-r group-hover:from-teal-400 group-hover:via-purple-400 group-hover:to-pink-400 transition-all duration-500"></div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="relative z-10 flex flex-col sm:flex-row gap-4 mb-8">
        <button 
          className="group relative px-8 py-4 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-2xl shadow-xl hover:shadow-teal-500/30 transform hover:scale-105 transition-all duration-300 font-bold text-lg overflow-hidden"
          onClick={handleEnterCanvas}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <span className="relative flex items-center gap-3">
            <Pen className="text-xl" />
            Start Drawing
          </span>
        </button>
        
        <button 
          className="group px-8 py-4 bg-white/5 backdrop-blur-md border border-white/20 text-white rounded-2xl shadow-xl hover:bg-white/10 transform hover:scale-105 transition-all duration-300 font-semibold text-lg"
          onClick={handleEnterCanvas}
        >
          <span className="flex items-center gap-3">
            <Sparkles className="text-xl text-purple-400" />
            Try AI Magic
          </span>
        </button>
      </div>

      {/* Bottom Features */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto px-4">
        <div className="text-center">
          <div className="w-12 h-12 bg-teal-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Pen className="text-teal-400" size={24} />
          </div>
          <h4 className="text-white font-semibold mb-2">Smart Drawing</h4>
          <p className="text-gray-400 text-sm">AI understands your sketches</p>
        </div>
        
        <div className="text-center">
          <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Brain className="text-purple-400" size={24} />
          </div>
          <h4 className="text-white font-semibold mb-2">Instant Analysis</h4>
          <p className="text-gray-400 text-sm">Get intelligent feedback</p>
        </div>
        
        <div className="text-center">
          <div className="w-12 h-12 bg-pink-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Sparkles className="text-pink-400" size={24} />
          </div>
          <h4 className="text-white font-semibold mb-2">Auto Generate</h4>
          <p className="text-gray-400 text-sm">Create from text prompts</p>
        </div>
      </div>

      {/* Floating Animation CSS */}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-15px) rotate(5deg);
          }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Enter;