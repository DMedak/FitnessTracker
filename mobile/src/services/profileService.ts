import { API_URL } from '../config/api';

export const createProfile = async (data: {
  korisnickoIme: string;
  dob: number;
  spol: string;
  visina: number;
  trenutnaTezina: number;
  cilj: string;
}) => {
  const response = await fetch(`${API_URL}/profil`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  return response.json();
};

export const getProfile = async (korisnickoIme: string) => {
  const response = await fetch(`${API_URL}/profil/${korisnickoIme}`);
  return response.json();
};