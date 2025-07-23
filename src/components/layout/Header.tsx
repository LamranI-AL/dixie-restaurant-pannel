/** @format */
"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Menu,
  Search,
  Inbox,
  ShoppingCart,
  LogOut,
  User,
  Settings,
  Languages,
  Bell,
} from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import type { MouseEvent } from "react";

interface HeaderProps {
  toggleSidebar?: () => void;
}

export default function Header({ toggleSidebar }: HeaderProps) {
  const { currentUser, logout } = useAuth();
  const [notifications, setNotifications] = useState<number>(0);

  const handleLogout = async (e: MouseEvent<HTMLDivElement>): Promise<void> => {
    try {
      e.preventDefault();
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <header className="bg-slate-900 border-b border-yellow-900/20 sticky top-0 z-30 flex items-center justify-between px-4 py-3 shadow-md">
      <div className="flex items-center md:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="text-slate-200 hover:bg-slate-800 hover:text-yellow-400">
          <Menu className="h-6 w-6" />
        </Button>
      </div>

      <div className="flex-1 px-4 max-w-md mx-auto md:mx-0">
        <div className="relative">
          <Input
            type="text"
            placeholder="Rechercher..."
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-800/40 border-slate-700 text-slate-200 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/50 placeholder-slate-400"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-yellow-500" />
        </div>
      </div>

      <div className="flex items-center space-x-3">
        {/* <div className="relative">
          <Button
            variant="outline"
              size="sm"
            className="h-8 text-sm font-medium px-3 py-1.5 rounded-md flex items-center border-slate-700 bg-slate-800/40 text-slate-200 hover:bg-slate-800 hover:text-yellow-400 hover:border-yellow-500/50">
            <Languages className="h-4 w-4 mr-1.5" />
            <span>FR</span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="ml-1 text-yellow-500">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </Button>
        </div> */}

        <Button
          variant="ghost"
          size="icon"
          className="rounded-full text-slate-300 hover:bg-slate-800 hover:text-yellow-400 relative">
          <Inbox className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 bg-yellow-500 text-slate-900 rounded-full text-xs w-4 h-4 flex items-center justify-center font-semibold">
            0
          </span>
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="rounded-full text-slate-300 hover:bg-slate-800 hover:text-yellow-400 relative">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 bg-yellow-500 text-slate-900 rounded-full text-xs w-4 h-4 flex items-center justify-center font-semibold">
            {notifications}
          </span>
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="rounded-full text-slate-300 hover:bg-slate-800 hover:text-yellow-400">
          <ShoppingCart className="h-5 w-5" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center space-x-3 cursor-pointer p-1 rounded-full hover:bg-slate-800/70 transition-colors">
              <div className="flex flex-col items-end text-right hidden sm:block">
                <span className="text-sm  font-medium text-slate-200">
                  {currentUser?.displayName || "User"} ! Email :
                </span>
                <span className="text-xs text-yellow-500/90">
                  {currentUser?.email}
                </span>
              </div>
              <Avatar className="h-9 w-9 border-2 border-yellow-500/60 ring-2 ring-slate-800">
                <AvatarImage src={currentUser?.photoURL || ""} />
                <AvatarFallback className="bg-gradient-to-br from-yellow-500 to-amber-600 text-slate-900 font-semibold">
                  {(currentUser?.displayName || "U")[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-60 bg-slate-900 border border-slate-800 text-slate-200 shadow-xl shadow-black/20 rounded-lg overflow-hidden p-1">
            <DropdownMenuLabel className="text-yellow-500 font-semibold px-3 py-2">
              Mon Compte
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-slate-700" />
            <DropdownMenuItem className="hover:bg-slate-800 cursor-pointer rounded-md px-3 py-2 text-slate-300 focus:text-yellow-400 focus:bg-slate-800 hover:text-yellow-400">
              <User className="mr-2 h-4 w-4 text-yellow-500" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="hover:bg-slate-800 cursor-pointer rounded-md px-3 py-2 text-slate-300 focus:text-yellow-400 focus:bg-slate-800 hover:text-yellow-400">
              <Settings className="mr-2 h-4 w-4 text-yellow-500" />
              <span>Paramètres</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-slate-700" />
            <DropdownMenuItem
              onClick={handleLogout}
              className="hover:bg-red-900/30 cursor-pointer rounded-md px-3 py-2 text-slate-300 focus:text-red-400 focus:bg-red-900/20 hover:text-red-400">
              <LogOut className="mr-2 h-4 w-4 text-red-400" />
              <span>Déconnexion</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
