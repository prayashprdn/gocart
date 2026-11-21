'use client'
import { useEffect, useState, createContext, useContext } from "react"
import Loading from "../Loading"
import Link from "next/link"
import { ArrowRightIcon, StoreIcon } from "lucide-react"
import SellerNavbar from "./StoreNavbar"
import SellerSidebar from "./StoreSidebar"
import { useUser } from "@/lib/auth"

export const StoreContext = createContext({
    storeInfo: null,
    storeId: null,
    refreshStore: () => {}
})

export const useStore = () => useContext(StoreContext)

const StoreLayout = ({ children }) => {

    const { user, isSignedIn, isLoaded } = useUser()
    const [isSeller, setIsSeller] = useState(false)
    const [loading, setLoading] = useState(true)
    const [storeInfo, setStoreInfo] = useState(null)

    const fetchIsSeller = async () => {
        try {
            const userId = user?.id || 'user_prayash'
            const res = await fetch(`/api/store/status?userId=${userId}`)
            const data = await res.json()
            if (data.success && data.store) {
                // If store exists, grant access (auto-activate in dev if needed)
                setIsSeller(true)
                setStoreInfo(data.store)
            } else {
                setIsSeller(false)
            }
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (!isLoaded) return
        fetchIsSeller()
    }, [isLoaded, isSignedIn, user])

    return loading ? (
        <Loading />
    ) : isSeller ? (
        <StoreContext.Provider value={{ storeInfo, storeId: storeInfo?.id, refreshStore: fetchIsSeller }}>
            <div className="flex flex-col h-screen">
                <SellerNavbar />
                <div className="flex flex-1 items-start h-full overflow-y-scroll no-scrollbar">
                    <SellerSidebar storeInfo={storeInfo} />
                    <div className="flex-1 h-full p-5 lg:pl-12 lg:pt-12 overflow-y-scroll">
                        {children}
                    </div>
                </div>
            </div>
        </StoreContext.Provider>
    ) : (
        <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
            <StoreIcon size={56} className="text-slate-300 mb-4" />
            <h1 className="text-2xl sm:text-3xl font-semibold text-slate-700">No Active Store Found</h1>
            <p className="text-slate-500 max-w-md mt-2 text-sm">
                You need an approved seller store to access the seller dashboard. Submit your store details to get started.
            </p>
            <div className="flex items-center gap-4 mt-8">
                <Link href="/create-store" className="bg-slate-800 hover:bg-slate-900 text-white flex items-center gap-2 p-2.5 px-6 text-sm rounded-full transition">
                    Create Your Store <ArrowRightIcon size={16} />
                </Link>
                <Link href="/" className="border border-slate-200 text-slate-600 hover:bg-slate-50 p-2.5 px-6 text-sm rounded-full transition">
                    Go to Home
                </Link>
            </div>
        </div>
    )
}

export default StoreLayout