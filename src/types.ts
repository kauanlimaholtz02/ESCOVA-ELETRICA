export interface CustomerReview {
  id: number;
  name: string;
  date: string;
  rating: number;
  verified: boolean;
  avatar?: string;
  text: string;
  photos?: string[];
}

export interface CheckoutFormData {
  // Step 1: Identificação
  fullName: string;
  email: string;
  cpf: string;
  phone: string;

  // Step 2: Entrega
  cep: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;

  // Step 3: Pagamento & Frete
  shippingMethodId: string;
  paymentMethod: 'pix' | 'credit_card';
}

export interface ShippingMethod {
  id: string;
  name: string;
  subtitle: string;
  price: number;
  estimatedDays: string;
  badge?: string;
}
