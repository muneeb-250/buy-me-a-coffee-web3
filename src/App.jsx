import abi from '../artifacts/contracts/BuyMeACoffee.sol/BuyMeACoffee.json'
import { useState, useEffect } from 'react'
import coffeeImg from './assets/coffee.png'
import * as ethers from "ethers"
import './App.css'
import { parseEther } from 'ethers/lib/utils'
function App() {
  const contractAddress = '0x05d064b13F85513FAe574891f066de0fb7Db88B6';
  const contractABI = abi.abi;

  const [CurrentAccount, setCurrentAccount] = useState();
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [memos, setMemos] = useState([]);
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
    const provider = new ethers.providers.Web3Provider(ethereum, "any");
    const signer = provider.getSigner();
    const buyMeACoffee = new ethers.Contract(
      contractAddress,
      contractABI,
      signer
    );
    const coffeeTxn = await buyMeACoffee.buyCoffee(
      name ? name : "anon",
      message ? message : "Enjoy your coffee!",
      { value: parseEther('0.001') }
    );

    await coffeeTxn.wait();
    console.log("mined ", coffeeTxn.hash);
    console.log("coffee purchased!");
  }
  const buyLargeCoffee = async () => {
    const provider = new ethers.providers.Web3Provider(ethereum, "any");
    const signer = provider.getSigner();
    const buyMeACoffee = new ethers.Contract(
      contractAddress,
      contractABI,
      signer
    );
    const coffeeTxn = await buyMeACoffee.buyLargeCoffee(
      { value: parseEther('0.003') }
    );

    await coffeeTxn.wait();
    console.log("mined ", coffeeTxn.hash);
    console.log("coffee purchased!");
  }

  const getMemos = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const buyMeACoffee = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
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
      console.log(owner);
    }
  }

  useEffect(() => {
    isWalletConnected();
    getMemos();

  }, [])
  return (
    <>    {
      CurrentAccount ? (
        <div className="App">
          <h1>Buy <span style={{ fontFamily: "Berkshire swash" }}>Muneeb</span> a Coffee</h1>
          <img src={coffeeImg} alt='coffee' />
          <h3>Welcome {`${CurrentAccount.slice(0, 5)}...${CurrentAccount.slice(-4)}`} 👋</h3>
          <form onSubmit={e => { e.preventDefault() }}>
            <label htmlFor="name">Name</label>
            <input
              id="name"
              type="text"
              placeholder="Your name.."
              onChange={e => setName(e.target.value)}
            />
            <label htmlFor="name">Send Muneeb a message</label>
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
          <div key={idx} style={{ border: "2px solid goldenrod", borderRadius: "5px", padding: "5px", margin: "5px", backgroundColor: 'white' }}>
            <p style={{ "fontWeight": "bold" }}>"{memo.message}"</p>
            <p>From: {memo.name} at {memo.timestamp.toString()}</p>
          </div>
        )
      }))}

    </>
  )
}
export default App;