import { useContext } from 'react'
import { KonteksAuth } from '../konteks/konteks.js'
import { PERAN } from '../utilitas/konstanta.js'

export const gunakanAuth = () => {
  const konteks = useContext(KonteksAuth)
  if (!konteks) throw new Error('gunakanAuth harus dipakai di dalam <PenyediaAuth>')
  return { ...konteks, adalahPemilik: konteks.pengguna?.role === PERAN.PEMILIK }
}
