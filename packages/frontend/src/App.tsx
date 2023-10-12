import { useEffect, type FunctionComponent, type ReactNode } from 'react';
import { AppProvider } from './AppProvider';
import Footer from './components/Footer/Footer';
import { Header } from './components/Header/Header';
import { Hero } from './components/Hero/Hero';
import { Route, Routes } from 'react-router-dom';
import { useSpaceTravel } from './providers/SpaceTravelProvider';

const Layout: FunctionComponent<{ children: ReactNode }> = ({ children }) => {
  useSpaceTravel();
  return (
    <>
      <canvas id="space-travel" className="fixed w-screen h-screen" />
      <div className="relative">
        <Header />
        <main className="px-2 sm:px-8 relative">{children}</main>
        <Footer />
      </div>
    </>
  );
};

const Home: FunctionComponent = () => {
  return (
    <>
      <div className="mt-12 flex min-h-[90vh] flex-col md:mt-0 md:justify-center">
        <Hero />
      </div>
    </>
  );
};

const App = () => {
  return (
    <AppProvider>
      <Layout>
        <Routes>
          <Route path="/:fromToken/:toToken" element={<Home />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </Layout>
    </AppProvider>
  );
};

export default App;
