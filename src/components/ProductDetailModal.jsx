import { useState, useEffect } from 'react'

export default function ProductDetailModal({ product, onClose, onWhatsApp, formatPrice }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [linkCopied, setLinkCopied] = useState(false)
  const images = product?.images || []
  const hasMultipleImages = images.length > 1

  // Fecha modal com ESC
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  // Previne scroll do body
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  if (!product) return null

  function nextImage() {
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  function prevImage() {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  function copyLink() {
    // Copia o link do site com o produto na URL
    const url = new URL(window.location.href)
    url.searchParams.set('produto', product.id)
    const link = url.toString()

    navigator.clipboard.writeText(link).then(() => {
      setLinkCopied(true)
      setTimeout(() => setLinkCopied(false), 2000)
    })
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end md:items-center justify-center md:p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Botão fechar flutuante - mobile only */}
      <button
        onClick={onClose}
        className="md:hidden fixed right-4 z-[110] w-12 h-12 rounded-full bg-red-500 hover:bg-red-600 transition-colors flex items-center justify-center shadow-lg"
        style={{ top: 'calc(16px + env(safe-area-inset-top, 0px))' }}
      >
        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div
        className="bg-white w-full max-w-5xl h-[90vh] md:h-auto md:max-h-[90vh] rounded-t-2xl md:rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        style={{ animation: 'slideUp 0.3s ease-out' }}
        onClick={(e) => e.stopPropagation()}
      >

        {/* Content - Two columns on desktop */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-y-auto md:overflow-hidden">
            {/* Left - Images */}
            <div className="md:w-1/2 bg-gray-50 flex-shrink-0 md:overflow-y-auto">
              {/* Main Image */}
              <div className="relative aspect-square md:aspect-auto md:h-[400px] bg-gray-100">
                {images.length > 0 ? (
                  <img
                    src={images[currentImageIndex]}
                    alt={product.name}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-gray-400">
                    <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}

                {/* Navigation Arrows */}
                {hasMultipleImages && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center text-white transition-colors"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center text-white transition-colors"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </>
                )}

                {/* Image counter */}
                {hasMultipleImages && (
                  <span className="absolute bottom-2 right-2 px-2 py-1 text-xs font-medium text-white bg-black/50 rounded-full">
                    {currentImageIndex + 1} / {images.length}
                  </span>
                )}
              </div>

              {/* Thumbnails */}
              {hasMultipleImages && (
                <div className="flex gap-2 p-3 overflow-x-auto">
                  {images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                        index === currentImageIndex ? 'border-blue-500' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right - Product Details */}
            <div className="md:w-1/2 flex flex-col min-h-0 md:flex-1 md:overflow-hidden">
              {/* Header with copy link and close button - desktop */}
              <div className="hidden md:flex items-center justify-between p-4 border-b border-gray-100">
                <div className="relative">
                  <button
                    onClick={copyLink}
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors flex items-center gap-2"
                    title="Copiar link"
                  >
                    {linkCopied ? (
                      <>
                        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-sm text-green-500 font-medium">Link copiado!</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <span className="text-sm text-gray-500">Copiar link</span>
                      </>
                    )}
                  </button>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Product info - fixed header section */}
              <div className="p-4 md:p-6 pb-2 md:pb-2">
                {/* Category badge */}
                {product.category && (
                  <span
                    className="inline-block px-3 py-1 text-xs font-bold text-white rounded mb-3"
                    style={{ backgroundColor: '#FF8C00' }}
                  >
                    {product.category}
                  </span>
                )}

                {/* Title */}
                <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-3">
                  {product.name}
                </h2>

                {/* Price */}
                <div className="mb-4">
                  {product.sale_price && product.sale_price < product.price ? (
                    <div className="flex items-center gap-3">
                      <span className="text-lg text-gray-400 line-through">
                        {formatPrice(product.price)}
                      </span>
                      <span
                        className="text-2xl md:text-3xl font-bold"
                        style={{ color: '#00AA00' }}
                      >
                        {formatPrice(product.sale_price)}
                      </span>
                    </div>
                  ) : (
                    <span
                      className="text-2xl md:text-3xl font-bold"
                      style={{ color: '#003DA5' }}
                    >
                      {formatPrice(product.price)}
                    </span>
                  )}
                </div>

                {/* Item code */}
                {product.item_code && (
                  <p className="text-sm text-gray-500 mb-2">
                    REF: {product.item_code}
                  </p>
                )}
              </div>

              {/* Description - scrollable section on desktop */}
              <div className="md:flex-1 md:overflow-y-auto md:min-h-0 px-4 md:px-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Descricao</h3>
                <p className="text-gray-600 whitespace-pre-line leading-relaxed pb-4">
                  {product.description || 'Produto de qualidade Valdir Moveis'}
                </p>
              </div>

              {/* Footer with WhatsApp button - always visible */}
              <div className="p-4 border-t border-gray-100 bg-white">
                <button
                  className="w-full py-3 rounded-lg font-bold text-black transition-colors hover:opacity-90 flex items-center justify-center gap-2"
                  style={{ backgroundColor: '#00FF00' }}
                  onClick={() => onWhatsApp(product)}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Tenho Interesse
                </button>
              </div>
            </div>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
