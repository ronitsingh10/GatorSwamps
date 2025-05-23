import React from "react";
import { Link } from "react-router-dom";
import Logo from "../assets/img/Logo2.jpeg";
import { useAuth } from "../hooks/useAuth";
import { LogOut } from "lucide-react";

const Header = () => {
  const { currentUser, logout, isAuthenticated } = useAuth();

  console.log(currentUser);
  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="py-6 mb-12 border-b">
      <div className="container mx-auto flex justify-between items-center px-0">
        {/*logo*/}
        <Link to="/">
          <img src={Logo} alt="" className="w-96"></img>
        </Link>
        {/* buttons */}
        <div className="flex items-center gap-6">
          {isAuthenticated && (
            <div className="flex items-center gap-5">
              <h1 className="text-xl font-semibold text-gray-700">
                Hello, {currentUser.firstName} {currentUser.lastName}
              </h1>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-md bg-red-500 hover:bg-red-600 text-white font-semibold transition-all"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          )}
          {/* <Link
            className="bg-violet-700 hover:bg-violet-800 text-white px-4 py-3 rounded-lg transition"
            to=""
          >
            GPT Powered Help Desk
          </Link> */}
          {/* 
          <button
            onClick={routeChange}
            class="flex select-none items-center gap-2 rounded-lg py-3 px-6 text-center align-middle font-sans text-sm font-bold uppercase text-zinc-700 transition-all hover:bg-zinc-700/10 active:bg-zinc-700/30 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
            type="button"
            data-ripple-dark="true"
          > */}
          {/* <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="2"
              stroke="currentColor"
              aria-hidden="true"
              class="h-5 w-5"
            > */}
          {/* <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3"
              ></path>
            </svg> */}
          {/* </button> */}
        </div>
      </div>
    </header>
  );
};

export default Header;
