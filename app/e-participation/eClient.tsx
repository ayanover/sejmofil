'use client'

import { useState, useEffect } from 'react'
import { useSupabaseSession } from '../../lib/hooks/use-supabase-session'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import Loading from '../loading'
import Image from 'next/image'

export default function EPartycypacjaClient() {
    const { user } = useSupabaseSession()
    const [loading, setLoading] = useState(true)
    const [authData, setAuthData] = useState<any>(null)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        const authenticateWithBackend = async () => {
            if (!user) {
                setLoading(false)
                return
            }

            try {
                // Get session token from Supabase
                const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

                if (sessionError || !sessionData.session) {
                    throw new Error(sessionError?.message || 'Nie udało się pobrać sesji')
                }

                // Send token to your e-partycypacja backend
                const response = await fetch('http://localhost:8000/api/auth/verify/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ token: sessionData.session.access_token }),
                    credentials: 'include', // For cookies if you're using them
                })

                if (!response.ok) {
                    const errorData = await response.json()
                    throw new Error(errorData.error || 'Błąd autoryzacji z modułem')
                }

                const data = await response.json()
                setAuthData(data)

                // Store the module's tokens in sessionStorage (more secure than localStorage)
                sessionStorage.setItem('epartycypacja_access_token', data.access_token)
                sessionStorage.setItem('epartycypacja_refresh_token', data.refresh_token)
            } catch (err) {
                console.error('Błąd autoryzacji z modułem e-partycypacji:', err)
                setError(err instanceof Error ? err.message : 'Wystąpił nieznany błąd')
            } finally {
                setLoading(false)
            }
        }

        authenticateWithBackend()
    }, [user])

    const handleLogout = async () => {
        // Clear module tokens
        sessionStorage.removeItem('epartycypacja_access_token')
        sessionStorage.removeItem('epartycypacja_refresh_token')
        setAuthData(null)

        // Optionally logout from main Sejmofil
        // await supabase.auth.signOut()
        // router.push('/')
    }

    // Helper function to get badge color based on role
    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'admin':
                return 'bg-red-100 text-red-800'
            case 'expert':
                return 'bg-blue-100 text-blue-800'
            case 'organization':
                return 'bg-purple-100 text-purple-800'
            default:
                return 'bg-green-100 text-green-800'
        }
    }

    // Helper function to get badge color based on rank
    const getRankBadgeColor = (rank: string) => {
        switch (rank) {
            case 'expert':
                return 'bg-yellow-100 text-yellow-800'
            case 'active':
                return 'bg-indigo-100 text-indigo-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <Loading />
                </div>
        )
    }

    if (!user) {
        return (
            <div className="container mx-auto px-4 py-8">
            <div className="bg-white rounded-lg shadow-md p-6 max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold text-center mb-6">Moduł E-Partycypacja</h1>
        <div className="text-center p-8 border border-gray-200 rounded-md">
        <p className="mb-4">Aby korzystać z modułu E-Partycypacja, musisz być zalogowany.</p>
        <button
        onClick={() => router.push('/auth/signin')}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
            Zaloguj się
        </button>
        </div>
        </div>
        </div>
    )
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
            <div className="bg-white rounded-lg shadow-md p-6 max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold text-center mb-6">Moduł E-Partycypacja</h1>
        <div className="p-4 bg-red-50 border border-red-200 rounded-md mb-6">
        <p className="text-red-600">Błąd: {error}</p>
        <p className="mt-2">Spróbuj odświeżyć stronę lub zalogować się ponownie.</p>
        </div>
        <div className="flex justify-center">
        <button
            onClick={() => window.location.reload()}
        className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition mr-4"
            >
            Odśwież
            </button>
            <button
        onClick={() => router.push('/auth/signin')}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
            Zaloguj się ponownie
        </button>
        </div>
        </div>
        </div>
    )
    }

    // Get user metadata from Supabase user object
    const userMetadata = user.user_metadata || {}
    const avatarUrl = authData?.avatar_url || userMetadata.avatar_url || '/default-avatar.png'

    return (
        <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6 pb-4 border-b">
        <h1 className="text-2xl font-bold">Moduł E-Partycypacja</h1>
    <div className="flex items-center">
    <button
        onClick={handleLogout}
    className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
        >
        Wyloguj z modułu
    </button>
    </div>
    </div>

    {authData && (
        <div className="flex flex-col md:flex-row gap-6 mb-8">
        <div className="md:w-1/3">
        <div className="bg-gray-50 p-6 rounded-lg shadow-sm flex flex-col items-center">
        <div className="w-32 h-32 relative rounded-full overflow-hidden border-4 border-white shadow-md mb-4">
        <Image
            src={avatarUrl}
        alt="Zdjęcie profilowe"
        fill
        style={{ objectFit: 'cover' }}
        sizes="128px"
            />
            </div>
            <h2 className="text-xl font-semibold text-center">
        {authData.username || authData.email.split('@')[0]}
        </h2>
        <p className="text-gray-500 text-sm mb-3">{authData.email}</p>

        <div className="flex flex-wrap gap-2 justify-center mt-2">
        {authData.role && (
                <span className={`text-xs px-2 py-1 rounded-full ${getRoleBadgeColor(authData.role)}`}>
        {authData.role === 'user' ? 'Użytkownik' :
                authData.role === 'expert' ? 'Ekspert' :
                    authData.role === 'organization' ? 'Organizacja' :
                        authData.role === 'admin' ? 'Administrator' : authData.role}
        </span>
    )}

        {authData.rank && (
            <span className={`text-xs px-2 py-1 rounded-full ${getRankBadgeColor(authData.rank)}`}>
            {authData.rank === 'new' ? 'Nowy' :
                authData.rank === 'active' ? 'Aktywny użytkownik' :
                    authData.rank === 'expert' ? 'Ekspert' : authData.rank}
            </span>
        )}

        {authData.verified && (
            <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                Zweryfikowany
                </span>
        )}
        </div>
        </div>
        </div>

        <div className="md:w-2/3">
    <div className="mb-6">
    <h2 className="text-xl font-semibold mb-3">Witaj w module E-Partycypacja</h2>
    <p className="text-gray-700">
        Tutaj możesz aktywnie uczestniczyć w procesach demokratycznych, dzielić się swoimi
        opiniami i wpływać na decyzje dotyczące spraw publicznych.
    </p>
    </div>

    <div className="bg-gray-50 p-4 rounded-md mb-6">
    <h3 className="font-medium mb-3">Szczegóły Twojego profilu:</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm">
    <div><span className="font-medium">ID:</span> {authData.user_id}</div>
    <div><span className="font-medium">Email:</span> {authData.email}</div>
    <div><span className="font-medium">Nazwa użytkownika:</span> {authData.username || '-'}</div>
    <div><span className="font-medium">Imię:</span> {authData.first_name || '-'}</div>
    <div><span className="font-medium">Nazwisko:</span> {authData.last_name || '-'}</div>
    {authData.auth_provider && (
            <div><span className="font-medium">Dostawca logowania:</span> {authData.auth_provider}</div>
    )}
        <div>
            <span className="font-medium">Email zweryfikowany:</span>
        {authData.email_verified ? ' Tak' : ' Nie'}
        </div>
        <div>
        <span className="font-medium">Telefon zweryfikowany:</span>
        {authData.phone_verified ? ' Tak' : ' Nie'}
        </div>
        </div>
        </div>
        </div>
        </div>
    )}

    <h3 className="font-semibold mb-4">Dostępne funkcje:</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div className="p-4 border border-gray-200 rounded-md hover:border-blue-300 hover:shadow-sm transition-all">
    <h3 className="font-semibold mb-2">Konsultacje społeczne</h3>
    <p className="text-gray-600 text-sm mb-3">
        Weź udział w bieżących konsultacjach dotyczących projektów ustaw.
    </p>
    <button className="text-blue-600 text-sm hover:underline">
        Przejdź do konsultacji →
            </button>
            </div>

            <div className="p-4 border border-gray-200 rounded-md hover:border-blue-300 hover:shadow-sm transition-all">
    <h3 className="font-semibold mb-2">Inicjatywy obywatelskie</h3>
    <p className="text-gray-600 text-sm mb-3">
        Przeglądaj i wspieraj inicjatywy obywatelskie.
    </p>
    <button className="text-blue-600 text-sm hover:underline">
        Zobacz inicjatywy →
            </button>
            </div>

            <div className="p-4 border border-gray-200 rounded-md hover:border-blue-300 hover:shadow-sm transition-all">
    <h3 className="font-semibold mb-2">Ankiety i głosowania</h3>
    <p className="text-gray-600 text-sm mb-3">
        Wyrażaj swoje zdanie w ankietach i głosowaniach dotyczących spraw publicznych.
    </p>
    <button className="text-blue-600 text-sm hover:underline">
        Przejdź do ankiet →
            </button>
            </div>

            <div className="p-4 border border-gray-200 rounded-md hover:border-blue-300 hover:shadow-sm transition-all">
    <h3 className="font-semibold mb-2">Edytuj profil</h3>
    <p className="text-gray-600 text-sm mb-3">
        Zaktualizuj swoje dane i preferencje w module E-Partycypacja.
    </p>
    <button className="text-blue-600 text-sm hover:underline">
        Edytuj profil →
            </button>
            </div>
            </div>
            </div>
            </div>
)
}
