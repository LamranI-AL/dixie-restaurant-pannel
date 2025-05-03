/** @format */
"use client";
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
} from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
// import { useAuth } from "@/context/AuthContext";

export default function Header() {
  const { currentUser, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30 flex items-center justify-between px-4 py-2">
      <div className="flex items-center md:hidden">
        <Button
          variant="ghost"
          size="icon"
          // onClick={toggleSidebar}
        >
          <Menu className="h-6 w-6 text-gray-600" />
        </Button>
      </div>

      <div className="flex-1 px-4 max-w-md mx-auto md:mx-0">
        <div className="relative">
          <Input
            type="text"
            placeholder="Search"
            className="w-full pl-10 pr-4 py-2 rounded-md bg-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <div className="relative">
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-sm font-medium px-2 py-1.5 rounded-md flex items-center">
            <span>fr</span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="ml-1">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </Button>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="rounded-full text-gray-600 hover:bg-gray-100">
          <Inbox className="h-5 w-5" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="rounded-full text-gray-600 hover:bg-gray-100">
          <ShoppingCart className="h-5 w-5" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center space-x-2 cursor-pointer">
              <div className="flex flex-col items-end text-right hidden sm:block">
                <span className="text-sm font-medium text-gray-700">
                  {currentUser?.displayName || "User"}
                </span>
                <span className="text-xs text-gray-500">
                  {currentUser?.email}
                </span>
              </div>
              <Avatar className="h-8 w-8 border border-gray-200">
                <AvatarImage src={currentUser?.photoURL || ""} />
                <AvatarFallback>
                  {(currentUser?.displayName || "U")[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
