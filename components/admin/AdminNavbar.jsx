'use client'
import Link from "next/link"
import { useUser, useClerk } from "@/lib/auth"
import Image from "next/image"

const AdminNavbar = () => {
    const { user } = useUser()
    const { signOut } = useClerk()

    return (
        <div className="flex items-center justify-between px-12 py-3 border-b border-slate-200 transition-all">
            <Link href="/" className="relative text-4xl font-semibold text-slate-700">
                <span className="text-green-600">go</span>cart<span className="text-green-600 text-5xl leading-0">.</span>
                <p className="absolute text-xs font-semibold -top-1 -right-13 px-3 p-0.5 rounded-full flex items-center gap-2 text-white bg-green-500">
                    Admin
                </p>
            </Link>
            <div className="flex items-center gap-3">
                {user?.imageUrl && <img src={user.imageUrl} alt="" className="w-8 h-8 rounded-full object-cover" />}
                <p className="text-slate-600 text-sm">Hi, {user?.firstName ?? 'Admin'}</p>
                <button onClick={() => signOut()} className="text-xs text-red-500 hover:underline">Sign Out</button>
            </div>
        </div>
    )
}

export default AdminNavbar