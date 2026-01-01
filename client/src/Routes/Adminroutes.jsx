import { Routes, Route, Navigate } from "react-router-dom";
import ResponsiveDashboard from "@/Admin/ResponsiveDashboard";
import Gallery from "@/Admin/Pages/Gallery";
import Reviews from "@/Admin/Pages/Reviews";
import Banner from "@/Admin/Pages/Banner";
import Others from "@/Admin/Pages/Others";
import BlogMain from "@/Admin/Pages/Blog/BlogMain";
import PlanManager from "@/Admin/Pages/Plans/PlanManager";
import PurchaseHistory from "@/Admin/Pages/Plans/PurchaseHistory";

const Adminroutes = () => {
  return (
    <Routes>
      <Route path="/" element={<ResponsiveDashboard />}>
        {/* ✅ FIX: Redirect default /admin to /admin/gallery */}
        <Route index element={<Navigate to="gallery" replace />} />

        {/* ❌ REMOVED: <Route path="dashboard" element={<DashboardHome />} /> */}

        <Route path="gallery" element={<Gallery />} />
        <Route path="review" element={<Reviews />} />
        <Route path="banner" element={<Banner />} />
        <Route path="blog" element={<BlogMain />} />
        <Route path="others" element={<Others />} />
        <Route path="plans" element={<PlanManager />} />
        <Route path="history" element={<PurchaseHistory />} />

      </Route>
    </Routes>
  );
};

export default Adminroutes;
