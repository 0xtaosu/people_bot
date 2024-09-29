const express = require('express');
const session = require('express-session');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const axios = require('axios');
const cors = require('cors');
const TelegramBot = require('node-telegram-bot-api');

dotenv.config();
mongoose.set('strictQuery', false);

const app = express();
const PORT = process.env.PORT || 5000;
const ALT_PORT = 5001;

// User Model
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    telegramBotToken: { type: String },
    wallets: [{
        id: { type: String, required: true },
        name: { type: String, required: true },
        type: { type: String, required: true },
        address: { type: String, required: true }
    }]
});

// Transaction Model
const TransactionSchema = new mongoose.Schema({
    walletId: { type: String, required: true },
    pair: { type: String, required: true },
    type: { type: String, required: true },
    tradeId: { type: String, required: true },
    txPriceUsd: { type: String },
    swapHash: { type: String },
    state: { type: String },
});

UserSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

const User = mongoose.model('User', UserSchema);
const Transaction = mongoose.model('Transaction', TransactionSchema);

// Middleware
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));

app.use(express.json());
app.use(session({
    secret: process.env.SESSION_SECRET || 'your_fallback_secret',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV === 'production' }
}));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('MongoDB connection error:', err));

// Authentication Middleware
const auth = (req, res, next) => {
    if (req.session.userId) {
        next();
    } else {
        res.status(401).send({ error: 'Please log in.' });
    }
};

// Helper function to get wallet info from dbotx
async function getWalletInfo() {
    try {
        const response = await axios.get('https://api-bot-v1.dbotx.com/account/wallets?type=evm', {
            headers: { 'X-API-KEY': process.env.DBOTX_API_KEY }
        });
        console.log('Wallet info response:', JSON.stringify(response.data, null, 2));
        return response.data;
    } catch (error) {
        console.error('Error fetching wallet info:', error);
        throw error;
    }
}

// Helper function to update user's wallets in the database
async function updateUserWallets(userId) {
    try {
        const walletInfo = await getWalletInfo();
        console.log('Wallet info in updateUserWallets:', JSON.stringify(walletInfo, null, 2));

        let wallets = [];
        if (walletInfo.res && Array.isArray(walletInfo.res)) {
            wallets = walletInfo.res;
        } else {
            console.error('Unexpected wallet info structure:', typeof walletInfo);
            return [];
        }

        const user = await User.findById(userId);
        if (!user) {
            console.error('User not found:', userId);
            return [];
        }

        user.wallets = wallets.map(wallet => ({
            id: wallet.id,
            name: wallet.name || `Wallet ${wallet.address.slice(0, 6)}`,
            type: wallet.type,
            address: wallet.address
        }));
        await user.save();
        console.log('Updated user wallets:', JSON.stringify(user.wallets, null, 2));
        return user.wallets;
    } catch (error) {
        console.error('Error updating user wallets:', error);
        throw error;
    }
}

// Routes

// Register
app.post('/api/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = new User({ username, password });
        await user.save();
        res.status(201).send({ message: 'User registered successfully' });
    } catch (error) {
        res.status(400).send(error);
    }
});

// Login
app.post('/api/login', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.body.username });
        if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
            return res.status(401).send({ error: 'Login failed' });
        }
        req.session.userId = user._id;
        res.send({ message: 'Logged in successfully' });
    } catch (error) {
        res.status(400).send(error);
    }
});

// Logout
app.post('/api/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send({ error: 'Could not log out, please try again' });
        }
        res.send({ message: 'Logged out successfully' });
    });
});

// Import Wallet
app.post('/api/wallets/import', auth, async (req, res) => {
    try {
        await axios.post('https://api-bot-v1.dbotx.com/account/wallets', {
            type: 'evm',
            privateKeys: [req.body.privateKey]
        }, {
            headers: { 'X-API-KEY': process.env.DBOTX_API_KEY }
        });
        const updatedWallets = await updateUserWallets(req.session.userId);
        res.status(201).send(updatedWallets);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Delete Wallet
app.delete('/api/wallets/:id', auth, async (req, res) => {
    try {
        await axios.delete(`https://api-bot-v1.dbotx.com/account/wallet/${req.params.id}`, {
            headers: { 'X-API-KEY': process.env.DBOTX_API_KEY }
        });
        const updatedWallets = await updateUserWallets(req.session.userId);
        res.send(updatedWallets);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Get Wallets
app.get('/api/wallets', auth, async (req, res) => {
    try {
        const updatedWallets = await updateUserWallets(req.session.userId);
        res.send(updatedWallets);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Execute Trade (Fast Buy/Sell)
app.post('/api/trade', auth, async (req, res) => {
    try {
        const { walletId, pair, type, amountOrPercent, maxSlippage } = req.body;
        const response = await axios.post('https://api-bot-v1.dbotx.com/automation/swap_order', {
            chain: 'ethereum',
            walletId,
            pair,
            type,
            amountOrPercent,
            maxSlippage
        }, {
            headers: { 'X-API-KEY': process.env.DBOTX_API_KEY }
        });

        if (response.data.err === false && response.data.res && response.data.res.id) {
            const tradeId = response.data.res.id;

            // 创建新的交易记录
            const transaction = new Transaction({
                walletId,
                pair,
                type,
                tradeId
            });
            await transaction.save();

            // 获取交易详细信息
            await updateTransactionDetails(tradeId);

            res.send({ message: 'Trade executed successfully', tradeId });
        } else {
            throw new Error('Trade execution failed');
        }
    } catch (error) {
        res.status(500).send({ error: 'Trade execution failed: ' + error.message });
    }
});

// Update transaction details
async function updateTransactionDetails(tradeId) {
    try {
        const response = await axios.get(`https://api-bot-v1.dbotx.com/automation/swap_orders?ids=${tradeId}`, {
            headers: { 'X-API-KEY': process.env.DBOTX_API_KEY }
        });

        if (response.data.err === false && response.data.res && response.data.res.length > 0) {
            const orderInfo = response.data.res[0];
            await Transaction.findOneAndUpdate(
                { tradeId },
                {
                    txPriceUsd: orderInfo.txPriceUsd,
                    swapHash: orderInfo.swapHash,
                    state: orderInfo.state
                },
                { new: true }
            );
        }
    } catch (error) {
        console.error('Error updating transaction details:', error);
    }
}

// get transactions
app.get('/api/transactions', auth, async (req, res) => {
    try {
        const transactions = await Transaction.find({ walletId: req.query.walletId });
        res.send(transactions);
    } catch (error) {
        res.status(500).send({ error: 'Failed to fetch transactions: ' + error.message });
    }
});

// 新增：设置 Telegram 机器人 token
app.post('/api/set-telegram-token', auth, async (req, res) => {
    try {
        const { token } = req.body;
        const user = await User.findById(req.session.userId);
        user.telegramBotToken = token;
        await user.save();

        // 初始化用户的 Telegram 机器人
        initUserTelegramBot(user);

        res.send({ message: 'Telegram bot token set successfully' });
    } catch (error) {
        res.status(500).send({ error: 'Failed to set Telegram bot token: ' + error.message });
    }
});

// Telegram 机器人逻辑
const userBots = new Map();

function initUserTelegramBot(user) {
    if (userBots.has(user._id.toString())) {
        userBots.get(user._id.toString()).stop();
    }

    const bot = new TelegramBot(user.telegramBotToken, { polling: true });

    bot.onText(/\/start/, (msg) => {
        bot.sendMessage(msg.chat.id, 'Welcome to your trading bot! Use /help to see available commands.');
    });

    bot.onText(/\/help/, (msg) => {
        const helpMessage = `
Available commands:
/wallets - List your wallets
/import <private_key> <name> - Import a new wallet
/delete <wallet_id> - Delete a wallet
/trade <wallet_id> <pair> <type> <amount> - Execute a trade
/transactions <wallet_id> - Get transaction history
        `;
        bot.sendMessage(msg.chat.id, helpMessage);
    });

    bot.onText(/\/wallets/, async (msg) => {
        try {
            const wallets = await updateUserWallets(user._id);
            const walletList = wallets.map(w => `${w.name} (${w.address}) - ID: ${w.id}`).join('\n');
            bot.sendMessage(msg.chat.id, `Your wallets:\n${walletList}`);
        } catch (error) {
            bot.sendMessage(msg.chat.id, 'Failed to fetch wallets: ' + error.message);
        }
    });

    bot.onText(/\/import (.+) (.+)/, async (msg, match) => {
        try {
            const privateKey = match[1];
            const name = match[2];
            await axios.post('https://api-bot-v1.dbotx.com/account/wallets', {
                type: 'evm',
                privateKeys: [privateKey]
            }, {
                headers: { 'X-API-KEY': process.env.DBOTX_API_KEY }
            });
            const updatedWallets = await updateUserWallets(user._id);
            bot.sendMessage(msg.chat.id, 'Wallet imported successfully');
        } catch (error) {
            bot.sendMessage(msg.chat.id, 'Failed to import wallet: ' + error.message);
        }
    });

    bot.onText(/\/delete (.+)/, async (msg, match) => {
        try {
            const walletId = match[1];
            await axios.delete(`https://api-bot-v1.dbotx.com/account/wallet/${walletId}`, {
                headers: { 'X-API-KEY': process.env.DBOTX_API_KEY }
            });
            const updatedWallets = await updateUserWallets(user._id);
            bot.sendMessage(msg.chat.id, 'Wallet deleted successfully');
        } catch (error) {
            bot.sendMessage(msg.chat.id, 'Failed to delete wallet: ' + error.message);
        }
    });

    bot.onText(/\/trade (.+) (.+) (.+) (.+)/, async (msg, match) => {
        try {
            const [walletId, pair, type, amountOrPercent] = match.slice(1);
            const response = await axios.post('https://api-bot-v1.dbotx.com/automation/swap_order', {
                chain: 'ethereum',
                walletId,
                pair,
                type,
                amountOrPercent,
                maxSlippage: 1
            }, {
                headers: { 'X-API-KEY': process.env.DBOTX_API_KEY }
            });

            if (response.data.err === false && response.data.res && response.data.res.id) {
                const tradeId = response.data.res.id;
                const transaction = new Transaction({
                    walletId,
                    pair,
                    type,
                    tradeId
                });
                await transaction.save();
                await updateTransactionDetails(tradeId);
                bot.sendMessage(msg.chat.id, `Trade executed successfully. Trade ID: ${tradeId}`);
            } else {
                throw new Error('Trade execution failed');
            }
        } catch (error) {
            bot.sendMessage(msg.chat.id, 'Trade execution failed: ' + error.message);
        }
    });

    bot.onText(/\/transactions (.+)/, async (msg, match) => {
        try {
            const walletId = match[1];
            const transactions = await Transaction.find({ walletId });
            const transactionList = transactions.map(t =>
                `ID: ${t.tradeId}, Pair: ${t.pair}, Type: ${t.type}, State: ${t.state}`
            ).join('\n');
            bot.sendMessage(msg.chat.id, `Transactions for wallet ${walletId}:\n${transactionList}`);
        } catch (error) {
            bot.sendMessage(msg.chat.id, 'Failed to fetch transactions: ' + error.message);
        }
    });

    userBots.set(user._id.toString(), bot);
}

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    }).on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.log(`Port ${PORT} is already in use. Trying port ${ALT_PORT}`);
            app.listen(ALT_PORT, () => {
                console.log(`Server is running on port ${ALT_PORT}`);
            });
        } else {
            console.error('An error occurred:', err);
        }
    });
}

module.exports = app;