const API_KEY = process.env.TWELVEDATA_API_KEY;
const BASE_URL = 'https://api.twelvedata.com/price';

export async function getLivePrice(symbol) {
  try {
    const url = `${BASE_URL}?symbol=${symbol}&apikey=${API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.price) {
      return parseFloat(data.price);
    }
    throw new Error(data.message || 'Price not found');
  } catch (error) {
    throw new Error('Error fetching live price: ' + error.message);
  }
} 