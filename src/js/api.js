import axios from 'axios';

const BASE_URL = 'https://paw-hut.b.goit.study/api';

export async function fetchFeedbacks() {
  const response = await axios.get(`${BASE_URL}/feedbacks`);
  return response.data; // Axios автоматично парсить JSON і повертає об'єкт у .data
}

// ЗАПИТ: відправка форми адопції тваринки
export async function createOrder(payload) {
  const response = await axios.post(`${BASE_URL}/orders`, payload);
  return response.data;
}

// Запит категорій
export async function fetchCategories() {
  const response = await fetch(`${BASE_URL}/categories`);
  if (!response.ok) {
    throw new Error(`Categories request failed: ${response.status}`);
  }
  return response.json();
}

// Запит тварин з параметрами пагінації та фільтрації
export async function fetchAnimals(page, limit, categoryId = '') {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  if (categoryId) {
    params.set('categoryId', categoryId);
  }

  const response = await fetch(`${BASE_URL}/animals?${params}`);
  if (!response.ok) {
    throw new Error(`Animals request failed: ${response.status}`);
  }
  return response.json();
}
