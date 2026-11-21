'use client'
import { Search, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useUser, useClerk, SignInButton } from "@/lib/auth";
import Image from "next/image";

const Navbar = () => {

    const router = useRouter();
    const { user, isSignedIn } = useUser();
    const { signOut } = useClerk();
    const [search, setSearch] = useState('')
    const [menuOpen, setMenuOpen] = useState(false)
    const cartCount = useSelector(state => state.cart.total)

    // Sync Clerk user into our DB on first sign-in
    useEffect(() => {
        if (isSignedIn && user) {
            fetch('/api/user/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: user.id,
                    name: user.fullName,
                    email: user.primaryEmailAddress?.emailAddress,
                    image: user.imageUrl,
                }),
            })
        }
    }, [isSignedIn, user])

    const handleSearch = (e) => {
        e.preventDefault()
        router.push(`/shop?search=${search}`)
    }

    return (
        <nav className="relative bg-white">
            <div className="mx-6">
                <div className="flex items-center justify-between max-w-7xl mx-auto py-4  transition-all">

                    <Link href="/" className="relative text-4xl font-semibold text-slate-700">
                        <span className="text-green-600">go</span>cart<span className="text-green-600 text-5xl leading-0">.</span>
                        <p className="absolute text-xs font-semibold -top-1 -right-8 px-3 p-0.5 rounded-full flex items-center gap-2 text-white bg-green-500">
                            plus
                        </p>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden sm:flex items-center gap-4 lg:gap-8 text-slate-600">
                        <Link href="/">Home</Link>
                        <Link href="/shop">Shop</Link>
                        <Link href="/">About</Link>
                        <Link href="/">Contact</Link>

                        <form onSubmit={handleSearch} className="hidden xl:flex items-center w-xs text-sm gap-2 bg-slate-100 px-4 py-3 rounded-full">
                            <Search size={18} className="text-slate-600" />
                            <input className="w-full bg-transparent outline-none placeholder-slate-600" type="text" placeholder="Search products" value={search} onChange={(e) => setSearch(e.target.value)} required />
                        </form>

                        <Link href="/cart" className="relative flex items-center gap-2 text-slate-600">
                            <ShoppingCart size={18} />
                            Cart
                            <button className="absolute -top-1 left-3 text-[8px] text-white bg-slate-600 size-3.5 rounded-full">{cartCount}</button>
                        </Link>

                        {isSignedIn && user ? (
                            <div className="relative">
                                <button onClick={() => setMenuOpen(o => !o)} className="flex items-center gap-2 focus:outline-none">
                                    {user.imageUrl ? (
                                        <img src={user.imageUrl} alt={user.fullName || "User"} className="w-8 h-8 rounded-full border border-slate-200 object-cover" />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-slate-700 text-white flex items-center justify-center text-xs font-semibold">
                                            {user.fullName?.charAt(0) || "U"}
                                        </div>
                                    )}
                                </button>
                                {menuOpen && (
                                    <div className="absolute right-0 mt-2 w-44 bg-white border border-slate-200 rounded-lg shadow-lg z-50 py-1 text-sm text-slate-700">
                                        <div className="px-4 py-2 border-b border-slate-100">
                                            <p className="font-medium text-xs truncate text-slate-800">{user.fullName}</p>
                                            <p className="text-[10px] text-slate-400 truncate">{user.primaryEmailAddress?.emailAddress}</p>
                                        </div>
                                        <Link href="/orders" onClick={() => setMenuOpen(false)} className="block px-4 py-2 hover:bg-slate-50">My Orders</Link>
                                        <Link href="/create-store" onClick={() => setMenuOpen(false)} className="block px-4 py-2 hover:bg-slate-50">Become a Seller</Link>
                                        <Link href="/store" onClick={() => setMenuOpen(false)} className="block px-4 py-2 hover:bg-slate-50 text-emerald-600 font-medium">Seller Dashboard</Link>
                                        <button onClick={() => { signOut(); setMenuOpen(false) }} className="w-full text-left px-4 py-2 hover:bg-slate-50 text-red-500">Sign Out</button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <SignInButton mode="modal">
                                <button className="px-8 py-2 bg-indigo-500 hover:bg-indigo-600 transition text-white rounded-full">
                                    Login
                                </button>
                            </SignInButton>
                        )}
                    </div>

                    {/* Mobile User Button  */}
                    <div className="sm:hidden">
                        {isSignedIn ? (
                            <button onClick={() => signOut()} className="px-5 py-1.5 bg-red-500 hover:bg-red-600 text-sm transition text-white rounded-full">
                                Sign Out
                            </button>
                        ) : (
                            <SignInButton mode="modal">
                                <button className="px-7 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-sm transition text-white rounded-full">
                                    Login
                                </button>
                            </SignInButton>
                        )}
                    </div>
                </div>
            </div>
            <hr className="border-gray-300" />
        </nav>
    )
}

export default Navbar