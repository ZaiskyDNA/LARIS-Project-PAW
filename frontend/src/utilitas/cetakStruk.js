
/**
 * Mencetak elemen struk yang sedang ditampilkan di halaman.
 * Seluruh stylesheet aplikasi disalin ke jendela cetak
 * agar tampilan hasil cetak konsisten dengan tampilan web.
 */
export function cetakStruk() {
  const elemenStruk = document.querySelector('.area-cetak')

  if (!elemenStruk) {
    console.error('Elemen struk tidak ditemukan.')
    window.alert('Struk tidak ditemukan. Silakan buka detail transaksi kembali.')
    return
  }

  const jendelaCetak = window.open('', '_blank', 'width=900,height=700')

  if (!jendelaCetak) {
    window.alert('Jendela cetak diblokir browser. Izinkan pop-up untuk aplikasi ini.')
    return
  }

  const dokumen = jendelaCetak.document

  dokumen.open()
  dokumen.write(`
    <!DOCTYPE html>
    <html lang="id">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Struk Transaksi LARIS</title>
        <style>
          @page {
            size: auto;
            margin: 8mm;
          }

          html, body {
            margin: 0;
            padding: 0;
            background: white;
            color: #2b2118;
            font-family: Inter, Arial, sans-serif;
          }

          body {
            padding: 8px;
          }

          .area-cetak {
            display: block;
            width: 80mm;
            max-width: 100%;
            margin: 0 auto;
            box-sizing: border-box;
            background: white;
            color: #2b2118;
            box-shadow: none !important;
          }

          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          @media print {
            body {
              padding: 0;
            }

            .area-cetak {
              margin: 0;
              break-inside: avoid;
            }
          }
        </style>
      </head>
      <body>
        <main id="area-print"></main>
      </body>
    </html>
  `)
  dokumen.close()

  // Salin stylesheet aplikasi, termasuk stylesheet Vite/Tailwind.
  document
    .querySelectorAll('link[rel="stylesheet"], style')
    .forEach((stylesheet) => {
      dokumen.head.appendChild(stylesheet.cloneNode(true))
    })

  // Salin elemen struk yang sedang terlihat di halaman.
  const salinanStruk = elemenStruk.cloneNode(true)
  dokumen.getElementById('area-print').appendChild(salinanStruk)

  // Tunggu stylesheet dan font selesai dimuat sebelum mencetak.
  const cetak = async () => {
    try {
      if (dokumen.fonts?.ready) {
        await dokumen.fonts.ready
      }
    } catch (error) {
      console.warn('Font cetak tidak dapat dimuat:', error)
    }

    jendelaCetak.requestAnimationFrame(() => {
      jendelaCetak.requestAnimationFrame(() => {
        jendelaCetak.focus()
        jendelaCetak.print()
      })
    })
  }

  jendelaCetak.addEventListener('load', cetak, { once: true })

  // Fallback jika event load tidak terpanggil.
  jendelaCetak.setTimeout(() => {
    if (!jendelaCetak.closed) cetak()
  }, 1500)
}