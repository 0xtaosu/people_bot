import React, { useState, useEffect } from 'react';
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5001/api',
    withCredentials: true
});

function App() {
    const [user, setUser] = useState(null);
    const [bots, setBots] = useState([]);
    const [balance, setBalance] = useState(null);

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [botName, setBotName] = useState('');
    const [tradePair, setTradePair] = useState('');
    const [tradeAmount, setTradeAmount] = useState('');
    const [tradeType, setTradeType] = useState('buy');
    const [ethAddress, setEthAddress] = useState('');

    useEffect(() => {
        if (user) {
            fetchBots();
        }
    }, [user]);

    useEffect(() => {
        // 防止 MutationObserver 错误
        const observer = new MutationObserver(() => { });
        if (document.body) {
            observer.observe(document.body, { childList: true, subtree: true });
        }
        return () => observer.disconnect();
    }, []);

    const register = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/register', { username, password });
            alert(response.data.message);
        } catch (error) {
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                alert('Registration failed: ' + error.response.data.error);
            } else if (error.request) {
                // The request was made but no response was received
                alert('No response received from server');
            } else {
                // Something happened in setting up the request that triggered an Error
                alert('Error: ' + error.message);
            }
        }
    };

    const login = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/login', { username, password });
            setUser(username);
            alert(response.data.message);
        } catch (error) {
            alert('Login failed: ' + error.response.data.error);
        }
    };

    const logout = async () => {
        try {
            const response = await api.post('/logout');
            setUser(null);
            setBots([]);
            setBalance(null);
            alert(response.data.message);
        } catch (error) {
            alert('Logout failed: ' + error.response.data.error);
        }
    };

    const fetchBots = async () => {
        try {
            const response = await api.get('/bots');
            setBots(response.data);
        } catch (error) {
            alert('Failed to fetch bots: ' + error.response.data.error);
        }
    };

    const createBot = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/bots', { name: botName, config: {} });
            fetchBots();
            setBotName('');
            alert('Bot created successfully');
        } catch (error) {
            alert('Failed to create bot: ' + error.response.data.error);
        }
    };

    const executeTrade = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/trade', { pair: tradePair, amount: tradeAmount, type: tradeType });
            alert('Trade executed successfully');
        } catch (error) {
            alert('Trade execution failed: ' + error.response.data.error);
        }
    };

    const getBalance = async (e) => {
        e.preventDefault();
        try {
            const response = await api.get(`/balance/${ethAddress}`);
            setBalance(response.data.balance);
        } catch (error) {
            alert('Failed to fetch balance: ' + error.response.data.error);
        }
    };

    if (!user) {
        return (
            <div>
                <h1>People Bot</h1>
                <form onSubmit={register}>
                    <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
                    <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                    <button type="submit">Register</button>
                </form>
                <form onSubmit={login}>
                    <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
                    <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                    <button type="submit">Login</button>
                </form>
            </div>
        );
    }

    return (
        <div>
            <h1>Welcome, {user}</h1>
            <button onClick={logout}>Logout</button>

            <h2>Your Bots</h2>
            <ul>
                {bots.map(bot => (
                    <li key={bot._id}>{bot.name}</li>
                ))}
            </ul>

            <form onSubmit={createBot}>
                <input type="text" placeholder="Bot Name" value={botName} onChange={(e) => setBotName(e.target.value)} />
                <button type="submit">Create Bot</button>
            </form>

            <h2>Execute Trade</h2>
            <form onSubmit={executeTrade}>
                <input type="text" placeholder="Trade Pair" value={tradePair} onChange={(e) => setTradePair(e.target.value)} />
                <input type="number" placeholder="Amount" value={tradeAmount} onChange={(e) => setTradeAmount(e.target.value)} />
                <select value={tradeType} onChange={(e) => setTradeType(e.target.value)}>
                    <option value="buy">Buy</option>
                    <option value="sell">Sell</option>
                </select>
                <button type="submit">Execute Trade</button>
            </form>

            <h2>ETH Balance</h2>
            <form onSubmit={getBalance}>
                <input type="text" placeholder="ETH Address" value={ethAddress} onChange={(e) => setEthAddress(e.target.value)} />
                <button type="submit">Get Balance</button>
            </form>
            {balance && <p>Balance: {balance} ETH</p>}
        </div>
    );
}

export default App;