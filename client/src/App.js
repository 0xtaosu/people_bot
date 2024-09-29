import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import logo from './logo.png'; // 请确保你有一个 logo 图片文件

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
    const [apiKeySet, setApiKeySet] = useState(false);

    const [isRegistering, setIsRegistering] = useState(false);

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
            if (response.data.apiKeySet) {
                fetchWallets();
            } else {
                alert('Please set your DBOTX API key before fetching wallets.');
            }
            setApiKeySet(response.data.apiKeySet);
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
            setApiKeySet(true);
            fetchWallets(); // 现在可以安全地获取钱包信息
        } catch (error) {
            alert('Failed to set DBOTX API key: ' + (error.response?.data?.error || error.message));
        }
    };

    return (
        <div>
            <nav className="navbar navbar-expand-lg navbar-light bg-light mb-4">
                <div className="container">
                    <a className="navbar-brand d-flex align-items-center" href="#">
                        <img src={logo} alt="People Bot Logo" width="40" height="40" className="d-inline-block align-top me-2" />
                        <span className="fs-4">People Bot</span>
                    </a>
                    {user && (
                        <div className="navbar-nav ms-auto">
                            <span className="nav-item nav-link">Welcome, {user}</span>
                            <button onClick={logout} className="btn btn-outline-danger">Logout</button>
                        </div>
                    )}
                </div>
            </nav>

            <div className="container mt-3">
                {!user ? (
                    <div className="row justify-content-center">
                        <div className="col-md-6">
                            <h2 className="mb-4">{isRegistering ? 'Register' : 'Login'}</h2>
                            <form onSubmit={isRegistering ? register : login}>
                                <div className="mb-3">
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                    />
                                </div>
                                <div className="mb-3">
                                    <input
                                        type="password"
                                        className="form-control"
                                        placeholder="Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                                <button type="submit" className="btn btn-primary">
                                    {isRegistering ? 'Register' : 'Login'}
                                </button>
                            </form>
                            <p className="mt-3">
                                {isRegistering ? 'Already have an account?' : "Don't have an account?"}{' '}
                                <button
                                    className="btn btn-link p-0"
                                    onClick={() => setIsRegistering(!isRegistering)}
                                >
                                    {isRegistering ? 'Login' : 'Register'}
                                </button>
                            </p>
                        </div>
                    </div>
                ) : (
                    <div>
                        <div className="row mb-4">
                            <div className="col-md-6">
                                <h2>Set DBOTX API Key</h2>
                                <form onSubmit={setDbotxApiKeyHandler} className="mb-3">
                                    <div className="input-group">
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="DBOTX API Key"
                                            value={dbotxApiKey}
                                            onChange={(e) => setDbotxApiKey(e.target.value)}
                                        />
                                        <button type="submit" className="btn btn-primary">Set API Key</button>
                                    </div>
                                </form>
                            </div>
                            <div className="col-md-6">
                                <h2>Set Telegram Bot Token</h2>
                                <form onSubmit={setTelegramToken} className="mb-3">
                                    <div className="input-group">
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Telegram Bot Token"
                                            value={telegramBotToken}
                                            onChange={(e) => setTelegramBotToken(e.target.value)}
                                        />
                                        <button type="submit" className="btn btn-primary">Set Bot Token</button>
                                    </div>
                                </form>
                            </div>
                        </div>

                        {apiKeySet ? (
                            <div>
                                <h2 className="mb-3">Your Wallets</h2>
                                <ul className="list-group mb-4">
                                    {wallets.map(wallet => (
                                        <li key={wallet.id} className="list-group-item d-flex justify-content-between align-items-center">
                                            {wallet.name} ({wallet.address}) - Type: {wallet.type}
                                            <button onClick={() => deleteWallet(wallet.id)} className="btn btn-sm btn-danger">Delete</button>
                                        </li>
                                    ))}
                                </ul>

                                <h2 className="mb-3">Import Wallet</h2>
                                <form onSubmit={importWallet} className="mb-4">
                                    <div className="mb-3">
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Private Key"
                                            value={privateKey}
                                            onChange={(e) => setPrivateKey(e.target.value)}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Wallet Name"
                                            value={walletName}
                                            onChange={(e) => setWalletName(e.target.value)}
                                        />
                                    </div>
                                    <button type="submit" className="btn btn-success">Import Wallet</button>
                                </form>

                                <h2 className="mb-3">Execute Trade</h2>
                                <form onSubmit={executeTrade} className="mb-4">
                                    <div className="mb-3">
                                        <select
                                            className="form-select"
                                            value={selectedWalletId}
                                            onChange={(e) => setSelectedWalletId(e.target.value)}
                                        >
                                            <option value="">Select Wallet</option>
                                            {wallets.map(wallet => (
                                                <option key={wallet.id} value={wallet.id}>{wallet.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Token Address"
                                            value={tradePair}
                                            onChange={(e) => setTradePair(e.target.value)}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <input
                                            type="number"
                                            className="form-control"
                                            placeholder="Amount"
                                            value={tradeAmount}
                                            onChange={(e) => setTradeAmount(e.target.value)}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <select
                                            className="form-select"
                                            value={tradeType}
                                            onChange={(e) => setTradeType(e.target.value)}
                                        >
                                            <option value="buy">Buy</option>
                                            <option value="sell">Sell</option>
                                        </select>
                                    </div>
                                    <button type="submit" className="btn btn-primary">Execute Trade</button>
                                </form>

                                {selectedWalletId && <TransactionHistory walletId={selectedWalletId} />}
                            </div>
                        ) : (
                            <p className="alert alert-warning">Please set your DBOTX API key to view and manage your wallets.</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default App;