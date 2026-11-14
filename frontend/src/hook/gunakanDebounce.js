import { useEffect, useState } from 'react'
import { JEDA_DEBOUNCE_MS } from '../utilitas/konstanta.js'

export const gunakanDebounce = (nilai, jeda = JEDA_DEBOUNCE_MS) => {
  const [nilaiTertunda, setNilaiTertunda] = useState(nilai)

  useEffect(() => {
    const pengatur = setTimeout(() => setNilaiTertunda(nilai), jeda)
    return () => clearTimeout(pengatur)
  }, [nilai, jeda])

  return nilaiTertunda
}
