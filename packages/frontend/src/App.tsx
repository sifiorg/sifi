import { type FunctionComponent, type ReactNode } from 'react';
import { AppProvider } from './AppProvider';
import Footer from './components/Footer/Footer';
import { Header } from './components/Header/Header';
import { Hero } from './components/Hero/Hero';
import { Route, Routes } from 'react-router-dom';
import { SpaceTravelCanvas } from './space-travel/SpaceTravelCanvas';
import { RecentWarps } from './components/RecentWarps/RecentWarps';
import { Dashboard } from 'src/pages/Dashboard';
import { useReferrer } from 'src/hooks/useReferrer';

const Layout: FunctionComponent<{ children: ReactNode }> = ({ children }) => {
  return (
    <>
      <SpaceTravelCanvas />
      <div className="relative">
        <Header />
        <main className="px-2 sm:px-8 relative flex min-h-[90vh] flex-col md:justify-center">
          {children}
        </main>
        <Footer />
      </div>
    </>
  );
};

const Home: FunctionComponent = () => {
  useReferrer();

  return (
    <>
      <Hero />
      <RecentWarps />
    </>
  );
};

const App = () => {
  return (
    <AppProvider>
      <Layout>
        <Routes>
          <Route path="/r/:ref" element={<Home />} />
          <Route path="/:fromToken/:toToken" element={<Home />} />
          <Route path="/r/:ref/:fromToken/:toToken" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </Layout>
    </AppProvider>
  );
};

export default App;
