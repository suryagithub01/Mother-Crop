import React, { useState, useEffect } from 'react';
import { Page } from './types';
import { DataProvider } from './store';
import { Header, Footer, AiAssistant } from './components/Layout';
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Services } from './pages/Services';
import { Blog } from './pages/Blog';
import { Contact } from './pages/Contact';
import { Admin } from './pages/Admin';

const App: React.FC = () => {
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
      default:
        return <Home onNavigate={setCurrentPage} />;
    }
  };

  return (
    <DataProvider>
      <div className="min-h-screen flex flex-col font-sans text-earth-900 bg-earth-50">
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
    </DataProvider>
  );
};

export default App;