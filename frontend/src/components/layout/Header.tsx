import { Bell, Search, User, Menu } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

interface HeaderProps {
  setSidebarOpen: (open: boolean) => void;
}

export function Header({ setSidebarOpen }: HeaderProps) {
  return (
    <div className="sticky top-0 z-40 flex h-16 lg:h-18 shrink-0 items-center gap-x-4 lg:gap-x-6 border-b border-purple-100 bg-white/80 backdrop-blur-lg px-4 lg:px-8 shadow-lg shadow-purple-100/50">
      {/* Mobile menu button with proper spacing */}
      <button
        type="button"
        className="-m-2 p-3 text-purple-600 lg:hidden hover:bg-purple-50 rounded-xl transition-all duration-200 hover:scale-105"
        onClick={() => setSidebarOpen(true)}
      >
        <span className="sr-only">Open sidebar</span>
        <Menu className="h-6 w-6" aria-hidden="true" />
      </button>

      {/* Divider with proper height */}
      <div className="h-8 w-px bg-gradient-to-b from-purple-200 to-blue-200 lg:hidden" />

      <div className="flex flex-1 gap-x-4 lg:gap-x-8 self-stretch items-center">
        {/* Search bar with improved sizing */}
        <div className="relative flex flex-1 max-w-sm lg:max-w-lg">
          <div className="absolute inset-y-0 left-0 flex items-center justify-center pl-4 pointer-events-none">
            <Search className="h-5 w-5 text-purple-400" />
          </div>
          <Input
            placeholder="Search forms..."
            className="pl-12 w-full h-11 border-purple-200 focus:border-purple-400 focus:ring-purple-300 bg-purple-50/50 rounded-xl text-base"
          />
        </div>
        
        {/* Action buttons with improved spacing */}
        <div className="flex items-center gap-x-3 lg:gap-x-5">
          {/* Notifications with better sizing */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative h-11 w-11 rounded-xl hover:bg-purple-50 text-purple-600 hover:text-purple-700 transition-all duration-200"
          >
            <Bell className="h-5 w-5" />
            <span className="sr-only">View notifications</span>
            {/* Enhanced notification badge */}
            <span className="absolute -top-1 -right-1 block h-3 w-3 rounded-full bg-gradient-to-r from-pink-400 to-red-400 ring-2 ring-white animate-pulse shadow-sm" />
          </Button>

          {/* Divider with proper sizing */}
          <div className="hidden lg:block h-8 w-px bg-gradient-to-b from-purple-200 to-blue-200" />

          {/* User menu with improved sizing */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-11 w-11 rounded-xl hover:bg-purple-50 p-0">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center ring-2 ring-purple-200 hover:ring-purple-300 transition-all duration-200 shadow-sm">
                  <User className="h-5 w-5 text-white" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 lg:w-64 border-purple-200 shadow-xl shadow-purple-100/50 mt-2" align="end">
              <DropdownMenuLabel className="font-normal p-4">
                <div className="flex flex-col space-y-2">
                  <p className="text-base font-medium leading-none text-purple-700">Piyush</p>
                  <p className="text-sm leading-none text-purple-500">
                    tyagipiyush812@gmail.com
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-purple-100" />
              <DropdownMenuItem className="text-base py-3 px-4 hover:bg-purple-50 text-purple-600">Profile</DropdownMenuItem>
              <DropdownMenuItem className="text-base py-3 px-4 hover:bg-purple-50 text-purple-600">Settings</DropdownMenuItem>
              <DropdownMenuItem className="text-base py-3 px-4 hover:bg-purple-50 text-purple-600">Support</DropdownMenuItem>
              <DropdownMenuSeparator className="bg-purple-100" />
              <DropdownMenuItem className="text-base py-3 px-4 text-red-600 hover:bg-red-50">Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}