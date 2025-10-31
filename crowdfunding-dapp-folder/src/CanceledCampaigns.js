import React, { useState, useEffect } from "react";
import crowdfunding from "./Crowdfunding";
import web3 from "./web3";

const CanceledCampaigns = ({ account }) => {
    const [campaigns, setCampaigns] = useState([]);

    const fetchCanceledCampaigns = async () => {
        const campaignCount = await crowdfunding.methods.campaignCount().call();
        const canceledCampaigns = [];

        for (let i = 1; i <= campaignCount; i++) {
            const campaign = await crowdfunding.methods.campaigns(i).call();

            // Μόνο ακυρωμένες καμπάνιες (active = false και sharesSold < totalShares)
            if (!campaign.active && campaign.sharesSold < campaign.totalShares) {
                let sharesOwned = 0;
                if (account && web3.utils.isAddress(account)) {
                    sharesOwned = await crowdfunding.methods.sharesOwned(i, account).call();
                }
                canceledCampaigns.push({ id: i, sharesOwned, ...campaign });
            }
        }

        setCampaigns(canceledCampaigns);
    };

    const claimRefund = async (campaignId) => {
        try {
            await crowdfunding.methods.claimRefund(campaignId).send({ from: account });
            alert("Refund claimed successfully!");
            fetchCanceledCampaigns();
        } catch (error) {
            console.error("Error claiming refund:", error);
        }
    };

    useEffect(() => {
        fetchCanceledCampaigns();
        crowdfunding.events.allEvents({}, fetchCanceledCampaigns);
    }, [account]);

    return (
        <div>
            <h2>Canceled Campaigns</h2>
            {campaigns.length === 0 ? (
                <p>No canceled campaigns available.</p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Creator</th>
                            <th>Refundable Shares</th>
                            <th>Your Shares</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {campaigns.map((campaign) => (
                            <tr key={campaign.id}>
                                <td>{campaign.title}</td>
                                <td>{campaign.creator}</td>
                                <td>{campaign.sharesSold}</td>
                                <td>{campaign.sharesOwned}</td>
                                <td>
                                    {campaign.sharesOwned > 0 && (
                                        <button onClick={() => claimRefund(campaign.id)}>Claim Refund</button>
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

export default CanceledCampaigns;
