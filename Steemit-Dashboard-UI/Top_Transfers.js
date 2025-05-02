const dsteem = require('dsteem');
const fs = require('fs');

// Steem client
const client = new dsteem.Client('https://api.steemit.com');

// 1 day = 28800 blocks (but original was 14400, likely a mistake; keeping as is)
const BLOCKS_PER_DAY = 14400;


// Helper: Function to calculate transfer totals
function calculateTotals(transfers) {
    const totals = {};

    for (const { from, amount } of transfers) {
        const [value, currency] = amount.split(' ');
        if (!['STEEM', 'SBD'].includes(currency)) continue;

        if (!totals[from]) totals[from] = { STEEM: 0, SBD: 0 };
        totals[from][currency] += parseFloat(value);
    }

    // Convert to array format suitable for JSON
    return Object.entries(totals).map(([user, amounts]) => ({
        user,
        total_steem: amounts.STEEM.toFixed(3),
        total_sbd: amounts.SBD.toFixed(3)
    }));
}

// Save as JSON
function saveToFile(filename, data) {
    fs.writeFileSync(filename, JSON.stringify(data, null, 2));
    console.log(`✅ ${filename} saved.`);
}

// Main function
async function main() {
    const { head_block_number } = await client.database.getDynamicGlobalProperties();
    const endBlock = head_block_number;
    const startBlock = endBlock - BLOCKS_PER_DAY;

    const transfers = [];

    console.log(`Scanning blocks from ${startBlock} to ${endBlock}...`);

    for (let blockNum = endBlock; blockNum >= startBlock; blockNum--) {
        try {
            const block = await client.database.getBlock(blockNum);
            if (!block || !block.transactions) continue;

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
        } catch (e) {
            console.error(`Block ${blockNum} error:`, e.message);
        }

        // Optional: Wait a bit to avoid overloading the API
        if (blockNum % 100 === 0) {
            console.log(`Scanned block ${blockNum}`);
            await new Promise(res => setTimeout(res, 100));
        }
    }

    const summary = calculateTotals(transfers);
    saveToFile('daily_transfer_summary.json', summary);
}

main();
