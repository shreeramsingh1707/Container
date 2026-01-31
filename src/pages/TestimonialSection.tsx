import React, { useState } from "react";

interface Testimonial {
  id: number;
  name: string;
  role: string;
  country: string;
  image: string;
  quote: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Linda W",
    role: "CEO",
    country: "United Kingdom",
    image: "/images/testimonials/linda.jpg",
    quote:
      "I invested through Buy-To-Let for years, made great returns, and then sold my containers back to the company as per my contract and used the funds to buy a house.",
  },
  {
    id: 2,
    name: "James K",
    role: "Investor",
    country: "UAE",
    image: "/images/testimonials/user2.jpg",
    quote: "A very smooth investment experience with consistent monthly returns.",
  },
  {
    id: 3,
    name: "Sarah M",
    role: "Entrepreneur",
    country: "Singapore",
    image: "/images/testimonials/user3.jpg",
    quote: "Transparent process and excellent customer support.",
  },
  {
    id: 4,
    name: "Michael T",
    role: "Consultant",
    country: "Germany",
    image: "/images/testimonials/user4.jpg",
    quote: "Buyback option gave me complete peace of mind.",
  },
];

export default function TestimonialSection() {
  const [active, setActive] = useState(testimonials[0]);

  return (
    <section className="w-screen bg-gray-50 py-24 -mx-[calc((100vw-100%)/2)]">
      <div className="max-w-7xl mx-auto px-6">
        {/* Heading */}
        <h2 className="text-center text-3xl md:text-4xl font-semibold text-[#0b1d3a] mb-20">
          What our clients say about us
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          {/* Left Quote */}
          <div className="relative">
            <span className="absolute -top-12 -left-6 text-[120px] text-blue-100 leading-none select-none">
              “
            </span>

            <p className="text-lg md:text-xl text-[#0b1d3a] leading-relaxed mb-10 relative z-10">
              {active.quote}
            </p>

            <div className="flex items-center gap-3">
              <div className="h-[2px] w-14 bg-blue-600" />
              <div>
                <p className="font-semibold text-[#0b1d3a]">
                  {active.name}
                </p>
                <p className="text-sm text-gray-500">
                  {active.role}, {active.country}
                </p>
              </div>
            </div>
          </div>

          {/* Right Avatars */}
          <div className="flex items-center justify-center lg:justify-start gap-6">
            {testimonials.map((item) => (
              <button
                key={item.id}
                onClick={() => setActive(item)}
                className={`rounded-full p-1 transition-all ${
                  active.id === item.id
                    ? "ring-2 ring-blue-600"
                    : "opacity-40 hover:opacity-80"
                }`}
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
