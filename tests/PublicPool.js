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
let publicIndividualMaximumAmount = 600 * 10 ** 18

let deployedToken
let decimals = 18
let totalSupply = 1000000000
let symbol = "DRM"
let name = "Dream"

describe("Public", () => {
    beforeEach(async () => {
        //get accounts from ganache
        accounts = await web3.eth.getAccounts()
        ownerAdress = accounts[0]

        //token
        deployedToken = await new web3.eth.Contract(compiledToken.abi)
            .deploy({
                data: compiledToken.evm.bytecode.object,
                arguments: [name, symbol, totalSupply],
            })
            .send({ from: ownerAdress, gas: 5000000 })
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
                        false,
                        BigInt(publicIndividualMaximumAmount).toString(),
                    ],
                })
                .send({ from: ownerAdress, gas: 5000000 })
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
                        false,
                        BigInt(publicIndividualMaximumAmount).toString(),
                    ],
                })
                .send({ from: ownerAdress, gas: 5000000 })
        })

        it("should saleFunded be false when owner not send enough token", async () => {
            await deployedToken.methods
                .approve(
                    deployedPool.options.address,
                    BigInt(tokenForSale).toString()
                )
                .send({ from: ownerAdress })
            await deployedPool.methods
                .fund(BigInt(tokenForSale - 100000).toString())
                .send({ from: ownerAdress })

            const isSaleFunded = await deployedPool.methods
                .isSaleFunded()
                .call()
            assert(!isSaleFunded)
        })

        it("should saleFunded be true when owner send enough token", async () => {
            await deployedToken.methods
                .approve(
                    deployedPool.options.address,
                    BigInt(tokenForSale).toString()
                )
                .send({ from: ownerAdress })
            await deployedPool.methods
                .fund(BigInt(tokenForSale).toString())
                .send({ from: ownerAdress })

            const isSaleFunded = await deployedPool.methods
                .isSaleFunded()
                .call()
            assert(isSaleFunded)
        })

        it("not allow fund token by non-ownable address", async () => {
            await deployedToken.methods
                .transfer(accounts[1], BigInt(tokenForSale).toString())
                .send({ from: ownerAdress })
            try {
                await deployedPool.methods
                    .fund(BigInt(tokenForSale).toString())
                    .send({ from: accounts[1] })
                assert(false)
            } catch (error) {
                assert(true)
            }
        })

        it("allow owner fund token many time until enough token", async () => {
            await deployedToken.methods
                .approve(
                    deployedPool.options.address,
                    BigInt(tokenForSale).toString()
                )
                .send({ from: ownerAdress })
            await deployedPool.methods
                .fund(BigInt(tokenForSale / 2).toString())
                .send({ from: ownerAdress })
            await deployedPool.methods
                .fund(BigInt(tokenForSale / 2).toString())
                .send({ from: ownerAdress })
            assert(await deployedPool.methods.isSaleFunded().call())
        })

        it("not allow owner fund token more than enough", async () => {
            await deployedToken.methods
                .approve(
                    deployedPool.options.address,
                    BigInt(tokenForSale + 1).toString()
                )
                .send({ from: ownerAdress })
            try {
                await deployedPool.methods
                    .fund(BigInt(tokenForSale + 1).toString())
                    .send({ from: ownerAdress })
                assert(false)
            } catch (error) {
                assert(true)
            }
        })

        it("should all info right", async () => {
            const data = await deployedPool.methods.getInfo().call()
            assert(deployedToken.options.address == data[0])
            assert(decimals == data[1])
            assert(tradeValue == data[2])
            assert(startTime == data[3])
            assert(endTime == data[4])
            assert(0 == data[5])
            assert(tokenForSale == data[6])
            assert((tokenForSale * tradeValue) / 10 ** 18 == data[7])
        })
    })

    describe("Open", () => {
        it("not allow to fund token in this period", async () => {
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
                        false,
                        BigInt(publicIndividualMaximumAmount).toString(),
                    ],
                })
                .send({ from: ownerAdress, gas: 5000000 })

            // wait til start open
            while (Date.now() / 1000 < startTime + 1) {}

            try {
                await deployedToken.methods
                    .approve(
                        deployedPool.options.address,
                        BigInt(tokenForSale).toString()
                    )
                    .send({ from: ownerAdress })
                await deployedPool.methods
                    .fund(BigInt(tokenForSale).toString())
                    .send({ from: ownerAdress })
                assert(false)
            } catch (error) {
                assert(true)
            }
        })

        beforeEach(async () => {
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
                        false,
                        BigInt(publicIndividualMaximumAmount).toString(),
                    ],
                })
                .send({ from: ownerAdress, gas: 5000000 })
            await deployedToken.methods
                .approve(
                    deployedPool.options.address,
                    BigInt(tokenForSale).toString()
                )
                .send({ from: ownerAdress })
            await deployedPool.methods
                .fund(BigInt(tokenForSale).toString())
                .send({ from: ownerAdress })

            // wait til start open
            while (Date.now() / 1000 < startTime + 1) {}
        })

        it("allow everyone to buy token with the same max amount", async () => {
            const value = await deployedPool.methods
                .cost(BigInt(publicIndividualMaximumAmount).toString())
                .call()
            await deployedPool.methods
                .swap(BigInt(publicIndividualMaximumAmount).toString())
                .send({ from: accounts[1], value, gas: "3000000" })
        })

        it("not allow to buy token more than max amount", async () => {
            const value = await deployedPool.methods
                .cost(BigInt(publicIndividualMaximumAmount + 100000).toString())
                .call()
            try {
                await deployedPool.methods
                    .swap(
                        BigInt(
                            publicIndividualMaximumAmount + 100000
                        ).toString()
                    )
                    .send({ from: accounts[1], value, gas: "3000000" })
                assert(false)
            } catch (error) {
                assert(true)
            }
        })

        it("allow to buy token many time", async () => {
            const value = await deployedPool.methods
                .cost(BigInt(publicIndividualMaximumAmount).toString())
                .call()
            await deployedPool.methods
                .swap(BigInt(publicIndividualMaximumAmount / 2).toString())
                .send({ from: accounts[1], value: value / 2, gas: "3000000" })
            await deployedPool.methods
                .swap(BigInt(publicIndividualMaximumAmount / 2).toString())
                .send({ from: accounts[1], value: value / 2, gas: "3000000" })
        })

        it("not allow to buy token more than tokenLeft", async () => {
            const value = await deployedPool.methods
                .cost(BigInt((tokenForSale * 51) / 100).toString())
                .call()
            await deployedPool.methods
                .swap(BigInt((tokenForSale * 51) / 100).toString())
                .send({ from: accounts[1], value, gas: "3000000" })
            try {
                await deployedPool.methods
                    .swap(BigInt((tokenForSale / 2).toString()))
                    .send({ from: accounts[2], value, gas: "3000000" })
                assert(false)
            } catch (error) {
                assert(true)
            }
        })

        it("not allow to buy token with negative number", async () => {
            const value = await deployedPool.methods
                .cost(BigInt(publicIndividualMaximumAmount).toString())
                .call()
            try {
                await deployedPool.methods
                    .swap(BigInt(-100).toString())
                    .send({ from: accounts[1], value, gas: "3000000" })
                assert(false)
            } catch (error) {
                assert(true)
            }
        })

        it("not allow to buy token without pay enought ETH", async () => {
            const value = await deployedPool.methods
                .cost(BigInt(publicIndividualMaximumAmount - 100000).toString())
                .call()
            try {
                await deployedPool.methods
                    .swap(BigInt(publicIndividualMaximumAmount).toString())
                    .send({ from: accounts[1], value, gas: "3000000" })
                assert(false)
            } catch (error) {
                assert(true)
            }
        })

        it("not allow buyer to claim token in this period", async () => {
            const value = await deployedPool.methods
                .cost(BigInt(publicIndividualMaximumAmount).toString())
                .call()
            await deployedPool.methods
                .swap(BigInt(publicIndividualMaximumAmount).toString())
                .send({ from: accounts[1], value, gas: "3000000" })
            try {
                await deployedPool.methods
                    .redeemTokens(1)
                    .send({ from: accounts[1], gas: "3000000" })
                assert(false)
            } catch (error) {
                assert(true)
            }
        })

        it("not allow owner to withdraw token in this period", async () => {
            try {
                await deployedPool.methods
                    .withdrawUnsoldTokens()
                    .send({ from: ownerAdress, gas: "3000000" })
                assert(false)
            } catch (error) {
                assert(true)
            }
        })

        it("not allow owner to withdraw fund in this period", async () => {
            try {
                await deployedPool.methods
                    .withdrawFunds()
                    .send({ from: ownerAdress, gas: "3000000" })
                assert(false)
            } catch (error) {
                assert(true)
            }
        })
    })

    describe("after close", () => {
        beforeEach(async () => {
            startTime = Math.floor(Date.now() / 1000) + 2
            endTime = startTime + 2
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
                        false,
                        BigInt(publicIndividualMaximumAmount).toString(),
                    ],
                })
                .send({ from: ownerAdress, gas: 5000000 })

            await deployedToken.methods
                .approve(
                    deployedPool.options.address,
                    BigInt(tokenForSale).toString()
                )
                .send({ from: ownerAdress })
            await deployedPool.methods
                .fund(BigInt(tokenForSale).toString())
                .send({ from: ownerAdress })

            // wait til start open
            while (Date.now() / 1000 < startTime + 1) {}

            const value = await deployedPool.methods
                .cost(BigInt(publicIndividualMaximumAmount).toString())
                .call()
            await deployedPool.methods
                .swap(BigInt(publicIndividualMaximumAmount).toString())
                .send({ from: accounts[1], value: value, gas: "3000000" })

            // wait til end open
            while (Date.now() / 1000 < endTime + 1) {}
        })

        it("not allow buyer to buy token in this period", async () => {
            try {
                const value = await deployedPool.methods
                    .cost(BigInt(publicIndividualMaximumAmount / 10).toString())
                    .call()
                await deployedPool.methods
                    .swap(BigInt(publicIndividualMaximumAmount / 10).toString())
                    .send({ from: accounts[2], value, gas: "3000000" })
                assert(false)
            } catch (error) {
                assert(true)
            }
        })

        it("allow buyer to claim token", async () => {
            await deployedPool.methods
                .redeemTokens(1)
                .send({ from: accounts[1], gas: "3000000" })
        })

        it("allow owner to withdraw fund", async () => {
            await deployedPool.methods
                .withdrawFunds()
                .send({ from: ownerAdress, gas: "3000000" })
        })

        it("allow owner to withdraw token", async () => {
            await deployedPool.methods
                .withdrawUnsoldTokens()
                .send({ from: ownerAdress, gas: "3000000" })
        })
    })
})
