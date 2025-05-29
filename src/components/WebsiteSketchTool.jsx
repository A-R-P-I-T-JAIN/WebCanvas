import React, { useState, useRef, useEffect, useCallback } from "react";
import { Excalidraw, exportToBlob, MainMenu, useDevice, Footer, convertToExcalidrawElements, WelcomeScreen } from "@excalidraw/excalidraw";
import PropTypes from "prop-types";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { nanoid } from "nanoid";
import axios from "axios";
import logo from "../assets/logo.png";

const WebsiteSketchTool = () => {
  const navigate = useNavigate();
  const [canvases, setCanvases] = useState([]);
  const [activeCanvasId, setActiveCanvasId] = useState(null);
  const [newPageName, setNewPageName] = useState("");
  const excalidrawRefs = useRef({});
  const [isLoading, setIsLoading] = useState(false);
  const [backendResponse, setBackendResponse] = useState("");
  const lastUpdateRef = useRef({});
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [userPrompt, setUserPrompt] = useState("");
  const [usersData, setUsersData] = useState({});
  const [readyRefs, setReadyRefs] = useState({});
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showBraveWarning, setShowBraveWarning] = useState(false);
  const id = nanoid(10);
  const { isMobile } = useDevice();
  const [excalidrawApi, setExcalidrawApi] = useState(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const loadingMessages = [
    "Analyzing your sketches...",
    "Detecting dependencies...",
    "Generating responsive code...",
    "Optimizing performance...",
    "Adding final touches...",
    "Almost there..."
  ];

  // Check for Brave browser
  useEffect(() => {
    const isBrave = navigator.userAgent.includes("Brave") || 
                   (navigator.userAgent.includes("Chrome") && navigator.brave !== undefined);
    setShowBraveWarning(isBrave);
  }, []);

  // Initialize with one canvas
  useEffect(() => {
    if (canvases.length === 0) {
      addNewCanvas("Home");
    }
  }, []);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      localStorage.setItem("userId", id);
    }
  }, []);

  useEffect(() => {
    const localData = localStorage.getItem("code");
    const localDependencies = localStorage.getItem("dependencies");

    if ((localData || localDependencies) && usersData) {
      localStorage.removeItem("code");
      localStorage.removeItem("dependencies");
      localStorage.setItem("code", usersData.code);
      localStorage.setItem("dependencies", usersData.dependencies);
    } else if (!localData && !localDependencies && usersData) {
      localStorage.setItem("code", usersData.code);
      localStorage.setItem("dependencies", usersData.dependencies);
    } else if (localData && localDependencies && !usersData) {
      setUsersData({
        code: localData,
        dependencies: localDependencies,
      });
    }
  }, [usersData]);

  useEffect(() => {
    let messageIndex = 0;
    let interval;

    if (isLoading) {
      setLoadingMessage(loadingMessages[0]);
      interval = setInterval(() => {
        messageIndex = (messageIndex + 1) % loadingMessages.length;
        if (messageIndex === loadingMessages.length - 1) {
          clearInterval(interval);
        } else {
          setLoadingMessage(loadingMessages[messageIndex]);
        }
      }, 3000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isLoading]);

  const addNewCanvas = useCallback(
    (name) => {
      const newCanvasId = `canvas-${Date.now()}`;
      const newCanvas = {
        id: newCanvasId,
        name: name || `Page ${canvases.length + 1}`,
        elements: [],
        appState: { viewBackgroundColor: "#ffffff" },
        files: {},
      };

      setCanvases((prevCanvases) => [...prevCanvases, newCanvas]);
      setActiveCanvasId(newCanvasId);
      setNewPageName("");
    },
    [canvases.length]
  );

  const setExcalidrawRef = useCallback((api, canvasId) => {
    if (api && canvasId) {
      excalidrawRefs.current[canvasId] = api;
      setReadyRefs((prev) => ({ ...prev, [canvasId]: true }));
    }
  }, []);

  const handleCanvasChange = useCallback(
    (elements, appState, files, canvasId) => {
      const now = Date.now();
      if (
        lastUpdateRef.current[canvasId] &&
        now - lastUpdateRef.current[canvasId] < 100
      ) {
        return;
      }
      lastUpdateRef.current[canvasId] = now;

      if (!readyRefs[canvasId]) {
        setReadyRefs((prev) => ({ ...prev, [canvasId]: true }));
      }

      setCanvases((prevCanvases) => {
        const canvas = prevCanvases.find((c) => c.id === canvasId);
        if (!canvas) return prevCanvases;

        const hasChanged =
          JSON.stringify(canvas.elements) !== JSON.stringify(elements) ||
          JSON.stringify(canvas.appState) !== JSON.stringify(appState) ||
          JSON.stringify(canvas.files) !== JSON.stringify(files);

        if (!hasChanged) return prevCanvases;

        return prevCanvases.map((canvas) =>
          canvas.id === canvasId
            ? { ...canvas, elements, appState, files }
            : canvas
        );
      });
    },
    [readyRefs]
  );

  const removeCanvas = useCallback(
    (id) => {
      if (canvases.length <= 1) return;

      delete excalidrawRefs.current[id];
      setReadyRefs((prev) => {
        const newRefs = { ...prev };
        delete newRefs[id];
        return newRefs;
      });

      setCanvases((prevCanvases) => {
        const newCanvases = prevCanvases.filter((canvas) => canvas.id !== id);
        if (activeCanvasId === id) {
          setActiveCanvasId(newCanvases[0].id);
        }
        return newCanvases;
      });
    },
    [canvases.length, activeCanvasId]
  );

  const generateWebsite = useCallback(async () => {
    setShowPromptModal(true);
  }, []);

  const sortCanvasesForGeneration = (canvases) => {
    const pageOrder = [
      "home",
      "about",
      "services",
      "products",
      "portfolio",
      "gallery",
      "blog",
      "news",
      "contact",
    ];

    return [...canvases].sort((a, b) => {
      const aName = a.name.toLowerCase();
      const bName = b.name.toLowerCase();

      const aIndex = pageOrder.findIndex((page) => aName.includes(page));
      const bIndex = pageOrder.findIndex((page) => bName.includes(page));

      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
      return 0;
    });
  };

  const areCanvasesReadyForExport = useCallback(() => {
    return canvases.every(
      (canvas) => readyRefs[canvas.id] || canvas.elements.length > 0
    );
  }, [canvases, readyRefs]);

  const handleGenerateWithPrompt = async () => {
    setIsLoading(true);
    setBackendResponse("");
    setShowPromptModal(false);

    try {
      const sortedCanvases = sortCanvasesForGeneration(canvases);

      const canvasImages = await Promise.all(
        sortedCanvases.map(async (canvas, index) => {
          try {
            let excalidrawAPI = excalidrawRefs.current[canvas.id];

            if (!excalidrawAPI) {
              if (!canvas.elements || canvas.elements.length === 0) {
                console.warn(
                  `Canvas ${canvas.name} has no elements, skipping...`
                );
                return null;
              }

              const blob = await exportToBlob({
                elements: canvas.elements,
                appState: canvas.appState || { viewBackgroundColor: "#ffffff" },
                files: canvas.files || {},
                mimeType: "image/png",
                quality: 0.8,
              });

              return {
                pageName: canvas.name,
                image: blob,
                order: index,
              };
            }

            const elements = excalidrawAPI.getSceneElements();
            const appState = excalidrawAPI.getAppState();
            const files = excalidrawAPI.getFiles();

            if (elements.length === 0) {
              console.warn(
                `Canvas ${canvas.name} has no elements, skipping...`
              );
              return null;
            }

            const blob = await exportToBlob({
              elements,
              appState: {
                ...appState,
                exportBackground: true,
                exportWithDarkMode: false,
              },
              files,
              mimeType: "image/png",
              quality: 0.8,
            });

            return {
              pageName: canvas.name,
              image: blob,
              order: index,
            };
          } catch (error) {
            console.error("Error exporting canvas:", canvas.id, error);
            return null;
          }
        })
      );

      const validImages = canvasImages.filter(Boolean);

      if (validImages.length === 0) {
        toast.error(
          "No valid sketches found. Please draw something on at least one canvas."
        );
        setIsLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append(
        "userPrompt",
        userPrompt ||
          ""
      );
      formData.append("userId", localStorage.getItem("userId"));

      const pageNames = validImages.map((item) => item.pageName).join(",");
      formData.append("pageNames", pageNames);

      validImages.forEach((item, index) => {
        formData.append(
          "images",
          item.image,
          `${item.pageName}-page-${item.order}.png`
        );
      });

      const response = await axios.post(
        // "http://localhost:3000/api/get-user-prompt",
        "https://pixelprompt-fj7j.onrender.com/api/get-user-prompt",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          timeout: 120000,
        }
      );

      setUsersData(response.data);
      toast.success(
        `Successfully generated website with ${response.data.processedImages} pages!`
      );
      navigate("/websitegenerator");
    } catch (error) {
      console.error("Error generating website:", error);

      if (error.code === "ECONNABORTED") {
        toast.error(
          "Request timed out. The multi-page generation might take longer. Please try again."
        );
      } else if (error.response?.status === 413) {
        toast.error(
          "Images too large. Please try with smaller sketches or fewer pages."
        );
      } else if (error.response?.status === 400) {
        toast.error(
          "Invalid request. Please check your sketches and try again."
        );
      } else {
        toast.error("Error generating website. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInsertDrawing = (element) => {
    try {
      if (excalidrawApi) {
        excalidrawApi.updateScene({
          elements: [...excalidrawApi.getSceneElements(), ...element],
        });
        console.log("Drawing Inserted");
      } else {
        throw new Error("Excalidraw API not available to insert drawing.");
      }
    } catch (error) {
      console.error(error.message);
      toast.error("Error inserting drawing. Please try again later.");
    }
  };

  const handleGenerate = async () => {
    setLoading(true); // Set loading to true
    try {
      const response = await fetch(
        // "http://localhost:3000/generate",
        "https://pixelprompt-fj7j.onrender.com/generate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to generate drawing");
      }

      const result = await response.text();
      const newResult = result.replace(/```json|```|```excalidraw/g, "");
      // console.log(newResult);

      let parsedElements = JSON.parse(newResult);

      // Filter out unsupported element types (e.g., "star")
      parsedElements = parsedElements.filter((el) => {
        const supportedTypes = ["rectangle", "ellipse", "text", "line"]; // Add supported types here
        if (!supportedTypes.includes(el.type)) {
          console.warn(`Unhandled element type "${el.type}" skipped`);
          toast.warn(`Unsupported element type "${el.type}" skipped`);
          return false;
        }
        return true;
      });

      // Ensure all elements have required properties (e.g., width, height)
      parsedElements = parsedElements.filter(
        (el) => el && el.width !== undefined && el.height !== undefined
      );

      if (parsedElements.length === 0) {
        throw new Error("No valid elements generated");
      }

      const element = convertToExcalidrawElements(parsedElements);
      handleInsertDrawing(element);
    } catch (error) {
      console.error("Error generating element:", error);
      toast.error("Error generating drawing. Please try again.");
    } finally {
      setLoading(false); // Set loading to false
    }
  };

  return (
    <div className="website-sketch-tool min-h-screen bg-gradient-to-br from-gray-950 via-slate-900 to-gray-950 text-white">
      {/* Brave Browser Warning Modal */}
      {showBraveWarning && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[200]">
          <div className="bg-[#1a1a20] rounded-xl p-8 max-w-2xl mx-4 border border-[#3a3a42] shadow-2xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-400">
                  <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-red-400">Browser Compatibility Issue</h3>
            </div>
            <p className="text-gray-300 mb-6">
              We've detected that you're using Brave browser. Due to security restrictions in Brave, some features of our website may not work correctly. We recommend using one of the following browsers for the best experience:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <a href="https://www.google.com/chrome/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 bg-[#2a2a32] rounded-lg border border-[#3a3a42] hover:border-emerald-400/50 transition-colors">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                </svg>
                <span>Google Chrome</span>
              </a>
              <a href="https://www.mozilla.org/firefox/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 bg-[#2a2a32] rounded-lg border border-[#3a3a42] hover:border-emerald-400/50 transition-colors">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                </svg>
                <span>Mozilla Firefox</span>
              </a>
              <a href="https://www.microsoft.com/edge" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 bg-[#2a2a32] rounded-lg border border-[#3a3a42] hover:border-emerald-400/50 transition-colors">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                </svg>
                <span>Microsoft Edge</span>
              </a>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setShowBraveWarning(false)}
                className="px-6 py-2 bg-[#3a3a42] hover:bg-[#4a4a52] rounded-lg transition-colors"
              >
                Continue Anyway
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="tool-header p-6 bg-gray-900/50 backdrop-blur-sm border-b border-gray-800/50 shadow-lg">
        <div className="w-full mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="p-2 rounded-lg hover:bg-gray-800/50 transition-colors"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M3 12h18M3 6h18M3 18h18" />
              </svg>
            </button>
            <h2 onClick={() => navigate('/')} className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent cursor-pointer">
              PixelPrompt
            </h2>
          </div>
          <div className="page-controls flex flex-col md:flex-row gap-3 w-full md:w-auto">
            <div className="flex-1 relative group">
              <input
                type="text"
                value={newPageName}
                onChange={(e) => setNewPageName(e.target.value)}
                placeholder="New page name (e.g., About, Services, Contact)"
                className="w-full px-4 py-3 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 text-gray-100 placeholder-gray-400 transition-all duration-300 group-hover:border-emerald-400/50"
              />
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-emerald-400/10 to-cyan-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              {newPageName && (
                <button
                  onClick={() => setNewPageName("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-200 transition-colors"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M15 9l-6 6M9 9l6 6" />
                  </svg>
                </button>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => addNewCanvas(newPageName)}
                disabled={!newPageName.trim()}
                className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all duration-300 flex items-center gap-2 group relative overflow-hidden shadow-lg shadow-emerald-500/25"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative flex items-center gap-2">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="transition-transform duration-300 group-hover:scale-110"
                  >
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  <span className="font-medium">Add Page</span>
                </div>
              </button>
              <button
                onClick={generateWebsite}
                disabled={isLoading || canvases.length === 0}
                className={`px-6 py-3 rounded-lg transition-all duration-300 flex items-center gap-2 group relative overflow-hidden shadow-lg ${
                  isLoading
                    ? "bg-gray-800/50 cursor-wait"
                    : "bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 shadow-emerald-500/25"
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative flex items-center gap-2">
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span className="font-medium">
                        Generating {canvases.length} pages...
                      </span>
                    </>
                  ) : (
                    <>
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="transition-transform duration-300 group-hover:scale-110"
                      >
                        <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                        <path d="M3 3v5h5" />
                        <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                        <path d="M16 21h5v-5" />
                      </svg>
                      <span className="font-medium">Generate Website</span>
                    </>
                  )}
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="sketch-container flex h-[calc(100vh-120px)]">
        {/* Sidebar with toggle functionality */}
        <div
          className={`page-list bg-gray-900/50 backdrop-blur-sm border-r border-gray-800/50 overflow-y-auto transition-all duration-300 ease-in-out ${
            isSidebarCollapsed ? "w-0 opacity-0" : "w-64 md:w-72 opacity-100"
          }`}
        >
          <div className="page-list-header p-4 border-b border-gray-800/50 sticky top-0 bg-gray-900/50 backdrop-blur-sm z-10">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M3 6C3 4.34315 4.34315 3 6 3H8.7375C9.09169 3 9.43073 3.1405 9.675 3.38604L12.3 6.01104C12.5443 6.25531 12.8833 6.39583 13.2375 6.39583H18C19.6569 6.39583 21 7.73893 21 9.39583V18C21 19.6569 19.6569 21 18 21H6C4.34315 21 3 19.6569 3 18V6Z" />
              </svg>
              Pages ({canvases.length})
            </h3>
            <small className="text-gray-400 block mt-2">
              Pages will be ordered logically (Home → About → Services →
              Contact)
            </small>
          </div>
          {canvases.map((canvas, index) => (
            <div
              key={canvas.id}
              className={`page-item p-3 border-b border-gray-800/50 cursor-pointer transition-all duration-200 hover:bg-gray-800/50 ${
                activeCanvasId === canvas.id
                  ? "bg-gray-800/50 border-l-4 border-l-emerald-400"
                  : ""
              }`}
              onClick={() => setActiveCanvasId(canvas.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <span className="page-number w-6 h-6 flex items-center justify-center bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-full text-sm font-medium">
                      {index + 1}
                    </span>
                    {(readyRefs[canvas.id] || canvas.elements?.length > 0) && (
                      <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-gray-900"></span>
                    )}
                  </div>
                  <span className="page-name font-medium truncate max-w-[120px]">
                    {canvas.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="page-elements text-xs text-gray-400 bg-gray-800/50 px-2 py-1 rounded">
                    {canvas.elements?.length || 0} elements
                  </span>
                  {canvases.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeCanvas(canvas.id);
                      }}
                      className="delete-page p-1 hover:bg-gray-800/50 rounded transition-colors text-gray-400 hover:text-red-400"
                      title="Delete page"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="canvas-area flex-1 bg-gray-950 overflow-hidden relative">
          {canvases.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center p-8 max-w-md">
                <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center bg-gray-800/50 backdrop-blur-sm rounded-full">
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                    <path d="M3 3v5h5" />
                    <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                    <path d="M16 21h5v-5" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">
                  Start Sketching Your Website
                </h3>
                <p className="text-gray-400 mb-6">
                  Add your first page to begin designing your multi-page website
                </p>
                <button
                  onClick={() => addNewCanvas("Home")}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 rounded-lg transition-all shadow-lg shadow-emerald-500/25"
                >
                  Add First Page
                </button>
              </div>
            </div>
          )}

          {canvases.map((canvas) => (
            <div
              key={canvas.id}
              className={`excalidraw-wrapper h-full w-full absolute inset-0 transition-opacity duration-300 ${
                activeCanvasId === canvas.id
                  ? "opacity-100 z-10"
                  : "opacity-0 z-0 pointer-events-none"
              }`}
            >
              <Excalidraw
              excalidrawAPI={(api) => setExcalidrawApi(api)}
                initialData={{
                  elements: canvas.elements,
                  appState: {
                    ...canvas.appState,
                    theme: "dark",
                  },
                  files: canvas.files,
                }}
                onChange={(elements, appState, files) =>
                  handleCanvasChange(elements, appState, files, canvas.id)
                }
                onMount={(api) => setExcalidrawRef(api, canvas.id)}
                UIOptions={{
                  canvasActions: {
                    loadScene: false,
                    saveToActiveFile: false,
                    
                  },
                }}
                gridModeEnabled={true}
                theme="dark"
              >
                <MainMenu>
                  <MainMenu.DefaultItems.ClearCanvas />
                  <MainMenu.DefaultItems.SaveAsImage />
                  <MainMenu.DefaultItems.ChangeCanvasBackground />
                </MainMenu>
                {!isMobile && (
            <Footer>
              <div className="flex flex-col sm:flex-row justify-center items-center gap-4 px-4 w-full">
                <input
                  type="text"
                  className="h-10 w-full sm:w-2/3 md:w-1/2 lg:w-1/3 px-4 py-2 bg-white/5 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-teal-400 transition-all duration-300"
                  placeholder="ex. footer"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
                <button
                  className="group relative px-6 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-xl font-medium hover:from-teal-600 hover:to-cyan-600 transition-all duration-300 shadow-lg shadow-teal-500/25"
                  onClick={handleGenerate}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative">
                    {loading ? "Loading..." : "Generate with AI"}
                  </span>
                </button>
              </div>
            </Footer>
          )}
              </Excalidraw>
              <div className="canvas-name absolute bottom-6 left-6 bg-[#1a1a20] px-4 py-2 rounded-lg shadow-xl flex items-center gap-3 border border-[#3a3a42]">
                <span className="font-medium">{canvas.name}</span>
                <span className="text-xs text-gray-400 bg-[#2a2a32] px-2 py-1 rounded">
                  {canvas.elements?.length || 0} elements
                </span>
                {(readyRefs[canvas.id] || canvas.elements?.length > 0) && (
                  <span className="text-green-400 flex items-center gap-1 text-sm">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                    >
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                    Ready
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {showPromptModal && (
        <div className="modal-overlay fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="modal-content bg-[#1a1a20] rounded-xl p-6 w-full max-w-2xl shadow-2xl border border-[#3a3a42] animate-fade-in">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                Describe Your Website Vision
              </h3>
              <button
                onClick={() => setShowPromptModal(false)}
                className="p-1 text-gray-400 hover:text-gray-200 transition-colors"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M15 9l-6 6M9 9l6 6" />
                </svg>
              </button>
            </div>
            <p className="text-gray-300 mb-4">
              You're about to generate a website with {canvases.length} page(s).
              Please provide additional details:
            </p>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Website Description
              </label>
              <textarea
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                placeholder="Describe your website theme, purpose, and any specific requirements...
Example: Create a modern business website with professional styling, blue color scheme, and contact forms."
                rows={6}
                className="w-full px-4 py-3 bg-[#2a2a32] border border-[#3a3a42] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4cafff] text-gray-100 placeholder-gray-400 transition-all"
              />
            </div>

            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-400 mb-3">
                Pages to Generate ({canvases.length})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {canvases.map((canvas) => (
                  <div
                    key={canvas.id}
                    className="bg-[#2a2a32] p-3 rounded-lg border border-[#3a3a42] flex items-center justify-between"
                  >
                    <span>{canvas.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 bg-[#1a1a20] px-2 py-1 rounded">
                        {canvas.elements?.length || 0} elements
                      </span>
                      {readyRefs[canvas.id] || canvas.elements?.length > 0 ? (
                        <span className="text-green-400 text-xs flex items-center gap-1">
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                          >
                            <path d="M20 6L9 17l-5-5" />
                          </svg>
                          Ready
                        </span>
                      ) : (
                        <span className="text-yellow-400 text-xs">Pending</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowPromptModal(false)}
                className="px-6 py-2 bg-[#3a3a42] hover:bg-[#4a4a52] rounded-lg transition-colors flex items-center gap-2"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateWithPrompt}
                disabled={isLoading}
                className="px-6 py-2 bg-gradient-to-r from-emerald-400 to-cyan-400 hover:opacity-90 rounded-lg transition-all flex items-center gap-2 disabled:opacity-70"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                      <path d="M3 3v5h5" />
                      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                      <path d="M16 21h5v-5" />
                    </svg>
                    Generate Website
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Screen Loader */}
      {isLoading && (
        <div className="fixed inset-0 bg-gray-950/50 backdrop-blur-md flex items-center justify-center z-[100]">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center space-y-8">
            <div className="relative w-32 h-32 mx-auto">
              {/* Outer spinning ring */}
              <div className="absolute inset-0 border-4 border-emerald-400/20 border-t-emerald-400 rounded-full animate-spin"></div>
              
              {/* Inner spinning ring */}
              <div className="absolute inset-0 border-4 border-cyan-400/20 border-t-cyan-400 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '2s' }}></div>
              
              {/* Center logo */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/25">
                  <img src={logo} alt="logo" className="w-10 h-10" />
                </div>
              </div>    
            </div>
            
            <div className="space-y-4">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                Generating Your Website
              </h3>
              <p className="text-gray-400 max-w-md mx-auto min-h-[24px]">
                {loadingMessage}
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        </div>
      )}

      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        toastClassName="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50"
        progressClassName="bg-gradient-to-r from-emerald-400 to-cyan-400"
      />
    </div>
  );
};

WebsiteSketchTool.propTypes = {
  // Add any props if needed
};

export default WebsiteSketchTool;
