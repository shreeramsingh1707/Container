import React from "react";

interface Step {
  id: string;
  title: string;
  description: string;
}

const steps: Step[] = [
  {
    id: "01",
    title: "Invest",
    description:
      "Choose 20ft or 40ft dry containers or tank containers",
  },
  {
    id: "02",
    title: "Lease",
    description:
      "We lease your containers to world's biggest companies to deliver their products to markets around the world.",
  },
  {
    id: "03",
    title: "Earn",
    description:
      "Receive monthly payments, either a fixed 14% or a floating rate circa 30% to 35%, directly to your bank account.",
  },
  {
    id: "04",
    title: "Buyback",
    description:
      "After 3 years you have the option to sell your containers back to us at the same purchase price you paid.",
  },
];

const InvestmentSteps: React.FC = () => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        {/* Heading */}
        <h2 className="text-center text-3xl md:text-4xl font-bold text-[#0B1B3B] mb-16">
          Start your shipping container <br />
          investment in 4 easy steps
        </h2>

        {/* Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step) => (
            <div
              key={step.id}
              className="bg-white border border-gray-100 rounded-xl p-8 shadow-sm hover:shadow-md transition"
            >
              {/* Number Circle */}
              <div className="w-14 h-14 flex items-center justify-center rounded-full bg-gray-100 text-blue-600 text-xl font-bold mb-6">
                {step.id}
              </div>

              {/* Title */}
              <h3 className="text-xl font-semibold text-[#0B1B3B] mb-3">
                {step.title}
              </h3>

              {/* Description */}
              <p className="text-gray-600 text-sm leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default InvestmentSteps;
