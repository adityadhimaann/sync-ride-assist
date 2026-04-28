import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  signOut,
  updateProfile,
  type User,
  type ConfirmationResult,
} from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { assertFirebaseConfigured, auth, googleProvider } from "@/lib/firebase";
import { getUserProfile, logUserActivity, saveUserProfile, type UserActivity, type UserProfile } from "@/lib/database";

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

type WindowWithRecaptcha = Window & {
  recaptchaVerifier?: RecaptchaVerifier | null;
};

const getAuthErrorMessage = (error: unknown) => {
  const rawMessage = error instanceof Error ? error.message : "";

  if (
    rawMessage.toLowerCase().includes("deleted_client") ||
    rawMessage.toLowerCase().includes("oauth client was deleted")
  ) {
    return "Google sign-in is misconfigured: the OAuth client for this Firebase project was deleted. Re-enable the Google provider in Firebase Console or recreate the Web OAuth client.";
  }

  if (!(error instanceof FirebaseError)) {
    return rawMessage || "Authentication failed. Please try again.";
  }

  switch (error.code) {
    case "auth/invalid-api-key":
    case "auth/invalid-auth-domain":
    case "auth/configuration-not-found":
      return "Firebase authentication is not configured correctly. Check your .env values and Firebase console settings.";
    case "auth/unauthorized-domain":
      return "This domain is not authorized for Firebase sign-in. Add it in Firebase Console > Authentication > Settings > Authorized domains.";
    case "auth/popup-closed-by-user":
      return "Google sign-in was closed before it finished.";
    case "auth/operation-not-allowed":
      return "This sign-in method is disabled. Enable it in Firebase Console > Authentication > Sign-in method.";
    case "auth/account-exists-with-different-credential":
      return "An account already exists with this email using a different sign-in method.";
    case "auth/email-already-in-use":
      return "This email is already registered. Please sign in instead.";
    case "auth/invalid-credential":
    case "auth/user-not-found":
    case "auth/wrong-password":
      return "Invalid email or password.";
    case "auth/weak-password":
      return "Password should be at least 6 characters.";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait and try again.";
    case "auth/missing-phone-number":
    case "auth/invalid-phone-number":
      return "Please enter a valid phone number with country code.";
    case "auth/code-expired":
      return "The OTP has expired. Please request a new one.";
    case "auth/invalid-verification-code":
      return "Invalid OTP. Please check the code and try again.";
    default:
      return error.message || "Authentication failed. Please try again.";
  }
};

const throwFriendlyAuthError = (error: unknown): never => {
  throw new Error(getAuthErrorMessage(error));
};

const saveProfileWithoutBlockingAuth = async (uid: string, profile: UserProfile) => {
  try {
    const existingProfile = await getUserProfile(uid);
    await saveUserProfile(uid, {
      ...existingProfile,
      ...profile,
      createdAt: existingProfile?.createdAt || profile.createdAt,
    });
  } catch (error) {
    // Auth should still succeed even if database rules/config temporarily block profile writes.
    console.warn("User authenticated, but profile could not be saved:", error);
  }
};

const logActivityWithoutBlocking = async (uid: string, activity: Omit<UserActivity, "createdAt">) => {
  try {
    await logUserActivity(uid, activity);
  } catch (error) {
    console.warn("User authenticated, but activity could not be logged:", error);
  }
};

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

  useEffect(() => {
    getRedirectResult(auth)
      .then((credential) => {
        if (!credential?.user) return;
        return saveProfileWithoutBlockingAuth(credential.user.uid, {
          name: credential.user.displayName || "User",
          email: credential.user.email || "",
          phone: credential.user.phoneNumber || "",
          createdAt: Date.now(),
        }).then(() => logActivityWithoutBlocking(credential.user.uid, {
          type: "auth",
          title: "Signed in with Google",
          description: "Your account session was restored using Google sign-in.",
        }));
      })
      .catch((error) => {
        console.warn("Google redirect sign-in failed:", getAuthErrorMessage(error));
      });
  }, []);

  const login = async (email: string, password: string) => {
    assertFirebaseConfigured();
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      await logActivityWithoutBlocking(credential.user.uid, {
        type: "auth",
        title: "Signed in",
        description: "You signed in using email and password.",
      });
    } catch (error) {
      throwFriendlyAuthError(error);
    }
  };

  const signup = async (email: string, password: string, name: string, phone?: string) => {
    assertFirebaseConfigured();
    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      if (name.trim()) {
        await updateProfile(credential.user, { displayName: name.trim() });
      }
      await saveProfileWithoutBlockingAuth(credential.user.uid, {
        name: name.trim(),
        email,
        phone: phone || "",
        createdAt: Date.now(),
      });
      await logActivityWithoutBlocking(credential.user.uid, {
        type: "auth",
        title: "Account created",
        description: "Welcome to SyncRide. Your account dashboard is ready.",
      });
    } catch (error) {
      throwFriendlyAuthError(error);
    }
  };

  const loginWithGoogle = async () => {
    assertFirebaseConfigured();
    try {
      const credential = await signInWithPopup(auth, googleProvider);
      await saveProfileWithoutBlockingAuth(credential.user.uid, {
        name: credential.user.displayName || "User",
        email: credential.user.email || "",
        phone: credential.user.phoneNumber || "",
        createdAt: Date.now(),
      });
      await logActivityWithoutBlocking(credential.user.uid, {
        type: "auth",
        title: "Signed in with Google",
        description: "You signed in using your Google account.",
      });
    } catch (error) {
      if (
        error instanceof FirebaseError &&
        ["auth/popup-blocked", "auth/popup-closed-by-user", "auth/cancelled-popup-request"].includes(error.code)
      ) {
        await signInWithRedirect(auth, googleProvider);
        return;
      }
      throwFriendlyAuthError(error);
    }
  };

  const sendPhoneOtp = async (phoneNumber: string, recaptchaContainerId: string): Promise<ConfirmationResult> => {
    assertFirebaseConfigured();
    const recaptchaWindow = window as WindowWithRecaptcha;

    // Clear any previous recaptcha
    try {
      if (recaptchaWindow.recaptchaVerifier) {
        recaptchaWindow.recaptchaVerifier.clear();
        recaptchaWindow.recaptchaVerifier = null;
      }
    } catch (error) {
      console.warn("Unable to clear previous reCAPTCHA verifier:", error);
    }

    const recaptchaVerifier = new RecaptchaVerifier(auth, recaptchaContainerId, {
      size: "invisible",
    });

    recaptchaWindow.recaptchaVerifier = recaptchaVerifier;

    try {
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
      return confirmationResult;
    } catch (error) {
      recaptchaVerifier.clear();
      recaptchaWindow.recaptchaVerifier = null;
      throwFriendlyAuthError(error);
    }
  };

  const verifyPhoneOtp = async (confirmationResult: ConfirmationResult, otp: string) => {
    assertFirebaseConfigured();
    try {
      const credential = await confirmationResult.confirm(otp);
      await saveProfileWithoutBlockingAuth(credential.user.uid, {
        name: credential.user.displayName || "Phone User",
        email: credential.user.email || "",
        phone: credential.user.phoneNumber || "",
        createdAt: Date.now(),
      });
      await logActivityWithoutBlocking(credential.user.uid, {
        type: "auth",
        title: "Signed in with phone",
        description: "You verified your phone number with OTP.",
      });
    } catch (error) {
      throwFriendlyAuthError(error);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      throwFriendlyAuthError(error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, loginWithGoogle, sendPhoneOtp, verifyPhoneOtp, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
