import { useEffect, useRef, useState } from "react";
import "../App.css";
import {
  convertToExcalidrawElements,
  Excalidraw,
  exportToBlob,
  Footer,
  MainMenu,
  WelcomeScreen,
  useDevice,
} from "@excalidraw/excalidraw";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Import the toastify CSS
import { useNavigate } from "react-router-dom";
import { nanoid } from "nanoid";
import axios from "axios";

const Playground = () => {
  const navigate = useNavigate();
  const [excalidrawApi, setExcalidrawApi] = useState(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [isAsking, setIsAsking] = useState(false); // New state for "Ask AI" button loading state
  const { isMobile } = useDevice(); // Using the useDevice hook
  const [userPrompt, setUserPrompt] = useState("");
  const id = nanoid(10);
  const [usersData, setUsersData] = useState({});
  const [message, setMessage] = useState("");

  // const { isSignedIn } = useUser();

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      localStorage.setItem("userId", id);
    }
  }, []);


  // const sendImageToBackend = async (blob) => {
  //   const formData = new FormData();
  //   formData.append("image", blob, "canvas.png");
  //   formData.append("userPrompt", "Website should be beautiful");
  //   formData.append("userId", localStorage.getItem("userId"));

  //   try {
  //     const data = await axios.post(
  //       "http://localhost:3000/api/get-user-prompt",
  //       formData,
  //       {
  //         headers: {
  //           "Content-Type": "multipart/form-data",
  //         },
  //       }
  //     );
  //     console.log("data ---> ",data.data.code);
      

  //     // if (!data.ok) {
  //     //   throw new Error("Failed to send image to backend");
  //     // }

  //     setUsersData(data.data.code);
  //     setIsAsking(false);
  //     navigate("/websitegenerator");

  //     // const result = await response.text();
  //     // console.log("Response from backend:", result);
  //     // displayResponseOnCanvas(result); // Call the function to display response
  //   } catch (error) {
  //     toast.error("Error sending image to backend. Please try again.");
  //     console.error("Error sending image to backend:", error);
  //   }
  // };

  const sendImageToBackend = async (blob) => {
    const formData = new FormData();
    formData.append("image", blob, "canvas.png");
    formData.append("userPrompt", userPrompt || "Website should be beautiful");
    formData.append("userId", localStorage.getItem("userId"));
  
    try {
      const response = await axios.post(
        "http://localhost:3000/api/get-user-prompt",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      
      console.log("Response code:", JSON.parse(response.data.code));
      console.log("Response Dependencies:", response.data.dependencies)
      
      // // Store the data properly
      // localStorage.setItem("code", JSON.stringify(response.data.code));
      // localStorage.setItem("dependencies", response.data.dependencies);
      setUsersData(response.data);
      setIsAsking(false);
      navigate("/websitegenerator");
      
    } catch (error) {
      toast.error("Error sending image to backend. Please try again.");
      console.error("Error sending image to backend:", error);
      setIsAsking(false);
    }
  };

  useEffect(() => {
    const localData = localStorage.getItem("code");
    const localDependencies = localStorage.getItem("dependencies");

    if ((localData || localDependencies) && usersData) {
      console.log("Users Data ---> ",usersData);
      
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

  const displayResponseOnCanvas = (response) => {
    try {
      if (excalidrawApi) {
        const elements = excalidrawApi.getSceneElements();
        const lastElement = elements[elements.length - 1];
        const fs = lastElement?.type === "text" ? lastElement.fontSize : 64;
        const color = lastElement.strokeColor || "white";
        const x = lastElement?.x + lastElement?.width + 20 || 100; // Default position if last element is missing
        const y = lastElement?.y || 100;

        const textElement = convertToExcalidrawElements([
          {
            type: "text",
            id: "response-text",
            text: response,
            fontSize: fs,
            x: x,
            y: y,
            textAlign: "left",
            verticalTextAlign: "top",
            strokeColor: color,
          },
        ]);

        excalidrawApi.updateScene({
          elements: [...elements, ...textElement],
        });

        console.log("Displayed response on canvas:", response);
      } else {
        throw new Error("Excalidraw API not available to display response.");
      }
    } catch (error) {
      console.error(error.message);
      toast.error(
        "Error displaying response on canvas. Please refresh the page."
      );
    }
  };

  const handleButtonClick = async () => {
    if (excalidrawApi) {
      try {
        setIsAsking(true); // Set loading state to true
        console.log("Excalidraw API available. Exporting the image...");
        const blob = await exportToBlob({
          elements: excalidrawApi.getSceneElements(),
          mimeType: "image/png",
        });
        sendImageToBackend(blob);
      } catch (error) {
        console.error("Error exporting image:", error);
        toast.error("Error exporting image. Please try again.");
        setIsAsking(false);
      }
    } else {
      console.log("Excalidraw API not available at the moment.");
      toast.error("Excalidraw API is not ready yet. Please try again later.");
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
        // "https://doodlesense.onrender.com/generate",
        "http://localhost:3000/generate",
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

  const MobileFooter = () => {
    const device = useDevice();
    const inputRef = useRef(null);

    useEffect(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, [text]);

    if (device.editor.isMobile) {
      return (
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 px-4 w-full">
          <input
            type="text"
            ref={inputRef}
            className="h-10 w-full sm:w-2/3 md:w-1/2 lg:w-1/3 px-4 py-2 bg-white/5 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-teal-400 transition-all duration-300"
            placeholder="ex. a red car"
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
          <button
            className="group relative px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg shadow-purple-500/25"
            onClick={handleButtonClick}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <span className="relative">
              {isAsking ? "Asking..." : "Ask AI"}
            </span>
          </button>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <div className="custom-styles h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 flex flex-col items-center">
        {/* <Nav /> */}
        <Excalidraw
          excalidrawAPI={(api) => setExcalidrawApi(api)}
          theme="dark"
          renderTopRightUI={() => {
            const device = useDevice();
            if (!device.editor.isMobile) {
              return (
                <button
                  className="group relative px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg shadow-purple-500/25"
                  onClick={handleButtonClick}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative">
                    {isAsking ? "Asking..." : "Ask AI"}
                  </span>
                </button>
              );
            }
            return null;
          }}
          UIOptions={{ 
            dockedSidebarBreakpoint: 200,
            tools: {
              image: {
                enabled: false
              }
            }
          }}
          langCode="en-US"
          gridModeEnabled={false}
          zenModeEnabled={false}
          viewModeEnabled={false}
          name="DoodleSense"
        >
          <MainMenu>
            <MainMenu.DefaultItems.ClearCanvas />
            <MainMenu.DefaultItems.SaveAsImage />
            <MainMenu.DefaultItems.ChangeCanvasBackground />
            <MobileFooter />
          </MainMenu>

          {!isMobile && (
            <Footer>
              <div className="flex flex-col sm:flex-row justify-center items-center gap-4 px-4 w-full">
                <input
                  type="text"
                  className="h-10 w-full sm:w-2/3 md:w-1/2 lg:w-1/3 px-4 py-2 bg-white/5 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-teal-400 transition-all duration-300"
                  placeholder="ex. a red car"
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
      </div>

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
      />
    </>
  );
};

export default Playground;
