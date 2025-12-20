import { Image, MessageCircle } from "lucide-react";
import { GrGallery } from "react-icons/gr";

export const sidebarLinks = [
  { path: "/admin/gallery", label: "Gallery", icon: <GrGallery /> },
  { path: "/admin/review", label: "Reviews", icon: <MessageCircle /> },
  { path: "/admin/banner", label: "Banner", icon: <Image /> },
];