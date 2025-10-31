import React, { useState } from "react";
import crowdfunding from "./Crowdfunding";
import web3 from "./web3";

const AdminPanel = ({ account }) => {
    const [newOwner, setNewOwner] = useState("");
    const [banAddress, setBanAddress] = useState("");

    const withdrawFees = async () => {
        try {
            const isOwner = await crowdfunding.methods.owner().call();
            if (web3.utils.toChecksumAddress(account) !== web3.utils.toChecksumAddress(isOwner)) {
                alert("Only the owner can perform this action.");
                return;
            }
            await crowdfunding.methods.withdrawFees().send({ from: account });
            alert("Fees withdrawn successfully!");
        } catch (error) {
            console.error("Error withdrawing fees:", error);
        }
    };

    const changeOwner = async () => {
        try {
            const isOwner = await crowdfunding.methods.owner().call();
            if (web3.utils.toChecksumAddress(account) !== web3.utils.toChecksumAddress(isOwner)) {
                alert("Only the owner can perform this action.");
                return;
            }
            await crowdfunding.methods.changeOwner(newOwner).send({ from: account });
            alert("Owner changed successfully!");
        } catch (error) {
            console.error("Error changing owner:", error);
        }
    };

    const banEntrepreneur = async () => {
        try {
            const isOwner = await crowdfunding.methods.owner().call();
            if (web3.utils.toChecksumAddress(account) !== web3.utils.toChecksumAddress(isOwner)) {
                alert("Only the owner can perform this action.");
                return;
            }
            await crowdfunding.methods.banEntrepreneur(banAddress).send({ from: account });
            alert("Entrepreneur banned successfully!");
        } catch (error) {
            console.error("Error banning entrepreneur:", error);
        }
    };

    const destroyContract = async () => {
        try {
            const isOwner = await crowdfunding.methods.owner().call();
            if (web3.utils.toChecksumAddress(account) !== web3.utils.toChecksumAddress(isOwner)) {
                alert("Only the owner can perform this action.");
                return;
            }
            await crowdfunding.methods.destroyContract().send({ from: account });
            alert("Contract destroyed successfully!");
        } catch (error) {
            console.error("Error destroying contract:", error);
        }
    };

    return (
        <div>
            <h2>Control Panel</h2>
            <button onClick={withdrawFees}>Withdraw Fees</button>
            <div>
                <input
                    type="text"
                    placeholder="Enter new owner's wallet address"
                    value={newOwner}
                    onChange={(e) => setNewOwner(e.target.value)}
                />
                <button onClick={changeOwner}>Change Owner</button>
            </div>
            <div>
                <input
                    type="text"
                    placeholder="Enter entrepreneur's address"
                    value={banAddress}
                    onChange={(e) => setBanAddress(e.target.value)}
                />
                <button onClick={banEntrepreneur}>Ban Entrepreneur</button>
            </div>
            <button onClick={destroyContract}>Destroy Contract</button>
        </div>
    );
};

export default AdminPanel;
