import { Link } from "@tanstack/react-router";
import { Home, LogOut, Menu, User, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

export default function Header() {
	const [isOpen, setIsOpen] = useState(false);
	const { isAuthenticated, username, userId, logout } = useAuth();

	const handleLogout = () => {
		logout();
		setIsOpen(false);
		window.location.href = "/login";
	};

	return (
		<>
			<header className="p-4 flex items-center justify-between bg-white text-black shadow-md border-b border-black">
				<div className="flex items-center">
					<button
						type="button"
						onClick={() => setIsOpen(true)}
						className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
						aria-label="Open menu"
					>
						<Menu size={24} />
					</button>
					<h1 className="ml-4 text-2xl font-bold">
						<Link to="/">Fread</Link>
					</h1>
				</div>
				{isAuthenticated && username && (
					<div className="text-sm text-gray-600">@{username}</div>
				)}
			</header>

			<aside
				className={`fixed top-0 left-0 h-full w-80 bg-white text-black shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col border-r border-black ${
					isOpen ? "translate-x-0" : "-translate-x-full"
				}`}
			>
				<div className="flex items-center justify-between p-4 border-b border-black">
					<h2 className="text-xl font-bold">Menu</h2>
					<button
						type="button"
						onClick={() => setIsOpen(false)}
						className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
						aria-label="Close menu"
					>
						<X size={24} />
					</button>
				</div>

				<nav className="flex-1 p-4 overflow-y-auto">
					{isAuthenticated ? (
						<>
							<Link
								to="/"
								onClick={() => setIsOpen(false)}
								className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors mb-2"
								activeProps={{
									className:
										"flex items-center gap-3 p-3 rounded-lg bg-black text-white transition-colors mb-2",
								}}
							>
								<Home size={20} />
								<span className="font-medium">Home</span>
							</Link>

							<Link
								to="/feed"
								onClick={() => setIsOpen(false)}
								className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors mb-2"
								activeProps={{
									className:
										"flex items-center gap-3 p-3 rounded-lg bg-black text-white transition-colors mb-2",
								}}
							>
								<Home size={20} />
								<span className="font-medium">Feed</span>
							</Link>

							{userId && (
								<Link
									to="/profile/$id"
									params={{ id: userId }}
									onClick={() => setIsOpen(false)}
									className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors mb-2"
									activeProps={{
										className:
											"flex items-center gap-3 p-3 rounded-lg bg-black text-white transition-colors mb-2",
									}}
								>
									<User size={20} />
									<span className="font-medium">Profile</span>
								</Link>
							)}

							<button
								type="button"
								onClick={handleLogout}
								className="flex w-full items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors mt-4"
							>
								<LogOut size={20} />
								<span className="font-medium">Logout</span>
							</button>
						</>
					) : (
						<Link
							to="/login"
							onClick={() => setIsOpen(false)}
							className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors mb-2"
						>
							<User size={20} />
							<span className="font-medium">Login</span>
						</Link>
					)}
				</nav>
			</aside>
		</>
	);
}
