import React, { useState } from "react";
import Header from "./Header";
import CreateCampaign from "./CreateCampaign";
import LiveCampaigns from "./LiveCampaigns";
import FulfilledCampaigns from "./FulfilledCampaigns";
import CanceledCampaigns from "./CanceledCampaigns";
import AdminPanel from "./AdminPanel";
import "./App.css";

const App = () => {
    const [account, setAccount] = useState("");

    return (
        <div>
            <Header account={account} setAccount={setAccount} />
            <div className="flex-column">
                <section>
                    <CreateCampaign account={account} />
                </section>
                <section>
                    <LiveCampaigns account={account} />
                </section>
                <section>
                    <FulfilledCampaigns account={account} />
                </section>
                <section>
                    <CanceledCampaigns account={account} />
                </section>
                <section>
                    <AdminPanel account={account} />
                </section>
            </div>
        </div>
    );
};

export default App;
