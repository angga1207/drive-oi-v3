// Test script to check getFolders endpoint
// Run with: node test-getfolders.js

// Token dari log terminal (bisa expired, ganti dengan token terbaru)
// const token = "788|goGanyPKEFjhDf1WvuGGL0C6MDYOEXGtfcbomHV7bd243ec5";
const token = "2756|ScmAPI6SxKHliO3AaropYqDPwN1ZjKLCybCUhYO3618e419a";

async function testGetFolders() {
    console.log("🔍 Testing getFolders endpoint...\n");
    
    // Test 1: Get root folders
    console.log("📁 Test 1: Get folders at root (slug=0)");
    try {
        const response = await fetch("http://127.0.0.1:8000/api/getFolders?slug=0", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Accept": "application/json",
                "Content-Type": "application/json",
            }
        });
        
        console.log("Status:", response.status);
        console.log("Content-Type:", response.headers.get("content-type"));
        
        const data = await response.json();
        console.log("Response:", JSON.stringify(data, null, 2));
        console.log("");
    } catch (error) {
        console.error("❌ Error:", error.message);
        console.log("");
    }
    
    // Test 2: Get folders with excludeIds
    console.log("📁 Test 2: Get folders with excludeIds");
    try {
        const response = await fetch("http://127.0.0.1:8000/api/getFolders?slug=0&excludeIds[]=abc123&excludeIds[]=xyz789", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Accept": "application/json",
                "Content-Type": "application/json",
            }
        });
        
        console.log("Status:", response.status);
        console.log("Content-Type:", response.headers.get("content-type"));
        
        const data = await response.json();
        console.log("Response:", JSON.stringify(data, null, 2));
        console.log("");
    } catch (error) {
        console.error("❌ Error:", error.message);
        console.log("");
    }
}

testGetFolders();
