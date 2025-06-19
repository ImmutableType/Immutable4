const { ethers } = require("hardhat");

async function main() {
    console.log("Testing BookmarkContract...");
    
    const [deployer] = await ethers.getSigners();
    console.log("Testing with account:", deployer.address);

    // Contract address from deployment
    const BOOKMARK_CONTRACT_ADDRESS = "0x66f856f960AEF5011FdCc7383B9F81d2515930c9";
    
    // Get contract instance
    const BookmarkContract = await ethers.getContractFactory("BookmarkContract");
    const bookmarkContract = BookmarkContract.attach(BOOKMARK_CONTRACT_ADDRESS);
    
    console.log("\n=== Testing Contract Info ===");
    const contractInfo = await bookmarkContract.getContractInfo();
    console.log("Profile NFT:", contractInfo[0]);
    console.log("Treasury:", contractInfo[1]);
    console.log("Fee:", ethers.formatEther(contractInfo[2]), "FLOW");
    
    // Test data
    const testContentId = "test-article-123";
    const contentType = 0; // ARTICLE enum value
    const bookmarkFee = await bookmarkContract.getBookmarkFee();
    
    console.log("\n=== Initial State ===");
    const initialBookmarkCount = await bookmarkContract.getUserBookmarkCount(deployer.address);
    console.log("Initial bookmark count:", initialBookmarkCount.toString());
    
    const isInitiallyBookmarked = await bookmarkContract.isBookmarked(
        deployer.address, 
        testContentId, 
        contentType
    );
    console.log("Initially bookmarked:", isInitiallyBookmarked);
    
    console.log("\n=== Testing Add Bookmark ===");
    try {
        // Add bookmark with exact fee
        const addTx = await bookmarkContract.addBookmark(
            testContentId,
            contentType,
            { value: bookmarkFee }
        );
        
        console.log("Add bookmark transaction hash:", addTx.hash);
        const addReceipt = await addTx.wait();
        console.log("Add bookmark gas used:", addReceipt.gasUsed.toString());
        
        // Check events
        const addEvent = addReceipt.logs.find(log => {
            try {
                const parsed = bookmarkContract.interface.parseLog(log);
                return parsed.name === "BookmarkAdded";
            } catch (e) {
                return false;
            }
        });
        
        if (addEvent) {
            const parsed = bookmarkContract.interface.parseLog(addEvent);
            console.log("BookmarkAdded event:", {
                user: parsed.args.user,
                contentId: parsed.args.contentId,
                contentType: parsed.args.contentType.toString(),
                timestamp: parsed.args.timestamp.toString()
            });
        }
        
    } catch (error) {
        console.log("Add bookmark failed:", error.message);
    }
    
    console.log("\n=== Checking State After Add ===");
    const afterAddBookmarkCount = await bookmarkContract.getUserBookmarkCount(deployer.address);
    console.log("Bookmark count after add:", afterAddBookmarkCount.toString());
    
    const isNowBookmarked = await bookmarkContract.isBookmarked(
        deployer.address, 
        testContentId, 
        contentType
    );
    console.log("Now bookmarked:", isNowBookmarked);
    
    const contentBookmarkCount = await bookmarkContract.getContentBookmarkCount(
        testContentId,
        contentType
    );
    console.log("Content bookmark count:", contentBookmarkCount.toString());
    
    // Get user bookmarks
    const userBookmarks = await bookmarkContract.getUserBookmarks(deployer.address);
    console.log("User bookmarks:", userBookmarks.length);
    if (userBookmarks.length > 0) {
        console.log("First bookmark:", {
            contentId: userBookmarks[0].contentId,
            contentType: userBookmarks[0].contentType.toString(),
            timestamp: userBookmarks[0].timestamp.toString(),
            isActive: userBookmarks[0].isActive
        });
    }
    
    console.log("\n=== Testing Remove Bookmark ===");
    try {
        // Remove bookmark with exact fee
        const removeTx = await bookmarkContract.removeBookmark(
            testContentId,
            contentType,
            { value: bookmarkFee }
        );
        
        console.log("Remove bookmark transaction hash:", removeTx.hash);
        const removeReceipt = await removeTx.wait();
        console.log("Remove bookmark gas used:", removeReceipt.gasUsed.toString());
        
        // Check events
        const removeEvent = removeReceipt.logs.find(log => {
            try {
                const parsed = bookmarkContract.interface.parseLog(log);
                return parsed.name === "BookmarkRemoved";
            } catch (e) {
                return false;
            }
        });
        
        if (removeEvent) {
            const parsed = bookmarkContract.interface.parseLog(removeEvent);
            console.log("BookmarkRemoved event:", {
                user: parsed.args.user,
                contentId: parsed.args.contentId,
                contentType: parsed.args.contentType.toString(),
                timestamp: parsed.args.timestamp.toString()
            });
        }
        
    } catch (error) {
        console.log("Remove bookmark failed:", error.message);
    }
    
    console.log("\n=== Final State ===");
    const finalBookmarkCount = await bookmarkContract.getUserBookmarkCount(deployer.address);
    console.log("Final bookmark count:", finalBookmarkCount.toString());
    
    const isFinallyBookmarked = await bookmarkContract.isBookmarked(
        deployer.address, 
        testContentId, 
        contentType
    );
    console.log("Finally bookmarked:", isFinallyBookmarked);
    
    const finalContentBookmarkCount = await bookmarkContract.getContentBookmarkCount(
        testContentId,
        contentType
    );
    console.log("Final content bookmark count:", finalContentBookmarkCount.toString());
    
    console.log("\n=== Testing Error Cases ===");
    
    // Test insufficient fee
    try {
        await bookmarkContract.addBookmark(
            "test-article-456",
            contentType,
            { value: ethers.parseEther("0.0005") } // Half the required fee
        );
        console.log("ERROR: Should have failed with insufficient fee");
    } catch (error) {
        console.log("✅ Correctly rejected insufficient fee:", error.message.split('(')[0]);
    }
    
    // Test empty content ID
    try {
        await bookmarkContract.addBookmark(
            "",
            contentType,
            { value: bookmarkFee }
        );
        console.log("ERROR: Should have failed with empty content ID");
    } catch (error) {
        console.log("✅ Correctly rejected empty content ID:", error.message.split('(')[0]);
    }
    
    // Test invalid content type
    try {
        await bookmarkContract.addBookmark(
            "test-article-789",
            5, // Invalid content type
            { value: bookmarkFee }
        );
        console.log("ERROR: Should have failed with invalid content type");
    } catch (error) {
        console.log("✅ Correctly rejected invalid content type:", error.message.split('(')[0]);
    }
    
    console.log("\n=== Test Complete ===");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });