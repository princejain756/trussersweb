import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { useEffect, lazy, Suspense } from 'react';
import { Home } from './pages/Home';
import { ScrollToTop } from './components/UI/ScrollToTop';
import { Chatbot } from './components/Chatbot/Chatbot';
import { CartToast } from './components/UI/CartToast';

// Lazy load all pages except Home (critical path)
const Shop = lazy(() => import('./pages/Shop').then(m => ({ default: m.Shop })));
const Cart = lazy(() => import('./pages/Cart').then(m => ({ default: m.Cart })));
const Checkout = lazy(() => import('./pages/Checkout').then(m => ({ default: m.Checkout })));
const CheckoutSuccess = lazy(() => import('./pages/CheckoutSuccess').then(m => ({ default: m.CheckoutSuccess })));
const CorporateGifting = lazy(() => import('./pages/CorporateGifting').then(m => ({ default: m.CorporateGifting })));
const Journal = lazy(() => import('./pages/Journal').then(m => ({ default: m.Journal })));
const BlogPost = lazy(() => import('./pages/BlogPost'));
const About = lazy(() => import('./pages/About').then(m => ({ default: m.About })));
const Sustainability = lazy(() => import('./pages/Sustainability').then(m => ({ default: m.Sustainability })));
const Contact = lazy(() => import('./pages/Contact').then(m => ({ default: m.Contact })));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy').then(m => ({ default: m.PrivacyPolicy })));
const TermsOfService = lazy(() => import('./pages/TermsOfService').then(m => ({ default: m.TermsOfService })));
const EcoFriendlyProductsBangalore = lazy(() => import('./pages/EcoFriendlyProductsBangalore').then(m => ({ default: m.EcoFriendlyProductsBangalore })));
const EcoFriendlyProductsChickpetBangalore = lazy(() => import('./pages/EcoFriendlyProductsChickpetBangalore').then(m => ({ default: m.EcoFriendlyProductsChickpetBangalore })));
const AdminLogin = lazy(() => import('./pages/AdminLogin').then(m => ({ default: m.AdminLogin })));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const AccountLogin = lazy(() => import('./pages/AccountLogin').then(m => ({ default: m.AccountLogin })));
const AccountRegister = lazy(() => import('./pages/AccountRegister').then(m => ({ default: m.AccountRegister })));
const Account = lazy(() => import('./pages/Account').then(m => ({ default: m.Account })));
const ProductDetail = lazy(() => import('./components/ProductDetail/ProductDetail').then(m => ({ default: m.ProductDetail })));

// Admin pages - lazy loaded separately
const AdminHome = lazy(() => import('./pages/admin/AdminHome').then(m => ({ default: m.AdminHome })));
const Orders = lazy(() => import('./pages/admin/Orders').then(m => ({ default: m.Orders })));
const Customers = lazy(() => import('./pages/admin/Customers').then(m => ({ default: m.Customers })));
const Marketing = lazy(() => import('./pages/admin/Marketing').then(m => ({ default: m.Marketing })));
const Discounts = lazy(() => import('./pages/admin/Discounts').then(m => ({ default: m.Discounts })));
const CreateDiscount = lazy(() => import('./pages/admin/CreateDiscount').then(m => ({ default: m.CreateDiscount })));
const Settings = lazy(() => import('./pages/admin/Settings').then(m => ({ default: m.Settings })));
const AdminJournal = lazy(() => import('./pages/admin/Journal').then(m => ({ default: m.Journal })));
const OnlineStore = lazy(() => import('./pages/admin/OnlineStore').then(m => ({ default: m.OnlineStore })));
const ThemeEditor = lazy(() => import('./pages/admin/ThemeEditor').then(m => ({ default: m.ThemeEditor })));
const Payments = lazy(() => import('./pages/admin/Payments').then(m => ({ default: m.Payments })));
const Fraud = lazy(() => import('./pages/admin/Fraud').then(m => ({ default: m.Fraud })));
const Newsletter = lazy(() => import('./pages/admin/Newsletter').then(m => ({ default: m.Newsletter })));

// Minimal loading fallback for best performance
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#F4EFEC]">
    <div className="w-8 h-8 border-2 border-[#2D5F3F] border-t-transparent rounded-full animate-spin" />
  </div>
);

function AppContent() {
  const location = useLocation();

  // Scroll to top when route changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/sustainability" element={<Sustainability />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/eco-friendly-products-bangalore" element={<EcoFriendlyProductsBangalore />} />
          <Route path="/eco-friendly-products-chickpet-bangalore" element={<EcoFriendlyProductsChickpetBangalore />} />
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
          <Route path="/admin/payments" element={<Payments />} />
          <Route path="/admin/fraud" element={<Fraud />} />
          <Route path="/admin/products" element={<AdminDashboard />} />
          <Route path="/admin/customers" element={<Customers />} />
          <Route path="/admin/marketing" element={<Marketing />} />
          <Route path="/admin/discounts" element={<Discounts />} />
          <Route path="/admin/discounts/create" element={<CreateDiscount />} />
          <Route path="/admin/settings" element={<Settings />} />
          <Route path="/admin/online-store" element={<OnlineStore />} />
          <Route path="/admin/online-store/editor" element={<ThemeEditor />} />
          <Route path="/admin/journal" element={<AdminJournal />} />
          <Route path="/admin/newsletter" element={<Newsletter />} />
          <Route path="*" element={<Navigate to="/404.html" replace />} />
        </Routes>
      </Suspense>
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
