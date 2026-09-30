import path from 'path'
import { Font } from '@react-pdf/renderer'

let registered = false

export function registerPdfFonts() {
  if (registered) return
  registered = true

  Font.register({
    family: 'NotoSerifThai',
    fonts: [
      {
        src: path.join(
          process.cwd(),
          'public/fonts/NotoSerifThai-Regular.ttf',
        ),
        fontWeight: 400,
      },
      {
        src: path.join(
          process.cwd(),
          'public/fonts/NotoSerifThai-SemiBold.ttf',
        ),
        fontWeight: 600,
      },
      {
        src: path.join(
          process.cwd(),
          'public/fonts/NotoSerifThai-Bold.ttf',
        ),
        fontWeight: 700,
      },
    ],
  })

  // ปิด word hyphenation ของไทย
  Font.registerHyphenationCallback(word => [word])
}