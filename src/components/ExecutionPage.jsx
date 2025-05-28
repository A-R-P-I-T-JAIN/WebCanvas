import React, { useState, forwardRef, useEffect, useRef } from "react";
import Editor, { useMonaco } from "@monaco-editor/react";
import githubDarkTheme from "monaco-themes/themes/krTheme.json";
import { FaFolder, FaFolderOpen, FaFile } from "react-icons/fa";
import { BsFolder2, BsFolder2Open } from "react-icons/bs";
import { CiFileOn } from "react-icons/ci";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import "../App.css";

const ExecutionPage = ({ codex, fileTreeVisible }, ref) => {
  const extractFiles = (obj, path = "") => {
    let files = {};
    for (const key in obj) {
      if (obj[key].file) {
        files[`${path}${key}`] = obj[key].file.contents;
      } else if (obj[key].directory) {
        Object.assign(files, extractFiles(obj[key].directory, `${path}${key}/`));
      }
    }
    return files;
  };

  const files = extractFiles(codex);
  const filePaths = Object.keys(files);
  const [selectedFile, setSelectedFile] = useState(filePaths[0] || "");
  const [openFiles, setOpenFiles] = useState([]);
  const [expandedFolders, setExpandedFolders] = useState({});
  const [code, setCode] = useState(files[selectedFile] || "");
  const [fileTreeWidth, setFileTreeWidth] = useState(256);
  const isResizing = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(0);
  const containerRef = useRef(null);

  const handleMouseDown = (e) => {
    e.preventDefault();
    isResizing.current = true;
    startX.current = e.clientX;
    startWidth.current = fileTreeWidth;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  const handleMouseMove = (e) => {
    if (!isResizing.current || !containerRef.current) return;
    
    const deltaX = e.clientX - startX.current;
    const newWidth = Math.max(200, Math.min(500, startWidth.current + deltaX));
    setFileTreeWidth(newWidth);
  };

  const handleMouseUp = () => {
    isResizing.current = false;
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

  useEffect(() => {
    if (selectedFile) {
      setCode(files[selectedFile]);
      if (!openFiles.includes(selectedFile)) {
        setOpenFiles([...openFiles, selectedFile]);
      }
    }
  }, [selectedFile]);

  const monaco = useMonaco();
  useEffect(() => {
    if (monaco) {
      monaco.editor.defineTheme("github-dark", {
        ...githubDarkTheme,
        colors: {
          ...githubDarkTheme.colors,
          "editor.background": "#0f0f12",
          "editor.lineHighlightBackground": "#1a1a20",
        }
      });
      monaco.editor.setTheme("github-dark");
    }
  }, [monaco]);

  const toggleFolder = (folder) => {
    setExpandedFolders((prev) => ({ ...prev, [folder]: !prev[folder] }));
  };

  const renderTree = (obj, path = "") => {
    return Object.entries(obj).map(([key, item]) => {
      const fullPath = `${path}${key}`;

      if (item.directory) {
        return (
          <div key={fullPath} className="ml-1">
            <div
              onClick={() => toggleFolder(fullPath)}
              className="cursor-pointer flex items-center gap-2 py-1 px-2 rounded hover:bg-[#25252d] transition-colors"
            >
              {expandedFolders[fullPath] ? (
                <BsFolder2Open className="text-[#e33cef] size-5 shrink-0" />
              ) : (
                <BsFolder2 className="text-[#e33cef] size-5 shrink-0" />
              )}
              <span className="truncate">{key}</span>
            </div>
            <div
              className={expandedFolders[fullPath] ? "block pl-4 border-l border-[#2a2a32] ml-2" : "hidden"}
            >
              {renderTree(item.directory, `${fullPath}/`)}
            </div>
          </div>
        );
      }

      if (item.file) {
        return (
          <div
            key={fullPath}
            className={`cursor-pointer flex items-center gap-2 py-1 px-2 rounded ml-1 ${selectedFile === fullPath ? 'bg-[#25252d]' : 'hover:bg-[#1e1e24]'}`}
            onClick={() => setSelectedFile(fullPath)}
          >
            <CiFileOn className="size-5 shrink-0 text-[#4cafff]" />
            <span className="truncate">{key}</span>
          </div>
        );
      }

      return (
        <div key={fullPath} className="text-red-500 px-2 py-1">
          ⚠️ Unhandled Item: {key}
        </div>
      );
    });
  };

  const downloadProject = () => {
    const zip = new JSZip();
    Object.keys(files).forEach((path) => zip.file(path, files[path]));
    zip
      .generateAsync({ type: "blob" })
      .then((content) => saveAs(content, "project.zip"));
  };

  return (
    <div
      ref={ref}
      className="flex flex-col h-full w-full bg-[#0f0f12] text-[#e0e0e0]"
    >
      <div ref={containerRef} className="flex flex-1 overflow-hidden">
        {/* File Tree Panel */}
        {fileTreeVisible && (
          <>
            <div 
              className="overflow-y-auto bg-[#16161a] border-r border-[#2a2a32]"
              style={{ width: `${fileTreeWidth}px`, minWidth: '200px' }}
            >
              <div className="flex justify-between items-center mb-3 px-2">
                <h3 className="text-sm font-medium">EXPLORER</h3>
                <button
                  onClick={downloadProject}
                  className="p-1 rounded hover:bg-[#25252d] transition-colors"
                  title="Download Project"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                </button>
              </div>
              <div className="space-y-1">
                {renderTree(codex)}
              </div>
            </div>

            {/* Resizer */}
            <div
              className="w-1 cursor-col-resize hover:bg-[#4cafff] transition-colors"
              onMouseDown={handleMouseDown}
            />
          </>
        )}

        {/* Editor Panel */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* File Tabs */}
          <div className="flex bg-[#1a1a20] border-b border-[#2a2a32] overflow-x-auto">
            {openFiles.map((file) => (
              <div
                key={file}
                className={`flex items-center px-4 py-2 border-r border-[#2a2a32] cursor-pointer relative group ${file === selectedFile ? 'bg-[#0f0f12]' : 'hover:bg-[#25252d]'}`}
                onClick={() => setSelectedFile(file)}
              >
                <span className="truncate max-w-xs">{file.split("/").pop()}</span>
                <button
                  className="ml-2 p-1 rounded-full hover:bg-[#3a3a42] opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenFiles(openFiles.filter(f => f !== file));
                    if (file === selectedFile) {
                      setSelectedFile(openFiles.find(f => f !== file) || '');
                    }
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
                {file === selectedFile && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#4cafff]"></div>
                )}
              </div>
            ))}
          </div>
          
          {/* Monaco Editor */}
          <div className="flex-1">
            <Editor
              key={selectedFile}
              language={selectedFile.endsWith('.html') ? 'html' : 
                      selectedFile.endsWith('.css') ? 'css' : 
                      selectedFile.endsWith('.js') ? 'javascript' : 
                      'plaintext'}
              theme="github-dark"
              value={code}
              options={{
                minimap: { enabled: false },
                automaticLayout: true,
                quickSuggestions: { other: true, comments: false, strings: true },
                folding: true,
                foldingStrategy: "auto",
                wordWrap: "on",
                bracketPairColorization: { enabled: true },
                autoClosingBrackets: "always",
                fontSize: 13,
                padding: { top: 12 },
                scrollBeyondLastLine: false,
                renderWhitespace: "selection",
                guides: { indentation: true },
                mouseWheelZoom: true,
              }}
              onChange={(value) => {
                setCode(value);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default forwardRef(ExecutionPage);
