import { Image, MessageCircle, Settings } from "lucide-react";
import { FaSortAmountUp } from "react-icons/fa";
import { GrBlog, GrGallery } from "react-icons/gr";

export const sidebarLinks = [
  { path: "/admin/gallery", label: "Gallery", icon: <GrGallery /> },
  { path: "/admin/review", label: "Reviews", icon: <MessageCircle /> },
  { path: "/admin/banner", label: "Banner", icon: <Image /> },
  { path: "/admin/blog", label: "Blog", icon: <GrBlog /> },
  { path: "/admin/plans", label: "Plan", icon: <FaSortAmountUp /> },
  { path: "/admin/others", label: "others", icon: <Settings /> },
];
