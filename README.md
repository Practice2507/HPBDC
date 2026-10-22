# 🎂 Trang Web Chúc Mừng Sinh Nhật Xinh Đẹp ✨

Trang web chúc mừng sinh nhật lãng mạn tone hồng pastel ngọt ngào, tối ưu hoàn hảo cho cả **Điện thoại di động (iPhone / Android)** và **Máy tính**.

---

## 🌟 Các tính năng nổi bật

1. **Hiệu ứng mở đầu (Intro Phase)**:
   - Những chùm **bóng bay** pastel bay lơ lửng bồng bềnh khắp màn hình.
   - **Pháo hoa** nổ rực rỡ lấp lánh với nhiều gam màu lung linh.
   - Những chú **mèo cute** đáng yêu thỉnh thoảng nổi lên xung quanh màn hình (chạm vào mèo sẽ bắn tim và rung nhẹ).
   - Dòng chữ và cảm biến vân tay phát sáng: **"Hãy đặt tay bạn vào đây"**.

2. **Cảm biến chạm & giữ 2 giây (Touch & Hold 2s)**:
   - Khi người dùng đặt ngón tay / bàn tay vào khu vực cảm biến và **giữ yên trong 2 giây**, vòng tiến trình tròn sẽ sáng rực dần.
   - Có phản hồi rung (Haptic feedback) chân thực trên điện thoại.
   - Đủ 2 giây sẽ kích hoạt hiệu ứng chớp sáng ma thuật và bùng nổ pháo hoa lớn!

3. **Món quà bất ngờ (Reveal Phase)**:
   - **Bức thư sinh nhật 💌**: Phong bì mở ra lá thư với font chữ viết tay bay bổng, lời chúc ấm áp. Có nút mở to toàn màn hình để người nhận đọc trọn vẹn trên điện thoại.
   - **Bánh gato kem dâu 3D 🎂**: Kèm **nến pháo hoa sinh nhật đang cháy** và bắn ra hàng ngàn tia lửa vàng lấp lánh sống động (Canvas particle engine).
   - Tương tác với bánh: Có nút **"Thổi nến ước nguyện"** và **"Bắn thêm pháo hoa"**.

4. **Âm nhạc chúc mừng sinh nhật 🎵**:
   - Tự động phát nhạc khi mở khóa 2 giây.
   - **Cách thêm bài hát của bạn**:
     - **Cách 1 (Nhanh nhất)**: Đổi tên file nhạc sinh nhật của bạn thành `song.mp3` rồi chép vào cùng thư mục với `index.html`. Trang web sẽ tự động nhận và phát!
     - **Cách 2**: Bấm vào nút **"⚙️ Tuỳ chỉnh"** trên góc phải màn hình, chọn **"Tải lên bài hát của bạn"** (.mp3, .m4a, .wav).
     - **Hệ thống dự phòng thông minh (Fallback)**: Nếu chưa thêm file mp3, trang web sẽ **tự động chơi giai điệu Happy Birthday nhẹ nhàng như hộp nhạc** bằng Web Audio Synthesizer, đảm bảo không bao giờ bị im lặng!

---

## 📱 Cách mở và xem trên điện thoại

### Cách 1: Xem qua mạng WiFi nội bộ (Nhanh nhất)
1. Máy tính và điện thoại cùng kết nối vào **một mạng WiFi**.
2. Trên máy tính, mở Terminal hoặc PowerShell tại thư mục này và gõ:
   ```bash
   python -m http.server 3000
   ```
3. Xem địa chỉ IP của máy tính (Ví dụ: `192.168.1.15` - xem bằng lệnh `ipconfig`).
4. Trên điện thoại, mở trình duyệt (Safari hoặc Chrome) và nhập:
   ```
   http://192.168.1.15:3000
   ```

### Cách 2: Đưa lên mạng miễn phí để gửi cho bạn bè (Khuyên dùng)
Bạn có thể tải thư mục này lên các dịch vụ lưu trữ web miễn phí chỉ trong 1 phút:
- **GitHub Pages**: Đẩy code lên GitHub và bật GitHub Pages.
- **Vercel** / **Netlify**: Kéo thả cả thư mục `HPBDC` vào [app.netlify.com/drop](https://app.netlify.com/drop) hoặc Vercel là có ngay đường link đẹp gửi tặng bạn bè ở bất kỳ đâu!

---

## 📂 Cấu trúc thư mục

- `index.html`: Cấu trúc trang web, thẻ âm thanh, bố cục giao diện.
- `style.css`: Giao diện màu hồng pastel lung linh, hiệu ứng kính mờ (Glassmorphism), hoạt ảnh bánh gato, nến pháo và bóng bay.
- `script.js`: Toàn bộ logic tương tác chạm 2s, pháo hoa canvas, nến pháo sáng, mèo cute, và phát nhạc.
- `song.mp3`: File nhạc sinh nhật của bạn (chỉ cần copy file nhạc vào đây và đặt tên là `song.mp3`).
