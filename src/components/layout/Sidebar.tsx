/** @format */
"use client";
import { useState, ReactNode } from "react";
import { useLocation } from "wouter";
import type { LucideIcon } from "lucide-react";
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
  PersonStanding,
  Users,
  UserPlus,
  Store,
  Megaphone,
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
        "sidebar-item flex items-center px-4 py-3 text-sm font-medium cursor-pointer transition-all duration-200 rounded-lg mx-2 my-1",
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
            "h-5 w-5 mr-3",
            isActive ? "text-slate-900" : "text-yellow-500",
          )}
        />
        {label}
        {hasSubMenu && <ChevronDown className="ml-auto h-4 w-4" />}
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
    <div className="text-xs font-bold text-yellow-500 px-4 py-2 mt-4 mb-2 uppercase tracking-wider">
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
        "flex items-center pl-12 py-2.5 text-sm cursor-pointer transition-all duration-200 mx-2 rounded-lg",
        isActive
          ? "bg-slate-800/80 text-yellow-400"
          : "text-slate-400 hover:bg-slate-800/50 hover:text-yellow-200",
      )}>
      <Link
        href={href}
        className="w-full flex items-center">
        <Icon className="h-4 w-4 mr-2 text-yellow-500/80" />
        {label}
      </Link>
    </div>
  );

  return (
    <aside
      className={cn(
        "bg-gradient-to-b from-slate-950 to-slate-900 text-slate-100 w-64 flex-shrink-0 transition-all duration-300 z-40 h-screen shadow-xl border-r border-yellow-900/20",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0 md:w-64",
        "fixed md:static",
      )}>
      <div className="flex items-center px-6 py-5 border-b border-yellow-900/30 bg-slate-950">
        <div className="bg-gradient-to-br from-yellow-400 to-amber-600 rounded-lg shadow-md p-2 flex items-center justify-center">
          <RestaurantLogo className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-bold ml-3 text-white">
          <span className="text-yellow-400">Di</span>xie
        </h1>
      </div>

      <div className="py-3 overflow-y-auto h-[calc(100vh-72px)] custom-scrollbar px-2">
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
            label="Cuisines"
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
            <div className="bg-slate-900/50 py-2 my-1 rounded-lg">
              <SubMenuItem
                href="/foods/add-new"
                icon={PlusCircle}
                label="Ajouter un Plat"
                isActive={location === "/foods/add-new"}
              />
              <SubMenuItem
                href="/foods"
                icon={ListOrdered}
                label="Liste des Plats"
                isActive={location === "/foods" && !location.includes("/add")}
              />
            </div>
          )}
          <SidebarItem
            href="/fav"
            icon={FolderTree}
            label="Favorites"
            isActive={location === "/fav"}
          />
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
          <SidebarItem
            href="/deliveryman/pending-approval-list"
            icon={PersonStanding}
            label="Livreurs à approuver"
            isActive={location === "/pending-approval-list"}
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

        <SidebarSection title="Gestion de l'Entreprise">
          <SidebarItem
            href="/settings/edite"
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
            <div className="bg-slate-900/50 py-2 my-1 rounded-lg">
              <SubMenuItem
                href="/employees/add"
                icon={UserPlus}
                label="Ajouter un Employé"
                isActive={location === "/employees/add"}
              />
              <SubMenuItem
                href="/employees"
                icon={ListOrdered}
                label="Liste des Employés"
                isActive={
                  location === "/employees" && !location.includes("/add")
                }
              />
            </div>
          )}
        </SidebarSection>
      </div>

      {/* Styles personnalisés pour les barres de défilement */}
      <style
        jsx
        global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
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
