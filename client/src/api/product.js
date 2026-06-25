import api from './auth';

export const productAPI = {
  // Lấy danh sách sản phẩm
  getProducts: (params = {}) => {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });
    return api.get(`/products?${queryParams.toString()}`);
  },

  // Lấy chi tiết sản phẩm
  getProductById: (id) => api.get(`/products/${id}`),

  // Tạo sản phẩm (admin)
  createProduct: (data) => api.post('/products', data),

  // Cập nhật sản phẩm (admin)
  updateProduct: (id, data) => api.put(`/products/${id}`, data),

  // Xóa sản phẩm (admin)
  deleteProduct: (id) => api.delete(`/products/${id}`),

  // Lấy sản phẩm theo danh mục
  getProductsByCategory: (categoryId) => api.get(`/products/category/${categoryId}`),

  // Tìm kiếm sản phẩm
  searchProducts: (keyword) => api.get(`/products/search?keyword=${keyword}`)
};