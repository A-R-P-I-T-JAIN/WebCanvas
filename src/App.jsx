import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Playground from "./components/Playground";
import ErrorBoundary from "./components/ErrorBoundary";
import Home from "./components/Home";
import SignInOut from './components/SignInOut';
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import WebsiteGenerator from './components/WebsiteGenerator';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />

          {/* Protecting the Playground route */}
          <Route 
            path="/playground" 
            element={<Playground />} 
          />
          <Route 
            path="/websitegenerator" 
            element={<WebsiteGenerator />} 
          />

          {/* Sign-in route */}
          <Route path="/sign-in" element={<SignInOut />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
