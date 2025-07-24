/** @format */
"use client";
import { useState, ReactNode } from "react";
import { useLocation } from "wouter";
import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  ClipboardList,
  FolderTree,
  ChefHat,
  UserPlus,
  Truck,
  PersonStanding,
  Settings2,
  ChevronDown,
  User,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import RestaurantLogo from "@/components/common/RestaurantLogo";
import Link from "next/link";

interface SidebarItemProps {
  href: string;
  icon: LucideIcon;
  label: string;
  hasSubMenu?: boolean;
  isActive?: boolean;
  onClick?: () => void;
}

const SidebarItem = ({
  href,
  icon: Icon,
  label,
  hasSubMenu = false,
  isActive = false,
  onClick,
}: SidebarItemProps) => {
  return (
    <div
      className={cn(
        "sidebar-item flex items-center px-3 py-2 text-sm font-medium cursor-pointer transition-all duration-200 rounded-lg mx-2 my-0.5",
        isActive
          ? "active-nav bg-gradient-to-r from-yellow-500 to-amber-600 text-slate-900 shadow-lg shadow-amber-500/20"
          : "hover:bg-slate-800/70 text-slate-300 hover:text-yellow-100",
      )}
      onClick={onClick}>
      <Link
        href={href}
        className="flex items-center w-full">
        <Icon
          className={cn(
            "h-4 w-4 mr-2.5",
            isActive ? "text-slate-900" : "text-yellow-500",
          )}
        />
        <span className="text-xs">{label}</span>
        {hasSubMenu && <ChevronDown className="ml-auto h-3 w-3" />}
      </Link>
    </div>
  );
};

interface SidebarSectionProps {
  title: string;
  children: ReactNode;
}

const SidebarSection = ({ title, children }: SidebarSectionProps) => (
  <>
    <div className="text-xs font-bold text-yellow-500 px-3 py-1.5 mt-3 mb-1 uppercase tracking-wider">
      {title}
    </div>
    {children}
  </>
);

interface SidebarProps {
  isOpen: boolean;
}

export default function Sidebar({ isOpen }: SidebarProps) {
  const [location] = useLocation();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    foods: location.startsWith("/foods"),
    employees: location.startsWith("/employees"),
  });

  const toggleExpanded = (section: string): void => {
    setExpanded((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  interface SubMenuItemProps {
    href: string;
    icon: LucideIcon;
    label: string;
    isActive?: boolean;
  }

  const SubMenuItem = ({
    href,
    icon: Icon,
    label,
    isActive = false,
  }: SubMenuItemProps) => (
    <div
      className={cn(
        "flex items-center pl-8 py-1.5 text-xs cursor-pointer transition-all duration-200 mx-2 rounded-lg",
        isActive
          ? "bg-slate-800/80 text-yellow-400"
          : "text-slate-400 hover:bg-slate-800/50 hover:text-yellow-200",
      )}>
      <Link
        href={href}
        className="w-full flex items-center">
        <Icon className="h-3 w-3 mr-2 text-yellow-500/80" />
        {label}
      </Link>
    </div>
  );

  return (
    <aside
      className={cn(
        "bg-gradient-to-b from-slate-950 to-slate-900 text-slate-100 w-52 flex-shrink-0 transition-all duration-300 z-40 h-screen shadow-xl border-r border-yellow-900/20",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0 md:w-52",
        "fixed md:static",
      )}>
      {/* En-tête compact */}
      <div className="flex items-center px-4 py-3 border-b border-yellow-900/30 bg-slate-950">
        <div className="bg-gradient-to-br from-yellow-400 to-amber-600 rounded-lg shadow-md p-1.5 flex items-center justify-center">
          <RestaurantLogo className="w-6 h-6" />
        </div>
        <h1 className="text-lg font-bold ml-2.5 text-white">
          <span className="text-yellow-400">A</span>Food
        </h1>
      </div>

      <div className="py-2 overflow-y-auto h-[calc(100vh-60px)] custom-scrollbar px-1">
        {/* Navigation Principale */}
        <SidebarSection title="Principal">
          <SidebarItem
            href="/dashboard"
            icon={LayoutDashboard}
            label="Tableau de Bord"
            isActive={location === "/dashboard" || location === "/"}
          />
          <SidebarItem
            href="/orders"
            icon={ClipboardList}
            label="Commandes"
            isActive={location === "/orders"}
          />
          <SidebarItem
            href="/clients"
            icon={User}
            label="Utilisateurs"
            isActive={location === "/clients"}
          />
        </SidebarSection>

        {/* Gestion des Plats */}
        <SidebarSection title="Menu">
          <SidebarItem
            href="/categories"
            icon={FolderTree}
            label="Catégories"
            isActive={location === "/categories"}
          />
          <SidebarItem
            href="/foods"
            icon={ChefHat}
            label="Plats"
            isActive={location === "/foods"}
          />
          {/* <SidebarItem
            href="/trending-foods"
            icon={TrendingUp}
            label="Plats Tendances"
            isActive={location === "/trending-foods"}
          /> */}
        </SidebarSection>

        {/* Livraisons */}
        <SidebarSection title="Livraisons">
          <SidebarItem
            href="/deliveryman/add"
            icon={UserPlus}
            label="Ajouter Livreur"
            isActive={location === "/deliveryman/add"}
          />
          <SidebarItem
            href="/deliveryman/list"
            icon={Truck}
            label="Liste Livreurs"
            isActive={location === "/deliveryman/list"}
          />
          <SidebarItem
            href="/deliveryman/pending-approval-list"
            icon={PersonStanding}
            label="À Approuver"
            isActive={location === "/deliveryman/pending-approval-list"}
          />
        </SidebarSection>

        {/* Paramètres */}
        <SidebarSection title="Système">
          <SidebarItem
            href="/settings/edite"
            icon={Settings2}
            label="Réglages"
            isActive={location === "/settings/edite"}
          />
        </SidebarSection>
      </div>

      {/* Styles personnalisés pour les barres de défilement */}
      <style
        jsx
        global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #0f172a;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #eab308;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #f59e0b;
        }
      `}</style>
    </aside>
  );
}
