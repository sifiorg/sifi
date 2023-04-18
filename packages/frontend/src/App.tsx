import { AppProvider } from './AppProvider';
import { FAQ } from './components/FAQ/FAQ';
import Footer from './components/Footer/Footer';
import { Header } from './components/Header/Header';
import { Hero } from './components/Hero/Hero';

const App = () => {
  return (
    <AppProvider>
      <Header />
      <main className="px-2 sm:px-8">
        <div className="flex min-h-[90vh] flex-col justify-center">
          <Hero />
        </div>
        <FAQ />
      </main>
      <Footer />
    </AppProvider>
  );
};

export default App;
