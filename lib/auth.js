'use client';

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  ClerkProvider,
  useUser as useClerkUser,
  useClerk as useClerkInstance,
  SignInButton as ClerkSignInButton,
} from "@clerk/nextjs";

export const hasClerkKey = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.startsWith("pk_") &&
  !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.includes("...")
);

const UnifiedAuthContext = createContext({
  user: null,
  isSignedIn: false,
  isLoaded: true,
  signOut: () => {},
  openLoginModal: () => {},
});

const DEFAULT_USER = {
  id: "user_prayash",
  fullName: "Prayash Pradhan",
  firstName: "Prayash",
  primaryEmailAddress: { emailAddress: "prayash11pradhan@gmail.com" },
  imageUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80",
};

// Bridge component rendered INSIDE ClerkProvider when Clerk is active
function ClerkBridge({ children }) {
  const clerkUser = useClerkUser();
  const clerkInstance = useClerkInstance();

  return (
    <UnifiedAuthContext.Provider
      value={{
        user: clerkUser.user,
        isSignedIn: clerkUser.isSignedIn,
        isLoaded: clerkUser.isLoaded,
        signOut: () => clerkInstance.signOut(),
        openLoginModal: () => clerkInstance.openSignIn(),
      }}
    >
      {children}
    </UnifiedAuthContext.Provider>
  );
}

// Local / Demo provider for development mode without Clerk keys
function LocalAuthProvider({ children }) {
  const [user, setUser] = useState(DEFAULT_USER);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("gocart_demo_user");
      if (saved) {
        setUser(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
    setIsLoaded(true);
  }, []);

  const signIn = (customUser) => {
    const u = customUser || DEFAULT_USER;
    setUser(u);
    try {
      localStorage.setItem("gocart_demo_user", JSON.stringify(u));
    } catch {}
    setShowLoginModal(false);

    fetch("/api/user/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: u.id,
        name: u.fullName,
        email: u.primaryEmailAddress.emailAddress,
        image: u.imageUrl,
      }),
    }).catch(console.error);
  };

  const signOut = () => {
    setUser(null);
    try {
      localStorage.removeItem("gocart_demo_user");
    } catch {}
  };

  return (
    <UnifiedAuthContext.Provider
      value={{
        user,
        isSignedIn: Boolean(user),
        isLoaded,
        signOut,
        openLoginModal: () => setShowLoginModal(true),
      }}
    >
      {children}

      {showLoginModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl border border-slate-100">
            <h2 className="text-xl font-semibold text-slate-800">Sign In to GoCart</h2>
            <p className="text-xs text-slate-500 mt-1 mb-5">
              Select an account to continue:
            </p>

            <div className="space-y-3">
              <button
                onClick={() => signIn(DEFAULT_USER)}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-slate-800 transition text-left"
              >
                <img
                  src={DEFAULT_USER.imageUrl}
                  className="w-9 h-9 rounded-full"
                  alt=""
                />
                <div>
                  <p className="font-medium text-sm text-slate-800">{DEFAULT_USER.fullName}</p>
                  <p className="text-xs text-slate-500">{DEFAULT_USER.primaryEmailAddress.emailAddress}</p>
                </div>
              </button>

              <button
                onClick={() =>
                  signIn({
                    id: "user_buyer",
                    fullName: "Alex Buyer",
                    firstName: "Alex",
                    primaryEmailAddress: { emailAddress: "alex@example.com" },
                    imageUrl:
                      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80",
                  })
                }
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-slate-800 transition text-left"
              >
                <img
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80"
                  className="w-9 h-9 rounded-full"
                  alt=""
                />
                <div>
                  <p className="font-medium text-sm text-slate-800">Alex Buyer</p>
                  <p className="text-xs text-slate-500">alex@example.com</p>
                </div>
              </button>
            </div>

            <button
              onClick={() => setShowLoginModal(false)}
              className="mt-5 w-full py-2 text-xs text-slate-500 hover:text-slate-800"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </UnifiedAuthContext.Provider>
  );
}

// Unified Hooks
export function useUser() {
  const { user, isSignedIn, isLoaded } = useContext(UnifiedAuthContext);
  return { user, isSignedIn, isLoaded };
}

export function useClerk() {
  const { signOut, openLoginModal } = useContext(UnifiedAuthContext);
  return {
    signOut,
    openSignIn: openLoginModal,
  };
}

export function SignInButton({ children, ...props }) {
  const { openLoginModal } = useContext(UnifiedAuthContext);

  if (hasClerkKey) {
    return <ClerkSignInButton {...props}>{children}</ClerkSignInButton>;
  }

  return (
    <span
      onClick={() => openLoginModal()}
      className="cursor-pointer inline-block"
    >
      {children}
    </span>
  );
}

// Root Provider
export function AppAuthProvider({ children }) {
  if (hasClerkKey) {
    return (
      <ClerkProvider>
        <ClerkBridge>{children}</ClerkBridge>
      </ClerkProvider>
    );
  }
  return <LocalAuthProvider>{children}</LocalAuthProvider>;
}
