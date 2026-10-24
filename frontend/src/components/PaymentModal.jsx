import React, { useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const PaymentModal = ({ isOpen, onClose, itemData, isDarkMode, type = 'room' }) => {
  const [paymentMethod, setPaymentMethod] = useState('Card'); // Card, Cash, Click, Payme
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen || !itemData) return null;

  const totalAmount = itemData.price || itemData.BASE_PRICE || itemData.PRICE || 0;

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');

      // 1. Click yoki Payme tanlansa tashqi sahifaga o'tkazish
      if (paymentMethod === 'Click') {
        window.open(`https://my.click.uz/clickm/service/pay?merchant_id=123&amount=${totalAmount}`, '_blank');
      } else if (paymentMethod === 'Payme') {
        window.open(`https://checkout.paycom.uz/123?amount=${totalAmount * 100}`, '_blank');
      }

      let bookingId = 1;

      // 2. Agar xona bo'lsa avval BRON yaratamiz
      if (type === 'room') {
        const bookingRes = await fetch(`${API_URL}/bookings`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            roomId: itemData.id || itemData.ID,
            totalAmount,
            fullName,
            phone
          })
        });
        const bookingData = await bookingRes.json();
        bookingId = bookingData.bookingId || bookingData.id || 1;
      }

      // 3. PAYMENTS jadvaliga yozish
      await fetch(`${API_URL}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          bookingId: bookingId,
          amount: totalAmount,
          paymentMethod: paymentMethod
        })
      });

      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 2000);
    } catch (err) {
      console.error("To'lov xatosi:", err);
      alert("To'lovni amalga oshirishda xatolik!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className={`w-full max-w-md p-6 sm:p-8 rounded-3xl shadow-2xl border transition-all max-h-[90vh] overflow-y-auto ${
        isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
      }`}>
        <div className="flex items-center justify-between border-b pb-4 mb-4 border-slate-700/30">
          <h3 className="text-lg font-bold">To'lov va Tasdiqlash</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xl">✕</button>
        </div>

        {isSuccess ? (
          <div className="text-center py-8 space-y-3">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">✓</div>
            <h4 className="text-lg font-bold">To'lov Muvaffaqiyatli Bajarildi!</h4>
          </div>
        ) : (
          <form onSubmit={handlePaymentSubmit} className="space-y-4">
            <div className={`p-3.5 rounded-2xl border flex items-center gap-3 ${isDarkMode ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
              <img src={itemData.image || itemData.IMAGE_URL} alt="" className="w-14 h-14 rounded-xl object-cover" />
              <div>
                <h4 className="font-bold text-sm">{itemData.title || itemData.SERVICE_NAME || itemData.TYPE_NAME}</h4>
                <p className="text-xs text-teal-500 font-extrabold">{Number(totalAmount).toLocaleString()} UZS</p>
              </div>
            </div>

            {type === 'room' && (
              <>
                <div>
                  <label className="block text-[11px] font-bold uppercase mb-1 text-slate-400">To'liq ismingiz</label>
                  <input required type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Ali Valiyev" className={`w-full p-3 rounded-xl border text-sm ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'}`} />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase mb-1 text-slate-400">Telefon raqam</label>
                  <input required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+998 90 123 45 67" className={`w-full p-3 rounded-xl border text-sm ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'}`} />
                </div>
              </>
            )}

            <div>
              <label className="block text-[11px] font-bold uppercase mb-2 text-slate-400">To'lov Usulini Tanlang</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'Card', label: '💳 Plastik Karta' },
                  { id: 'Click', label: '📲 Click' },
                  { id: 'Payme', label: '📱 Payme' },
                  { id: 'Cash', label: '💵 Naqd Pul' }
                ].map((m) => (
                  <button
                    type="button"
                    key={m.id}
                    onClick={() => setPaymentMethod(m.id)}
                    className={`py-2.5 px-3 text-xs font-bold rounded-xl border transition-all ${
                      paymentMethod === m.id ? 'bg-teal-500/20 border-teal-500 text-teal-400' : (isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700')
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {paymentMethod === 'Card' && (
              <div>
                <label className="block text-[11px] font-bold uppercase mb-1 text-slate-400">Karta raqami</label>
                <input required type="text" maxLength="16" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} placeholder="8600 **** **** ****" className={`w-full p-3 rounded-xl border text-sm ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'}`} />
              </div>
            )}

            <button type="submit" disabled={loading} className="w-full py-3.5 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-2xl text-sm transition shadow-md">
              {loading ? "To'lanmoqda..." : `${Number(totalAmount).toLocaleString()} UZS To'lash`}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default PaymentModal;