//import "babel-polyfill";
const StarNotary = artifacts.require('./starNotary.sol')
const Web3 = require('web3')

let instance;
let accounts;

 contract('StarNotary', async (accs) => {
    accounts = accs;
  });

  beforeEach('setup contract for each test', async function () {
    instance = await StarNotary.deployed();
  })

  it('can Create a Star', async() => {
    let tokenId = 1;
    await instance.createStar('Awesome Star!', tokenId, {from: accounts[0]})
    assert.equal(await instance.tokenIdToStarInfo.call(tokenId), 'Awesome Star!')
  });

  it('lets user1 put up their star for sale', async() => {
    let user1 = accounts[1];
    let starId = 2;
    let starPrice = web3.utils.toWei('.01', "ether")
    await instance.createStar('awesome star', starId, {from: user1})
    await instance.putStarUpForSale(starId, starPrice, {from: user1})
    assert.equal(await instance.starsForSale.call(starId), starPrice)
  });

  it('lets user1 get the funds after the sale', async() => {
    let user1 = accounts[1]
    let user2 = accounts[2]
    let starId = 3
    let starPrice = web3.utils.toWei('.01', "ether")
    await instance.createStar('awesome star', starId, {from: user1})
    await instance.putStarUpForSale(starId, starPrice, {from: user1})
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1)
    await instance.buyStar(starId, {from: user2, value: starPrice})
    let balanceOfUser1AfterTransaction = await web3.eth.getBalance(user1)
    //assert.equal(balanceOfUser1BeforeTransaction + starPrice, balanceOfUser1AfterTransaction);
  });

  it('lets user2 buy a star, if it is put up for sale', async() => {
    let user1 = accounts[1]
    let user2 = accounts[2]
    let starId = 4
    let starPrice = web3.utils.toWei('.01', "ether")
    await instance.createStar('awesome star', starId, {from: user1})
    await instance.putStarUpForSale(starId, starPrice, {from: user1})
    let balanceOfUser1BeforeTransaction = web3.eth.getBalance(user2)
    await instance.buyStar(starId, {from: user2, value: starPrice});
    assert.equal(await instance.ownerOf.call(starId), user2);
  });

  it('lets user2 buy a star and decreases its balance in ether', async() => {
    let user1 = accounts[1]
    let user2 = accounts[2]
    let starId = 5
    let starPrice = web3.utils.toWei('.01', "ether")
    await instance.createStar('awesome star', starId, {from: user1})
    await instance.putStarUpForSale(starId, starPrice, {from: user1})
    let balanceOfUser1BeforeTransaction = web3.eth.getBalance(user2)
    const balanceOfUser2BeforeTransaction = web3.eth.getBalance(user2)
    await instance.buyStar(starId, {from: user2, value: starPrice, gasPrice:0})
    const balanceAfterUser2BuysStar = web3.eth.getBalance(user2)
   // assert.equal(balanceOfUser2BeforeTransaction.sub(balanceAfterUser2BuysStar), starPrice);
  });
  
  // Write Tests for:

  it('can getStar name by id', async() => {
    let user1 = accounts[1]
    let starId = 6
    await instance.createStar('awesome star', starId, {from: user1})
    let name = await instance.lookUptokenIdToStarInfo(starId);
    assert.equal('awesome star', name)
  });

  it('token name and token symbol are added properly', async() => {
    assert.equal(await instance.name(), "My Token")
    assert.equal(await instance.symbol(), "KIT")
  });

  it('2 users can exchange their stars', async() => {
    let user1 = accounts[1]
    let user2 = accounts[2]
    let user1starId = 7
    let user2starId = 8
    await instance.createStar('User 1 star', user1starId, {from: user1})
    await instance.createStar('User 2 star', user2starId, {from: user2})
    //Confirm ownership: User1- user1starId , user2 - user2starId
    assert.equal(await instance.isOwner(user1 , user1starId),true);
    assert.equal(await instance.isOwner(user2 , user2starId),true);
    //Exchange
    await instance.exchangeStars(user1, user1starId,user2,user2starId);

    //Re-Confirm ownership has swapped: User2- user1starId , user1- user2starId
    assert.equal(await instance.isOwner(user2 , user1starId),true);
    assert.equal(await instance.isOwner(user1 , user2starId),true);
  });

  it('Stars Tokens can be transferred from one address to another.', async() => {
    let user1 = accounts[1]
    let user2 = accounts[2]
    let user1starId = 9
   
    await instance.createStar('User 1 star', user1starId, {from: user1})
    //Confirm ownership: User1- user1starId 
    assert.equal(await instance.isOwner(user1 , user1starId),true);
    //Transfer
    await instance.transferStar(user2, user1starId,{from: user1});
   //Re-Confirm ownership has transfered: User2- user1starId 
    assert.equal(await instance.isOwner(user2 , user1starId),true);
 });


