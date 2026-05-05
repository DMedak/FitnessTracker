import { API_URL } from '../config/api';

export const createOrUpdateMetric = async (data: {
  korisnickoIme: string;
  bmi: number;
  procjenaTjelesneMase: string;
  procjenaKalorija: number;
}) => {
  const response = await fetch(`${API_URL}/metrika`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  return response.json();
};

export const getMetric = async (korisnickoIme: string) => {
  const response = await fetch(`${API_URL}/metrika/${korisnickoIme}`);
  return response.json();
};