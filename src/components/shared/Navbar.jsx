"use client";

import Image from "next/image";
import Link from "next/link";
import { FaHeart } from "react-icons/fa";
import { IoMdNotifications } from "react-icons/io";
import { formatDistanceToNow } from "date-fns";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react"; 
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";

import Logo from "./Logo";
import useAuth from "@/hooks/useAuth";
import useAxiosPublic from "@/hooks/useAxiosPublic";

const Navbar = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [desktopMenuOpen, setDesktopMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [favorites, setFavorites] = useState([]);

  const axiosPublic = useAxiosPublic();
  const router = useRouter();
  const { data: session, status } = useSession();
  const auth = useAuth();

  console.log("Session data from navbar:", session);
console.log("Auth data from navbar:", auth);
// sticky navbar
  const [isSticky, setIsSticky] = useState(false);

useEffect(() => {
  const handleScroll = () => {
    setIsSticky(window.scrollY > 80);
  };

  window.addEventListener("scroll", handleScroll);
  return () => window.removeEventListener("scroll", handleScroll);
}, []);

  // favorites count from localStorage
  const updateFavorites = () => {
    const storedFavorites = localStorage.getItem("favorites");
    const myFavorites = storedFavorites ? JSON.parse(storedFavorites) : [];
    setFavorites(myFavorites);
  };

  useEffect(() => {
    updateFavorites();
  }, []);

const handleSignOut = async () => {
    try {
      await signOut({ redirect: false }); // ✅ next-auth signOut
      toast.success("Sign Out Successfully");
      document.cookie =
        "myEmail=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;";
      router.push("/login");
    } catch (err) {
      toast.error("Failed to sign out");
    }
  }

  // notifications from backend
  const { data: notificationsAll = {} } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const { data } = await axiosPublic.get(
        `/user/${session?.user?.email}`
      );
      return data;
    },
    enabled: !!session?.user?.email,
    keepPreviousData: true,
  });

  const sortedNotifications =
    notificationsAll?.notifications
      ?.slice()
      .sort(
        (a,b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      ) || [];

  // mega menu data
  const subMenu1 = [
    { title: "Register", path: "/register" },
    { title: "Login", path: "/login" },
    { title: "All Events", path: "/events" },
  ];

  const subMenu2 = [
    { title: "About Us", path: "/about-us" },
    { title: "Contact Us", path: "/contact" },
    { title: "Video Call", path: "/video-call" },
  ];

  const subMenu3 = [
    { title: "Events", path: "/events" },
    { title: "Gift Card", path: "/gift-card" },
  ];

  const subMenu4 = [
    { title: "Offer Announcement", path: "/offer-announcement" },
    { title: "Request to Be Organizer", path: "/organizer-request" },
  ];

  const topNavMenu = [
    { title: "Home", path: "/" },
    { title: "All Events", path: "/events" },
    { title: "Community", path: "/community" },
    { title: "Messenger", path: "/messenger" },
    { title: "Contact", path: "/contact" },
    { title: "About", path: "/about-us" },
  ];

  const getDashboardLink = () => {
    if (auth?.data?.role === "user") {
      return `/dashboard/user-profile/${session?.user?.email}`;
    }
    if (auth?.data?.role === "organizer") {
      return "/dashboard/organizer-container";
    }
    return "/dashboard/admin-container";
  };

  return (
<nav
  className={`w-full z-50 transition-all duration-1000 ${
    isSticky
      ? "fixed top-0 left-0 backdrop-blur-xl bg-gradient-to-r from-[#1e3a8a]/95 via-[#2563eb]/95 to-[#38bdf8]/95 shadow-2xl border-b border-white/10"
      : "relative bg-gradient-to-r from-blue-400 via-blue-600 to-blue-300"
  }`}
>



      <div className="container mx-auto px-4 lg:px-8 py-2">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="block lg:hidden">
            <Link
              href="/"
              className="flex items-center hover:scale-105 duration-300"
            >
              <Image
                src="/asssets/images/logo-white.png"
                alt="logo"
                width={60}
                height={60}
                className="object-cover rounded-full"
              />
            </Link>
          </div>
          <div className="hidden lg:block">
            <Logo />
          </div>

          {/* Center nav links (desktop) */}
          <div className="hidden md:flex items-center gap-6 text-white">
            {topNavMenu.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className="hover:text-yellow-300 transition"
              >
                {item.title}
              </Link>
            ))}

            {/* Favorites */}
            <Link
              href="/favorite-list"
              onClick={updateFavorites}
              className="relative hover:text-yellow-300 transition"
              aria-label="Favorites"
            >
              <FaHeart size={22} />
              <span className="absolute -top-2 left-4 px-1 bg-red-500 text-xs rounded-full border border-white">
                {favorites?.length || 0}
              </span>
            </Link>

            {/* Notifications */}
            <button
              type="button"
              onClick={() => setIsNotificationOpen((prev) => !prev)}
              className="relative text-gray-100 hover:text-yellow-300 focus:outline-none"
              aria-label="Notifications"
            >
              <IoMdNotifications size={24} />
              {sortedNotifications.length > 0 && (
                <span className="absolute -top-1 left-3 flex items-center justify-center w-5 h-5 text-[10px] bg-red-500 text-white rounded-full border-2 border-white">
                  {sortedNotifications.length}
                </span>
              )}
            </button>

            {/* Notifications dropdown */}
            {isNotificationOpen && (
              <div className="absolute right-4 top-14 z-50 h-[360px] w-[320px] md:w-[360px] overflow-y-auto bg-white rounded-lg shadow-lg">
                <div className="px-4 py-2 font-semibold text-center text-gray-800 border-b">
                  Notifications
                </div>
                <div className="divide-y">
                  {sortedNotifications.length === 0 && (
                    <p className="px-4 py-6 text-center text-gray-500 text-sm">
                      No notifications found.
                    </p>
                  )}
                  {sortedNotifications.map((notification) => (
                    <Link
                      key={notification._id}
                      href={notification.route}
                      className="flex gap-3 px-4 py-3 hover:bg-gray-100"
                    >
                      <div className="relative flex-shrink-0">
                        <Image
                          src="https://i.ibb.co/Kzd0ZzJ/not.png"
                          alt="Notification"
                          width={44}
                          height={44}
                          className="w-11 h-11 rounded-full"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-700">
                          {notification.message}
                        </p>
                        <p className="mt-1 text-xs text-blue-600">
                          {notification.createdAt &&
                            `${formatDistanceToNow(
                              new Date(notification.createdAt)
                            )} ago`}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
                <button
                  type="button"
                  className="w-full py-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100"
                  onClick={() => setIsNotificationOpen(false)}
                >
                  Close
                </button>
              </div>
            )}
          </div>

          {/* Right: profile + mega menu trigger */}
          <div className="flex items-center gap-4">
            {/* Profile dropdown */}
            <div className="relative hidden md:block">
              <button
                type="button"
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2"
              >
                <Image
                  src={
                    session?.user?.image ||
                    "https://i.postimg.cc/cCdkf2bM/png-transparent-user-profile-computer-icons-login-user-avatars-thumbnail.png"
                  }
                  alt="Profile"
                  width={44}
                  height={44}
                  className="w-11 h-11 rounded-full border-2 border-white"
                />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-60 bg-white rounded-lg shadow-lg z-50">
                  <div className="px-4 py-3 border-b text-center">
                    <Image
                      src={
                        session?.user?.image ||
                        "https://i.postimg.cc/cCdkf2bM/png-transparent-user-profile-computer-icons-login-user-avatars-thumbnail.png"
                      }
                      alt="Profile"
                      width={80}
                      height={80}
                      className="w-20 h-20 rounded-full border"
                    />
                    <p className="mt-2 font-semibold text-gray-800">
                      {session?.user?.name || "User Name"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {session?.user?.email || "email@example.com"}
                    </p>
                  </div>

                  {status === "authenticated" && (
                    <Link
                      href={getDashboardLink()}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Dashboard
                    </Link>
                  )}

                  <Link
                    href="/gift-card"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Offer Announcement
                  </Link>

                  {status === "unauthenticated" ? (
                    <Link
                      href="/login"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Login
                    </Link>
                  ) : (
                    <button
                      type="button"
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={handleSignOut}
                    >
                      Logout
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Mega menu button (desktop + mobile) */}
            <button
              type="button"
              className="text-white focus:outline-none"
              onClick={() => setDesktopMenuOpen((prev) => !prev)}
              aria-label="Open main menu"
            >
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mega menu overlay */}
      <div
        className={`fixed left-0 w-full bg-[#1b85dbe0] text-white shadow-lg transition-transform duration-500 ease-in-out z-40 ${
          desktopMenuOpen ? "top-[60px] translate-y-0" : "-top-[800px] -translate-y-full"
        }`}
      >
        <div className="container mx-auto px-4 lg:px-8 py-4 grid grid-cols-12 gap-6">
          {/* Main columns */}
          <div className="col-span-12 md:col-span-9 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* Mobile quick menu */}
            <div className="block md:hidden">
              <p className="px-2 pb-2 font-bold">Menu</p>
              {topNavMenu.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className="block px-2 py-1 hover:text-yellow-300"
                  onClick={() => setDesktopMenuOpen(false)}
                >
                  {item.title}
                </Link>
              ))}
            </div>

            {/* Category 1 */}
            <div>
              <p className="px-2 pb-2 font-bold">Category 1</p>
              {subMenu1.map((menu) => (
                <Link
                  key={menu.path}
                  href={menu.path}
                  className="block px-2 py-1 hover:text-yellow-300"
                  onClick={() => setDesktopMenuOpen(false)}
                >
                  {menu.title}
                </Link>
              ))}
            </div>

            {/* Category 2 */}
            <div>
              <p className="px-2 pb-2 font-bold">Category 2</p>
              {subMenu2.map((menu) => (
                <Link
                  key={menu.path}
                  href={menu.path}
                  className="block px-2 py-1 hover:text-yellow-300"
                  onClick={() => setDesktopMenuOpen(false)}
                >
                  {menu.title}
                </Link>
              ))}
            </div>

            {/* Category 3 */}
            <div>
              <p className="px-2 pb-2 font-bold">Category 3</p>
              {subMenu3.map((menu) => (
                <Link
                  key={menu.path}
                  href={menu.path}
                  className="block px-2 py-1 hover:text-yellow-300"
                  onClick={() => setDesktopMenuOpen(false)}
                >
                  {menu.title}
                </Link>
              ))}
            </div>

            {/* Category 4 */}
            <div>
              <p className="px-2 pb-2 font-bold">Category 4</p>

              {status === "authenticated" && (
                <Link
                  href={getDashboardLink()}
                  className="block px-2 py-1 hover:text-yellow-300"
                  onClick={() => setDesktopMenuOpen(false)}
                >
                  Dashboard
                </Link>
              )}

              {subMenu4.map((menu) => (
                <Link
                  key={menu.path}
                  href={menu.path}
                  className="block px-2 py-1 hover:text-yellow-300"
                  onClick={() => setDesktopMenuOpen(false)}
                >
                  {menu.title}
                </Link>
              ))}
            </div>
          </div>

          {/* Right side: logo + CTA */}
          <div className="hidden md:flex md:col-span-3 flex-col items-start gap-4">
            <Logo />
            {status === "unauthenticated" ? (
              <Link
                href="/login"
                className="px-4 py-2 bg-[#10a0b9] rounded-full text-sm font-semibold hover:bg-[#0b7f92]"
                onClick={() => setDesktopMenuOpen(false)}
              >
                Login
              </Link>
            ) : (
              <button
                type="button"
                className="px-4 py-2 bg-[#10a0b9] rounded-full text-sm font-semibold hover:bg-[#0b7f92]"
                onClick={handleSignOut}
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
