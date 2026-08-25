import { useState } from 'react';
import { X, Loader2, ImagePlus, Trash2, Image } from 'lucide-react';
import { supabase } from '../lib/supabaseClient.js';
import { CATEGORIES } from '../data/listings.js';
const MAX_TOTAL_MB = 5;
const MAX_PHOTOS = 3;
export default function SellModal({
  user,
  profile,
  isFreePeriod,
  onClose,
  onCreated,
  onPaymentRequired
}) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0].id);
  const [price, setPrice] = useState('');
  const [condition, setCondition] = useState('Novo');
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  function handlePhotosChange(e) {
    const newFiles = Array.from(e.target.files || []);
    if (!newFiles.length) return;
    const combined = [...photos, ...newFiles];
    if (combined.length > MAX_PHOTOS) {
      setError('Podes adicionar no m\u00e1ximo ' + MAX_PHOTOS + ' fotografias.');
      return;
    }
    for (const f of newFiles) {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(f.type)) {
        setError('As fotografias t\u00eam de ser JPG, PNG ou WEBP.');
        return;
      }
    }
    const totalBytes = combined.reduce((sum, f) => sum + (f.file ? f.file.size : f.size), 0);
    if (totalBytes > MAX_TOTAL_MB * 1024 * 1024) {
      setError('O total das fotografias n\u00e3o pode ultrapassar ' + MAX_TOTAL_MB + 'MB.');
      return;
    }
    setError('');
    const newEntries = newFiles.map(f => ({
      file: f,
      name: f.name,
      size: f.size
    }));
    setPhotos(prev => [...prev, ...newEntries]);
    e.target.value = '';
  }
  function removePhoto(index) {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  }
  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!title || !price) {
      setError('Preenche pelo menos o t\u00edtulo e o pre\u00e7o.');
      return;
    }
    setLoading(true);
    const image_urls = [];
    for (const photo of photos) {
      const fileExt = photo.file.name.split('.').pop();
      const filePath = user.id + '/' + Date.now() + '-' + Math.random().toString(36).slice(2) + '.' + fileExt;
      const {
        error: uploadError
      } = await supabase.storage.from('listing-images').upload(filePath, photo.file);
      if (uploadError) {
        setLoading(false);
        setError('N\u00e3o foi poss\u00edvel enviar uma das fotografias. Tenta novamente.');
        return;
      }
      const {
        data: urlData
      } = supabase.storage.from('listing-images').getPublicUrl(filePath);
      image_urls.push(urlData.publicUrl);
    }
    const {
      error: insertError
    } = await supabase.from('listings').insert({
      seller_id: user.id,
      title,
      category,
      price: parseFloat(price),
      condition,
      description,
      image_url: image_urls[0] || null,
      image_urls: image_urls.length > 0 ? image_urls : null,
      expires_at: new Date(Date.now() + (isFreePeriod ? 90 : 60) * 24 * 60 * 60 * 1000).toISOString()
    });
    setLoading(false);
    if (insertError) {
      if (insertError.message?.includes('PAYMENT_REQUIRED')) {
        onPaymentRequired?.();
        return;
      }
      setError('N\u00e3o foi poss\u00edvel publicar o an\u00fancio. Tenta novamente.');
      return;
    }
    onCreated?.();
    onClose();
  }
  const totalBytes = photos.reduce((sum, p) => sum + p.size, 0);
  const totalMB = (totalBytes / 1024 / 1024).toFixed(1);
  return <div className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-pine-800 border border-pine-600 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-bone-300 hover:text-blaze-400 z-10">
          <X size={20} />
        </button>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-3">
          <h2 className="font-display font-bold text-bone-100 text-lg mb-1">Vender artigo</h2>

          {isFreePeriod ? <p className="text-xs text-brass-400 -mt-2 mb-1">{'\u1f389 Per\u00edodo de lan\u00e7amento \u2014 publica\u00e7\u00e3o gr\u00e1tis para todos.'}</p> : <>
              {profile?.role === 'particular' && !profile.free_listing_used && <p className="text-xs text-brass-400 -mt-2 mb-1">{'Este \u00e9 o teu an\u00fancio gr\u00e1tis.'}</p>}
              {profile?.role !== 'admin' && (profile?.role !== 'particular' || profile.free_listing_used) && <p className="text-xs text-brass-400 -mt-2 mb-1">{'Este an\u00fancio vai usar 1 dos teus donativos j\u00e1 feitos ('}{profile?.listing_credits ?? 0}{' dispon\u00edveis).'}</p>}
            </>}

          {/* Area de fotos */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-bone-300/70">
                Fotografias ({photos.length}/{MAX_PHOTOS})
              </span>

            </div>

            {/* Lista de ficheiros selecionados */}
            {photos.length > 0 && <div className="flex flex-col gap-1.5">
                {photos.map((p, i) => <div key={i} className="flex items-center gap-2 bg-pine-700 rounded-lg px-3 py-2">
                    <Image size={14} className="text-blaze-400 shrink-0" />
                    <span className="text-xs text-bone-100 truncate flex-1">
                      {i === 0 && <span className="text-brass-400 mr-1">[Principal]</span>}
                      {p.name}
                    </span>
                    <span className="text-[10px] text-bone-300/40 shrink-0">
                      {(p.size / 1024).toFixed(0)} KB
                    </span>
                    <button type="button" onClick={() => removePhoto(i)} className="text-bone-300/50 hover:text-red-400 shrink-0">
                      <Trash2 size={13} />
                    </button>
                  </div>)}
              </div>}

            {/* Botao adicionar */}
            {photos.length < MAX_PHOTOS && <label className="h-16 bg-pine-700 border border-dashed border-pine-600 rounded-lg flex items-center justify-center cursor-pointer hover:border-blaze-500 transition-colors gap-2">
                <ImagePlus size={18} className="text-bone-300/50" />
                <span className="text-xs text-bone-300/50">
                  {photos.length === 0 ? 'Carregar fotografias' : 'Adicionar mais'}
                </span>
                <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={handlePhotosChange} className="hidden" />
              </label>}
            {photos.length > 0 && <span className="text-xs text-bone-300/40">{totalMB} / {MAX_TOTAL_MB} MB</span>}
            <p className="text-[10px] text-bone-300/30">{'M\u00e1x. '}{MAX_PHOTOS}{' fotos \u00b7 '}{MAX_TOTAL_MB}{'MB total \u00b7 JPG, PNG ou WEBP'}</p>
          </div>

          <input value={title} onChange={e => setTitle(e.target.value)} placeholder={'T\u00edtulo do an\u00fancio'} className="bg-pine-700 border border-pine-600 rounded-lg px-3 py-2 text-sm text-bone-100 placeholder:text-bone-300/40 outline-none focus:border-blaze-500" />

          <select value={category} onChange={e => setCategory(e.target.value)} className="bg-pine-700 border border-pine-600 rounded-lg px-3 py-2 text-sm text-bone-100 outline-none focus:border-blaze-500">
            {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>

          <div className="flex gap-2">
            <input value={price} onChange={e => setPrice(e.target.value)} type="number" min="0" step="0.01" placeholder={'Pre\u00e7o (\u20ac)'} className="flex-1 bg-pine-700 border border-pine-600 rounded-lg px-3 py-2 text-sm text-bone-100 placeholder:text-bone-300/40 outline-none focus:border-blaze-500" />
            <select value={condition} onChange={e => setCondition(e.target.value)} className="flex-1 bg-pine-700 border border-pine-600 rounded-lg px-3 py-2 text-sm text-bone-100 outline-none focus:border-blaze-500">
              <option>Novo</option>
              <option>Usado - Bom estado</option>
              <option>Usado - Com marcas de uso</option>
              <option>{'\u2014'}</option>
            </select>
          </div>

          <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder={'Descri\u00e7\u00e3o do artigo'} rows={3} className="bg-pine-700 border border-pine-600 rounded-lg px-3 py-2 text-sm text-bone-100 placeholder:text-bone-300/40 outline-none focus:border-blaze-500 resize-none" />

          {error && <p className="text-xs text-red-400">{error}</p>}

          <button type="submit" disabled={loading} className="bg-blaze-500 hover:bg-blaze-600 transition-colors text-pine-950 font-semibold text-sm py-2.5 rounded-lg mt-1 flex items-center justify-center gap-2 disabled:opacity-60">
            {loading && <Loader2 size={16} className="animate-spin" />}{'Publicar an\u00fancio'}</button>
        </form>
      </div>
    </div>;
}