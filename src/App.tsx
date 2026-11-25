/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Menu,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Star,
  ThumbsUp,
  Truck,
  ShieldCheck,
  Lock,
  Sparkles,
  Mail,
  Clock,
  RotateCcw,
  Tag,
  House,
  ZoomIn,
  FileText,
  BadgeCheck,
  Award,
  SlidersHorizontal,
  MessageSquarePlus,
  ArrowRight,
  Package,
  X,
  ShoppingBag,
  Check,
  CheckCircle2,
  Zap,
  Droplets,
  Gauge,
  Snowflake,
  Plug
} from 'lucide-react';
import { CustomerReview } from './types';

interface ShippingData {
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

export default function App() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const isHorizontalSwipeRef = useRef<boolean | null>(null);
  const thumbnailsContainerRef = useRef<HTMLDivElement>(null);
  const [isKitExpanded, setIsKitExpanded] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState<string | null>(null);
  const [selectedReviewImage, setSelectedReviewImage] = useState<string | null>(null);
  const [reviewFilter, setReviewFilter] = useState<'all' | 5 | 4>('all');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItemsCount, setCartItemsCount] = useState(0);
  const [showCepInput, setShowCepInput] = useState(false);
  const [cep, setCep] = useState('');
  const [shippingData, setShippingData] = useState<ShippingData | null>(null);
  const [isLoadingCep, setIsLoadingCep] = useState(false);
  const [carouselSlide, setCarouselSlide] = useState(0);
  const [helpfulCounts, setHelpfulCounts] = useState<{ [key: number]: number }>({
    1: 54,
    2: 41,
    3: 33,
    4: 29,
    5: 37,
    6: 22,
    7: 19,
    8: 25,
    9: 16,
    10: 31,
    11: 14,
    12: 27
  });
  const [likedReviews, setLikedReviews] = useState<{ [key: number]: boolean }>({});
  const [expandedReviews, setExpandedReviews] = useState<{ [key: number]: boolean }>({});
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSent, setNewsletterSent] = useState(false);
  const [isVoltageModalOpen, setIsVoltageModalOpen] = useState(false);
  const [selectedVoltage, setSelectedVoltage] = useState<'110V' | '220V' | null>(null);
  const [voltageError, setVoltageError] = useState(false);

  const productData = {
    name: "Máquina de Gelo Turbo Ice Premium Mondial",
    brand: "PRIME STORE",
    subtitle: "Modelo MG-12-GI • Até 12 kg/dia • Gelo em 8 min • Reservatório 1,3L • 110V ou 220V",
    price: "84,59",
    oldPrice: "298,99",
    savings: "214,40",
    discountBadge: "72% OFF",
    rating: "4.9",
    reviewsCount: "612",
    checkoutUrl110: "https://pay.primestoreshop.site/6b05e46d5b33a1b1a840db90",
    checkoutUrl220: "https://pay.primestoreshop.site/6b0607a35b33a1b1a8411e0d"
  };

  const galleryImages = [
    { src: "/images/ice1.webp", thumb: "/images/icet1.webp", alt: "Máquina de Gelo Turbo Ice Premium Mondial MG-12-GI" },
    { src: "/images/ice2.webp", thumb: "/images/icet2.webp", alt: "Máquina de Gelo Mondial - Foto 2" },
    { src: "/images/ice3.webp", thumb: "/images/icet3.webp", alt: "Máquina de Gelo Mondial - Foto 3" },
    { src: "/images/ice4.webp", thumb: "/images/icet4.webp", alt: "Máquina de Gelo Mondial - Foto 4" },
    { src: "/images/ice5.webp", thumb: "/images/icet5.webp", alt: "Máquina de Gelo Mondial - Foto 5" },
    { src: "/images/ice6.webp", thumb: "/images/icet6.webp", alt: "Máquina de Gelo Mondial - Foto 6" },
    { src: "/images/ice7.webp", thumb: "/images/icet7.webp", alt: "Máquina de Gelo Mondial - Foto 7" }
  ];

  const reviews: CustomerReview[] = [
    {
      id: 1,
      name: "Marcelo Henrique",
      date: "Há 1 dia",
      rating: 5,
      verified: true,
      text: "Fiz churrasco domingo aqui em casa e não faltou gelo hora nenhuma. Em menos de 10 minutos já cai a primeira leva de cubinhos, sensacional pelo preço!",
      photos: [
        "/images/rev1.webp",
        "/images/rev2.webp",
        "/images/rev3.webp"
      ]
    },
    {
      id: 2,
      name: "Camila Nogueira",
      date: "Há 2 dias",
      rating: 5,
      verified: true,
      avatar: "/images/avatar2.webp",
      text: "Amei demais! Não precisa de encanamento nenhum, só coloquei na bancada da cozinha, enchi de água e liguei. O visor transparente é super prático.",
      photos: [
        "/images/rev4.webp"
      ]
    },
    {
      id: 3,
      name: "Thiago Barbosa",
      date: "Há 3 dias",
      rating: 5,
      verified: true,
      avatar: "/images/avatar3.webp",
      text: "Peguei a 110V por R$ 84,59 na promoção e chegou tudo lacrado com cesto e pazinha. O inox não fica cheio de marca de dedo, acabamento top.",
      photos: [
        "/images/rev5.webp",
        "/images/rev6.webp"
      ]
    },
    {
      id: 4,
      name: "Fernanda Silveira",
      date: "Há 5 dias",
      rating: 5,
      verified: true,
      text: "Antes eu vivia esquecendo de encher forminha de gelo kkk. Agora todo dia tem gelo fresquinho pro meu suco e pros drinks no fim de semana.",
      photos: [
        "/images/rev7.webp"
      ]
    },
    {
      id: 5,
      name: "Rodrigo Santana",
      date: "Há 1 semana",
      rating: 5,
      verified: true,
      text: "Muito silenciosa e rápida. Escolho o cubo maior pros copos térmicos e o menor pra suco. O painel avisa certinho quando precisa de água.",
      photos: []
    },
    {
      id: 6,
      name: "Patrícia Gomes",
      date: "Há 1 semana",
      rating: 5,
      verified: true,
      text: "Frete grátis chegou em 4 dias aqui em BH! Compacta, coube certinho do lado da cafeteira e gela super bem.",
      photos: []
    },
    {
      id: 7,
      name: "Lucas Mendonça",
      date: "Há 2 semanas",
      rating: 5,
      verified: true,
      text: "Comprei a 220V pro meu espaço gourmet e já usei umas 5 vezes. Produz muito gelo mesmo, valeu cada centavo.",
      photos: []
    },
    {
      id: 8,
      name: "Juliana Pires",
      date: "Há 2 semanas",
      rating: 5,
      verified: true,
      text: "Super fácil de usar e limpar, tem até a tampinha embaixo pra escoar a água. Recomendo de olhos fechados!",
      photos: []
    },
    {
      id: 9,
      name: "Anderson Costa",
      date: "Há 3 semanas",
      rating: 4,
      verified: true,
      text: "Excelente custo-benefício. Nos primeiros dois ciclos os cubos vêm menores, depois estabiliza e faz cubos bem firmes rapidinho.",
      photos: []
    },
    {
      id: 10,
      name: "Beatriz Azevedo",
      date: "Há 1 mês",
      rating: 5,
      verified: true,
      text: "Presenteei meu marido e ele não para de usar nos churrascos com os amigos. Entrega rápida e produto original Mondial.",
      photos: []
    }
  ];

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length === 0) return 'CL';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const getAvatarBg = (id: number) => {
    const colors = [
      'bg-amber-100 text-amber-900 border-amber-300',
      'bg-emerald-100 text-emerald-900 border-emerald-300',
      'bg-sky-100 text-sky-900 border-sky-300',
      'bg-rose-100 text-rose-900 border-rose-300',
      'bg-purple-100 text-purple-900 border-purple-300',
      'bg-teal-100 text-teal-900 border-teal-300',
      'bg-orange-100 text-orange-900 border-orange-300',
      'bg-indigo-100 text-indigo-900 border-indigo-300',
      'bg-neutral-200 text-neutral-900 border-neutral-300'
    ];
    return colors[id % colors.length];
  };

  const checkoutWarmedRef = useRef(false);

  const getCheckoutUrl = (url: string) => {
    const search = typeof window !== 'undefined' ? window.location.search : '';
    const cleanSearch = search.replace(/^\?+/, '');
    if (!cleanSearch) return url;
    if (url.includes('?')) {
      return url.endsWith('?') || url.endsWith('&')
        ? `${url}${cleanSearch}`
        : `${url}&${cleanSearch}`;
    }
    return `${url}?${cleanSearch}`;
  };

  const warmCheckout = () => {
    if (checkoutWarmedRef.current || typeof document === 'undefined') return;
    checkoutWarmedRef.current = true;
    [productData.checkoutUrl110, productData.checkoutUrl220].forEach((rawUrl) => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.as = 'document';
      link.href = getCheckoutUrl(rawUrl);
      document.head.appendChild(link);
    });
  };

  useEffect(() => {
    warmCheckout();

    // Garante as demais fotos da galeria em memória rapidamente sem competir com a principal
    galleryImages.slice(1).forEach((item) => {
      const img = new Image();
      img.decoding = 'async';
      img.src = item.src;
    });
  }, []);

  useEffect(() => {
    const thumbEl = document.getElementById(`gallery-thumb-${currentImageIndex}`);
    if (thumbEl && thumbnailsContainerRef.current) {
      thumbEl.scrollIntoView({ behavior: 'smooth', inline: 'nearest', block: 'nearest' });
    }
  }, [currentImageIndex]);

  const handleGalleryTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
    isHorizontalSwipeRef.current = null;
  };

  const handleGalleryTouchMove = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null || touchStartYRef.current === null) return;
    const dx = e.touches[0].clientX - touchStartXRef.current;
    const dy = e.touches[0].clientY - touchStartYRef.current;

    if (isHorizontalSwipeRef.current === null && (Math.abs(dx) > 6 || Math.abs(dy) > 6)) {
      isHorizontalSwipeRef.current = Math.abs(dx) > Math.abs(dy);
    }

    if (isHorizontalSwipeRef.current) {
      const atStart = currentImageIndex === 0 && dx > 0;
      const atEnd = currentImageIndex === galleryImages.length - 1 && dx < 0;
      setSwipeOffset(atStart || atEnd ? dx * 0.25 : dx);
    }
  };

  const handleGalleryTouchEnd = () => {
    if (isHorizontalSwipeRef.current) {
      if (swipeOffset < -40 && currentImageIndex < galleryImages.length - 1) {
        setCurrentImageIndex(prev => prev + 1);
      } else if (swipeOffset > 40 && currentImageIndex > 0) {
        setCurrentImageIndex(prev => prev - 1);
      }
    }
    setSwipeOffset(0);
    touchStartXRef.current = null;
    touchStartYRef.current = null;
    isHorizontalSwipeRef.current = null;
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 450) {
        setShowStickyBar(true);
      } else {
        setShowStickyBar(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleBuyNow = () => {
    warmCheckout();
    setVoltageError(false);
    setIsCartOpen(false);
    setIsVoltageModalOpen(true);
  };

  const handleConfirmVoltageAndProceed = () => {
    if (!selectedVoltage) {
      setVoltageError(true);
      return;
    }

    const baseCheckoutUrl =
      selectedVoltage === '220V' ? productData.checkoutUrl220 : productData.checkoutUrl110;
    const targetUrl = getCheckoutUrl(baseCheckoutUrl);

    window.location.href = targetUrl;
  };

  const handleCepLookup = async () => {
    if (cep.length !== 8) return;
    setIsLoadingCep(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();
      if (data.erro) {
        setShippingData(null);
        alert('CEP não encontrado. Por favor verifique o número.');
      } else {
        setShippingData(data);
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
    } finally {
      setIsLoadingCep(false);
    }
  };

  const toggleAccordion = (name: string) => {
    setActiveAccordion(prev => (prev === name ? null : name));
  };

  const handleLikeReview = (id: number) => {
    if (likedReviews[id]) return;
    setHelpfulCounts(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
    setLikedReviews(prev => ({ ...prev, [id]: true }));
  };

  const toggleExpandReview = (id: number) => {
    setExpandedReviews(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredReviews = reviews.filter(r => {
    if (reviewFilter === 'all') return true;
    return r.rating === reviewFilter;
  });

  return (
    <div className="min-h-screen flex flex-col bg-white text-neutral-900 overflow-x-hidden font-sans selection:bg-black selection:text-white">
      {/* Conteúdo principal da loja */}
      <div className="flex flex-col flex-1">
        {/* 1. Header Preto Exato (conforme referência enviada) + Faixa Black Friday em Movimento */}
        <div className="sticky top-0 z-40">
          <header className="bg-black text-white">
            <div className="container mx-auto px-4 h-14 sm:h-16 flex items-center justify-between gap-4">
              {/* Left: Hamburger Menu & Search */}
              <div className="flex items-center gap-4 sm:gap-5 flex-1">
                <button
                  type="button"
                  className="p-1.5 -ml-1.5 text-white hover:opacity-75 transition-opacity cursor-pointer"
                  aria-label="Abrir descrição do produto"
                  id="btn-mobile-menu"
                  onClick={() => {
                    const el = document.getElementById('descricao-produto');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  <Menu className="w-6 h-6 stroke-[1.75]" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('avaliacoes-section');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="p-1.5 text-white hover:opacity-75 transition-opacity cursor-pointer"
                  aria-label="Ir para avaliações"
                  id="btn-open-search"
                >
                  <Search className="w-5 h-5 stroke-[1.75]" />
                </button>
              </div>

              {/* Center: Logo PRIME STORE em Branco exatamente como no banner */}
              <div className="flex items-center justify-center shrink-0">
                <a
                  href={typeof window !== 'undefined' ? `${window.location.pathname}${window.location.search}` : '#'}
                  onClick={(e) => {
                    e.preventDefault();
                    window.location.href = `${window.location.pathname}${window.location.search}`;
                  }}
                  className="flex flex-col items-center justify-center select-none group"
                  id="brand-logo-link"
                  aria-label="PRIME STORE"
                >
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    <span className="h-[1.5px] w-7 sm:w-10 bg-white block" />
                    <span className="text-white font-black text-base sm:text-lg tracking-[0.28em] leading-none pl-[0.28em]">
                      PRIME
                    </span>
                    <span className="h-[1.5px] w-7 sm:w-10 bg-white block" />
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="h-[1px] w-4 sm:w-5 bg-white/90 block" />
                    <span className="text-white font-semibold text-[9px] sm:text-[10px] tracking-[0.38em] leading-none pl-[0.38em]">
                      STORE
                    </span>
                    <span className="h-[1px] w-4 sm:w-5 bg-white/90 block" />
                  </div>
                </a>
              </div>

              {/* Right: Shopping Bag */}
              <div className="flex items-center justify-end flex-1">
                <button
                  type="button"
                  onClick={() => setIsCartOpen(true)}
                  className="relative p-1.5 -mr-1.5 text-white hover:opacity-75 transition-opacity cursor-pointer"
                  aria-label="Sacola de compras"
                  id="btn-open-cart"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.85"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 7h14l1 12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2L5 7Z" />
                    <path d="M5 7l2-3h10l2 3" />
                    <path d="M9 11a3 3 0 0 0 6 0" />
                  </svg>
                  {cartItemsCount > 0 && (
                    <span className="absolute top-0 right-0 w-4 h-4 bg-[#0c8f00] text-white text-[10px] font-bold rounded-full flex items-center justify-center tabular-nums">
                      {cartItemsCount}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </header>

          {/* 2. Listra Pequena de Black Friday e Frete Grátis passando para o lado */}
          <div
            className="w-full overflow-hidden bg-[#141414] border-t border-white/15 py-1.5 select-none"
            aria-label="Black Friday e Frete Grátis"
          >
            <div className="animate-bf-marquee text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-white whitespace-nowrap">
              {[...Array(6)].map((_, idx) => (
                <div key={idx} className="flex items-center gap-4 px-4 shrink-0">
                  <span className="text-amber-400 font-black">BLACK FRIDAY</span>
                  <span className="text-white/40" aria-hidden="true">•</span>
                  <span className="text-emerald-400 font-black">FRETE GRÁTIS</span>
                  <span className="text-white/40" aria-hidden="true">•</span>
                  <span>72% OFF POR TEMPO LIMITADO</span>
                  <span className="text-white/40" aria-hidden="true">•</span>
                  <span>MÁQUINA DE GELO MONDIAL POR R$ 84,59</span>
                  <span className="text-white/40" aria-hidden="true">•</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3. Main Product Container */}
        <main className="flex-1 container mx-auto px-4 py-4 md:py-8 max-w-7xl">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-neutral-500 mb-4 md:mb-6">
            <a
              href={typeof window !== 'undefined' ? `${window.location.pathname}${window.location.search}` : '#'}
              onClick={(e) => {
                e.preventDefault();
                window.location.href = `${window.location.pathname}${window.location.search}`;
              }}
              className="hover:text-neutral-900 transition-colors flex items-center gap-1 shrink-0"
            >
              <House className="w-3.5 h-3.5" />
              <span>Início</span>
            </a>
            <ChevronRight className="w-3 h-3 text-neutral-400 shrink-0" />
            <span className="hover:text-neutral-900 cursor-pointer shrink-0">Eletroportáteis</span>
            <ChevronRight className="w-3 h-3 text-neutral-400 shrink-0" />
            <span className="text-neutral-800 font-semibold truncate max-w-[200px] sm:max-w-none">
              {productData.name}
            </span>
          </nav>

          {/* 2-Column Product Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start">
            {/* Left Column: Gallery */}
            <div className="md:sticky md:top-28">
              <div className="w-full">
                {/* Main Photo with Horizontal Touch Swipe & Zoom */}
                <div
                  className="relative bg-neutral-50 rounded-xl overflow-hidden mb-2.5 touch-pan-y aspect-square border border-neutral-200 group flex items-center justify-center select-none"
                  onTouchStart={handleGalleryTouchStart}
                  onTouchMove={handleGalleryTouchMove}
                  onTouchEnd={handleGalleryTouchEnd}
                  onTouchCancel={handleGalleryTouchEnd}
                >
                  <div
                    className={`flex w-full h-full ${swipeOffset === 0 ? 'transition-transform duration-200 ease-out' : ''}`}
                    style={{
                      transform: `translate3d(calc(-${currentImageIndex * 100}% + ${swipeOffset}px), 0, 0)`
                    }}
                  >
                    {galleryImages.map((img, idx) => (
                      <div key={idx} className="w-full h-full shrink-0 flex items-center justify-center p-2">
                        <img
                          alt={img.alt}
                          className="w-full h-full object-contain select-none transition-transform duration-150 scale-100 md:group-hover:scale-105"
                          draggable={false}
                          loading="eager"
                          decoding={idx === 0 ? 'sync' : 'async'}
                          fetchPriority={idx === 0 ? 'high' : 'low'}
                          src={img.src}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Subtle Counter */}
                  <span className="absolute bottom-2.5 left-2.5 bg-black/60 text-white px-2 py-0.5 rounded-md text-[11px] font-semibold tabular-nums pointer-events-none">
                    {currentImageIndex + 1} / {galleryImages.length}
                  </span>

                  {/* Desktop Arrows */}
                  {currentImageIndex > 0 && (
                    <button
                      type="button"
                      onClick={() => setCurrentImageIndex(prev => prev - 1)}
                      aria-label="Foto anterior"
                      className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-neutral-900 shadow items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                  )}
                  {currentImageIndex < galleryImages.length - 1 && (
                    <button
                      type="button"
                      onClick={() => setCurrentImageIndex(prev => prev + 1)}
                      aria-label="Próxima foto"
                      className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-neutral-900 shadow items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}

                  <div className="hidden md:flex absolute bottom-2.5 right-2.5 bg-black/55 text-white px-2 py-1 rounded-md backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none items-center gap-1 text-[11px]">
                    <ZoomIn className="w-3.5 h-3.5" />
                    <span>Zoom</span>
                  </div>
                </div>

                {/* Todas as 7 miniaturas lado a lado sem rolagem horizontal */}
                <div ref={thumbnailsContainerRef} className="grid grid-cols-7 gap-1 sm:gap-1.5 w-full">
                  {galleryImages.map((img, idx) => {
                    const isSelected = currentImageIndex === idx;
                    return (
                      <button
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`w-full aspect-square overflow-hidden border-2 transition-all duration-150 cursor-pointer rounded-md p-0.5 bg-white ${
                          isSelected
                            ? 'border-black ring-1 ring-black/20 shadow-xs'
                            : 'border-neutral-200 hover:border-neutral-400 opacity-85 hover:opacity-100'
                        }`}
                        aria-label={`Ver imagem ${idx + 1}`}
                        id={`gallery-thumb-${idx}`}
                      >
                        <img
                          alt={img.alt}
                          className="w-full h-full object-cover rounded-sm"
                          loading="eager"
                          decoding="async"
                          src={img.thumb}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Column: Product Info & Actions */}
            <div>
              <div className="w-full">
                {/* Quiet Metadata Kicker */}
                <div className="flex items-center gap-2 text-xs font-semibold text-neutral-600 mb-2">
                  <span className="text-[#29180c] uppercase tracking-wider font-bold">Mais Vendido</span>
                  <span aria-hidden="true">·</span>
                  <span>Frete Grátis</span>
                  <span aria-hidden="true">·</span>
                  <span>110V ou 220V</span>
                </div>

                {/* Title */}
                <h1 className="text-xl md:text-2xl font-extrabold mb-2.5 leading-snug text-neutral-900 [text-wrap:balance]">
                  {productData.name}
                </h1>

                {/* Star Rating */}
                <div
                  onClick={() => {
                    const el = document.getElementById('avaliacoes-section');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="flex items-center gap-2 mb-3 cursor-pointer"
                >
                  <div className="flex items-center text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-sm font-bold text-neutral-800 tabular-nums">{productData.rating}</span>
                  <span className="text-xs md:text-sm text-neutral-500 hover:text-neutral-800 underline tabular-nums">
                    ({productData.reviewsCount} Avaliações)
                  </span>
                </div>

                <hr className="mb-4 border-neutral-200" />

                {/* Price Row */}
                <div className="mb-5">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <p className="text-3xl md:text-4xl font-extrabold text-neutral-900 m-0 tabular-nums">
                      R$ {productData.price}
                    </p>
                    <p className="text-xs md:text-sm line-through text-neutral-400 m-0 tabular-nums">
                      R$ {productData.oldPrice}
                    </p>
                    <span
                      className="inline-flex items-center gap-1 font-extrabold leading-none rounded px-2 py-1 text-xs text-white shadow-2xs tabular-nums"
                      style={{ backgroundColor: 'rgb(231, 4, 4)' }}
                    >
                      <Tag className="w-3 h-3 fill-current" />
                      <span>{productData.discountBadge}</span>
                    </span>
                  </div>
                  <p className="text-xs text-[#0c8f00] font-bold mt-1.5 flex items-center gap-1.5 tabular-nums">
                    <ThumbsUp className="w-3.5 h-3.5 shrink-0" />
                    <span>Economia de R$ {productData.savings} • Pagamento exclusivo via PIX</span>
                  </p>
                </div>

                {/* Stock / Demand Bar */}
                <div className="mb-4 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-neutral-800 tabular-nums">
                      <strong>93%</strong> do lote promocional vendido
                    </span>
                    <span className="text-xs font-extrabold tracking-wide text-red-600 uppercase">
                      Últimas unidades
                    </span>
                  </div>
                  <div className="w-full bg-neutral-200/90 h-2.5 rounded-full overflow-hidden relative shadow-inner">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-600 via-[#0c8f00] to-emerald-500 relative overflow-hidden"
                      style={{ width: '93%' }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer-fast -skew-x-12"></div>
                    </div>
                  </div>
                </div>

                {/* Big CTA Buy Button */}
                <div className="mb-4 flex flex-col gap-2.5">
                  <button
                    type="button"
                    onClick={handleBuyNow}
                    onMouseEnter={warmCheckout}
                    onTouchStart={warmCheckout}
                    className="w-full py-4 bg-[#0c8f00] text-white font-extrabold text-base md:text-lg hover:bg-[#0a7a00] transition-colors flex items-center justify-center rounded-lg shadow-md hover:shadow-lg cursor-pointer uppercase tracking-wider active:scale-[0.99] whitespace-nowrap"
                    id="btn-buy-now"
                  >
                    <span>COMPRAR AGORA • R$ {productData.price}</span>
                  </button>

                  {/* Expansível: Resumo da Máquina de Gelo */}
                  <div className="w-full border border-dashed border-neutral-300 rounded-xl overflow-hidden bg-neutral-50/70 transition-all">
                    <button
                      type="button"
                      onClick={() => setIsKitExpanded(!isKitExpanded)}
                      className="w-full py-2.5 px-3.5 text-xs font-semibold text-neutral-800 hover:text-neutral-950 flex items-center justify-between transition-colors cursor-pointer"
                      id="btn-ver-itens-kit"
                    >
                      <span className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-[#29180c] shrink-0" />
                        <span className="underline underline-offset-2 decoration-neutral-400">
                          Ver destaques e itens inclusos (MG-12-GI Mondial)
                        </span>
                      </span>
                      <span className="flex items-center gap-1 text-[11px] text-neutral-500 font-normal shrink-0">
                        <span>{isKitExpanded ? 'Recolher' : 'Expandir'}</span>
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isKitExpanded ? 'rotate-180 text-neutral-800' : ''}`} />
                      </span>
                    </button>

                    {isKitExpanded && (
                      <div className="overflow-hidden border-t border-neutral-200 bg-white p-4 space-y-3 animate-fade-in-fast">
                        <div>
                          <h4 className="font-extrabold text-neutral-900 text-xs uppercase tracking-wider mb-2">
                            O que acompanha na caixa:
                          </h4>
                          <div className="space-y-1.5 text-xs">
                            <div className="p-2 rounded bg-neutral-50 border border-neutral-200/70">
                              <span className="font-bold text-neutral-900">1. Máquina de Gelo Mondial MG-12-GI:</span> Produção de até 12 kg/dia com painel digital e tampa com visor transparente.
                            </div>
                            <div className="p-2 rounded bg-neutral-50 border border-neutral-200/70">
                              <span className="font-bold text-neutral-900">2. Cesto Coletor + Pá de Gelo:</span> Acessórios práticos inclusos para armazenar e servir o gelo com higiene.
                            </div>
                            <div className="p-2 rounded bg-neutral-50 border border-neutral-200/70">
                              <span className="font-bold text-neutral-900">3. Manual + 1 Ano de Garantia Mondial:</span> Dispensa instalação hidráulica, basta ligar na tomada (110V ou 220V).
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-extrabold text-neutral-900 text-xs uppercase tracking-wider mb-2">
                            Principais Diferenciais:
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-neutral-800">
                            <div className="flex items-center gap-1.5 p-1.5 bg-neutral-50 border border-neutral-200/70 rounded">
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#0c8f00] shrink-0" />
                              <span>9 cubos a cada 8 minutos*</span>
                            </div>
                            <div className="flex items-center gap-1.5 p-1.5 bg-neutral-50 border border-neutral-200/70 rounded">
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#0c8f00] shrink-0" />
                              <span>2 tamanhos de gelo (P e G)</span>
                            </div>
                            <div className="flex items-center gap-1.5 p-1.5 bg-neutral-50 border border-neutral-200/70 rounded">
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#0c8f00] shrink-0" />
                              <span>Reservatório de 1,3 litros</span>
                            </div>
                            <div className="flex items-center gap-1.5 p-1.5 bg-neutral-50 border border-neutral-200/70 rounded">
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#0c8f00] shrink-0" />
                              <span>Não deixa marcas de dedos</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Shipping & Return Guarantee Cards */}
                <div className="space-y-3 mb-4">
                  {/* Shipping Card */}
                  <div className="border border-neutral-200 rounded-md overflow-hidden bg-white shadow-2xs">
                    <div className="p-3 flex items-center gap-3">
                      <div
                        className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-md text-white"
                        style={{ backgroundColor: 'rgb(41, 24, 12)' }}
                      >
                        <Truck className="w-5 h-5" />
                      </div>
                      <div className="flex-1 leading-tight">
                        <p className="text-xs">
                          <span className="text-neutral-900 font-bold text-xs">Frete Grátis Black Friday</span>{' '}
                          <span className="text-neutral-500 text-xs">Via Correios &amp; Transportadoras</span>
                        </p>
                        <p className="text-xs text-[#0c8f00] font-bold mt-0.5 flex items-center gap-1 flex-wrap">
                          <span>Grátis para Todo o Brasil</span>
                          <button
                            type="button"
                            onClick={() => setShowCepInput(!showCepInput)}
                            className="text-neutral-500 hover:text-neutral-800 text-[10px] font-normal underline ml-1 cursor-pointer"
                          >
                            {showCepInput ? 'Fechar' : 'Calcular Frete e Prazo'}
                          </button>
                        </p>
                      </div>
                    </div>

                    {showCepInput && (
                      <div className="px-3 pb-3 pt-1 border-t border-neutral-100 bg-neutral-50">
                        <div className="flex gap-2 mt-2">
                          <input
                            type="text"
                            maxLength={8}
                            placeholder="Digite seu CEP (apenas números)"
                            value={cep}
                            onChange={(e) => setCep(e.target.value.replace(/\D/g, ''))}
                            className="flex-1 px-3 py-1.5 text-base sm:text-xs bg-white border border-neutral-300 rounded focus:outline-none focus:border-[#29180c]"
                          />
                          <button
                            onClick={handleCepLookup}
                            disabled={isLoadingCep || cep.length !== 8}
                            className="px-4 py-1.5 bg-[#0c8f00] text-white text-xs font-bold rounded uppercase hover:bg-[#0a7a00] disabled:opacity-50 cursor-pointer"
                          >
                            {isLoadingCep ? '...' : 'Calcular'}
                          </button>
                        </div>

                        {shippingData && (
                          <div className="mt-3 text-xs bg-white p-3 rounded-lg border border-neutral-200 space-y-2.5 shadow-2xs">
                            <div className="border-b border-neutral-100 pb-2 text-[11px] text-neutral-700 space-y-0.5">
                              <p className="font-bold text-neutral-900 text-xs flex items-center gap-1">
                                <House className="w-3.5 h-3.5 text-[#29180c]" />
                                <span>Endereço de Entrega:</span>
                              </p>
                              {shippingData.logradouro && (
                                <p className="text-neutral-600">
                                  <strong>Rua/Logradouro:</strong> {shippingData.logradouro}
                                </p>
                              )}
                              {shippingData.bairro && (
                                <p className="text-neutral-600">
                                  <strong>Bairro:</strong> {shippingData.bairro}
                                </p>
                              )}
                              <p className="text-neutral-600">
                                <strong>Cidade / UF:</strong> {shippingData.localidade} - {shippingData.uf}
                              </p>
                              <p className="text-neutral-500 text-[10px] tabular-nums">
                                <strong>CEP:</strong> {cep.slice(0, 5)}-{cep.slice(5)}
                              </p>
                            </div>

                            <div className="space-y-1.5">
                              <div className="p-2 rounded-md bg-emerald-50/70 border border-emerald-200 flex items-center justify-between">
                                <div>
                                  <p className="font-extrabold text-emerald-900 text-xs flex items-center gap-1.5">
                                    <Truck className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>Frete Grátis</span>
                                  </p>
                                  <p className="text-[10px] text-emerald-700">Prazo estimado de 7 a 10 dias</p>
                                </div>
                                <span className="text-xs font-black text-emerald-950 bg-emerald-100/90 px-2 py-0.5 rounded uppercase">
                                  Grátis
                                </span>
                              </div>

                              <div className="p-2 rounded-md bg-amber-50/70 border border-amber-200 flex items-center justify-between">
                                <div>
                                  <p className="font-extrabold text-amber-950 text-xs flex items-center gap-1.5">
                                    <Zap className="w-3.5 h-3.5 text-amber-600 fill-amber-600" />
                                    <span>Frete Full</span>
                                  </p>
                                  <p className="text-[10px] text-amber-800">Prazo estimado de 2 a 3 dias</p>
                                </div>
                                <span className="text-xs font-black text-amber-950 bg-amber-200/80 px-2 py-0.5 rounded tabular-nums">
                                  R$ 12,43
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Return Card */}
                  <div className="border border-neutral-200 rounded-md overflow-hidden bg-white shadow-2xs">
                    <div className="p-3 flex items-center gap-3">
                      <div
                        className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full text-white"
                        style={{ backgroundColor: 'rgb(41, 24, 12)' }}
                      >
                        <RotateCcw className="w-5 h-5" />
                      </div>
                      <div className="flex-1 leading-tight">
                        <p className="text-sm font-bold text-neutral-900">Garantia Total de 30 Dias</p>
                        <p className="text-xs text-neutral-500 mt-0.5">
                          Troca ou reembolso garantido em caso de defeito ou avaria no transporte
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Accordions */}
                <div className="w-full mb-4 divide-y divide-neutral-200 border-y border-neutral-200">
                  {/* Accordion 1: Envio */}
                  <div className="py-1">
                    <button
                      type="button"
                      onClick={() => toggleAccordion('envio')}
                      className="w-full flex items-center justify-between py-3.5 text-left text-sm md:text-base font-bold text-neutral-800 hover:text-neutral-950 transition-colors cursor-pointer group"
                      id="accordion-btn-envio"
                    >
                      <span className="flex items-center gap-2.5">
                        <Package className="w-4 h-4 text-neutral-500 group-hover:text-neutral-800 transition-colors" />
                        <span>Informações do envio</span>
                      </span>
                      <span className="relative flex items-center justify-center w-5 h-5 text-neutral-400 group-hover:text-neutral-800 transition-transform">
                        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${activeAccordion === 'envio' ? 'rotate-180' : ''}`} />
                      </span>
                    </button>
                    {activeAccordion === 'envio' && (
                      <div className="pb-3.5 text-xs text-neutral-600 leading-relaxed space-y-1.5">
                        <p>• <strong>Despacho em até 24 Horas:</strong> Produto testado e embalado em caixa reforçada com proteção anti-impacto.</p>
                        <p>• <strong>Rastreamento em Tempo Real:</strong> Você recebe o código de rastreio oficial no seu e-mail e WhatsApp assim que o pedido é postado.</p>
                        <p>• <strong>Entrega Segura:</strong> Seguro total incluso contra extravio ou qualquer dano durante o trajeto.</p>
                      </div>
                    )}
                  </div>

                  {/* Accordion 2: Trocas e devoluções */}
                  <div className="py-1">
                    <button
                      type="button"
                      onClick={() => toggleAccordion('trocas')}
                      className="w-full flex items-center justify-between py-3.5 text-left text-sm md:text-base font-bold text-neutral-800 hover:text-neutral-950 transition-colors cursor-pointer group"
                      id="accordion-btn-trocas"
                    >
                      <span className="flex items-center gap-2.5">
                        <RotateCcw className="w-4 h-4 text-neutral-500 group-hover:text-neutral-800 transition-colors" />
                        <span>Trocas e garantia</span>
                      </span>
                      <span className="relative flex items-center justify-center w-5 h-5 text-neutral-400 group-hover:text-neutral-800 transition-transform">
                        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${activeAccordion === 'trocas' ? 'rotate-180' : ''}`} />
                      </span>
                    </button>
                    {activeAccordion === 'trocas' && (
                      <div className="pb-3.5 text-xs text-neutral-600 leading-relaxed space-y-1.5">
                        <p>• <strong>1 Ano de Garantia Mondial:</strong> Produto original com garantia de fábrica e nota fiscal.</p>
                        <p>• <strong>Troca Fácil em 30 Dias:</strong> Suporte rápido contra qualquer defeito ou avaria no transporte.</p>
                        <p>• <strong>Atendimento Humanizado:</strong> Suporte de segunda a sábado para dúvidas de voltagem e funcionamento.</p>
                      </div>
                    )}
                  </div>

                  {/* Accordion 3: O que vem na Caixa */}
                  <div className="py-1">
                    <button
                      type="button"
                      onClick={() => toggleAccordion('conteudo')}
                      className="w-full flex items-center justify-between py-3.5 text-left text-sm md:text-base font-bold text-neutral-800 hover:text-neutral-950 transition-colors cursor-pointer group"
                      id="accordion-btn-conteudo"
                    >
                      <span className="flex items-center gap-2.5">
                        <Sparkles className="w-4 h-4 text-neutral-500 group-hover:text-neutral-800 transition-colors" />
                        <span>O que vem na Caixa (MG-12-GI Mondial)</span>
                      </span>
                      <span className="relative flex items-center justify-center w-5 h-5 text-neutral-400 group-hover:text-neutral-800 transition-transform">
                        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${activeAccordion === 'conteudo' ? 'rotate-180' : ''}`} />
                      </span>
                    </button>
                    {activeAccordion === 'conteudo' && (
                      <div className="pb-3.5 text-xs text-neutral-600 leading-relaxed space-y-1">
                        <p>• 1x <strong>Máquina de Gelo Turbo Ice Premium Mondial</strong> (110V ou 220V à escolha)</p>
                        <p>• 1x <strong>Cesto Coletor de Gelo</strong> removível</p>
                        <p>• 1x <strong>Pá Coletora</strong> para servir com praticidade</p>
                        <p>• 1x <strong>Manual de Instruções</strong> em Português + Certificado de Garantia</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Descrição do Produto (Resumida) */}
                <div className="pt-5 border-t border-neutral-200" id="descricao-produto">
                  <h2 className="flex items-center gap-2 text-sm md:text-base font-bold text-neutral-900 mb-3 tracking-wide">
                    <FileText className="w-4 h-4 text-neutral-700" />
                    <span>DESCRIÇÃO DO PRODUTO</span>
                  </h2>

                  <div className="text-neutral-700 leading-relaxed text-xs md:text-sm space-y-4">
                    <p className="text-neutral-800 font-medium text-sm md:text-base">
                      A <strong>Máquina de Gelo Turbo Ice Premium Mondial (MG-12-GI)</strong> traz praticidade e sofisticação para deixar drinks e bebidas sempre gelados no churrasco, almoço em família ou rotina diária.
                    </p>

                    <p className="text-neutral-600 text-xs md:text-sm leading-relaxed">
                      Compacta, portátil e sem complicações: <strong>dispensa instalação hidráulica</strong> — basta ligar na tomada, colocar água no reservatório e acompanhar tudo pela tampa com visor transparente.
                    </p>

                    {/* 4 Feature Cards (2x2 Grid) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-4">
                      <div className="flex items-start gap-2.5 p-3 rounded-lg bg-neutral-50 border border-neutral-200">
                        <div className="w-7 h-7 rounded-lg bg-neutral-900 text-white flex items-center justify-center shrink-0 mt-0.5">
                          <Snowflake className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-bold text-neutral-900 text-xs md:text-sm">Até 12 kg por Dia</h4>
                          <p className="text-neutral-600 text-[11px] md:text-xs mt-0.5">
                            Produção rápida de 9 cubos a cada ciclo de 8 minutos*, com opção de cubos pequenos ou grandes.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5 p-3 rounded-lg bg-neutral-50 border border-neutral-200">
                        <div className="w-7 h-7 rounded-lg bg-emerald-700 text-white flex items-center justify-center shrink-0 mt-0.5">
                          <Droplets className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-bold text-neutral-900 text-xs md:text-sm">Reservatório 1,3L + Escoamento</h4>
                          <p className="text-neutral-600 text-[11px] md:text-xs mt-0.5">
                            Sem encanamento: adicione água facilmente e conte com válvula prática para saída de água.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5 p-3 rounded-lg bg-neutral-50 border border-neutral-200">
                        <div className="w-7 h-7 rounded-lg bg-amber-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                          <Gauge className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-bold text-neutral-900 text-xs md:text-sm">Painel Digital + Visor Transparente</h4>
                          <p className="text-neutral-600 text-[11px] md:text-xs mt-0.5">
                            Operação intuitiva com aviso luminoso para repor água ou esvaziar o cesto sem precisar abrir a tampa.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5 p-3 rounded-lg bg-neutral-50 border border-neutral-200">
                        <div className="w-7 h-7 rounded-lg bg-[#29180c] text-white flex items-center justify-center shrink-0 mt-0.5">
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-bold text-neutral-900 text-xs md:text-sm">Acabamento Premium Anti-Marcas</h4>
                          <p className="text-neutral-600 text-[11px] md:text-xs mt-0.5">
                            Visual sofisticado que não deixa marcas visíveis de dedos e já acompanha cesto e pá coletora.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Detail Photos */}
                    <div className="space-y-3 pt-2">
                      <div className="rounded-lg overflow-hidden border border-neutral-200 shadow-2xs">
                        <img
                          alt="Máquina de Gelo Mondial - Cesto e Pá Coletora"
                          className="w-full h-auto object-cover rounded-lg block"
                          loading="lazy"
                          decoding="async"
                          src="/images/ice2.webp"
                        />
                      </div>
                      <div className="rounded-lg overflow-hidden border border-neutral-200 shadow-2xs">
                        <img
                          alt="Máquina de Gelo Mondial - Painel Digital e Visor"
                          className="w-full h-auto object-cover rounded-lg block"
                          loading="lazy"
                          decoding="async"
                          src="/images/ice3.webp"
                        />
                      </div>
                      <div className="rounded-lg overflow-hidden border border-neutral-200 shadow-2xs">
                        <img
                          alt="Máquina de Gelo Mondial - Portátil para Cozinha e Eventos"
                          className="w-full h-auto object-cover rounded-lg block"
                          loading="lazy"
                          decoding="async"
                          src="/images/ice4.webp"
                        />
                      </div>
                    </div>

                    {/* Especificações Técnicas */}
                    <div className="mt-6 pt-4 border-t border-neutral-200">
                      <h3 className="font-bold text-neutral-900 text-sm md:text-base mb-3">Especificações Técnicas</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs tabular-nums">
                        <div className="flex justify-between p-2.5 bg-neutral-50 rounded border border-neutral-100">
                          <span className="text-neutral-500">Modelo / Marca:</span>
                          <span className="font-semibold text-neutral-900">MG-12-GI Mondial</span>
                        </div>
                        <div className="flex justify-between p-2.5 bg-neutral-50 rounded border border-neutral-100">
                          <span className="text-neutral-500">Capacidade Diária:</span>
                          <span className="font-semibold text-neutral-900">Até 12 kg / dia</span>
                        </div>
                        <div className="flex justify-between p-2.5 bg-neutral-50 rounded border border-neutral-100">
                          <span className="text-neutral-500">Ciclo Rápido:</span>
                          <span className="font-semibold text-neutral-900">9 cubos em ~8 minutos*</span>
                        </div>
                        <div className="flex justify-between p-2.5 bg-neutral-50 rounded border border-neutral-100">
                          <span className="text-neutral-500">Tamanhos de Gelo:</span>
                          <span className="font-semibold text-neutral-900">2 opções (Pequeno / Grande)</span>
                        </div>
                        <div className="flex justify-between p-2.5 bg-neutral-50 rounded border border-neutral-100">
                          <span className="text-neutral-500">Reservatório de Água:</span>
                          <span className="font-semibold text-neutral-900">1,3 Litros</span>
                        </div>
                        <div className="flex justify-between p-2.5 bg-neutral-50 rounded border border-neutral-100">
                          <span className="text-neutral-500">Voltagem &amp; Garantia:</span>
                          <span className="font-semibold text-neutral-900">110V ou 220V • 1 Ano</span>
                        </div>
                      </div>
                      <p className="text-[11px] text-neutral-400 mt-2">
                        *O tempo de preparo pode variar conforme a temperatura ambiente e da água.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Avaliações do Produto */}
                <div className="pt-6 border-t border-neutral-200 mt-6" id="avaliacoes-section">
                  <h2 className="flex items-center gap-2 text-sm md:text-base font-bold text-neutral-900 mb-3 tracking-wide">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span>AVALIAÇÕES DE CLIENTES</span>
                  </h2>

                  <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4 mb-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="text-3xl md:text-4xl font-extrabold text-neutral-900 tabular-nums">
                          {productData.rating}
                        </div>
                        <div>
                          <div className="flex gap-0.5 text-amber-400">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="w-4 h-4 md:w-5 md:h-5 fill-amber-400 text-amber-400" />
                            ))}
                          </div>
                          <p className="text-xs text-neutral-500 mt-0.5 tabular-nums">
                            Baseado em {productData.reviewsCount} compras verificadas
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => alert('O link para avaliar é enviado automaticamente no seu WhatsApp após o recebimento do pedido.')}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-neutral-300 rounded-lg text-xs md:text-sm font-bold text-neutral-800 hover:bg-neutral-100 hover:border-neutral-400 transition-colors shadow-2xs cursor-pointer whitespace-nowrap"
                        id="btn-write-review"
                      >
                        <MessageSquarePlus className="w-4 h-4 text-[#0c8f00]" />
                        <span>Escrever avaliação</span>
                      </button>
                    </div>
                  </div>

                  {/* Filter buttons */}
                  <div className="flex items-center justify-between mt-2 mb-4">
                    <div className="flex items-center gap-2 flex-wrap text-xs">
                      <button
                        onClick={() => setReviewFilter('all')}
                        className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
                          reviewFilter === 'all'
                            ? 'bg-[#29180c] text-white'
                            : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                        }`}
                      >
                        Todas ({reviews.length})
                      </button>
                      <button
                        onClick={() => setReviewFilter(5)}
                        className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap ${
                          reviewFilter === 5
                            ? 'bg-[#29180c] text-white'
                            : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                        }`}
                      >
                        <span>5 estrelas</span>
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      </button>
                      <button
                        onClick={() => setReviewFilter(4)}
                        className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap ${
                          reviewFilter === 4
                            ? 'bg-[#29180c] text-white'
                            : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                        }`}
                      >
                        <span>4 estrelas</span>
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      </button>
                    </div>

                    <span className="flex items-center justify-center w-8 h-8 rounded-md border border-neutral-200 text-neutral-500 shrink-0">
                      <SlidersHorizontal className="w-3.5 h-3.5" />
                    </span>
                  </div>

                  {/* Reviews Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {filteredReviews.map((rev) => {
                      const isExpanded = expandedReviews[rev.id];
                      const isLiked = likedReviews[rev.id];
                      const helpfulCount = helpfulCounts[rev.id] || 0;

                      return (
                        <div
                          key={rev.id}
                          className="border border-neutral-200 rounded-lg overflow-hidden bg-white p-3.5 shadow-2xs hover:border-neutral-300 transition-all flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-start gap-2.5 mb-2">
                              {rev.avatar ? (
                                <img
                                  src={rev.avatar}
                                  alt={rev.name}
                                  className="w-9 h-9 rounded-full object-cover border border-neutral-200 shadow-2xs shrink-0"
                                  loading="lazy"
                                  decoding="async"
                                />
                              ) : (
                                <div
                                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs border shadow-2xs shrink-0 select-none ${getAvatarBg(rev.id)}`}
                                >
                                  {getInitials(rev.name)}
                                </div>
                              )}

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-1">
                                  <div className="flex items-center gap-1.5 min-w-0">
                                    <span className="text-xs md:text-sm font-bold text-neutral-900 truncate">{rev.name}</span>
                                    <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-700 shrink-0">
                                      <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" />
                                      <span className="hidden sm:inline">Verificado</span>
                                    </span>
                                  </div>
                                  <span className="text-[10px] text-neutral-400 shrink-0">{rev.date}</span>
                                </div>

                                <div className="flex gap-0.5 mt-0.5">
                                  {[...Array(rev.rating)].map((_, i) => (
                                    <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                                  ))}
                                </div>
                              </div>
                            </div>

                            <p className="text-xs md:text-sm text-neutral-700 leading-relaxed">
                              {isExpanded || rev.text.length < 110 ? rev.text : `${rev.text.substring(0, 110)}...`}
                            </p>

                            {rev.text.length >= 110 && (
                              <button
                                onClick={() => toggleExpandReview(rev.id)}
                                className="text-[11px] font-bold text-neutral-800 hover:underline mt-1 block cursor-pointer"
                              >
                                {isExpanded ? 'Mostrar menos' : 'Ler tudo'}
                              </button>
                            )}

                            {/* Photos gallery */}
                            {rev.photos && rev.photos.length > 0 && (
                              <div className="flex gap-2 mt-2.5 overflow-x-auto pb-1">
                                {rev.photos.map((p, pIdx) => (
                                  <button
                                    key={pIdx}
                                    onClick={() => setSelectedReviewImage(p)}
                                    className="w-14 h-14 rounded-md overflow-hidden border border-neutral-200 flex-shrink-0 cursor-zoom-in hover:border-neutral-900 transition-all bg-neutral-50"
                                  >
                                    <img
                                      src={p.replace('/images/rev', '/images/revt')}
                                      alt={`Foto enviada por ${rev.name}`}
                                      className="w-full h-full object-cover"
                                      loading="lazy"
                                      decoding="async"
                                    />
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="mt-3 pt-2.5 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-400">
                            <span>Esta avaliação foi útil?</span>
                            <button
                              type="button"
                              onClick={() => handleLikeReview(rev.id)}
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded transition-colors cursor-pointer hover:bg-neutral-100 tabular-nums ${
                                isLiked ? 'text-[#0c8f00] font-bold' : 'text-neutral-500'
                              }`}
                            >
                              <ThumbsUp className={`w-3 h-3 ${isLiked ? 'fill-current' : ''}`} />
                              <span>{helpfulCount}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* 4. Section: 3 Trust Pillars */}
        <section className="bg-neutral-50 border-y border-neutral-200 py-6 md:py-8 mt-10">
          <div className="container mx-auto px-4">
            {/* Desktop 3 Columns */}
            <div className="hidden md:grid md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center text-center px-4">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-md mb-3"
                  style={{ backgroundColor: 'rgb(41, 24, 12)' }}
                >
                  <Zap className="w-7 h-7 text-amber-400 fill-amber-400" />
                </div>
                <h3 className="text-sm font-bold text-neutral-900">Pagamento Exclusivo no PIX</h3>
                <p className="mt-1.5 text-xs text-neutral-600 max-w-xs leading-relaxed">
                  Pagamento 100% seguro via PIX com aprovação imediata e despacho prioritário do seu pedido.
                </p>
              </div>

              <div className="flex flex-col items-center text-center px-4">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-md mb-3"
                  style={{ backgroundColor: 'rgb(41, 24, 12)' }}
                >
                  <Truck className="w-7 h-7" />
                </div>
                <h3 className="text-sm font-bold text-neutral-900">Frete Grátis para todo o Brasil</h3>
                <p className="mt-1.5 text-xs text-neutral-600 max-w-xs leading-relaxed">
                  Frete Grátis Black Friday com envio rápido e rastreamento oficial em tempo real.
                </p>
              </div>

              <div className="flex flex-col items-center text-center px-4">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-md mb-3"
                  style={{ backgroundColor: 'rgb(41, 24, 12)' }}
                >
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <h3 className="text-sm font-bold text-neutral-900">1 Ano de Garantia Mondial</h3>
                <p className="mt-1.5 text-xs text-neutral-600 max-w-xs leading-relaxed">
                  Produto original com garantia de 1 ano Mondial e troca protegida contra avarias no transporte.
                </p>
              </div>
            </div>

            {/* Mobile Carousel */}
            <div className="md:hidden relative">
              <div className="overflow-hidden">
                <div
                  className="flex transition-transform duration-300 ease-out"
                  style={{ transform: `translateX(-${carouselSlide * 100}%)` }}
                >
                  <div className="w-full flex-shrink-0 flex flex-col items-center text-center px-6">
                    <div
                      className="w-13 h-13 rounded-xl flex items-center justify-center text-white shadow mb-3"
                      style={{ backgroundColor: 'rgb(41, 24, 12)' }}
                    >
                      <Zap className="w-6 h-6 text-amber-400 fill-amber-400" />
                    </div>
                    <h3 className="text-sm font-bold text-neutral-900">Pagamento Exclusivo no PIX</h3>
                    <p className="mt-1 text-xs text-neutral-600 leading-relaxed max-w-xs">
                      Pagamento 100% seguro via PIX com aprovação imediata e despacho prioritário do seu pedido.
                    </p>
                  </div>

                  <div className="w-full flex-shrink-0 flex flex-col items-center text-center px-6">
                    <div
                      className="w-13 h-13 rounded-xl flex items-center justify-center text-white shadow mb-3"
                      style={{ backgroundColor: 'rgb(41, 24, 12)' }}
                    >
                      <Truck className="w-6 h-6" />
                    </div>
                    <h3 className="text-sm font-bold text-neutral-900">Frete Grátis para todo o Brasil</h3>
                    <p className="mt-1 text-xs text-neutral-600 leading-relaxed max-w-xs">
                      Frete Grátis Black Friday com envio rápido e rastreamento oficial em tempo real.
                    </p>
                  </div>

                  <div className="w-full flex-shrink-0 flex flex-col items-center text-center px-6">
                    <div
                      className="w-13 h-13 rounded-xl flex items-center justify-center text-white shadow mb-3"
                      style={{ backgroundColor: 'rgb(41, 24, 12)' }}
                    >
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <h3 className="text-sm font-bold text-neutral-900">1 Ano de Garantia Mondial</h3>
                    <p className="mt-1 text-xs text-neutral-600 leading-relaxed max-w-xs">
                      Produto original com garantia de 1 ano Mondial e troca protegida contra avarias no transporte.
                    </p>
                  </div>
                </div>
              </div>

              {/* Carousel Dots */}
              <div className="flex justify-center gap-1.5 mt-4">
                <button
                  onClick={() => setCarouselSlide(0)}
                  aria-label="Slide 1"
                  className={`h-2 rounded-full transition-all cursor-pointer ${carouselSlide === 0 ? 'bg-[#29180c] w-5' : 'bg-neutral-300 w-2'}`}
                ></button>
                <button
                  onClick={() => setCarouselSlide(1)}
                  aria-label="Slide 2"
                  className={`h-2 rounded-full transition-all cursor-pointer ${carouselSlide === 1 ? 'bg-[#29180c] w-5' : 'bg-neutral-300 w-2'}`}
                ></button>
                <button
                  onClick={() => setCarouselSlide(2)}
                  aria-label="Slide 3"
                  className={`h-2 rounded-full transition-all cursor-pointer ${carouselSlide === 2 ? 'bg-[#29180c] w-5' : 'bg-neutral-300 w-2'}`}
                ></button>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Footer */}
        <footer
          className="mt-auto border-t border-neutral-800 pb-20 md:pb-8"
          style={{ backgroundColor: 'rgb(41, 24, 12)', color: 'rgb(250, 248, 245)' }}
        >
          <div className="container mx-auto px-4 py-10 md:py-16">
            <div className="flex flex-col sm:flex-row items-center justify-between pb-8 mb-8 border-b border-white/10 gap-4">
              <div className="inline-flex flex-col items-center justify-center select-none">
                <div className="flex items-center gap-2.5">
                  <span className="h-[1.5px] w-7 bg-white block" />
                  <span className="text-white font-black text-base tracking-[0.28em] leading-none pl-[0.28em]">
                    PRIME
                  </span>
                  <span className="h-[1.5px] w-7 bg-white block" />
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="h-[1px] w-4 bg-white/90 block" />
                  <span className="text-white font-semibold text-[9px] tracking-[0.38em] leading-none pl-[0.38em]">
                    STORE
                  </span>
                  <span className="h-[1px] w-4 bg-white/90 block" />
                </div>
              </div>
              <p className="text-xs text-neutral-300 text-center sm:text-right max-w-md">
                Praticidade, eficiência e qualidade em utilidades domésticas inteligentes para facilitar o seu dia a dia.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
              {/* Col 1: Atendimento ao Cliente */}
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider mb-4 text-white">Atendimento ao Cliente</h4>
                <ul className="space-y-2.5 text-xs md:text-sm">
                  <li className="flex items-center gap-2 opacity-85">
                    <Clock className="w-4 h-4 shrink-0 text-amber-400" />
                    <span>Atendimento: seg. à sáb. 7 às 20h</span>
                  </li>
                  <li className="flex items-center gap-2 opacity-85">
                    <Mail className="w-4 h-4 shrink-0 text-amber-400" />
                    <span>E-mail: contato@primestore.com.br</span>
                  </li>
                </ul>
              </div>

              {/* Col 2: Novidades */}
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider mb-4 text-white">Novidades</h4>
                <p className="text-xs md:text-sm opacity-80 mb-3 leading-relaxed">
                  Fique por dentro de todas as novidades, lançamentos e ofertas exclusivas em primeira mão.
                </p>
                {newsletterSent ? (
                  <div className="p-2.5 bg-emerald-900/50 border border-emerald-500/50 rounded-lg text-xs text-emerald-200 font-medium">
                    ✓ E-mail cadastrado com sucesso!
                  </div>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (newsletterEmail) setNewsletterSent(true);
                    }}
                    className="space-y-2"
                  >
                    <input
                      required
                      placeholder="Seu e-mail principal"
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-lg border border-neutral-700 text-base sm:text-xs text-neutral-900 bg-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      type="email"
                    />
                    <button
                      type="submit"
                      className="w-full py-2.5 bg-[#0c8f00] text-white rounded-lg font-bold text-xs hover:bg-[#0a7a00] transition-colors shadow cursor-pointer uppercase tracking-wider"
                    >
                      Cadastrar E-mail
                    </button>
                  </form>
                )}
              </div>

              {/* Col 3: Loja Verificada */}
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider mb-4 text-white">Loja Verificada</h4>
                <div className="flex flex-col gap-2.5 items-start">
                  {/* Google Site Seguro */}
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-neutral-200 rounded shadow-sm text-neutral-800 text-xs font-semibold">
                    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"></path>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"></path>
                    </svg>
                    <div className="flex flex-col text-[10px] leading-tight">
                      <span className="font-bold text-neutral-900">Google</span>
                      <span className="text-emerald-700 font-medium">Site Seguro</span>
                    </div>
                  </div>

                  {/* Reclame Aqui */}
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#008f00] border border-[#007a00] rounded shadow-sm text-white text-xs font-semibold">
                    <Award className="w-4 h-4 text-amber-300" />
                    <div className="flex flex-col text-[10px] leading-tight">
                      <span className="font-extrabold tracking-wide">RECLAME AQUI</span>
                      <span className="text-emerald-100 font-medium text-[9px]">RA 1000 • Excelente</span>
                    </div>
                  </div>

                  {/* SSL 256 Bits */}
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-neutral-900 border border-neutral-700 rounded shadow-sm text-white text-xs font-semibold">
                    <Lock className="w-3.5 h-3.5 text-emerald-400" />
                    <div className="flex flex-col text-[10px] leading-tight">
                      <span className="font-bold text-white">SSL 256 BITS</span>
                      <span className="text-emerald-400 font-medium text-[9px]">Criptografia Segura</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Institutional Nav */}
            <div className="border-t mt-10 pt-6" style={{ borderColor: 'rgba(250, 248, 245, 0.15)' }}>
              <h4 className="text-xs font-bold uppercase tracking-wider mb-3 text-center md:text-left text-neutral-300">
                Institucional
              </h4>
              <nav className="flex flex-wrap justify-center md:justify-start gap-x-6 gap-y-2 text-xs opacity-80">
                <button onClick={() => alert('Termos de Uso - PRIME STORE')} className="hover:opacity-100 hover:underline cursor-pointer text-left">Termos de Uso</button>
                <button onClick={() => alert('Política de Privacidade - PRIME STORE')} className="hover:opacity-100 hover:underline cursor-pointer text-left">Política de Privacidade</button>
                <button onClick={() => alert('Política de Entrega - Despacho em até 24h')} className="hover:opacity-100 hover:underline cursor-pointer text-left">Política de Entrega</button>
                <button onClick={() => alert('Trocas e Devoluções - Garantia de 30 dias')} className="hover:opacity-100 hover:underline cursor-pointer text-left">Trocas e Devoluções</button>
                <button onClick={() => alert('Perguntas Frequentes - Máquina de Gelo Turbo Ice Premium Mondial')} className="hover:opacity-100 hover:underline cursor-pointer text-left">Perguntas Frequentes</button>
              </nav>
            </div>

            <div className="border-t mt-6 pt-6 text-center text-[11px] opacity-60 leading-relaxed" style={{ borderColor: 'rgba(250, 248, 245, 0.15)' }}>
              © 2025 PRIME STORE - Todos os Direitos Reservados • Eletroportáteis &amp; Casa Inteligente • São Paulo, SP
            </div>
          </div>
        </footer>

        {/* 6. Sticky Buy Bar at bottom (appears on scroll) */}
        <div
          className={`fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-neutral-200 shadow-[0_-6px_24px_-6px_rgba(0,0,0,0.12)] transition-transform duration-200 ${
            showStickyBar ? 'translate-y-0' : 'translate-y-full'
          }`}
        >
          <div className="container mx-auto px-3 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between gap-2.5 sm:gap-4 max-w-5xl">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
              <img
                src="/images/icet1.webp"
                alt="Máquina de Gelo Turbo Ice Premium Mondial"
                loading="eager"
                decoding="async"
                className="w-10 h-10 sm:w-12 sm:h-12 object-contain bg-neutral-50 rounded-lg border border-neutral-200 p-0.5 shrink-0"
              />
              <div className="flex flex-col justify-center min-w-0">
                <span className="font-bold text-[11px] sm:text-sm text-neutral-900 truncate leading-tight">
                  Máquina de Gelo Mondial<span className="hidden sm:inline"> Turbo Ice Premium</span>
                </span>
                <div className="flex items-center gap-1.5 mt-1 flex-nowrap">
                  <span className="font-black text-[15px] sm:text-lg text-neutral-950 tracking-tight tabular-nums leading-none whitespace-nowrap">
                    R$ {productData.price}
                  </span>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-[#0c8f00] text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wide leading-none whitespace-nowrap shrink-0">
                    NO PIX
                  </span>
                  <span className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-neutral-500 leading-none whitespace-nowrap shrink-0">
                    <span aria-hidden="true">•</span>
                    <Truck className="w-3.5 h-3.5 text-[#0c8f00]" />
                    <span>Frete Grátis</span>
                  </span>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleBuyNow}
              onMouseEnter={warmCheckout}
              onTouchStart={warmCheckout}
              className="py-2.5 sm:py-3 px-4 sm:px-8 bg-[#0c8f00] text-white font-extrabold text-[11px] sm:text-sm hover:bg-[#0a7a00] transition-colors rounded-lg shadow-md cursor-pointer uppercase tracking-wide text-center shrink-0 active:scale-[0.98] whitespace-nowrap"
              id="btn-sticky-buy-now"
            >
              COMPRAR AGORA
            </button>
          </div>
        </div>

        {/* 7. Slide-out Cart Drawer */}
        <div
          className={`fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs transition-opacity duration-300 ${
            isCartOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
          onClick={() => setIsCartOpen(false)}
          aria-hidden="true"
        ></div>

        <aside
          role="dialog"
          aria-label="Carrinho"
          className={`fixed top-0 right-0 bottom-0 z-50 w-[90vw] max-w-[420px] bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
            isCartOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div
            className="flex items-center justify-between px-4 py-4 border-b border-neutral-200 text-white"
            style={{ backgroundColor: 'rgb(41, 24, 12)' }}
          >
            <h2 className="font-bold text-base flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-amber-400" />
              <span>Meu Carrinho ({cartItemsCount})</span>
            </h2>
            <button
              onClick={() => setIsCartOpen(false)}
              aria-label="Fechar carrinho"
              className="p-1 hover:bg-white/10 rounded-md transition-colors text-white cursor-pointer"
              id="btn-close-cart-drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="bg-emerald-50 px-4 py-2.5 border-b border-emerald-100 flex items-center gap-2 text-xs text-emerald-800 font-semibold">
            <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Frete Grátis Black Friday com Rastreamento</span>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 divide-y divide-neutral-100">
            {cartItemsCount === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-neutral-400 py-12">
                <ShoppingBag className="w-16 h-16 mb-3 opacity-30 text-neutral-600" />
                <p className="text-sm font-semibold text-neutral-600">Seu carrinho está vazio</p>
                <p className="text-xs text-neutral-400 mt-1 max-w-[240px]">
                  Clique em &quot;Comprar Agora&quot; para escolher a voltagem (110V ou 220V) e garantir sua Máquina de Gelo Mondial por R$ {productData.price}.
                </p>
              </div>
            ) : (
              <div className="py-3 flex gap-3 items-center">
                <img
                  src="/images/icet1.webp"
                  alt="Máquina de Gelo Turbo Ice Premium Mondial"
                  loading="eager"
                  decoding="async"
                  className="w-16 h-16 object-cover border border-neutral-200 rounded"
                />
                <div className="flex-1">
                  <h4 className="text-xs font-bold text-neutral-900 leading-tight">
                    {productData.name}
                  </h4>
                  <p className="text-[11px] text-neutral-500 mt-0.5">
                    Modelo MG-12-GI {selectedVoltage ? `• ${selectedVoltage}` : '• Escolha 110V ou 220V'}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm font-extrabold text-neutral-900 tabular-nums">R$ {productData.price}</span>
                    <button
                      onClick={() => setCartItemsCount(0)}
                      className="text-[11px] text-red-600 font-semibold hover:underline cursor-pointer"
                    >
                      Remover
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-neutral-200 px-4 py-4 space-y-3 bg-neutral-50/50">
            <button
              type="button"
              onClick={handleBuyNow}
              onMouseEnter={warmCheckout}
              onTouchStart={warmCheckout}
              className="w-full py-3.5 font-bold text-sm rounded-lg hover:opacity-95 transition-opacity text-white flex items-center justify-center gap-2 shadow-md cursor-pointer uppercase tracking-wider"
              id="btn-cart-checkout"
              style={{ backgroundColor: 'rgb(12, 143, 0)' }}
            >
              <span>COMPRAR AGORA • R$ {productData.price}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setIsCartOpen(false)}
              className="w-full py-2.5 font-semibold text-xs rounded-lg border border-neutral-300 text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
              id="btn-cart-continue-shopping"
            >
              CONTINUAR COMPRANDO
            </button>
          </div>
        </aside>

        {/* 8. Voltage Selection Modal (110V or 220V) */}
        {isVoltageModalOpen && (
          <div
            className="fixed inset-0 z-[90] bg-black/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in-fast"
            onClick={() => setIsVoltageModalOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="voltage-modal-title"
          >
            <div
              className="w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden animate-zoom-in-fast"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 bg-neutral-50">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center shrink-0">
                    <Plug className="w-4 h-4 text-amber-400" />
                  </div>
                  <div>
                    <h3 id="voltage-modal-title" className="text-sm sm:text-base font-extrabold text-neutral-900 leading-tight">
                      Escolha a Voltagem
                    </h3>
                    <p className="text-[11px] text-neutral-500">Selecione antes de ir para o pagamento</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsVoltageModalOpen(false)}
                  aria-label="Fechar seleção de voltagem"
                  className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200/70 rounded-lg transition-colors cursor-pointer"
                  id="btn-close-voltage-modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-neutral-50 border border-neutral-200/80">
                  <img
                    src="/images/icet1.webp"
                    alt={productData.name}
                    className="w-14 h-14 object-contain bg-white rounded-lg border border-neutral-200 p-1 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-neutral-900 line-clamp-2 leading-snug">
                      {productData.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-base font-black text-neutral-950 tabular-nums">
                        R$ {productData.price}
                      </span>
                      <span className="text-[10px] font-extrabold text-[#0c8f00] bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded uppercase">
                        Frete Grátis
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-bold text-neutral-800 uppercase tracking-wider mb-2.5">
                    Voltagem da tomada na sua casa:
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedVoltage('110V');
                        setVoltageError(false);
                      }}
                      aria-pressed={selectedVoltage === '110V'}
                      id="btn-voltage-110"
                      className={`relative p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
                        selectedVoltage === '110V'
                          ? 'border-[#0c8f00] bg-emerald-50/70 shadow-sm'
                          : 'border-neutral-200 bg-white hover:border-neutral-400'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-lg font-black text-neutral-950 tabular-nums">110V</span>
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                            selectedVoltage === '110V'
                              ? 'bg-[#0c8f00] border-[#0c8f00] text-white'
                              : 'border-neutral-300 bg-white'
                          }`}
                        >
                          {selectedVoltage === '110V' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-600 leading-tight">
                        Padrão 110V / 127V
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedVoltage('220V');
                        setVoltageError(false);
                      }}
                      aria-pressed={selectedVoltage === '220V'}
                      id="btn-voltage-220"
                      className={`relative p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
                        selectedVoltage === '220V'
                          ? 'border-[#0c8f00] bg-emerald-50/70 shadow-sm'
                          : 'border-neutral-200 bg-white hover:border-neutral-400'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-lg font-black text-neutral-950 tabular-nums">220V</span>
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                            selectedVoltage === '220V'
                              ? 'bg-[#0c8f00] border-[#0c8f00] text-white'
                              : 'border-neutral-300 bg-white'
                          }`}
                        >
                          {selectedVoltage === '220V' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-600 leading-tight">
                        Tomada 220V
                      </p>
                    </button>
                  </div>

                  {voltageError && (
                    <p className="text-xs font-bold text-red-600 mt-2">
                      Selecione 110V ou 220V acima para continuar.
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleConfirmVoltageAndProceed}
                  id="btn-confirm-voltage-checkout"
                  className={`w-full py-4 rounded-xl font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer ${
                    selectedVoltage
                      ? 'bg-[#0c8f00] hover:bg-[#0a7a00] text-white active:scale-[0.99]'
                      : 'bg-neutral-900 hover:bg-neutral-800 text-white'
                  }`}
                >
                  <span>
                    {selectedVoltage
                      ? `CONTINUAR (${selectedVoltage}) • R$ ${productData.price}`
                      : 'ESCOLHA A VOLTAGEM ACIMA'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 9. Zoom Modal for Customer Review Photos */}
        {selectedReviewImage && (
          <div
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in-fast"
            onClick={() => setSelectedReviewImage(null)}
          >
            <button
              className="absolute top-6 right-6 text-white p-2 hover:bg-white/10 rounded-full cursor-pointer"
              onClick={() => setSelectedReviewImage(null)}
            >
              <X className="w-8 h-8" />
            </button>
            <img
              src={selectedReviewImage}
              alt="Foto ampliada da avaliação"
              className="max-w-full max-h-[85vh] rounded-xl shadow-2xl object-contain animate-zoom-in-fast"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}
      </div>
    </div>
  );
}
