# Smart contracts on Polygon - how the exactly this can be done?

This one will be a quicky. Let's see how to write, deploy, and interact with smart contracts on the Polygon blockchain. We expect that you have a basic understanding of what MetaMask and Remix IDE are.
First, we need to determine what testnet to use. In the quest, we will use the Mumbai testnet. 

## Adding the testnet to MetaMask:
You may or may not have done this before. We just need to fill some fields in MetaMask for it to recognize the network. Because interfaces are constantly changing, I will explain in text, not in screenshots.  
- Go to your browser and open MetaMask.
- On the top of MetaMask's window, you find a dropdown list containing the recognized networks. Navigate till the end.
- Click _Add Network_, it opens a new tab.
- You are prompted with some fields to fill, do it like the following:
  Network Name: Mumbai Testnet
  New RPC URL: https://rpc-mumbai.maticvigil.com/
  Chain ID: 80001
  Currency Symbol: MATIC
  Block Explorer URL: https://polygonscan.com/

  And that is it, now we need to get some MATIC test tokens.

## Getting MATIC test tokens on Mumbai:
Alright, go to https://faucet.polygon.technology/. It is really straightforward, choose Mumbai Network and MATIC Token. Most likely these are the defaults, but anyway. Now copy your address and submit. If you want, check your transaction's status on https://mumbai.polygonscan.com/. This may take several minutes.

## Deploying with Remix IDE:
In https://remix.ethereum.org/, you find a default workspace on the left with three contracts already there. We will deploy the Storage contract to Polygon. Make sure you are on Mumbai when you open MetaMask and copy this code to your .sol file:
```js
// SPDX-License-Identifier: MIT

pragma solidity >=0.7.0 <0.9.0;

contract Storage {

    uint256 public number;

    constructor(uint256 num) payable{
        require(msg.value == 0.001 ether);
        number = num;
    }
}

```
You see, we require that a user has to send 0.001 MATIC for the constructor to be executed. I know, in the code it is written 0.001 ether, but programmatically it does not matter much. Let's test this out.
Save your .sol and go to the _DEPLOY & RUN TRANSACTIONS_ tab in Remix. This one is on the left. Ok, now hit deploy (make sure that the Storage contract is the one you are deploying). Choose 1 Finney (0.001 ether) as a _value_. This is the amount of MATICs we pay to change the stored number. Wait for the confirmation (Also wait for a couple of seconds for the changes to be saved). To get the number currently stored, Go ahead and hit _number_. The value is one! 

And that is all about this. But the fun does not stop here. Shall we do the same, but using Hardhat this time??? 

## Deploying with Hardhat - Setting up a hardhat project:
 Open your terminal, create a directory for your project, and cd into it. Done? Good, now we have to run these commands:
  
  ``` npm init --yes ```
  
  ``` npm install --save-dev hardhat ```
  
  ``` npx hardhat ```
  
  Now you see some prompts, choose:
  
  ``` Create an empty hardhat.config.js ```
  
  so we can manage the configuration ourselves.
  Now, run this:
  
  ``` npm install -D @nomiclabs/hardhat-ethers ethers @nomiclabs/hardhat-waffle ethereum-waffle chai ```
  
  Open the project in your editor and include this line in hardhat.config.js:
  
  ``` require('@nomiclabs/hardhat-waffle') ```
  
  Also, include this snippet in hardhat.config.js:
  
  ```js
  task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();
  for (const account of accounts) {
    console.log(account.address);
  }
  });
  ```
  
  This is a hardhat task, so that when you run:
  
  ``` npx hardhat accounts --network mumbai ```
  
  in your terminal, the Ethereum address you are using for this project will show up.
  But wait, what address? Well, we have to let Hardhat know what addresses we will be using to sign transactions.
  Go ahead and change ```module.exports``` in hardhat.config.js so it looks just like this:
  
  ```js
  module.exports = {
  solidity: {
    version: "0.7.0",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    mumbai: {
      url: "",
      accounts: [
        ""
      ] // add your Ethereum key here (private key)
    },
  }
};
```

Inside ``` accounts ```, add your private key (of the account that already is fed with MATICs). Remember, don't leave this in plain text if you are planning to share the code publicly somewhere. You can see that we specified Polygon's Mumbai as the network we are going to test with. But what about this _url_ thing? Well, this is where you have to set a provider. A provider lets you connect to the Polygon network, there are a couple of services out there. Have you ever tried https://www.alchemy.com/ ?? 

P.S: It really does not matter if you write "mumbai", "polygon", or "matic" in your hardhat.config file. what matters is what is inside the _url_ and _accounts_ fields.  
## Creating an Alchemy app
Register if it is your first time wiht Alchemy. Go to https://dashboard.alchemyapi.io/ and hit _CREATE APP_. Choose Polygon as a chain and Polygon Mumbai as a network. Alright, in your dashboard, go into your newly-created app's page and hit _view key_. copy this key, and paste inside the double quotaions in the _url_ field (in hardhat.config).
## Deploying with Hardhat - Adding the contract:
Create a directory in your project root, name it "contracts". Now, cd into it and create a Storage.sol file, paste this (the same code as we did on Remix):
```js
// SPDX-License-Identifier: MIT

pragma solidity >=0.7.0 <0.9.0;

contract Storage {
    uint256 public number;

    constructor(uint256 num) payable {
        require(msg.value == 0.001 ether);
        number = num;
    }
}

```
 run ``` npx hardhat compile ``` in your terminal. It should compile successfuly and generate the compiled contract's artifacts.

 How about we start testing this?

 ## Deploying with Hardhat - Testing:
 Create a directory in your project root, name it "test". Now, cd into it and create a store.js file. Paste these two lines:
 ```js
const { expect } = require('chai')
const { ethers } = require('hardhat')
 ```
Those are required for the testing that we will do. chai is a famous assertion library, ethers is a library used for interacting with the Ethereum Blockchain. Let's start testing!
Add this block to your code, this the only test we need:
```js
describe("Testing the Storage Contract", function () {
    this.timeout(60000);
    let Storage;
    let stor;
    it("should set the number to another number", async () => {
        Storage = await ethers.getContractFactory("Storage");
        const overrides = {
            value: ethers.utils.parseEther("0.001")
        }
        stor = await Storage.deploy(1, overrides);
        console.log("Your contract is deployed! Here is its address " + stor.address)
        let num = await stor.number();
        expect(num).to.equal(parseInt(1));
    })
})
```
In this test, we deploy the contract to Mumbai with one as the number to be stored and 0.001 MATICs as a _msg.value_, we retrieve the number stored, and we check if it is really one. Notice that if the whole test did not complete in 1 minute, it would fail.
Now run this in your terminal: 
``` npx hardhat test --network mumbai ```
It works! Right? Rrright??...
Sometimes some problems may occur. To be honest I tried another provider at first (not Alchemy), and things did not go as expected. But what matters really is the workflow and that you know what is happening. Happy coding my friend, Cheers!


