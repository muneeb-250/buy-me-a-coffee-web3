//SPDX-License-Identifier: Unlicense

pragma solidity ^0.8.7;

contract BuyMeACoffee {
    // deployed address: 0x4223A3Edbe9a4c7459770E247865EE07272ec906
    // Event to emit when a Memo is created.
    event NewMemo(
        address indexed from,
        uint256 timestamp,
        string name,
        string coffeeType,
        string message
    );

    // Memo struct.
    struct Memo {
        address from;
        uint256 timestamp;
        string name;
        string coffeeType;
        string message;
    }

    // Address of contract deployer. Marked payable so that
    // we can withdraw to this address later.
    address payable public owner;

    // List of all memos received from coffee purchases.
    Memo[] memos;

    constructor() {
        // Store the address of the deployer as a payable address.
        // When we withdraw funds, we'll withdraw here.
        owner = payable(msg.sender);
    }

    /**
     * @dev fetches all stored memos
     */
    function getMemos() public view returns (Memo[] memory) {
        return memos;
    }

    /**
     * @dev buy a coffee for owner (sends an ETH tip and leaves a memo)
     * @param _name name of the coffee purchaser
     * @param _message a nice message from the purchaser
     */
    function buyCoffee(
        string memory _name,
        string memory _message,
        string memory _coffeeType
    ) public payable {
        // Must accept more than 0 ETH for a coffee.
        require(msg.value > 0, "can't buy coffee for free!");

        // Add the memo to storage!
        memos.push(
            Memo(msg.sender, block.timestamp, _name, _coffeeType, _message)
        );

        // Emit a NewMemo event with details about the memo.
        emit NewMemo(msg.sender, block.timestamp, _name, _coffeeType, _message);
    }

    /**
     * @dev send the entire balance stored in this contract to the owner
     */
    function withdrawTips() public {
        require(owner.send(address(this).balance));
    }

    //@Challenge 1: The smart contract allows to update the withdraw address
    function updateWithdraw(address _newAddress) public {
        require(msg.sender == owner, "only owner can call this method");
        owner = payable(_newAddress);
    }

    //@challenge 2: Allow your smart contract to buyLargeCoffee for 0.003 ETH
    function buyLargeCoffee(
        string memory _name,
        string memory _message,
        string memory _coffeeType
    ) public payable {
        require(msg.value == 0.003 ether, "only 0.003 ethers are requried");
        memos.push(
            Memo(msg.sender, block.timestamp, _name, _coffeeType, _message)
        );

        // Emit a NewMemo event with details about the memo.
        emit NewMemo(msg.sender, block.timestamp, _name, _coffeeType, _message);
    }
}
