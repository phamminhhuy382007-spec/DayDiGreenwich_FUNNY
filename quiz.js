
window.QUIZ = {
  do: [
    { q: "Cái gì có nhiều răng nhưng không biết nhai?", a: ["Cái lược", "Con cá", "Em bé"], c: 0 },
    { q: "Càng lau thì nó càng ướt là cái gì?", a: ["Cái khăn", "Cái bàn", "Cửa sổ"], c: 0 },
    { q: "Thứ gì có mặt mà không có mắt, có kim mà không biết khâu?", a: ["Cái đồng hồ", "Con nhím", "Cái áo"], c: 0 },
    { q: "Cái gì có chân nhưng không biết đi?", a: ["Cái bàn", "Con chó", "Người máy"], c: 0 },
    { q: "Bạn có thể giữ thứ gì mà không cần dùng tay?", a: ["Lời hứa", "Quả bóng", "Cái cốc"], c: 0 },
    { q: "Cái gì càng chia sẻ thì bạn càng có nhiều?", a: ["Niềm vui", "Cái bánh", "Tiền trong ví"], c: 0 },
    { q: "Cái gì có thể đi khắp thế giới nhưng vẫn nằm yên một chỗ?", a: ["Con tem", "Chiếc xe", "Đôi giày"], c: 0 },
    { q: "Thứ gì luôn ở trước mặt bạn nhưng bạn không thể nhìn thấy?", a: ["Tương lai", "Cái mũ", "Cái mũi"], c: 0 },
    { q: "Cái gì có đầu, có đuôi nhưng không có thân?", a: ["Đồng xu", "Con rắn", "Con cá"], c: 0 },
    { q: "Cái gì có thể đầy phòng nhưng không chiếm chỗ?", a: ["Ánh sáng", "Cái tủ", "Quả bóng"], c: 0 },
    { q: "Cái gì có một mắt nhưng không nhìn thấy?", a: ["Cây kim", "Con cú", "Máy ảnh"], c: 0 },
    { q: "Một năm có bao nhiêu tháng có ít nhất 30 ngày?", a: ["11 tháng", "6 tháng", "12 tháng"], c: 0 },
    { q: "Bạn lấy 3 cái kẹo từ một đĩa có 5 cái. Bạn có mấy cái kẹo?", a: ["3 cái", "2 cái", "5 cái"], c: 0 },
    { q: "Cái gì có thể vỡ dù chẳng ai chạm vào?", a: ["Lời hứa", "Cục đá", "Cái bàn"], c: 0 }
  ],

  logic: [
    { q: "Có 5 con chim đậu trên cành, một con bay đi. Còn mấy con trên cành?", a: ["4 con", "5 con", "0 con nếu những con khác cũng sợ bay mất"], c: 2 },
    { q: "Một bác sĩ đưa bạn 3 viên thuốc, dặn cứ nửa tiếng uống một viên. Bao lâu thì uống hết?", a: ["1 giờ", "1 giờ 30 phút", "30 phút"], c: 0 },
    { q: "Hai người cha và hai người con đi câu, mỗi người câu được một con cá nhưng chỉ có 3 con cá. Vì sao?", a: ["Có 3 người: ông, bố và con", "Một con cá biết trốn", "Có người câu hụt"], c: 0 },
    { q: "Một kg bông và một kg sắt, thứ nào nặng hơn?", a: ["Sắt", "Bông", "Nặng bằng nhau"], c: 2 },
    { q: "Bạn đang chạy đua và vượt người đứng thứ hai. Bạn đứng thứ mấy?", a: ["Thứ nhất", "Thứ hai", "Thứ ba"], c: 1 },
    { q: "Có 10 cây nến đang cháy, gió thổi tắt 2 cây. Sáng hôm sau còn mấy cây nến nguyên vẹn?", a: ["2 cây", "8 cây", "10 cây"], c: 0 },
    { q: "Một căn phòng có 4 góc, mỗi góc có một con mèo. Mỗi con mèo nhìn thấy 3 con mèo. Có bao nhiêu con?", a: ["4 con", "12 con", "7 con"], c: 0 },
    { q: "Dãy số 1, 2, 4, 8, ... số tiếp theo hợp lý nhất là gì?", a: ["10", "16", "12"], c: 1 },
    { q: "Có 6 quả cam chia đều cho 6 người, mỗi người một quả mà vẫn còn một quả trong rổ. Làm thế nào?", a: ["Người cuối nhận cả quả cam lẫn cái rổ", "Chia quả cuối làm sáu", "Giấu một quả"], c: 0 },
    { q: "Một chiếc máy bay rơi đúng ở biên giới hai nước. Người sống sót được chôn ở đâu?", a: ["Ở nước gần nhất", "Không chôn người sống sót", "Ngay tại biên giới"], c: 1 },
    { q: "Trong bóng tối, bạn có 1 chiếc bật lửa và một cây nến, đèn dầu, bếp củi. Bạn bật gì trước?", a: ["Cây nến", "Đèn dầu", "Chiếc bật lửa"], c: 2 },
    { q: "Có 3 quả táo, bạn lấy đi 2 quả. Bạn đang có mấy quả?", a: ["1 quả", "2 quả", "3 quả"], c: 1 },
    { q: "Một người đi dưới mưa không ô, không đội mũ mà tóc không ướt. Vì sao?", a: ["Người đó bị ướt hết", "Người đó không có tóc", "Mưa giả"], c: 1 }
  ],

  py: [
    { q: "Con gì sáng đi bằng 4 chân, trưa đi bằng 2 chân, tối đi bằng 3 chân?", a: ["Con người", "Con mèo", "Con gà"], c: 0 },
    { q: "Cái gì càng đập càng sống?", a: ["Trái tim", "Quả bóng", "Cái trống"], c: 0 },
    { q: "Có một đàn vịt: 2 con đi trước 2 con, 2 con đi sau 2 con và 2 con ở giữa. Ít nhất có mấy con?", a: ["6 con", "4 con", "3 con"], c: 1 },
    { q: "Cái gì không có cánh mà bay, không có mắt mà khóc?", a: ["Đám mây", "Con chim", "Máy bay"], c: 0 },
    { q: "Thứ gì bạn càng cho đi thì bạn càng nhận lại?", a: ["Lòng tốt", "Cái ví", "Bài kiểm tra"], c: 0 },
    { q: "Một con gà trống đẻ quả trứng trên mái nhà. Trứng lăn về bên nào?", a: ["Bên trái", "Bên phải", "Gà trống không đẻ trứng"], c: 2 },
    { q: "Cái gì có nhiều lỗ nhưng vẫn giữ được nước?", a: ["Miếng bọt biển", "Cái rổ", "Cái lưới"], c: 0 },
    { q: "Bạn có 10 ngón tay. Hai bàn tay có bao nhiêu ngón?", a: ["5 ngón", "10 ngón", "20 ngón"], c: 1 },
    { q: "Cái gì đi lên đi xuống nhưng vẫn đứng nguyên một chỗ?", a: ["Cầu thang", "Thang máy", "Quả bóng"], c: 0 },
    { q: "Cái gì có thể chạy mà không có chân?", a: ["Nước", "Cái ghế", "Cục đá"], c: 0 },
    { q: "Tháng nào con người ngủ ít nhất?", a: ["Tháng Hai vì ngắn hơn", "Tháng nào cũng vậy", "Tháng có nhiều ngày lễ"], c: 1 },
    { q: "Một người có 4 con gái, mỗi con gái có một anh trai. Người đó có tất cả mấy người con?", a: ["8", "5", "4"], c: 1 },
    { q: "Cái gì có tai mà không nghe được?", a: ["Cái ấm", "Con thỏ", "Cái loa"], c: 0 },
    { q: "Điều gì luôn tăng mà không bao giờ giảm?", a: ["Tuổi của bạn", "Số tiền trong ví", "Pin điện thoại"], c: 0 },
    { q: "Bạn làm gì đầu tiên khi thức dậy vào buổi sáng?", a: ["Mở mắt", "Đánh răng", "Ăn sáng"], c: 0 },
    { q: "Một chiếc xe điện chạy về phía bắc, gió thổi về phía nam. Khói bay về đâu?", a: ["Phía bắc", "Phía nam", "Xe điện không có khói"], c: 2 },
    { q: "Cái gì có thể nghe được nhưng không thể nhìn thấy?", a: ["Âm thanh", "Cầu vồng", "Bóng đèn"], c: 0 },
    { q: "Cái gì càng thổi càng to?", a: ["Quả bóng bay", "Cái thìa", "Viên bi"], c: 0 }
  ],

  sql: [
    { q: "Có 7 ngày trong một tuần. Vậy 2 tuần có bao nhiêu ngày?", a: ["14 ngày", "12 ngày", "9 ngày"], c: 0 },
    { q: "Cái gì có thể đi xuyên qua kính mà không làm vỡ kính?", a: ["Ánh sáng", "Viên đá", "Quả bóng"], c: 0 },
    { q: "Một chiếc áo ướt phơi ngoài nắng sẽ thế nào?", a: ["Khô dần", "Tự biến mất", "Nặng gấp đôi"], c: 0 },
    { q: "Bạn có một que diêm và bước vào phòng tối có đèn dầu, nến và bếp. Bạn thắp gì trước?", a: ["Đèn dầu", "Que diêm", "Bếp"], c: 1 },
    { q: "Cái gì có thể bay mà không phải chim, có thể khóc mà không có mắt?", a: ["Đám mây", "Con bướm", "Máy bay giấy"], c: 0 },
    { q: "Nếu bạn nói tên nó, nó sẽ biến mất. Đó là gì?", a: ["Sự im lặng", "Cái bóng", "Ánh sáng"], c: 0 },
    { q: "Một chiếc đồng hồ đánh 6 tiếng trong 5 giây. Đánh 12 tiếng mất bao lâu nếu nhịp đều như vậy?", a: ["11 giây", "10 giây", "12 giây"], c: 0 },
    { q: "Cái gì có đầu nhưng không có não?", a: ["Cây đinh", "Con cá", "Con người"], c: 0 },
    { q: "Một người có thể đi 8 ngày không ngủ bằng cách nào?", a: ["Ngủ vào ban đêm", "Uống thật nhiều cà phê", "Không cần ngủ"], c: 0 },
    { q: "Cái gì bạn không thể ăn vào bữa sáng?", a: ["Bữa trưa và bữa tối", "Bánh mì", "Trứng"], c: 0 }
  ]
};
