import React, { useState, useEffect, useRef } from 'react';
import { Star, ChevronLeft, ChevronRight, CheckCircle2, Camera } from 'lucide-react';
import { CustomerReview } from '../types';

interface Props {
  reviews: CustomerReview[];
}

const getInitials = (name: string) => {
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

const getAvatarTheme = (id: number | string) => {
  const themes = [
    { bg: 'bg-blue-100', text: 'text-blue-800' },
    { bg: 'bg-emerald-100', text: 'text-emerald-800' },
    { bg: 'bg-purple-100', text: 'text-purple-800' },
    { bg: 'bg-amber-100', text: 'text-amber-800' },
    { bg: 'bg-rose-100', text: 'text-rose-800' },
    { bg: 'bg-indigo-100', text: 'text-indigo-800' },
    { bg: 'bg-teal-100', text: 'text-teal-800' },
    { bg: 'bg-sky-100', text: 'text-sky-800' },
  ];
  const num = typeof id === 'number' ? id : (id ? id.toString().charCodeAt(0) : 0);
  return themes[Math.abs(num) % themes.length];
};

export const CheckoutReviewsCarousel: React.FC<Props> = ({ reviews }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Auto slide every 6 seconds if user isn't interacting
  useEffect(() => {
    if (!reviews || reviews.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % reviews.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [reviews?.length]);

  if (!reviews || reviews.length === 0) return null;

  const prevReview = () => {
    setCurrentIndex(prev => (prev === 0 ? reviews.length - 1 : prev - 1));
  };

  const nextReview = () => {
    setCurrentIndex(prev => (prev + 1) % reviews.length);
  };

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 40; // minimum px for a swipe

    if (distance > minSwipeDistance) {
      // Swiped left -> next review
      nextReview();
    } else if (distance < -minSwipeDistance) {
      // Swiped right -> prev review
      prevReview();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  const currentReview = reviews[currentIndex];
  const nextReviewItem = reviews[(currentIndex + 1) % reviews.length];

  return (
    <div className="w-full mt-6 pt-4 border-t border-neutral-200" id="checkout-reviews-carousel">
      
      {/* Header with Title, Rating, Total Reviews Count and Navigation Arrows */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 px-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-neutral-900">Avaliações de Clientes</span>
          <div className="inline-flex items-center gap-1 bg-amber-50 border border-amber-200/90 px-2 py-0.5 rounded-full shadow-2xs">
            <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
            <span className="text-[11px] font-black text-amber-950">4.9</span>
            <span className="text-[10px] font-semibold text-neutral-600">• (+480 avaliações)</span>
          </div>
        </div>

        {/* Previous and Next Slide Buttons & Current Highlight */}
        <div className="flex items-center justify-between sm:justify-end gap-2">
          <span className="text-[10px] font-medium text-neutral-500">
            Destaque {currentIndex + 1} de {reviews.length}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={prevReview}
              className="w-7 h-7 rounded-full bg-white hover:bg-neutral-100 text-neutral-700 border border-neutral-300 shadow-2xs flex items-center justify-center transition-all active:scale-95 cursor-pointer"
              aria-label="Avaliação anterior"
              title="Ver avaliação anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={nextReview}
              className="w-7 h-7 rounded-full bg-white hover:bg-neutral-100 text-neutral-700 border border-neutral-300 shadow-2xs flex items-center justify-center transition-all active:scale-95 cursor-pointer"
              aria-label="Próxima avaliação"
              title="Ver próxima avaliação"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Swipeable Container */}
      <div 
        className="relative overflow-hidden touch-pan-y select-none"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="flex gap-3 items-stretch">
          
          {/* Main active review card */}
          <div className="flex-1 bg-white border border-neutral-200 rounded-xl p-4 shadow-xs relative flex flex-col justify-between min-h-[145px] transition-all duration-300">
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="flex items-center gap-0.5 text-amber-400 mb-1">
                    {[...Array(currentReview.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <h4 className="font-bold text-xs sm:text-sm text-neutral-900 leading-tight">
                    {currentReview.name}
                  </h4>
                  <span className="text-[10px] text-neutral-400">
                    {currentReview.date || 'Avaliação recente'}
                  </span>
                </div>

                {/* Avatar / Review Photo Circle - Estritamente Foto de Perfil ou Iniciais do Cliente (NUNCA foto do produto) */}
                <div className="shrink-0 w-10 h-10 rounded-full overflow-hidden border border-neutral-200 shadow-2xs bg-neutral-100 flex items-center justify-center">
                  {currentReview.avatar ? (
                    <img 
                      src={currentReview.avatar} 
                      alt={currentReview.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className={`w-full h-full flex items-center justify-center font-extrabold text-xs ${getAvatarTheme(currentReview.id).bg} ${getAvatarTheme(currentReview.id).text}`}>
                      {getInitials(currentReview.name)}
                    </div>
                  )}
                </div>
              </div>

              <p className="text-xs text-neutral-600 leading-relaxed line-clamp-3">
                "{currentReview.text}"
              </p>

              {/* Fotos REAIS do Produto Recebido (exibidas corretamente como anexo de foto do cliente) */}
              {currentReview.photos && currentReview.photos.length > 0 && (
                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-neutral-100">
                  <div className="flex items-center gap-1.5 shrink-0">
                    {currentReview.photos.slice(0, 2).map((photo, i) => (
                      <div key={i} className="w-10 h-10 rounded-lg overflow-hidden border border-neutral-200 shadow-2xs bg-neutral-50">
                        <img 
                          src={photo} 
                          alt="Foto do produto recebido" 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover hover:scale-105 transition-transform"
                        />
                      </div>
                    ))}
                  </div>
                  <span className="text-[10px] text-neutral-500 font-medium flex items-center gap-1">
                    <Camera className="w-3 h-3 text-neutral-400 shrink-0" />
                    <span>{currentReview.photos.length} foto{currentReview.photos.length > 1 ? 's' : ''} do produto recebido</span>
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between mt-2 pt-2 border-t border-neutral-100">
              <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                <span>Compra Verificada • Escova Elétrica 9 em 1</span>
              </span>
              <span className="text-[10px] text-neutral-400">
                Arraste para o lado &rarr;
              </span>
            </div>
          </div>

          {/* Peek of next card (like in screenshot IMG_9656.PNG) - Clickable to go to next */}
          <div 
            onClick={nextReview}
            className="w-20 sm:w-28 opacity-45 hover:opacity-80 transition-opacity cursor-pointer bg-white border border-neutral-200 rounded-xl p-3 shrink-0 hidden xs:flex flex-col justify-between"
            title="Clique para ver próxima avaliação"
          >
            <div>
              <div className="flex items-center gap-0.5 text-amber-400 mb-1">
                {[...Array(nextReviewItem.rating || 5)].map((_, i) => (
                  <Star key={i} className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <div className="flex items-center gap-1.5 mb-1">
                <div className="w-4 h-4 rounded-full overflow-hidden border border-neutral-200 shadow-2xs shrink-0 flex items-center justify-center">
                  {nextReviewItem.avatar ? (
                    <img 
                      src={nextReviewItem.avatar} 
                      alt={nextReviewItem.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className={`w-full h-full flex items-center justify-center font-black text-[8px] ${getAvatarTheme(nextReviewItem.id).bg} ${getAvatarTheme(nextReviewItem.id).text}`}>
                      {getInitials(nextReviewItem.name)}
                    </div>
                  )}
                </div>
                <h5 className="font-bold text-[11px] text-neutral-900 truncate">
                  {nextReviewItem.name}
                </h5>
              </div>
              <p className="text-[10px] text-neutral-500 line-clamp-2 mt-0.5">
                {nextReviewItem.text}
              </p>
            </div>
            <span className="text-[9px] text-neutral-400">Ver mais &rarr;</span>
          </div>

        </div>
      </div>

      {/* Dots Indicator with clickable items */}
      <div className="flex items-center justify-center gap-1.5 mt-3">
        {reviews.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`transition-all duration-200 rounded-full cursor-pointer ${
              currentIndex === idx 
                ? 'w-4 h-1.5 bg-neutral-900' 
                : 'w-1.5 h-1.5 bg-neutral-300 hover:bg-neutral-400'
            }`}
            aria-label={`Ver avaliação ${idx + 1}`}
          />
        ))}
      </div>

      <p className="text-[10px] text-center text-neutral-400 mt-2 font-medium">
        + de 480 avaliações 5 estrelas registradas no pós-venda da PRIME STORE
      </p>
    </div>
  );
};
