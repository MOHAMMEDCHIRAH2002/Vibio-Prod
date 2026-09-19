import Navbar from './Navbar';
import Footer from './Footer';

export default function StorefrontLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pb-12 pt-2">{children}</main>
      <Footer />
    </div>
  );
}
