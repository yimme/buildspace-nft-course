import "./styles/App.css";
import twitterLogo from "./assets/twitter-logo.svg";
import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import myEpicNft from "./utils/MyEpicNFT.json";

// Constants
const TWITTER_HANDLE = "itsCowSaysWoof";
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const OPENSEA_LINK =
  "https://testnets.opensea.io/collection/uniqornnft-e8kucooqvc";
const CONTRACT_ADDRESS = "0x1Ad3b277F62146f3481CAAC6E8689E7Bf6E395e2";

const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentMints, setCurrentMints] = useState(0);
  const [mintLimit, setMintLimit] = useState(0);
  const [success, setSuccess] = useState(false);
  const [userTokenId, setUserTokenId] = useState("");
  const [transaction, setTransaction] = useState("");
  const [missingMetamask, setMissingMetamask] = useState(true);

  const getMintingStatus = async () => {
    const { ethereum } = window;
    if (!ethereum) {
      console.log("Missing metamask");
    } else {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const connectedContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        myEpicNft.abi,
        signer
      );

      const mintedSoFar = await connectedContract.getTotalNFTsMintedSoFar();
      const mintLimit = await connectedContract.mintLimit();

      setCurrentMints(mintedSoFar.toNumber());
      setMintLimit(mintLimit.toNumber());
    }
  };

  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      console.log("Make sure you have metamask!");
      setMissingMetamask(true);
      return;
    } else {
      ethereum.enable();
      console.log("we have the ethereum object", ethereum);
      setMissingMetamask(false);
    }

    const accounts = await ethereum.request({ method: "eth_accounts" });

    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account", account);
      setCurrentAccount(account);

      setupEventListener();
    } else {
      console.log("No authorized account found.");
    }
  };

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        return;
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
      getMintingStatus();
    } catch (err) {
      console.log(err);
    }
  };

  const setupEventListener = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          myEpicNft.abi,
          signer
        );

        connectedContract.on("NewEpicNFTMinted", (from, tokenId) => {
          setLoading(false);
          console.log(from, tokenId.toNumber());
          getMintingStatus();
          setSuccess(true);
          setUserTokenId(tokenId.toNumber());
          // alert(
          //   `Hey, we've minted your NFT and sent it to your wallet. it maybe blank right now. It can take a max of 10 minutes to show up. Here's the link: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`
          // );
        });
      } else {
        console.log("Missing ethereum object");
      }
    } catch (err) {
      console.log(err);
    }
  };

  const askContractToMintNft = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          myEpicNft.abi,
          signer
        );
        console.log("💰 Going to pop wallet now to pay gas...");
        let nftTxn = await connectedContract.makeAnEpicNFT();
        setLoading(true);
        console.log("⛏ mining... please wait.");
        await nftTxn.wait();
        setTransaction("https://rinkeby.etherscan.io/tx/" + nftTxn.hash);
        console.log(
          `👷🏽‍♂️ Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`
        );
      } else {
        console.log("Ethereum object doesn't exist");
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  // Render Methods
  const renderNotConnectedContainer = () => (
    <button
      onClick={connectWallet}
      className="cta-button connect-wallet-button"
      disabled={missingMetamask}
    >
      Connect to Wallet
    </button>
  );

  // render Minted URL
  // const renderLinkToOpenSea = () => {
  //   <a
  //     href={`https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${userTokenId}`}
  //   >
  //     View your NFT
  //   </a>;
  // };

  useEffect(() => {
    checkIfWalletIsConnected();
    getMintingStatus();
  }, []);

  return (
    <div className="App">
      <div className="container">
        <div className="wallet-header">
          {currentAccount !== "" ? (
            <span>Connected with {currentAccount}</span>
          ) : (
            <span>No connected wallet</span>
          )}

          <div className="opensea-container">
            <a
              target="_blank"
              rel="noreferrer"
              href={OPENSEA_LINK}
              className="secondary-button"
            >
              View collection on OpenSea
            </a>
          </div>
        </div>
        <div className="header-container">
          <p className="header gradient-text">My NFT Collection</p>
          <p className="sub-text">
            Each unique. Each beautiful. Discover your NFT today.
          </p>
          {currentAccount === "" ? (
            renderNotConnectedContainer()
          ) : (
            <button
              onClick={askContractToMintNft}
              className="cta-button connect-wallet-button"
              disabled={loading}
            >
              {loading === true ? (
                <svg
                  aria-hidden="true"
                  focusable="false"
                  data-prefix="fas"
                  data-icon="spinner"
                  className="fa-spinner"
                  role="img"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 512 512"
                >
                  <path
                    fill="currentColor"
                    d="M304 48c0 26.51-21.49 48-48 48s-48-21.49-48-48 21.49-48 48-48 48 21.49 48 48zm-48 368c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48-21.49-48-48-48zm208-208c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48-21.49-48-48-48zM96 256c0-26.51-21.49-48-48-48S0 229.49 0 256s21.49 48 48 48 48-21.49 48-48zm12.922 99.078c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48c0-26.509-21.491-48-48-48zm294.156 0c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48c0-26.509-21.49-48-48-48zM108.922 60.922c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48-21.491-48-48-48z"
                  ></path>
                </svg>
              ) : null}
              {loading ? "Minting in progress..." : "Mint"}
            </button>
          )}

          {missingMetamask ? (
            <p className="small-text">
              Please make sure you have metamask installed
            </p>
          ) : null}

          {currentAccount !== "" ? (
            <p className="small-text">
              {currentMints} / {mintLimit} minted so far.
            </p>
          ) : null}

          {/* {renderLinkToOpenSea()} */}
          {success ? (
            <div className="success-message">
              <h2>🥳 Your NFT is minted!</h2>

              <a
                className="opensea-link"
                target="_blank"
                rel="noreferrer"
                href={`https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${userTokenId}`}
              >
                View your NFT on Open Sea
              </a>

              <span className="mini-text">
                * It can take up to 10 minutes for your NFT to show up on Open
                Sea, meanwhile you can view your transaction on&nbsp;
                <a target="_blank" rel="noreferrer" href={transaction}>
                  Etherscan
                </a>
              </span>
            </div>
          ) : null}
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`copy/pasted by @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
