// SPDX-License-Identifier: MIT
pragma solidity >0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title SimpleSwapGPT
 * @dev A simple AMM smart contract for swapping ERC20 tokens and providing liquidity to a pool.
 * Mints ERC20 liquidity tokens to liquidity providers.
 */
contract SimpleSwap is ERC20{

    /// @notice Internal reserves for token A
    uint256 private reserveA;

    /// @notice Internal reserves for token B
    uint256 private reserveB;
    
    /// @notice Total supply of liquidity tokens minted
    uint256 public totalLiquidity;

    /// @notice Address of token A
    address private tokenA;

    /// @notice Address of token B
    address private tokenB;
    
    /// @notice Mapping of user address to liquidity balance
    mapping(address => uint256) public liquidityBalance;

    /// @notice Emitted when liquidity is added
    event LiquidityAdded(address indexed provider, uint amountA, uint amountB, uint liquidity);

    /**
     * @notice Constructor to initialize token pair and liquidity token metadata.
     * @param _tokenA Address of token A
     * @param _tokenB Address of token B
     */
    constructor(address _tokenA, address _tokenB) ERC20("Liquidity Token","LTP"){
        tokenA = _tokenA;
        tokenB = _tokenB;
    }
    
    /// @dev Modifier to check if deadline has not expired
    modifier isExpired(uint deadline){
        require(block.timestamp <= deadline, "Expired");
        _;
    }

    /// @dev Modifier to validate that provided tokens match the pair
    modifier areValidTokens(address _tokenA, address _tokenB){
        require((_tokenA == tokenA && _tokenB == tokenB) || (_tokenA == tokenB && _tokenB == tokenA) 
        , "Invalid Tokens");
        _;
    }


    /**
     * @notice Add liquidity to the pool.
     * @param _tokenA Address of token A
     * @param _tokenB Address of token B
     * @param amountADesired Desired amount of token A to deposit
     * @param amountBDesired Desired amount of token B to deposit
     * @param amountAMin Minimum amount of token A to accept
     * @param amountBMin Minimum amount of token B to accept
     * @param to Address to receive liquidity tokens
     * @param deadline Unix timestamp after which the transaction will revert
     * @return amountA Final amount of token A added
     * @return amountB Final amount of token B added
     * @return liquidity Amount of liquidity tokens minted
     */
    function addLiquidity(
        address _tokenA,
        address _tokenB,
        uint amountADesired,
        uint amountBDesired,
        uint amountAMin,
        uint amountBMin,
        address to,
        uint deadline
    ) external isExpired(deadline) areValidTokens(_tokenA, _tokenB)
      returns (uint amountA, uint amountB, uint liquidity)  {

        // If pool is empty, accept desired amounts
        if (reserveA == 0 && reserveB == 0) {
            amountA = amountADesired;
            amountB = amountBDesired;
        } else {
            // Calculate optimal amounts to maintain ratio
            uint amountBOptimal = (amountADesired * reserveB) / reserveA;
            if (amountBOptimal <= amountBDesired) {
                require(amountBOptimal >= amountBMin, "Insufficient B amount");
                amountA = amountADesired;
                amountB = amountBOptimal;
            } else {
                uint amountAOptimal = (amountBDesired * reserveA) / reserveB;
                require(amountAOptimal <= amountADesired, "Insufficient A amount");
                require(amountAOptimal >= amountAMin, "Insufficient A amount");
                amountA = amountAOptimal;
                amountB = amountBDesired;
            }
        }

        // Transfer tokens from sender to this contract
        IERC20(_tokenA).transferFrom(to, address(this), amountA);
        IERC20(_tokenB).transferFrom(to, address(this), amountB);

        // Mint liquidity tokens proportional to the amounts added
        if (totalLiquidity == 0) {
            liquidity = sqrt(amountA * amountB);
        } else {
            liquidity = min(
                (amountA * totalLiquidity) / reserveA,
                (amountB * totalLiquidity) / reserveB
            );
        }
        require(liquidity > 0, "INSUFFICIENT_LIQUIDITY_CALC");

        // Update reserves
        reserveA += amountA;
        reserveB += amountB;
        totalLiquidity += liquidity;

        // Update user liquidity balance
        liquidityBalance[to] += liquidity;
        _mint(to, liquidity);
        emit LiquidityAdded(to, amountA, amountB, liquidity);
        return (amountA, amountB, liquidity);

    }

    /**
     * @notice Remove liquidity from the pool.
     * @param _tokenA Address of token A
     * @param _tokenB Address of token B
     * @param liquidity Amount of liquidity tokens to burn
     * @param amountAMin Minimum amount of token A to withdraw
     * @param amountBMin Minimum amount of token B to withdraw
     * @param to Address to receive withdrawn tokens
     * @param deadline Unix timestamp after which the transaction will revert
     * @return amountA Amount of token A withdrawn
     * @return amountB Amount of token B withdrawn
     */
    function removeLiquidity(
        address _tokenA,
        address _tokenB,
        uint liquidity,
        uint amountAMin,
        uint amountBMin,
        address to,
        uint deadline
    ) external isExpired(deadline) areValidTokens(_tokenA, _tokenB) returns (uint amountA, uint amountB) {
        require(liquidity > 0, "INSUFFICIENT_LIQUIDITY");
        // Burn Liquidity tokens from sender
        require(liquidityBalance[to] >= liquidity, "INSUFFICIENT_BALANCE");

        // Save total supply BEFORE update
        uint totalSupply = totalLiquidity;

        // Get reserves
        uint _reserveA = IERC20(_tokenA).balanceOf(address(this));
        uint _reserveB = IERC20(_tokenB).balanceOf(address(this));

        // Calculate amounts based on share
        amountA = (liquidity * _reserveA) / totalSupply;
        amountB = (liquidity * _reserveB) / totalSupply;

        require(amountA >= amountAMin, "INSUFFICIENT_A_AMOUNT");
        require(amountB >= amountBMin, "INSUFFICIENT_B_AMOUNT");

        // Update liquidity balances after calculation
        liquidityBalance[to] -= liquidity;
        totalLiquidity -= liquidity;
        _burn(to, liquidity);
    
        // Update reserves
        reserveA -= uint256(amountA);
        reserveB -= uint256(amountB);

        // Transfer tokens to user
        IERC20(tokenA).transfer(to, amountA);
        IERC20(tokenB).transfer(to, amountB);
    }
    

    /**
     * @notice Swap an exact amount of input tokens for output tokens.
     * @param amountIn Exact amount of input tokens to swap
     * @param amountOutMin Minimum acceptable amount of output tokens to receive
     * @param path Array with exactly two addresses: [tokenIn, tokenOut]
     * @param to Address to receive output tokens
     * @param deadline Unix timestamp after which the transaction will revert
     * @return amounts Array with [amountIn, amountOut] for confirmation
     */
    function swapExactTokensForTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path, // [tokenIn, tokenOut]
        address to,
        uint deadline
    ) external isExpired(deadline) returns (uint256[2] memory amounts) {
        require(path.length == 2, "ONLY_PAIRS_SUPPORTED");

        require(
            (path[0] == tokenA && path[1] == tokenB) ||
            (path[0] == tokenB && path[1] == tokenA),
            "INVALID_PATH"
        );

        uint reserveIn;
        uint reserveOut;
        if (path[0] == tokenA) {
            reserveIn = reserveA;
            reserveOut = reserveB;
        } else {
            reserveIn = reserveB;
            reserveOut = reserveA;
        }

        uint amountOut = getAmountOut(amountIn,  reserveIn,  reserveOut);

        require(amountOut >= amountOutMin, "INSUFFICIENT_OUTPUT_AMOUNT");

        // Transfer input & output
        IERC20(path[0]).transferFrom(msg.sender, address(this), amountIn);
        IERC20(path[1]).transfer(to, amountOut);

        // Actualiza reservas internas (opcional si las usas)
        if (path[0] == tokenA) {
            reserveA += uint128(amountIn);
            reserveB -= uint128(amountOut);
        } else {
            reserveB += uint128(amountIn);
            reserveA -= uint128(amountOut);
        }

        amounts[0] = amountIn;
        amounts[1] = amountOut;
        return amounts;
    }


    /**
     * @notice Get the price of one token in terms of the other.
     * @param _tokenA Base token address
     * @param _tokenB Quote token address
     * @return price Price of _tokenA in units of _tokenB, scaled by 1e18
     */
    function getPrice(address _tokenA, address _tokenB) external view areValidTokens(_tokenA, _tokenB) returns (uint256 price) {

        if (_tokenA == tokenA && _tokenB == tokenB) {
            // price of 1 tokenA in terms of tokenB
            require(reserveA > 0, "NO_LIQUIDITY");
            price = (reserveB * 1e18) / reserveA;
        } else {
            // price of 1 tokenB in terms of tokenA
            require(reserveB > 0, "NO_LIQUIDITY");
            price = (reserveA * 1e18) / reserveB;
        }
    }

    /**
     * @notice Calculate the output amount for a given input amount and reserves.
     * @param amountIn Amount of input token
     * @param reserveIn Reserve of input token
     * @param reserveOut Reserve of output token
     * @return amountOut Calculated amount of output token
     */
    function getAmountOut(uint256 amountIn, uint256 reserveIn, uint256 reserveOut) public pure returns (uint256 amountOut){
 
        require(amountIn > 0, "Insufficient input amount");
        require(reserveIn > 0 && reserveOut > 0, "Insufficient Liquidity");
        uint numerator = amountIn * reserveOut;
        uint denominator = reserveIn + amountIn;
        amountOut = numerator / denominator;
        return amountOut;
    }

    /// @notice Utility function: Minimum of two uint values
    function min(uint x, uint y) private pure returns (uint) {
        return x < y ? x : y;
    }

    /// @notice Utility function: Square root
    function sqrt(uint y) private pure returns (uint z) {
        if (y > 3) {
            z = y;
            uint x = y / 2 + 1;
            while (x < z) {
                z = x;
                x = (y / x + x) / 2;
            }
        } else if (y != 0) {
            z = 1;
        }
    }
}