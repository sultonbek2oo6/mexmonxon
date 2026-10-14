import React from 'react';

const PagePlaceholder = ({ title, description = 'Bu bo‘lim uchun ma’lumotlar hozircha mavjud emas.' }) => (
  <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
    <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-cyan-600">Grand Hotel</p>
    <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
    <p className="mt-3 text-slate-600">{description}</p>
  </section>
);

export default PagePlaceholder;
