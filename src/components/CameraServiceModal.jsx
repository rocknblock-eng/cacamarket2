import { useState } from 'react'
import { X, Camera, Send, Download, CheckCircle, AlertCircle } from 'lucide-react'
import { supabase } from '../lib/supabaseClient.js'

// ---------------------------------------------------------------------------
// Gerador do Parameter.dat, feito no browser (sem precisar do servidor).
//
// O ficheiro da camara tem 1808 bytes. Os ultimos 768 bytes sao o bloco
// "SMTP", dividido em 12 campos de 64 bytes cada. Cada byte e cifrado com:
//   encoded = 255 - swap_nibbles(byte)
// (cifra simetrica: aplicar a mesma funcao outra vez devolve o original)
//
// Em vez de embutir o ficheiro inteiro como um bloco gigante de texto
// (fragil de copiar/colar), reconstruimos os 1808 bytes a partir de:
//  - um preenchimento por defeito (0xFF, que e o valor de "campo vazio")
//  - alguns pedacos pequenos com dados reais (nome da camara, paises/
//    operadoras de MMS que a camara ja trazia por defeito)
// Isto e muito mais curto e muito mais dificil de corromper ao copiar.
// ---------------------------------------------------------------------------

const FILE_LENGTH = 1808

const KNOWN_CHUNKS = [
  [0, '000000000043414d3030300000000000000001000000000000000000000000001a0813151f3801000801000000173b3b00000000173b3b00000000173b3b000100000000000000000000010030303030010163417267656e74696e61000000000000004d6f766973746172000000000000000000000000000000000000000000000000000000000000000000000000002929c81d89f8d8c81da819699909191dc909291de9d8'],
  [208, '2929c8'],
  [272, '2929c8'],
  [336, '2929c81d29099869c8b8e9d81dc909291de9d8'],
  [400, 'dcfcfc1d9c7c1dccdc1ddccc6c'],
  [464, '7cfc7cfc'],
  [1040, '010163506f72747567616c00000000000000004e6f730000000000000000000000000000000000000000000000000000000000000000000000000000000000006919b8a9d819a9b8'],
]

function hexToBytes(hex) {
  const out = new Uint8Array(hex.length / 2)
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(hex.substr(i * 2, 2), 16)
  }
  return out
}

function buildTemplate() {
  const data = new Uint8Array(FILE_LENGTH).fill(0xff)
  for (const [offset, hex] of KNOWN_CHUNKS) {
    data.set(hexToBytes(hex), offset)
  }
  return data
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
function buildParameterDat({ smtpServer, smtpPort, deviceCode, recipient, apn, gprsAccount, gprsPassword }) {
  const data = buildTemplate()
  if (data.length !== FILE_LENGTH) {
    throw new Error(
      `Modelo do ficheiro corrompido (tem ${data.length} bytes, devia ter ${FILE_LENGTH}). ` +
      `Contacta o suporte antes de usares este ficheiro na camara.`
    )
  }
  const blockStart = data.length - 768

  const fields = {
    1: apn || 'internet',    // GprsAPN
    2: gprsAccount || '',     // GprsAccount
    3: gprsPassword || '',     // GprsPassword
    4: smtpServer,               // SmtpServer
    5: smtpPort,                  // SmtpPort
    6: deviceCode,                 // SendEmail (identificador desta camara)
    7: 'wildmarket',                // SendEmailPassword (nao validado pelo servidor)
    8: recipient,                     // SmtpEmail1 (nao usado para routing, so preenchimento)
  }

  for (const [idx, value] of Object.entries(fields)) {
    const offset = blockStart + Number(idx) * 64
    data.set(encodeField(value), offset)
  }

  return data
}

function downloadParameterDat(deviceCode, network) {
  let bytes
  try {
    bytes = buildParameterDat({
      smtpServer: 'cam.wildmarket.app',
      smtpPort: '25',
      deviceCode,
      recipient: `${deviceCode}@wildmarket.app`,
      apn: network.apn,
      gprsAccount: network.account,
      gprsPassword: network.password,
    })
  } catch (err) {
    alert(err.message)
    return
  }
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
const BOT_DISPLAY_NAME = 'wildmarket.app Camera'

// Predefinicoes de APN para operadoras portuguesas, tiradas diretamente da
// base de dados oficial da propria aplicacao da camara (SMTPDB.DB, secao
// "Portugal"). O cliente pode sempre editar os campos a seguir a escolher.
const CARRIER_PRESETS = [
  { id: 'meo', label: 'MEO', apn: 'internet', account: 'tmn', password: 'tmnnet' },
  { id: 'vodafone', label: 'Vodafone', apn: 'net2.vodafone.pt', account: '', password: '' },
  { id: 'nos', label: 'NOS', apn: 'internet', account: '', password: '' },
  { id: 'outro', label: 'Outra / nao sei', apn: '', account: '', password: '' },
]

export default function CameraServiceModal({ profile, onClose, onCreditsChanged }) {
  const [code, setCode] = useState('')
  const [label, setLabel] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null) // { device_code, active_until }

  const [carrierId, setCarrierId] = useState('meo')
  const [apn, setApn] = useState(CARRIER_PRESETS[0].apn)
  const [gprsAccount, setGprsAccount] = useState(CARRIER_PRESETS[0].account)
  const [gprsPassword, setGprsPassword] = useState(CARRIER_PRESETS[0].password)

  function handleCarrierChange(id) {
    setCarrierId(id)
    const preset = CARRIER_PRESETS.find((c) => c.id === id)
    if (preset) {
      setApn(preset.apn)
      setGprsAccount(preset.account)
      setGprsPassword(preset.password)
    }
  }

  const credits = profile?.listing_credits ?? 0

  async function handleActivate() {
    setError(null)
    const cleanCode = code.trim()
    if (!/^\d{6}$/.test(cleanCode)) {
      setError('O c\u00f3digo deve ter 6 n\u00fameros (o que o bot te enviou no Telegram).')
      return
    }
    setLoading(true)
    const { data, error: rpcError } = await supabase.rpc('activate_camera_device', {
      telegram_code: cleanCode,
      device_label: label.trim() || null,
    })
    setLoading(false)

    if (rpcError) {
      setError(rpcError.message || 'N\u00e3o foi poss\u00edvel ativar a c\u00e2mara.')
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
            {'C\u00e2mara para Telegram'}
          </h3>
          <button onClick={onClose} className="text-bone-300/50 hover:text-bone-100">
            <X size={20} />
          </button>
        </div>

        {!result && (
          <>
            <p className="text-bone-300/70 text-sm leading-relaxed">
              {'Recebe as fotos da tua c\u00e2mara de fototrapagem diretamente no Telegram.'}
              {' '}
              {'Custa '}<strong className="text-brass-400">{'10 cr\u00e9ditos'}</strong>{' por 90 dias.'}
              {' '}
              {'Tens atualmente '}<strong className="text-bone-100">{credits}</strong>{' cr\u00e9dito(s).'}
            </p>

            <div className="bg-pine-700/30 border border-pine-600/50 rounded-lg px-3 py-2.5 text-xs text-bone-300/70 leading-relaxed">
              <p className="font-semibold text-bone-200 mb-1">{'C\u00e2maras suportadas'}</p>
              <p>
                {'C\u00e2maras '}<strong className="text-bone-100">{'Suntek 2G/4G'}</strong>
                {' com envio de foto por SMTP \u2014 modelos do tipo '}
                <strong className="text-bone-100">{'HC900M'}</strong>{', '}
                <strong className="text-bone-100">{'HC300M'}</strong>
                {' (o "M" no nome indica que a c\u00e2mara suporta envio por MMS ou SMTP).'}
                {' '}
                {'Testado e garantido na '}<strong className="text-bone-100">{'HC900M'}</strong>{'.'}
                {' '}
                {'Configuras a c\u00e2mara atrav\u00e9s do programa Windows '}
                <strong className="text-bone-100">{'"MMSCONFIG"'}</strong>
                {', o mesmo que j\u00e1 vem com este tipo de c\u00e2mara.'}
                {' '}
                {'C\u00e2maras sem a fun\u00e7\u00e3o de envio por email/SMTP (s\u00f3 grava\u00e7\u00e3o no cart\u00e3o SD) n\u00e3o s\u00e3o compat\u00edveis.'}
              </p>
            </div>

            <div className="bg-pine-900/50 rounded-xl p-4 space-y-4 text-sm text-bone-300/80">
              <div>
                <p className="text-xs font-display font-bold text-brass-400 uppercase tracking-wide mb-2">
                  {'No Telegram'}
                </p>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <span className="font-display font-bold text-brass-400 shrink-0">1.</span>
                    <span>
                      {'Abre a conversa com o bot '}
                      <span
                        onClick={() => window.open(`https://t.me/${BOT_USERNAME}`, '_blank', 'noreferrer')}
                        className="text-brass-400 underline inline-flex items-center gap-1 cursor-pointer"
                      >
                        {BOT_DISPLAY_NAME} <Send size={12} />
                      </span>
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-display font-bold text-brass-400 shrink-0">2.</span>
                    <span>
                      {'Envia '}<code className="bg-pine-700 px-1 rounded">/start</code>
                      {' \u2014 o bot responde com um c\u00f3digo de 6 n\u00fameros'}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-display font-bold text-brass-400 shrink-0">3.</span>
                    <span>{'Cola esse c\u00f3digo no campo abaixo, aqui no site'}</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-pine-700 pt-3">
                <p className="text-xs font-display font-bold text-brass-400 uppercase tracking-wide mb-2">
                  {'Na c\u00e2mara'}
                </p>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <span className="font-display font-bold text-brass-400 shrink-0">4.</span>
                    <span>{'Escolhe a operadora do cart\u00e3o SIM que est\u00e1 na c\u00e2mara (ou introduz o APN \u00e0 m\u00e3o)'}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-display font-bold text-brass-400 shrink-0">5.</span>
                    <span>{'Depois de ativares, descarrega o ficheiro '}<code className="bg-pine-700 px-1 rounded">Parameter.dat</code></span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-display font-bold text-brass-400 shrink-0">6.</span>
                    <span>{'Tira o cart\u00e3o SD da c\u00e2mara, liga-o ao computador, e copia o ficheiro para dentro dele (substitui o que l\u00e1 estiver)'}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-display font-bold text-brass-400 shrink-0">7.</span>
                    <span>{'Volta a colocar o cart\u00e3o na c\u00e2mara e liga-a \u2014 as defini\u00e7\u00f5es ficam aplicadas automaticamente'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-bone-300/60 block mb-1">{'C\u00f3digo do Telegram'}</label>
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
                <label className="text-xs text-bone-300/60 block mb-1">{'Nome da c\u00e2mara (opcional)'}</label>
                <input
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder={'Ex: C\u00e2mara do monte'}
                  className="w-full bg-pine-900 border border-pine-600 rounded-lg px-3 py-2 text-bone-100 text-sm"
                />
              </div>

              <div className="border-t border-pine-700 pt-3 mt-1">
                <label className="text-xs text-bone-300/60 block mb-1">
                  {'Operadora do cart\u00e3o SIM da c\u00e2mara'}
                </label>
                <select
                  value={carrierId}
                  onChange={(e) => handleCarrierChange(e.target.value)}
                  className="w-full bg-pine-900 border border-pine-600 rounded-lg px-3 py-2 text-bone-100 text-sm mb-2"
                >
                  {CARRIER_PRESETS.map((c) => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>

                <div className="grid grid-cols-1 gap-2">
                  <div>
                    <label className="text-[11px] text-bone-300/50 block mb-1">APN</label>
                    <input
                      type="text"
                      value={apn}
                      onChange={(e) => setApn(e.target.value)}
                      placeholder="internet"
                      className="w-full bg-pine-900 border border-pine-600 rounded-lg px-3 py-2 text-bone-100 text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] text-bone-300/50 block mb-1">{'Utilizador (se pedir)'}</label>
                      <input
                        type="text"
                        value={gprsAccount}
                        onChange={(e) => setGprsAccount(e.target.value)}
                        className="w-full bg-pine-900 border border-pine-600 rounded-lg px-3 py-2 text-bone-100 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-bone-300/50 block mb-1">{'Password (se pedir)'}</label>
                      <input
                        type="text"
                        value={gprsPassword}
                        onChange={(e) => setGprsPassword(e.target.value)}
                        className="w-full bg-pine-900 border border-pine-600 rounded-lg px-3 py-2 text-bone-100 text-sm"
                      />
                    </div>
                  </div>
                </div>
                {carrierId === 'outro' && (
                  <p className="text-[11px] text-bone-300/40 mt-1.5">
                    {'Consulta o site do teu operador para veres o APN correto, ou pergunta ao suporte.'}
                  </p>
                )}
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
              {loading
                ? 'A ativar...'
                : credits < 10
                ? '\u00c9 preciso ter 10 cr\u00e9ditos'
                : 'Ativar c\u00e2mara (10 cr\u00e9ditos)'}
            </button>
          </>
        )}

        {result && (
          <div className="space-y-4">
            <div className="flex items-start gap-2 text-brass-400 bg-brass-400/10 rounded-lg p-3 text-sm">
              <CheckCircle size={18} className="shrink-0 mt-0.5" />
              <span>
                {'C\u00e2mara ativada! V\u00e1lida at\u00e9 '}<strong>{result.active_until}</strong>.
              </span>
            </div>

            <button
              onClick={() => downloadParameterDat(result.device_code, { apn, account: gprsAccount, password: gprsPassword })}
              className="w-full bg-brass-500 hover:bg-brass-400 text-pine-900 font-display font-bold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Download size={18} />
              Descarregar Parameter.dat
            </button>

            <div className="bg-pine-900/50 rounded-xl p-4 space-y-2 text-sm text-bone-300/80">
              <p className="text-xs font-display font-bold text-brass-400 uppercase tracking-wide mb-1">
                {'Agora, na c\u00e2mara:'}
              </p>
              <div className="flex gap-2">
                <span className="font-display font-bold text-brass-400 shrink-0">1.</span>
                <span>{'Tira o cart\u00e3o SD da c\u00e2mara e liga-o ao computador'}</span>
              </div>
              <div className="flex gap-2">
                <span className="font-display font-bold text-brass-400 shrink-0">2.</span>
                <span>
                  {'Copia o ficheiro que descarregaste para dentro do cart\u00e3o, substituindo o ficheiro '}
                  <code className="bg-pine-700 px-1 rounded">Parameter.dat</code>{' que j\u00e1 l\u00e1 estiver'}
                </span>
              </div>
              <div className="flex gap-2">
                <span className="font-display font-bold text-brass-400 shrink-0">3.</span>
                <span>{'Volta a colocar o cart\u00e3o na c\u00e2mara'}</span>
              </div>
              <div className="flex gap-2">
                <span className="font-display font-bold text-brass-400 shrink-0">4.</span>
                <span>{'Liga a c\u00e2mara \u2014 as novas defini\u00e7\u00f5es s\u00e3o aplicadas automaticamente, sem mais nada a fazer'}</span>
              </div>
            </div>

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
