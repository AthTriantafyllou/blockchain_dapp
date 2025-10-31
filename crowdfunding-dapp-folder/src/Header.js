import React, { useState, useEffect } from "react";
import web3 from "./web3";
import crowdfunding from "./Crowdfunding";

const Header = ({ account, setAccount }) => {
    const [owner, setOwner] = useState("Loading...");
    const [contractBalance, setContractBalance] = useState("Loading...");
    const [fees, setFees] = useState("Loading...");

    const connectWallet = async () => {
        try {
            const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
            if (web3.utils.isAddress(accounts[0])) {
                setAccount(web3.utils.toChecksumAddress(accounts[0]));
            } else {
                alert("Invalid wallet address.");
            }
        } catch (error) {
            console.error("Failed to connect wallet:", error);
        }
    };

    const disconnectWallet = () => {
        setAccount("");
    };

    const fetchContractData = async () => {
        try {
            console.log("Fetching contract data...");
            const ownerAddress = await crowdfunding.methods.owner().call();
            const balance = await web3.eth.getBalance(crowdfunding.options.address);
            const platformFees = await crowdfunding.methods.collectedFees().call();

            setOwner(web3.utils.isAddress(ownerAddress) ? web3.utils.toChecksumAddress(ownerAddress) : "N/A");
            setContractBalance(web3.utils.fromWei(balance, "ether"));
            setFees(web3.utils.fromWei(platformFees, "ether"));
        } catch (error) {
            console.error("Error fetching contract data:", error);
        }
    };

    useEffect(() => {
        if (account) {
            fetchContractData();
        }

        // Ενημέρωση δεδομένων μέσω events (όχι setInterval)
        const subscription = crowdfunding.events.allEvents({}, fetchContractData);

        // Καθαρισμός της εγγραφής όταν αποσυνδεθείς
        return () => {
            if (subscription) subscription.unsubscribe();
        };
    }, [account]);

    return (
        <header style={{ backgroundColor: "#007BFF", color: "white", padding: "1rem", textAlign: "center", borderBottom: "2px solid #ccc" }}>
            <h1 style={{ marginBottom: "1rem", fontSize: "2rem" }}>Crowdfunding DApp</h1>
            <p><strong>Current Address:</strong> {account || "Not connected"}</p>
            {account ? (
                <>
                    <p><strong>Owner's Address:</strong> {owner}</p>
                    <p><strong>Balance:</strong> {contractBalance} ETH</p>
                    <p><strong>Collected Fees:</strong> {fees} ETH</p>
                    <button
                        onClick={disconnectWallet}
                        style={{
                            padding: "0.5rem 1rem",
                            backgroundColor: "#DC3545",
                            color: "white",
                            border: "none",
                            borderRadius: "5px",
                            cursor: "pointer",
                            marginTop: "1rem",
                        }}
                    >
                        Disconnect Wallet
                    </button>
                </>
            ) : (
                <button
                    onClick={connectWallet}
                    style={{
                        padding: "0.5rem 1rem",
                        backgroundColor: "#28A745",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer",
                        marginTop: "1rem",
                    }}
                >
                    Connect Wallet
                </button>
            )}
        </header>
    );
};

export default Header;
