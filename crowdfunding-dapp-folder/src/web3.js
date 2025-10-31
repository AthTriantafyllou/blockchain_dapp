import Web3 from "web3";

const web3 = new Web3(
    new Web3.providers.HttpProvider("https://sepolia.infura.io/v3/<INFURA_PROJECT_ID>")
);

export default web3;
