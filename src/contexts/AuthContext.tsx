import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  signOut,
  type User,
  type ConfirmationResult,
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { saveUserProfile } from "@/lib/database";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string, phone?: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  sendPhoneOtp: (phoneNumber: string, recaptchaContainerId: string) => Promise<ConfirmationResult>;
  verifyPhoneOtp: (confirmationResult: ConfirmationResult, otp: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signup = async (email: string, password: string, name: string, phone?: string) => {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    await saveUserProfile(credential.user.uid, {
      name,
      email,
      phone: phone || "",
      createdAt: Date.now(),
    });
  };

  const loginWithGoogle = async () => {
    const credential = await signInWithPopup(auth, googleProvider);
    await saveUserProfile(credential.user.uid, {
      name: credential.user.displayName || "User",
      email: credential.user.email || "",
      createdAt: Date.now(),
    });
  };

  const sendPhoneOtp = async (phoneNumber: string, recaptchaContainerId: string): Promise<ConfirmationResult> => {
    // Clear any previous recaptcha
    try {
      if ((window as any).recaptchaVerifier) {
        (window as any).recaptchaVerifier.clear();
        (window as any).recaptchaVerifier = null;
      }
    } catch (_) { }

    const recaptchaVerifier = new RecaptchaVerifier(auth, recaptchaContainerId, {
      size: "invisible",
    });

    (window as any).recaptchaVerifier = recaptchaVerifier;

    try {
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
      return confirmationResult;
    } catch (err) {
      recaptchaVerifier.clear();
      (window as any).recaptchaVerifier = null;
      throw err;
    }
  };

  const verifyPhoneOtp = async (confirmationResult: ConfirmationResult, otp: string) => {
    const credential = await confirmationResult.confirm(otp);
    // Save profile for phone user
    await saveUserProfile(credential.user.uid, {
      name: credential.user.displayName || "Phone User",
      email: credential.user.email || "",
      phone: credential.user.phoneNumber || "",
      createdAt: Date.now(),
    });
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, loginWithGoogle, sendPhoneOtp, verifyPhoneOtp, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
