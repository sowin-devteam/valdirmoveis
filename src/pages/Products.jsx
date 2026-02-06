import { useEffect, useState } from 'react'
import ProductModal from '../components/ProductModal'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

export default function Products() {
  const { user, signOut } = useAuth()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  // Filtra produtos pelo termo de busca
  const filteredProducts = products.filter(product => {
    if (!searchTerm.trim()) return true
    const term = searchTerm.toLowerCase()
    const nameMatch = product.name?.toLowerCase().includes(term)
    const descMatch = product.description?.toLowerCase().includes(term)
    return nameMatch || descMatch
  })

  useEffect(() => {
    fetchProducts()
  }, [])

  async function fetchProducts() {
    setLoading(true)
    const { data, error } = await supabase
      .from('produtos')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro ao buscar produtos:', error)
    } else {
      setProducts(data || [])
    }
    setLoading(false)
  }

  async function handleDelete(product) {
    const { error } = await supabase
      .from('produtos')
      .delete()
      .eq('id', product.id)

    if (error) {
      alert('Erro ao excluir produto')
    } else {
      setProducts(products.filter(p => p.id !== product.id))
      setDeleteConfirm(null)
    }
  }

  function handleEdit(product) {
    setSelectedProduct(product)
    setIsModalOpen(true)
  }

  function handleModalClose() {
    setIsModalOpen(false)
    setSelectedProduct(null)
  }

  function handleProductUpdated(updatedProduct) {
    setProducts(products.map(p =>
      p.id === updatedProduct.id ? updatedProduct : p
    ))
    handleModalClose()
  }

  function formatPrice(price) {
    if (!price) return 'N/A'
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price)
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4">
          {/* Linha 1: Logo + User info */}
          <div className="flex justify-between items-center">
            <img src="/logo-valdir.png" alt="Valdir" className="h-10" />
            <div className="flex items-center gap-2 sm:gap-4">
              <span className="text-gray-600 text-sm sm:text-base">
                Olá, {user?.nome || user?.email}
              </span>
              <button
                onClick={signOut}
                className="bg-red-500 text-white px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base rounded hover:bg-red-600"
              >
                Sair
              </button>
            </div>
          </div>
          {/* Linha 2: Título */}
          <div className="flex items-center gap-2 mt-3">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
              Produtos do catálogo
            </h1>
            <button
              onClick={fetchProducts}
              disabled={loading}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
              title="Recarregar produtos"
            >
              <svg
                className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-xl font-semibold text-gray-700">
            Lista de Produtos ({filteredProducts.length}{searchTerm ? ` de ${products.length}` : ''})
          </h2>
          <div className="flex gap-2 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Buscar por nome ou descricao..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 sm:w-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={fetchProducts}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Atualizar
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">
              {searchTerm ? `Nenhum produto encontrado para "${searchTerm}"` : 'Nenhum produto encontrado'}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="mt-2 text-blue-500 hover:underline"
              >
                Limpar busca
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map(product => (
              <div key={product.id} className="bg-white rounded-lg shadow overflow-hidden">
                {/* Imagem */}
                <div className="h-48 bg-gray-200 flex items-center justify-center">
                  {product.images?.[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-400">Sem imagem</span>
                  )}
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 truncate" title={product.name}>
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                    {product.description || 'Sem descrição'}
                  </p>
                  <p className="text-lg font-bold text-green-600 mt-2">
                    {formatPrice(product.price)}
                  </p>

                  {/* Actions */}
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => handleEdit(product)}
                      className="flex-1 bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
                    >
                      Editar
                    </button>
                    {deleteConfirm === product.id ? (
                      <div className="flex-1 flex gap-1">
                        <button
                          onClick={() => handleDelete(product)}
                          className="flex-1 bg-red-600 text-white py-2 rounded hover:bg-red-700 text-sm"
                        >
                          Confirmar
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="flex-1 bg-gray-400 text-white py-2 rounded hover:bg-gray-500 text-sm"
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(product.id)}
                        className="flex-1 bg-red-500 text-white py-2 rounded hover:bg-red-600"
                      >
                        Excluir
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal de Edição */}
      {isModalOpen && (
        <ProductModal
          product={selectedProduct}
          onClose={handleModalClose}
          onSave={handleProductUpdated}
        />
      )}
    </div>
  )
}
