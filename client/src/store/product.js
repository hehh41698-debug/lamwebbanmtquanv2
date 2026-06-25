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
    },
    filters: {
      search: '',
      category: '',
      brand: '',
      minPrice: '',
      maxPrice: '',
      sort: 'newest'
    }
  }),

  getters: {
    // Sản phẩm nổi bật
    featuredProducts: (state) => state.products.filter(p => p.isFeatured),
    
    // Sản phẩm theo danh mục
    productsByCategory: (state) => (categoryId) => {
      return state.products.filter(p => p.category === categoryId);
    },
    
    // Sản phẩm theo thương hiệu
    productsByBrand: (state) => (brand) => {
      return state.products.filter(p => p.brand === brand);
    },
    
    // Sản phẩm trong khoảng giá
    productsInPriceRange: (state) => (min, max) => {
      return state.products.filter(p => p.price >= min && p.price <= max);
    },
    
    // Tổng số sản phẩm
    totalProducts: (state) => state.pagination.total,
    
    // Số trang
    totalPages: (state) => state.pagination.totalPages,
    
    // Có sản phẩm không
    hasProducts: (state) => state.products.length > 0,
    
    // Lấy sản phẩm theo ID
    getProductById: (state) => (id) => {
      return state.products.find(p => p._id === id);
    },
    
    // Các thương hiệu có sẵn
    availableBrands: (state) => {
      const brands = new Set();
      state.products.forEach(p => {
        if (p.brand) brands.add(p.brand);
      });
      return Array.from(brands).sort();
    },
    
    // Khoảng giá sản phẩm
    priceRange: (state) => {
      if (state.products.length === 0) return { min: 0, max: 0 };
      const prices = state.products.map(p => p.price);
      return {
        min: Math.min(...prices),
        max: Math.max(...prices)
      };
    }
  },

  actions: {
    // Lấy danh sách sản phẩm với phân trang và lọc
    async fetchProducts(params = {}) {
      this.loading = true;
      this.error = null;
      
      try {
        // Merge params với filters hiện tại
        const queryParams = new URLSearchParams();
        const allParams = { ...this.filters, ...params };
        
        // Xóa các tham số rỗng
        Object.keys(allParams).forEach(key => {
          if (allParams[key] !== undefined && allParams[key] !== null && allParams[key] !== '') {
            queryParams.append(key, allParams[key]);
          }
        });
        
        // Thêm page và limit
        queryParams.append('page', this.pagination.page);
        queryParams.append('limit', this.pagination.limit);
        
        const url = `/products?${queryParams.toString()}`;
        console.log('🔄 Fetching products:', url);
        
        const response = await api.get(url);
        console.log('📦 Products response:', response.data);
        
        // Cập nhật state
        this.products = response.data.products || [];
        this.pagination = {
          page: response.data.page || 1,
          limit: response.data.limit || 12,
          total: response.data.total || 0,
          totalPages: response.data.totalPages || 1
        };
        
        // Cập nhật filters từ params
        if (params.search !== undefined) this.filters.search = params.search;
        if (params.category !== undefined) this.filters.category = params.category;
        if (params.brand !== undefined) this.filters.brand = params.brand;
        if (params.minPrice !== undefined) this.filters.minPrice = params.minPrice;
        if (params.maxPrice !== undefined) this.filters.maxPrice = params.maxPrice;
        if (params.sort !== undefined) this.filters.sort = params.sort;
        
        console.log(`✅ Loaded ${this.products.length} products`);
        return { success: true, data: response.data };
      } catch (error) {
        console.error('❌ Fetch products error:', error);
        this.error = error.response?.data?.message || 'Failed to fetch products';
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },

    // Lấy chi tiết sản phẩm
    async fetchProductById(id) {
      this.loading = true;
      this.error = null;
      
      try {
        console.log('🔄 Fetching product:', id);
        const response = await api.get(`/products/${id}`);
        console.log('📦 Product response:', response.data);
        
        this.product = response.data.product;
        return { success: true, data: response.data };
      } catch (error) {
        console.error('❌ Fetch product error:', error);
        this.error = error.response?.data?.message || 'Failed to fetch product';
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },

    // Tạo sản phẩm mới (Admin)
    async createProduct(data) {
      this.loading = true;
      this.error = null;
      
      try {
        console.log('🔄 Creating product:', data);
        const response = await api.post('/products', data);
        console.log('✅ Product created:', response.data);
        
        this.products.unshift(response.data.product);
        // Cập nhật tổng số
        this.pagination.total += 1;
        
        return { success: true, data: response.data };
      } catch (error) {
        console.error('❌ Create product error:', error);
        this.error = error.response?.data?.message || 'Failed to create product';
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },

    // Cập nhật sản phẩm (Admin)
    async updateProduct(id, data) {
      this.loading = true;
      this.error = null;
      
      try {
        console.log('🔄 Updating product:', id, data);
        const response = await api.put(`/products/${id}`, data);
        console.log('✅ Product updated:', response.data);
        
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
        this.error = error.response?.data?.message || 'Failed to update product';
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },

    // Xóa sản phẩm (Admin)
    async deleteProduct(id) {
      this.loading = true;
      this.error = null;
      
      try {
        console.log('🔄 Deleting product:', id);
        await api.delete(`/products/${id}`);
        console.log('✅ Product deleted:', id);
        
        // Xóa khỏi danh sách
        this.products = this.products.filter(p => p._id !== id);
        // Cập nhật tổng số
        this.pagination.total = Math.max(0, this.pagination.total - 1);
        
        // Xóa product hiện tại nếu đang xem
        if (this.product?._id === id) {
          this.product = null;
        }
        
        return { success: true };
      } catch (error) {
        console.error('❌ Delete product error:', error);
        this.error = error.response?.data?.message || 'Failed to delete product';
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },

    // Tìm kiếm sản phẩm
    async searchProducts(keyword) {
      this.filters.search = keyword;
      this.pagination.page = 1;
      return await this.fetchProducts({ search: keyword });
    },

    // Lọc theo danh mục
    async filterByCategory(category) {
      this.filters.category = category;
      this.pagination.page = 1;
      return await this.fetchProducts({ category });
    },

    // Lọc theo thương hiệu
    async filterByBrand(brand) {
      this.filters.brand = brand;
      this.pagination.page = 1;
      return await this.fetchProducts({ brand });
    },

    // Lọc theo giá
    async filterByPrice(minPrice, maxPrice) {
      this.filters.minPrice = minPrice;
      this.filters.maxPrice = maxPrice;
      this.pagination.page = 1;
      return await this.fetchProducts({ minPrice, maxPrice });
    },

    // Sắp xếp sản phẩm
    async sortProducts(sort) {
      this.filters.sort = sort;
      this.pagination.page = 1;
      return await this.fetchProducts({ sort });
    },

    // Đặt lại bộ lọc
    async resetFilters() {
      this.filters = {
        search: '',
        category: '',
        brand: '',
        minPrice: '',
        maxPrice: '',
        sort: 'newest'
      };
      this.pagination.page = 1;
      return await this.fetchProducts();
    },

    // Chuyển trang
    async goToPage(page) {
      if (page < 1 || page > this.pagination.totalPages) {
        return { success: false, error: 'Invalid page number' };
      }
      this.pagination.page = page;
      return await this.fetchProducts();
    },

    // Đổi số lượng sản phẩm mỗi trang
    async setLimit(limit) {
      this.pagination.limit = limit;
      this.pagination.page = 1;
      return await this.fetchProducts();
    },

    // Lấy sản phẩm nổi bật
    async fetchFeaturedProducts(limit = 8) {
      return await this.fetchProducts({ isFeatured: true, limit });
    },

    // Lấy sản phẩm bán chạy
    async fetchBestSellers(limit = 8) {
      return await this.fetchProducts({ sort: 'sold', order: 'desc', limit });
    },

    // Lấy sản phẩm mới nhất
    async fetchNewestProducts(limit = 8) {
      return await this.fetchProducts({ sort: 'createdAt', order: 'desc', limit });
    },

    // Lấy sản phẩm liên quan
    async fetchRelatedProducts(productId, limit = 4) {
      try {
        // Tìm sản phẩm hiện tại để lấy category
        const currentProduct = this.products.find(p => p._id === productId);
        if (!currentProduct) {
          return { success: false, error: 'Product not found' };
        }
        
        return await this.fetchProducts({
          category: currentProduct.category?._id || currentProduct.category,
          limit,
          exclude: productId
        });
      } catch (error) {
        console.error('❌ Fetch related products error:', error);
        return { success: false, error: error.message };
      }
    },

    // Reset state
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
      this.filters = {
        search: '',
        category: '',
        brand: '',
        minPrice: '',
        maxPrice: '',
        sort: 'newest'
      };
    },

    // Lấy product info (cho quick view)
    getProductInfo(id) {
      return this.products.find(p => p._id === id) || null;
    },

    // Kiểm tra sản phẩm có trong kho
    isInStock(id) {
      const product = this.getProductInfo(id);
      return product ? product.stock > 0 : false;
    },

    // Lấy giá sau khi giảm
    getFinalPrice(id) {
      const product = this.getProductInfo(id);
      if (!product) return 0;
      return product.discount 
        ? product.price * (1 - product.discount / 100) 
        : product.price;
    }
  }
});