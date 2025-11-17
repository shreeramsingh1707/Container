import React, { useState, useEffect } from "react";
import axios from "axios";
import { depositApi ,DepositRequest} from "../services/api";
// import { useAuth } from "../context/AuthContext";

interface PaymentResponse {
    pay_address: string;
    pay_amount: number;
    pay_currency: string;
    payment_id: string;
}


interface HistoryItem {
    paymentId: string;
    paymentStatus: string;
}

// const { user } = useAuth();

const Deposit: React.FC = () => {
    const [amount, setAmount] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [payment, setPayment] = useState<PaymentResponse | null>(null);
    const [qrCode, setQrCode] = useState<string>("");
    const [success, setSuccess] = useState<boolean>(false);
    const user = JSON.parse(localStorage.getItem("stylocoin_user") || "{}");
    const userNodeId = user?.nodeId;
    // const  userNodeId=""  // dynamically change after login

   const  depositRequest={
          userNodeId:userNodeId,
          amount : Number(amount),
   }

    const createDeposit = async () => {
        if (!amount) return alert("Enter amount");
    

        setLoading(true);

        try {
        
             const paymentResponse = await depositApi.add(depositRequest);

             console.log("Payment Address:", paymentResponse.pay_address);
             console.log("Amount to Pay:", paymentResponse.pay_amount);

        
            setPayment(paymentResponse);

            // Generate QR
            setQrCode(
                `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${paymentResponse?.pay_address}`
            );

            pollPaymentStatus(paymentResponse.payment_id);
        } catch (error) {
            alert("Error creating deposit");
        }

        setLoading(false);
    };

    // Poll payment status every 4 seconds
    const pollPaymentStatus = (paymentId: string) => {
        const interval = setInterval(async () => {
            try {
                const res = await axios.get(
                    `http://minecryptos-env.eba-nsbmtw9i.ap-south-1.elasticbeanstalk.com/api/deposit/history/${userNodeId}`
                );

                const list: HistoryItem[] = res.data.data;

                const record = list.find((x) => x.paymentId === paymentId);

                if (record && record.paymentStatus === "SUCCESS") {
                    clearInterval(interval);
                    setSuccess(true);
                }
            } catch { }
        }, 4000);
    };

    const copyAddress = () => {
        if (payment) {
            navigator.clipboard.writeText(payment.pay_address);
            alert("Address copied to clipboard!");
        }
    };

    return (
        <div style={styles.container}>
            <h2>Deposit Funds</h2>

            {/* Step 1: Amount Input */}
            <div style={styles.card}>
                <label>Enter Amount (USD)</label>
                <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    style={styles.input}
                />
                <button onClick={createDeposit} style={styles.btn} disabled={loading}>
                    {loading ? "Processing..." : "Generate Payment"}
                </button>
            </div>

            {/* Step 2: Show Payment Info */}
            {payment && (
                <div style={styles.paymentBox}>
                    <h3>Send Crypto (USDT - BEP20)</h3>

                    <p>
                        <strong>Amount:</strong> {payment.pay_amount}{" "}
                        {payment.pay_currency}
                    </p>

                    <p>
                        <strong>Address:</strong>
                        <br />
                        <span style={styles.address}>{payment.pay_address}</span>
                    </p>

                    <img src={qrCode} alt="QR Code" style={styles.qr} />

                    <button onClick={copyAddress} style={styles.copyBtn}>
                        Copy Address
                    </button>

                    <p style={styles.waiting}>Waiting for payment...</p>
                </div>
            )}

            {/* Step 3: Success */}
            {success && (
                <div style={styles.successBox}>
                    <h3>🎉 Deposit Successful!</h3>
                    <p>Your wallet has been credited.</p>
                </div>
            )}
        </div>
    );
};

// ====================
// Inline Styles
// ====================
const styles: { [key: string]: React.CSSProperties } = {
    container: {
        maxWidth: "450px",
        margin: "auto",
        padding: "20px",
        fontFamily: "Arial",
    },
    card: {
        padding: "15px",
        border: "1px solid #ddd",
        marginBottom: "20px",
        borderRadius: "8px",
    },
    input: {
        width: "100%",
        padding: "10px",
        marginTop: "10px",
        borderRadius: "6px",
        border: "1px solid #ccc",
    },
    btn: {
        width: "100%",
        padding: "12px",
        marginTop: "15px",
        background: "#4fa3ff",
        color: "#fff",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
    },
    paymentBox: {
        border: "1px solid #ccc",
        padding: "20px",
        borderRadius: "8px",
        marginTop: "20px",
    },
    qr: {
        width: "220px",
        margin: "15px auto",
        display: "block",
    },
    address: {
        fontSize: "14px",
        wordBreak: "break-all",
    },
    copyBtn: {
        width: "100%",
        padding: "12px",
        background: "#222",
        color: "#fff",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
    },
    waiting: {
        color: "orange",
        marginTop: "10px",
        textAlign: "center",
    },
    successBox: {
        background: "#d4ffd4",
        padding: "20px",
        borderRadius: "10px",
        textAlign: "center",
        marginTop: "20px",
    },
};

export default Deposit;
