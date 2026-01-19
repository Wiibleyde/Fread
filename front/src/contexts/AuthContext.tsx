import {
	createContext,
	useContext,
	useState,
	useEffect,
	useCallback,
	type ReactNode,
} from "react";
import { jwtDecode } from "jwt-decode";
import { storage } from "@/lib/storage";

interface JwtPayload {
	id: string;
	username: string;
	iat: number;
	exp: number;
}

interface AuthContextType {
	token: string | null;
	userId: string | null;
	username: string | null;
	isAuthenticated: boolean;
	login: (token: string) => void;
	logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
	const [token, setToken] = useState<string | null>(storage.getToken());
	const [userId, setUserId] = useState<string | null>(null);
	const [username, setUsername] = useState<string | null>(null);

	const logout = useCallback(() => {
		storage.clear();
		setToken(null);
		setUserId(null);
		setUsername(null);
	}, []);

	const login = useCallback((newToken: string) => {
		storage.setToken(newToken);
		setToken(newToken);
	}, []);

	useEffect(() => {
		if (token) {
			try {
				const decoded = jwtDecode<JwtPayload>(token);
				const now = Date.now() / 1000;

				if (decoded.exp < now) {
					logout();
				} else {
					setUserId(decoded.id);
					setUsername(decoded.username);
				}
			} catch (error) {
				console.error("Invalid token:", error);
				logout();
			}
		} else {
			setUserId(null);
			setUsername(null);
		}
	}, [token, logout]);

	return (
		<AuthContext.Provider
			value={{
				token,
				userId,
				username,
				isAuthenticated: !!token && !!userId,
				login,
				logout,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
};
