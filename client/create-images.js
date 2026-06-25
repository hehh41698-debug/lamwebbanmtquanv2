const fs = require('fs');
const path = require('path');

// Tạo thư mục
const imagesDir = path.join(__dirname, 'public/images');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

// Tạo file SVG đơn giản
const createSVG = (filename, content) => {
  const filePath = path.join(imagesDir, filename);
  fs.writeFileSync(filePath, content);
  console.log(`✅ Created: ${filename}`);
};

// Logo
createSVG('logo.png', `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
  <rect width="40" height="40" rx="8" fill="#2563eb"/>
  <text x="20" y="26" font-size="18" text-anchor="middle" fill="white" font-weight="bold">CS</text>
</svg>`);

// Default Avatar
createSVG('default-avatar.png', `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="48" fill="#e2e8f0"/>
  <circle cx="50" cy="35" r="20" fill="#94a3b8"/>
  <circle cx="50" cy="85" r="25" fill="#94a3b8"/>
</svg>`);

// No Image
createSVG('no-image.png', `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
  <rect width="200" height="200" fill="#f1f5f9"/>
  <text x="100" y="100" text-anchor="middle" font-size="20" fill="#94a3b8">No Image</text>
</svg>`);

console.log('🎉 All images created!');