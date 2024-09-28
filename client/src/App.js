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