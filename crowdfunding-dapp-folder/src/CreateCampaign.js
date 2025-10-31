import React, { useState } from "react";
import crowdfunding from "./Crowdfunding";
import web3 from "./web3";

const CreateCampaign = ({ account }) => {
    const [title, setTitle] = useState("");
    const [price, setPrice] = useState("");
    const [shares, setShares] = useState("");

    const createCampaign = async (e) => {
        e.preventDefault();
        try {
            await crowdfunding.methods
                .createCampaign(title, web3.utils.toWei(price, "ether"), shares)
                .send({
                    from: account,
                    value: web3.utils.toWei("0.02", "ether"),
                });
            alert("Campaign created successfully!");
        } catch (error) {
            console.error("Error creating campaign:", error);
            alert("Failed to create campaign.");
        }
    };

    return (
        <div>
            <h2>New Campaign</h2>
            <form onSubmit={createCampaign}>
                <input
                    type="text"
                    placeholder="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                />
                <input
                    type="number"
                    placeholder="Price per Share (ETH)"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                />
                <input
                    type="number"
                    placeholder="Number of Shares"
                    value={shares}
                    onChange={(e) => setShares(e.target.value)}
                    required
                />
                <button type="submit" disabled={!account}>
                    Create
                </button>
            </form>
        </div>
    );
};

export default CreateCampaign;
