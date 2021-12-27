const { expect } = require('chai')
const { ethers } = require('hardhat')

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