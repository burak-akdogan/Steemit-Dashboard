const dsteem = require('dsteem');
const fs = require('fs');

const client = new dsteem.Client('https://api.steemit.com');

// Define the whale threshold
const WHALE_THRESHOLD = 100;  // Example: 100 STEEM/SBD per day

// Function to process transfers and check for whales
async function trackWhales() {
    const { head_block_number } = await client.database.getDynamicGlobalProperties();
    const endBlock = head_block_number;
    const startBlock = endBlock - 1000;  // Look at the last 1000 blocks

    const transfers = [];
    for (let blockNum = endBlock; blockNum >= startBlock; blockNum--) {
        try {
            const block = await client.database.getBlock(blockNum);
            if (block && block.transactions) {
                for (const tx of block.transactions) {
                    for (const op of tx.operations) {
                        if (op[0] === 'transfer') {
                            const { from, amount } = op[1];
                            if (amount.includes('STEEM') || amount.includes('SBD')) {
                                transfers.push({ from, amount });
                            }
                        }
                    }
                }
            }
        } catch (e) {
            console.error(`Error processing block ${blockNum}:`, e.message);
        }
    }

    // Aggregate by user
    const whaleData = transfers.reduce((acc, { from, amount }) => {
        const [value, currency] = amount.split(' ');
        if (!acc[from]) acc[from] = { STEEM: 0, SBD: 0 };
        acc[from][currency] += parseFloat(value);
        return acc;
    }, {});

    // Filter out the whales
    const whales = [];
    for (const [user, amounts] of Object.entries(whaleData)) {
        const total = amounts.STEEM + amounts.SBD;
        if (total >= WHALE_THRESHOLD) {
            whales.push({
                user,
                total_steem: amounts.STEEM.toFixed(2),
                total_sbd: amounts.SBD.toFixed(2),
            });
        }
    }

    // Save the whale data to a JSON file
    fs.writeFileSync('daily_whales.json', JSON.stringify(whales, null, 2));
    console.log('Whales for today:', whales);
}

// Schedule the whale tracking function
trackWhales();
