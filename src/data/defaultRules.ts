import type { RuleConfig } from '../types';

export const defaultRules: RuleConfig[] = [
  {
    id: 'amount-deviation',
    name: 'Desvío de Monto',
    description: 'Si la TRX actual supera el valor máximo histórico por el multiplicador umbral y existe contacto previo',
    enabled: true,
    threshold: 1.5,
    weight: 30,
  },
  {
    id: 'unknown-merchant',
    name: 'Comercio Desconocido',
    description: 'Si no existe contacto previo con el comercio y la TRX supera el umbral configurado',
    enabled: true,
    threshold: 500,
    weight: 25,
  },
  {
    id: 'high-frequency',
    name: 'Alta Frecuencia',
    description: 'Si la cantidad de TRX en las últimas 24h supera el umbral permitido',
    enabled: true,
    threshold: 3,
    weight: 30,
  },
  {
    id: 'risk-channel',
    name: 'Canal de Riesgo',
    description: 'Si la transacción es internacional y el MCC pertenece a una categoría de riesgo crítico',
    enabled: true,
    threshold: 1,
    weight: 35,
  },
];
