# QuanLyGiaiVLeague
Đồ án cuối kỳ của Group 11_CNPM

Final Project of Group 11_Introducing to Software Engineering
## Giới thiệu tổng quan

Hệ thống chúng tôi xây dựng là một trang web phân hệ người dùng với mục đích quản lý giải đấu vô địch bóng đá quốc gia.
- Người dùng thuộc phân hệ guest khi truy cập trang web có thể xem các thông tin về cầu thủ, lịch thi đấu, thông số giải đấu…
- Người dùng thuộc phân hệ quản lý đội bóng khi truy cập trang web có thể nộp đơn đăng ký đội bóng.
- Người dùng thuộc phân hệ ban tổ chức khi truy cập trang web có thể duyệt đơn đăng ký đội bóng, lập lịch thi đấu và cập nhật thông số giải đấu.

## Link video demo:
https://drive.google.com/drive/folders/1dyy43yLfeOGtMvFw63_P2J1pp1jpzEJ1?usp=sharing

## Hướng dẫn lần đầu:

- 1_ Lập trình trên Visual Studio Code

- 2_ Clone project về máy

- 3_ Mở terminal tại thư mục QuanLyGiaiVLeague (thư mục chứa project)

- 4_ Install yarn: gõ lệnh "npm install --global yarn" trên terminal

- 5_ Install packages từ yarn: gõ lệnh "yarn" trên terminal (packages cho backend)

- 6_ Chuyển đến thư mục frontend: gõ lệnh "cd frontend" trên terminal

- 7_ Install packages từ yarn: gõ lệnh "yarn" trên terminal (packages cho frontend)

- 8_ Đổi tên file "dotenv" -> ".env" (Chú ý khi commit thay đổi cho file .env thì ta đổi tên lại ".env" -> "dotenv" vì khi push code lên git, git sẽ bỏ qua file .env, do mình cài đặt trong file .gitignore để ignore file .env)

- 9_ Run server and client: gõ lệnh "npm run dev" tại thư mục gốc của project (QuanLyGiaiVLeague)
