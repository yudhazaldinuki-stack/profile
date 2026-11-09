# profile

Portofolio interaktif **Yudhazaldi Nuki Putrasadi** — Full-Stack Web Developer & Senior System Programmer.

🔗 **Live:** https://yudhazaldinuki-stack.github.io/profile/

## Fitur
- Hero 3D interaktif (Three.js): inti yang berubah bentuk, cincin orbit, star field. Klik intinya 5x untuk kejutan.
- Kursor kustom, tombol magnetik, kartu 3D tilt dengan efek glow & holografik.
- Skill sphere 3D yang bisa di-drag.
- Timeline pengalaman dengan progress saat scroll.
- Kartu sertifikasi yang berputar (flip).
- Terminal interaktif — coba `help`, `sudo hire-me`, `matrix`.
- Easter egg Konami code (↑ ↑ ↓ ↓ ← → ← → B A).
- Responsif untuk HP dan menghormati `prefers-reduced-motion`.

## Struktur
```
index.html
assets/css/style.css
assets/js/hero3d.js   # scene Three.js
assets/js/main.js     # semua interaksi
assets/img/profile.jpg
```

Situs statis murni, tanpa build step. Jalankan lokal: `python3 -m http.server` lalu buka http://localhost:8000.
