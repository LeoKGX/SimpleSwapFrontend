// SPDX-License-Identifier: MIT
// @title SimpleSwap Frontend Script
// @notice Main script to handle Web3 connection logic, approval and swap between ERC20 tokens
// @dev Compatible with contracts deployed in Sepolia and other EVM chains

var buyOrApprove = 0;
var web3;
var address = "";

const erc20_abi = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"allowance","type":"uint256"},{"internalType":"uint256","name":"needed","type":"uint256"}],"name":"ERC20InsufficientAllowance","type":"error"},{"inputs":[{"internalType":"address","name":"sender","type":"address"},{"internalType":"uint256","name":"balance","type":"uint256"},{"internalType":"uint256","name":"needed","type":"uint256"}],"name":"ERC20InsufficientBalance","type":"error"},{"inputs":[{"internalType":"address","name":"approver","type":"address"}],"name":"ERC20InvalidApprover","type":"error"},{"inputs":[{"internalType":"address","name":"receiver","type":"address"}],"name":"ERC20InvalidReceiver","type":"error"},{"inputs":[{"internalType":"address","name":"sender","type":"address"}],"name":"ERC20InvalidSender","type":"error"},{"inputs":[{"internalType":"address","name":"spender","type":"address"}],"name":"ERC20InvalidSpender","type":"error"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"mint","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"}]
const Pesos_address = "0x4Db2b225a2D49BFd11Ea18AA1eEB3BCcd4b93ad1";
const Usdt_address = "0xEfC64e1E120eCcd0214616D57293aac11222b8af";
const exchange_address = "0xBc45D6EEBd337845A2d5DC030b133632E03c03F8";
const exchange_abi=[{"inputs":[{"internalType":"address","name":"_tokenA","type":"address"},{"internalType":"address","name":"_tokenB","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"allowance","type":"uint256"},{"internalType":"uint256","name":"needed","type":"uint256"}],"name":"ERC20InsufficientAllowance","type":"error"},{"inputs":[{"internalType":"address","name":"sender","type":"address"},{"internalType":"uint256","name":"balance","type":"uint256"},{"internalType":"uint256","name":"needed","type":"uint256"}],"name":"ERC20InsufficientBalance","type":"error"},{"inputs":[{"internalType":"address","name":"approver","type":"address"}],"name":"ERC20InvalidApprover","type":"error"},{"inputs":[{"internalType":"address","name":"receiver","type":"address"}],"name":"ERC20InvalidReceiver","type":"error"},{"inputs":[{"internalType":"address","name":"sender","type":"address"}],"name":"ERC20InvalidSender","type":"error"},{"inputs":[{"internalType":"address","name":"spender","type":"address"}],"name":"ERC20InvalidSpender","type":"error"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"provider","type":"address"},{"indexed":false,"internalType":"uint256","name":"amountA","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amountB","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"liquidity","type":"uint256"}],"name":"LiquidityAdded","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"inputs":[{"internalType":"address","name":"_tokenA","type":"address"},{"internalType":"address","name":"_tokenB","type":"address"},{"internalType":"uint256","name":"amountADesired","type":"uint256"},{"internalType":"uint256","name":"amountBDesired","type":"uint256"},{"internalType":"uint256","name":"amountAMin","type":"uint256"},{"internalType":"uint256","name":"amountBMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"addLiquidity","outputs":[{"internalType":"uint256","name":"amountA","type":"uint256"},{"internalType":"uint256","name":"amountB","type":"uint256"},{"internalType":"uint256","name":"liquidity","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"reserveIn","type":"uint256"},{"internalType":"uint256","name":"reserveOut","type":"uint256"}],"name":"getAmountOut","outputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"address","name":"_tokenA","type":"address"},{"internalType":"address","name":"_tokenB","type":"address"}],"name":"getPrice","outputs":[{"internalType":"uint256","name":"price","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"liquidityBalance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_tokenA","type":"address"},{"internalType":"address","name":"_tokenB","type":"address"},{"internalType":"uint256","name":"liquidity","type":"uint256"},{"internalType":"uint256","name":"amountAMin","type":"uint256"},{"internalType":"uint256","name":"amountBMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"removeLiquidity","outputs":[{"internalType":"uint256","name":"amountA","type":"uint256"},{"internalType":"uint256","name":"amountB","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactTokensForTokens","outputs":[{"internalType":"uint256[2]","name":"amounts","type":"uint256[2]"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalLiquidity","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"}];


var swapInstance;
var isInverted = false;
var P1 = 1;

init();

const isConnected = localStorage.getItem("SwapConnected");
if (isConnected === "true") {
  ethereum.request({ method: 'eth_accounts' }).then(accounts => {
    if (accounts.length > 0) connect();
    else localStorage.setItem("SwapConnected", "false");
  });
}

// Updates the price on init
async function init() {
  web3 = new Web3(window.ethereum);
  swapInstance = new web3.eth.Contract(exchange_abi, exchange_address);
  await updatePrice();
  setInterval(updatePrice, 10000);
  UpdateTextButton();
}

// tries to connect with Metamask
async function connect() {
  try {
    await window.ethereum.request({ method: "eth_requestAccounts" });
    const accounts = await web3.eth.getAccounts();
    address = accounts[0];
    localStorage.setItem("SwapConnected", "true");
    document.getElementById("wallet-button").innerText = address.slice(0, 6) + "..." + address.slice(-4);
    await setBalances();
    await updateNetworkName();
    await allowance();
    UpdateTextButton();
  } catch (err) {
    console.log(err);
    showToast("Connection error", "red");
  }
}

async function handleSubmit() {
  const AmountToBuy = document.querySelector(".IHAVE").value;
  if (!AmountToBuy || isNaN(AmountToBuy) || parseFloat(AmountToBuy) <= 0) {
    return showToast("invalid amount", "red");
  }

  const balance = parseFloat(
    document.getElementById("pesosBalance").innerText || 0
  );
  if (parseFloat(AmountToBuy) > balance && !isInverted) {
    return showToast("Insufficient Balance", "red");
  }

  try {
    if (buyOrApprove != 0) {
      await swapTokens();
    } else {
      const tokenIn = isInverted ? Usdt_address : Pesos_address;
      const tokenInInstance = new web3.eth.Contract(erc20_abi, tokenIn);

      // Aprobar "infinito"
      const MAX_UINT = "115792089237316195423570985008687907853269984665640564039457584007913129639935";

      await tokenInInstance.methods
      .approve(exchange_address, MAX_UINT)
      .send({ from: address });

      showToast("Aprobado correctamente", "green");

      // Verificamos nuevamente el allowance y actualizamos el botón
      await allowance();
      UpdateTextButton();

    }
  } catch (err) {
    showToast("Error: " + err.message, "red");
  }
}

async function swapTokens() {
  const amountIn = document.querySelector(".IHAVE").value;
  const path = isInverted
    ? [Usdt_address, Pesos_address]
    : [Pesos_address, Usdt_address];
  const deadline = Math.floor(Date.now() / 1000) + 300;

  await swapInstance.methods
    .swapExactTokensForTokens(
      web3.utils.toWei(amountIn, "ether"),
      0,
      path,
      address,
      deadline
    )
    .send({ from: address });

  showToast("Swap exitoso", "green");

  await setBalances();
}

async function alterTokensPosition() {
  const iHaveInput = document.querySelector(".IHAVE");
  const iWantInput = document.querySelector(".IWANT");

  // Inverted inputs value
  [iHaveInput.value, iWantInput.value] = [iWantInput.value, iHaveInput.value];

  // Invert the status of the tokens
  isInverted = !isInverted;

  // Updates labels of the page depending if its inverted
  const [labelIHAVE, labelIWANT] = ["labelIHAVE", "labelIWANT"].map(id => document.getElementById(id));
  const [labelIHAVE2, labelIWANT2] = ["labelIHAVE2", "labelIWANT2"].map(id => document.getElementById(id));
  [labelIHAVE.innerText, labelIWANT.innerText] = [labelIWANT.innerText, labelIHAVE.innerText];
  [labelIHAVE2.innerText, labelIWANT2.innerText] = [labelIWANT2.innerText, labelIHAVE2.innerText];

  const iconIHAVE = document.getElementById("iconIHAVE");
  const iconIWANT = document.getElementById("iconIWANT");
  [iconIHAVE.src, iconIWANT.src] = [iconIWANT.src, iconIHAVE.src];

  // Updates price based on the new order
  await updatePrice();

  // Recalculate balances and values to spend
  setValueTokenToSpend();

  await setBalances();

  
  await allowance();

  // Updates button 
  UpdateTextButton();
}

function UpdateTextButton() {
  const boton = document.getElementById("swap-submit");
  boton.innerText = buyOrApprove == 0 ? "Approve" : "Swap";
}

// update Prices checking the inverted position of the tokens
async function updatePrice() {
  try {
    const [tokenIn, tokenOut] = isInverted
      ? [Usdt_address, Pesos_address]
      : [Pesos_address, Usdt_address];

    const priceRaw = await swapInstance.methods.getPrice(tokenIn, tokenOut).call();
    const priceFormatted = (Number(priceRaw) / 1e18).toFixed(6); 
     
    document.querySelector(".price").innerText = priceFormatted;
    P1 = parseFloat(priceFormatted);

    document.getElementById("swap-price").innerHTML =
  `TOKEN PRICE <label class="price">${priceFormatted}</label> ${isInverted ? 'Pesos' : 'USDT'}`;
  } catch (err) {
    console.log(err);
    showToast("Error getting prices", "red");
  }
}

// retrieves value from the front to invert position of the tokens
function setValueTokenToSpend() {
  const amount0 = parseFloat(document.querySelector(".IHAVE").value) || 0;
  let amount1 = 0;
  if (P1 !== 0) {
    amount1 = amount0 * P1 ;
  }

  document.querySelector(".IWANT").value = amount1.toFixed(6);
}

// Recover balances from the connected account
async function setBalances() {
  const usdtInstance = new web3.eth.Contract(erc20_abi, Usdt_address);
  const pesosInstance = new web3.eth.Contract(erc20_abi, Pesos_address);

  const [usdtBalance, pesosBalance] = await Promise.all([
    usdtInstance.methods.balanceOf(address).call(),
    pesosInstance.methods.balanceOf(address).call()
  ]);

  if (isInverted) {
    document.getElementById("pesosBalance").innerText = (Number(usdtBalance) / 1e18).toFixed(6);
    document.getElementById("usdtBalance").innerText = (Number(pesosBalance) / 1e18).toFixed(6);
  } else {
    document.getElementById("pesosBalance").innerText = (Number(pesosBalance) / 1e18).toFixed(6);
    document.getElementById("usdtBalance").innerText = (Number(usdtBalance) / 1e18).toFixed(6);
  }
}


async function allowance() {
  const tokenIn = isInverted ? Usdt_address : Pesos_address;
  const tokenInInstance = new web3.eth.Contract(erc20_abi, tokenIn);

  const amountToSpend = document.querySelector(".IHAVE").value;
  
  if (!amountToSpend || isNaN(amountToSpend) || parseFloat(amountToSpend) <= 0) {
    buyOrApprove = 0;
    return;
  }

  const allowed = await tokenInInstance.methods.allowance(address, exchange_address).call();
  const amountWei = web3.utils.toWei(amountToSpend, "ether");

  buyOrApprove = BigInt(allowed) >= BigInt(amountWei) ? 1 : 0;
}


function showToast(msg, color) {
  const toast = document.getElementById("toast");
  toast.innerHTML = msg;
  toast.style.backgroundColor = color;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3000);
}

function saveLocalStorage(key, valor) {
  localStorage.setItem(key, valor);
}



















// Tab switching
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(tab.dataset.tab).classList.add('active');
  });
});

//@notice Claim tokens from faucet (Minting)
async function claimTokens() {
  if (!address) return showToast("Connect your wallet first", "red");
  try {
    const usdt = new web3.eth.Contract(erc20_abi, Usdt_address);
    const pesos = new web3.eth.Contract(erc20_abi, Pesos_address);
    const amount = web3.utils.toWei("100", "ether");
    await usdt.methods.mint(address, amount).send({ from: address });
    await pesos.methods.mint(address, amount).send({ from: address });
    showToast("Tokens claimed correctly", "green");
    await setBalances();
  } catch (err) {
    console.error(err);
    showToast("Error claiming tokens", "red");
  }
}

// show/hide dropdown
document.getElementById("wallet-button").addEventListener("click", async () => {
  if (!address) {
    await connect(); // not connected yet
  } else {
    // already connected
    const dropdown = document.getElementById("wallet-dropdown");
    dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
  }
});

// Hides the dropdown if click outside itself
document.addEventListener("click", (event) => {
  const button = document.getElementById("wallet-button");
  const dropdown = document.getElementById("wallet-dropdown");
  if (!button.contains(event.target) && !dropdown.contains(event.target)) {
    dropdown.style.display = "none";
  }
});



document.getElementById("disconnect-btn").addEventListener("click", () => {
  address = "";
  buyOrApprove = 0;
  saveLocalStorage("SwapConnected", "false");
  document.getElementById("wallet-button").innerText = "Conectar";
  document.getElementById("wallet-dropdown").style.display = "none";
  document.getElementById("usdtBalance").innerText = 0;
  document.getElementById("pesosBalance").innerText = 0;
  document.getElementsByClassName("IHAVE").item(0).value = 0
  document.getElementsByClassName("IWANT").item(0).value = 0
  showToast("Wallet desconectada", "green");


});


// Shows the connected network name
async function updateNetworkName() {
  const chainId = await web3.eth.getChainId();
  const map = {
    1n: "Ethereum Mainnet",
    534351n: "Scroll Sepolia",
    11155111n: "Sepolia",
    5n: "Goerli"
  };
  document.getElementById("network-name").innerText = "Network: " + (map[chainId] || "Unknown");
}