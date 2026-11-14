import { useCallback, useEffect, useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import * as apiAuth from '../layanan/apiAuth.js'
import { KUNCI_PENGGUNA, KUNCI_TOKEN, PERISTIWA_SESI_HABIS } from '../utilitas/konstanta.js'
import { KonteksAuth } from './konteks.js'

const bacaPenggunaTersimpan = () => {
  try {
    if (!localStorage.getItem(KUNCI_TOKEN)) return null
    return JSON.parse(localStorage.getItem(KUNCI_PENGGUNA))
  } catch {
    return null
  }
}

const hapusSesiTersimpan = () => {
  localStorage.removeItem(KUNCI_TOKEN)
  localStorage.removeItem(KUNCI_PENGGUNA)
}

export function PenyediaAuth({ children }) {
  const klienQuery = useQueryClient()
  const [pengguna, setPengguna] = useState(bacaPenggunaTersimpan)
  const [sedangMemeriksa, setSedangMemeriksa] = useState(() => Boolean(localStorage.getItem(KUNCI_TOKEN)))
  const [sesiHabis, setSesiHabis] = useState(false)
  // Logout sengaja: halaman terakhir tidak diingat, login berikutnya menuju beranda peran
  const [keluarSengaja, setKeluarSengaja] = useState(false)

  const akhiriSesi = useCallback(() => {
    hapusSesiTersimpan()
    setPengguna(null)
    klienQuery.clear()
  }, [klienQuery])

  // Validasi token tersimpan saat aplikasi dibuka
  useEffect(() => {
    if (!localStorage.getItem(KUNCI_TOKEN)) return undefined
    let batal = false
    apiAuth
      .ambilProfil()
      .then((profil) => {
        if (batal) return
        localStorage.setItem(KUNCI_PENGGUNA, JSON.stringify(profil))
        setPengguna(profil)
      })
      .catch((error) => {
        // Galat jaringan: pertahankan sesi tersimpan; 401 ditangani listener di bawah
        if (!batal && error.response && error.response.status !== 401) akhiriSesi()
      })
      .finally(() => !batal && setSedangMemeriksa(false))
    return () => {
      batal = true
    }
  }, [akhiriSesi])

  // Token kedaluwarsa / tidak valid saat menjelajah (US-01 kriteria 5)
  useEffect(() => {
    const tangani = () => {
      if (!localStorage.getItem(KUNCI_TOKEN)) return
      akhiriSesi()
      setSesiHabis(true)
    }
    window.addEventListener(PERISTIWA_SESI_HABIS, tangani)
    return () => window.removeEventListener(PERISTIWA_SESI_HABIS, tangani)
  }, [akhiriSesi])

  const masuk = useCallback(async (kredensial) => {
    const { token, user } = await apiAuth.login(kredensial)
    localStorage.setItem(KUNCI_TOKEN, token)
    localStorage.setItem(KUNCI_PENGGUNA, JSON.stringify(user))
    setSesiHabis(false)
    setKeluarSengaja(false)
    setPengguna(user)
    return user
  }, [])

  const keluar = useCallback(async () => {
    try {
      await apiAuth.logout()
    } catch {
      // token tetap dihapus di sisi klien walau server tidak terjangkau
    }
    setKeluarSengaja(true)
    akhiriSesi()
  }, [akhiriSesi])

  const nilai = useMemo(
    () => ({ pengguna, sedangMemeriksa, sesiHabis, keluarSengaja, masuk, keluar }),
    [pengguna, sedangMemeriksa, sesiHabis, keluarSengaja, masuk, keluar],
  )

  return <KonteksAuth.Provider value={nilai}>{children}</KonteksAuth.Provider>
}
