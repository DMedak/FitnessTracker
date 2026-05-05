import { API_URL } from '../config/api';

export const createWeight = async (data: {
  korisnickoIme: string;
  datumUnosa: string;
  tezina: number;
  napomena?: string;
}) => {
  const response = await fetch(`${API_URL}/tezina`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  return response.json();
};

export const getWeights = async (korisnickoIme: string) => {
  const response = await fetch(`${API_URL}/tezina/${korisnickoIme}`);
  return response.json();
};