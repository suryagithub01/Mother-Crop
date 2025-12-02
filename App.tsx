
import React, { useState, useEffect } from 'react';
import { Page } from './types';
import { DataProvider, useData } from './store';
import { Header, Footer, AiAssistant, ToastContainer } from './components/Layout';
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Services } from './pages/Services';
import { Blog } from './pages/Blog';
import { Contact } from './pages/Contact';
import { Admin } from './pages/Admin';
import { SoilAnalysis } from './pages/SoilAnalysis';
import { Knowledge } from './pages/Knowledge';

const PageTracker: React.FC<{ currentPage: Page }> = ({ currentPage }) => {
    const { logPageVisit } = useData();
    useEffect(() => {
        logPageVisit(currentPage);
    }, [currentPage, logPageVisit]);
    return null;
}

const AppContent: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>(Page.HOME);

  // Simple scroll to top on page change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  const renderPage = () => {
    switch (currentPage) {
      case Page.HOME:
        return <Home onNavigate={setCurrentPage} />;
      case Page.ABOUT:
        return <About />;
      case Page.SERVICES:
        return <Services onNavigate={setCurrentPage} />;
      case Page.BLOG:
        return <Blog />;
      case Page.CONTACT:
        return <Contact />;
      case Page.ADMIN:
        return <Admin onNavigate={setCurrentPage} />;
      case Page.SOIL_ANALYSIS:
        return <SoilAnalysis />;
      case Page.KNOWLEDGE:
        return <Knowledge />;
      default:
        return <Home onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans text-earth-900 bg-earth-50">
        <PageTracker currentPage={currentPage} />
        <ToastContainer />
        
        {/* Hide header on Admin page to give it a dedicated dashboard feel */}
        {currentPage !== Page.ADMIN && (
          <Header activePage={currentPage} onNavigate={setCurrentPage} />
        )}
        
        <main className="flex-grow flex flex-col">
          {renderPage()}
        </main>

        {/* Hide standard footer on Admin page */}
        {currentPage !== Page.ADMIN && (
          <>
            <Footer onNavigate={setCurrentPage} />
            <AiAssistant />
          </>
        )}
    </div>
  );
}

const App: React.FC = () => {
  return (
    <DataProvider>
      <AppContent />
    </DataProvider>
  );
};

export default App;
