import React, { useState, useEffect } from 'react';
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5001/api',
    withCredentials: true
});

function TransactionHistory({ walletId }) {
    const [transactions, setTransactions] = useState([]);

    useEffect(() => {
        if (walletId) {
            fetchTransactions(walletId);
        }
    }, [walletId]);

    const fetchTransactions = async (walletId) => {
        try {
            const response = await api.get(`/transactions?walletId=${walletId}`);
            setTransactions(response.data);
        } catch (error) {
            console.error('Failed to fetch transactions:', error);
        }
    };

    return (
        <div>
            <h3>Transaction History</h3>
            <table>
                <thead>
                    <tr>
                        <th>Trade ID</th>
                        <th>Pair</th>
                        <th>Type</th>
                        <th>Price (USD)</th>
                        <th>Swap Hash</th>
                        <th>State</th>
                    </tr>
                </thead>
                <tbody>
                    {transactions.map(tx => (
                        <tr key={tx.tradeId}>
                            <td>{tx.tradeId}</td>
                            <td>{tx.pair}</td>
                            <td>{tx.type}</td>
                            <td>{tx.txPriceUsd}</td>
                            <td>{tx.swapHash}</td>
                            <td>{tx.state}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function App() {
    const [user, setUser] = useState(null);
    const [wallets, setWallets] = useState([]);
    const [balance, setBalance] = useState(null);
    const [selectedWalletId, setSelectedWalletId] = useState('');

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [walletName, setWalletName] = useState('');
    const [privateKey, setPrivateKey] = useState('');
    const [tradePair, setTradePair] = useState('');
    const [tradeAmount, setTradeAmount] = useState('');
    const [tradeType, setTradeType] = useState('buy');
    const [telegramBotToken, setTelegramBotToken] = useState('');
    const [dbotxApiKey, setDbotxApiKey] = useState('');

    useEffect(() => {
        if (user) {
            fetchWallets();
        }
    }, [user]);

    const register = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/register', { username, password });
            alert(response.data.message);
        } catch (error) {
            alert('Registration failed: ' + (error.response?.data?.error || error.message));
        }
    };

    const login = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/login', { username, password });
            setUser(username);
            alert(response.data.message);
        } catch (error) {
            alert('Login failed: ' + (error.response?.data?.error || error.message));
        }
    };

    const logout = async () => {
        try {
            const response = await api.post('/logout');
            setUser(null);
            setWallets([]);
            setBalance(null);
            alert(response.data.message);
        } catch (error) {
            alert('Logout failed: ' + (error.response?.data?.error || error.message));
        }
    };

    const fetchWallets = async () => {
        try {
            const response = await api.get('/wallets');
            setWallets(response.data);
        } catch (error) {
            alert('Failed to fetch wallets: ' + (error.response?.data?.error || error.message));
        }
    };

    const importWallet = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/wallets/import', { privateKey, name: walletName });
            setWallets(response.data);
            setPrivateKey('');
            setWalletName('');
            alert('Wallet imported successfully');
        } catch (error) {
            alert('Failed to import wallet: ' + (error.response?.data?.error || error.message));
        }
    };

    const deleteWallet = async (id) => {
        try {
            const response = await api.delete(`/wallets/${id}`);
            setWallets(response.data);
            alert('Wallet deleted successfully');
        } catch (error) {
            alert('Failed to delete wallet: ' + (error.response?.data?.error || error.message));
        }
    };

    const executeTrade = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/trade', {
                walletId: selectedWalletId,
                pair: tradePair,
                type: tradeType,
                amountOrPercent: tradeAmount,
                maxSlippage: 1 // You might want to make this configurable
            });
            alert('Trade executed successfully');
            // Refresh the transaction history after a successful trade
            setSelectedWalletId(prevId => {
                // This will trigger a re-render of TransactionHistory
                return prevId;
            });
        } catch (error) {
            alert('Trade execution failed: ' + (error.response?.data?.error || error.message));
        }
    };

    const setTelegramToken = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/set-telegram-token', { token: telegramBotToken });
            alert(response.data.message);
            setTelegramBotToken('');
        } catch (error) {
            alert('Failed to set Telegram bot token: ' + (error.response?.data?.error || error.message));
        }
    };

    const setDbotxApiKeyHandler = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/set-dbotx-api-key', { apiKey: dbotxApiKey });
            alert(response.data.message);
            setDbotxApiKey('');
        } catch (error) {
            alert('Failed to set DBOTX API key: ' + (error.response?.data?.error || error.message));
        }
    };

    if (!user) {
        return (
            <div>
                <h1>People Bot</h1>
                <form>
                    <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
                    <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                    <div>
                        <button type="button" onClick={register}>Register</button>
                        <button type="button" onClick={login}>Login</button>
                    </div>
                </form>
            </div>
        );
    }

    return (
        <div>
            <h1>Welcome, {user}</h1>
            <button onClick={logout}>Logout</button>

            <h2>Set Telegram Bot Token</h2>
            <form onSubmit={setTelegramToken}>
                <input
                    type="text"
                    placeholder="Telegram Bot Token"
                    value={telegramBotToken}
                    onChange={(e) => setTelegramBotToken(e.target.value)}
                />
                <button type="submit">Set Token</button>
            </form>

            <h2>Set DBOTX API Key</h2>
            <form onSubmit={setDbotxApiKeyHandler}>
                <input
                    type="text"
                    placeholder="DBOTX API Key"
                    value={dbotxApiKey}
                    onChange={(e) => setDbotxApiKey(e.target.value)}
                />
                <button type="submit">Set DBOTX API Key</button>
            </form>

            <h2>Your Wallets</h2>
            <ul>
                {wallets.map(wallet => (
                    <li key={wallet.id}>
                        {wallet.name} ({wallet.address}) - Type: {wallet.type}
                        <button onClick={() => deleteWallet(wallet.id)}>Delete</button>
                    </li>
                ))}
            </ul>

            <form onSubmit={importWallet}>
                <input type="text" placeholder="Private Key" value={privateKey} onChange={(e) => setPrivateKey(e.target.value)} />
                <input type="text" placeholder="Wallet Name" value={walletName} onChange={(e) => setWalletName(e.target.value)} />
                <button type="submit">Import Wallet</button>
            </form>

            <h2>Execute Trade</h2>
            <form onSubmit={executeTrade}>
                <select value={selectedWalletId} onChange={(e) => setSelectedWalletId(e.target.value)}>
                    <option value="">Select Wallet</option>
                    {wallets.map(wallet => (
                        <option key={wallet.id} value={wallet.id}>{wallet.name}</option>
                    ))}
                </select>
                <input type="text" placeholder="Token Address" value={tradePair} onChange={(e) => setTradePair(e.target.value)} />
                <input type="number" placeholder="Amount" value={tradeAmount} onChange={(e) => setTradeAmount(e.target.value)} />
                <select value={tradeType} onChange={(e) => setTradeType(e.target.value)}>
                    <option value="buy">Buy</option>
                    <option value="sell">Sell</option>
                </select>
                <button type="submit">Execute Trade</button>
            </form>

            {selectedWalletId && <TransactionHistory walletId={selectedWalletId} />}
        </div>
    );
}

export default App;