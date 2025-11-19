import Web3 from 'web3';

const web3 = new Web3(window.ethereum);

const contractAddress = '0xd7EA1A8C72000007f7474b6784813441680e842D'; // Replace with your deployed contract address

const contractABI = [
  {
    
      
        "inputs": [
          {
            "internalType": "uint256",
            "name": "noteId",
            "type": "uint256"
          }
        ],
        "name": "dislikeNote",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "noteId",
            "type": "uint256"
          }
        ],
        "name": "likeNote",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "stateMutability": "payable",
        "type": "constructor"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "uploader",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "string",
            "name": "filename",
            "type": "string"
          },
          {
            "indexed": false,
            "internalType": "string",
            "name": "ipfsHash",
            "type": "string"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "noteId",
            "type": "uint256"
          }
        ],
        "name": "NoteUploaded",
        "type": "event"
      },
      {
        "inputs": [
          {
            "internalType": "string",
            "name": "filename",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "ipfsHash",
            "type": "string"
          }
        ],
        "name": "uploadNote",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "stateMutability": "payable",
        "type": "receive"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "noteId",
            "type": "uint256"
          }
        ],
        "name": "getNote",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          },
          {
            "internalType": "string",
            "name": "",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "getNotesCount",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "name": "notes",
        "outputs": [
          {
            "internalType": "address",
            "name": "uploader",
            "type": "address"
          },
          {
            "internalType": "string",
            "name": "filename",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "ipfsHash",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "likes",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "dislikes",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "owner",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "rewardAmount",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      }
    
];

const notesReward = new web3.eth.Contract(contractABI, contractAddress);

export default notesReward;
