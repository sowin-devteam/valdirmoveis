import { useState } from 'react'

export default function ProductCard({ product, onOpenDetail, onWhatsApp, formatPrice, isAdmin }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [linkCopied, setLinkCopied] = useState(false)
  const images = product.images || []
  const hasMultipleImages = images.length > 1

  function nextImage(e) {
    e.stopPropagation()
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  function prevImage(e) {
    e.stopPropagation()
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  function goToImage(e, index) {
    e.stopPropagation()
    setCurrentImageIndex(index)
  }

  function copyAdLink(e) {
    e.stopPropagation()
    const lojaSalva = localStorage.getItem('valdir_loja')
    const loja = lojaSalva ? JSON.parse(lojaSalva) : null
    const whatsapp = loja?.whatsapp || '5547999254612'
    const itemCode = product.item_code || product.id
    const message = `Ola! Tenho interesse no produto: ${product.name}\n\nREF:${itemCode}`
    const link = `https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`

    navigator.clipboard.writeText(link).then(() => {
      setLinkCopied(true)
      setTimeout(() => setLinkCopied(false), 2000)
    })
  }

  return (
    <div
      className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow group cursor-pointer"
      style={{ border: '1px solid #e5e7eb' }}
      onClick={() => onOpenDetail(product)}
    >
      {/* Image Carousel */}
      <div className="relative h-52 bg-gray-100 overflow-hidden">
        {images.length > 0 ? (
          <img
            src={images[currentImageIndex]}
            alt={product.name}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-gray-400">
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {/* Navigation Arrows */}
        {hasMultipleImages && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center text-white transition-colors opacity-0 group-hover:opacity-100"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center text-white transition-colors opacity-0 group-hover:opacity-100"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* Dots Indicator */}
        {hasMultipleImages && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={(e) => goToImage(e, index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}

        {/* Badge de categoria */}
        {product.category && (
          <span
            className="absolute top-2 left-2 px-2 py-1 text-xs font-bold text-white rounded"
            style={{ backgroundColor: '#FF8C00' }}
          >
            {product.category}
          </span>
        )}

        {/* Image counter */}
        {hasMultipleImages && (
          <span className="absolute top-2 right-2 px-2 py-1 text-xs font-medium text-white bg-black/50 rounded">
            {currentImageIndex + 1}/{images.length}
          </span>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        <h3
          className="font-bold text-lg truncate"
          style={{ color: '#1a1a1a' }}
          title={product.name}
        >
          {product.name}
        </h3>
        <p className="text-sm text-gray-500 mt-1 line-clamp-2 min-h-[40px]">
          {product.description || 'Produto de qualidade Valdir Moveis'}
        </p>

        <div className="mt-3 flex items-center justify-between">
          <div>
            {product.sale_price && product.sale_price < product.price ? (
              <>
                <span className="text-sm text-gray-400 line-through">
                  {formatPrice(product.price)}
                </span>
                <span
                  className="block text-xl font-bold"
                  style={{ color: '#00AA00' }}
                >
                  {formatPrice(product.sale_price)}
                </span>
              </>
            ) : (
              <span
                className="text-xl font-bold"
                style={{ color: '#003DA5' }}
              >
                {formatPrice(product.price)}
              </span>
            )}
          </div>
        </div>

        <button
          className="w-full mt-4 py-2 rounded-lg font-bold text-black transition-colors hover:opacity-90"
          style={{ backgroundColor: '#00FF00' }}
          onClick={(e) => {
            e.stopPropagation()
            onWhatsApp(product)
          }}
        >
          Tenho Interesse
        </button>

        {isAdmin && (
          <button
            className={`w-full mt-2 py-2 rounded-lg font-bold transition-colors flex items-center justify-center gap-2 ${
              linkCopied
                ? 'bg-green-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            onClick={copyAdLink}
          >
            {linkCopied ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Link copiado!
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copiar link anuncio
              </>
            )}
          </button>
        )}
      </div>
    </div>
  )
}
