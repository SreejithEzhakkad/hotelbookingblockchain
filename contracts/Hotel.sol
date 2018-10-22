pragma solidity ^0.4.2;

/**
 * The Hotel contract does this and that...
 */
contract Hotel {

    struct Room {

        uint id;
        string name;
        string hotel_name;
        uint price;
        string status;
    }

    // mapping acts as a associative array of key => value , here key is unsigned 
    // int and value is structure
    mapping (uint => Room) public rooms;
    
    // Store hotel count - we cannot iterate or find size in mapping
    uint public roomsCount;

    // Amount is send to owners address , owner will auto set to the deployed one
    address owner;
    // Constructor called when contract is deployed or migrated
    function Hotel () public {

        // Set the contract creater as the owner
        owner = msg.sender;
        
        addRoom("Room 1");
        addRoom("Room 2");
        addRoom("Room 3");
    }

    function addRoom(string _name) private {

        roomsCount++;
        rooms[roomsCount] = Room(roomsCount,_name,'Hotel 1',1 ether,'available');
    }

    function bookRoom(uint _roomId) payable public {

        // Check that the room is a valid
        require (_roomId > 0 && _roomId <= roomsCount);

        // Check if room is available
        require (compareStrings(rooms[_roomId].status,"available"));

        // Check if amount is equal to the price of the room
        if(msg.value != 1000000000000000000)
        {
            // Throw exception
            throw;
        }
        
        owner.transfer(msg.value);
        // change the status of the room
        rooms[_roomId].status = "Not available";
    }

    function compareStrings (string a, string b) view returns (bool){
       return keccak256(a) == keccak256(b);
   }   
}