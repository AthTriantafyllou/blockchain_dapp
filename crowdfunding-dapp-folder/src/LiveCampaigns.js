import React, { useState, useEffect } from "react";
import crowdfunding from "./Crowdfunding";
import web3 from "./web3";

const LiveCampaigns = ({ account }) => {
    const [campaigns, setCampaigns] = useState([]);

    const fetchCampaigns = async () => {
        const campaignCount = await crowdfunding.methods.campaignCount().call();
        const activeCampaigns = [];

        for (let i = 1; i <= campaignCount; i++) {
            const campaign = await crowdfunding.methods.campaigns(i).call();
            if (campaign.active) {
                let sharesOwned = 0;
                if (account && web3.utils.isAddress(account)) {
                    sharesOwned = await crowdfunding.methods.sharesOwned(i, account).call();
                }
                activeCampaigns.push({ id: i, sharesOwned, ...campaign });
            }
        }

        setCampaigns(activeCampaigns);
    };

    const pledge = async (campaignId, price) => {
        try {
            await crowdfunding.methods.buyShares(campaignId, 1).send({
                from: account,
                value: web3.utils.toWei(price, "ether"),
            });
            alert("Pledge successful!");
            fetchCampaigns();
        } catch (error) {
            console.error("Error pledging:", error);
        }
    };

    const cancelCampaign = async (campaignId) => {
        try {
            await crowdfunding.methods.cancelCampaign(campaignId).send({ from: account });
            alert("Campaign canceled!");
            fetchCampaigns();
        } catch (error) {
            console.error("Error canceling campaign:", error);
        }
    };

    const fulfillCampaign = async (campaignId) => {
        try {
            await crowdfunding.methods.fulfillCampaign(campaignId).send({ from: account });
            alert("Campaign fulfilled successfully!");
            fetchCampaigns();
        } catch (error) {
            console.error("Error fulfilling campaign:", error);
        }
    };

    useEffect(() => {
        fetchCampaigns();
        crowdfunding.events.allEvents({}, fetchCampaigns);
    }, [account]);

    return (
        <div>
            <h2>Live Campaigns</h2>
            {campaigns.length === 0 ? (
                <p>No live campaigns available.</p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Creator</th>
                            <th>Price per Share (ETH)</th>
                            <th>Shares Sold</th>
                            <th>Shares Remaining</th>
                            <th>Your Shares</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {campaigns.map((campaign) => (
                            <tr key={campaign.id}>
                                <td>{campaign.title}</td>
                                <td>{campaign.creator}</td>
                                <td>{web3.utils.fromWei(campaign.sharePrice, "ether")}</td>
                                <td>{campaign.sharesSold}</td>
                                <td>{campaign.totalShares - campaign.sharesSold}</td>
                                <td>{campaign.sharesOwned}</td>
                                <td>
                                    <button
                                        onClick={() =>
                                            pledge(campaign.id, web3.utils.fromWei(campaign.sharePrice, "ether"))
                                        }
                                    >
                                        Pledge
                                    </button>
                                    {account &&
                                        web3.utils.toChecksumAddress(account) ===
                                            web3.utils.toChecksumAddress(campaign.creator) && (
                                            <>
                                                <button onClick={() => cancelCampaign(campaign.id)}>Cancel</button>
                                                <button
                                                    onClick={() => fulfillCampaign(campaign.id)}
                                                    disabled={campaign.sharesSold < campaign.totalShares}
                                                    style={{
                                                        backgroundColor:
                                                            campaign.sharesSold < campaign.totalShares
                                                                ? "#d3d3d3" // Αχνό γκρι
                                                                : "#4CAF50", // Πράσινο όταν ενεργό
                                                        cursor:
                                                            campaign.sharesSold < campaign.totalShares
                                                                ? "not-allowed"
                                                                : "pointer",
                                                    }}
                                                >
                                                    Fulfill
                                                </button>
                                            </>
                                        )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default LiveCampaigns;
