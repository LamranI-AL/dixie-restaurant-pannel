/** @format */
"use client";
import { useState } from "react";
import { useLocation } from "wouter";
import {
  LayoutDashboard,
  ShoppingBag,
  BadgePercent,
  Receipt,
  PlusCircle,
  ListOrdered,
  ClipboardList,
  CalendarClock,
  FolderTree,
  ChefHat,
  Settings2,
  BellRing,
  ChevronDown,
  Truck,
  Users,
  UserPlus,
  Store,
  Megaphone,
  Banknote,
  ImagePlus,
  Images,
} from "lucide-react";
import { cn } from "@/lib/utils";
import RestaurantLogo from "@/components/common/RestaurantLogo";
import Link from "next/link";

interface SidebarItemProps {
  href: string;
  icon: React.ElementType;
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
        "sidebar-item flex items-center px-4 py-2.5 text-sm font-medium cursor-pointer transition-all duration-200 rounded-md mx-2",
        isActive
          ? "active-nav bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md"
          : "hover:bg-indigo-800/30 text-slate-200 hover:text-white",
      )}
      onClick={onClick}>
      <Link
        href={href}
        className="flex items-center w-full">
        <Icon className="h-5 w-5 mr-3" />
        {label}
        {hasSubMenu && <ChevronDown className="ml-auto h-4 w-4" />}
      </Link>
    </div>
  );
};

interface SidebarSectionProps {
  title: string;
  children: React.ReactNode;
}

const SidebarSection = ({ title, children }: SidebarSectionProps) => (
  <>
    <div className="text-xs font-bold text-amber-400 px-4 py-2 mt-3 mb-1 uppercase tracking-wider">
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

  const toggleExpanded = (section: string) => {
    setExpanded((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <aside
      className={cn(
        "bg-gradient-to-b from-slate-950 to-slate-900 text-slate-100 w-64 flex-shrink-0 transition-all duration-300 z-40 h-screen shadow-xl",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0 md:w-64",
        "fixed md:static",
      )}>
      <div className="flex items-center px-4 py-4 border-b border-indigo-900/40 bg-slate-950">
        <RestaurantLogo className="w-10 h-10 rounded-md shadow-md bg-gradient-to-r from-amber-500 to-orange-500 p-1" />
        <h1 className="text-xl font-bold ml-3 text-white">Dixie</h1>
      </div>

      <div className="py-3 overflow-y-auto h-[calc(100vh-72px)] custom-scrollbar">
        <SidebarSection title="Navigation Principale">
          <SidebarItem
            href="/dashboard"
            icon={LayoutDashboard}
            label="Tableau de Bord"
            isActive={location === "/dashboard" || location === "/"}
          />
          <SidebarItem
            href="/point-of-sale"
            icon={ShoppingBag}
            label="Point de Vente"
            isActive={location === "/point-of-sale"}
          />
        </SidebarSection>
        <SidebarSection title="Gestion des Commandes">
          <SidebarItem
            href="/orders"
            icon={ClipboardList}
            label="Commandes"
            isActive={location === "/orders"}
          />
          <SidebarItem
            href="/subscriptions"
            icon={CalendarClock}
            label="Abonnements"
            isActive={location === "/subscriptions"}
          />
        </SidebarSection>

        <SidebarSection title="Gestion des Plats">
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
            hasSubMenu
            isActive={location.startsWith("/foods")}
            onClick={() => toggleExpanded("foods")}
          />
          {expanded.foods && (
            <>
              <div className="flex items-center pl-12 py-2.5 text-sm text-slate-300 hover:bg-indigo-800/20 hover:text-white cursor-pointer transition-all duration-200 mx-2 rounded-md">
                <Link
                  href="/foods/add-new"
                  className="w-full flex items-center">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Ajouter un Plat
                </Link>
              </div>
              <div className="flex items-center pl-12 py-2.5 text-sm text-slate-300 hover:bg-indigo-800/20 hover:text-white cursor-pointer transition-all duration-200 mx-2 rounded-md">
                <Link
                  href="/foods"
                  className="w-full flex items-center">
                  <ListOrdered className="h-4 w-4 mr-2" />
                  Liste des Plats
                </Link>
              </div>
            </>
          )}
        </SidebarSection>
        <SidebarSection title="Gestion des Livraisons">
          <SidebarItem
            href="/deliveryman/add"
            icon={UserPlus}
            label="Ajouter un Livreur"
            isActive={location === "/delivery/add"}
          />

          <SidebarItem
            href="/deliveryman/list"
            icon={Truck}
            label="Liste des Livreurs"
            isActive={location === "/delivery"}
          />
        </SidebarSection>

        <SidebarSection title="Promotions">
          <SidebarItem
            href="/campaigns"
            icon={Megaphone}
            label="Campagnes"
            hasSubMenu
            isActive={location.startsWith("/campaigns")}
          />
          <SidebarItem
            href="/coupons"
            icon={BadgePercent}
            label="Coupons"
            isActive={location.startsWith("/coupons")}
          />
        </SidebarSection>

        <SidebarSection title="Gestion des Publicités">
          <SidebarItem
            href="/ads/new"
            icon={ImagePlus}
            label="Nouvelle Publicité"
            isActive={location === "/ads/new"}
          />
          <SidebarItem
            href="/ads"
            icon={Images}
            label="Liste des Publicités"
            hasSubMenu
            isActive={location === "/ads"}
          />
        </SidebarSection>

        <SidebarSection title="Gestion de l'Entreprise">
          <SidebarItem
            href="/settings"
            icon={Settings2}
            label="Configuration du Restaurant"
            isActive={location === "/settings"}
          />
          <SidebarItem
            href="/notifications"
            icon={BellRing}
            label="Paramètres de Notification"
            isActive={location === "/notifications"}
          />
        </SidebarSection>

        <SidebarSection title="Section Employés">
          <SidebarItem
            href="/employees"
            icon={Users}
            label="Employés"
            hasSubMenu
            isActive={location.startsWith("/employees")}
            onClick={() => toggleExpanded("employees")}
          />
          {expanded.employees && (
            <>
              <div className="flex items-center pl-12 py-2.5 text-sm text-slate-300 hover:bg-indigo-800/20 hover:text-white cursor-pointer transition-all duration-200 mx-2 rounded-md">
                <Link
                  href="/employees/add"
                  className="w-full flex items-center">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Ajouter un Employé
                </Link>
              </div>
              <div className="flex items-center pl-12 py-2.5 text-sm text-slate-300 hover:bg-indigo-800/20 hover:text-white cursor-pointer transition-all duration-200 mx-2 rounded-md">
                <Link
                  href="/employees"
                  className="w-full flex items-center">
                  <ListOrdered className="h-4 w-4 mr-2" />
                  Liste des Employés
                </Link>
              </div>
            </>
          )}
        </SidebarSection>
      </div>

      {/* Styles personnalisés pour les barres de défilement */}
      <style
        jsx
        global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #0f172a;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #4338ca;
          border-radius: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #4f46e5;
        }
      `}</style>
    </aside>
  );
}
