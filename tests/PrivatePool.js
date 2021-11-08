const assert = require("assert")
const ganache = require("ganache-cli")
const Web3 = require("web3")

const web3 = new Web3(ganache.provider())

const compiledPool = require("../builds/Pool.json")
const compiledToken = require("../builds/Token.json")

let accounts
let deployedPool
let tokenForSale = 1000 * 10 ** 18
let tradeValue = 2 * 10 ** 9
let startTime
let endTime

let whitelist

let deployedToken
let decimals = 18
let totalSupply = 1000000000
let symbol = "DRM"
let name = "Dream"

const addToWhitelist = async (pool, ownerAddress, addresses, maxAmounts) => {
    let error = null
    let result = null
    let hashTx = null
    pool.methods
        .addToWhitelist(addresses, maxAmounts)
        .send({ from: ownerAddress, gas: 3000000 })
        .on("transactionHash", (hash) => (hashTx = hash))
        .on("error", (e) => (error = e))

    const checkResult = async () => {
        if (hashTx) {
            const res = await web3.eth.getTransactionReceipt(hashTx)
            if (res) {
                result = res.status
            }
        }
    }

    while (!error && !result) {
        await new Promise((resolve) =>
            setTimeout(() => resolve(checkResult()), 2000)
        )
    }

    if (error) {
        throw error
    }

    return result
}

describe("Private", () => {
    beforeEach(async () => {
        //get accounts from ganache
        accounts = await web3.eth.getAccounts()
        ownerAddress = accounts[0]

        //dummy whitelist
        whitelist = [
            [accounts[1], accounts[2], accounts[3], accounts[4]],
            [200 * 10 ** 18, 300 * 10 ** 18, 400 * 10 ** 18, 500 * 10 ** 18],
        ]

        //token
        deployedToken = await new web3.eth.Contract(compiledToken.abi)
            .deploy({
                data: compiledToken.evm.bytecode.object,
                arguments: [name, symbol, totalSupply],
            })
            .send({ from: ownerAddress, gas: 5000000 })
    })

    describe("create pool", () => {
        it("should be created Pool successfully", async () => {
            startTime = Math.floor(Date.now() / 1000) + 5
            endTime = startTime + 600
            deployedPool = await new web3.eth.Contract(compiledPool.abi)
                .deploy({
                    data: compiledPool.evm.bytecode.object,
                    arguments: [
                        deployedToken.options.address,
                        BigInt(tradeValue).toString(),
                        BigInt(tokenForSale).toString(),
                        startTime,
                        endTime,
                        1,
                        true,
                        0,
                    ],
                })
                .send({ from: ownerAddress, gas: 5000000 })
            assert(deployedPool.options.address)
        })
    })

    describe("Before open", () => {
        beforeEach(async () => {
            startTime = Math.floor(Date.now() / 1000) + 6000
            endTime = startTime + 600
            deployedPool = await new web3.eth.Contract(compiledPool.abi)
                .deploy({
                    data: compiledPool.evm.bytecode.object,
                    arguments: [
                        deployedToken.options.address,
                        BigInt(tradeValue).toString(),
                        BigInt(tokenForSale).toString(),
                        startTime,
                        endTime,
                        1,
                        true,
                        0,
                    ],
                })
                .send({ from: ownerAddress, gas: 5000000 })
        })

        it("allow onwer to add whitelist", async () => {
            const result = await addToWhitelist(
                deployedPool,
                ownerAddress,
                whitelist[0],
                whitelist[1].map((num) => BigInt(num).toString())
            )
            assert(result)
        })

        it("not allow non-onwer to add whitelist", async () => {
            try {
                const result = await addToWhitelist(
                    deployedPool,
                    accounts[1],
                    whitelist[0],
                    whitelist[1].map((num) => BigInt(num).toString())
                )
                assert(!result)
            } catch (error) {
                assert(true)
            }
        })
    })

    describe("Open", () => {
        it("not allow to add whitelist in this period", async () => {
            startTime = Math.floor(Date.now() / 1000) + 2
            endTime = startTime + 600
            deployedPool = await new web3.eth.Contract(compiledPool.abi)
                .deploy({
                    data: compiledPool.evm.bytecode.object,
                    arguments: [
                        deployedToken.options.address,
                        BigInt(tradeValue).toString(),
                        BigInt(tokenForSale).toString(),
                        startTime,
                        endTime,
                        1,
                        true,
                        0,
                    ],
                })
                .send({ from: ownerAddress, gas: 5000000 })

            // wait til start open
            while (Date.now() / 1000 < startTime + 1) {}

            try {
                const result = await addToWhitelist(
                    deployedPool,
                    ownerAddress,
                    whitelist[0],
                    whitelist[1].map((num) => BigInt(num).toString())
                )
                assert(!result)
            } catch (error) {
                assert(true)
            }
        })

        beforeEach(async () => {
            startTime = Math.floor(Date.now() / 1000) + 5
            endTime = startTime + 600
            deployedPool = await new web3.eth.Contract(compiledPool.abi)
                .deploy({
                    data: compiledPool.evm.bytecode.object,
                    arguments: [
                        deployedToken.options.address,
                        BigInt(tradeValue).toString(),
                        BigInt(tokenForSale).toString(),
                        startTime,
                        endTime,
                        1,
                        true,
                        0,
                    ],
                })
                .send({ from: ownerAddress, gas: 5000000 })

            // add whitelist
            const result = await addToWhitelist(
                deployedPool,
                ownerAddress,
                whitelist[0],
                whitelist[1].map((num) => BigInt(num).toString())
            )
            assert(result)
            //fund
            await deployedToken.methods
                .approve(
                    deployedPool.options.address,
                    BigInt(tokenForSale).toString()
                )
                .send({ from: ownerAddress })
            await deployedPool.methods
                .fund(BigInt(tokenForSale).toString())
                .send({ from: ownerAddress })

            // wait til start open
            while (Date.now() / 1000 < startTime + 1) {}
        })

        it("allow whitelisted addresses to buy token with their max amount", async () => {
            let value = await deployedPool.methods
                .cost(BigInt(whitelist[1][0]).toString())
                .call()
            await deployedPool.methods
                .swap(BigInt(whitelist[1][0]).toString())
                .send({ from: whitelist[0][0], value, gas: "3000000" })

            value = await deployedPool.methods
                .cost(BigInt(whitelist[1][1]).toString())
                .call()
            await deployedPool.methods
                .swap(BigInt(whitelist[1][1]).toString())
                .send({ from: whitelist[0][1], value, gas: "3000000" })
        })

        it("not allow whitelisted addresses to buy token with the same max amount", async () => {
            try {
                const maxAmount =
                    whitelist[1][0] > whitelist[1][1]
                        ? whitelist[1][0]
                        : whitelist[1][1]
                const value = await deployedPool.methods
                    .cost(BigInt(maxAmount).toString())
                    .call()
                await deployedPool.methods
                    .swap(BigInt(maxAmount).toString())
                    .send({ from: whitelist[0][0], value, gas: "3000000" })

                await deployedPool.methods
                    .swap(BigInt(maxAmount).toString())
                    .send({ from: whitelist[0][1], value, gas: "3000000" })

                assert(false)
            } catch (error) {
                assert(true)
            }
        })

        it("not allow whitelisted address to buy token", async () => {
            try {
                let value = await deployedPool.methods
                    .cost(BigInt(whitelist[1][0] / 10).toString())
                    .call()
                await deployedPool.methods
                    .swap(BigInt(whitelist[1][0] / 10).toString())
                    .send({ from: whitelist[0][0], value, gas: "3000000" })
                assert(false)
            } catch (error) {
                assert(true)
            }
        })
    })
})
