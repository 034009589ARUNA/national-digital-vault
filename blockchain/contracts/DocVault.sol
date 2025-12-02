// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract DocVault {
    // Document structure
    struct Document {
        bytes32 hash;
        address owner;
        uint256 timestamp;
        bool isVerified;
        uint8 approvalCount;
        uint8 requiredApprovals;
        mapping(address => bool) approvers;
    }
    
    // Role management
    enum Role { Citizen, GovernmentOfficer, Institution, Auditor, Admin }
    mapping(address => Role) public userRoles;
    mapping(address => bool) public isAuthorized;
    
    // Document mappings
    mapping(bytes32 => Document) public documents;
    mapping(address => bytes32[]) public userHashes;
    bytes32[] public allHashes;
    
    // Multi-signature approvals
    mapping(bytes32 => address[]) public documentApprovers;
    mapping(bytes32 => mapping(address => bool)) public hasApproved;
    
    // Audit log structure
    struct AuditLog {
        bytes32 documentHash;
        address actor;
        string action;
        uint256 timestamp;
        bytes32 ipHash; // Hashed IP address for privacy
    }
    
    AuditLog[] public auditLogs;
    
    // Events
    event DocumentStored(address indexed user, bytes32 indexed hash, uint256 timestamp);
    event DocumentApproved(bytes32 indexed hash, address indexed approver, uint8 approvalCount, uint8 requiredApprovals);
    event DocumentVerified(bytes32 indexed hash, bool verified);
    event AuditLogged(bytes32 indexed documentHash, address indexed actor, string action, uint256 timestamp);
    event RoleAssigned(address indexed user, Role role);
    
    // Modifiers
    modifier onlyAuthorized() {
        require(isAuthorized[msg.sender] || userRoles[msg.sender] != Role.Citizen, "Not authorized");
        _;
    }
    
    modifier onlyAdmin() {
        require(userRoles[msg.sender] == Role.Admin, "Only admin");
        _;
    }
    
    constructor() {
        // Deployer is admin
        userRoles[msg.sender] = Role.Admin;
        isAuthorized[msg.sender] = true;
    }
    
    /**
     * @dev Assign role to user (Admin only)
     */
    function assignRole(address user, Role role) public onlyAdmin {
        userRoles[user] = role;
        isAuthorized[user] = (role != Role.Citizen);
        emit RoleAssigned(user, role);
    }
    
    /**
     * @dev Store a document hash for a user
     * @param hash The SHA-256 hash of the document
     * @param requiredApprovals Number of required approvals for verification
     */
    function storeDocumentHash(bytes32 hash, uint8 requiredApprovals) public {
        require(hash != bytes32(0), "Hash cannot be zero");
        require(documents[hash].hash == bytes32(0), "Document hash already exists");
        
        Document storage doc = documents[hash];
        doc.hash = hash;
        doc.owner = msg.sender;
        doc.timestamp = block.timestamp;
        doc.isVerified = false;
        doc.requiredApprovals = requiredApprovals;
        doc.approvalCount = 0;
        
        userHashes[msg.sender].push(hash);
        allHashes.push(hash);
        
        // Log audit
        _logAudit(hash, msg.sender, "UPLOAD", "");
        
        emit DocumentStored(msg.sender, hash, block.timestamp);
    }
    
    /**
     * @dev Approve a document (Government Officer/Institution only)
     * @param hash The document hash to approve
     */
    function approveDocument(bytes32 hash) public onlyAuthorized {
        require(documents[hash].hash != bytes32(0), "Document does not exist");
        require(!hasApproved[hash][msg.sender], "Already approved");
        require(!documents[hash].isVerified, "Document already verified");
        
        Document storage doc = documents[hash];
        doc.approvers[msg.sender] = true;
        doc.approvalCount++;
        hasApproved[hash][msg.sender] = true;
        documentApprovers[hash].push(msg.sender);
        
        // Check if threshold reached
        if (doc.approvalCount >= doc.requiredApprovals) {
            doc.isVerified = true;
            emit DocumentVerified(hash, true);
        }
        
        // Log audit
        _logAudit(hash, msg.sender, "APPROVE", "");
        
        emit DocumentApproved(hash, msg.sender, doc.approvalCount, doc.requiredApprovals);
    }
    
    /**
     * @dev Verify if a document hash exists and is verified
     * @param hash The hash to verify
     * @return exists true if hash exists
     * @return verified true if document is verified
     */
    function verifyDocument(bytes32 hash) public view returns (bool exists, bool verified) {
        exists = documents[hash].hash != bytes32(0);
        verified = documents[hash].isVerified;
    }
    
    /**
     * @dev Get document details
     */
    function getDocument(bytes32 hash) public view returns (
        address owner,
        uint256 timestamp,
        bool isVerified,
        uint8 approvalCount,
        uint8 requiredApprovals
    ) {
        Document storage doc = documents[hash];
        require(doc.hash != bytes32(0), "Document does not exist");
        return (
            doc.owner,
            doc.timestamp,
            doc.isVerified,
            doc.approvalCount,
            doc.requiredApprovals
        );
    }
    
    /**
     * @dev Get all document hashes for a user
     */
    function getDocumentHashes(address user) public view returns (bytes32[] memory) {
        return userHashes[user];
    }
    
    /**
     * @dev Get all document hashes (for public registry)
     */
    function getAllHashes() public view returns (bytes32[] memory) {
        return allHashes;
    }
    
    /**
     * @dev Get approvers for a document
     */
    function getDocumentApprovers(bytes32 hash) public view returns (address[] memory) {
        return documentApprovers[hash];
    }
    
    /**
     * @dev Internal function to log audit events
     */
    function _logAudit(bytes32 documentHash, address actor, string memory action, bytes32 ipHash) internal {
        auditLogs.push(AuditLog({
            documentHash: documentHash,
            actor: actor,
            action: action,
            timestamp: block.timestamp,
            ipHash: ipHash
        }));
        emit AuditLogged(documentHash, actor, action, block.timestamp);
    }
    
    /**
     * @dev Log audit entry (can be called by backend with IP hash)
     */
    function logAudit(bytes32 documentHash, string memory action, bytes32 ipHash) public {
        _logAudit(documentHash, msg.sender, action, ipHash);
    }
    
    /**
     * @dev Get audit log count
     */
    function getAuditLogCount() public view returns (uint256) {
        return auditLogs.length;
    }
    
    /**
     * @dev Get audit log at index
     */
    function getAuditLog(uint256 index) public view returns (
        bytes32 documentHash,
        address actor,
        string memory action,
        uint256 timestamp,
        bytes32 ipHash
    ) {
        require(index < auditLogs.length, "Index out of bounds");
        AuditLog storage log = auditLogs[index];
        return (log.documentHash, log.actor, log.action, log.timestamp, log.ipHash);
    }
}

