/** @format */
"use client";
import { useState } from "react";
import { useLocation } from "wouter";
import {
  LayoutDashboard,
  ShoppingCart,
  Megaphone,
  Ticket,
  PlusSquare,
  List,
  ClipboardList,
  Repeat,
  ListFilter,
  Utensils,
  Settings,
  Bell,
  ChevronDown,
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
        "sidebar-item flex items-center px-4 py-2.5 text-sm font-medium cursor-pointer",
        isActive
          ? "active-nav bg-sidebar-accent/50 border-l-2 border-primary"
          : "hover:bg-sidebar-accent/50",
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
    <div className="text-xs font-bold text-amber-500  px-4 py-2 mt-2">
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
        "bg-slate-800 text-slate-100 w-64 flex-shrink-0 transition-all duration-300 z-40 h-screen",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0 md:w-64",
        "fixed md:static",
      )}>
      <div className="flex items-center px-4 py-3 border-b border-sidebar-border">
        <RestaurantLogo className="w-8 h-8 rounded-md" />
        <h1 className="text-lg font-semibold ml-2">Dixie</h1>
      </div>

      <div className="py-2 overflow-y-auto h-[calc(100vh-64px)]">
        <SidebarSection title="MAIN NAVIGATION">
          <SidebarItem
            href="/dashboard"
            icon={LayoutDashboard}
            label="Dashboard"
            isActive={location === "/dashboard" || location === "/"}
          />
          <SidebarItem
            href="/point-of-sale"
            icon={ShoppingCart}
            label="Point Of Sale"
            isActive={location === "/point-of-sale"}
          />
        </SidebarSection>
        <SidebarSection title="ORDER MANAGEMENT">
          <SidebarItem
            href="/orders"
            icon={ClipboardList}
            label="Orders"
            isActive={location === "/orders"}
          />
          <SidebarItem
            href="/subscriptions"
            icon={Repeat}
            label="Order Subscription"
            isActive={location === "/subscriptions"}
          />
        </SidebarSection>

        <SidebarSection title="FOOD MANAGEMENT">
          <SidebarItem
            href="/categories"
            icon={ListFilter}
            label="Categories"
            isActive={location === "/categories"}
          />
          <SidebarItem
            href="/foods"
            icon={Utensils}
            label="Foods"
            hasSubMenu
            isActive={location.startsWith("/foods")}
            onClick={() => toggleExpanded("foods")}
          />
          {expanded.foods && (
            <>
              <div className="flex items-center pl-12 py-2 text-sm text-slate-100 hover:bg-sidebar-accent/50 cursor-pointer">
                <Link
                  href="/foods/add-new"
                  className="w-full">
                  Add New Food
                </Link>
              </div>
              <div className="flex items-center pl-12 py-2 text-sm text-slate-100  hover:bg-sidebar-accent/50 cursor-pointer">
                <Link
                  href="/foods"
                  className="w-full">
                  Food List
                </Link>
              </div>
            </>
          )}
        </SidebarSection>
        <SidebarSection title="DELIVERY MANAGEMENT">
          <SidebarItem
            href="/deliveryman/add"
            icon={PlusSquare}
            label="add deliverymen "
            isActive={location === "/delivery/add"}
          />

          <SidebarItem
            href="/deliveryman/list"
            icon={ShoppingCart}
            label="Delivery List"
            isActive={location === "/delivery"}
          />
        </SidebarSection>

        <SidebarSection title="PROMOTIONS">
          <SidebarItem
            href="/campaigns"
            icon={Megaphone}
            label="Campaign"
            hasSubMenu
            isActive={location.startsWith("/campaigns")}
          />
          <SidebarItem
            href="/coupons"
            icon={Ticket}
            label="Coupons"
            isActive={location.startsWith("/coupons")}
          />
        </SidebarSection>

        <SidebarSection title="ADVERTISEMENT MANAGEMENT">
          <SidebarItem
            href="/ads/new"
            icon={PlusSquare}
            label="New Advertisement"
            isActive={location === "/ads/new"}
          />
          <SidebarItem
            href="/ads"
            icon={List}
            label="Advertisement List"
            hasSubMenu
            isActive={location === "/ads"}
          />
        </SidebarSection>

        <SidebarSection title="BUSINESS MANAGEMENT">
          <SidebarItem
            href="/settings"
            icon={Settings}
            label="Restaurant Config"
            isActive={location === "/settings"}
          />
          <SidebarItem
            href="/notifications"
            icon={Bell}
            label="Notification Setup"
            isActive={location === "/notifications"}
          />
        </SidebarSection>

        <SidebarSection title="EMPLOYEE SECTION">
          <SidebarItem
            href="/employees"
            icon={List}
            label="Employees"
            hasSubMenu
            isActive={location.startsWith("/employees")}
            onClick={() => toggleExpanded("employees")}
          />
          {expanded.employees && (
            <>
              <div className="flex items-center pl-12 py-2 text-sm text-slate-100  hover:bg-sidebar-accent/50 cursor-pointer">
                <Link
                  href="/employees/add"
                  className="w-full">
                  Add New Employee
                </Link>
              </div>
              <div className="flex items-center pl-12 py-2 text-sm text-slate-100 hover:bg-sidebar-accent/50 cursor-pointer">
                <Link
                  href="/employees"
                  className="w-full">
                  Employee List
                </Link>
              </div>
            </>
          )}
        </SidebarSection>
      </div>
    </aside>
  );
}
