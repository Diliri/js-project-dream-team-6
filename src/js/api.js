import axios from 'axios';

const BASE_URL = 'https://paw-hut.b.goit.study/api';

export async function fetchFeedbacks() {
  const response = await axios.get(`${BASE_URL}/feedbacks`);
  return response.data; // Axios автоматично парсить JSON і повертає об'єкт у .data
}
