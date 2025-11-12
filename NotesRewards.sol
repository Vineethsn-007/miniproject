// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract NotesReward {
    uint public rewardAmount = 0.0001 ether;
    address public owner;

    struct Note {
        address uploader;
        string filename;
        string ipfsHash;
        uint likes;
        uint dislikes;
    }

    Note[] public notes;

    event NoteUploaded(address indexed uploader, string filename, string ipfsHash, uint noteId);

    constructor() payable {
        owner = msg.sender;
    }

    function uploadNote(string calldata filename, string calldata ipfsHash) external {
        require(bytes(ipfsHash).length > 0, "IPFS hash required");
        require(bytes(filename).length > 0, "Filename required");
        notes.push(Note(msg.sender, filename, ipfsHash, 0, 0));
        payable(msg.sender).transfer(rewardAmount);
        emit NoteUploaded(msg.sender, filename, ipfsHash, notes.length - 1);
    }

    function likeNote(uint noteId) external {
        require(noteId < notes.length, "Invalid noteId");
        notes[noteId].likes += 1;
    }

    function dislikeNote(uint noteId) external {
        require(noteId < notes.length, "Invalid noteId");
        notes[noteId].dislikes += 1;
    }

    function getNote(uint noteId) public view returns (address, string memory, string memory, uint, uint) {
        Note storage n = notes[noteId];
        return (n.uploader, n.filename, n.ipfsHash, n.likes, n.dislikes);
    }

    function getNotesCount() public view returns (uint) {
        return notes.length;
    }

    receive() external payable {}
}
//10,000,000,000,000,000