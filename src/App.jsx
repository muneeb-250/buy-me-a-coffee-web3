import { useState, useEffect, useContext } from 'react'
import { CoffeeContext } from './context/CoffeeContext'
import { contractABI, contractAddress } from './utils/constants'
import * as ethers from "ethers"
import { parseEther } from 'ethers/lib/utils'
import coffeeImg from './assets/coffee.png'

function App() {
  const contract = useContext(CoffeeContext)
  const [CurrentAccount, setCurrentAccount] = useState();
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [memos, setMemos] = useState([]);
  const [newAddress, setNewAddress] = useState('');
  const [owner, setOwner] = useState();

  const formatAddress = addr => `${addr.slice(0, 5)}...${addr.slice(-4)}`

  const isWalletConnected = async () => {
    try {
      const { ethereum } = window;
      const accounts = await ethereum.request({ method: 'eth_accounts' })
      console.log("accounts: ", accounts);

      if (accounts.length > 0) {
        const account = accounts[0];
        console.log("wallet is connected! " + account);
        setCurrentAccount(accounts[0]);
      } else {
        console.log("make sure MetaMask is connected");
      }
    } catch (error) {
      console.log("error: ", error);
    }
  }

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("please install MetaMask");
      }

      const accounts = await ethereum.request({
        method: 'eth_requestAccounts'
      });

      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  }

  // smart contract functions 
  const buyCoffee = async () => {
    if (contract) {
      try {
        const coffeeTxn = await contract.buyCoffee(
          name ? name : "anon",
          message ? message : "Enjoy your coffee!",
          "Medium",
          { value: parseEther('0.001') }
        );
        await coffeeTxn.wait();
        console.log("mined ", coffeeTxn.hash);
        console.log("coffee purchased!");
      } catch (error) {
        console.error(error);
      }
    }


  }
  const buyLargeCoffee = async () => {
    if (contract) {
      try {
        const coffeeTxn = await contract.buyLargeCoffee(
          name ? name : "anon",
          message ? message : "Enjoy your coffee!",
          "Large",
          { value: parseEther('0.003') }

        );
        await coffeeTxn.wait();
        console.log("mined ", coffeeTxn.hash);
        console.log("coffee purchased!");

      } catch (error) {
        console.error(error);
      }
    }
  };

  const getMemos = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const buyMeACoffee = new ethers.Contract(
          contractAddress,
          contractABI,
          provider
        );

        console.log("fetching memos from the blockchain..");
        const memos = await buyMeACoffee.getMemos();
        console.log("fetched!");
        setMemos(memos);
      } else {
        console.log("Metamask is not connected");
      }

    } catch (error) {
      console.log(error);
    }
  };

  const getOwner = async () => {
    const { ethereum } = window;
    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const buyMeACoffee = new ethers.Contract(
        contractAddress,
        contractABI,
        provider
      );
      const owner = await buyMeACoffee.owner();
      setOwner(owner);
    }
  }
  const updateAddress = async () => {
    if (contract) {
      try {
        const normalizedAddress = ethers.utils.getAddress(newAddress);
        await contract.updateWithdraw(normalizedAddress);
        console.log('Withdraw address updated successfully!');
      } catch (error) {
        console.error(error);
      }
    }
  };
  const withdrawTips = async () => {
    if (contract) {
      try {
        await contract.withdrawTips();
        console.log('Tips withdrew successfully!');
      } catch (error) {
        console.error(error);
      }
    }
  };
  useEffect(() => {
    isWalletConnected();
    getMemos();

    // Create an event handler function for when someone sends
    // us a new memo.
    const onNewMemo = (from, timestamp, name, coffeeType, message) => {
      console.log("Memo received: ", from, timestamp, name, coffeeType, message);
      setMemos((prevState) => [
        ...prevState,
        {
          address: from,
          timestamp: new Date(timestamp * 1000),
          message,
          name
        }
      ]);
    };

    // Listen for new memo events.
    if (contract) {

      contract.on("NewMemo", onNewMemo);
    }
    return () => {
      if (contract) {
        contract.off("NewMemo", onNewMemo);
      }
    }

  }, [])
  return (
    <>    {
      CurrentAccount ? (
        <div className="App">
          <h1>Buy <span style={{ fontFamily: "Berkshire swash" }}>Muneeb</span> a Coffee</h1>
          <img src={coffeeImg} alt='coffee' />
          <h3>Welcome {formatAddress(CurrentAccount)} 👋</h3>
          <form onSubmit={e => { e.preventDefault() }}>
            <label htmlFor="name">Name</label>
            <input
              id="name"
              type="text"
              placeholder="Your name.."
              onChange={e => setName(e.target.value)}
            />
            <label htmlFor="message">Send Muneeb a message</label>
            <input
              id="message"
              type="text"
              placeholder="message.."
              onChange={e => setMessage(e.target.value)}
            />
            <button
              type="button"
              onClick={buyCoffee}
            >
              1 Coffee for 0.001ETH
            </button>
            <button
              type="button"
              onClick={buyLargeCoffee}
            >
              1 Large Coffee for 0.003ETH
            </button>
            <button
              type="button"
              onClick={getOwner}
            >
              Get Owner Address
            </button>
            {
              owner ? formatAddress(owner) : ""
            }
            <label htmlFor="withdraw">Change withdrawal address</label>
            <input
              id="withdraw"
              type="text"
              placeholder="address.."
              value={newAddress}
              onChange={e => setNewAddress(e.target.value)}
            />
            <button
              type="button"
              onClick={updateAddress}
            >
              Change Withdraw Address
            </button>
            <button
              type="button"
              onClick={withdrawTips}
            >
              Withdraw Tips
            </button>
          </form>
        </div>
      ) : (
        <div className="App">
          <h1>Buy <span style={{ fontFamily: "Berkshire swash" }}>Muneeb</span> a Coffee</h1>
          <img src={coffeeImg} alt='coffee' />
          <button style={{ margin: "2rem" }} onClick={() => connectWallet()}>Connect Wallet</button>
        </div>
      )
    }
      {CurrentAccount && (<h1>Memos received</h1>)}

      {CurrentAccount && (memos.map((memo, idx) => {
        return (
          <div key={idx} style={{ border: "3px solid goldenrod", borderRadius: "5px", padding: "5px", margin: "5px", backgroundColor: 'white' }}>
            <p style={{ color: 'goldenrod', fontFamily: 'Berkshire swash', fontSize: '25px' }}>{memo.coffeeType} Coffee</p>
            <p style={{ "fontWeight": "bold" }}>"{memo.message}"</p>
            <p>From: {memo.name} at {memo.timestamp.toString()}</p>
          </div>
        )
      }))}
      <br />
      <a href="https://github.com/muneeb-250" target={'_blank'}>
        <i className="fa-brands fa-github"></i>
      </a>
      <a href="https://twitter.com/0xmuneeb" target={'_blank'}>
        <i className="fa-brands fa-twitter"></i>
      </a>
      <a href="https://linkedin.com/in/muneeburrehman250" target={'_blank'}>
        <i className="fa-brands fa-linkedin"></i>
      </a>

    </>
  )
}
export default App;