import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import CepModal from '../components/CepModal'
import ProductCard from '../components/ProductCard'
import ProductDetailModal from '../components/ProductDetailModal'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

// Categorias fixas com icones
// mobileOnly: true = aparece apenas no mobile
const CATEGORIES = [
  { id: 'estofado', name: 'Estofado', icon: (
    // Sofá com almofadas
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 14v2a2 2 0 002 2h12a2 2 0 002-2v-2M4 14v-2a2 2 0 012-2h1V8a2 2 0 012-2h6a2 2 0 012 2v2h1a2 2 0 012 2v2M4 14h16M9 10h6M6 18v2M18 18v2" />
    </svg>
  )},
  { id: 'roupeiro', name: 'Roupeiro', icon: (
    // Guarda-roupa com portas
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 3h16v18H4V3zM12 3v18M8 10v2M16 10v2M6 21v1M18 21v1" />
    </svg>
  )},
  { id: 'cozinha modulada', name: 'Cozinha Modulada', icon: (
    // Armários modulares
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5h18v14H3V5zM3 12h18M12 5v14M7 8v1M7 15v1M17 8v1M17 15v1" />
    </svg>
  )},
  { id: 'cozinha compacta', name: 'Cozinha Compacta', icon: (
    // Cozinha menor com pia
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16v12H4V6zM4 12h16M9 6v6M15 6v6M7 15h2M15 15h2M11 3v3M13 3v3" />
    </svg>
  )},
  { id: 'rack', name: 'Rack', icon: (
    // Rack com TV
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2 16h20v4H2v-4zM6 16V8h12v8M6 19h2M16 19h2M9 11h6M9 13h6" />
    </svg>
  )},
  { id: 'mesa', name: 'Mesa', icon: (
    // Mesa simples
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18v2H3v-2zM5 12v8M19 12v8M8 12v8M16 12v8" />
    </svg>
  )},
  { id: 'sala de jantar', name: 'Sala de Jantar', icon: (
    // Mesa com cadeiras
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 10h12v2H6v-2zM8 12v6M16 12v6M3 8v10M3 8h2v4H3M21 8v10M21 8h-2v4h2" />
    </svg>
  )},
  { id: 'cama casal', name: 'Cama Casal', icon: (
    // Cama de casal com cabeceira
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2 18h20M2 14h20v4H2v-4zM4 14V8a2 2 0 012-2h12a2 2 0 012 2v6M8 11h3v3H8v-3zM13 11h3v3h-3v-3z" />
    </svg>
  )},
  { id: 'cama solteiro', name: 'Cama Solteiro', icon: (
    // Cama de solteiro menor
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 18h16M4 14h16v4H4v-4zM6 14V9a2 2 0 012-2h8a2 2 0 012 2v5M10 11h4v3h-4v-3z" />
    </svg>
  )},
  // Categorias extras - apenas mobile
  { id: 'comoda', name: 'Cômoda', mobileOnly: true, icon: (
    // Cômoda com gavetas
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4h16v16H4V4zM4 9h16M4 14h16M8 6.5h2M8 11.5h2M8 16.5h2M14 6.5h2M14 11.5h2M14 16.5h2" />
    </svg>
  )},
  { id: 'cadeira', name: 'Cadeira', mobileOnly: true, icon: (
    // Cadeira
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 4v8h10V4M7 12v2h10v-2M9 14v6M15 14v6M7 18h10" />
    </svg>
  )},
  { id: 'mesa de cabeceira', name: 'Mesa Cabeceira', mobileOnly: true, icon: (
    // Mesa de cabeceira pequena
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 6h12v12H6V6zM6 11h12M10 8.5h4M10 14.5h4M8 18v2M16 18v2" />
    </svg>
  )},
  { id: 'cabeceira casal', name: 'Cabeceira Casal', mobileOnly: true, icon: (
    // Cabeceira de cama
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8h18v10H3V8zM3 8c0-2 2-4 4-4h10c2 0 4 2 4 4M8 12v3M12 11v4M16 12v3" />
    </svg>
  )},
  { id: 'multiuso', name: 'Multiuso', mobileOnly: true, icon: (
    // Estante multiuso
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 3h16v18H4V3zM4 8h16M4 13h16M4 18h16M9 3v18" />
    </svg>
  )},
  { id: 'sapateira', name: 'Sapateira', mobileOnly: true, icon: (
    // Sapateira com prateleiras
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 4h14v16H5V4zM5 9h14M5 14h14M8 6.5h3M13 6.5h3M8 11.5h3M13 11.5h3M8 16.5h3M13 16.5h3" />
    </svg>
  )},
  { id: 'balcão pia', name: 'Balcão Pia', mobileOnly: true, icon: (
    // Balcão com pia
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18v10H3V10zM3 10V8h18v2M8 10v4a2 2 0 004 0v-4M17 13v4M17 10v1" />
    </svg>
  )},
  { id: 'penteadeira', name: 'Penteadeira', mobileOnly: true, icon: (
    // Penteadeira com espelho
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 14h12v6H6v-6zM8 14v-2h8v2M9 17h2M13 17h2M9 3h6v8H9V3zM12 6v2" />
    </svg>
  )},
  { id: 'cristaleira', name: 'Cristaleira', mobileOnly: true, icon: (
    // Cristaleira com vidro
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3h14v18H5V3zM5 10h14M5 16h14M9 6h6M9 13h6M8 19v2M16 19v2" />
    </svg>
  )},
  { id: 'poltrona', name: 'Poltrona', mobileOnly: true, icon: (
    // Poltrona individual
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 16v2a1 1 0 001 1h10a1 1 0 001-1v-2M5 11v5h14v-5M5 11a2 2 0 012-2h1V7a2 2 0 012-2h4a2 2 0 012 2v2h1a2 2 0 012 2M7 19v2M17 19v2" />
    </svg>
  )},
  { id: 'conjunto box', name: 'Conjunto Box', mobileOnly: true, icon: (
    // Cama box com colchão
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16h18v4H3v-4zM3 12h18v4H3v-4zM6 12V9a1 1 0 011-1h10a1 1 0 011 1v3M8 10h8" />
    </svg>
  )},
  { id: 'mesa lateral', name: 'Mesa Lateral', mobileOnly: true, icon: (
    // Mesa lateral pequena
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 8h10v2H7V8zM8 10v8M16 10v8M10 10v4h4v-4" />
    </svg>
  )},
  { id: 'aparador', name: 'Aparador', mobileOnly: true, icon: (
    // Aparador estreito
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 10h16v8H4v-8zM4 10V8h16v2M7 13h3M14 13h3M6 18v2M18 18v2" />
    </svg>
  )},
  { id: 'buffet', name: 'Buffet', mobileOnly: true, icon: (
    // Buffet com portas
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8h18v10H3V8zM3 8V6h18v2M12 8v10M7 12v2M17 12v2M5 18v2M19 18v2" />
    </svg>
  )},
  { id: 'painel', name: 'Painel', mobileOnly: true, icon: (
    // Painel de TV
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4h16v16H4V4zM8 9h8v6H8V9zM4 20h16" />
    </svg>
  )},
  { id: 'home', name: 'Home', mobileOnly: true, icon: (
    // Home theater/estante
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4h18v16H3V4zM3 12h5v8H3v-8zM16 12h5v8h-5v-8zM8 8h8v6H8V8zM8 14h8v6H8v-6z" />
    </svg>
  )},
]

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState(searchParams.get('busca') || '')
  const [lojaSelecionada, setLojaSelecionada] = useState(null)
  const [showCepModal, setShowCepModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [showStickyCategories, setShowStickyCategories] = useState(false)
  const [categorySlide, setCategorySlide] = useState(0)
  const categoriesSectionRef = useRef(null)
  const { user, loading: authLoading } = useAuth()

  // Divide categorias em slides de 7 para o desktop
  const CATEGORIES_PER_SLIDE = 7
  const totalSlides = Math.ceil(CATEGORIES.length / CATEGORIES_PER_SLIDE)

  // Carrega loja salva do localStorage
  useEffect(() => {
    // Espera o auth terminar de carregar
    if (authLoading) return

    const lojaSalva = localStorage.getItem('valdir_loja')
    if (lojaSalva) {
      setLojaSelecionada(JSON.parse(lojaSalva))
    } else {
      // Não abre modal de CEP se:
      // - tiver produto na URL (link compartilhado)
      // - admin estiver logado
      const hasProductParam = searchParams.get('produto')
      if (!hasProductParam && !user) {
        setShowCepModal(true)
      }
    }
  }, [user, authLoading])

  // Observa quando a seção de categorias sai da viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Mostra a barra sticky quando a seção de categorias não está mais visível
        setShowStickyCategories(!entry.isIntersecting)
      },
      { threshold: 0, rootMargin: '-80px 0px 0px 0px' }
    )

    if (categoriesSectionRef.current) {
      observer.observe(categoriesSectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  function handleLojaSelected(loja) {
    setLojaSelecionada(loja)
    setShowCepModal(false)
  }

  function handleTrocarLoja() {
    setShowCepModal(true)
  }

  function handleWhatsApp(product) {
    const whatsapp = lojaSelecionada?.whatsapp || '5547999254612'
    const itemCode = product.item_code || product.id
    const message = `Ola! Tenho interesse no produto: ${product.name}\n\nREF:${itemCode}`
    window.open(`https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`, '_blank')
  }

  // Abre o modal e atualiza a URL
  function handleOpenProduct(product) {
    setSelectedProduct(product)
    const newParams = new URLSearchParams(searchParams)
    newParams.set('produto', product.id)
    setSearchParams(newParams)
  }

  // Fecha o modal e remove o produto da URL
  function handleCloseProduct() {
    setSelectedProduct(null)
    const newParams = new URLSearchParams(searchParams)
    newParams.delete('produto')
    setSearchParams(newParams)
  }

  // Atualiza o input quando a URL muda
  useEffect(() => {
    const urlSearch = searchParams.get('busca') || ''
    setSearchTerm(urlSearch)
  }, [searchParams])

  // Abre o modal se tiver produto na URL
  useEffect(() => {
    const productId = searchParams.get('produto')
    if (productId && products.length > 0 && !selectedProduct) {
      const product = products.find(p => String(p.id) === productId)
      if (product) {
        setSelectedProduct(product)
      }
    }
  }, [searchParams, products, selectedProduct])

  // Atualiza a URL quando o input muda
  function handleSearchChange(value) {
    setSearchTerm(value)
    if (value.trim()) {
      setSearchParams({ busca: value })
    } else {
      setSearchParams({})
    }
  }

  // Seleciona categoria e atualiza URL
  function handleCategoryClick(categoryId) {
    if (searchTerm.toLowerCase() === categoryId.toLowerCase()) {
      // Se ja esta selecionada, limpa
      setSearchTerm('')
      setSearchParams({})
    } else {
      setSearchTerm(categoryId)
      setSearchParams({ busca: categoryId })
    }
    // Scroll para produtos com offset extra
    setTimeout(() => {
      const el = document.getElementById('produtos')
      if (el) {
        const y = el.getBoundingClientRect().top + window.scrollY + 10
        window.scrollTo({ top: y, behavior: 'smooth' })
      }
    }, 50)
  }

  const normalize = (str) =>
    str?.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') || ''

  const filteredProducts = products.filter(product => {
    if (!searchTerm.trim()) return true
    const term = normalize(searchTerm)
    const nameMatch = normalize(product.name).includes(term)
    const descMatch = normalize(product.description).includes(term)
    const categoryMatch = normalize(product.category).includes(term)
    return nameMatch || descMatch || categoryMatch
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

  function formatPrice(price) {
    if (!price) return 'Consulte'
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price)
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#FFD700' }}>
      {/* Header */}
      <header style={{ backgroundColor: '#003DA5' }} className="shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <Link to="/" className="flex items-center gap-2">
              <img src="/logo-valdir.png" alt="Valdir Moveis" className="h-12 brightness-0 invert" />
            </Link>

            {/* Search Bar */}
            <div className="hidden md:flex flex-1 max-w-xl mx-8">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Buscar produtos..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full px-4 py-2 rounded-l-lg border-0 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
                <button
                  className="absolute right-0 top-0 h-full px-4 rounded-r-lg"
                  style={{ backgroundColor: '#00FF00' }}
                  onClick={() => document.getElementById('produtos')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </div>

            <nav className="flex items-center gap-1.5 min-[420px]:gap-2 sm:gap-3">
              {/* Loja selecionada */}
              {lojaSelecionada && (
                <button
                  onClick={handleTrocarLoja}
                  className="flex items-center gap-1 p-1.5 min-[420px]:px-2 min-[420px]:py-1 sm:px-3 sm:py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white text-xs sm:text-sm"
                  title="Clique para trocar de loja"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="hidden min-[420px]:inline">{lojaSelecionada.nome}</span>
                </button>
              )}

              {/* Redes Sociais */}
              <div className="flex items-center gap-1 sm:gap-2">
                {/* Facebook */}
                <a
                  href="https://www.facebook.com/valdirmoveisitajai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 sm:p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
                  title="Facebook"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>

                {/* Instagram */}
                <a
                  href="https://www.instagram.com/valdirmoveisitajai/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 sm:p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
                  title="Instagram"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                  </svg>
                </a>

                {/* WhatsApp */}
                <a
                  href={`https://wa.me/${lojaSelecionada?.whatsapp || '5547999254612'}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 sm:p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
                  title={`WhatsApp ${lojaSelecionada?.nome || 'Cordeiros'}`}
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </a>
              </div>
            </nav>
          </div>

          {/* Mobile Search */}
          <div className="md:hidden mt-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Sticky Categories Bar - fixed com z-index menor que header, desliza de baixo do header */}
      <div
        className={`fixed left-0 right-0 top-[124px] md:top-[72px] z-30 transition-transform duration-300 ease-out shadow-md ${
          showStickyCategories ? 'translate-y-0' : '-translate-y-full'
        }`}
        style={{ backgroundColor: '#FFD700' }}
      >
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {CATEGORIES.map(category => {
              const isActive = searchTerm.toLowerCase() === category.id.toLowerCase()
              return (
                <button
                  key={category.id}
                  onClick={() => handleCategoryClick(category.id)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors whitespace-nowrap ${
                    isActive
                      ? 'text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                  style={isActive ? { backgroundColor: '#003DA5' } : {}}
                >
                  {category.name}
                </button>
              )
            })}
            {/* Botão Limpar no desktop - dentro da barra */}
            {searchTerm && (
              <button
                onClick={() => handleSearchChange('')}
                className="hidden lg:flex flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold bg-red-500 text-white hover:bg-red-600 transition-colors whitespace-nowrap items-center gap-1"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Limpar
              </button>
            )}
          </div>
          {/* Botão Limpar no mobile - embaixo das categorias */}
          {searchTerm && (
            <div className="lg:hidden flex justify-end mt-2">
              <button
                onClick={() => handleSearchChange('')}
                className="text-xs text-gray-700 hover:text-red-600 transition-colors flex items-center gap-1"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Limpar filtro
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Hero Banner */}
      <section style={{ backgroundColor: '#1a1a1a' }} className="py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
            <span style={{ color: '#FFD700' }}>Valdir Moveis Itajaí</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-8">
            Os melhores moveis para sua casa com qualidade e preco justo
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#produtos"
              className="inline-block px-8 py-3 rounded-lg font-bold text-black transition-transform hover:scale-105"
              style={{ backgroundColor: '#00FF00' }}
            >
              Ver Produtos
            </a>
            <a
              href="/Tabloide_Fevereiro_Final.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-8 py-3 rounded-lg font-bold text-black transition-transform hover:scale-105"
              style={{ backgroundColor: '#FFD700' }}
            >
              Ver Ofertas do Mês
            </a>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section ref={categoriesSectionRef} className="py-8" style={{ backgroundColor: '#FFD700' }}>
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-6" style={{ color: '#003DA5' }}>
            Categorias
          </h2>

          {/* Mobile: Grid com todas as categorias */}
          <div className="lg:hidden grid grid-cols-2 sm:grid-cols-4 gap-3">
            {CATEGORIES.map(category => {
              const isActive = searchTerm.toLowerCase() === category.id.toLowerCase()
              return (
                <button
                  key={category.id}
                  onClick={() => handleCategoryClick(category.id)}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-200 hover:scale-105 ${
                    isActive
                      ? 'text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:shadow-md'
                  }`}
                  style={isActive ? { backgroundColor: '#003DA5' } : {}}
                >
                  <div className={isActive ? 'text-white' : 'text-gray-600'}>
                    {category.icon}
                  </div>
                  <span className="mt-2 text-xs font-semibold text-center leading-tight">
                    {category.name}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Desktop: Carousel com setas e bullets */}
          <div className="hidden lg:block">
            <div className="relative">
              {/* Seta Esquerda */}
              <button
                onClick={() => setCategorySlide(prev => (prev > 0 ? prev - 1 : totalSlides - 1))}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
                style={{ color: '#003DA5' }}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              {/* Slides Container */}
              <div className="overflow-hidden">
                <div
                  className="flex transition-transform duration-300 ease-in-out"
                  style={{ transform: `translateX(-${categorySlide * 100}%)` }}
                >
                  {Array.from({ length: totalSlides }).map((_, slideIndex) => (
                    <div key={slideIndex} className="w-full flex-shrink-0">
                      <div className="grid grid-cols-7 gap-3">
                        {CATEGORIES.slice(
                          slideIndex * CATEGORIES_PER_SLIDE,
                          (slideIndex + 1) * CATEGORIES_PER_SLIDE
                        ).map(category => {
                          const isActive = searchTerm.toLowerCase() === category.id.toLowerCase()
                          return (
                            <button
                              key={category.id}
                              onClick={() => handleCategoryClick(category.id)}
                              className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-200 hover:scale-105 ${
                                isActive
                                  ? 'text-white shadow-lg'
                                  : 'bg-white text-gray-700 hover:shadow-md'
                              }`}
                              style={isActive ? { backgroundColor: '#003DA5' } : {}}
                            >
                              <div className={isActive ? 'text-white' : 'text-gray-600'}>
                                {category.icon}
                              </div>
                              <span className="mt-2 text-xs font-semibold text-center leading-tight">
                                {category.name}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Seta Direita */}
              <button
                onClick={() => setCategorySlide(prev => (prev < totalSlides - 1 ? prev + 1 : 0))}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
                style={{ color: '#003DA5' }}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Bullets */}
            <div className="flex justify-center gap-2 mt-4">
              {Array.from({ length: totalSlides }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCategorySlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-200 ${
                    categorySlide === index
                      ? 'w-6'
                      : 'bg-white/60 hover:bg-white/80'
                  }`}
                  style={categorySlide === index ? { backgroundColor: '#003DA5' } : {}}
                />
              ))}
            </div>
          </div>

          {searchTerm && (
            <div className="mt-4 text-center">
              <button
                onClick={() => handleSearchChange('')}
                className="px-4 py-2 bg-white rounded-full text-sm font-medium hover:bg-gray-100 transition-colors"
                style={{ color: '#003DA5' }}
              >
                Limpar filtro: "{searchTerm}"
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Products Grid */}
      <main id="produtos" className="flex-1 py-8" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold" style={{ color: '#1a1a1a' }}>
              Nossos Produtos
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({filteredProducts.length} {filteredProducts.length === 1 ? 'produto' : 'produtos'})
              </span>
            </h2>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div
                className="animate-spin rounded-full h-12 w-12 border-4 border-t-transparent"
                style={{ borderColor: '#003DA5', borderTopColor: 'transparent' }}
              ></div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500 text-lg">
                {searchTerm
                  ? `Nenhum produto encontrado para "${searchTerm}"`
                  : 'Nenhum produto disponivel no momento'}
              </p>
              {searchTerm && (
                <button
                  onClick={() => handleSearchChange('')}
                  className="mt-4 px-4 py-2 rounded-lg text-white"
                  style={{ backgroundColor: '#003DA5' }}
                >
                  Limpar filtros
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onOpenDetail={handleOpenProduct}
                  onWhatsApp={handleWhatsApp}
                  formatPrice={formatPrice}
                  isAdmin={!!user}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer style={{ backgroundColor: '#2a2a2a' }} className="py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-gray-300">
            {/* Logo e Redes Sociais */}
            <div>
              <img src="/logo-valdir.png" alt="Valdir Moveis" className="h-12 brightness-0 invert mb-4" />
              <p className="text-sm mb-4">
                Qualidade e confianca em moveis para toda sua casa.
              </p>
              {/* Redes Sociais */}
              <div className="flex gap-3">
                <a
                  href="https://www.facebook.com/valdirmoveisitajai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-gray-700 hover:bg-blue-600 flex items-center justify-center transition-colors"
                  title="Facebook"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a
                  href="https://www.instagram.com/valdirmoveisitajai/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-gray-700 hover:bg-pink-600 flex items-center justify-center transition-colors"
                  title="Instagram"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Loja Cordeiros */}
            <div>
              <h4 className="font-bold text-white mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" style={{ color: '#FFD700' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Loja Cordeiros
              </h4>
              <ul className="space-y-2 text-sm">
                <li className="text-gray-400">
                  R. Dr. Reinaldo Schmithausen, 1429<br />
                  Cordeiros - Itajai/SC<br />
                  CEP: 88310-002
                </li>
                <li className="pt-2">
                  <a
                    href="https://wa.me/5547999254612"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-green-400 hover:text-green-300 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    (47) 99925-4612
                  </a>
                </li>
              </ul>
            </div>

            {/* Loja Sao Vicente */}
            <div>
              <h4 className="font-bold text-white mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" style={{ color: '#FFD700' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Loja Sao Vicente
              </h4>
              <ul className="space-y-2 text-sm">
                <li className="text-gray-400">
                  R. Estefano Jose Vanolli, 1088<br />
                  Sao Vicente - Itajai/SC<br />
                  CEP: 88309-202
                </li>
                <li className="pt-2">
                  <a
                    href="https://wa.me/554731701328"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-green-400 hover:text-green-300 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    (47) 3170-1328
                  </a>
                </li>
              </ul>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-bold text-white mb-4">Links</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#produtos" className="hover:text-yellow-400 transition-colors">Produtos</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) }} className="hover:text-yellow-400 transition-colors">Voltar ao topo</a></li>
                <li><Link to="/login" className="hover:text-yellow-400 transition-colors">Area Administrativa</Link></li>
                <li><a href="https://valdirchat.vertex21.com.br" target="_blank" rel="noopener noreferrer" className="hover:text-yellow-400 transition-colors">Valdir Chat Interno</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-400 text-sm">
            <p>&copy; 2026 Valdir Móveis Itajaí. Todos os direitos reservados.</p>
            <p className="mt-2">
              Desenvolvido por{' '}
              <a
                href="https://vertex21.com.br"
                target="_blank"
                rel="noopener noreferrer"
                className="text-yellow-400 hover:text-yellow-300 transition-colors"
              >
                Vertex21
              </a>
            </p>
          </div>
        </div>
      </footer>

      {/* Modal de CEP */}
      {showCepModal && (
        <CepModal
          onLojaSelected={handleLojaSelected}
          lojaAtual={lojaSelecionada}
          onClose={() => setShowCepModal(false)}
        />
      )}

      {/* Modal de Detalhes do Produto */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={handleCloseProduct}
          onWhatsApp={handleWhatsApp}
          formatPrice={formatPrice}
        />
      )}
    </div>
  )
}
