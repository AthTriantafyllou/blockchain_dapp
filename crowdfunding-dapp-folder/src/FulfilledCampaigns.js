import React, { useState, useEffect } from "react";
import crowdfunding from "./Crowdfunding";
import web3 from "./web3";

const FulfilledCampaigns = ({ account }) => {
    const [campaigns, setCampaigns] = useState([]);

    const fetchFulfilledCampaigns = async () => {
        const campaignCount = await crowdfunding.methods.campaignCount().call();
        const fulfilledCampaigns = [];

        for (let i = 1; i <= campaignCount; i++) {
            const campaign = await crowdfunding.methods.campaigns(i).call();

            // Μόνο ολοκληρωμένες καμπάνιες (active = false και sharesSold === totalShares)
            if (!campaign.active && campaign.sharesSold === campaign.totalShares) {
                let sharesOwned = 0;
                if (account && web3.utils.isAddress(account)) {
                    sharesOwned = await crowdfunding.methods.sharesOwned(i, account).call();
                }
                fulfilledCampaigns.push({ id: i, sharesOwned, ...campaign });
            }
        }

        setCampaigns(fulfilledCampaigns);
    };

    useEffect(() => {
        fetchFulfilledCampaigns();
        crowdfunding.events.allEvents({}, fetchFulfilledCampaigns);
    }, [account]);

    return (
        <div>
            <h2>Fulfilled Campaigns</h2>
            {campaigns.length === 0 ? (
                <p>No fulfilled campaigns available.</p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Creator</th>
                            <th>Shares Sold</th>
                            <th>Your Shares</th>
                        </tr>
                    </thead>
                    <tbody>
                        {campaigns.map((campaign) => (
                            <tr key={campaign.id}>
                                <td>{campaign.title}</td>
                                <td>{campaign.creator}</td>
                                <td>{campaign.sharesSold}</td>
                                <td>{campaign.sharesOwned}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default FulfilledCampaigns;
