import React, { useEffect, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import containerImg from "../../components/images/Container.jpg"
import InvestmentSteps from "../InvestmentSteps";
import TestimonialSection from "../TestimonialSection";
import WorldTradeSection from "../WorldTradeSection";
import EarningsSection from "../EarningsSection";



export default function Home() {

  return (
    <>
      <PageMeta
        title="ContainerShipment "
        description="Affiliate and Mining Dashboard"
      />

      {/* Main Layout Container */}
      <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen">

        {/* Header Section */}
        <img
          src={containerImg}
          className="w-screen h-[90vh] object-cover shadow-none"
        />
        <EarningsSection/>
        <WorldTradeSection/>
        <InvestmentSteps />
        <TestimonialSection/>
      </div>
    </>
  );
}