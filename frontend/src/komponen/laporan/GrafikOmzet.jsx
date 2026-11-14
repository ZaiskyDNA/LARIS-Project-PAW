import { Area, AreaChart, CartesianGrid, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatRupiah, formatRupiahRingkas } from '../../utilitas/formatRupiah.js'
import { formatHari, formatTanggal, formatTanggalPendek } from '../../utilitas/formatTanggal.js'

const JINGGA = '#FF5E2C'
const PEMBANDING = '#9FB4D8'

function KotakInfo({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl bg-tinta px-3.5 py-2.5 text-xs text-krem shadow-lg">
      <p className="mb-1 font-bold">{formatTanggal(label)}</p>
      {payload.map((seri) => (
        <p key={seri.dataKey} className="angka flex items-center gap-2">
          <span className="size-2 rounded-full" style={{ background: seri.color }} />
          {seri.name}: <span className="font-bold">{formatRupiah(seri.value)}</span>
        </p>
      ))}
    </div>
  )
}

/**
 * Grafik garis omzet. `data`: [{ tanggal, omzet, omzetMingguLalu? }].
 * `mode="mingguan"` memberi label hari & garis pembanding putus-putus.
 */
export default function GrafikOmzet({ data, mode = 'rentang', tinggi = 260 }) {
  const mingguan = mode === 'mingguan'
  const formatSumbuX = mingguan ? formatHari : formatTanggalPendek

  return (
    <div style={{ height: tinggi }} className="w-full" role="img" aria-label="Grafik omzet per hari">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 12, right: 12, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="isiOmzet" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={JINGGA} stopOpacity={0.22} />
              <stop offset="100%" stopColor={JINGGA} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="#E6E1CF" strokeDasharray="3 5" />
          <XAxis dataKey="tanggal" tickFormatter={formatSumbuX} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: mingguan ? JINGGA : '#6B6048' }} dy={8} minTickGap={24} />
          <YAxis tickFormatter={(nilai) => formatRupiahRingkas(nilai).replace('Rp', '')} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#9A8F6B' }} width={52} allowDecimals={false} />
          <Tooltip content={<KotakInfo />} cursor={{ stroke: '#9A8F6B', strokeDasharray: '4 4' }} />
          {mingguan && (
            <Line type="monotone" dataKey="omzetMingguLalu" name="Minggu lalu" stroke={PEMBANDING} strokeWidth={2} strokeDasharray="3 5" dot={false} isAnimationActive={false} />
          )}
          <Area
            type="monotone"
            dataKey="omzet"
            name={mingguan ? '7 hari ini' : 'Omzet'}
            stroke={JINGGA}
            strokeWidth={2.5}
            fill="url(#isiOmzet)"
            dot={data.length <= 31 ? { r: 3.5, fill: JINGGA, strokeWidth: 0 } : false}
            activeDot={{ r: 5, fill: JINGGA, stroke: '#FDFAE9', strokeWidth: 2 }}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
