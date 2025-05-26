import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ErrorBoundary from "./components/ErrorBoundary";
import Home from "./components/Home";
import WebsiteGenerator from './components/WebsiteGenerator';
import WebsiteSketchTool from './components/WebsiteSketchTool';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />

          {/* Protecting the Playground route */}
          <Route 
            path="/websitegenerator" 
            element={<WebsiteGenerator />} 
          />
          <Route 
            path="/sketchtool" 
            element={<WebsiteSketchTool />} 
          />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
