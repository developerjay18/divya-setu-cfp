"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = (path: string) => {
    return pathname === path
      ? "bg-indigo-600 text-white px-3 py-2 rounded-md text-sm font-medium"
      : "text-gray-800 hover:bg-indigo-500 hover:text-white px-3 py-2 rounded-md text-sm font-medium";
  };

  return (
    <nav className="bg-white shadow">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex">
            <div className="flex flex-shrink-0 items-center">
              <Link href="/" className="text-xl font-bold text-indigo-600">
                Divya Setu
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
              <Link href="/" className={isActive("/")}>
                Home
              </Link>
              <Link href="/fundraisers" className={isActive("/fundraisers")}>
                Fundraisers
              </Link>
              {session && (
                <Link href="/dashboard" className={isActive("/dashboard")}>
                  Dashboard
                </Link>
              )}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {!session ? (
              <div className="flex items-center space-x-4">
                <Link
                  href="/auth/login"
                  className="text-gray-800 hover:text-indigo-600"
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2 rounded-md text-sm font-medium"
                >
                  Register
                </Link>
              </div>
            ) : (
              <div className="relative ml-3">
                <div className="flex items-center space-x-4">
                  <span className="text-gray-800">
                    Hi, {session.user.name}
                  </span>
                  <button
                    onClick={() => signOut()}
                    className="text-gray-800 hover:text-indigo-600"
                  >
                    Logout
                  </button>
                  {session.user.image && (
                    <div className="h-8 w-8 overflow-hidden rounded-full">
                      <Image
                        src={session.user.image}
                        alt="Profile"
                        width={32}
                        height={32}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-800"
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className="block h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="sm:hidden">
          <div className="space-y-1 px-2 pb-3 pt-2">
            <Link
              href="/"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-800 hover:bg-indigo-500 hover:text-white"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/fundraisers"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-800 hover:bg-indigo-500 hover:text-white"
              onClick={() => setIsMenuOpen(false)}
            >
              Fundraisers
            </Link>
            {session && (
              <Link
                href="/dashboard"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-800 hover:bg-indigo-500 hover:text-white"
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
            )}
          </div>
          <div className="border-t border-gray-200 pb-3 pt-4">
            {!session ? (
              <div className="flex items-center justify-around">
                <Link
                  href="/auth/login"
                  className="block px-4 py-2 text-base font-medium text-gray-800 hover:text-indigo-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="block px-4 py-2 text-base font-medium bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Register
                </Link>
              </div>
            ) : (
              <div className="px-4 flex flex-col space-y-3">
                <div className="flex items-center">
                  {session.user.image && (
                    <div className="h-8 w-8 overflow-hidden rounded-full mr-3">
                      <Image
                        src={session.user.image}
                        alt="Profile"
                        width={32}
                        height={32}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                  <div className="text-sm font-medium text-gray-800">
                    {session.user.name}
                  </div>
                </div>
                <button
                  onClick={() => {
                    signOut();
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-base font-medium text-gray-800 hover:text-indigo-600"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
} 