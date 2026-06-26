import { defineStore } from 'pinia';
import api from '../api/auth';

export const useProductStore = defineStore('product', {
  state: () => ({
    products: [],
    product: null,
    loading: false,
    error: null,
    pagination: {
      page: 1,
      limit: 12,
      total: 0,
      totalPages: 0
    }
  }),

  getters: {
    featuredProducts: (state) => state.products.filter(p => p.isFeatured),
    productsByCategory: (state) => (categoryId) => {
      return state.products.filter(p => p.category === categoryId);
    },
    getProductById: (state) => (id) => {
      return state.products.find(p => p._id === id);
    },
    inStockProducts: (state) => state.products.filter(p => p.stock > 0),
    outOfStockProducts: (state) => state.products.filter(p => p.stock === 0),
    totalProducts: (state) => state.pagination.total
  },

  actions: {
    // ============================================
    // LẤY DANH SÁCH SẢN PHẨM
    // ============================================
    async fetchProducts(params = {}) {
      this.loading = true;
      this.error = null;

      try {
        console.log('🔄 Fetching products with params:', params);

        const queryParams = new URLSearchParams();
        Object.keys(params).forEach(key => {
          if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
            queryParams.append(key, params[key]);
          }
        });

        const url = `/products?${queryParams.toString()}`;
        console.log('📡 API URL:', url);

        const response = await api.get(url);
        console.log('📦 API Response:', response.data);

        this.products = response.data.products || [];
        this.pagination = {
          page: response.data.page || 1,
          limit: response.data.limit || 12,
          total: response.data.total || 0,
          totalPages: response.data.totalPages || 1
        };

        console.log(`✅ Loaded ${this.products.length} products`);
        return { success: true, data: response.data };
      } catch (error) {
        console.error('❌ Fetch products error:', error);
        this.error = error.response?.data?.message || 'Không thể tải danh sách sản phẩm';
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },

    // ============================================
    // LẤY CHI TIẾT SẢN PHẨM
    // ============================================
    async fetchProductById(id) {
      this.loading = true;
      this.error = null;

      try {
        console.log('🔄 Fetching product:', id);
        const response = await api.get(`/products/${id}`);
        this.product = response.data.product;
        console.log('✅ Product loaded:', this.product.name);
        return { success: true, data: response.data };
      } catch (error) {
        console.error('❌ Fetch product error:', error);
        this.error = error.response?.data?.message || 'Không thể tải thông tin sản phẩm';
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },

    // ============================================
    // TẠO SẢN PHẨM MỚI (ADMIN)
    // ============================================
    async createProduct(data) {
      this.loading = true;
      this.error = null;

      try {
        console.log('🔄 Creating product:', data.name);
        console.log('📦 Product data:', data);

        const response = await api.post('/products', data);
        console.log('✅ Product created:', response.data);

        // Thêm vào đầu danh sách
        this.products.unshift(response.data.product);
        this.pagination.total += 1;

        return { success: true, data: response.data };
      } catch (error) {
        console.error('❌ Create product error:', error);
        this.error = error.response?.data?.message || 'Không thể tạo sản phẩm';
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },

    // ============================================
    // CẬP NHẬT SẢN PHẨM (ADMIN)
    // ============================================
    async updateProduct(id, data) {
      this.loading = true;
      this.error = null;

      try {
        console.log('🔄 Updating product:', id);
        console.log('📦 Update data:', data);

        const response = await api.put(`/products/${id}`, data);
        console.log('✅ Update response:', response.data);

        // Cập nhật trong danh sách
        const index = this.products.findIndex(p => p._id === id);
        if (index !== -1) {
          this.products[index] = response.data.product;
        }

        // Cập nhật product hiện tại nếu đang xem
        if (this.product?._id === id) {
          this.product = response.data.product;
        }

        return { success: true, data: response.data };
      } catch (error) {
        console.error('❌ Update product error:', error);
        this.error = error.response?.data?.message || 'Không thể cập nhật sản phẩm';
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },

    // ============================================
    // XÓA SẢN PHẨM (ADMIN)
    // ============================================
    async deleteProduct(id) {
      this.loading = true;
      this.error = null;

      try {
        console.log('🔄 Deleting product:', id);

        await api.delete(`/products/${id}`);
        console.log('✅ Product deleted:', id);

        // Xóa khỏi danh sách
        this.products = this.products.filter(p => p._id !== id);
        this.pagination.total = Math.max(0, this.pagination.total - 1);

        // Xóa product hiện tại nếu đang xem
        if (this.product?._id === id) {
          this.product = null;
        }

        return { success: true };
      } catch (error) {
        console.error('❌ Delete product error:', error);
        this.error = error.response?.data?.message || 'Không thể xóa sản phẩm';
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },

    // ============================================
    // TÌM KIẾM SẢN PHẨM
    // ============================================
    async searchProducts(keyword) {
      this.loading = true;
      this.error = null;

      try {
        console.log('🔍 Searching products:', keyword);

        const response = await api.get(`/products/search?q=${encodeURIComponent(keyword)}`);
        this.products = response.data.products || [];
        this.pagination.total = response.data.total || 0;

        return { success: true, data: response.data };
      } catch (error) {
        console.error('❌ Search products error:', error);
        this.error = error.response?.data?.message || 'Không thể tìm kiếm sản phẩm';
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },

    // ============================================
    // LỌC SẢN PHẨM THEO DANH MỤC
    // ============================================
    async filterByCategory(categoryId) {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.get(`/products/category/${categoryId}`);
        this.products = response.data.products || [];
        return { success: true, data: response.data };
      } catch (error) {
        console.error('❌ Filter by category error:', error);
        this.error = error.response?.data?.message || 'Không thể lọc sản phẩm';
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },

    // ============================================
    // LẤY SẢN PHẨM NỔI BẬT
    // ============================================
    async fetchFeaturedProducts(limit = 8) {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.get(`/products/featured?limit=${limit}`);
        return { success: true, data: response.data };
      } catch (error) {
        console.error('❌ Fetch featured products error:', error);
        this.error = error.response?.data?.message || 'Không thể tải sản phẩm nổi bật';
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },

    // ============================================
    // LẤY SẢN PHẨM BÁN CHẠY
    // ============================================
    async fetchBestSellers(limit = 8) {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.get(`/products/best-sellers?limit=${limit}`);
        return { success: true, data: response.data };
      } catch (error) {
        console.error('❌ Fetch best sellers error:', error);
        this.error = error.response?.data?.message || 'Không thể tải sản phẩm bán chạy';
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },

    // ============================================
    // CẬP NHẬT TỒN KHO (ADMIN)
    // ============================================
    async updateStock(id, stock) {
      this.loading = true;
      this.error = null;

      try {
        console.log('📦 Updating stock:', id, stock);

        const response = await api.put(`/products/${id}/stock`, { stock });
        console.log('✅ Stock updated:', response.data);

        // Cập nhật trong danh sách
        const index = this.products.findIndex(p => p._id === id);
        if (index !== -1) {
          this.products[index].stock = stock;
        }

        if (this.product?._id === id) {
          this.product.stock = stock;
        }

        return { success: true, data: response.data };
      } catch (error) {
        console.error('❌ Update stock error:', error);
        this.error = error.response?.data?.message || 'Không thể cập nhật tồn kho';
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },

    // ============================================
    // CHUYỂN TRANG
    // ============================================
    async goToPage(page) {
      if (page < 1 || page > this.pagination.totalPages) {
        return { success: false, error: 'Trang không hợp lệ' };
      }
      this.pagination.page = page;
      return await this.fetchProducts();
    },

    // ============================================
    // ĐỔI SỐ LƯỢNG SẢN PHẨM MỖI TRANG
    // ============================================
    async setLimit(limit) {
      this.pagination.limit = limit;
      this.pagination.page = 1;
      return await this.fetchProducts();
    },

    // ============================================
    // RESET STATE
    // ============================================
    reset() {
      this.products = [];
      this.product = null;
      this.loading = false;
      this.error = null;
      this.pagination = {
        page: 1,
        limit: 12,
        total: 0,
        totalPages: 0
      };
    }
  }
});