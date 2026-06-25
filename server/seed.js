const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

// Import models
const User = require('./src/models/User');
const Category = require('./src/models/Category');
const Product = require('./src/models/Product');

const seedDatabase = async () => {
  try {
    // Kết nối MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/computer-store');
    console.log('✅ Connected to MongoDB');

    // Xóa dữ liệu cũ
    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    console.log('🧹 Cleared existing data');

    // ============================================
    // 1. TẠO ADMIN
    // ============================================
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@computerstore.com',
      password: adminPassword,
      role: 'admin',
      isActive: true,
      avatar: 'https://ui-avatars.com/api/?name=Admin&background=2563eb&color=fff&size=100'
    });
    console.log('✅ Admin created:', admin.email);

    // ============================================
    // 2. TẠO USER THƯỜNG
    // ============================================
    const userPassword = await bcrypt.hash('user123', 10);
    const user = await User.create({
      name: 'Nguyễn Văn A',
      email: 'user@test.com',
      password: userPassword,
      role: 'user',
      isActive: true,
      phone: '0123456789',
      address: {
        street: '123 Đường ABC',
        city: 'TP.HCM',
        country: 'Việt Nam'
      },
      avatar: 'https://ui-avatars.com/api/?name=Nguyen+Van+A&background=10b981&color=fff&size=100'
    });
    console.log('✅ User created:', user.email);

    // ============================================
    // 3. TẠO DANH MỤC
    // ============================================
    const categories = await Category.create([
      {
        name: 'Laptop',
        slug: 'laptop',
        icon: 'bi-laptop',
        description: 'Máy tính xách tay các loại'
      },
      {
        name: 'Desktop',
        slug: 'desktop',
        icon: 'bi-pc-display',
        description: 'Máy tính để bàn'
      },
      {
        name: 'Linh kiện',
        slug: 'components',
        icon: 'bi-motherboard',
        description: 'Linh kiện máy tính'
      },
      {
        name: 'Phụ kiện',
        slug: 'accessories',
        icon: 'bi-headphones',
        description: 'Phụ kiện máy tính'
      }
    ]);
    console.log('✅ Categories created');

    // ============================================
    // 4. TẠO SẢN PHẨM MẪU
    // ============================================
    const products = [
      {
        name: 'MacBook Pro 16" M3 Max',
        slug: 'macbook-pro-16-m3-max',
        description: 'MacBook Pro 16 inch với chip M3 Max, hiệu năng đột phá cho dân chuyên nghiệp. Pin trâu, màn hình đẹp, thiết kế sang trọng.',
        price: 49990000,
        discount: 10,
        category: categories[0]._id,
        brand: 'Apple',
        specs: {
          processor: 'Apple M3 Max (14-core)',
          ram: '32GB Unified Memory',
          storage: '1TB SSD',
          display: '16.2 inch Liquid Retina XDR',
          graphics: 'M3 Max 30-core GPU',
          os: 'macOS Sonoma',
          weight: '2.15 kg',
          battery: '22 giờ',
          ports: '3x Thunderbolt 4, HDMI, SDXC',
          color: 'Space Gray'
        },
        images: [
          'https://picsum.photos/seed/macbook1/400/300',
          'https://picsum.photos/seed/macbook2/400/300',
          'https://picsum.photos/seed/macbook3/400/300'
        ],
        stock: 10,
        isFeatured: true,
        rating: 4.8,
        sold: 25
      },
      {
        name: 'Dell XPS 15 9530',
        slug: 'dell-xps-15-9530',
        description: 'Dell XPS 15 với màn hình 4K OLED, pin trâu và hiệu năng mạnh mẽ. Thiết kế mỏng nhẹ, phù hợp cho dân văn phòng và sáng tạo.',
        price: 35990000,
        discount: 5,
        category: categories[0]._id,
        brand: 'Dell',
        specs: {
          processor: 'Intel Core i7-13700H',
          ram: '32GB DDR5',
          storage: '1TB NVMe SSD',
          display: '15.6 inch 4K OLED Touch',
          graphics: 'NVIDIA RTX 4060 8GB',
          os: 'Windows 11 Pro',
          weight: '1.86 kg',
          battery: '18 giờ',
          ports: '2x Thunderbolt 4, HDMI, USB-C',
          color: 'Silver'
        },
        images: [
          'https://picsum.photos/seed/dell1/400/300',
          'https://picsum.photos/seed/dell2/400/300'
        ],
        stock: 15,
        isFeatured: true,
        rating: 4.7,
        sold: 18
      },
      {
        name: 'Gaming PC RGB Pro',
        slug: 'gaming-pc-rgb-pro',
        description: 'PC Gaming cao cấp với LED RGB, hiệu năng mạnh mẽ chơi mọi game ở cài đặt cao nhất. Tản nhiệt tốt, thiết kế hiện đại.',
        price: 28990000,
        discount: 15,
        category: categories[1]._id,
        brand: 'Custom',
        specs: {
          processor: 'AMD Ryzen 7 7800X3D',
          ram: '32GB DDR5 6000MHz',
          storage: '2TB NVMe SSD Gen4',
          display: 'N/A',
          graphics: 'RTX 4070 Ti 12GB',
          os: 'Windows 11 Home',
          weight: '8.5 kg',
          battery: 'N/A',
          ports: 'USB-C 3.2, USB 3.0 x4',
          color: 'Black with RGB'
        },
        images: [
          'https://picsum.photos/seed/gaming1/400/300',
          'https://picsum.photos/seed/gaming2/400/300',
          'https://picsum.photos/seed/gaming3/400/300'
        ],
        stock: 5,
        isFeatured: true,
        rating: 4.9,
        sold: 12
      },
      {
        name: 'ASUS ROG Zephyrus G14',
        slug: 'asus-rog-zephyrus-g14',
        description: 'ASUS ROG Zephyrus G14 - Gaming laptop mỏng nhẹ với hiệu năng mạnh mẽ. Phù hợp cho game thủ và dân sáng tạo.',
        price: 32990000,
        discount: 8,
        category: categories[0]._id,
        brand: 'ASUS',
        specs: {
          processor: 'AMD Ryzen 9 7940HS',
          ram: '32GB DDR5',
          storage: '1TB NVMe SSD',
          display: '14 inch QHD+ 165Hz',
          graphics: 'NVIDIA RTX 4070 8GB',
          os: 'Windows 11 Home',
          weight: '1.65 kg',
          battery: '10 giờ',
          ports: 'USB-C, HDMI, USB-A',
          color: 'White'
        },
        images: [
          'https://picsum.photos/seed/asus1/400/300',
          'https://picsum.photos/seed/asus2/400/300'
        ],
        stock: 8,
        isFeatured: false,
        rating: 4.6,
        sold: 8
      },
      {
        name: 'LG UltraWide 34" Monitor',
        slug: 'lg-ultrawide-34-monitor',
        description: 'Màn hình LG UltraWide 34 inch với độ phân giải 4K, màu sắc chính xác, phù hợp cho dân thiết kế và làm việc đa nhiệm.',
        price: 15990000,
        discount: 0,
        category: categories[3]._id,
        brand: 'LG',
        specs: {
          display: '34 inch IPS 4K',
          resolution: '3840 x 2160',
          refreshRate: '144Hz',
          responseTime: '1ms',
          ports: 'HDMI, DisplayPort, USB-C',
          color: 'Black',
          weight: '6.5 kg'
        },
        images: [
          'https://picsum.photos/seed/lg1/400/300',
          'https://picsum.photos/seed/lg2/400/300'
        ],
        stock: 20,
        isFeatured: false,
        rating: 4.5,
        sold: 5
      },
      {
        name: 'Corsair Vengeance DDR5 32GB',
        slug: 'corsair-vengeance-ddr5-32gb',
        description: 'RAM Corsair Vengeance DDR5 32GB (2x16GB) tốc độ 5600MHz, tản nhiệt tốt, phù hợp cho gaming và đồ họa.',
        price: 4590000,
        discount: 10,
        category: categories[2]._id,
        brand: 'Corsair',
        specs: {
          type: 'DDR5',
          capacity: '32GB (2x16GB)',
          speed: '5600MHz',
          latency: 'CL36',
          voltage: '1.25V',
          color: 'Black',
          rgb: 'No'
        },
        images: [
          'https://picsum.photos/seed/ram1/400/300',
          'https://picsum.photos/seed/ram2/400/300'
        ],
        stock: 30,
        isFeatured: false,
        rating: 4.7,
        sold: 15
      },
      {
        name: 'Logitech MX Master 3S',
        slug: 'logitech-mx-master-3s',
        description: 'Chuột Logitech MX Master 3S cao cấp với cảm biến 8K DPI, kết nối đa thiết bị, pin lên đến 70 ngày.',
        price: 2890000,
        discount: 5,
        category: categories[3]._id,
        brand: 'Logitech',
        specs: {
          sensor: '8K DPI',
          connection: 'Bluetooth, USB-C',
          battery: '70 ngày',
          weight: '141g',
          color: 'Graphite',
          buttons: '7 buttons'
        },
        images: [
          'https://picsum.photos/seed/logi1/400/300',
          'https://picsum.photos/seed/logi2/400/300'
        ],
        stock: 25,
        isFeatured: false,
        rating: 4.8,
        sold: 20
      },
      {
        name: 'Samsung 990 Pro 1TB SSD',
        slug: 'samsung-990-pro-1tb-ssd',
        description: 'SSD Samsung 990 Pro 1TB NVMe M.2 tốc độ đọc lên đến 7450MB/s, phù hợp cho gaming và đồ họa chuyên nghiệp.',
        price: 4590000,
        discount: 0,
        category: categories[2]._id,
        brand: 'Samsung',
        specs: {
          capacity: '1TB',
          interface: 'NVMe M.2',
          readSpeed: '7450 MB/s',
          writeSpeed: '6900 MB/s',
          formFactor: 'M.2 2280',
          warranty: '5 năm'
        },
        images: [
          'https://picsum.photos/seed/ssd1/400/300',
          'https://picsum.photos/seed/ssd2/400/300'
        ],
        stock: 40,
        isFeatured: false,
        rating: 4.9,
        sold: 30
      }
    ];

    await Product.create(products);
    console.log('✅ Products created');

    console.log('\n🎉 Seed data created successfully!');
    console.log('\n📋 Login Information:');
    console.log('  Admin: admin@computerstore.com / admin123');
    console.log('  User: user@test.com / user123');
    console.log('\n📊 Total:');
    console.log(`  - ${await User.countDocuments()} users`);
    console.log(`  - ${await Category.countDocuments()} categories`);
    console.log(`  - ${await Product.countDocuments()} products`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seedDatabase();