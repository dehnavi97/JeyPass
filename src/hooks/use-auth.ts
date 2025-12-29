"use client";

import { useContext } from "react";
import { AuthContext } from "@/contexts/auth-provider";

/**
 * Provides access to the authentication state and methods.
 *
 * @example
 * ```tsx
 * const { isAuthenticated, login, logout } = useAuth();
 * ```
 */
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
      throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
