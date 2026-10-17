// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title PocketLM
/// @notice Public study log. A learner stamps the title, a SHA-256 fingerprint
///         of the document and a quiz score. The document text is never stored.
/// @dev The score is self-reported (the quiz is graded in the browser), so a
///      stamp proves "this wallet logged this result at this time", not mastery.
///      No tokens, no payments, no admin.
contract PocketLM {
    uint256 public constant MAX_TITLE_BYTES = 80;

    struct Study {
        address learner;
        string title;
        bytes32 docHash;
        uint8 score;
        uint8 total;
        uint64 at;
    }

    /// @dev Index 0 is a placeholder so real study ids start at 1.
    Study[] public studies;
    mapping(address => uint256[]) private byLearner;

    event StudyStamped(uint256 indexed id, address indexed learner, bytes32 docHash, uint8 score);

    error EmptyTitle();
    error TitleTooLong();
    error EmptyHash();
    error InvalidScore();
    error StudyNotFound();

    constructor() {
        studies.push(Study(address(0), "", bytes32(0), 0, 0, 0));
    }

    function stampStudy(
        string calldata title,
        bytes32 docHash,
        uint8 score,
        uint8 total
    ) external returns (uint256 id) {
        uint256 len = bytes(title).length;
        if (len == 0) revert EmptyTitle();
        if (len > MAX_TITLE_BYTES) revert TitleTooLong();
        if (docHash == bytes32(0)) revert EmptyHash();
        if (total == 0 || score > total) revert InvalidScore();

        id = studies.length;
        studies.push(Study(msg.sender, title, docHash, score, total, uint64(block.timestamp)));
        byLearner[msg.sender].push(id);

        emit StudyStamped(id, msg.sender, docHash, score);
    }

    function getStudy(uint256 id) external view returns (Study memory) {
        if (id == 0 || id >= studies.length) revert StudyNotFound();
        return studies[id];
    }

    function studiesOf(address learner) external view returns (uint256[] memory) {
        return byLearner[learner];
    }

    /// @notice Number of real studies stamped so far (ids run from 1 to this value).
    function totalStudies() external view returns (uint256) {
        return studies.length - 1;
    }
}
