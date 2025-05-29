import React, { useState, useRef, useEffect } from "react";
import { Terminal } from "xterm";
import { WebContainer } from "@webcontainer/api";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "xterm/css/xterm.css";
import "../App.css";
import ExecutionPage from "./ExecutionPage";

function WebsiteGenerator() {
  const navigate = useNavigate();
  const [source, setSource] = useState(""); // State to hold the server URL
  const terminalRef = useRef(null); // Reference to the terminal container in the DOM
  const webContainerRef = useRef(null); // Reference to the WebContainer instance
  const inputWriterRef = useRef(null); // Reference to the shell's input writer
  const [code, setCode] = useState(null); // State to hold the code to be executed
  const editor = useRef(null);
  const [errors, setErrors] = useState("");
  const [isInitialized, setIsInitialized] = useState(false);
  const initializationAttempted = useRef(false);
  const [isBuilding, setIsBuilding] = useState(false);
  const [fileTreeVisible, setFileTreeVisible] = useState(true);
  const [panelHeights, setPanelHeights] = useState({
    preview: 60,
    terminal: 40,
  });
  const [panelWidths, setPanelWidths] = useState({
    editor: 50,
    preview: 50,
  });
  const isResizingHeight = useRef(false);
  const isResizingWidth = useRef(false);
  const startY = useRef(0);
  const startX = useRef(0);
  const startHeight = useRef(0);
  const startWidth = useRef(0);
  const containerRef = useRef(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [terminal, setTerminal] = useState(null);

  axios.defaults.withCredentials = true;

  useEffect(() => {
    const lastReload = localStorage.getItem("lastReload");
    const currentTime = Date.now();

    if (!lastReload) {
      localStorage.setItem("lastReload", currentTime);
    } else if (currentTime - lastReload > 5000) {
      // 5 seconds threshold
      localStorage.setItem("lastReload", currentTime);
      window.location.reload();
    }
  }, []);

  useEffect(() => {
    if (!code || !webContainerRef.current) return;
  
    const watchForChanges = async () => {
      try {
        // Set up a simple polling mechanism to check for code changes
        const checkInterval = setInterval(async () => {
          const currentCode = localStorage.getItem("code");
          if (currentCode && currentCode !== JSON.stringify(code)) {
            console.log("Code changes detected, triggering rebuild...");
            await handleReRun();
          }
        }, 5000); // Check every 5 seconds
  
        return () => clearInterval(checkInterval);
      } catch (error) {
        console.error("Error setting up file watcher:", error);
      }
    };
  
    const cleanup = watchForChanges();
    return cleanup;
  }, [code]);

  const indexHtml = {
    "index.html": {
      file: {
        contents: `<!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <link rel="icon" type="image/svg+xml" href="/vite.svg" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Vite + React</title>
          </head>
          <body>
            <div id="root"></div>
            <script type="module" src="/src/main.jsx"></script>
          </body>
        </html>
        `,
      },
    },
    "vite.config.js": {
      file: {
        contents: `
        import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    headers: {
      // Allow cross-origin requests for development
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },build: {
    // Ensure assets are served with correct headers in production
    assetsInlineLimit: 0, // Disable inlining assets to avoid issues
  },
  resolve: {
    alias: {
      components: path.resolve(__dirname, './src/components'),
      pages: path.resolve(__dirname, './src/pages'),
    },
  },
});

        
`,
      },
    },
    "tailwind.config.js": {
      file: {
        contents: `/** @type {import('tailwindcss').Config} */
        export default {
          content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
          theme: {
            extend: {},
          },
          plugins: [],
        };
        `,
      },
    },
    "postcss.config.cjs": {
      file: {
        contents: `
        module.exports = {
          plugins: {
            tailwindcss: {},
            autoprefixer: {},
          },
        };
        
        
        `,
      },
    },
    "eslintrc.js": {
      file: {
        contents: `module.exports = {
          extends: ["eslint:recommended", "plugin:import/errors", "plugin:import/warnings"],
          plugins: ["import"],
          rules: {
            "import/no-unresolved": "error", // ❌ Error when an import is missing or incorrect
            "import/no-extraneous-dependencies": "error" // ❌ Error when an import is missing from package.json
          },
          settings: {
            "import/resolver": {
              node: {
                extensions: [".js", ".jsx", ".ts", ".tsx"],
                moduleDirectory: ["node_modules", "src"]
              }
            }
          }
        };
        
        `,
      },
    },
    "eslint.config.js": {
      file: {
        contents: `
        import js from '@eslint/js'
        import globals from 'globals'
        import react from 'eslint-plugin-react'
        import reactHooks from 'eslint-plugin-react-hooks'
        import reactRefresh from 'eslint-plugin-react-refresh'

        export default [
          { ignores: ['dist'] },
          {
            files: ['**/*.{js,jsx}'],
            languageOptions: {
              ecmaVersion: 2020,
              globals: globals.browser,
              parserOptions: {
                ecmaVersion: 'latest',
                ecmaFeatures: { jsx: true },
                sourceType: 'module',
              },
            },
            settings: { react: { version: '18.3' } },
            plugins: {
              react,
              'react-hooks': reactHooks,
              'react-refresh': reactRefresh,
            },
            rules: {
              ...js.configs.recommended.rules,
              ...react.configs.recommended.rules,
              ...react.configs['jsx-runtime'].rules,
              ...reactHooks.configs.recommended.rules,
              'react/jsx-no-target-blank': 'off',
              'react-refresh/only-export-components': [
                'warn',
                { allowConstantExport: true },
              ],
            },
          },
        ]
`,
      },
    },
  };

  async function runViteBuild(webContainer) {
    try {
      const process = await webContainer.spawn("npx", [
        "vite",
        "build",
        "--emptyOutDir",
      ]);
  
      let rawOutput = "";
      let errorLog = "";
  
      process.output.pipeTo(
        new WritableStream({
          write: (data) => {
            rawOutput += data;
            const terminal = terminalRef.current;
            if (terminal) {
              terminal.write(data);
            }
          },
        })
      );
  
      await process.exit;
  
      if (rawOutput.includes("error") || rawOutput.includes("failed")) {
        errorLog = rawOutput;
        console.error("Vite Build Errors:\n", errorLog);
        
        // Automatically trigger error correction
        setErrors("Build failed - attempting auto-correction...");
        await fetchCodeForErrorCorrection(errorLog);
        throw new Error("Build failed");
      }
    } catch (e) {
      console.error("Error running Vite build:", e);
      throw e;
    }
  }

  async function runEslint(webContainer) {
    try {
      const process = await webContainer.spawn("npx", [
        "eslint",
        "--format",
        "json",
        "src/",
      ]);
  
      let rawOutput = "";
      let errorLog = "";
  
      process.output.pipeTo(
        new WritableStream({
          write: (data) => {
            rawOutput += data;
            const terminal = terminalRef.current;
            if (terminal) {
              terminal.write(data);
            }
          },
        })
      );
  
      await process.exit;
  
      if (rawOutput.trim()) {
        try {
          const eslintErrors = JSON.parse(rawOutput);
          eslintErrors.forEach((file) => {
            file.messages.forEach((msg) => {
              if (msg.ruleId !== "") {
                errorLog += `File: ${file.filePath}\nError: ${msg.message}\n\n`;
              }
            });
          });
  
          if (errorLog) {
            console.log("ESLint Errors:\n", errorLog);
            
            // Automatically trigger error correction
            setErrors("ESLint errors found - attempting auto-correction...");
            await fetchCodeForErrorCorrection(errorLog);
          }
        } catch (parseError) {
          console.error("Error parsing ESLint output:", parseError);
        }
      }
    } catch (e) {
      console.error("Error running ESLint:", e);
      throw e;
    }
  }

  const executeCommand = (inputWriter, terminal, command, delay) => {
    return new Promise((resolve) => {
      if (!command) return resolve();
      setTimeout(() => {
        terminal.writeln(`Executing: ${command}`);
        inputWriter.write(`${command}\n`);
        resolve();
      }, delay);
    });
  };

  const checkDependenciesInstalled = async (inputWriter, terminal) => {
    return new Promise((resolve) => {
      terminal.writeln("Checking for dependency installation...");
      inputWriter.write(`npm install\n`);

      setTimeout(() => {
        terminal.writeln("Dependencies installed.");
        inputWriter.write(`npx vite\n`);
        resolve();
      }, 10000); // Allow time for installation
    });
  };

  const fetchCodeandRun = async () => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const data = localStorage.getItem("code");

      if (data) {
        const parsedData = await JSON.parse(data);

        console.log("Fetched and parsed code structure:", parsedData);

        const mergedCode = {
          ...indexHtml,
          ...parsedData,
          src: parsedData.src || {
            "main.jsx": {
              file: {
                contents: `import React from 'react';
  import ReactDOM from 'react-dom';

  function App() {
    return <h1>Hello, World!</h1>;
  }

  ReactDOM.render(<App />, document.getElementById('root'));
  `,
              },
            },
          },
        };

        setCode(mergedCode);
        console.log("Code updated successfully.");
      } else {
        throw new Error("No data received");
      }
    } catch (error) {
      setErrors("Server is Busy, please try again");
      await fetchCodeForErrorCorrection(error.message);
      console.log(error.message);
      console.log("Error detected on parsed data, retrying...");
    }
  };

  const fetchCodeForErrorCorrection = async (errorCode = "") => {
    try {
      const codeResponse = localStorage.getItem("code");
      const dependencies = localStorage.getItem("dependencies");
  
      if (!codeResponse) {
        console.log("No code found in localStorage");
        return;
      }
  
      console.log("Getting error-free code...");
  
      if (errorCode) {
        const errorFreeCode = await axios.post(
          // "http://localhost:3000/api/errorcorrection",
          "https://pixelprompt-fj7j.onrender.com/api/errorcorrection",
          {
            code: codeResponse,
            error: errorCode,
            dependencies: dependencies,
          }
        );
  
        const data = errorFreeCode?.data?.cleancode;
  
        if (data) {
          console.log("Setting error-free code in localStorage");
          localStorage.setItem("code", JSON.stringify(data));
  
          // Parse the corrected code
          const parsedFixedCode = JSON.parse(JSON.stringify(data));
          
          const mergedCode = {
            ...indexHtml,
            ...parsedFixedCode,
            src: parsedFixedCode.src || JSON.parse(codeResponse).src,
          };
  
          // Update the state and remount
          setCode(mergedCode);
          await webContainerRef.current.mount(mergedCode);
          
          // Restart the server after mounting new code
          if (inputWriterRef.current) {
            const inputWriter = inputWriterRef.current;
            inputWriter.write('\x03'); // Stop current process
            await new Promise(resolve => setTimeout(resolve, 1000));
            inputWriter.write('npx vite\n'); // Restart server
          }
          
          // Run checks
          await Promise.all([
            runEslint(webContainerRef.current),
            runViteBuild(webContainerRef.current)
          ]);
        }
      }
    } catch (error) {
      console.log("Error in fetchCodeForErrorCorrection:", error.message);
      // Retry once more if it fails
      if (errorCode) {
        setTimeout(() => fetchCodeForErrorCorrection(errorCode), 3000);
      }
    }
  };
  

  // Fetch code on initial render
  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchCodeandRun();
      } catch (error) {
        console.error("Error in fetchCodeandRun:", error);
      }
    };

    fetchData();
  }, []); 

  const fetchCommandAndRun = async (inputWriter, terminal) => {
    try {
      const dependencies = localStorage.getItem("dependencies");
      
      // Add retry logic for network requests
      const maxRetries = 3;
      let retryCount = 0;
      let response;

      while (retryCount < maxRetries) {
        try {
          response = await axios.get(
            // "http://localhost:3000/api/get-command",
            "https://pixelprompt-fj7j.onrender.com/api/get-command",
            { 
              dependencies,
              timeout: 10000, // 10 second timeout
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              }
            }
          );
          break; // If successful, break the retry loop
        } catch (error) {
          retryCount++;
          if (retryCount === maxRetries) {
            throw error; // If all retries failed, throw the error
          }
          terminal.writeln(`Retrying command fetch (attempt ${retryCount}/${maxRetries})...`);
          await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds before retry
        }
      }

      const {
        command,
        secondCommand,
        thirdCommand,
        fourthCommand,
        fifthCommand,
      } = response.data;

      if (command) {
        terminal.writeln(`Executing: ${command}`);
        await executeCommand(inputWriter, terminal, command, 2000);
      } else {
        terminal.writeln("No command received from backend.");
      }

      if (dependencies) {
        terminal.writeln(`Installing dependencies: ${dependencies}`);
        await executeCommand(
          inputWriter,
          terminal,
          `npm i ${dependencies}`,
          5000
        );
      } else {
        terminal.writeln("No dependencies found.");
      }

      // Sequential Execution with proper delays
      if (secondCommand)
        await executeCommand(inputWriter, terminal, secondCommand, 3000);
      if (thirdCommand)
        await executeCommand(inputWriter, terminal, thirdCommand, 3000);
      if (fourthCommand)
        await executeCommand(inputWriter, terminal, fourthCommand, 4000);
      if (fifthCommand)
        await executeCommand(inputWriter, terminal, fifthCommand, 4000);

      // Ensure dependencies are installed before running ESLint
      await checkDependenciesInstalled(inputWriter, terminal);

      terminal.writeln("Running ESLint...");
      runEslint(webContainerRef.current);

      terminal.writeln("Running ViteBuilder...");
      runViteBuild(webContainerRef.current);
    } catch (error) {
      console.error("Error in fetchCommandAndRun:", error);
      terminal.writeln(`Error: ${error.message}`);
      
      if (error.code === 'ECONNABORTED') {
        terminal.writeln("Request timed out. Please check if the backend server is running.");
      } else if (error.code === 'ERR_NETWORK') {
        terminal.writeln("Network error. Please check if the backend server is running at http://localhost:3000");
      } else {
        terminal.writeln("An error occurred while fetching commands. Please try again.");
      }
      
      // Try to continue with basic setup even if command fetch fails
      terminal.writeln("Attempting to continue with basic setup...");
      await checkDependenciesInstalled(inputWriter, terminal);
    }
  };

  // Initialize WebContainer with proper headers
  useEffect(() => {
    const initializeWebContainer = async () => {
      // Prevent multiple initialization attempts
      if (initializationAttempted.current) return;
      initializationAttempted.current = true;

      try {
        if (!webContainerRef.current) {
          const webContainer = await WebContainer.boot();
          webContainerRef.current = webContainer;
          setIsInitialized(true);
        }
      } catch (error) {
        console.error("Failed to initialize WebContainer:", error);
        setErrors("Failed to initialize environment. Please refresh the page or try a different browser .");
        // Reset the initialization attempt flag on error
        initializationAttempted.current = false;
      }
    };

    initializeWebContainer();

    // Cleanup function
    return () => {
      if (webContainerRef.current) {
        webContainerRef.current = null;
        setIsInitialized(false);
        initializationAttempted.current = false;
      }
    };
  }, []);

  // Initialize WebContainer only when code is available and WebContainer is initialized
  useEffect(() => {
    const boot = async () => {
      if (!code || !isInitialized || !webContainerRef.current) return;

      const newTerminal = new Terminal({ convertEol: true, cursorBlink: true });
      newTerminal.open(terminalRef.current);
      newTerminal.writeln("Welcome to WebContainer Terminal!");
      setTerminal(newTerminal);

      try {
        await webContainerRef.current.mount(code);

        const shellProcess = await webContainerRef.current.spawn("jsh", {
          terminal: { cols: newTerminal.cols, rows: newTerminal.rows },
        });

        shellProcess.output.pipeTo(
          new WritableStream({
            write(data) {
              newTerminal.write(data);
            },
          })
        );

        const inputWriter = shellProcess.input.getWriter();
        inputWriterRef.current = inputWriter;

        newTerminal.onData((data) => {
          inputWriter.write(data);
        });

        await fetchCommandAndRun(inputWriter, newTerminal);

        webContainerRef.current.on("server-ready", (port, url) => {
          const serverUrl = `http://${url}:${port}`;
          setSource(url);
          newTerminal.writeln(`Server running at ${serverUrl}`);
        });
      } catch (error) {
        console.error("Error during WebContainer boot:", error);
        setErrors("Failed to start environment. Please refresh the page or try a different browser.");
      }
    };

    boot();
  }, [code, isInitialized]);

  // Function to handle manual re-run
  const handleReRun = async () => {
    if (!webContainerRef.current || !inputWriterRef.current) return;
    
    setIsBuilding(true);
    setErrors("");
    
    try {
      const terminal = terminalRef.current;
      if (terminal) {
        terminal.clear();
        terminal.writeln("Rebuilding project...");
        
        // Use existing input writer instead of creating new shell process
        const inputWriter = inputWriterRef.current;
        
        // Stop current dev server
        inputWriter.write('\x03'); // Ctrl+C to stop current process
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Restart the development server
        inputWriter.write('npx vite\n');
        
        // Run ESLint and Vite build in parallel
        await Promise.all([
          runEslint(webContainerRef.current),
          runViteBuild(webContainerRef.current)
        ]);
        
        terminal.writeln("Project rebuilt successfully!");
      }
      
      setIsBuilding(false);
    } catch (error) {
      console.error("Error during rebuild:", error);
      setErrors("Failed to rebuild project. Please check the terminal for errors. \n Trying to fix the error...");
      setIsBuilding(false);
      
      // Trigger automatic error correction
      await fetchCodeForErrorCorrection(error.message);
    }
  };

  // Add this helper function at the top of your component
  const formatPreviewUrl = (url) => {
    if (!url) return '';
    return url.startsWith('http') ? url : `http://${url}`;
  };

  const handleHeightMouseDown = (e) => {
    e.preventDefault();
    isResizingHeight.current = true;
    startY.current = e.clientY;
    startHeight.current = panelHeights.preview;
    document.body.style.cursor = 'row-resize';
    document.body.style.userSelect = 'none';
  };

  const handleWidthMouseDown = (e) => {
    e.preventDefault();
    isResizingWidth.current = true;
    startX.current = e.clientX;
    startWidth.current = panelWidths.editor;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;

    if (isResizingHeight.current) {
      const containerHeight = containerRef.current.offsetHeight;
      const deltaY = e.clientY - startY.current;
      const deltaPercentage = (deltaY / containerHeight) * 100;
      const newPreviewHeight = Math.max(30, Math.min(70, startHeight.current + deltaPercentage));
      setPanelHeights({
        preview: newPreviewHeight,
        terminal: 100 - newPreviewHeight,
      });
    }
    
    if (isResizingWidth.current) {
      const containerWidth = containerRef.current.offsetWidth;
      const deltaX = e.clientX - startX.current;
      const deltaPercentage = (deltaX / containerWidth) * 100;
      const newEditorWidth = Math.max(30, Math.min(70, startWidth.current + deltaPercentage));
      setPanelWidths({
        editor: newEditorWidth,
        preview: 100 - newEditorWidth,
      });
    }
  };

  const handleMouseUp = () => {
    isResizingHeight.current = false;
    isResizingWidth.current = false;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  };

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className="flex flex-col lg:flex-row w-full h-screen bg-gradient-to-br from-gray-950 via-slate-900 to-gray-950 text-white overflow-hidden"
    >
      {!isFullScreen ? (
        <>
          {/* Left Panel - Code Editor */}
          <div 
            className="flex flex-col h-full border-r border-gray-800/50"
            style={{ width: `${panelWidths.editor}%` }}
          >
            {/* File Explorer Header */}
            <div className="flex justify-between items-center p-3 bg-gray-900/50 backdrop-blur-sm border-b border-gray-800/50">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate('/sketchtool')}
                  className="p-1 rounded hover:bg-gray-800/50 transition-colors"
                  title="Back to Canvas"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                  </svg>
                </button>
                <button
                  onClick={() => setFileTreeVisible(!fileTreeVisible)}
                  className="p-1 rounded hover:bg-gray-800/50 transition-colors"
                  title={fileTreeVisible ? "Hide File Tree" : "Show File Tree"}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6C3 4.34315 4.34315 3 6 3H8.7375C9.09169 3 9.43073 3.1405 9.675 3.38604L12.3 6.01104C12.5443 6.25531 12.8833 6.39583 13.2375 6.39583H18C19.6569 6.39583 21 7.73893 21 9.39583V18C21 19.6569 19.6569 21 18 21H6C4.34315 21 3 19.6569 3 18V6Z" />
                    <path d="M7.5 3V6.39583C7.5 6.92426 7.72487 7.43097 8.11803 7.82413L10.675 10.3811C11.0682 10.7743 11.5749 10.9992 12.1033 10.9992H21" />
                  </svg>
                </button>
                <h2 className="text-lg font-semibold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">PROJECT FILES</h2>
              </div>
              <button
                onClick={handleReRun}
                disabled={isBuilding}
                className="px-3 py-1 bg-gray-800/50 hover:bg-gray-700/50 rounded-md text-sm flex items-center gap-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isBuilding ? (
                  <>
                    <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
                    <span>Building...</span>
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                      <path d="M3 3v5h5"></path>
                      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"></path>
                      <path d="M16 21h5v-5"></path>
                    </svg>
                    <span>Rebuild</span>
                  </>
                )}
              </button>
            </div>
            
            {/* Editor Content */}
            <div className="flex-1 overflow-hidden">
              <ExecutionPage 
                ref={editor} 
                codex={code ? code : indexHtml} 
                fileTreeVisible={fileTreeVisible}
              />
            </div>
          </div>

          {/* Resizer for width */}
          <div
            className="w-1 cursor-col-resize hover:bg-[#4cafff] transition-colors"
            onMouseDown={handleWidthMouseDown}
          />

          {/* Right Panel - Preview and Terminal */}
          <div 
            className="flex flex-col h-full bg-[#0a0a0d]"
            style={{ width: `${panelWidths.preview}%` }}
          >
            {/* Preview Section */}
            <div 
              className="flex flex-col bg-[#1a1a20]"
              style={{ height: `${panelHeights.preview}%` }}
            >
              {/* Preview Header */}
              <div className="flex justify-between items-center p-3 bg-gray-900/50 backdrop-blur-sm border-b border-gray-800/50">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 3H4C3.44772 3 3 3.44772 3 4V12C3 12.5523 3.44772 13 4 13H12C12.5523 13 13 12.5523 13 12V4C13 3.44772 12.5523 3 12 3Z" stroke="#4cafff" strokeWidth="1.5"/>
                    <path d="M20 11H16C15.4477 11 15 11.4477 15 12V20C15 20.5523 15.4477 21 16 21H20C20.5523 21 21 20.5523 21 20V12C21 11.4477 20.5523 11 20 11Z" stroke="#e33cef" strokeWidth="1.5"/>
                  </svg>
                  <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">LIVE PREVIEW</span>
                </h2>
                {source && (
                  <button
                    onClick={() => setIsFullScreen(true)}
                    className="px-3 py-1 bg-gray-800/50 hover:bg-gray-700/50 rounded-md text-sm flex items-center gap-1 transition-colors"
                  >
                    <span>Full Screen</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
                    </svg>
                  </button>
                )}
              </div>
              
              {/* Preview Content */}
              <div className="flex-1 p-2 overflow-hidden bg-gray-900/50 backdrop-blur-sm">
                {!source ? (
                  <div className="w-full h-full flex flex-col justify-center items-center gap-6">
                    <div className="relative">
                      <div className="w-16 h-16 border-4 border-emerald-400 border-t-cyan-400 rounded-full animate-spin"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-full"></div>
                      </div>
                    </div>
                    <p className="text-center text-lg text-gray-300 max-w-md px-4">
                      {errors || "Setting up environment—installing dependencies. Please wait..."}
                    </p>
                  </div>
                ) : (
                  <iframe
                    src={formatPreviewUrl(source)}
                    title="Preview"
                    className="w-full h-full rounded-lg bg-white shadow-lg"
                    sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                  />
                )}
              </div>
            </div>

            {/* Resizer for height */}
            <div
              className="h-1 cursor-row-resize hover:bg-[#4cafff] transition-colors"
              onMouseDown={handleHeightMouseDown}
            />
            
            {/* Terminal Section */}
            <div 
              className="flex flex-col bg-gray-900/50 backdrop-blur-sm"
              style={{ height: `${panelHeights.terminal}%` }}
            >
              <div className="flex items-center p-2 bg-gray-900/50 backdrop-blur-sm border-b border-gray-800/50">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="4 17 10 11 4 5"></polyline>
                    <line x1="12" y1="19" x2="20" y2="19"></line>
                  </svg>
                  <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">TERMINAL OUTPUT</span>
                </h3>
              </div>
              <div 
                ref={terminalRef}
                className="flex-1 p-3 overflow-y-auto font-mono text-sm bg-gray-950/50"
              />
            </div>
          </div>
        </>
      ) : (
        <div className="w-full h-full flex flex-col bg-gray-900/50 backdrop-blur-sm">
          {/* Full Screen Preview Header */}
          <div className="flex justify-between items-center p-3 bg-gray-900/50 backdrop-blur-sm border-b border-gray-800/50">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 3H4C3.44772 3 3 3.44772 3 4V12C3 12.5523 3.44772 13 4 13H12C12.5523 13 13 12.5523 13 12V4C13 3.44772 12.5523 3 12 3Z" stroke="#4cafff" strokeWidth="1.5"/>
                <path d="M20 11H16C15.4477 11 15 11.4477 15 12V20C15 20.5523 15.4477 21 16 21H20C20.5523 21 21 20.5523 21 20V12C21 11.4477 20.5523 11 20 11Z" stroke="#e33cef" strokeWidth="1.5"/>
              </svg>
              <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">FULL SCREEN PREVIEW</span>
            </h2>
            <button
              onClick={() => setIsFullScreen(false)}
              className="px-3 py-1 bg-gray-800/50 hover:bg-gray-700/50 rounded-md text-sm flex items-center gap-1 transition-colors"
            >
              <span>Exit Full Screen</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"></path>
              </svg>
            </button>
          </div>
          
          {/* Full Screen Preview Content */}
          <div className="flex-1 p-2 overflow-hidden bg-[#1a1a20]">
            {source && (
              <iframe
                src={formatPreviewUrl(source)}
                title="Full Screen Preview"
                className="w-full h-full rounded-lg bg-white shadow-lg"
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default WebsiteGenerator;
