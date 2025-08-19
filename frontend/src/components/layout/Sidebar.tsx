import { Fragment } from "react";
import { NavLink } from "react-router-dom";
import { Dialog, Transition } from "@headlessui/react";
import {
  LayoutDashboard,
  FileText,
  BarChart3,
  Settings,
  PlusCircle,
  X,
} from "lucide-react";
import logo from "../../assets/logo.png";
import { cn } from "../../lib/utils";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Forms", href: "/forms", icon: FileText },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
];

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export function Sidebar({ sidebarOpen, setSidebarOpen }: SidebarProps) {
  return (
    <>
      {/* Mobile sidebar */}
      <Transition.Root show={sidebarOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50 lg:hidden"
          onClose={setSidebarOpen}
        >
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gradient-to-br from-purple-900/80 to-blue-900/80 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                <Transition.Child
                  as={Fragment}
                  enter="ease-in-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                    <button
                      type="button"
                      className="-m-2.5 p-2.5"
                      onClick={() => setSidebarOpen(false)}
                    >
                      <span className="sr-only">Close sidebar</span>
                      <X className="h-6 w-6 text-white" aria-hidden="true" />
                    </button>
                  </div>
                </Transition.Child>
                <SidebarContent />
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <SidebarContent />
      </div>
    </>
  );
}

function SidebarContent() {
  return (
    <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gradient-to-b from-purple-200 to-blue-200 bg-gradient-to-b from-white to-purple-50/30 px-4 sm:px-6 pb-4 shadow-xl">
      <div className="flex h-14 sm:h-16 shrink-0 items-center cursor-pointer"
      onClick={()=> window.scrollTo(0, 0)}>
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-xl flex items-center justify-center">
            <img src={logo} alt="logo" />
          </div>
          <span className="ml-2 text-lg sm:text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            FormBuilder
          </span>
        </div>
      </div>

      <nav className="flex flex-1 flex-col">
        <ul role="list" className="flex flex-1 flex-col gap-y-6 sm:gap-y-7">
          <li>
            <NavLink
              to="/forms/new"
              className="group flex gap-x-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-3 text-sm font-semibold text-white hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 transform"
            >
              <PlusCircle className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
              Create New Form
            </NavLink>
          </li>

          <li>
            <ul role="list" className="-mx-2 space-y-2">
              {navigation.map((item) => (
                <li key={item.name}>
                  <NavLink
                    to={item.href}
                    className={({ isActive }) =>
                      cn(
                        "group flex gap-x-3 rounded-xl px-3 py-2.5 text-sm leading-6 font-semibold transition-all duration-200",
                        isActive
                          ? "bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 shadow-md border border-purple-200"
                          : "text-gray-600 hover:text-purple-600 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 hover:shadow-sm"
                      )
                    }
                  >
                    <item.icon
                      className={cn(
                        "h-4 w-4 sm:h-5 sm:w-5 shrink-0 transition-colors",
                        // Add different colors for each icon
                        item.name === "Dashboard" && "text-blue-500",
                        item.name === "Forms" && "text-purple-500",
                        item.name === "Analytics" && "text-green-500",
                        item.name === "Settings" && "text-orange-500"
                      )}
                    />
                    {item.name}
                  </NavLink>
                </li>
              ))}
            </ul>
          </li>
        </ul>
      </nav>
    </div>
  );
}
