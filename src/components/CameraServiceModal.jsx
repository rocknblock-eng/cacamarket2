import { useState } from 'react'
import { X, Camera, Send, Download, CheckCircle, AlertCircle } from 'lucide-react'
import { supabase } from '../lib/supabaseClient.js'

// ---------------------------------------------------------------------------
// Gerador do Parameter.dat, feito 100% no browser (sem precisar do servidor).
//
// O ficheiro da cÃ¢mara tem 1808 bytes. Os Ãºltimos 768 bytes sÃ£o o bloco
// "SMTP", dividido em 12 campos de 64 bytes cada. Cada byte Ã© cifrado com:
//   encoded = 255 - swap_nibbles(byte)
// (uma cifra simÃ©trica: aplicar a mesma funÃ§Ã£o outra vez devolve o original)
// ---------------------------------------------------------------------------

const TEMPLATE_B64 =
  'AAAAAABDQU0wMDAAAAAAAAAAAQAAAAAAAAAAAAAAAAAaCBMVHzgBAAgBAAAAFzs7AAAAABc7OwAAAAAXOzsAAQAAAAAAAAAAAAABADAwMDABAWNBcmdlbnRpbmEAAAAAAAAATW92aXN0YXIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAKSnIHYn42MgdqBlpmQkZHckJKR3p2P///////////////////////////////////////////////////////ykpyP////////////////////////////////////////////////////////////////////////////////8pKcj/////////////////////////////////////////////////////////////////////////////////KSnIHSkJmGnIuOnYHckJKR3p2P///////////////////////////////////////////////////////////9z8/B2cfB3M3B3czGz///////////////////////////////////////////////////////////////////98/Hz8//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////8BAWNQb3J0dWdhbAAAAAAAAAAATm9zAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAaRm4qdgZqbj/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////yekpHYhpObkp6dhJqbgd6fj4/////////////////////////////////////////////////////////////9ys//////////////////////////////////////////////////////////////////////////////////+IaTm5KenYSam4////////////////////////////////////////////////////////////////////////y+kpuqnIuNz83JzNiint/////////////////////////////////////////////////////////////////8npKanY6fuIaTm5KenYSam4Hen4+P/////////////////////////////////////////////////////////puSlpGfuIaTm5KenYSam4Hen4+P////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////8='

function base64ToBytes(b64) {
  const bin = atob(b64)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return bytes
}

function encryptByte(b) {
  const swapped = ((b & 0xff) >> 4) + ((b & 0x0f) << 4)
  return (255 - swapped) & 0xff
}

function encodeField(text, length = 64) {
  const out = new Uint8Array(length)
  const enc = new TextEncoder().encode(text)
  for (let i = 0; i < length; i++) {
    const raw = i < enc.length ? enc[i] : 0
    out[i] = encryptByte(raw)
  }
  return out
}

// Gera o ficheiro Parameter.dat personalizado para este dispositivo.
function buildParameterDat({ smtpServer, smtpPort, deviceCode, recipient }) {
  const data = base64ToBytes(TEMPLATE_B64)
  const blockStart = data.length - 768

  const fields = {
    4: smtpServer,      // SmtpServer
    5: smtpPort,         // SmtpPort
    6: deviceCode,        // SendEmail (identificador desta camara)
    7: 'wildmarket',       // SendEmailPassword (nao validado pelo servidor)
    8: recipient,           // SmtpEmail1 (nao usado para routing, so preenchimento)
  }

  for (const [idx, value] of Object.entries(fields)) {
    const offset = blockStart + Number(idx) * 64
    data.set(encodeField(value), offset)
  }

  return data
}

function downloadParameterDat(deviceCode) {
  const bytes = buildParameterDat({
    smtpServer: 'cam.wildmarket.app',
    smtpPort: '25',
    deviceCode,
    recipient: `${deviceCode}@wildmarket.app`,
  })
  const blob = new Blob([bytes], { type: 'application/octet-stream' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'Parameter.dat'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

const BOT_USERNAME = 'wildmarket_teste_camera_bot'

export default function CameraServiceModal({ profile, onClose, onCreditsChanged }) {
  const [code, setCode] = useState('')
  const [label, setLabel] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null) // { device_code, active_until }

  const credits = profile?.listing_credits ?? 0

  async function handleActivate() {
    setError(null)
    const cleanCode = code.trim()
    if (!/^\d{6}$/.test(cleanCode)) {
      setError('O cÃ³digo deve ter 6 nÃºmeros (o que o bot te enviou no Telegram).')
      return
    }
    setLoading(true)
    const { data, error: rpcError } = await supabase.rpc('activate_camera_device', {
      telegram_code: cleanCode,
      device_label: label.trim() || null,
    })
    setLoading(false)

    if (rpcError) {
      setError(rpcError.message || 'NÃ£o foi possÃ­vel ativar a cÃ¢mara.')
      return
    }
    const row = Array.isArray(data) ? data[0] : data
    setResult(row)
    onCreditsChanged?.()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-pine-800 border border-pine-600 rounded-2xl w-full max-w-md p-6 space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h3 className="text-bone-100 font-display font-bold text-lg flex items-center gap-2">
            <Camera size={20} className="text-brass-400" />
            CÃ¢mara para Telegram
          </h3>
          <button onClick={onClose} className="text-bone-300/50 hover:text-bone-100">
            <X size={20} />
          </button>
        </div>

        {!result && (
          <>
            <p className="text-bone-300/70 text-sm leading-relaxed">
              Recebe as fotos da tua cÃ¢mara de fototrapagem diretamente no Telegram.
              Custa <strong className="text-brass-400">10 crÃ©ditos</strong> por 90 dias.
              Tens atualmente <strong className="text-bone-100">{credits}</strong> crÃ©dito(s).
            </p>

            <div className="bg-pine-900/50 rounded-xl p-4 space-y-3 text-sm text-bone-300/80">
              <div className="flex gap-2">
                <span className="font-display font-bold text-brass-400">1.</span>
                <span>
                  No Telegram, abre a conversa com{' '}
                  <a
                    href={`https://t.me/${BOT_USERNAME}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-brass-400 underline inline-flex items-center gap-1"
                  >
                    @{BOT_USERNAME} <Send size={12} />
                  </a>{' '}
                  e envia <code className="bg-pine-700 px-1 rounded">/start</code>
                </span>
              </div>
              <div className="flex gap-2">
                <span className="font-display font-bold text-brass-400">2.</span>
                <span>Cola aqui o cÃ³digo de 6 nÃºmeros que o bot te enviar</span>
              </div>
              <div className="flex gap-2">
                <span className="font-display font-bold text-brass-400">3.</span>
                <span>Descarrega o ficheiro e copia para o cartÃ£o SD da cÃ¢mara</span>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-bone-300/60 block mb-1">CÃ³digo do Telegram</label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="w-full bg-pine-900 border border-pine-600 rounded-lg px-3 py-2 text-bone-100 text-center text-xl tracking-widest font-display"
                />
              </div>
              <div>
                <label className="text-xs text-bone-300/60 block mb-1">Nome da cÃ¢mara (opcional)</label>
                <input
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="Ex: CÃ¢mara do monte"
                  className="w-full bg-pine-900 border border-pine-600 rounded-lg px-3 py-2 text-bone-100 text-sm"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 text-red-400 text-sm bg-red-400/10 rounded-lg p-3">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={handleActivate}
              disabled={loading || credits < 10}
              className="w-full bg-brass-500 hover:bg-brass-400 disabled:opacity-40 disabled:cursor-not-allowed text-pine-900 font-display font-bold py-2.5 rounded-lg transition-colors"
            >
              {loading ? 'A ativar...' : credits < 10 ? 'CrÃ©ditos insuficientes' : 'Ativar cÃ¢mara (10 crÃ©ditos)'}
            </button>
          </>
        )}

        {result && (
          <div className="space-y-4">
            <div className="flex items-start gap-2 text-brass-400 bg-brass-400/10 rounded-lg p-3 text-sm">
              <CheckCircle size={18} className="shrink-0 mt-0.5" />
              <span>
                CÃ¢mara ativada! VÃ¡lida atÃ© <strong>{result.active_until}</strong>.
              </span>
            </div>
            <p className="text-bone-300/70 text-sm">
              Descarrega o ficheiro abaixo e copia para o cartÃ£o SD da tua cÃ¢mara
              (substitui o ficheiro <code className="bg-pine-700 px-1 rounded">Parameter.dat</code> que lÃ¡ estÃ¡).
            </p>
            <button
              onClick={() => downloadParameterDat(result.device_code)}
              className="w-full bg-brass-500 hover:bg-brass-400 text-pine-900 font-display font-bold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Download size={18} />
              Descarregar Parameter.dat
            </button>
            <button
              onClick={onClose}
              className="w-full text-bone-300/60 hover:text-bone-100 text-sm py-1 transition-colors"
            >
              Fechar
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
