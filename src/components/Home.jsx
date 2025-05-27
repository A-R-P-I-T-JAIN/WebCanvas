import React, { useState, useEffect } from 'react';
import { ArrowRight, Code, Palette, Zap, Star, Check, Menu, X } from 'lucide-react';
import logo from '../assets/logo.png';
import { useNavigate } from 'react-router-dom';
import image from '../assets/canvas.png';

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const navigate = useNavigate();   

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const features = [
    {
      icon: <Palette className="w-6 h-6" />,
      title: "Draw Your Vision",
      description: "Sketch any website layout with simple drawings and wireframes"
    },
    {
      icon: <Code className="w-6 h-6" />,
      title: "AI-Powered Generation",
      description: "Our advanced AI transforms your sketches into production-ready code"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Instant Results",
      description: "Get pixel-perfect websites in seconds, not hours"
    }
  ];

  const steps = [
    { number: "01", title: "Sketch", description: "Draw your website idea on our canvas" },
    { number: "02", title: "Generate", description: "AI analyzes and converts your sketch" },
    { number: "03", title: "Deploy", description: "Get clean, responsive code instantly" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-900 to-gray-950 text-white overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div 
          className="absolute w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl transition-all duration-1000 ease-out"
          style={{
            left: mousePosition.x - 192,
            top: mousePosition.y - 192,
          }}
        />
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-cyan-500/8 rounded-full blur-2xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-emerald-500/8 rounded-full blur-2xl animate-pulse delay-1000" />
        <div className="absolute top-3/4 left-1/2 w-48 h-48 bg-teal-400/8 rounded-full blur-2xl animate-pulse delay-500" />
      </div>

      {/* Header */}
      <header className="relative z-50 px-6 py-6">
        <nav className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 flex items-center justify-center">
              <img src={logo} alt="logo" className='w-full h-full object-cover' />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent cursor-pointer">
              PixelPrompt
            </span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <button onClick={() => navigate('/sketchtool')} className="bg-gradient-to-r from-emerald-600 to-cyan-600 px-6 py-2 rounded-full hover:from-emerald-700 hover:to-cyan-700 transition-all transform hover:scale-105 shadow-lg shadow-emerald-500/25">
              Get Started
            </button>
          </div>

          {/* <button 
            className="md:hidden text-gray-300 hover:text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button> */}
        </nav>

        {/* Mobile menu */}
        {/* {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-gray-900/95 backdrop-blur-lg p-6 space-y-4 border-t border-gray-800">
            <a href="#features" className="block text-gray-300 hover:text-emerald-400 transition-colors">Features</a>
            <a href="#how-it-works" className="block text-gray-300 hover:text-emerald-400 transition-colors">How it Works</a>
            <a href="#pricing" className="block text-gray-300 hover:text-emerald-400 transition-colors">Pricing</a>
            <button onClick={() => navigate('/sketchtool')} className="w-full bg-gradient-to-r from-emerald-600 to-cyan-600 px-6 py-2 rounded-full hover:from-emerald-700 hover:to-cyan-700 transition-all shadow-lg shadow-emerald-500/25">
              Get Started
            </button>
          </div>
        )} */}
      </header>

      {/* Hero Section */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center space-x-2 bg-gray-800/50 backdrop-blur-sm rounded-full px-4 py-2 mb-8 border border-gray-700/50">
            <Star className="w-4 h-4 text-emerald-400" />
            <span className="text-sm text-gray-300">Transform sketches into code instantly</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            From
            <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent"> Sketch </span>
            to
            <span className="bg-gradient-to-r from-cyan-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent"> Code </span>
            in Seconds
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed">
            Draw your website ideas and watch our AI transform them into beautiful, 
            responsive websites with clean, production-ready code.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <button onClick={() => navigate('/sketchtool')} className="group bg-gradient-to-r from-emerald-600 to-cyan-600 px-8 py-4 rounded-full text-lg font-semibold hover:from-emerald-700 hover:to-cyan-700 transition-all transform hover:scale-105 flex items-center space-x-2 shadow-lg shadow-emerald-500/25">
              <span>Start Creating</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* image section */}
      <section className='w-full max-w-7xl mx-auto px-6 my-10'>
        <div className='relative w-full aspect-[16/9] rounded-lg overflow-hidden bg-white'>
          <img src={image} alt="image" className='w-full h-full object-contain' />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Why Choose 
              <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent"> PixelPrompt</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              The fastest way to turn your creative vision into reality
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group p-8 rounded-2xl bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 hover:bg-gray-800/70 hover:border-gray-700/50 transition-all duration-300 hover:scale-105"
              >
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-emerald-500/25">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-4 text-white">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-gray-900/80 to-gray-800/80 backdrop-blur-lg rounded-3xl p-12 border border-gray-700/50 shadow-2xl">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Transform Your Ideas?
            </h2>
            <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
              Join thousands of designers and developers who are already creating amazing websites with PixelPrompt.
            </p>
            <button onClick={() => navigate('/sketchtool')} className="group bg-gradient-to-r from-emerald-600 to-cyan-600 px-10 py-5 rounded-full text-xl font-semibold hover:from-emerald-700 hover:to-cyan-700 transition-all transform hover:scale-105 flex items-center space-x-3 mx-auto shadow-lg shadow-emerald-500/25">
              <span>Sketch Now</span>
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-6 md:mb-0">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                <img src={logo} alt="logo" className='w-full h-full object-cover' />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                PixelPrompt
              </span>
            </div>
            <div className="flex items-center space-x-8 text-gray-400">
              <a href="#" className="hover:text-emerald-400 transition-colors">Privacy</a>
              <a href="#" className="hover:text-emerald-400 transition-colors">Terms</a>
              <a href="#" className="hover:text-emerald-400 transition-colors">Contact</a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center">
            <p className="text-gray-500">
              © 2025 PixelPrompt. Transforming creativity into code.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}