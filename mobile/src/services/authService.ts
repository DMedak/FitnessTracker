import { API_URL } from '../config/api';

export const registerUser = async (data: {
  korisnickoIme: string;
  ime: string;
  prezime: string;
  mail: string;
  lozinka: string;
}) => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  return response.json();
};

export const loginUser = async (data: {
  korisnickoIme: string;
  lozinka: string;
}) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  return response.json();
};