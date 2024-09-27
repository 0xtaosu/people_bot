const express = require('express');
const session = require('express-session');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const axios = require('axios');
const Web3 = require('web3');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(session({
    secret: process.env.SESSION_SECRET,
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

// User Model
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});

UserSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

const User = mongoose.model('User', UserSchema);

// Bot Model
const BotSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: true },
    config: { type: Object, required: true },
});

const Bot = mongoose.model('Bot', BotSchema);

// Authentication Middleware
const auth = (req, res, next) => {
    if (req.session.userId) {
        next();
    } else {
        res.status(401).send({ error: 'Please log in.' });
    }
};

// Routes

// Register
app.post('/api/register', async (req, res) => {
    try {
        const user = new User(req.body);
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

// Create Bot
app.post('/api/bots', auth, async (req, res) => {
    try {
        const bot = new Bot({
            userId: req.session.userId,
            name: req.body.name,
            config: req.body.config
        });
        await bot.save();
        res.status(201).send(bot);
    } catch (error) {
        res.status(400).send(error);
    }
});

// Get Bots
app.get('/api/bots', auth, async (req, res) => {
    try {
        const bots = await Bot.find({ userId: req.session.userId });
        res.send(bots);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Execute Trade
app.post('/api/trade', auth, async (req, res) => {
    try {
        const { pair, amount, type } = req.body;
        const response = await axios.post('https://api.dbotx.com/trade', {
            pair,
            amount,
            type
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.DBOTX_API_KEY}`
            }
        });
        res.send(response.data);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Get ETH Balance
app.get('/api/balance/:address', auth, async (req, res) => {
    try {
        const web3 = new Web3(`https://mainnet.infura.io/v3/${process.env.INFURA_PROJECT_ID}`);
        const balance = await web3.eth.getBalance(req.params.address);
        res.send({ balance: web3.utils.fromWei(balance, 'ether') });
    } catch (error) {
        res.status(500).send(error);
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});