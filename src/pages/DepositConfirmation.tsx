import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router";
import { QRCodeSVG } from "qrcode.react";
import { PaymentResponse, buyContainer } from "../services/api";
import axios from "axios";

const user = JSON.parse(localStorage.getItem("stylocoin_user") || "{}");
const userNodeId = user?.nodeId;

/* ============================
   TYPES (Corrected)
============================ */
interface LocationStateType {
  paymentResponse: PaymentResponse;
  amount: number;
  currency: string;
  paymentIdValueForPoll: string;
  formData?: {
    containerType: "20FT" | "40FT";
    ownershipType: "SINGLE" | "SHARED";
    shares: number;
    priceUsd: number;
    priceInr: number;
    roi: number;
    currency: string;
  };
}

interface HistoryItem {
  paymentId: string;
  paymentStatus: string;
}

interface ConfirmationData {
  paymentResponse: PaymentResponse;
  amount: number;
  currency: string;
  paymentId: string;
  walletAddress: string;
  creationTime: string;
  expiryTime: string;
  formData?: LocationStateType["formData"];
}

/* ============================
   COMPONENT
============================ */
export default function DepositConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const hasSubmittedRef = useRef(false);

  const state = location.state as LocationStateType | null;

  const [confirmationData, setConfirmationData] =
    useState<ConfirmationData | null>(null);

  const [success, setSuccess] = useState(false);
  const [paymentIdValue, setPaymentIdValue] = useState("");

  /* ============================
     FORMAT DATE
  ============================ */
  const formatDateTime = (date: Date): string => {
    return date.toLocaleString();
  };

  /* ============================
     INIT DATA
  ============================ */
  useEffect(() => {
    if (!state?.paymentResponse) {
      // 🔴 If page refreshed or invalid access
      navigate("/containerShipment/buy");
      return;
    }

    const now = new Date();
    const expiry = new Date(now.getTime() + 3 * 60 * 60 * 1000);

    setPaymentIdValue(state.paymentIdValueForPoll);

    setConfirmationData({
      paymentResponse: state.paymentResponse,
      amount: state.amount,
      currency: state.currency,
      paymentId: state.paymentResponse.payment_id,
      walletAddress: state.paymentResponse.pay_address,
      creationTime: formatDateTime(now),
      expiryTime: formatDateTime(expiry),
      formData: state.formData, // ✅ FIXED
    });
  }, [state, navigate]);

  /* ============================
     POLLING PAYMENT STATUS
  ============================ */
  const pollPaymentStatus = async (paymentId: string) => {
    try {
      const res = await axios.get(
        `http://MineCryptos-env.eba-nsbmtw9i.ap-south-1.elasticbeanstalk.com/api/deposit/history/${userNodeId}`
      );

      const list: HistoryItem[] = res.data.data;
      const record = list.find((x) => x.paymentId === paymentId);

      if (
        record?.paymentStatus === "SUCCESS" &&
        !hasSubmittedRef.current
      ) {
        hasSubmittedRef.current = true;

        setSuccess(true);

        clearInterval(intervalRef.current); // ✅ stop polling

        await submitInvestment();
      }
    } catch (err) {
      console.error(err);
    }
  };

  /* ============================
     START POLLING
  ============================ */
  // useEffect(() => {
  //   if (!paymentIdValue) return;

  //   const interval = setInterval(() => {
  //     pollPaymentStatus(paymentIdValue);
  //   }, 4000);

  //   return () => clearInterval(interval);
  // }, [paymentIdValue]);
  const intervalRef = useRef<any>(null);

  useEffect(() => {
    if (!paymentIdValue) return;

    intervalRef.current = setInterval(() => {
      pollPaymentStatus(paymentIdValue);
    }, 4000);

    return () => clearInterval(intervalRef.current);
  }, [paymentIdValue]);
  /* ============================
     SUBMIT INVESTMENT
  ============================ */
  const submitInvestment = async () => {
    if (!confirmationData?.formData) return;

    const form = confirmationData.formData;

    let investedAmount: number | null = null;

    if (form.currency === "USD") investedAmount = form.priceUsd;
    else if (form.currency === "INR") investedAmount = form.priceInr;
    else if (form.currency === "AED")
      investedAmount = Math.round(form.priceUsd * 3.67);

    const payload = {
      containerType: form.containerType,
      ownershipType: form.ownershipType,
      shares: form.shares,
      roiPercentage: form.roi,
      currency: form.currency,
      investedAmount,
      userFkId: userNodeId,
      status: "ACTIVE",
    };

    await buyContainer.add(payload);
  };

  /* ============================
     QR VALUE
  ============================ */
  const getQRValue = () => {
    const addr = confirmationData?.walletAddress;

    if (!addr) return "";

    if (
      confirmationData?.currency.includes("BSC") ||
      confirmationData?.currency.includes("BEP20")
    ) {
      return `ethereum:${addr}`;
    }

    if (confirmationData?.currency.includes("TRC20")) {
      return `tron:${addr}`;
    }

    if (confirmationData?.currency.includes("BTC")) {
      return `bitcoin:${addr}`;
    }

    return addr;
  };

  /* ============================
     COPY
  ============================ */
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  /* ============================
     LOADING
  ============================ */
  if (!confirmationData) {
    return <div>Loading...</div>;
  }

  /* ============================
     UI
  ============================ */
  return (
    <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10 bg-gray-900 min-h-screen">
      {/* Important Reminder */}
      <div className="mb-6 rounded-lg border border-blue-600/30 bg-gradient-to-r from-blue-900/40 to-blue-800/30 p-6 shadow-lg">
        <div className="flex items-start gap-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/20 ring-2 ring-blue-400/30 flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-blue-200 text-lg mb-2">Important Reminder</h3>
            <p className="text-sm text-blue-100 leading-relaxed">
              Kindly Make sure you send exact amount mention to be paid when you send from your wallet or exchange as they might charge your transaction fee. If you send PARTIAL PAYMENT or EXTRA PAYMENT your ID will not be activated automatically. You will have to contact support team in this case and it can take upto 48 hours for the Solution.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scan QR Code Panel */}
        <div className="rounded-xl border border-gray-700 bg-gray-800 shadow-2xl backdrop-blur-sm p-8">
          <h3 className="font-bold text-white text-xl mb-6">Scan QR Code</h3>
          <div className="flex flex-col items-center">
            <div className="bg-white p-4 rounded-lg mb-4">
              <QRCodeSVG
                // value={confirmationData.walletAddress}
                value={getQRValue()}
                size={256}
                level="H"
                includeMargin={true}
              />
            </div>
            <div className="w-full bg-gray-700 rounded-lg p-4 text-center">
              <p className="text-white font-mono text-sm break-all">
                {confirmationData.walletAddress}
              </p>
              <button
                onClick={() => copyToClipboard(confirmationData.walletAddress)}
                className="mt-2 text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
              >
                Copy Address
              </button>
            </div>
          </div>
        </div>

        {/* Payment Details Panel */}
        <div className="rounded-xl border border-gray-700 bg-gray-800 shadow-2xl backdrop-blur-sm p-8">
          <h3 className="font-bold text-white text-xl mb-6">Payment Details</h3>
          <div className="space-y-4">
            <div>
              <p className="text-gray-400 text-sm mb-1">Amount To Send</p>
              <p className="text-orange-500 font-bold text-lg">
                {confirmationData.amount.toFixed(8)} {confirmationData.currency}
              </p>
              <p className="text-gray-500 text-xs mt-1">(Total confirms needed: 10)</p>
            </div>

            <div>
              <p className="text-gray-400 text-sm mb-1">Received So Far</p>
              <p className="text-gray-300 font-medium">
                0.00000000 {confirmationData.currency} unconfirmed
              </p>
            </div>

            <div>
              <p className="text-gray-400 text-sm mb-1">Status</p>
              <p className="text-yellow-400 font-medium">Waiting for buyer funds...</p>
            </div>

            <div>
              <p className="text-gray-400 text-sm mb-1">Payment Id</p>
              <p className="text-white font-mono text-sm break-all">
                {confirmationData.paymentId}
              </p>
              <p className="text-gray-500 text-xs mt-1">
                (have this handy if you need any support related to this transaction)
              </p>
              <button
                onClick={() => copyToClipboard(confirmationData.paymentId)}
                className="mt-2 text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
              >
                Copy Payment ID
              </button>
            </div>

            <div>
              <p className="text-gray-400 text-sm mb-1">Creation Time</p>
              <p className="text-white font-medium">{confirmationData.creationTime}</p>
            </div>

            <div>
              <p className="text-gray-400 text-sm mb-1">Expiry Time</p>
              <p className="text-white font-medium">{confirmationData.expiryTime}</p>
            </div>
          </div>
        </div>
      </div>

      {/* SUCCESS */}
      {success && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
    <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl text-center max-w-md w-full">
      
      <div className="text-5xl mb-4">🎉</div>
      
      <h2 className="text-xl font-bold text-white mb-2">
        Payment Successful!
      </h2>
      
      <p className="text-gray-300 mb-6">
        Your deposit is confirmed and investment has been created.
      </p>

      <button
        onClick={() => navigate(-1)}
        className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg transition"
      >
        Continue
      </button>
    </div>
  </div>
)}
    </div>
  );
}