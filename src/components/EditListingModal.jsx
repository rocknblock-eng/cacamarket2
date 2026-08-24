import { useState } from 'react';
import { X, Loader2, ImagePlus, Trash2, Image } from 'lucide-react';
import { supabase } from '../lib/supabaseClient.js';
import { CATEGORIES } from '../data/listings.js';
const MAX_TOTAL_MB = 5;
const MAX_PHOTOS = 3;
export default function EditListingModal({
  user,
  listing,
  onClose,
  onUpdated
}) {
  const [title, setTitle] = useState(listing.title || '');
  const [category, setCategory] = useState(listing.category || CATEGORIES[0].id);
  const [price, setPrice] = useState(listing.price?.toString() || '');
  const [condition, setCondition] = useState(listing.condition || 'Novo');
  const [description, setDescription] = useState(listing.description || '');
  const [existingUrls, setExistingUrls] = useState(listing.image_urls || (listing.image_url ? [listing.image_url] : []));
  const [newPhotos, setNewPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const totalPhotos = existingUrls.length + newPhotos.length;
  function handlePhotosChange(e) {
    const newFiles = Array.from(e.target.files || []);
    if (!newFiles.length) return;
    if (totalPhotos + newFiles.length > MAX_PHOTOS) {
      setError('Podes ter no m\u00e1ximo ' + MAX_PHOTOS + ' fotografias.');
      return;
    }
    for (const f of newFiles) {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(f.type)) {
        setError('As fotografias t\u00eam de ser JPG, PNG ou WEBP.');
        return;
      }
    }
    const totalBytes = newFiles.reduce((sum, f) => sum + f.size, 0);
    if (totalBytes > MAX_TOTAL_MB * 1024 * 1024) {
      setError('O total das fotografias n\u00e3o pode ultrapassar ' + MAX_TOTAL_MB + 'MB.');
      return;
    }
    setError('');
    setNewPhotos(prev => [...prev, ...newFiles.map(f => ({
      file: f,
      name: f.name,
      size: f.size
    }))]);
    e.target.value = '';
  }
  function removeExisting(index) {
    setExistingUrls(prev => prev.filter((_, i) => i !== index));
  }
  function removeNew(index) {
    setNewPhotos(prev => prev.filter((_, i) => i !== index));
  }
  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!title || !price) {
      setError('Preenche pelo menos o t\u00edtulo e o pre\u00e7o.');
      return;
    }
    setLoading(true);
    const image_urls = [...existingUrls];
    for (const photo of newPhotos) {
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
      error: updateError
    } = await supabase.from('listings').update({
      title,
      category,
      price: parseFloat(price),
      condition,
      description,
      image_url: image_urls[0] || null,
      image_urls: image_urls.length > 0 ? image_urls : null
    }).eq('id', listing.id);
    setLoading(false);
    if (updateError) {
      setError('N\u00e3o foi poss\u00edvel actualizar o an\u00fancio. Tenta novamente.');
      return;
    }
    onUpdated?.();
    onClose();
  }
  return <div className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-pine-800 border border-pine-600 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-bone-300 hover:text-blaze-400 z-10">
          <X size={20} />
        </button>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-3">
          <h2 className="font-display font-bold text-bone-100 text-lg mb-1">{'Editar an\u00fancio'}</h2>

          {/* Fotos existentes */}
          {existingUrls.length > 0 && <div className="flex flex-col gap-1.5">
              <span className="text-xs text-bone-300/70">Fotografias actuais</span>
              <div className="flex gap-2 flex-wrap">
                {existingUrls.map((url, i) => <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-pine-600">
                    <img src={url} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                    {i === 0 && <span className="absolute top-0 left-0 bg-black/60 text-[9px] text-brass-400 px-1">Principal</span>}
                    <button type="button" onClick={() => removeExisting(i)} className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 hover:bg-red-500">
                      <X size={10} />
                    </button>
                  </div>)}
              </div>
            </div>}

          {/* Novas fotos */}
          {newPhotos.length > 0 && <div className="flex flex-col gap-1.5">
              <span className="text-xs text-bone-300/70">Novas fotografias</span>
              {newPhotos.map((p, i) => <div key={i} className="flex items-center gap-2 bg-pine-700 rounded-lg px-3 py-2">
                  <Image size={14} className="text-blaze-400 shrink-0" />
                  <span className="text-xs text-bone-100 truncate flex-1">{p.name}</span>
                  <span className="text-[10px] text-bone-300/40 shrink-0">{(p.size / 1024).toFixed(0)} KB</span>
                  <button type="button" onClick={() => removeNew(i)} className="text-bone-300/50 hover:text-red-400 shrink-0">
                    <Trash2 size={13} />
                  </button>
                </div>)}
            </div>}

          {/* Botao adicionar fotos */}
          {totalPhotos < MAX_PHOTOS && <label className="h-16 bg-pine-700 border border-dashed border-pine-600 rounded-lg flex items-center justify-center cursor-pointer hover:border-blaze-500 transition-colors gap-2">
              <ImagePlus size={18} className="text-bone-300/50" />
              <span className="text-xs text-bone-300/50">Adicionar fotografias ({totalPhotos}/{MAX_PHOTOS})</span>
              <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={handlePhotosChange} className="hidden" />
            </label>}

          <input value={title} onChange={e => setTitle(e.target.value)} placeholder='T\u00edtulo do an\u00fancio' className="bg-pine-700 border border-pine-600 rounded-lg px-3 py-2 text-sm text-bone-100 placeholder:text-bone-300/40 outline-none focus:border-blaze-500" />

          <select value={category} onChange={e => setCategory(e.target.value)} className="bg-pine-700 border border-pine-600 rounded-lg px-3 py-2 text-sm text-bone-100 outline-none focus:border-blaze-500">
            {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>

          <div className="flex gap-2">
            <input value={price} onChange={e => setPrice(e.target.value)} type="number" min="0" step="0.01" placeholder='Pre\u00e7o (\u20ac)' className="flex-1 bg-pine-700 border border-pine-600 rounded-lg px-3 py-2 text-sm text-bone-100 placeholder:text-bone-300/40 outline-none focus:border-blaze-500" />
            <select value={condition} onChange={e => setCondition(e.target.value)} className="flex-1 bg-pine-700 border border-pine-600 rounded-lg px-3 py-2 text-sm text-bone-100 outline-none focus:border-blaze-500">
              <option>Novo</option>
              <option>Usado - Bom estado</option>
              <option>Usado - Com marcas de uso</option>
              <option>{'\u2014'}</option>
            </select>
          </div>

          <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder='Descri\u00e7\u00e3o do artigo' rows={3} className="bg-pine-700 border border-pine-600 rounded-lg px-3 py-2 text-sm text-bone-100 placeholder:text-bone-300/40 outline-none focus:border-blaze-500 resize-none" />

          {error && <p className="text-xs text-red-400">{error}</p>}

          <button type="submit" disabled={loading} className="bg-blaze-500 hover:bg-blaze-600 transition-colors text-pine-950 font-semibold text-sm py-2.5 rounded-lg mt-1 flex items-center justify-center gap-2 disabled:opacity-60">
            {loading && <Loader2 size={16} className="animate-spin" />}{'Guardar altera\u00e7\u00f5es'}</button>
        </form>
      </div>
    </div>;
}