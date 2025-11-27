const API_URL = 'https://bukuacak-9bdcb4ef2605.herokuapp.com/api/v1';

// ========== FUNGSI DASAR (Fetch Halaman) ==========

/**
 * Ambil buku dari satu halaman
 * @param {number} pageNumber - Nomor halaman yang ingin diambil
 * @returns {Promise<Array>} Array berisi data buku
 */
export const getBooksPerPage = async (pageNumber) => {
  try {
    const apiResponse = await fetch(`${API_URL}/book?page=${pageNumber}`);
    
    if (!apiResponse.ok) {
      throw new Error(`Gagal mengambil buku dari halaman ${pageNumber}`);
    }
    
    const jsonData = await apiResponse.json();
    
    // Try multiple response structures
    if (jsonData.books && Array.isArray(jsonData.books)) {
      return jsonData.books;
    }
    if (jsonData.data) {
      if (Array.isArray(jsonData.data)) {
        return jsonData.data;
      }
      if (jsonData.data.books && Array.isArray(jsonData.data.books)) {
        return jsonData.data.books;
      }
    }
    if (Array.isArray(jsonData)) {
      return jsonData;
    }
    return [];
  } catch (err) {
    console.error(`Error saat fetch buku halaman ${pageNumber}:`, err);
    throw err;
  }
};

/**
 * Ambil buku dari beberapa halaman sekaligus
 * @param {number} pageCount - Jumlah total halaman yang akan diambil
 * @returns {Promise<Array>} Array berisi semua buku dari semua halaman
 */
export const getAllBooksMultiPage = async (pageCount) => {
  try {
    const requestList = [];
    
    // Loop untuk membuat request ke setiap halaman
    for (let currentPage = 1; currentPage <= pageCount; currentPage++) {
      requestList.push(
        fetch(`${API_URL}/book?page=${currentPage}`)
          .then(resp => resp.json())
      );
    }
    
    // Jalankan semua request bersamaan
    const responseData = await Promise.all(requestList);
    
    // Gabungkan semua array books jadi satu
    const combinedBooks = responseData.flatMap(item => item.books || []);
    
    // Hapus buku duplikat berdasarkan _id
    const filteredBooks = combinedBooks.filter((bookItem, idx, array) => 
      idx === array.findIndex((b) => b._id === bookItem._id)
    );
    
    return filteredBooks;
  } catch (err) {
    console.error('Error saat fetch buku dari multiple pages:', err);
    throw err;
  }
};

/**
 * Ambil semua buku (default 10 halaman)
 * @returns {Promise<Array>} Array berisi semua buku
 */
export const loadAllBooks = async () => {
  return getAllBooksMultiPage(10);
};

/**
 * Cari buku berdasarkan ID dari array
 * @param {Array} bookList - Array buku untuk dicari
 * @param {string} searchId - ID buku yang dicari
 * @returns {Object|null} Object buku atau null jika tidak ditemukan
 */
export const findBookById = (bookList, searchId) => {
  return bookList.find(bookItem => bookItem._id === searchId) || null;
};

// ========== FUNGSI ADVANCED (Search & Filter) ==========

/**
 * Search buku dengan filter
 * @param {Object} filters - Object berisi filter (genre, year, keyword, sort, page)
 * @returns {Promise<Array>} Array buku yang sesuai filter
 */
export const searchBooksWithFilter = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    for (const key in filters) {
      if (filters[key]) {
        queryParams.append(key, filters[key]);
      }
    }
    
    const queryString = queryParams.toString();
    const finalUrl = `${API_URL}/book?${queryString}`;
    
    const apiResponse = await fetch(finalUrl);
    
    if (!apiResponse.ok) {
      throw new Error('Gagal fetch data dengan filter');
    }
    
    const jsonData = await apiResponse.json();
    
    // Handle different response structures
    if (jsonData.books && Array.isArray(jsonData.books)) {
      return jsonData.books;
    }
    if (jsonData.data) {
      if (Array.isArray(jsonData.data)) {
        return jsonData.data;
      }
      if (jsonData.data.books && Array.isArray(jsonData.data.books)) {
        return jsonData.data.books;
      }
    }
    if (Array.isArray(jsonData)) {
      return jsonData;
    }
    
    return [];
    
  } catch (err) {
    console.error('Error search dengan filter:', err);
    throw err;
  }
};

/**
 * Ambil detail buku by ID dari API
 * @param {string} bookId - ID buku yang ingin diambil
 * @returns {Promise<Object>} Object berisi detail buku
 */
export const getBookDetail = async (bookId) => {
  try {
    const finalUrl = `${API_URL}/book/${bookId}`;
    
    const apiResponse = await fetch(finalUrl);
    
    if (!apiResponse.ok) {
      throw new Error(`Buku dengan ID ${bookId} tidak ditemukan`);
    }
    
    const jsonData = await apiResponse.json();
    
    // Extract book data from different response structures
    let bookData = null;
    
    if (jsonData.book) {
      bookData = jsonData.book;
    } else if (jsonData.data) {
      if (jsonData.data.book) {
        bookData = jsonData.data.book;
      } else {
        bookData = jsonData.data;
      }
    } else {
      bookData = jsonData;
    }
    
    // Normalize book data structure - ensure all detail fields are accessible
    if (bookData) {
      // If details are at root level, keep them but also nest in details object
      if (!bookData.details) {
        bookData.details = {};
      }
      
      // Map common fields to details if they exist at root
      if (bookData.isbn && !bookData.details.isbn) {
        bookData.details.isbn = bookData.isbn;
      }
      if (bookData.total_pages && !bookData.details.total_pages) {
        bookData.details.total_pages = bookData.total_pages;
      }
      if (bookData.published_date && !bookData.details.published_date) {
        bookData.details.published_date = bookData.published_date;
      }
      if (bookData.price && !bookData.details.price) {
        bookData.details.price = bookData.price;
      }
    }
    
    return bookData;
    
  } catch (err) {
    console.error('Error get book detail:', err);
    throw err;
  }
};

/**
 * Ambil buku random dengan filter opsional
 * @param {Object} filters - Object berisi filter (genre, year, keyword)
 * @returns {Promise<Object>} Object berisi 1 buku random
 */
export const getRandomBook = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    for (const key in filters) {
      if (filters[key]) {
        queryParams.append(key, filters[key]);
      }
    }
    
    const queryString = queryParams.toString();
    const finalUrl = queryString 
      ? `${API_URL}/random_book?${queryString}` 
      : `${API_URL}/random_book`;
    
    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 seconds timeout
    
    const apiResponse = await fetch(finalUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!apiResponse.ok) {
      throw new Error(`HTTP error! status: ${apiResponse.status}`);
    }
    
    const jsonData = await apiResponse.json();
    return jsonData;
    
  } catch (err) {
    console.error('Error get random book:', err);
    // Return null or empty object instead of throwing to prevent crash
    if (err.name === 'AbortError') {
      console.error('Request timeout');
      return null;
    }
    if (err.name === 'TypeError' && err.message === 'Failed to fetch') {
      console.error('Network error or CORS issue. Check API URL and network connection.');
      return null;
    }
    throw err;
  }
};