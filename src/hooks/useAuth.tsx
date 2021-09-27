import { useRouter } from "next/router";
import React, { useContext, createContext, useState, useEffect } from "react";
import { api } from "../services/api";
import { setCookie, parseCookies, destroyCookie } from "nookies";

export interface SignInCredentials {
  email: string;
  password: string;
}

interface User {
  email: string;
  permissions: string[];
  refreshToken: string;
  token: string;
  roles: string[];
}

interface AuthContextData {
  user: User | null;
  isAuthenticated: boolean;
  signIn: (credentials: SignInCredentials) => Promise<void>;
}

const AuthContext = createContext({} as AuthContextData);

export const AuthProvider: React.FC = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const isAuthenticated = Boolean(user);

  const router = useRouter();

  async function signIn(credentials: SignInCredentials) {
    try {
      const {
        data
      } = await api.post<User>("/sessions", credentials);

      setUser({
        ...data,
        email: credentials.email
      });

      setCookie(undefined, "@dashgo.token", data.token, {
        maxAge: 60*60*24*30,
        path: '/'
      });

      setCookie(undefined, "@dashgo.refreshToken", data.refreshToken, {
        maxAge: 60*60*24*30,
        path: '/'
      });

      api.defaults.headers['Authorization'] = `Bearer ${data.token}`

      router.push("/dashboard");
    } catch (error) {
    }
  }

  useEffect(() => {
    const cookies = parseCookies();
    const token = cookies["@dashgo.token"];

    if (token) {
      api
        .get("/me")
        .then(response => {   
          setUser({
            ...response.data,
            token
          });

          if (router.asPath === "/") {
            router.push("/dashboard");
          }          
        }).catch(() => {
          setUser(null);    
          destroyCookie(undefined, "@dashgo.token")
          destroyCookie(undefined, "@dashgo.refreshToken")
      
          router.push("/");
        })
    } else {
      router.push("/");
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        signIn
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);;
}
