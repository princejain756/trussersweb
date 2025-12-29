import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import Lenis from '@studio-freight/lenis';
import { Home } from './pages/Home';
import { Shop } from './pages/Shop';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { CheckoutSuccess } from './pages/CheckoutSuccess';
import { CorporateGifting } from './pages/CorporateGifting';
import { Journal } from './pages/Journal';
import BlogPost from './pages/BlogPost';
import { AdminLogin } from './pages/AdminLogin';
import { AdminDashboard } from './pages/AdminDashboard';
import { AccountLogin } from './pages/AccountLogin';
import { AccountRegister } from './pages/AccountRegister';
import { Account } from './pages/Account';
import { AdminHome } from './pages/admin/AdminHome';
import { Orders } from './pages/admin/Orders';
import { Customers } from './pages/admin/Customers';
import { Marketing } from './pages/admin/Marketing';
import { Discounts } from './pages/admin/Discounts';
import { CreateDiscount } from './pages/admin/CreateDiscount';
import { Settings } from './pages/admin/Settings';
import { Journal as AdminJournal } from './pages/admin/Journal';
import { OnlineStore } from './pages/admin/OnlineStore';
import { ThemeEditor } from './pages/admin/ThemeEditor';
import { ProductDetail } from './components/ProductDetail/ProductDetail';
import { ScrollToTop } from './components/UI/ScrollToTop';
import { Chatbot } from './components/Chatbot/Chatbot';
import { CartToast } from './components/UI/CartToast';

function AppContent() {
  const location = useLocation();
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 0.6,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.5,
      touchMultiplier: 2,
      infinite: false,
    });

    lenisRef.current = lenis;

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  // Scroll to top when route changes
  useEffect(() => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true });
    }
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/checkout/success" element={<CheckoutSuccess />} />
        <Route path="/corporate-gifting" element={<CorporateGifting />} />
        <Route path="/journal" element={<Journal />} />
        <Route path="/journal/:slug" element={<BlogPost />} />
        <Route path="/account" element={<Account />} />
        <Route path="/account/login" element={<AccountLogin />} />
        <Route path="/account/register" element={<AccountRegister />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/home" element={<AdminHome />} />
        <Route path="/admin/orders" element={<Orders />} />
        <Route path="/admin/products" element={<AdminDashboard />} />
        <Route path="/admin/customers" element={<Customers />} />
        <Route path="/admin/marketing" element={<Marketing />} />
        <Route path="/admin/discounts" element={<Discounts />} />
        <Route path="/admin/discounts/create" element={<CreateDiscount />} />
        <Route path="/admin/settings" element={<Settings />} />
        <Route path="/admin/online-store" element={<OnlineStore />} />
        <Route path="/admin/online-store/editor" element={<ThemeEditor />} />
        <Route path="/admin/journal" element={<AdminJournal />} />
      </Routes>
      <Chatbot />
      <CartToast />
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
