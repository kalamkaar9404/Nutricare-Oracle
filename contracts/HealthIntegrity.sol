// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * Health Integrity Contract
 * Stores cryptographic hashes of health insights for tamper-proof verification
 * Deployed on Polygon Amoy Testnet for low-cost, fast transactions
 * 
 * Validates: Requirements 7.2, 7.3
 */

contract HealthIntegrity {
    struct HashRecord {
        string dataHash;
        address owner;
        uint256 timestamp;
        bool exists;
    }
    
    // Mapping from hash to record
    mapping(string => HashRecord) private hashRecords;
    
    // Mapping from owner to their hashes
    mapping(address => string[]) private ownerHashes;
    
    // Events
    event HashStored(
        string indexed dataHash,
        address indexed owner,
        uint256 timestamp
    );
    
    event HashVerified(
        string indexed dataHash,
        address indexed verifier,
        bool isValid
    );
    
    /**
     * Store a health insight hash on blockchain
     * @param dataHash SHA-256 hash of health insight data
     * @return timestamp when hash was stored
     */
    function storeHash(string memory dataHash) public returns (uint256) {
        require(bytes(dataHash).length > 0, "Hash cannot be empty");
        require(!hashRecords[dataHash].exists, "Hash already exists");
        
        uint256 timestamp = block.timestamp;
        
        hashRecords[dataHash] = HashRecord({
            dataHash: dataHash,
            owner: msg.sender,
            timestamp: timestamp,
            exists: true
        });
        
        ownerHashes[msg.sender].push(dataHash);
        
        emit HashStored(dataHash, msg.sender, timestamp);
        
        return timestamp;
    }
    
    /**
     * Verify if a hash exists on blockchain
     * @param dataHash Hash to verify
     * @return exists Whether hash exists
     * @return timestamp When hash was stored (0 if not exists)
     */
    function verifyHash(string memory dataHash) 
        public 
        view 
        returns (bool exists, uint256 timestamp) 
    {
        HashRecord memory record = hashRecords[dataHash];
        return (record.exists, record.timestamp);
    }
    
    /**
     * Get hash record details
     * @param dataHash Hash to query
     * @return owner Address that stored the hash
     * @return timestamp When hash was stored
     * @return exists Whether hash exists
     */
    function getHashRecord(string memory dataHash)
        public
        view
        returns (address owner, uint256 timestamp, bool exists)
    {
        HashRecord memory record = hashRecords[dataHash];
        return (record.owner, record.timestamp, record.exists);
    }
    
    /**
     * Get all hashes stored by an address
     * @param owner Address to query
     * @return Array of hashes
     */
    function getOwnerHashes(address owner) 
        public 
        view 
        returns (string[] memory) 
    {
        return ownerHashes[owner];
    }
    
    /**
     * Get timestamp when hash was stored
     * @param dataHash Hash to query
     * @return timestamp (0 if not exists)
     */
    function getHashTimestamp(string memory dataHash) 
        public 
        view 
        returns (uint256) 
    {
        return hashRecords[dataHash].timestamp;
    }
    
    /**
     * Verify hash and emit event
     * @param dataHash Hash to verify
     * @return isValid Whether hash exists on blockchain
     */
    function verifyAndLog(string memory dataHash) 
        public 
        returns (bool isValid) 
    {
        isValid = hashRecords[dataHash].exists;
        emit HashVerified(dataHash, msg.sender, isValid);
        return isValid;
    }
}
