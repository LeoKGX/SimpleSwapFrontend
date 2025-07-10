# SimpleSwapFrontend
 
# Minimalistic decentralized web application (dApp) to perform swaps between ERC20 tokens in the Scroll Sepolia network, with functionalities for approvals management, token claim from faucet, balance visualization and unit testing with Hardhat.



---



## Description



SimpleSwapFrontend is a dApp that allows users to exchange ERC20 tokens (Pesos and USDT) on the Scroll Sepolia network through a smart contract exchange. The interface is simple and functional, allowing:



\- Connect the wallet (MetaMask or other compatible wallet).

\- Consult updated balances

\- Approve tokens for exchange

\- Perform swaps between tokens

\- Claim test tokens from an integrated faucet

\- View dynamic prices and balances

\- Change swap direction (reverse "I have" and "I want" tokens)



In addition, it has a suite of automated tests developed in Hardhat that cover key smart contract functionalities.



---

## Features



\- Integration with Web3.js for interaction with contracts and wallet

\- Dynamic update of price and balances

\- Automatic token approval management (approve)

\- Swap tokens using `swapExactTokensForTokens` function

\- Faucet for claiming trial ERC20 tokens

\- Responsive and minimalistic design with Bootstrap Icons

\- Unit and integration testing with Hardhat

\- Simple wallet connection and disconnection status management

\- Local storage of connection status for persistence



---



## Technologies



\- JavaScript (ES6+)

\- Web3.js

\- HTML5 / CSS3

\- Bootstrap Icons

\- Hardhat (Testing and development Solidity)

\- Solidity (smart contract, not included in this repo)



---

## Installation



1\. Clone the repository:



````bash

git clone https://github.com/LeoKGX/SimpleSwapFrontend.git

cd SimpleSwapFrontend

````



Open the index.html file with a server and then in a browser with MetaMask or compatible extension installed.



To run tests (requires Node.js and Hardhat installed):



````bash

npm install

npx hardhat test

````



# Use

* Open the dApp in the browser.
* Connect the wallet with the "Connect" button.
* Select the Swap or Faucet tab.
* In Swap, enter amount to swap, approve if necessary, and perform the swap.
* In Faucet, claim test tokens.
* View balances and prices in real time.
* Change swap direction with the invert button.





# Testing

The project has unit tests in Hardhat that cover:



⦁ Approve tokens (approve)

⦁ Add liquidity

⦁ Remove liquidity

⦁ Perform swaps

⦁ Verify balances and events.







