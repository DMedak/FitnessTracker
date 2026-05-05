const API_URL = 'http://YOUR_IP:3000/api';

type LoginData = {
  korisnickoIme: string;
  lozinka: string;
};

export async function loginUser(data: LoginData) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Greška kod prijave');
  }

  return result;
}