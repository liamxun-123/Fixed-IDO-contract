const assert = require("assert")
const ganache = require("ganache-cli")
const Web3 = require("web3")

const web3 = new Web3(ganache.provider())

const compiledWhitelist = require("../builds/Whitelist.json")

let accounts
let deployedWhitelist
let publicIndividualMaximumAmount
//dummy data
let whitelist

beforeEach(async () => {
    //get accounts from ganache
    accounts = await web3.eth.getAccounts()

    ownerAdress = accounts[0]
})

describe("Test create Whitelist", () => {
    it("allow create Whitelist", async () => {
        // Private Whitelist
        deployedWhitelist = await new web3.eth.Contract(compiledWhitelist.abi)
            .deploy({
                data: compiledWhitelist.evm.bytecode.object,
                arguments: [true, 0],
            })
            .send({
                from: ownerAdress,
                gas: "1000000",
            })
        assert.ok(deployedWhitelist.options.address)

        // Public Whitelist
        deployedWhitelist = await new web3.eth.Contract(compiledWhitelist.abi)
            .deploy({
                data: compiledWhitelist.evm.bytecode.object,
                arguments: [false, 1000],
            })
            .send({
                from: ownerAdress,
                gas: "1000000",
            })
        assert.ok(deployedWhitelist.options.address)
    })
})

describe("Whitelist", () => {
    beforeEach(async () => {
        deployedWhitelist = await new web3.eth.Contract(compiledWhitelist.abi)
            .deploy({
                data: compiledWhitelist.evm.bytecode.object,
                arguments: [false, 1000],
            })
            .send({
                from: ownerAdress,
                gas: "1000000",
            })
    })
    it("be owned by creator", async () => {
        const owner = await deployedWhitelist.methods.owner().call()
        assert(owner === ownerAdress)
    })
    it("allow to change owner by old owner", async () => {
        await deployedWhitelist.methods
            .transferOwnership(accounts[1])
            .send({ from: ownerAdress })
        const owner = await deployedWhitelist.methods.owner().call()
        assert(owner === accounts[1])
    })
    it("not allow to change owner by other address", async () => {
        try {
            await deployedWhitelist.methods
                .transferOwnership(accounts[1])
                .send({ from: accounts[2] })
            assert(false)
        } catch {
            assert(true)
        }
    })
})

describe("Public Whitelist", () => {
    beforeEach(async () => {
        publicIndividualMaximumAmount = 1000
        deployedWhitelist = await new web3.eth.Contract(compiledWhitelist.abi)
            .deploy({
                data: compiledWhitelist.evm.bytecode.object,
                arguments: [false, publicIndividualMaximumAmount],
            })
            .send({
                from: ownerAdress,
                gas: "1000000",
            })
    })

    it("allow to be whitelisted for all address", async () => {
        const beAllWhitelisted = accounts.every(async (account) => {
            return await deployedWhitelist.methods.isWhitelisted(account).call()
        })
        assert(beAllWhitelisted)
    })

    it("should be all address has same Individual Maximum Amount", async () => {
        const result = accounts.every(async (account) => {
            const maxAmount = await deployedWhitelist.methods
                .getIndividualMaximumAmount(account)
                .call()
            return maxAmount == publicIndividualMaximumAmount
        })
        assert(result)
    })
})

describe("Private Whitelist", () => {
    beforeEach(async () => {
        whitelist = [
            [...accounts],
            [
                "1000",
                "2000",
                "3000",
                "4000",
                "5000",
                "6000",
                "7000",
                "8000",
                "9000",
                "10000",
            ],
        ]
        deployedWhitelist = await new web3.eth.Contract(compiledWhitelist.abi)
            .deploy({
                data: compiledWhitelist.evm.bytecode.object,
                arguments: [true, 0],
            })
            .send({
                from: ownerAdress,
                gas: "1000000",
            })
    })

    it('not allow non-whitelisted address', async () => {
        const beWhitelisted = await deployedWhitelist.methods.isWhitelisted(accounts[1]).call()
        assert(!beWhitelisted)
    })
})
