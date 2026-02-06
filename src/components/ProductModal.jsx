import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function ProductModal({ product, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || '',
    sale_price: product?.sale_price || '',
    item_code: product?.item_code || '',
    category: product?.category || '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Array de imagens do produto
  const images = product?.images || []

  function handleChange(e) {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Monta objeto apenas com campos que têm valor
    const updateData = {
      name: formData.name,
      description: formData.description || null,
      price: formData.price ? parseFloat(formData.price) : null,
      sale_price: formData.sale_price ? parseFloat(formData.sale_price) : null,
      item_code: formData.item_code || null,
      category: formData.category || null,
    }

    console.log('Atualizando produto ID:', product.id, 'Tipo:', typeof product.id)

    const { data, error: updateError } = await supabase
      .from('produtos')
      .update(updateData)
      .eq('id', Number(product.id))
      .select()

    if (updateError) {
      console.error('Erro Supabase:', updateError)
      setError(`Erro ao atualizar produto: ${updateError.message}`)
      setLoading(false)
    } else if (!data || data.length === 0) {
      console.error('Nenhuma linha atualizada. Verifique as políticas RLS no Supabase.')
      setError('Erro: Não foi possível atualizar. Verifique as permissões no banco de dados.')
      setLoading(false)
    } else {
      onSave(data[0])
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            Editar Produto
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            &times;
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Preview das imagens */}
          {images.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">
                Imagens ({images.length})
              </p>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {images.map((img, index) => (
                  <img
                    key={index}
                    src={img}
                    alt={`${formData.name} - ${index + 1}`}
                    className="h-24 w-24 object-cover rounded border flex-shrink-0"
                    onError={(e) => e.target.style.display = 'none'}
                  />
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descricao
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preco (R$)
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preco Promocional (R$)
              </label>
              <input
                type="number"
                name="sale_price"
                value={formData.sale_price}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Codigo do Item
              </label>
              <input
                type="text"
                name="item_code"
                value={formData.item_code}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoria
              </label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-800 py-2 rounded hover:bg-gray-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
