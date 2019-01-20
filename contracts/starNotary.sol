pragma solidity >=0.4.21 <0.6.0;

import "openzeppelin-solidity/contracts/token/ERC721/ERC721.sol";

contract StarNotary is ERC721 {

    struct Star {
        string name;
    }

   //  Add a name and a symbol for your starNotary tokens
    string public constant name = "My Token";
    string public constant symbol = "KIT";
  

    mapping(uint256 => Star) public tokenIdToStarInfo;
    mapping(uint256 => uint256) public starsForSale;

    function createStar(string memory _name,uint256 _tokenId) public {
        Star memory newStar;
        newStar.name = _name;
        tokenIdToStarInfo[_tokenId] = newStar;
        _mint(msg.sender, _tokenId);
    }

   // Add a function lookUptokenIdToStarInfo, that looks up the stars using the Token ID, and then returns the name of the star.
    function lookUptokenIdToStarInfo(uint256 _tokenId) public view returns ( string  memory _name){
        _name = tokenIdToStarInfo[_tokenId].name;
    }
    
    function putStarUpForSale(uint256 _tokenId, uint256 _price) public {
        require(ownerOf(_tokenId) == msg.sender);

        starsForSale[_tokenId] = _price;
    }

    function buyStar(uint256 _tokenId) public payable {
        require(starsForSale[_tokenId] > 0);

        uint256 starCost = starsForSale[_tokenId];
        address payable starOwner = address(uint160(ownerOf(_tokenId)));
        require(msg.value >= starCost);
       
        _transferFrom(starOwner, msg.sender,_tokenId);
        
        starOwner.transfer(starCost);
        
        if(msg.value > starCost) {
            msg.sender.transfer(msg.value - starCost);
        }
        starsForSale[_tokenId] = 0;
      }

// Add a function called exchangeStars, so 2 users can exchange their star tokens...
//Do not worry about the price, just write code to exchange stars between users.

function exchangeStars(address _user1, uint256 _user1tokenId ,address _user2, uint256 _user2tokenId) public {
        //Ensure tokens belongs to the correct user
        require(address(uint160(ownerOf(_user1tokenId))) == _user1);
        require(address(uint160(ownerOf(_user2tokenId))) == _user2);

        _transferFrom(_user1, _user2, _user1tokenId);
        _transferFrom(_user2, _user1, _user2tokenId);
}

function isOwner(address _user, uint256 _tokenId) public view returns (bool) {
    return (address(uint160(ownerOf(_tokenId))) == _user);
}

// Write a function to Transfer a Star. The function should transfer a star from the address of the caller.
// The function should accept 2 arguments, the address to transfer the star to, and the token ID of the star.

function transferStar(address _to, uint256 _tokenId ) public {
       //Ensure tokens belongs to the caller
       require(ownerOf(_tokenId) == msg.sender);
       _transferFrom(msg.sender, _to, _tokenId);
}

}
