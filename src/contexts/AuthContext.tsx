import React, { createContext, useContext, useEffect, useState } from 'react';
import { SCOPES, DISCOVERY_DOCS, type UserProfile } from '../lib/google';

// Define the window types for Google Identity Services
interface TokenClient {
    requestAccessToken: (overrides?: { prompt?: string }) => void;
}

declare global {
    interface Window {
        google: {
            accounts: {
                oauth2: {
                    initTokenClient: (config: any) => TokenClient;
                    revoke: (accessToken: string, done: () => void) => void;
                };
            };
        };
        gapi: any;
    }
}

interface AuthContextType {
    user: UserProfile | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: () => void;
    logout: () => void;
    token: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [tokenClient, setTokenClient] = useState<TokenClient | null>(null);
    const [gapiInited, setGapiInited] = useState(false);
    const [gisInited, setGisInited] = useState(false);

    // Load scripts
    useEffect(() => {
        const loadGapi = () => {
            const script = document.createElement('script');
            script.src = 'https://apis.google.com/js/api.js';
            script.onload = () => {
                window.gapi.load('client', async () => {
                    await window.gapi.client.init({
                        discoveryDocs: DISCOVERY_DOCS,
                    });
                    setGapiInited(true);
                });
            };
            document.body.appendChild(script);
        };

        const loadGis = () => {
            const script = document.createElement('script');
            script.src = 'https://accounts.google.com/gsi/client';
            script.onload = () => {
                setGisInited(true);
            };
            document.body.appendChild(script);
        };

        loadGapi();
        loadGis();
    }, []);

    // Initialize Token Client once scripts are loaded
    useEffect(() => {
        if (gisInited && gapiInited) {
            // Need Client ID from enviroment
            // We will prompt user if missing, but let's assume it's in .env for now
            const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

            if (!clientId) {
                console.error("Google Client ID is missing");
                setIsLoading(false);
                return;
            }

            const client = window.google.accounts.oauth2.initTokenClient({
                client_id: clientId,
                scope: SCOPES,
                callback: async (resp: any) => {
                    if (resp.error) {
                        throw resp;
                    }
                    setToken(resp.access_token);

                    // Fetch user profile
                    // Since we don't have the 'profile' scope/OIDC here necessarily nicely without backend,
                    // we can use the Drive API 'about' or just People API if added.
                    // For simplicity, let's assume we can get email from People API if we add 'profile' scope.
                    // Or just use the token to fetch info from 'https://www.googleapis.com/oauth2/v3/userinfo'

                    try {
                        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                            headers: { Authorization: `Bearer ${resp.access_token}` }
                        });
                        const userInfo = await userInfoResponse.json();
                        setUser({
                            name: userInfo.name,
                            email: userInfo.email,
                            photoUrl: userInfo.picture
                        });
                    } catch (e) {
                        console.error(e);
                    }
                },
            });
            setTokenClient(client);

            // Check for existing token in localStorage? 
            // GIS tokens expire, so better to just clear or re-prompt silently if possible.
            // For this MVP, we start fresh or rely on session storage if we wanted persistence.
            setIsLoading(false);
        }
    }, [gisInited, gapiInited]);

    const login = () => {
        tokenClient?.requestAccessToken();
    };

    const logout = () => {
        const token = window.gapi.client.getToken();
        if (token !== null) {
            window.google.accounts.oauth2.revoke(token.access_token, () => { });
            window.gapi.client.setToken('');
            setUser(null);
            setToken(null);
        }
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout, token }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
