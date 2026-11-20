import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Lock, 
  ChevronDown, 
  ChevronUp, 
  ArrowLeft, 
  Check, 
  Copy, 
  Info, 
  Clock, 
  ShieldCheck, 
  Truck, 
  CreditCard, 
  AlertCircle, 
  CheckCircle2,
  Sparkles,
  QrCode,
  Zap,
  PackageCheck,
  Edit3,
  Loader2,
  Package,
  User,
  MapPin
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CustomerReview, CheckoutFormData, ShippingMethod } from '../types';
import { formatCPF, formatPhone, formatCEP, validateCPF, generatePixPayload } from '../utils/pix';
import { CheckoutReviewsCarousel } from './CheckoutReviewsCarousel';
import { PixQrCode } from './PixQrCode';
import { BankLogosRow, PaymentBrandBadges } from './BankLogos';

interface CheckoutProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    name: string;
    brand: string;
    price: string;
    oldPrice: string;
    image: string;
  };
  reviews: CustomerReview[];
}

// Temporizador de 20 minutos de reserva no checkout
// Só conta regressivamente enquanto o usuário estiver com o checkout aberto (isOpen === true).
// Enquanto estiver na primeira parte da página (loja), o tempo NÃO diminui.
// Se voltar ao checkout, continua contando de onde parou.
// Se zerar (00:00), permanece em 00:00 sem bloquear nada.
const CHECKOUT_TIMER_KEY = 'prime_store_checkout_timer_seconds_v3';
const CHECKOUT_TIMER_TOTAL_SECONDS = 20 * 60; // 20 minutos

const getInitialCheckoutTimer = (): number => {
  if (typeof window === 'undefined') return CHECKOUT_TIMER_TOTAL_SECONDS;
  try {
    const saved = localStorage.getItem(CHECKOUT_TIMER_KEY);
    if (saved !== null) {
      const val = parseInt(saved, 10);
      if (!isNaN(val) && val >= 0 && val <= CHECKOUT_TIMER_TOTAL_SECONDS) {
        return val;
      }
    }
  } catch {
    // ignore
  }
  return CHECKOUT_TIMER_TOTAL_SECONDS;
};

export const Checkout: React.FC<CheckoutProps> = ({
  isOpen,
  onClose,
  product,
  reviews
}) => {
  // Steps: 1 = Identificação, 2 = Entrega, 3 = Pagamento, 4 = Pix Gerado / Sucesso
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const checkoutContainerRef = useRef<HTMLDivElement>(null);
  
  // Timer contínuo de reserva (30 minutos que não reinicia ao mudar de etapa)
  const [timeLeft, setTimeLeft] = useState<number>(getInitialCheckoutTimer);

  // Form State
  const [formData, setFormData] = useState<CheckoutFormData>({
    fullName: '',
    email: '',
    cpf: '',
    phone: '',
    cep: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: 'SP',
    shippingMethodId: 'standard',
    paymentMethod: 'pix'
  });

  // Validation errors
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  
  // CEP loading state
  const [isLoadingCep, setIsLoadingCep] = useState(false);
  const [cepSuccess, setCepSuccess] = useState(false);

  // Pix state
  const [pixCopied, setPixCopied] = useState(false);
  const [pixTimer, setPixTimer] = useState(15 * 60);
  const [isPaymentConfirmed, setIsPaymentConfirmed] = useState(false);

  // Card attempt modal or inline notification
  const [showCardWarning, setShowCardWarning] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isIframeLoading, setIsIframeLoading] = useState(true);

  // Shipping methods (conforme solicitação do usuário: Envio Econômico R$ 8,56 e Envio Sedex Full R$ 12,41)
  const shippingMethods: ShippingMethod[] = [
    {
      id: 'standard',
      name: 'Envio Econômico',
      subtitle: '7 a 10 dias úteis',
      price: 8.56,
      estimatedDays: '7 a 10 dias'
    },
    {
      id: 'sedex',
      name: 'Envio Sedex Full',
      subtitle: '2 a 4 dias úteis',
      price: 12.41,
      estimatedDays: '2 a 4 dias'
    }
  ];

  // O frete só é cobrado/adicionado DEPOIS que a pessoa colocar as informações de envio (CEP preenchido e buscado)
  const isShippingCalculated = (step === 2 && formData.cep.replace(/\D/g, '').length === 8 && cepSuccess) || step >= 3;

  const selectedShipping = shippingMethods.find(s => s.id === formData.shippingMethodId) || shippingMethods[0];
  const productPriceNum = parseFloat(product.price.replace(',', '.'));
  const oldPriceNum = parseFloat(product.oldPrice.replace(',', '.'));
  const savingsAmount = Math.max(0, oldPriceNum - productPriceNum);
  const discountPercent = oldPriceNum > 0 ? Math.round((savingsAmount / oldPriceNum) * 100) : 68;
  const currentShippingPrice = isShippingCalculated ? selectedShipping.price : 0;
  const totalPrice = productPriceNum + currentShippingPrice;

  // Countdown timer effect:
  // Só conta regressivamente enquanto o checkout estiver aberto (isOpen === true).
  // Enquanto o usuário estiver na primeira parte da página (loja), o tempo NÃO diminui.
  // Se voltar ao checkout, continua contando de onde parou.
  // Se chegar a 00:00, permanece em 00:00 sem bloquear nada.
  useEffect(() => {
    if (!isOpen) return;

    // Sincroniza com o valor persistido ao abrir o modal
    try {
      const saved = localStorage.getItem(CHECKOUT_TIMER_KEY);
      if (saved !== null) {
        const val = parseInt(saved, 10);
        if (!isNaN(val) && val >= 0 && val <= CHECKOUT_TIMER_TOTAL_SECONDS) {
          setTimeLeft(val);
        }
      }
    } catch {
      // ignore
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) return 0;
        const next = prev - 1;
        try {
          localStorage.setItem(CHECKOUT_TIMER_KEY, next.toString());
        } catch {
          // ignore
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  // Pix timer effect
  useEffect(() => {
    if (step !== 4 || isPaymentConfirmed) return;
    const timer = setInterval(() => {
      setPixTimer(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [step, isPaymentConfirmed]);

  // Libera o overlay do iframe progressivamente em no máximo 1.5s para evitar espera bloqueada em scripts terceiros
  useEffect(() => {
    if (step !== 3 || !isIframeLoading) return;
    const fallbackTimer = setTimeout(() => {
      setIsIframeLoading(false);
    }, 1500);
    return () => clearTimeout(fallbackTimer);
  }, [step, isIframeLoading]);

  // Garante que o botão de pagamento seja destravado caso o usuário volte da página de pagamento (bfcache / back button)
  useEffect(() => {
    const handleRestoreFromPayment = () => {
      setIsRedirecting(false);
    };

    window.addEventListener('pageshow', handleRestoreFromPayment);
    window.addEventListener('focus', handleRestoreFromPayment);
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        setIsRedirecting(false);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('pageshow', handleRestoreFromPayment);
      window.removeEventListener('focus', handleRestoreFromPayment);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  // Trava a rolagem do body/html enquanto o checkout estiver aberto
  useEffect(() => {
    if (isOpen) {
      setIsRedirecting(false);
      const originalBodyOverflow = document.body.style.overflow;
      const originalHtmlOverflow = document.documentElement.style.overflow;
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';

      return () => {
        document.body.style.overflow = originalBodyOverflow;
        document.documentElement.style.overflow = originalHtmlOverflow;
      };
    }
  }, [isOpen]);

  // Função para rolar imediatamente até o topo da tela
  const scrollToTop = () => {
    if (checkoutContainerRef.current) {
      checkoutContainerRef.current.scrollTop = 0;
    }
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    }

    requestAnimationFrame(() => {
      if (checkoutContainerRef.current) {
        checkoutContainerRef.current.scrollTop = 0;
      }
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
      }
    });

    setTimeout(() => {
      if (checkoutContainerRef.current) {
        checkoutContainerRef.current.scrollTop = 0;
      }
    }, 60);
  };

  // Garante que ao mudar de etapa (ex: ir para Entrega) ou abrir o checkout, sempre posicione no local correto
  useEffect(() => {
    if (isOpen) {
      setIsRedirecting(false);
      if (step === 3) {
        setTimeout(() => {
          const el = document.getElementById('step3-payment-container');
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          } else {
            scrollToTop();
          }
        }, 60);
      } else {
        scrollToTop();
      }
    }
  }, [step, isOpen]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // CEP lookup
  const handleCepChange = async (value: string) => {
    const formatted = formatCEP(value);
    setFormData(prev => ({ ...prev, cep: formatted }));
    
    // Clear error for CEP
    if (errors.cep) {
      setErrors(prev => ({ ...prev, cep: '' }));
    }

    const clean = formatted.replace(/\D/g, '');
    if (clean.length === 8) {
      setIsLoadingCep(true);
      try {
        const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
        const data = await res.json();
        if (data.erro) {
          setErrors(prev => ({ ...prev, cep: 'CEP não encontrado. Digite um CEP válido.' }));
          setCepSuccess(false);
        } else {
          setFormData(prev => ({
            ...prev,
            street: data.logradouro || '',
            neighborhood: data.bairro || '',
            city: data.localidade || '',
            state: data.uf || 'SP'
          }));
          setCepSuccess(true);
          setErrors(prev => {
            const next = { ...prev };
            delete next.cep;
            delete next.street;
            delete next.neighborhood;
            delete next.city;
            delete next.state;
            return next;
          });
        }
      } catch (err) {
        console.error('Erro ao buscar CEP:', err);
      } finally {
        setIsLoadingCep(false);
      }
    } else {
      setCepSuccess(false);
    }
  };

  // Step 1 Validation: Identificação
  const validateStep1 = () => {
    const newErrors: { [key: string]: string } = {};

    const nameParts = formData.fullName.trim().split(' ').filter(Boolean);
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Digite seu nome completo.';
    } else if (nameParts.length < 2) {
      newErrors.fullName = 'Por favor, informe nome e sobrenome.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Digite seu e-mail.';
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Digite um e-mail válido (ex: seu@email.com).';
    }

    const cleanCpf = formData.cpf.replace(/\D/g, '');
    if (!formData.cpf.trim()) {
      newErrors.cpf = 'Digite seu CPF.';
    } else if (cleanCpf.length !== 11) {
      newErrors.cpf = 'O CPF deve ter 11 dígitos.';
    } else if (!validateCPF(formData.cpf)) {
      newErrors.cpf = 'Número de CPF inválido. Verifique os dígitos.';
    }

    const cleanPhone = formData.phone.replace(/\D/g, '');
    if (!formData.phone.trim()) {
      newErrors.phone = 'Digite seu número de celular com DDD.';
    } else if (cleanPhone.length < 10) {
      newErrors.phone = 'Telefone incompleto. Digite com DDD (mínimo 10 dígitos).';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Step 2 Validation: Entrega
  const validateStep2 = () => {
    const newErrors: { [key: string]: string } = {};

    const cleanCep = formData.cep.replace(/\D/g, '');
    if (!formData.cep.trim()) {
      newErrors.cep = 'Digite seu CEP.';
    } else if (cleanCep.length !== 8) {
      newErrors.cep = 'O CEP deve conter 8 números.';
    }

    if (!formData.street.trim()) {
      newErrors.street = 'Informe o endereço de entrega.';
    }

    if (!formData.number.trim()) {
      newErrors.number = 'Informe o número da residência (ou S/N).';
    }

    if (!formData.neighborhood.trim()) {
      newErrors.neighborhood = 'Informe o bairro.';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'Informe a cidade.';
    }

    if (!formData.state.trim()) {
      newErrors.state = 'Informe o estado.';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      setTimeout(() => {
        if (newErrors.cep) {
          document.getElementById('input-cep')?.focus();
        } else if (newErrors.number) {
          document.getElementById('input-number')?.focus();
        } else if (newErrors.street) {
          document.getElementById('input-street')?.focus();
        } else if (newErrors.neighborhood) {
          document.getElementById('input-neighborhood')?.focus();
        }
      }, 50);
      return false;
    }

    return true;
  };

  // =========================================================================
  // LINK DE PAGAMENTO INTEGRADO (EMBUTIDO NA MESMA PÁGINA SEM MUDAR DE SITE):
  // - Link oficial: https://pay.primestoreshop.site/6aff2d7b5b33a1b1a836c225
  // =========================================================================
  const getPaymentUrl = () => {
    const baseUrl = 'https://pay.primestoreshop.site/6aff2d7b5b33a1b1a836c225';

    try {
      const url = new URL(baseUrl);

      // Repassa parâmetros de rastreamento (UTMs) se existirem na URL atual
      if (typeof window !== 'undefined' && window.location.search) {
        const currentParams = new URLSearchParams(window.location.search);
        currentParams.forEach((val, key) => {
          url.searchParams.set(key, val);
        });
      }

      const cleanCpf = formData.cpf.replace(/\D/g, '');
      const cleanPhone = formData.phone.replace(/\D/g, '');
      const cleanCep = formData.cep.replace(/\D/g, '');
      const cleanNumber = formData.number.replace(/\D/g, '') || formData.number.trim();

      // Envia os dados pessoais da pessoa para o checkout de pagamento
      if (formData.fullName) {
        url.searchParams.set('nome', formData.fullName.trim());
        url.searchParams.set('name', formData.fullName.trim());
        url.searchParams.set('fullName', formData.fullName.trim());
      }
      if (formData.email) {
        url.searchParams.set('email', formData.email.trim());
      }
      if (formData.phone) {
        url.searchParams.set('telefone', cleanPhone);
        url.searchParams.set('phone', cleanPhone);
        url.searchParams.set('celular', cleanPhone);
      }
      if (formData.cpf) {
        url.searchParams.set('documento', cleanCpf);
        url.searchParams.set('cpf', cleanCpf);
        url.searchParams.set('document', cleanCpf);
      }

      // Envia os dados de endereço de entrega para o checkout
      if (formData.cep) {
        url.searchParams.set('cep', cleanCep);
        url.searchParams.set('zipcode', cleanCep);
      }
      if (formData.street) {
        url.searchParams.set('rua', formData.street.trim());
        url.searchParams.set('street', formData.street.trim());
        url.searchParams.set('logradouro', formData.street.trim());
      }
      if (formData.number) {
        url.searchParams.set('numero', cleanNumber);
        url.searchParams.set('number', cleanNumber);
      }
      if (formData.neighborhood) {
        url.searchParams.set('bairro', formData.neighborhood.trim());
        url.searchParams.set('neighborhood', formData.neighborhood.trim());
      }
      if (formData.city) {
        url.searchParams.set('cidade', formData.city.trim());
        url.searchParams.set('city', formData.city.trim());
      }
      if (formData.state) {
        url.searchParams.set('estado', formData.state.trim().toUpperCase());
        url.searchParams.set('state', formData.state.trim().toUpperCase());
        url.searchParams.set('uf', formData.state.trim().toUpperCase());
      }
      if (formData.complement) {
        url.searchParams.set('complemento', formData.complement.trim());
        url.searchParams.set('complement', formData.complement.trim());
      }

      return url.toString();
    } catch {
      return baseUrl;
    }
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (validateStep1()) {
        setStep(2);
        scrollToTop();
      }
    } else if (step === 2) {
      if (validateStep2()) {
        setIsIframeLoading(true);
        setStep(3);
        setTimeout(() => {
          const el = document.getElementById('step3-payment-container');
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          } else {
            scrollToTop();
          }
        }, 60);
      }
    }
  };

  const handleGeneratePix = () => {
    setIsIframeLoading(true);
    setStep(3);
    scrollToTop();
  };

  const pixPayload = generatePixPayload({
    key: "pix@primestoreshop.site",
    name: "PRIME STORE",
    city: "SAO PAULO",
    txid: "VNX" + Math.floor(100000 + Math.random() * 900000),
    amount: totalPrice
  });

  const handleCopyPix = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(pixPayload);
      setPixCopied(true);
      setTimeout(() => setPixCopied(false), 3500);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      ref={checkoutContainerRef} 
      id="checkout-modal-container"
      className="fixed inset-0 z-[100] bg-white overflow-y-auto overflow-x-hidden touch-pan-y font-sans text-neutral-900 selection:bg-neutral-900 selection:text-white"
    >
      
      {/* 1. Header Fixo no Topo da Página + Faixa do Temporizador Contínuo (não acompanha a rolagem) */}
      <div className="relative z-10 shadow-xs">
        <header className="bg-white border-b border-neutral-100">
          <div className="max-w-xl mx-auto px-4 py-3 flex items-center justify-between">
            
            {/* Left: Close button (X) and Store Logo: PRIME STORE */}
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Voltar para a loja"
                id="checkout-btn-close"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center">
                <img 
                  src="https://i.imgur.com/DGHgEP3.png" 
                  alt="PRIME STORE"
                  referrerPolicy="no-referrer"
                  className="h-8 sm:h-9 w-auto object-contain"
                />
              </div>
            </div>

            {/* Right: 100% Secure Checkout Badge (Exatamente como em IMG_9655.PNG) */}
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-neutral-800 shrink-0" />
              <div className="flex flex-col text-[10px] leading-tight font-extrabold uppercase text-left">
                <span className="text-neutral-900 text-[10px] font-black tracking-wider">PAGAMENTO</span>
                <span className="text-neutral-500 text-[9px] font-bold">100% SEGURO</span>
              </div>
            </div>

          </div>
        </header>

        {/* 2. Top Banner: Mesma cor da barra no topo da página principal (rgb(41, 24, 12)) */}
        <div 
          className="py-2.5 px-3 text-center border-b border-[#1c1008] select-none"
          style={{ backgroundColor: 'rgb(41, 24, 12)', color: 'rgb(250, 248, 245)' }}
          id="checkout-reservation-banner"
        >
          <div className="max-w-xl mx-auto flex items-center justify-center text-center px-2">
            <p className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wide leading-snug">
              FINALIZE SEU PAGAMENTO • RESTAM {formatTimer(timeLeft)} PARA GARANTIR O PREÇO PROMOCIONAL
            </p>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <main className="max-w-xl mx-auto px-4 py-4 pb-16">
        
        {/* 3. Collapsible Order Summary */}
        <div className="border border-neutral-200 rounded-xl mb-4 overflow-hidden bg-neutral-50/70 shadow-2xs">
          <button
            type="button"
            onClick={() => setIsSummaryOpen(!isSummaryOpen)}
            className="w-full px-4 py-3.5 flex items-center justify-between text-neutral-900 font-bold text-sm hover:bg-neutral-100 transition-colors cursor-pointer"
            id="checkout-toggle-summary"
          >
            <span className="flex items-center gap-2">
              <span className="text-neutral-800">Resumo do pedido (1)</span>
              <ChevronDown className={`w-4 h-4 text-neutral-500 transition-transform duration-200 ${isSummaryOpen ? 'rotate-180' : ''}`} />
            </span>
            <div className="text-right">
              <span className="text-base font-extrabold text-neutral-900">
                R$ {totalPrice.toFixed(2).replace('.', ',')}
              </span>
              {!isShippingCalculated && (
                <span className="block text-[10px] font-medium text-neutral-400 -mt-0.5">
                  + frete no envio
                </span>
              )}
            </div>
          </button>

          <AnimatePresence>
            {isSummaryOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden border-t border-neutral-200 px-4 py-3 bg-white"
              >
                <div className="flex gap-3 items-center pb-3 border-b border-neutral-100">
                  <div className="relative w-14 h-14 bg-neutral-50 rounded-lg border border-neutral-200 p-1 shrink-0">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-contain"
                    />
                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-neutral-800 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      1
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-neutral-900 line-clamp-1">
                      {product.name}
                    </h4>
                    <p className="text-[11px] text-neutral-500 mt-0.5">
                      Cabo Extensor + 9 Ponteiras + Visor Digital LED
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-black text-neutral-900 tabular-nums">
                        R$ {product.price}
                      </span>
                      <span className="text-[11px] text-neutral-400 line-through tabular-nums">
                        R$ {product.oldPrice}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Subtotals & Shipping */}
                <div className="pt-3 space-y-1.5 text-xs text-neutral-600">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="font-semibold text-neutral-800 tabular-nums">R$ {product.price}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Frete{isShippingCalculated ? ` (${selectedShipping.name})` : ''}:</span>
                    {isShippingCalculated ? (
                      <span className="font-semibold text-neutral-900 tabular-nums">
                        R$ {selectedShipping.price.toFixed(2).replace('.', ',')}
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200">
                        Calcular na etapa de envio
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Desconto Promocional ({discountPercent}% OFF):</span>
                    <span className="tabular-nums">- R$ {savingsAmount.toFixed(2).replace('.', ',')}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-neutral-200 text-sm font-extrabold text-neutral-900">
                    <span>Total:</span>
                    <span className="text-base text-emerald-800 tabular-nums">
                      R$ {totalPrice.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ================= STEP 1: IDENTIFICAÇÃO ================= */}
        {step === 1 && (
          <div className="space-y-4">
            
            {/* Step title & indicator */}
            <div className="flex items-baseline justify-between border-b border-neutral-100 pb-2">
              <div>
                <h2 className="text-xl font-extrabold text-neutral-900 tracking-tight">
                  Identificação
                </h2>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Preencha seus dados para envio do pedido.
                </p>
              </div>
              <span className="text-xs font-bold text-neutral-400">
                1 de 3
              </span>
            </div>

            {/* Input: Nome Completo */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-neutral-800">
                Nome completo
              </label>
              <input
                type="text"
                placeholder="Digite seu nome completo"
                value={formData.fullName}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, fullName: e.target.value }));
                  if (errors.fullName) setErrors(prev => ({ ...prev, fullName: '' }));
                }}
                className={`w-full px-3.5 py-3 rounded-lg border text-base sm:text-sm text-neutral-900 bg-white placeholder-neutral-400 focus:outline-none focus:ring-2 transition-colors ${
                  errors.fullName 
                    ? 'border-red-500 focus:ring-red-200 bg-red-50/20' 
                    : 'border-neutral-300 focus:border-neutral-900 focus:ring-neutral-200'
                }`}
                id="input-fullname"
              />
              {errors.fullName && (
                <p className="text-[11px] text-red-600 font-medium flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.fullName}</span>
                </p>
              )}
            </div>

            {/* Input: E-mail */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-neutral-800">
                E-mail
              </label>
              <input
                type="email"
                placeholder="Digite seu e-mail"
                value={formData.email}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, email: e.target.value }));
                  if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
                }}
                className={`w-full px-3.5 py-3 rounded-lg border text-base sm:text-sm text-neutral-900 bg-white placeholder-neutral-400 focus:outline-none focus:ring-2 transition-colors ${
                  errors.email 
                    ? 'border-red-500 focus:ring-red-200 bg-red-50/20' 
                    : 'border-neutral-300 focus:border-neutral-900 focus:ring-neutral-200'
                }`}
                id="input-email"
              />
              {errors.email && (
                <p className="text-[11px] text-red-600 font-medium flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.email}</span>
                </p>
              )}
            </div>

            {/* Input: CPF */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-neutral-800 flex items-center gap-1">
                  <span>CPF</span>
                  <button 
                    type="button" 
                    onClick={() => alert('O CPF é exigido pela Receita Federal e Correios para emissão da Nota Fiscal e envio de encomendas.')}
                    className="text-neutral-400 hover:text-neutral-600 cursor-pointer"
                  >
                    <Info className="w-3.5 h-3.5" />
                  </button>
                </label>
              </div>
              <input
                type="text"
                placeholder="000.000.000-00"
                maxLength={14}
                value={formData.cpf}
                onChange={(e) => {
                  const formatted = formatCPF(e.target.value);
                  setFormData(prev => ({ ...prev, cpf: formatted }));
                  if (errors.cpf) setErrors(prev => ({ ...prev, cpf: '' }));
                }}
                className={`w-full px-3.5 py-3 rounded-lg border text-base sm:text-sm text-neutral-900 bg-white placeholder-neutral-400 focus:outline-none focus:ring-2 transition-colors ${
                  errors.cpf 
                    ? 'border-red-500 focus:ring-red-200 bg-red-50/20' 
                    : 'border-neutral-300 focus:border-neutral-900 focus:ring-neutral-200'
                }`}
                id="input-cpf"
              />
              {errors.cpf && (
                <p className="text-[11px] text-red-600 font-medium flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.cpf}</span>
                </p>
              )}
            </div>

            {/* Input: Celular/Whatsapp */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-neutral-800">
                Celular/Whatsapp
              </label>
              <input
                type="text"
                placeholder="+55 (00) 00000-0000"
                maxLength={16}
                value={formData.phone}
                onChange={(e) => {
                  const formatted = formatPhone(e.target.value);
                  setFormData(prev => ({ ...prev, phone: formatted }));
                  if (errors.phone) setErrors(prev => ({ ...prev, phone: '' }));
                }}
                className={`w-full px-3.5 py-3 rounded-lg border text-base sm:text-sm text-neutral-900 bg-white placeholder-neutral-400 focus:outline-none focus:ring-2 transition-colors ${
                  errors.phone 
                    ? 'border-red-500 focus:ring-red-200 bg-red-50/20' 
                    : 'border-neutral-300 focus:border-neutral-900 focus:ring-neutral-200'
                }`}
                id="input-phone"
              />
              {errors.phone && (
                <p className="text-[11px] text-red-600 font-medium flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.phone}</span>
                </p>
              )}
            </div>

            {/* Main Action Button */}
            <button
              type="button"
              onClick={handleNextStep}
              className="w-full py-4 bg-[#1c2434] hover:bg-[#151c28] text-white font-extrabold text-sm sm:text-base rounded-xl transition-all shadow-md active:scale-[0.99] cursor-pointer tracking-wider uppercase mt-4 flex items-center justify-center gap-2"
              id="btn-ir-para-entrega"
            >
              <span>IR PARA ENTREGA</span>
            </button>

            {/* Customer Reviews Carousel (from the product page, just like in IMG_9656.PNG) */}
            <CheckoutReviewsCarousel reviews={reviews} />

          </div>
        )}

        {/* ================= STEP 2: ENTREGA ================= */}
        {step === 2 && (
          <div className="space-y-4">
            
            {/* 1. Box Identificação com botão Editar e dados da página anterior (conforme IMG_9657.PNG) */}
            <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-2xs">
              <div className="flex items-center justify-between mb-1.5">
                <h3 className="font-extrabold text-sm text-neutral-900">
                  Identificação
                </h3>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-neutral-500 hover:text-neutral-900 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                  id="btn-edit-identificacao-step2"
                >
                  <span>Editar</span>
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="text-xs space-y-0.5">
                <p className="font-bold text-neutral-900 text-sm">
                  {formData.fullName || 'Não informado'}
                </p>
                <p className="text-neutral-600">
                  {formData.email || 'Não informado'}
                </p>
                <p className="text-neutral-600">
                  {formData.phone || 'Não informado'}
                </p>
              </div>
            </div>

            {/* 2. Seção Entrega (conforme IMG_9657.PNG e IMG_9658.PNG) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-extrabold text-neutral-900">
                    Entrega
                  </h2>
                  <p className="text-xs text-neutral-500">
                    Informe o endereço de entrega
                  </p>
                </div>
                <span className="text-xs font-bold text-neutral-400">
                  2 de 3
                </span>
              </div>

              {/* Campo CEP */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-neutral-800">
                  CEP
                </label>
                <div className="flex items-center gap-2.5">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="00000-000"
                      maxLength={9}
                      value={formData.cep}
                      onChange={(e) => handleCepChange(e.target.value)}
                      className={`w-full px-3.5 py-3 rounded-lg border text-base sm:text-sm text-neutral-900 transition-colors focus:outline-none focus:ring-2 ${
                        errors.cep 
                          ? 'border-red-500 bg-red-50/20 focus:ring-red-200' 
                          : formData.cep.replace(/\D/g, '').length === 8 
                          ? 'border-neutral-300 bg-[#f0f4fa]' 
                          : 'border-neutral-300 bg-white placeholder-neutral-400 focus:border-neutral-900 focus:ring-neutral-200'
                      }`}
                      id="input-cep"
                    />
                    {formData.cep.replace(/\D/g, '').length === 8 && !errors.cep && (
                      <Check className="w-4 h-4 text-emerald-600 absolute right-3 top-1/2 -translate-y-1/2 stroke-[2.5]" />
                    )}
                  </div>

                  {/* Mostra UF/Cidade ao lado do CEP (exatamente como em IMG_9658.PNG: SP/Bofete) */}
                  {formData.cep.replace(/\D/g, '').length === 8 && (formData.city || formData.state) && (
                    <span className="text-xs font-bold text-neutral-800 shrink-0 select-none">
                      {formData.state}/{formData.city}
                    </span>
                  )}
                </div>

                {isLoadingCep && (
                  <p className="text-[11px] text-neutral-500 animate-pulse flex items-center gap-1 mt-1 font-medium">
                    <span>Buscando endereço...</span>
                  </p>
                )}

                {errors.cep && (
                  <p className="text-[11px] text-red-600 font-medium flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errors.cep}</span>
                  </p>
                )}
              </div>

              {/* SÓ APARECEM AS INFORMAÇÕES DE ENVIO ASSIM QUE COLOCAR O CEP (8 dígitos) */}
              {formData.cep.replace(/\D/g, '').length === 8 && !errors.cep && (
                <div className="space-y-3 pt-1">
                  
                  {/* Endereço com Check verde */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-neutral-800">
                      Endereço
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Rua, Avenida..."
                        value={formData.street}
                        onChange={(e) => {
                          setFormData(prev => ({ ...prev, street: e.target.value }));
                          if (errors.street) setErrors(prev => ({ ...prev, street: '' }));
                        }}
                        className={`w-full px-3.5 py-3 rounded-lg border text-base sm:text-sm text-neutral-900 bg-[#f0f4fa] focus:outline-none focus:ring-2 transition-colors ${
                          errors.street ? 'border-red-500 bg-red-50/20' : 'border-neutral-300'
                        }`}
                        id="input-street"
                      />
                      {formData.street.trim().length > 0 && (
                        <Check className="w-4 h-4 text-emerald-600 absolute right-3 top-1/2 -translate-y-1/2 stroke-[2.5]" />
                      )}
                    </div>
                    {errors.street && (
                      <p className="text-[11px] text-red-600 font-medium flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>{errors.street}</span>
                      </p>
                    )}
                  </div>

                  {/* Nº e Bairro */}
                  <div className="grid grid-cols-12 gap-3">
                    <div className="col-span-4 sm:col-span-3 space-y-1">
                      <label className="block text-xs font-bold text-neutral-800">
                        Nº
                      </label>
                      <input
                        type="text"
                        placeholder="Número"
                        value={formData.number}
                        onChange={(e) => {
                          setFormData(prev => ({ ...prev, number: e.target.value }));
                          if (errors.number) setErrors(prev => ({ ...prev, number: '' }));
                        }}
                        className={`w-full px-3.5 py-3 rounded-lg border text-base sm:text-sm text-neutral-900 bg-white placeholder-neutral-400 focus:outline-none focus:ring-2 transition-colors ${
                          errors.number 
                            ? 'border-red-500 bg-red-50/20 focus:ring-red-200' 
                            : 'border-neutral-300 focus:border-neutral-900 focus:ring-neutral-200'
                        }`}
                        id="input-number"
                      />
                      {errors.number && (
                        <p className="text-[11px] text-red-600 font-medium flex items-center gap-1 mt-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>{errors.number}</span>
                        </p>
                      )}
                    </div>

                    <div className="col-span-8 sm:col-span-9 space-y-1">
                      <label className="block text-xs font-bold text-neutral-800">
                        Bairro
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Bairro"
                          value={formData.neighborhood}
                          onChange={(e) => {
                            setFormData(prev => ({ ...prev, neighborhood: e.target.value }));
                            if (errors.neighborhood) setErrors(prev => ({ ...prev, neighborhood: '' }));
                          }}
                          className={`w-full px-3.5 py-3 rounded-lg border text-base sm:text-sm text-neutral-900 bg-[#f0f4fa] focus:outline-none focus:ring-2 transition-colors ${
                            errors.neighborhood ? 'border-red-500 bg-red-50/20' : 'border-neutral-300'
                          }`}
                          id="input-neighborhood"
                        />
                        {formData.neighborhood.trim().length > 0 && (
                          <Check className="w-4 h-4 text-emerald-600 absolute right-3 top-1/2 -translate-y-1/2 stroke-[2.5]" />
                        )}
                      </div>
                      {errors.neighborhood && (
                        <p className="text-[11px] text-red-600 font-medium flex items-center gap-1 mt-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>{errors.neighborhood}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Complemento (Opcional) */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-neutral-800">
                      Complemento <span className="text-neutral-400 font-normal">(Opcional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder=""
                      value={formData.complement}
                      onChange={(e) => setFormData(prev => ({ ...prev, complement: e.target.value }))}
                      className="w-full px-3.5 py-3 rounded-lg border border-neutral-300 text-base sm:text-sm text-neutral-900 bg-white placeholder-neutral-400 focus:outline-none focus:border-neutral-900 focus:ring-2 focus:ring-neutral-200 transition-colors"
                      id="input-complement"
                    />
                  </div>

                  {/* Escolha o frete: */}
                  <div className="pt-2 space-y-2">
                    <label className="block text-xs font-bold text-neutral-800">
                      Escolha o frete:
                    </label>

                    <div className="space-y-2.5">
                      {/* Envio Econômico */}
                      <div
                        onClick={() => setFormData(prev => ({ ...prev, shippingMethodId: 'standard' }))}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                          formData.shippingMethodId === 'standard'
                            ? 'border-neutral-900 bg-white shadow-2xs ring-1 ring-neutral-900/10'
                            : 'border-neutral-200 hover:border-neutral-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-5 h-5 rounded-full border border-neutral-400 flex items-center justify-center">
                            {formData.shippingMethodId === 'standard' && (
                              <div className="w-2.5 h-2.5 rounded-full bg-neutral-900" />
                            )}
                          </div>
                          <div>
                            <span className="font-bold text-xs sm:text-sm text-neutral-900">
                              Envio Econômico
                            </span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[11px] text-neutral-500">7 a 10 dias úteis</span>
                              {/* Correios Logo icon */}
                              <svg className="w-4 h-3 shrink-0" viewBox="0 0 24 16" fill="none">
                                <path d="M0 8L5 2H11L6 8L11 14H5L0 8Z" fill="#00417b" />
                                <path d="M8 8L13 2H19L14 8L19 14H13L8 8Z" fill="#ffcc00" />
                              </svg>
                            </div>
                          </div>
                        </div>

                        <span className="font-extrabold text-sm text-neutral-900">
                          R$ 8,56
                        </span>
                      </div>

                      {/* Envio Sedex Full */}
                      <div
                        onClick={() => setFormData(prev => ({ ...prev, shippingMethodId: 'sedex' }))}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                          formData.shippingMethodId === 'sedex'
                            ? 'border-neutral-900 bg-white shadow-2xs ring-1 ring-neutral-900/10'
                            : 'border-neutral-200 hover:border-neutral-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-5 h-5 rounded-full border border-neutral-400 flex items-center justify-center">
                            {formData.shippingMethodId === 'sedex' && (
                              <div className="w-2.5 h-2.5 rounded-full bg-neutral-900" />
                            )}
                          </div>
                          <div>
                            <span className="font-bold text-xs sm:text-sm text-neutral-900">
                              Envio Sedex Full
                            </span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[11px] text-neutral-500">2 a 4 dias úteis</span>
                              <span className="text-[9px] font-black italic bg-[#00417b] text-[#ffcc00] px-1.5 py-0.5 rounded tracking-tighter">
                                SEDEX FULL
                              </span>
                            </div>
                          </div>
                        </div>

                        <span className="font-extrabold text-sm text-neutral-900">
                          R$ 12,41
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Botão: IR PARA PAGAMENTO (avança para o pagamento integrado no mesmo site) */}
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="w-full py-4 bg-[#1c2434] hover:bg-[#151c28] text-white font-extrabold text-sm sm:text-base rounded-xl transition-all shadow-md active:scale-[0.99] cursor-pointer tracking-wider uppercase mt-4 flex items-center justify-center gap-2"
                    id="btn-ir-para-pagamento"
                  >
                    <span>IR PARA PAGAMENTO</span>
                  </button>

                </div>
              )}
            </div>

            {/* Reviews Carousel */}
            <CheckoutReviewsCarousel reviews={reviews} />

          </div>
        )}

        {/* ================= STEP 3: PAGAMENTO INTEGRADO NA PÁGINA (SEM SAIR DO SITE) ================= */}
        {step === 3 && (
          <div className="space-y-3" id="step3-payment-container">
            
            {/* Header de navegação compacto direto */}
            <div className="flex items-center justify-between gap-2 pb-1 border-b border-neutral-200">
              <button
                type="button"
                onClick={() => {
                  setStep(2);
                  scrollToTop();
                }}
                className="text-xs font-bold text-neutral-700 hover:text-neutral-900 flex items-center gap-1.5 cursor-pointer bg-neutral-100 hover:bg-neutral-200 px-3 py-1.5 rounded-lg transition-colors"
                id="btn-voltar-entrega-step3"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Voltar para Entrega</span>
              </button>
              <div className="flex items-center gap-2 text-right">
                <span className="text-[11px] font-semibold text-neutral-500">Total com frete:</span>
                <span className="text-base font-black text-[#0c8f00]">
                  R$ {totalPrice.toFixed(2).replace('.', ',')}
                </span>
              </div>
            </div>

            {/* CARD COMPACTO COM OS DADOS DA PESSOA (NOME, CPF) E ENDEREÇO DE ENTREGA */}
            <div 
              className="bg-emerald-50/90 border border-emerald-300/90 rounded-xl px-3 py-2.5 shadow-2xs"
              id="step3-customer-summary"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-full border border-emerald-300/80">
                      <CheckCircle2 className="w-3 h-3 text-emerald-700 stroke-[3]" />
                      Dados Vinculados
                    </span>
                    <span className="text-xs font-black text-neutral-900 truncate">
                      {formData.fullName || 'Destinatário'}
                    </span>
                    <span className="text-[11px] font-bold text-neutral-800 bg-white px-2 py-0.5 rounded border border-neutral-200 font-mono shadow-2xs">
                      CPF: {formData.cpf || 'Não informado'}
                    </span>
                  </div>

                  <div className="text-[11px] text-neutral-700 mt-1 leading-snug break-words">
                    <span className="font-semibold text-neutral-900">Entrega:</span> {formData.street ? `${formData.street}, nº ${formData.number}` : 'Endereço informado'}
                    {formData.complement ? ` (${formData.complement})` : ''} • {formData.neighborhood ? `${formData.neighborhood}, ` : ''}{formData.city}/{formData.state} • CEP {formData.cep}
                  </div>

                  <div className="text-[10px] text-emerald-900 font-bold mt-1 flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    <span>Frete: {selectedShipping.name} ({selectedShipping.estimatedDays}) — R$ {selectedShipping.price.toFixed(2).replace('.', ',')}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    scrollToTop();
                  }}
                  className="shrink-0 text-[10px] font-bold text-neutral-700 hover:text-neutral-900 bg-white hover:bg-neutral-100 px-2.5 py-1.5 rounded-lg border border-neutral-300 shadow-2xs flex items-center gap-1 cursor-pointer transition-colors"
                  id="btn-alterar-dados-step3"
                  title="Alterar dados ou endereço"
                >
                  <Edit3 className="w-2.5 h-2.5" />
                  <span>Alterar</span>
                </button>
              </div>
            </div>

            {/* Header do Pagamento */}
            <div className="flex items-center justify-between pt-0.5 px-0.5">
              <div className="flex items-center gap-1.5 text-neutral-800">
                <Lock className="w-3.5 h-3.5 text-emerald-700" />
                <span className="text-xs font-black uppercase tracking-wider text-neutral-900">
                  Pague com PIX • QR Code Imediato
                </span>
              </div>
              <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                Aprovação Instantânea
              </span>
            </div>

            {/* Container do Checkout Integrado - Altura ajustada sem a seção 'Como pagar' e com rolagem livre sobre o QR Code */}
            <div 
              className="relative w-full h-[525px] sm:h-[545px] rounded-2xl overflow-hidden border border-neutral-200 bg-white shadow-xs touch-pan-y"
              style={{
                overflow: 'hidden',
                touchAction: 'pan-y',
                overscrollBehavior: 'auto'
              }}
            >
              {isIframeLoading && (
                <div className="absolute inset-0 bg-white/95 flex flex-col items-center justify-center p-6 text-center z-20 space-y-3 pointer-events-none">
                  <Loader2 className="w-8 h-8 text-[#0c8f00] animate-spin" />
                  <div>
                    <p className="font-bold text-sm text-neutral-900">Carregando QR Code de pagamento...</p>
                    <p className="text-xs text-neutral-500 mt-1">Gerando seu PIX com aprovação instantânea</p>
                  </div>
                </div>
              )}

              {/* Camada transparente sobre a área do QR Code para permitir arrastar/rolar a página normalmente no celular sem travar no iframe */}
              <div
                aria-hidden="true"
                className="absolute inset-x-0 top-0 bottom-[155px] z-10 bg-transparent touch-pan-y"
                style={{ touchAction: 'pan-y' }}
              />

              <iframe
                src={getPaymentUrl()}
                title="Checkout de Pagamento Integrado"
                scrolling="no"
                style={{
                  width: '100%',
                  height: '100%',
                  overflow: 'hidden',
                  border: '0',
                  pointerEvents: 'auto',
                  touchAction: 'pan-y',
                  overscrollBehavior: 'auto'
                }}
                className="w-full h-full border-0 select-none"
                onLoad={() => setIsIframeLoading(false)}
                allow="payment; clipboard-read; clipboard-write; fullscreen"
                loading="eager"
              />
            </div>

            <div className="text-center pt-0.5">
              <a
                href={getPaymentUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-neutral-500 hover:text-neutral-900 underline underline-offset-2 transition-colors"
              >
                <Lock className="w-3 h-3" />
                <span>Abrir tela de pagamento PIX em nova guia</span>
              </a>
            </div>

            {/* Carrossel de avaliações */}
            <CheckoutReviewsCarousel reviews={reviews} />

          </div>
        )}

        {/* ================= STEP 4: PIX GERADO & CONFIRMAÇÃO ================= */}
        {step === 4 && (
          <div className="space-y-5">
            
            {/* Success Heading */}
            <div className="text-center py-2">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-2 shadow-2xs">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-black text-neutral-900">
                Pedido Gerado com Sucesso!
              </h2>
              <p className="text-xs text-neutral-600 mt-1">
                Pague agora para garantir o desconto de 65% e envio imediato.
              </p>
            </div>

            {/* Status do Pedido & Timer */}
            <div className="p-3 bg-neutral-900 text-white rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="font-bold">Aguardando Pagamento do PIX</span>
              </div>
              <div className="flex items-center gap-1 text-amber-400 font-mono font-bold">
                <Clock className="w-3.5 h-3.5" />
                <span>{formatTimer(pixTimer)}</span>
              </div>
            </div>

            {/* QR Code Container */}
            <div className="flex flex-col items-center justify-center p-4 bg-white border border-neutral-200 rounded-2xl shadow-xs">
              <PixQrCode value={pixPayload} size={210} />
              <p className="text-xs text-neutral-500 mt-2 text-center">
                Aponte a câmera do seu celular no app do banco para pagar via QR Code
              </p>
            </div>

            {/* Pix Copia e Cola Container */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-neutral-800 flex items-center justify-between">
                <span>Código Pix Copia e Cola:</span>
                <span className="text-[11px] text-neutral-500">Clique para copiar</span>
              </label>
              
              <div className="relative">
                <input
                  type="text"
                  readOnly
                  value={pixPayload}
                  className="w-full px-3.5 py-3 pr-28 rounded-xl border border-neutral-300 text-xs font-mono bg-neutral-50 text-neutral-700 select-all focus:outline-none"
                  id="pix-copia-cola-input"
                />
                <button
                  type="button"
                  onClick={handleCopyPix}
                  className={`absolute right-1.5 top-1.5 bottom-1.5 px-3.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    pixCopied 
                      ? 'bg-emerald-600 text-white' 
                      : 'bg-[#1c2434] hover:bg-[#151c28] text-white'
                  }`}
                  id="btn-copiar-pix"
                >
                  {pixCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar</span>
                    </>
                  )}
                </button>
              </div>

              {pixCopied && (
                <p className="text-xs text-emerald-700 font-bold text-center animate-fade-in flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Código PIX copiado com sucesso! Abra o app do seu banco e cole na opção Pix Copia e Cola.</span>
                </p>
              )}
            </div>

            {/* Instruções de Pagamento com Logos dos Bancos */}
            <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 text-xs space-y-3">
              <h4 className="font-extrabold text-neutral-900 uppercase tracking-wider text-[11px]">
                Como pagar pelo aplicativo do seu banco:
              </h4>
              <ol className="space-y-2 text-neutral-700 list-decimal list-inside text-xs leading-relaxed">
                <li>Abra o aplicativo do seu banco preferido (Nubank, Itaú, Bradesco, Inter, Santander, BB, Caixa, etc.).</li>
                <li>Escolha a opção <strong>Área PIX</strong> e depois <strong>Pix Copia e Cola</strong>.</li>
                <li>Cole o código copiado acima e confirme o pagamento de <strong>R$ {totalPrice.toFixed(2).replace('.', ',')}</strong>.</li>
                <li>Pronto! O sistema identifica o pagamento automaticamente em poucos segundos.</li>
              </ol>

              {/* Bank Badges Row */}
              <div className="pt-2 border-t border-neutral-200">
                <BankLogosRow compact />
              </div>
            </div>

            {/* Simulação de Pagamento Realizado para Testes do Usuário */}
            <div className="pt-2 space-y-2">
              {!isPaymentConfirmed ? (
                <button
                  type="button"
                  onClick={() => setIsPaymentConfirmed(true)}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition-colors shadow cursor-pointer flex items-center justify-center gap-2"
                  id="btn-confirmar-pagamento-pix"
                >
                  <PackageCheck className="w-4 h-4" />
                  <span>JÁ FIZ O PAGAMENTO VIA PIX</span>
                </button>
              ) : (
                <div className="p-4 bg-emerald-50 border-2 border-emerald-500 rounded-xl space-y-3">
                  <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>Pagamento Confirmado com Sucesso! 🎉</span>
                  </div>
                  <p className="text-xs text-emerald-800">
                    Obrigado pela compra na <strong>PRIME STORE</strong>! Sua <strong>Escova Elétrica de Limpeza 9 em 1</strong> foi direcionada para a central de expedição.
                  </p>
                  <div className="p-2.5 bg-white rounded-lg border border-emerald-200 text-xs text-neutral-800 space-y-1">
                    <p><strong>Destinatário:</strong> {formData.fullName}</p>
                    <p><strong>Endereço:</strong> {formData.street}, {formData.number} - {formData.city}/{formData.state}</p>
                    <p><strong>Previsão de Entrega:</strong> {selectedShipping.estimatedDays}</p>
                    <p className="text-neutral-500 text-[11px]">Código de rastreio provisório: <strong>BR{Math.floor(100000000 + Math.random() * 900000000)}BR</strong></p>
                  </div>
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full py-2.5 bg-neutral-900 hover:bg-black text-white text-xs font-bold rounded-lg uppercase tracking-wider cursor-pointer"
                  >
                    Voltar para a Loja
                  </button>
                </div>
              )}
            </div>

          </div>
        )}

        {/* 5. Footer: Formas de Pagamento & Informações da Loja (igual IMG_9656.PNG) */}
        <footer className="mt-12 pt-6 border-t border-neutral-200 text-center space-y-4">
          <div>
            <h5 className="text-xs font-bold text-neutral-600 mb-3">
              Formas de pagamento:
            </h5>
            
            {/* Badges exatos das bandeiras conforme IMG_9656.PNG e captura */}
            <div className="max-w-sm mx-auto">
              <PaymentBrandBadges />
            </div>
          </div>

          <div className="space-y-1">
            <button 
              type="button" 
              onClick={() => alert('Prime Store - Utilidades Domésticas & Casa Inteligente. CNPJ: 48.912.834/0001-92')}
              className="text-xs text-neutral-600 underline hover:text-neutral-900 cursor-pointer"
            >
              Informações da loja
            </button>
            <p className="text-[11px] text-neutral-400">
              Prime Store | Todos os direitos reservados
            </p>
          </div>
        </footer>

      </main>

    </div>
  );
};
